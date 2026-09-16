// v0.6 行为回归：覆盖写快照、写入侧硬约束（密钥/幽灵 section）、L1 幂等、
// 溯源自动补全、autoPending 默认关闭与 dispose 落盘。
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
	memDir = mkdtempSync(join(tmpdir(), "dsh-memory-v06-"));
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
		effect(factory) {
			const d = factory();
			if (typeof d === "function") effects.push(d);
		},
	};
	effects = [];
	disposer = apply(ctx, {
		memoryDir: memDir,
		progressive: false,
		autoNamespace: false,
		defaultNamespace: "test",
		...overrides,
	});
	tools = registered;
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
	if (memDir) rmSync(memDir, { recursive: true, force: true });
});

test("覆盖同名条目会先把旧版本快照到 .history/", async () => {
	await write({ topic: "snap-fact", entry_type: "fact", content: "第一版内容" });
	const r = await write({ topic: "snap-fact", entry_type: "fact", content: "第二版内容" });
	expect(r.action).toBe("updated");
	expect(r.history).toBeTruthy();
	expect(existsSync(join(root(), r.history))).toBe(true);
	expect(readFileSync(join(root(), r.history), "utf8")).toContain("第一版内容");
	expect(readFileSync(join(root(), "facts.md"), "utf8")).toContain("第二版内容");
	expect((r.advisories || []).some((a) => a.includes("memory_update"))).toBe(true);
});

test("fact 正文里的 ## 标题行被拒绝（防幽灵 section）", async () => {
	await expect(write({ topic: "ghost", entry_type: "fact", content: "正常行\n## 伪装成 section 的行" }))
		.rejects.toThrow(/##/);
});

test("疑似密钥明文被拒绝写入，纯 hex 哈希不误伤", async () => {
	await expect(write({ topic: "leaky", entry_type: "fact", content: "endpoint ok\napi key: sk-abcdefghijklmnopqrstuvwxyz012345" }))
		.rejects.toThrow(/密钥/);
	await expect(write({ topic: "leaky2", entry_type: "fact", content: "token AKIAABCDEFGHIJKLMNOP" }))
		.rejects.toThrow(/密钥/);
	await expect(write({ topic: "sha-ref", entry_type: "fact", content: "built from 9ed1879e18cb003db1210357ea4a283774773acc" }))
		.resolves.toBeTruthy();
});

test("promote 在源条目无证据时拒绝（不许占位串过关）", async () => {
	await write({ topic: "no-ev", entry_type: "fact", content: "内容" });
	rmSync(join(root(), "memory-meta.json"), { force: true });
	await expect(tool("memory_promote").execute({ topic: "no-ev", entry_type: "fact", from_namespace: "test", to_namespace: "default" }))
		.rejects.toThrow(/evidence/);
});

test("同名重复 section 折叠为一条，多余段先落快照", async () => {
	const factsPath = join(root(), "facts.md");
	await write({ topic: "dup", entry_type: "fact", content: "A 版" });
	writeFileSync(factsPath, readFileSync(factsPath, "utf8") + "## dup\nB 版（重复段）\n\n", "utf8");
	expect((readFileSync(factsPath, "utf8").match(/^## dup$/gm) || []).length).toBe(2);

	const r = await write({ topic: "dup", entry_type: "fact", content: "C 版（收敛后）" });
	expect(r.action).toBe("merged");
	const text = readFileSync(factsPath, "utf8");
	expect((text.match(/^## dup$/gm) || []).length).toBe(1);
	expect(text).toContain("C 版（收敛后）");
	expect(text).not.toContain("B 版");
	const histDir = join(root(), ".history");
	expect(readdirSync(histDir).some((f) => readFileSync(join(histDir, f), "utf8").includes("B 版"))).toBe(true);
});

test("L1 索引内容未变化时不重写文件（前缀稳定）", async () => {
	await write({ topic: "stable", entry_type: "fact", content: "x" });
	const p = join(root(), "index.txt");
	const before = readFileSync(p, "utf8");
	const r1 = await tool("memory_index").execute({ namespace: "test" });
	expect(r1.rewritten).toBe(false);
	expect(readFileSync(p, "utf8")).toBe(before);
});

test("autoPending 默认关闭：重试序列不再产生候选", async () => {
	fire("tools/result", { name: "run_code", agent: { id: "s1" }, arguments: {} }, { isError: true, text: "boom" });
	fire("tools/result", { name: "run_code", agent: { id: "s1" }, arguments: {} }, { isError: false, text: "ok" });
	fire("session/event", { id: "s1" }, { type: "turn/end", seq: 7 });
	expect(readdirSync(join(root(), "pending")).length).toBe(0);
});

test("开启 autoPending 后，dispose 前捕获的重试序列会先落候选", async () => {
	setup({ autoPending: true });
	fire("tools/result", { name: "pwsh", agent: { id: "s2" }, arguments: {} }, { isError: true, text: "port busy" });
	fire("tools/result", { name: "pwsh", agent: { id: "s2" }, arguments: {} }, { isError: false, text: "listening" });
	fire("agent/disposed", { agent: { id: "s2" } });
	const pending = readdirSync(join(root(), "pending"));
	expect(pending.length).toBe(1);
	expect(readFileSync(join(root(), "pending", pending[0]), "utf8")).toContain("dispose");
});

test("memory_write 成功后由 turn/end 自动补齐 sourceSession/sourceSeqs", async () => {
	await write({ topic: "prov", entry_type: "fact", content: "溯源内容" });
	const before = JSON.parse(readFileSync(join(root(), "memory-meta.json"), "utf8"));
	expect(before.facts.prov.sourceSeqs || []).toEqual([]);
	fire("tools/result", {
		name: "memory_write",
		agent: { id: "sess-9" },
		arguments: { topic: "prov", entry_type: "fact", namespace: "test" },
	}, { isError: false });
	fire("session/event", { id: "sess-9" }, { type: "turn/end", seq: 42 });
	const meta = JSON.parse(readFileSync(join(root(), "memory-meta.json"), "utf8"));
	expect(meta.facts.prov.sourceSession).toBe("sess-9");
	expect(meta.facts.prov.sourceSeqs).toEqual([42]);
});