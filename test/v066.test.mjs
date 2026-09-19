// v0.6.6 回归：反思提醒的判定依据从「存量阈值」改为「内容版本 + 维护终态」。
//
// 对应 2026-09-19 专项审查（基线 3729dfe）的 R1/R3/R4/R6/R7/R8/R9/R10/R12：
// 健康存量经一次 no_action 维护后不得再被反复催；新会话、并行会话、重载都不重启喊话；
// 插件清理后排队中的提醒与维护必须取消；投递前要复核版本是否已被维护解决。
// 同时覆盖新增件：reflectionEnabled 总开关、阈值 0 = 关闭该判据、readMeta 缓存。
import { test, expect } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { apply } from "../lib/index.js";
import { runMaintain } from "../src/maintain.js";
import {
	computeContentRevision,
	readReflectionState,
	decideReflection,
	isSettledRevision,
	recordMaintainOutcome,
} from "../src/reflection.js";
import { ensureNamespaceLayout, getEntryMeta, setEntryMeta, bumpTurnCounter, bumpAccess } from "../src/store.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function makeCtx(agents) {
	const eventHandlers = {};
	const effects = [];
	const ctx = {
		get(service) {
			if (service === "systemPrompt") return { context: () => () => {} };
			if (service === "agents") return { get: (id) => agents.get(id) ?? null };
			return undefined;
		},
		on(event, handler) { eventHandlers[event] = handler; return () => {}; },
		skills: { register: () => () => {} },
		tools: { register: () => () => {}, restrict: () => () => {} },
		logger: { info() {}, warn() {} },
		effect(factory) { const d = factory(); if (typeof d === "function") effects.push(d); },
	};
	return { ctx, eventHandlers, effects };
}

// 46 条「彼此独立、内容互不重复」的健康存量：每条用不同的 base36 词元，
// 既不触发精确去重，也不产生合并候选（真实记忆库的形状，而不是复制粘贴的近似文本）。
function seedSops(root, count) {
	mkdirSync(join(root, "sops"), { recursive: true });
	for (let i = 0; i < count; i++) {
		const parts = [];
		for (let k = 0; k < 10; k++) parts.push(((i * 1543 + k * 331 + 17) % 46656).toString(36));
		writeFileSync(join(root, "sops", "sop-" + String(i).padStart(2, "0") + ".md"), "# SOP " + i + " " + parts.join(" "));
	}
}

function makeAgents(ids, delivered) {
	const agents = new Map();
	for (const id of ids) agents.set(id, { id, inject(p) { delivered.push({ id, p }); } });
	return agents;
}

function boot(memDir, agents, extra) {
	const { ctx, eventHandlers, effects } = makeCtx(agents);
	apply(ctx, { memoryDir: memDir, progressive: false, autoNamespace: false, defaultNamespace: "test", maintainEveryTurns: 0, reflectCooldownTurns: 1, ...(extra || {}) });
	return { eventHandlers, teardown: () => { for (const f of effects) f(); } };
}

const turnEnd = (eventHandlers, sessionId, seq) =>
	eventHandlers["session/event"]({ id: sessionId, header: {} }, { type: "turn/end", seq });

