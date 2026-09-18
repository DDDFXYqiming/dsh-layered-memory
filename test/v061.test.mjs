// 0.6.1 审查修复回归：覆盖官方规范审查报告（report-20260918-layered-memory.md）
// 各条发现的最小复现与修复断言。编号与报告一致（M1-M4 / N1-N14）。
import { test, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, readFileSync, writeFileSync, existsSync, rmSync, readdirSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { apply } from "../lib/index.js";

let memDir;
let disposer;
let tools;
let handlers;
let effects = [];

function setup(overrides = {}) {
	memDir = mkdtempSync(join(tmpdir(), "dsh-memory-v061-"));
	const registered = [];
	handlers = new Map();
	const ctx = {
		get(service) {
			if (service === "systemPrompt") return { context: () => () => {} };
			if (service === "agents") return null;
			if (service === "sessionQuery") return null;
			return undefined;
		},
		on(event, fn) {
			if (!handlers.has(event)) handlers.set(event, []);
			handlers.get(event).push(fn);
			return () => {};
		},
		skills: { register: () => () => {} },
		tools: {
			register(def) { registered.push(def); return () => {}; },
			restrict() { return () => {}; },
		},
		logger: { info() {}, warn() {} },
		effect(factory) {
			const d = factory();
			if (typeof d === "function") effects.push(d);
		},
	};
	effects = [];
	const cfg = {
		memoryDir: memDir,
		progressive: false,
		autoNamespace: false,
		defaultNamespace: "test",
		...overrides,
	};
	disposer = apply(ctx, cfg);
	tools = registered;
	return { cfg };
}

const fire = (event, ...args) => { for (const fn of handlers.get(event) || []) fn(...args); };
const tool = (name) => {
	const def = tools.find((t) => t.name === name);
	if (!def) throw new Error("tool not found: " + name);
	return def;
};
const root = () => join(memDir, "test");
const write = (args) => tool("memory_write").execute({ evidence: "unit test", namespace: "test", ...args });

beforeEach(() => setup());
afterEach(() => {
	if (typeof disposer === "function") disposer();
	for (const f of effects || []) f();
	effects = [];
	if (memDir) rmSync(memDir, { recursive: true, force: true });
});

// ── N1：casRewrite 竞争路径不得泄漏 .tmp-* ──

test("N1 casRewrite：基座被并发改写的分支会清掉自己的 tmp，不留残留", async () => {
	const { casRewrite } = await import("../src/store.js");
	const dir = mkdtempSync(join(tmpdir(), "dsh-memory-n1-"));
	try {
		const p = join(dir, "x.txt");
		writeFileSync(p, "v0", "utf8");
		let round = 0;
		// 第一轮：compute 之后、复核之前模拟并发者改写基座 → cur !== text，走不走
		// commitStaged 的放弃分支（该分支没有 finally 兜底，清理只能靠 casRewrite 自己）。
		casRewrite(p, (text) => {
			round += 1;
			if (round === 1) {
				writeFileSync(p, "raced", "utf8");
				return "v1";
			}
			return null; // 第二轮基于新基座重算：无需写入，退出
		}, 1000);
		expect(readFileSync(p, "utf8")).toBe("raced");
		const leftovers = readdirSync(dir).filter((f) => f.includes(".tmp-"));
		expect(leftovers).toEqual([]);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

// ── M1：memory_maintain 在 createdAt 缺失/损坏的老库上不再整包失败 ──

test("M1 maintain：无 createdAt / 非法 createdAt / 极老条目的 mix 输出仍是无损 JSON", async () => {
	await write({ topic: "fresh-fact", entry_type: "fact", content: "正常条目" });
	const metaPath = join(root(), "memory-meta.json");
	const meta = JSON.parse(readFileSync(metaPath, "utf8"));
	const oldTs = new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString();
	meta.facts["no-created"] = { sourceSession: "", sourceSeqs: [], evidence: "x", archived: false, updatedAt: "" };
	meta.facts["bad-created"] = { createdAt: "not-a-date", updatedAt: oldTs };
	meta.facts["ancient"] = { createdAt: "2001-01-01T00:00:00.000Z", updatedAt: oldTs };
	writeFileSync(metaPath, JSON.stringify(meta, null, 2), "utf8");
	writeFileSync(join(root(), "facts.md"), readFileSync(join(root(), "facts.md"), "utf8")
		+ "## no-created\n缺 createdAt（老库迁移形态）\n\n## bad-created\n非法日期\n\n## ancient\n极老条目\n\n", "utf8");

	const r = await tool("memory_maintain").execute({ namespace: "test" });
	// 宿主两条硬校验之一：可无损 JSON 往返（Infinity/NaN 序列化后不相等即整包拒收）
	const json = JSON.stringify(r);
	expect(json).not.toMatch(/Infinity|NaN|null,null/);
	expect(JSON.parse(json)).toEqual(r);
	const rows = r.report.cold.entries;
	const byName = Object.fromEntries(rows.map((row) => [row.name, row]));
	expect(byName["no-created"].age_days).toBeNull();
	expect(byName["bad-created"].age_days).toBeNull();
	expect(Number.isInteger(byName["ancient"].age_days)).toBe(true);
	expect(byName["ancient"].age_days).toBeGreaterThan(9000);
	// 落盘报告与返回值同口径
	const disk = JSON.parse(readFileSync(join(root(), "maintenance-report.json"), "utf8"));
	expect(JSON.stringify(disk)).not.toMatch(/Infinity|NaN/);
});

// ── M4：memory_rollback 的 topic 必须过写入侧同一控制字符判据 ──

test("M4 rollback fact 路径：含 \\n / \\r / \\u0000 的 topic 被拒，且不注入幽灵 section", async () => {
	await write({ topic: "x evil", entry_type: "fact", content: "原始版内容" });
	await write({ topic: "x evil", entry_type: "fact", content: "第二版内容" }); // 产生 .history/fact-x-evil-*.md 快照
	const factsBefore = readFileSync(join(root(), "facts.md"), "utf8");
	expect(readdirSync(join(root(), ".history")).some((f) => f.startsWith("fact-x-evil-"))).toBe(true);
	for (const bad of ["x\n## evil", "x\r## evil", "x\u0000evil"]) {
		await expect(tool("memory_rollback").execute({ topic: bad, entry_type: "fact", namespace: "test" }))
			.rejects.toThrow(/控制字符/);
	}
	// 修复前：slugify("x\n## evil") 与 "x evil" 同为 x-evil，会命中快照把 "evil" 段注入 facts.md
	expect(readFileSync(join(root(), "facts.md"), "utf8")).toBe(factsBefore);
});

test("M4 rollback：历史快照正文含 ## 标题行时拒绝恢复（纵深防御）", async () => {
	await write({ topic: "guard", entry_type: "fact", content: "当前内容" });
	writeFileSync(join(root(), ".history", "fact-guard-9999999999999.md"), "# guard\n\n正常行\n## ghost\n坏内容\n", "utf8");
	await expect(tool("memory_rollback").execute({ topic: "guard", entry_type: "fact", namespace: "test" }))
		.rejects.toThrow(/拒绝恢复/);
	expect(readFileSync(join(root(), "facts.md"), "utf8")).toContain("当前内容");
});

test("M4 accept/archive/expand/promote 的 topic 同判据收口", async () => {
	await expect(tool("memory_archive").execute({ topic: "evil\nx", entry_type: "fact", namespace: "test" }))
		.rejects.toThrow(/控制字符/);
	await expect(tool("memory_expand").execute({ topic: "evil\rx", entry_type: "fact", namespace: "test" }))
		.rejects.toThrow(/控制字符/);
	await expect(tool("memory_promote").execute({ topic: "evil\u0000x", entry_type: "fact", from_namespace: "test", to_namespace: "default" }))
		.rejects.toThrow(/控制字符/);
	await expect(tool("memory_accept").execute({ name: "whatever.md", topic: "evil\nx", entry_type: "fact", evidence: "e" }))
		.rejects.toThrow(/控制字符|不存在/);
});

// ── M3：autoNamespace 的 git 分支探测进程内缓存 ──

test("M3 detectNamespace：TTL 内第二次调用不再 spawn git；TTL=0 关闭缓存；过期重取", async () => {
	const { homedir } = await import("node:os");
	const { detectNamespace, clearNamespaceCache, namespaceProbe } = await import("../src/store.js");
	if (join(process.cwd()) === join(homedir())) return; // 家目录短路不 spawn，断言无意义
	clearNamespaceCache();
	const a = detectNamespace(60_000);
	expect(namespaceProbe.gitSpawns).toBe(1);
	const b = detectNamespace(60_000);
	expect(b).toBe(a);
	expect(namespaceProbe.gitSpawns).toBe(1); // 命中缓存：零 spawn
	const c = detectNamespace(60_000, Date.now() + 61_000); // 模拟 TTL 过期
	expect(c).toBe(a);
	expect(namespaceProbe.gitSpawns).toBe(2);
	detectNamespace(0); // ttl=0：不缓存、每次直取
	expect(namespaceProbe.gitSpawns).toBe(3);
	clearNamespaceCache();
});

test("M3 resolveNamespace 消费 namespaceCacheTtlMs 配置（两次解析只 spawn 一次）", async () => {
	const { homedir } = await import("node:os");
	const { resolveNamespace, clearNamespaceCache, namespaceProbe } = await import("../src/store.js");
	if (join(process.cwd()) === join(homedir())) return;
	clearNamespaceCache();
	resolveNamespace({ autoNamespace: true, namespaceCacheTtlMs: 60_000 });
	resolveNamespace({ autoNamespace: true, namespaceCacheTtlMs: 60_000 });
	expect(namespaceProbe.gitSpawns).toBe(1);
	clearNamespaceCache();
});

// ── N5：冷条目复核窗口入 Config ──

test("N5 coldReviewDays 配置穿透 runMaintain（默认 90，放宽到 500 后老条目出局）", async () => {
	await write({ topic: "aged", entry_type: "fact", content: "老条目" });
	const metaPath = join(root(), "memory-meta.json");
	const meta = JSON.parse(readFileSync(metaPath, "utf8"));
	const ts = new Date(Date.now() - 400 * 86400000).toISOString();
	meta.facts.aged.createdAt = ts;
	meta.facts.aged.updatedAt = ts;
	writeFileSync(metaPath, JSON.stringify(meta, null, 2), "utf8");
	const { runMaintain } = await import("../src/maintain.js");
	const def = runMaintain(root(), 12288, {});
	expect(def.cold.threshold_days).toBe(90);
	expect(def.cold.entries.map((e) => e.name)).toContain("aged");
	const wide = runMaintain(root(), 12288, { coldReviewDays: 500 });
	expect(wide.cold.threshold_days).toBe(500);
	expect(wide.cold.entries.map((e) => e.name)).not.toContain("aged");
});

