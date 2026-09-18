// v0.6.3 回归：Agent Teams 开启后，同进程会并发存在 teammate 会话（有 parentSession）。
// 断言两件事：① 轮次计数与反思注入只认交互（无 parentSession）会话；
// ② 注入 payload 符合宿主 UserMessage 形状（带 id 与 role，宿主 inject 不校验形状）。
import { test, expect } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { apply } from "../lib/index.js";

function makeCtx(memDir, agents) {
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

const readTurns = (memDir) => {
	const p = join(memDir, "test", "turn-state.json");
	if (!existsSync(p)) return null;
	try { return JSON.parse(readFileSync(p, "utf8")).totalTurns ?? 0; } catch { return null; }
};

test("teammate (parentSession) turn/end neither bumps the global counter nor receives reflection injection", async () => {
	const memDir = mkdtempSync(join(tmpdir(), "dsh-memory-v063-"));
	const agents = new Map();
	const delivered = [];
	const mkAgent = (id) => { const a = { id, inject(p) { delivered.push({ id, p }); } }; agents.set(id, a); return a; };
	mkAgent("sess-lead");
	mkAgent("sess-teammate");
	const { ctx, eventHandlers, effects } = makeCtx(memDir, agents);
	const disposer = apply(ctx, {
		memoryDir: memDir,
		progressive: false,
		autoNamespace: false,
		defaultNamespace: "test",
		autoPending: true,
	});
	try {
		// 5 条 pending 候选 = reflectPendingThreshold 默认值，令反思判定恒成立
		mkdirSync(join(memDir, "test", "pending"), { recursive: true });
		for (let i = 0; i < 5; i++) writeFileSync(join(memDir, "test", "pending", `p${i}.md`), "# candidate\n");

		// ① teammate 会话（有 parentSession）：不计数、不注入
		eventHandlers["session/event"](
			{ id: "sess-teammate", header: { parentSession: "sess-lead" } },
			{ type: "turn/end", seq: 1 },
		);
		await new Promise((r) => setTimeout(r, 10));
		expect(readTurns(memDir)).toBe(null);
		expect(delivered.length).toBe(0);

		// ② 交互会话（无 parentSession）：计数 +1 并注入
		eventHandlers["session/event"](
			{ id: "sess-lead", header: {} },
			{ type: "turn/end", seq: 2 },
		);
		await new Promise((r) => setTimeout(r, 10));
		expect(readTurns(memDir)).toBe(1);
		expect(delivered.length).toBe(1);
		expect(delivered[0].id).toBe("sess-lead");

		// ③ payload 必须是宿主 UserMessage 形状：带 id 与 role
		const msg = delivered[0].p;
		expect(typeof msg.id).toBe("string");
		expect(msg.id.length).toBeGreaterThan(8);
		expect(msg.role).toBe("user");
		expect(msg.source).toEqual({ kind: "plugin", plugin: "layered-memory" });
		expect(String(msg.content[0].text)).toContain("[记忆整理请求]");
	} finally {
		if (typeof disposer === "function") disposer();
		for (const f of effects) f();
		rmSync(memDir, { recursive: true, force: true });
	}
});

test("legacy session objects without a header still count as interactive (headless 一次性会话语义保留)", async () => {
	const memDir = mkdtempSync(join(tmpdir(), "dsh-memory-v063b-"));
	const agents = new Map();
	const delivered = [];
	agents.set("sess-plain", { id: "sess-plain", inject(p) { delivered.push(p); } });
	const { ctx, eventHandlers, effects } = makeCtx(memDir, agents);
	const disposer = apply(ctx, {
		memoryDir: memDir,
		progressive: false,
		autoNamespace: false,
		defaultNamespace: "test",
		autoPending: true,
	});
	try {
		mkdirSync(join(memDir, "test", "pending"), { recursive: true });
		for (let i = 0; i < 5; i++) writeFileSync(join(memDir, "test", "pending", `p${i}.md`), "# candidate\n");
		// 无 header 字段（v0.6.2 及更早测试的调用形状）：parentSession 为 undefined → 交互会话
		eventHandlers["session/event"]({ id: "sess-plain" }, { type: "turn/end", seq: 1 });
		await new Promise((r) => setTimeout(r, 10));
		expect(readTurns(memDir)).toBe(1);
		expect(delivered.length).toBe(1);
	} finally {
		if (typeof disposer === "function") disposer();
		for (const f of effects) f();
		rmSync(memDir, { recursive: true, force: true });
	}
});