test("健康存量：一次 no_action 维护之后，同会话/新会话/并行会话都不再被催", async () => {
	const memDir = mkdtempSync(join(tmpdir(), "dsh-memory-v066a-"));
	const root = join(memDir, "test");
	const delivered = [];
	try {
		mkdirSync(root, { recursive: true });
		seedSops(root, 46);
		const agents = makeAgents(["s-a", "s-b", "s-c"], delivered);
		const { eventHandlers, teardown } = boot(memDir, agents, { reflectSopsThreshold: 40 });

		// ① 首次接触：46 >= 40，尚无终态结论 → 通知一次
		turnEnd(eventHandlers, "s-a", 1);
		await sleep(40);
		expect(delivered.length).toBe(1);
		expect(String(delivered[0].p.content[0].text)).toContain("[记忆整理请求]");
		expect(readReflectionState(root).notifiedRevision).toBeTruthy();

		// ② 模型按提示跑完维护：没有重复项 → no_action 是有效终态
		const report = runMaintain(root, 12288, {});
		expect(report.dedupe.removed.length).toBe(0);
		expect(report.mergeCandidates.length).toBe(0);
		expect(readReflectionState(root).outcome).toBe("no_action");

		// ③ 同一会话继续聊、另开两个全新会话（冷却窗口均满足）→ 静默
		turnEnd(eventHandlers, "s-a", 2);
		turnEnd(eventHandlers, "s-b", 3);
		turnEnd(eventHandlers, "s-c", 4);
		await sleep(60);
		expect(delivered.length).toBe(1);

		// ④ 内容真的变了（新增一条 SOP）→ 重新评估并通知一次
		seedSops(root, 47);
		turnEnd(eventHandlers, "s-b", 5);
		await sleep(40);
		expect(delivered.length).toBe(2);
		teardown();
	} finally {
		rmSync(memDir, { recursive: true, force: true });
	}
});

test("插件清理后，已排队的提醒不再投递（R6）", async () => {
	const memDir = mkdtempSync(join(tmpdir(), "dsh-memory-v066b-"));
	const root = join(memDir, "test");
	const delivered = [];
	try {
		mkdirSync(root, { recursive: true });
		seedSops(root, 46);
		const agents = makeAgents(["s-a"], delivered);
		const { eventHandlers, teardown } = boot(memDir, agents, { reflectSopsThreshold: 40 });
		turnEnd(eventHandlers, "s-a", 1);
		teardown(); // 同步清理：disposed + 取消定时器
		await sleep(60);
		expect(delivered.length).toBe(0);
		expect(readReflectionState(root).notifiedRevision).toBeUndefined();
	} finally {
		rmSync(memDir, { recursive: true, force: true });
	}
});

test("排队期间维护先解决了问题：过期提醒在投递前被丢弃（R7）", async () => {
	const memDir = mkdtempSync(join(tmpdir(), "dsh-memory-v066c-"));
	const root = join(memDir, "test");
	const delivered = [];
	try {
		mkdirSync(root, { recursive: true });
		seedSops(root, 46);
		const agents = makeAgents(["s-a"], delivered);
		const { eventHandlers, teardown } = boot(memDir, agents, { reflectSopsThreshold: 40 });
		turnEnd(eventHandlers, "s-a", 1); // 同步阶段排队一条提醒
		runMaintain(root, 12288, {});     // 宏任务执行前，维护已经把状态置为终态
		await sleep(60);
		expect(delivered.length).toBe(0);
		expect(isSettledRevision(readReflectionState(root), computeContentRevision(root))).toBe(true);
		teardown();
	} finally {
		rmSync(memDir, { recursive: true, force: true });
	}
});

test("重载/重新接线后同一内容版本不重复通知（R4）", async () => {
	const memDir = mkdtempSync(join(tmpdir(), "dsh-memory-v066d-"));
	const root = join(memDir, "test");
	const delivered = [];
	try {
		mkdirSync(root, { recursive: true });
		seedSops(root, 46);
		const agents = makeAgents(["s-a", "s-b"], delivered);
		const first = boot(memDir, agents, { reflectSopsThreshold: 40 });
		turnEnd(first.eventHandlers, "s-a", 1);
		await sleep(40);
		expect(delivered.length).toBe(1);
		first.teardown();

		// 重新接线（等价于热重载）：状态在磁盘上，内容没变 → 不重启喊话
		const second = boot(memDir, agents, { reflectSopsThreshold: 40 });
		turnEnd(second.eventHandlers, "s-b", 2);
		await sleep(40);
		expect(delivered.length).toBe(1);
		second.teardown();
	} finally {
		rmSync(memDir, { recursive: true, force: true });
	}
});

