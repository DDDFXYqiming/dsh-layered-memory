// v0.7.1 测试：related key 写入侧规范化 + 遗留 memory_stats.json 初始化隔离。
// 覆盖：normalizeRelatedKey 单元行为、memory_write/memory_update 入库规范化、
// 裸 key 不受影响（回归）、遗留文件改名隔离（保底可读）与幂等、隔离失败不阻断初始化。
import { test, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, readFileSync, writeFileSync, existsSync, rmSync, mkdirSync, chmodSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { apply } from "../lib/index.js";
import { normalizeRelatedKey } from "../src/memory-ops.js";
import { ensureNamespaceLayout, clearNamespaceCache } from "../src/store.js";

let memDir;
let disposer;
let tools;

function setup(cfgExtra = {}) {
	memDir = mkdtempSync(join(tmpdir(), "dsh-memory-v071-test-"));
	const registered = [];
	const ctx = {
		get(service) {
			if (service === "systemPrompt") return { context: () => () => {} };
			if (service === "agents") return { get: () => null };
			if (service === "sessionQuery") return null;
			return undefined;
		},
		on() { return () => {}; },
		skills: { register: () => () => {} },
		tools: {
			register(def) { registered.push(def); return () => {}; },
			restrict() { return () => {}; },
		},
		logger: { info() {}, warn() {} },
		effect() {},
	};
	disposer = apply(ctx, {
		memoryDir: memDir,
		progressive: false,
		autoNamespace: false,
		defaultNamespace: "test",
		...cfgExtra,
	});
	tools = registered;
}

function tool(name) {
	const def = tools.find((t) => t.name === name);
	if (!def) throw new Error(`tool not found: ${name}`);
	return def;
}

beforeEach(() => { setup(); });

afterEach(() => {
	if (typeof disposer === "function") disposer();
	disposer = null;
	if (memDir) { try { rmSync(memDir, { recursive: true, force: true }); } catch { /* 忽略 */ } }
	memDir = null;
	clearNamespaceCache();
});

// ── normalizeRelatedKey 单元 ─────────────────────────────────────────────────

test("normalizeRelatedKey：剥 sops/ 前缀与 .md 后缀，其余原样", () => {
	expect(normalizeRelatedKey("sops/foo.md")).toBe("foo");
	expect(normalizeRelatedKey("sops\\foo.md")).toBe("foo"); // Windows 反斜杠
	expect(normalizeRelatedKey("sops/foo")).toBe("foo");
	expect(normalizeRelatedKey("foo.md")).toBe("foo");
	expect(normalizeRelatedKey("foo")).toBe("foo");
	expect(normalizeRelatedKey("  sops/foo.md  ")).toBe("foo"); // 首尾空白
	expect(normalizeRelatedKey("SOPS/Foo.MD")).toBe("Foo"); // 大小写不敏感剥离，key 本身大小写保留
	expect(normalizeRelatedKey("我的事实条目")).toBe("我的事实条目"); // 中文裸 key 不动
	expect(normalizeRelatedKey("sops/")).toBe(""); // 只剩前缀 → 空（由调用侧 filter 掉）
});

// ── 工具路径入库规范化 ───────────────────────────────────────────────────────

test("memory_write 的 related 入库前规范化为裸 key", async () => {
	await tool("memory_write").execute({
		topic: "规范化目标", entry_type: "fact", content: "B", evidence: "v", namespace: "test",
	});
	await tool("memory_write").execute({
		topic: "规范化来源", entry_type: "fact", content: "A", evidence: "v",
		related: ["sops/规范化目标.md", "规范化目标.md"], namespace: "test",
	});
	const meta = JSON.parse(readFileSync(join(memDir, "test", "memory-meta.json"), "utf8"));
	const rel = meta.facts["规范化来源"].related;
	expect(rel).toContain("规范化目标");
	expect(rel.every((r) => !r.startsWith("sops/") && !r.endsWith(".md"))).toBe(true);
	// 读取侧 related_states 能解析到存在的目标
	const r = await tool("memory_read").execute({ name: "规范化来源", namespace: "test" });
	const states = r.meta.related_states.map((s) => `${s.name}:${s.state}`);
	expect(states).toContain("规范化目标:active");
});

test("memory_update 的 related 同样规范化，裸 key 回归不受影响", async () => {
	await tool("memory_write").execute({
		topic: "更新目标", entry_type: "fact", content: "B", evidence: "v", namespace: "test",
	});
	await tool("memory_write").execute({
		topic: "更新来源", entry_type: "fact", content: "A", evidence: "v",
		related: ["更新目标"], namespace: "test",
	});
	let meta = JSON.parse(readFileSync(join(memDir, "test", "memory-meta.json"), "utf8"));
	expect(meta.facts["更新来源"].related).toEqual(["更新目标"]); // 裸 key 原样
	await tool("memory_update").execute({
		topic: "更新来源", entry_type: "fact", content: "A2",
		related: ["sops/更新目标.md"], namespace: "test",
	});
	meta = JSON.parse(readFileSync(join(memDir, "test", "memory-meta.json"), "utf8"));
	expect(meta.facts["更新来源"].related).toEqual(["更新目标"]); // 路径写法被规范化
});

// ── 遗留 memory_stats.json 隔离 ──────────────────────────────────────────────

test("ensureNamespaceLayout 把遗留 memory_stats.json 改名隔离（保底可读）", () => {
	const root = join(memDir, "legacy-ns");
	mkdirSync(root, { recursive: true });
	writeFileSync(join(root, "memory_stats.json"), JSON.stringify({ old: true }));
	ensureNamespaceLayout(root);
	expect(existsSync(join(root, "memory_stats.json"))).toBe(false);
	const kept = join(root, "memory_stats.json.legacy");
	expect(existsSync(kept)).toBe(true);
	expect(JSON.parse(readFileSync(kept, "utf8")).old).toBe(true); // 内容原样保留
	// 幂等：已有 .legacy 时又出现新遗留 → 删新件、旧隔离件不动
	writeFileSync(join(root, "memory_stats.json"), JSON.stringify({ old: 2 }));
	ensureNamespaceLayout(root);
	expect(existsSync(join(root, "memory_stats.json"))).toBe(false);
	expect(JSON.parse(readFileSync(kept, "utf8")).old).toBe(true);
});

test("工具路径触发懒隔离：memory_list 后遗留文件被改名", async () => {
	writeFileSync(join(memDir, "test", "memory_stats.json"), "{\"stale\":1}");
	await tool("memory_list").execute({ namespace: "test" });
	expect(existsSync(join(memDir, "test", "memory_stats.json"))).toBe(false);
	expect(existsSync(join(memDir, "test", "memory_stats.json.legacy"))).toBe(true);
});

test("隔离失败不阻断初始化（目录只读时工具照常可用）", async () => {
	if (process.platform === "win32") return; // Windows 无 POSIX 权限位语义，跳过
	const root = join(memDir, "readonly-ns");
	mkdirSync(root, { recursive: true });
	writeFileSync(join(root, "memory_stats.json"), "{}");
	chmodSync(root, 0o555);
	try {
		expect(() => ensureNamespaceLayout(root)).not.toThrow();
	} finally {
		chmodSync(root, 0o755);
	}
});
