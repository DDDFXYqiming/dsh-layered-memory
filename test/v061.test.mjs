// 0.6.1 审查修复回归：覆盖官方规范审查报告（report-20260918-layered-memory.md）
// 各条发现的最小复现与修复断言。编号与报告一致（M1-M4 / N1-N14）。
import { test, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, readFileSync, writeFileSync, existsSync, rmSync, readdirSync } from "node:fs";
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