test("reflectionEnabled=false 停掉主动投递，手动维护仍可用（F6）", async () => {
	const memDir = mkdtempSync(join(tmpdir(), "dsh-memory-v066e-"));
	const root = join(memDir, "test");
	const delivered = [];
	try {
		mkdirSync(root, { recursive: true });
		seedSops(root, 46);
		const agents = makeAgents(["s-a"], delivered);
		const { eventHandlers, teardown } = boot(memDir, agents, { reflectSopsThreshold: 40, reflectionEnabled: false });
		turnEnd(eventHandlers, "s-a", 1);
		await sleep(40);
		expect(delivered.length).toBe(0);
		const report = runMaintain(root, 12288, {}); // 手动维护不受开关影响
		expect(report.stats.sops).toBeGreaterThan(0);
		teardown();
	} finally {
		rmSync(memDir, { recursive: true, force: true });
	}
});

test("阈值 0 = 关闭该判据，而不是恒真（R8/R9）", async () => {
	const memDir = mkdtempSync(join(tmpdir(), "dsh-memory-v066f-"));
	const root = join(memDir, "test");
	const delivered = [];
	try {
		mkdirSync(root, { recursive: true });
		seedSops(root, 46);
		mkdirSync(join(root, "pending"), { recursive: true });
		for (let i = 0; i < 5; i++) writeFileSync(join(root, "pending", "p" + i + ".md"), "# candidate");
		const agents = makeAgents(["s-a", "s-b"], delivered);
		// autoPending 打开 + pending 阈值 0（关闭），SOP 阈值 0（关闭）→ 任何判据都不成立
		const { eventHandlers, teardown } = boot(memDir, agents, { reflectSopsThreshold: 0, reflectPendingThreshold: 0, autoPending: true });
		turnEnd(eventHandlers, "s-a", 1);
		turnEnd(eventHandlers, "s-b", 2);
		await sleep(50);
		expect(delivered.length).toBe(0);
		teardown();
	} finally {
		rmSync(memDir, { recursive: true, force: true });
	}
});

test("decideReflection 六态：disabled / cooldown / no-signal / settled / already-notified / triggered", () => {
	const cfg = { autoPending: false, reflectPendingThreshold: 5, reflectSopsThreshold: 40, l1MaxChars: 12288 };
	const base = { enabled: true, cooled: true, state: {}, revision: "r1", signals: { sops: 46, pending: 0, indexChars: 100 }, cfg };
	expect(decideReflection(base).notify).toBe(true);
	expect(decideReflection({ ...base, enabled: false }).reason).toBe("disabled");
	expect(decideReflection({ ...base, cooled: false }).reason).toBe("cooldown");
	expect(decideReflection({ ...base, cfg: { ...cfg, reflectSopsThreshold: 0 } }).reason).toBe("no-signal");
	expect(decideReflection({ ...base, state: { revision: "r1", outcome: "no_action" } }).reason).toBe("settled");
	expect(decideReflection({ ...base, state: { revision: "r1", outcome: "done" } }).reason).toBe("settled");
	expect(decideReflection({ ...base, state: { revision: "r1", outcome: "needs_review", notifiedRevision: "r1" } }).reason).toBe("already-notified");
	expect(decideReflection({ ...base, state: { revision: "r0", outcome: "no_action" } }).notify).toBe(true);
	// 索引超预算也算一个独立 bucket
	const idx = decideReflection({ ...base, signals: { sops: 0, pending: 0, indexChars: 99999 } });
	expect(idx.notify).toBe(true);
	expect(idx.buckets).toEqual(["index"]);
});

