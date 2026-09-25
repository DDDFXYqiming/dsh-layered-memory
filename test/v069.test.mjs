// v0.6.9 测试：交叉 review 修复面 + 可用性守护。
// 覆盖：evidence 逐行引用编码与密钥脱敏（不拒写）、正文密钥仍拒写、写入即激活、
// related 空数组语义、slug 碰撞与保留名拦截、memory_read 分段（full/行范围/续读）、
// archive 归档快照与 unarchive、rollback 正文+元数据成对恢复、L1 每层保底入口、
// 命名空间会话感知与纯中文目录 hash 兜底、命名空间写锁重入与清理、正常读写流程不受阻碍。
import { test, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, readFileSync, writeFileSync, existsSync, rmSync, mkdirSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { apply } from "../lib/index.js";
import { buildPromptIndex, INDEX_TRUNCATION_NOTE } from "../src/l1index.js";
import { AUTO_BEGIN, AUTO_END } from "../src/templates.js";
import { detectNamespace, resolveNamespace, withNsWriteLock, clearNamespaceCache } from "../src/store.js";
import { exactNormalize, normalizeText } from "../src/similarity.js";
import { createHash } from "node:crypto";

let memDir;
let disposer;
let tools;

function setup(cfgExtra = {}) {
	memDir = mkdtempSync(join(tmpdir(), "dsh-memory-v069-test-"));
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

// ── evidence 校验与编码 ──────────────────────────────────────────────────────

test("evidence 逐行引用编码：证据里的 \"## \" 行不产生幽灵 section", async () => {
	await tool("memory_write").execute({
		topic: "证据编码验证",
		entry_type: "fact",
		content: "正常正文",
		evidence: "第一行证据\n## 假标题想注入\n第三行证据",
		namespace: "test",
	});
	const facts = readFileSync(join(memDir, "test", "facts.md"), "utf8");
	expect(facts.split("\n").filter((l) => l === "## 假标题想注入")).toHaveLength(0); // 不是 section 标题行
	expect(facts).toContain("> ## 假标题想注入"); // 逐行引用编码
	expect(facts).toContain("> 证据: 第一行证据");
	// 只有一个真实 section
	expect(facts.split("## 证据编码验证").length - 1).toBe(1);
});

test("evidence 含疑似密钥自动脱敏（不拒写），正文含密钥仍拒写", async () => {
	const r = await tool("memory_write").execute({
		topic: "证据脱敏验证",
		entry_type: "fact",
		content: "工具输出里带了凭证，正文本身干净",
		evidence: "命令输出：sk-abcdef0123456789ABCDEF0123456789",
		namespace: "test",
	});
	expect(r.action).toBe("created"); // 可用性：真实证据不陪葬
	const facts = readFileSync(join(memDir, "test", "facts.md"), "utf8");
	expect(facts).not.toContain("sk-abcdef0123456789ABCDEF0123456789");
	expect(facts).toContain("[redacted:");
	await expect(tool("memory_write").execute({
		topic: "正文密钥验证",
		entry_type: "fact",
		content: "这是正文 sk-abcdef0123456789ABCDEF0123456789 明文凭证",
		evidence: "unit test",
		namespace: "test",
	})).rejects.toThrow(/疑似含密钥/);
});

test("正常中文/命令内容的写入与读取完全不受新校验影响（可用性回归）", async () => {
	const content = "- 路径 /srv/App 与 /srv/app 是两个目录（大小写敏感）\n- 命令：pnpm build  &&  node --check src/index.js\n- 端口 8080 → 9090，认证 enabled → disabled";
	await tool("memory_write").execute({ topic: "正常条目", entry_type: "fact", content, evidence: "本次实测通过", namespace: "test" });
	const r = await tool("memory_read").execute({ name: "正常条目", namespace: "test" });
	expect(r.not_found).toBeFalsy();
	expect(r.content).toContain("/srv/App");
	expect(r.content).toContain("8080");
	expect(r.truncated).toBe(false);
	expect(r.revision).toHaveLength(8);
});

// ── meta 版本契约 ───────────────────────────────────────────────────────────

test("写入覆盖已归档条目即恢复可见性（横幅与隐藏状态一致）", async () => {
	await tool("memory_write").execute({ topic: "复活验证", entry_type: "fact", content: "旧内容", evidence: "v1", namespace: "test" });
	await tool("memory_archive").execute({ topic: "复活验证", entry_type: "fact", namespace: "test" });
	expect((await tool("memory_read").execute({ name: "复活验证", namespace: "test" })).not_found).toBe(true);
	await tool("memory_write").execute({ topic: "复活验证", entry_type: "fact", content: "新内容", evidence: "v2", namespace: "test" });
	const r = await tool("memory_read").execute({ name: "复活验证", namespace: "test" });
	expect(r.not_found).toBeFalsy();
	expect(r.meta.archived).toBe(false);
	expect(r.content).not.toContain("[已归档");
});

test("related：未提供继承旧关联，空数组明确清空", async () => {
	await tool("memory_write").execute({ topic: "关联B", entry_type: "fact", content: "B", evidence: "v", namespace: "test" });
	await tool("memory_write").execute({ topic: "关联A", entry_type: "fact", content: "A", evidence: "v", related: ["关联B"], namespace: "test" });
	// update 不传 related：保留
	await tool("memory_update").execute({ topic: "关联A", entry_type: "fact", content: "A2", namespace: "test" });
	expect((await tool("memory_read").execute({ name: "关联A", namespace: "test" })).meta.related).toContain("关联B");
	// update 传 []：清空
	await tool("memory_update").execute({ topic: "关联A", entry_type: "fact", content: "A3", related: [], namespace: "test" });
	const r = await tool("memory_read").execute({ name: "关联A", namespace: "test" });
	expect(r.meta.related ?? []).toHaveLength(0);
});

test("archive 归档前自动快照；unarchive 恢复可见性；rollback 成对恢复元数据", async () => {
	await tool("memory_write").execute({
		topic: "版本契约", entry_type: "fact", content: "V1 内容", evidence: "旧证据",
		sourceSession: "session-1", sourceSeqs: [1, 2], namespace: "test",
	});
	await tool("memory_update").execute({ topic: "版本契约", entry_type: "fact", content: "V2 内容", evidence: "新证据", namespace: "test" });
	// rollback：supersede 快照的是 V1（正文 + 元数据 sidecar），回到 V1 时证据/来源成对恢复
	const rb = await tool("memory_rollback").execute({ topic: "版本契约", entry_type: "fact", namespace: "test" });
	expect(rb.restored).toBe(true);
	expect(rb.meta_restored).toBe(true);
	const afterRb = await tool("memory_read").execute({ name: "版本契约", namespace: "test" });
	expect(afterRb.content).toContain("V1 内容");
	expect(afterRb.meta.evidence).toBe("旧证据");
	expect(afterRb.meta.sourceSession).toBe("session-1");
	// 归档：先给当前版本建快照（返回 history）
	const arch = await tool("memory_archive").execute({ topic: "版本契约", entry_type: "fact", namespace: "test" });
	expect(arch.archived).toBe(true);
	expect(arch.history).toBeTruthy();
	expect((await tool("memory_read").execute({ name: "版本契约", namespace: "test" })).not_found).toBe(true);
	// unarchive：恢复可见性，内容不动
	const un = await tool("memory_archive").execute({ topic: "版本契约", entry_type: "fact", unarchive: true, namespace: "test" });
	expect(un.unarchived).toBe(true);
	const afterUn = await tool("memory_read").execute({ name: "版本契约", namespace: "test" });
	expect(afterUn.content).toContain("V1 内容");
	expect(afterUn.content).not.toContain("[已归档");
});

test("update 提供新 evidence 而未提供新来源时给出版本错位提示（不阻断）", async () => {
	await tool("memory_write").execute({
		topic: "来源契约", entry_type: "fact", content: "C1", evidence: "旧证据",
		sourceSession: "session-1", sourceSeqs: [5], namespace: "test",
	});
	const r = await tool("memory_update").execute({ topic: "来源契约", entry_type: "fact", content: "C2", evidence: "新证据", namespace: "test" });
	expect(r.advisories.some((a) => a.includes("沿用原来源"))).toBe(true);
	// 传了新来源则正常更新且无该提示
	const r2 = await tool("memory_update").execute({ topic: "来源契约", entry_type: "fact", content: "C3", evidence: "更新证据", sourceSession: "session-2", sourceSeqs: [9], namespace: "test" });
	expect(r2.advisories.some((a) => a.includes("沿用原来源"))).toBe(false);
	const m = (await tool("memory_read").execute({ name: "来源契约", namespace: "test" })).meta;
	expect(m.sourceSession).toBe("session-2");
});

// ── 名字碰撞与保留名 ────────────────────────────────────────────────────────

test("SOP 名折叠碰撞拦截：Build.A 与 Build-A 不互相覆盖", async () => {
	await tool("memory_write").execute({ topic: "Build.A", entry_type: "sop", content: "构建 A 的事实", evidence: "v", namespace: "test" });
	await expect(tool("memory_write").execute({ topic: "Build-A", entry_type: "sop", content: "构建连字符的另一事实", evidence: "v", namespace: "test" })).rejects.toThrow(/折叠到同一文件名/);
	// 同名不同大小写不算碰撞（宽松归一：build.a ≡ Build.A）
	await tool("memory_write").execute({ topic: "build.a", entry_type: "sop", content: "同名覆盖是合法更新", evidence: "v", namespace: "test" });
	const r = await tool("memory_read").execute({ name: "build.a", namespace: "test" });
	expect(r.content).toContain("同名覆盖是合法更新");
});

test("保留名写入侧拦截：index/readme/license/l1/索引 写了也读不出来", async () => {
	for (const topic of ["index", "readme", "l1", "索引"]) {
		await expect(tool("memory_write").execute({ topic, entry_type: "sop", content: "x", evidence: "v", namespace: "test" })).rejects.toThrow(/保留名/);
	}
	await expect(tool("memory_write").execute({ topic: "license", entry_type: "fact", content: "x", evidence: "v", namespace: "test" })).rejects.toThrow(/保留名/);
});

// ── memory_read 分段 ────────────────────────────────────────────────────────

test("超大条目默认 outline + 首尾片段，full 取全文、行范围续读", async () => {
	const sections = Array.from({ length: 60 }, (_, i) => `## 小节${i}\n${`第 ${i} 段正文内容，`.repeat(40)}`).join("\n\n");
	await tool("memory_write").execute({ topic: "超大条目", entry_type: "sop", content: sections, evidence: "v", namespace: "test" });
	const auto = await tool("memory_read").execute({ name: "超大条目", namespace: "test" });
	expect(auto.truncated).toBe(true);
	expect(auto.content).toContain("标题结构");
	expect(auto.content).toContain("开头 ---");
	expect(auto.next).toBeGreaterThan(1);
	const full = await tool("memory_read").execute({ name: "超大条目", namespace: "test", full: true });
	expect(full.truncated).toBe(false);
	expect(full.content.length).toBeGreaterThan(16000);
	const ranged = await tool("memory_read").execute({ name: "超大条目", namespace: "test", from_line: auto.next, to_line: auto.next + 4 });
	expect(ranged.content.split("\n").length).toBeLessThanOrEqual(5);
	expect(ranged.revision).toBe(full.revision); // 同一版本
});

// ── L1 每层保底 ─────────────────────────────────────────────────────────────

test("预算极端紧张时 L2/L3 每层保底入口仍在（不再整层消失）", () => {
	const facts = Array.from({ length: 37 }, (_, i) => `dshtool-fact-entry-name-${i}`);
	const sops = Array.from({ length: 5 }, (_, i) => `qwen-local-sop-note-${i}`);
	const idx = [
		"# [Memory Index - L1]",
		AUTO_BEGIN,
		`[L2] ${facts.join(" | ")}`,
		`[L3] ${sops.map((s) => `sops/${s}.md`).join(" | ")}`,
		AUTO_END,
		"[RULES]",
		"- 规则一",
	].join("\n");
	// GPT 反例场景：1024 预算、37 条 facts、5 条 SOP——旧实现 L3 整行消失
	const out = buildPromptIndex(idx, 1024);
	expect(out).toContain("[L2]");
	expect(out).toContain("[L3]");
	expect(out).toContain("sops/qwen-local-sop-note-4.md"); // L3 不再被挤掉
	expect(out).toContain("[RULES]");
	expect(out).toContain(INDEX_TRUNCATION_NOTE);
	// 极端预算：连逐条都没有时每层保底"共 N 条"，仍可发现层存在
	const tiny = buildPromptIndex(idx, 220);
	expect(tiny).toContain("[L2]");
	expect(tiny).toContain("[L3]");
	expect(tiny).toMatch(/共 37 条/);
	expect(tiny).toMatch(/共 5 条/);
});

// ── 命名空间会话感知 ────────────────────────────────────────────────────────

test("resolveNamespace 用会话工作区推导，纯中文目录名 hash 兜底不串库", () => {
	const cfg = { autoNamespace: true, namespaceCacheTtlMs: 0 };
	expect(resolveNamespace(cfg, undefined, "/tmp/work/my-project")).toBe("my-project");
	// 显式参数优先级最高
	expect(resolveNamespace(cfg, "explicit-ns", "/tmp/work/my-project")).toBe("explicit-ns");
	// 纯中文目录名不再塌到 default（跨项目串库），用路径短 hash
	const hashNs = resolveNamespace(cfg, undefined, "/tmp/work/中文项目目录");
	expect(hashNs).toMatch(/^p[0-9a-f]{8}$/);
	// 两个不同的中文目录落不同命名空间
	expect(resolveNamespace(cfg, undefined, "/tmp/work/另一个中文目录")).not.toBe(hashNs);
	// defaultNamespace 显式配置仍然优先于自动推断
	expect(resolveNamespace({ defaultNamespace: "fixed", autoNamespace: true }, undefined, "/tmp/work/my-project")).toBe("fixed");
});

// ── 命名空间写锁 ────────────────────────────────────────────────────────────

test("withNsWriteLock 可重入、执行后清理锁文件", () => {
	const root = join(memDir, "test");
	mkdirSync(root, { recursive: true });
	let inner = false;
	const out = withNsWriteLock(root, () => withNsWriteLock(root, () => { inner = true; return 42; }));
	expect(inner).toBe(true);
	expect(out).toBe(42);
	expect(existsSync(join(root, ".write.lock"))).toBe(false);
});

// ── 维护：判定与归一化分离 ──────────────────────────────────────────────────

test("exactNormalize 只做换行/行尾规范化，不折叠大小写与正文空白", () => {
	expect(exactNormalize("/srv/App")).not.toBe(exactNormalize("/srv/app"));
	expect(exactNormalize("a  b")).not.toBe(exactNormalize("a b"));
	expect(exactNormalize("x\r\ny  \n\n")).toBe(exactNormalize("x\ny"));
	// 检索归一化仍然折叠（两者语义不同）
	expect(normalizeText("/srv/App")).toBe(normalizeText("/srv/app"));
});