test("recordMaintainOutcome：no_action / needs_review / done 三态", () => {
	const memDir = mkdtempSync(join(tmpdir(), "dsh-memory-v066g-"));
	const root = join(memDir, "test");
	try {
		mkdirSync(root, { recursive: true });
		seedSops(root, 3);
		const shell = { runAt: new Date().toISOString(), dedupe: { removed: [], merged: [] }, index: { over_limit: false }, stats: { sops: 3, pending: 0 }, mergeCandidates: [], cold: {} };
		recordMaintainOutcome(root, shell);
		expect(readReflectionState(root).outcome).toBe("no_action");

		recordMaintainOutcome(root, { ...shell, mergeCandidates: [{ a: "x", b: "y", similarity: 0.5, nameOverlap: 0.5 }] });
		expect(readReflectionState(root).outcome).toBe("needs_review");

		recordMaintainOutcome(root, { ...shell, dedupe: { removed: ["sop:x -> duplicate of y"], merged: [] } });
		expect(readReflectionState(root).outcome).toBe("done");

		recordMaintainOutcome(root, { ...shell, index: { over_limit: true } });
		expect(readReflectionState(root).outcome).toBe("needs_review");
	} finally {
		rmSync(memDir, { recursive: true, force: true });
	}
});

test("指纹只跟内容走：轮次计数与访问热度不算内容变化，新增条目才算", () => {
	const memDir = mkdtempSync(join(tmpdir(), "dsh-memory-v066h-"));
	const root = join(memDir, "test");
	try {
		ensureNamespaceLayout(root);
		seedSops(root, 2);
		const r1 = computeContentRevision(root);
		bumpTurnCounter(root);
		bumpTurnCounter(root);
		bumpAccess(root, "sop-00");
		bumpAccess(root, "sop-01");
		expect(computeContentRevision(root)).toBe(r1);
		writeFileSync(join(root, "sops", "sop-02.md"), "# 新条目");
		expect(computeContentRevision(root)).not.toBe(r1);
	} finally {
		rmSync(memDir, { recursive: true, force: true });
	}
});

test("readMeta 缓存：写入立即可见，外部改文件也能感知", () => {
	const memDir = mkdtempSync(join(tmpdir(), "dsh-memory-v066i-"));
	const root = join(memDir, "test");
	try {
		ensureNamespaceLayout(root);
		setEntryMeta(root, "fact", "k1", { evidence: "e1" });
		expect(getEntryMeta(root, "fact", "k1").evidence).toBe("e1");
		setEntryMeta(root, "fact", "k1", { evidence: "e2" });
		expect(getEntryMeta(root, "fact", "k1").evidence).toBe("e2");
		writeFileSync(join(root, "memory-meta.json"), JSON.stringify({ facts: { k2: { evidence: "外部写入的更长内容" } }, sops: {} }, null, 2));
		expect(getEntryMeta(root, "fact", "k2").evidence).toBe("外部写入的更长内容");
	} finally {
		rmSync(memDir, { recursive: true, force: true });
	}
});

test("冷却窗口内直接短路：不评估、不写状态（R10）", async () => {
	const memDir = mkdtempSync(join(tmpdir(), "dsh-memory-v066j-"));
	const root = join(memDir, "test");
	const delivered = [];
	try {
		mkdirSync(root, { recursive: true });
		seedSops(root, 46);
		const agents = makeAgents(["s-a"], delivered);
		// 冷却是 10 轮：第一轮评估并写入状态，紧接着的第二轮必须直接跳过
		const { eventHandlers, teardown } = boot(memDir, agents, { reflectSopsThreshold: 40, reflectCooldownTurns: 10 });
		turnEnd(eventHandlers, "s-a", 1);
		await sleep(40);
		expect(delivered.length).toBe(1);
		const stateFile = join(root, "reflection-state.json");
		const firstMtime = statSync(stateFile).mtimeMs;
		await sleep(15);
		turnEnd(eventHandlers, "s-a", 2); // 冷却未满 → 直接 return，连状态文件都不碰
		await sleep(40);
		expect(delivered.length).toBe(1);
		expect(statSync(stateFile).mtimeMs).toBe(firstMtime);
		teardown();
	} finally {
		rmSync(memDir, { recursive: true, force: true });
	}
});
