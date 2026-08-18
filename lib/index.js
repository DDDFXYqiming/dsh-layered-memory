// dsh-layered-memory — DSH 跨会话长期记忆插件（v0.3）。
//
// 分层记忆（L0 元规则 / L1 索引 / L2 事实 / L3 SOP）+ 行动验证公理。
// v0.3 增强：
//   - 命名空间隔离：<memoryDir>/<namespace>/...，default 兼容旧根目录
//   - 溯源/审计：memory-meta.json 记录 sourceSession / sourceSeqs / createdAt / updatedAt
//   - 自动蒸馏：turn/end 把本回合成功工具调用写入 pending/ 候选区，memory_accept 确认后入正式记忆
//   - 冲突/过期：memory_update(supersede) / memory_archive / memory_rollback，旧版本保留在 .history/ 或 archive/
//
// 存储布局：namespace=default 兼容旧根目录，其余为 <memoryDir>/<namespace>/；
// 非 default 命名空间只初始化实际使用的子目录，不预创建未使用的根骨架。
//   memory_management_sop.md / index.txt / facts.md
//   sops/ / pending/ / archive/ / .history/
//   memory-meta.json / memory_stats.json / maintenance-report.json / file_access_stats.json
//
// 注入（存在性编码：L1 索引每轮可见）：
//   ctx.systemPrompt.context({ name: 'memory:index', order: 10,
//     text: () => readIndex() }) —— 每次组装请求实时读 L1。
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync, copyFileSync, rmSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { defineTool } from "@deepseek-ai/dsh-tools";
import Schema from "@deepseek-ai/schemastery";

const name = "layered-memory";
// [spec-audit 2026-08-14 修订] systemPrompt/agents 必须声明 inject：
// 实测 cordis ctx.get() 只查插件隔离层已登记的服务（可选依赖模式在本版本 cordis 不成立），
// 未 inject 时 ctx.get 恒返回 undefined，功能静默退化。
const inject = ["skills", "tools", "agents", "systemPrompt", "sessionQuery"];

const PLUGIN_DIR = dirname(fileURLToPath(import.meta.url));
const SKILL_MD = join(PLUGIN_DIR, "..", "SKILL.md");

/** Schemastery 配置 schema（官方 config 约定：加载期校验 + 默认值填充）。 */
export const Config = Schema.object({
	memoryDir: Schema.string().default(""),
	maxIndexLines: Schema.number().default(30),
	// [spec-audit 2026-08-14] 纯 boolean：非法配置在加载期响亮失败（config.md §Fail loudly）
	progressive: Schema.boolean().default(true),
	// v0.3 命名空间
	defaultNamespace: Schema.string().default(""),
	autoNamespace: Schema.boolean().default(true),
	// v0.3 自动蒸馏
	autoPending: Schema.boolean().default(true),
	// v0.4 自动维护
	maintainEveryTurns: Schema.number().default(20),
});

const L0_TEMPLATE = `# Memory Management SOP (L0)
## 核心公理
1. 行动验证原则：任何写入 L1/L2/L3 的信息必须源自【成功的工具调用结果】（实测/验证/确认）。严禁模型固有知识、推理猜测、未验证假设。口号：无行动，不记忆。
2. 神圣不可删改性：已验证的事实可以压缩文字、迁移层级，但严禁丢弃。supersede/archive 必须保留历史。
3. 禁止易变状态：时间戳、PID、临时 Session ID、一次性路径等高频变化数据不存。
4. 最小充分指针：上层只留能定位下层的短标识，多一词即冗余。

## 分层
- L1 index.txt：≤30 行。两层「场景关键词→记忆定位」映射 + RULES（红线规则/高频犯错点）。只写存在性，禁写 How-to 细节。
- L2 facts.md：环境特异性事实（路径/凭证引用/配置/实测参数）。按 ## SECTION 组织。
- L3 sops/*.md：特定任务经验（关键前置 + 典型坑 + 稳定步骤），尽可能短。
- pending/*.md：自动蒸馏候选区，未确认不进入正式记忆。
- 通用常识 / 易变状态 / 日志记录：严禁存储。

## 写入决策树
"这条信息该放哪层？"
- 环境特异性事实（路径/配置/凭证引用/实测参数）→ L2 facts.md
- 复杂任务经验（坑点/前置条件/稳定步骤，多次重试才成功且未来可用）→ L3 sop
- 通用操作规律（跨任务红线）→ L1 [RULES]（一句压缩）
- 其余（常识/易变/未验证）→ 不存
`;

const INDEX_TEMPLATE = `# [Memory Index - L1]
分层记忆: L0规则(memory_management_sop.md) | L1索引(this) | L2事实(facts.md) | L3技能(sops/) | 候选(pending/)
需要细节时用 memory_read / memory_list 取 L2/L3；新增经验用 memory_write（须带证据）
任务完成且【行动验证成功】时主动 memory_write 沉淀（无需等用户提醒；无验证信息则不写）
<!-- AUTO-BEGIN -->
[L2] （facts.md 的条目将在此列出）
[L3] （sops/ 的文件将在此列出）
<!-- AUTO-END -->
[RULES]
（红线规则：不提醒就会犯的错。词级维护，禁 overwrite）
`;

const FACTS_TEMPLATE = `# [Facts - L2]
按 ## SECTION 组织环境特异性事实。只写行动验证过的内容。
`;

const META_FILE = "memory-meta.json";
const PENDING_DIR = "pending";
const ARCHIVE_DIR = "archive";
const HISTORY_DIR = ".history";

function defaultMemDir() {
	return join(homedir(), ".dsh", "memory");
}

/** 命名空间安全化：只允许小写字母、数字、下划线、连字符。 */
function safeNs(value) {
	const s = String(value ?? "default").trim().toLowerCase()
		.replace(/[^a-z0-9_-]+/g, "-")
		.replace(/^-+|-+$/g, "");
	return s || "default";
}

/** namespace=default 时兼容旧根目录，其余使用 <memoryDir>/<namespace>/。 */
function nsRoot(memDir, ns) {
	const s = safeNs(ns);
	return s === "default" ? memDir : join(memDir, s);
}

/** 自动命名空间：workspace 目录名 + git 分支名（若可用）。 */
function detectNamespace() {
	try {
		const cwd = process.cwd();
		const base = basename(cwd) || "default";
		let branch = "";
		try {
			branch = execFileSync("git", ["branch", "--show-current"], {
				cwd,
				encoding: "utf8",
				stdio: ["ignore", "pipe", "ignore"],
				timeout: 2000,
			}).trim();
		} catch { /* 非 git 目录 */ }
		return safeNs(branch ? `${base}__${branch}` : base);
	} catch {
		return "default";
	}
}

function resolveNamespace(cfg, explicit) {
	if (explicit) return safeNs(explicit);
	if (cfg.defaultNamespace) return safeNs(cfg.defaultNamespace);
	if (cfg.autoNamespace) return detectNamespace();
	return "default";
}

/** 初始化命名空间目录结构（幂等，不覆盖已有内容）。 */
function ensureNamespaceLayout(root) {
	mkdirSync(root, { recursive: true });
	mkdirSync(join(root, "sops"), { recursive: true });
	mkdirSync(join(root, PENDING_DIR), { recursive: true });
	mkdirSync(join(root, ARCHIVE_DIR), { recursive: true });
	mkdirSync(join(root, HISTORY_DIR), { recursive: true });
	const seeds = [
		["memory_management_sop.md", L0_TEMPLATE],
		["index.txt", INDEX_TEMPLATE],
		["facts.md", FACTS_TEMPLATE],
	];
	for (const [file, content] of seeds) {
		const p = join(root, file);
		if (!existsSync(p)) writeFileSync(p, content, "utf8");
	}
}

/** 初始化指定命名空间（default 兼容旧根目录）。 */
function ensureMemoryLayout(memDir, namespace = "default") {
	ensureNamespaceLayout(nsRoot(memDir, namespace));
}

function readIndex(root) {
	try {
		return readFileSync(join(root, "index.txt"), "utf8");
	} catch {
		return "";
	}
}

function slugify(topic) {
	const s = String(topic).trim().toLowerCase()
		.replace(/[^\p{L}\p{N}]+/gu, "-")
		.replace(/^-+|-+$/g, "");
	return s.slice(0, 48) || "entry";
}

/** facts.md 的 section 名列表。 */
function factSections(root) {
	try {
		const text = readFileSync(join(root, "facts.md"), "utf8");
		const out = [];
		for (const line of text.split("\n")) {
			const m = line.match(/^##\s+(.+)$/);
			if (m) out.push(m[1].trim());
		}
		return out;
	} catch {
		return [];
	}
}

/** sops/ 的文件名列表（去 .md）。 */
function sopNames(root) {
	try {
		return readdirSync(join(root, "sops"))
			.filter((f) => f.endsWith(".md"))
			.map((f) => f.replace(/\.md$/, ""))
			.sort();
	} catch {
		return [];
	}
}

function pendingNames(root) {
	try {
		return readdirSync(join(root, PENDING_DIR))
			.filter((f) => f.endsWith(".md"))
			.sort();
	} catch {
		return [];
	}
}

function readMeta(root) {
	try {
		return JSON.parse(readFileSync(join(root, META_FILE), "utf8"));
	} catch {
		return { facts: {}, sops: {} };
	}
}

function writeMeta(root, meta) {
	writeFileSync(join(root, META_FILE), JSON.stringify(meta, null, 2), "utf8");
}

function getEntryMeta(root, kind, key) {
	const m = readMeta(root);
	return (kind === "fact" ? m.facts : m.sops)[key] || null;
}

function setEntryMeta(root, kind, key, patch) {
	const m = readMeta(root);
	const store = kind === "fact" ? m.facts : m.sops;
	const prev = store[key] || {};
	store[key] = {
		...prev,
		...patch,
		updatedAt: new Date().toISOString(),
	};
	writeMeta(root, m);
	return store[key];
}

function isArchived(root, kind, key) {
	return Boolean(getEntryMeta(root, kind, key)?.archived);
}

/** 确保 L1 固定段含常驻规则行、表述与最新模板一致（对已存在的旧索引也生效）。 */
function ensureIndexRule(root) {
	const p = join(root, "index.txt");
	if (!existsSync(p)) return;
	let cur = readFileSync(p, "utf8");
	cur = cur.replace("4层记忆: L0规则", "分层记忆: L0规则");
	cur = cur.replace("4层记忆", "分层记忆");
	if (cur.includes("任务完成且【行动验证成功】")) {
		if (cur !== readFileSync(p, "utf8")) writeFileSync(p, cur, "utf8");
		return;
	}
	const anchor = "新增经验用 memory_write（须带证据）";
	if (cur.includes(anchor)) {
		cur = cur.replace(anchor, anchor + "\n任务完成且【行动验证成功】时主动 memory_write 沉淀（无需等用户提醒；无验证信息则不写）");
	} else {
		cur = cur.replace("# [Memory Index - L1]", "# [Memory Index - L1]\n任务完成且【行动验证成功】时主动 memory_write 沉淀（无需等用户提醒；无验证信息则不写）");
	}
	writeFileSync(p, cur, "utf8");
}

const AUTO_BEGIN = "<!-- AUTO-BEGIN -->";
const AUTO_END = "<!-- AUTO-END -->";

/** 规范化索引布局空白：保留手动内容，只消除会挤占预算的多余空行。 */
function normalizeIndexWhitespace(text) {
	return String(text ?? "")
		.replace(/\r\n?/g, "\n")
		.replace(/[ \t]+\n/g, "\n")
		.replace(/\n{3,}/g, "\n\n")
		.replace(/^\n+|\n+$/g, "");
}

function countIndexLines(text) {
	const normalized = String(text ?? "").replace(/\r\n?/g, "\n").replace(/\n+$/, "");
	return normalized ? normalized.split("\n").length : 0;
}

/** 读取 AUTO 标记之外的头部与手动尾部，并规范化空白。 */
function readIndexSections(root) {
	const templateBegin = INDEX_TEMPLATE.indexOf(AUTO_BEGIN);
	const templateEnd = INDEX_TEMPLATE.indexOf(AUTO_END);
	let head = INDEX_TEMPLATE.slice(0, templateBegin);
	let tail = INDEX_TEMPLATE.slice(templateEnd + AUTO_END.length);
	try {
		const cur = readFileSync(join(root, "index.txt"), "utf8");
		const b = cur.indexOf(AUTO_BEGIN);
		const e = cur.indexOf(AUTO_END);
		if (b >= 0 && e > b) {
			head = cur.slice(0, b);
			tail = cur.slice(e + AUTO_END.length);
		} else if (cur.trim()) {
			head = cur;
			tail = "";
		}
	} catch { /* 用模板 */ }
	return {
		head: normalizeIndexWhitespace(head),
		tail: normalizeIndexWhitespace(tail),
	};
}

function buildAutoLines(facts, sops, hiddenFacts = 0, hiddenSops = 0) {
	const l2 = facts.length ? facts.map((f) => `[L2] ${f}`) : ["[L2] （空）"];
	const l3 = sops.length ? sops.map((s) => `[L3] sops/${s}.md`) : ["[L3] （空）"];
	if (hiddenFacts > 0) l2[l2.length - 1] += ` | 另有 ${hiddenFacts} 条，调用 memory_list 查看`;
	if (hiddenSops > 0) l3[l3.length - 1] += ` | 另有 ${hiddenSops} 条，调用 memory_list 查看`;
	return [...l2, ...l3];
}

function composeIndex(head, autoLines, tail) {
	const parts = [head, AUTO_BEGIN, autoLines.join("\n"), AUTO_END];
	if (tail) parts.push(tail);
	return parts.join("\n") + "\n";
}

function activeEntries(root) {
	return {
		facts: factSections(root).filter((f) => !isArchived(root, "fact", f)),
		sops: sopNames(root).filter((s) => !isArchived(root, "sop", s)),
	};
}

/** 重建 index.txt 的自动段（活跃 L2 + L3），过滤 archived；保留并清理 RULES 手动段。 */
function syncIndex(root, maxIndexLines = 30) {
	const p = join(root, "index.txt");
	const { head, tail } = readIndexSections(root);
	const { facts, sops } = activeEntries(root);
	const rebuilt = composeIndex(head, buildAutoLines(facts, sops), tail);
	writeFileSync(p, rebuilt, "utf8");
	const lines = countIndexLines(rebuilt);
	return { index_lines: lines, max_index_lines: maxIndexLines, over_limit: lines > maxIndexLines };
}

/** upsert facts.md 的 ## SECTION（基于行解析，避免正则边界坑）。 */
function upsertFact(root, topic, content) {
	const p = join(root, "facts.md");
	const text = existsSync(p) ? readFileSync(p, "utf8") : FACTS_TEMPLATE;
	const lines = text.split("\n");
	let start = -1;
	let end = lines.length;
	for (let i = 0; i < lines.length; i++) {
		if (lines[i].startsWith("## ")) {
			if (start >= 0) { end = i; break; }
			if (lines[i].slice(3).trim() === topic) start = i;
		}
	}
	if (start >= 0) {
		const updated = [...lines.slice(0, start), `## ${topic}`, content, "", ...lines.slice(end)];
		writeFileSync(p, updated.join("\n"), "utf8");
		return "updated";
	}
	writeFileSync(p, text.replace(/\s*$/, "\n") + `## ${topic}\n${content}\n\n`, "utf8");
	return "created";
}

/** 记忆名称安全校验：拒绝绝对路径与任何 ".." 路径段（防记忆目录穿越，spec-audit 2026-08-14）。 */
function isSafeMemName(value) {
	if (/^[a-zA-Z]:[\\/]/.test(value)) return false;
	if (value.split(/[\\/]/).includes("..")) return false;
	return true;
}

/** 读取 facts.md 的指定 section。 */
function readFact(root, topic) {
	const text = existsSync(join(root, "facts.md")) ? readFileSync(join(root, "facts.md"), "utf8") : "";
	const lines = text.split("\n");
	let inSection = false;
	const out = [];
	for (const line of lines) {
		if (line.startsWith("## ")) {
			if (inSection) break;
			if (line.slice(3).trim() === topic) { inSection = true; continue; }
		}
		if (inSection) out.push(line);
	}
	return inSection ? out.join("\n").trim() : null;
}

/** 读取 sop 文件全文。 */
function readSop(root, slug) {
	const p = join(root, "sops", `${slug}.md`);
	return existsSync(p) ? readFileSync(p, "utf8") : null;
}

/** 记录读取热度（GA file_access_stats 简化版）。 */
function bumpAccess(root, key) {
	try {
		const p = join(root, "file_access_stats.json");
		const stats = existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : {};
		stats[key] = (stats[key] ?? 0) + 1;
		writeFileSync(p, JSON.stringify(stats, null, 2), "utf8");
	} catch { /* 热度统计失败不影响主流程 */ }
}

/** 写入正式记忆（fact/sop），带溯源 meta。 */
function writeMemory(root, { topic, entryType, content, evidence, sourceSession, sourceSeqs, namespace }) {
	const safeTopic = String(topic).trim();
	const body = `${String(content).trim()}\n\n> 证据: ${evidence}\n`;
	let path;
	let action;
	if (entryType === "fact") {
		path = join(root, "facts.md");
		action = upsertFact(root, safeTopic, body.trim());
		setEntryMeta(root, "fact", safeTopic, {
			sourceSession: sourceSession || null,
			sourceSeqs: Array.isArray(sourceSeqs) ? sourceSeqs.map(Number).filter(Number.isFinite) : [],
			evidence: evidence || "",
			namespace: namespace || null,
			archived: getEntryMeta(root, "fact", safeTopic)?.archived || false,
		});
	} else {
		const slug = slugify(safeTopic);
		path = join(root, "sops", `${slug}.md`);
		const header = `# ${safeTopic}\n\n`;
		if (existsSync(path)) {
			writeFileSync(path, header + body, "utf8");
			action = "updated";
		} else {
			writeFileSync(path, header + body, "utf8");
			action = "created";
		}
		setEntryMeta(root, "sop", slug, {
			sourceSession: sourceSession || null,
			sourceSeqs: Array.isArray(sourceSeqs) ? sourceSeqs.map(Number).filter(Number.isFinite) : [],
			evidence: evidence || "",
			namespace: namespace || null,
			archived: getEntryMeta(root, "sop", slug)?.archived || false,
		});
	}
	const index = syncIndex(root);
	return { entry_type: entryType, topic: safeTopic, path, action, index };
}

/** 生成 pending 候选文件内容。 */
function pendingContent({ sourceSession, sourceSeqs, tools, reason }) {
	const lines = [
		"# Pending Memory Candidate",
		"",
		`- sourceSession: ${sourceSession || ""}`,
		`- sourceSeqs: ${Array.isArray(sourceSeqs) && sourceSeqs.length ? JSON.stringify(sourceSeqs) : ""}`,
		`- capturedAt: ${new Date().toISOString()}`,
		`- tools: ${(tools || []).join(", ")}`,
		"",
		reason || "本回合有成功工具调用，可能值得沉淀。请用 memory_accept 确认或丢弃。",
		"",
	];
	return lines.join("\n");
}

/** 写入 pending 候选。 */
function writePending(root, { sourceSession, sourceSeqs, tools, reason }) {
	const fileName = `pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.md`;
	const p = join(root, PENDING_DIR, fileName);
	writeFileSync(p, pendingContent({ sourceSession, sourceSeqs, tools, reason }), "utf8");
	return fileName;
}

/** 读取 pending 候选。 */
function readPending(root, name) {
	const p = join(root, PENDING_DIR, name);
	if (!existsSync(p)) return null;
	const text = readFileSync(p, "utf8");
	const m = text.match(/^# Pending Memory Candidate[\s\S]*$/);
	return m ? text : null;
}

/** 从 pending 文件解析简单字段。 */
function parsePending(text) {
	const out = {};
	const session = text.match(/^- sourceSession: (.+)$/m);
	const seqs = text.match(/^- sourceSeqs: (.+)$/m);
	const tools = text.match(/^- tools: (.+)$/m);
	if (session) out.sourceSession = session[1].trim();
	if (seqs && seqs[1].trim()) {
		try { out.sourceSeqs = JSON.parse(seqs[1].trim()); } catch { out.sourceSeqs = []; }
	}
	if (tools) out.tools = tools[1].split(",").map((s) => s.trim()).filter(Boolean);
	return out;
}

function hashText(text) {
	return createHash("sha256").update(String(text || "")).digest("hex").slice(0, 16);
}

function loadAccess(root) {
	try {
		return JSON.parse(readFileSync(join(root, "file_access_stats.json"), "utf8"));
	} catch {
		return {};
	}
}

function readStatsFile(root) {
	try {
		return JSON.parse(readFileSync(join(root, "memory_stats.json"), "utf8"));
	} catch {
		return {};
	}
}

function writeStatsFile(root, stats) {
	writeFileSync(join(root, "memory_stats.json"), JSON.stringify(stats, null, 2), "utf8");
}

function computeNamespaceStats(root) {
	const facts = factSections(root).filter((f) => !isArchived(root, "fact", f));
	const sops = sopNames(root).filter((s) => !isArchived(root, "sop", s));
	const archivedFacts = factSections(root).filter((f) => isArchived(root, "fact", f));
	const archivedSops = sopNames(root).filter((s) => isArchived(root, "sop", s));
	const pending = pendingNames(root);
	let sizeBytes = 0;
	for (const f of ["index.txt", "facts.md", "memory_management_sop.md"]) {
		try { sizeBytes += statSync(join(root, f)).size; } catch { /* 忽略 */ }
	}
	try {
		for (const f of readdirSync(join(root, "sops"))) sizeBytes += statSync(join(root, "sops", f)).size;
	} catch { /* 忽略 */ }
	try {
		for (const f of readdirSync(join(root, PENDING_DIR))) sizeBytes += statSync(join(root, PENDING_DIR, f)).size;
	} catch { /* 忽略 */ }
	return {
		facts: facts.length,
		sops: sops.length,
		pending: pending.length,
		archived: archivedFacts.length + archivedSops.length,
		size_bytes: sizeBytes,
		updatedAt: new Date().toISOString(),
	};
}

/** 去重：按内容 hash 检测重复 fact/sop，重复项归档并保留 citation（不物理删除）。 */
function dedupeEntries(root) {
	const report = { removed: [], merged: [] };
	const seenSops = new Map();
	for (const slug of sopNames(root)) {
		if (isArchived(root, "sop", slug)) continue;
		const content = readSop(root, slug);
		if (content === null) continue;
		const h = hashText(content.replace(/\s+/g, " ").trim());
		if (seenSops.has(h)) {
			const prev = seenSops.get(h);
			const ts = Date.now();
			try {
				copyFileSync(join(root, "sops", `${slug}.md`), join(root, ARCHIVE_DIR, `sop-${slug}-${ts}.md`));
			} catch { /* 忽略 */ }
			setEntryMeta(root, "sop", slug, { archived: true, duplicateOf: prev, archivedAt: new Date().toISOString() });
			report.removed.push(`sop:${slug} -> duplicate of ${prev}`);
		} else {
			seenSops.set(h, slug);
		}
	}
	const seenFacts = new Map();
	for (const topic of factSections(root)) {
		if (isArchived(root, "fact", topic)) continue;
		const content = readFact(root, topic);
		if (content === null) continue;
		const h = hashText(content.replace(/\s+/g, " ").trim());
		if (seenFacts.has(h)) {
			const prev = seenFacts.get(h);
			const ts = Date.now();
			try {
				writeFileSync(join(root, ARCHIVE_DIR, `fact-${slugify(topic)}-${ts}.md`), `# ${topic}\n\n${content}\n`, "utf8");
			} catch { /* 忽略 */ }
			setEntryMeta(root, "fact", topic, { archived: true, duplicateOf: prev, archivedAt: new Date().toISOString() });
			report.removed.push(`fact:${topic} -> duplicate of ${prev}`);
		} else {
			seenFacts.set(h, topic);
		}
	}
	return report;
}

/**
 * 压缩 L1 索引：只有完整索引超过 maxIndexLines 时才按访问热度裁剪。
 * 实际记忆文件不删除；被裁剪的层仍保留隐藏数量提示，避免完全不可发现。
 */
function compressIndexEntries(root, maxLines) {
	const { facts: allFacts, sops: allSops } = activeEntries(root);
	const access = loadAccess(root);
	const rank = (kind) => (a, b) => {
		const heat = (access[`${kind}:${b}`] || 0) - (access[`${kind}:${a}`] || 0);
		return heat || String(a).localeCompare(String(b));
	};
	const facts = [...allFacts].sort(rank("fact"));
	const sops = [...allSops].sort(rank("sop"));
	const { head, tail } = readIndexSections(root);
	const fixedLines = countIndexLines(head) + countIndexLines(tail) + 2;
	const fullLines = buildAutoLines(facts, sops);
	const fullIndex = composeIndex(head, fullLines, tail);
	const totalLines = countIndexLines(fullIndex);

	// 未超限时也写回规范化后的完整索引，但绝不裁剪条目。
	if (totalLines <= maxLines) {
		writeFileSync(join(root, "index.txt"), fullIndex, "utf8");
		return {
			facts_kept: facts.length,
			sops_kept: sops.length,
			total_facts: facts.length,
			total_sops: sops.length,
			facts_hidden: 0,
			sops_hidden: 0,
			compressed: false,
		};
	}

	const nonEmptyLayers = (facts.length ? 1 : 0) + (sops.length ? 1 : 0);
	// 预算不足时优先保留每个非空层至少一个指针；手动 RULES 过长时允许报告 over_limit，
	// 也不能用丢失整个 L3 指针来伪造“符合上限”。
	const available = Math.max(nonEmptyLayers, maxLines - fixedLines);
	let factCount = facts.length ? 1 : 0;
	let sopCount = sops.length ? 1 : 0;
	let remaining = Math.max(0, available - factCount - sopCount);
	const candidates = [
		...facts.slice(factCount).map((topic) => ({ kind: "fact", topic, score: access[`fact:${topic}`] || 0 })),
		...sops.slice(sopCount).map((slug) => ({ kind: "sop", topic: slug, score: access[`sop:${slug}`] || 0 })),
	].sort((a, b) => (b.score - a.score) || a.kind.localeCompare(b.kind) || a.topic.localeCompare(b.topic));
	for (const candidate of candidates) {
		if (remaining <= 0) break;
		if (candidate.kind === "fact") factCount++;
		else sopCount++;
		remaining--;
	}
	const keptFacts = facts.slice(0, factCount);
	const keptSops = sops.slice(0, sopCount);
	const hiddenFacts = facts.length - keptFacts.length;
	const hiddenSops = sops.length - keptSops.length;
	const autoLines = buildAutoLines(keptFacts, keptSops, hiddenFacts, hiddenSops);
	writeFileSync(join(root, "index.txt"), composeIndex(head, autoLines, tail), "utf8");
	return {
		facts_kept: keptFacts.length,
		sops_kept: keptSops.length,
		total_facts: facts.length,
		total_sops: sops.length,
		facts_hidden: hiddenFacts,
		sops_hidden: hiddenSops,
		compressed: true,
	};
}

/** 寻找可合并的 SOP 候选（仅报告，需模型/用户确认后真正合并）。 */
function findMergeCandidates(root) {
	const names = sopNames(root).filter((s) => !isArchived(root, "sop", s));
	const candidates = [];
	for (let i = 0; i < names.length; i++) {
		for (let j = i + 1; j < names.length; j++) {
			const a = names[i];
			const b = names[j];
			const wordsA = a.replace(/[-_]/g, " ").toLowerCase().split(" ").filter(Boolean);
			const wordsB = b.replace(/[-_]/g, " ").toLowerCase().split(" ").filter(Boolean);
			const common = wordsA.filter((w) => wordsB.includes(w)).length;
			if (common < 1) continue;
			const contentA = (readSop(root, a) || "").replace(/\s+/g, " ").trim();
			const contentB = (readSop(root, b) || "").replace(/\s+/g, " ").trim();
			const similarity = contentA === contentB ? 1 : 0;
			if (similarity > 0 || common >= 2) {
				candidates.push({ a, b, common_words: common, similarity });
			}
		}
	}
	return candidates.slice(0, 20);
}

/** 执行一次完整维护：去重 + 压缩索引 + 统计 + 合并候选。 */
function runMaintain(root, maxLines) {
	const dedupe = dedupeEntries(root);
	const compress = compressIndexEntries(root, maxLines);
	const stats = computeNamespaceStats(root);
	const mergeCandidates = findMergeCandidates(root);
	const report = {
		runAt: new Date().toISOString(),
		dedupe,
		compress,
		stats,
		mergeCandidates,
	};
	writeFileSync(join(root, "maintenance-report.json"), JSON.stringify(report, null, 2), "utf8");
	writeStatsFile(root, stats);
	// compressIndexEntries 已写入压缩后的索引；这里不调用 syncIndex，避免把压缩结果覆盖回全量。
	return report;
}

// [fix 2026-08-15] apply 体内无 await，去掉 async：同步返回 disposer，cordis runner.collect 直接收集
function apply(ctx, config = {}) {
	const cfg = {
		memoryDir: config.memoryDir || defaultMemDir(),
		maxIndexLines: config.maxIndexLines ?? 30,
		progressive: config.progressive !== false,
		defaultNamespace: config.defaultNamespace || "",
		autoNamespace: config.autoNamespace !== false,
		autoPending: config.autoPending !== false,
		maintainEveryTurns: config.maintainEveryTurns ?? 20,
	};
	// 只初始化当前实际命名空间；不要把未使用的 memoryDir 根目录伪装成第二个 namespace。
	ensureNamespaceLayout(nsRoot(cfg.memoryDir, resolveNamespace(cfg)));

	const disposers = [];
	const agentStates = new Map();
	const turnCounters = new Map();
	const toolBuffers = new Map();

	// ── 记忆注入（L1 存在性索引每轮可见，缓存友好：快照追加式）──
	const sysPrompt = ctx.get("systemPrompt");
	if (sysPrompt) {
		disposers.push(sysPrompt.context({
			name: "memory:index",
			order: 10,
			text: () => {
				const ns = resolveNamespace(cfg);
				const root = nsRoot(cfg.memoryDir, ns);
				ensureNamespaceLayout(root);
				const idx = readIndex(root);
				return idx.trim() ? idx : "";
			}
		}));
	}

	// ── 自动蒸馏 + 周期提醒 ──
	const agentsService = ctx.get("agents");
	disposers.push(ctx.on("session/event", (session, event) => {
		if (!event || event.type !== "turn/end") return undefined;
		const id = String(session?.id ?? "");
		if (!id) return undefined;
		const n = (turnCounters.get(id) ?? 0) + 1;
		turnCounters.set(id, n);
		// 自动蒸馏：把本回合成功工具调用写入 pending/ 候选区（不直接进正式记忆）
		if (cfg.autoPending) {
			const buffer = toolBuffers.get(id) || [];
			if (buffer.length > 0) {
				try {
					const ns = resolveNamespace(cfg);
					const root = nsRoot(cfg.memoryDir, ns);
					ensureNamespaceLayout(root);
					writePending(root, {
						sourceSession: id,
						sourceSeqs: typeof event?.seq === "number" ? [event.seq] : [],
						tools: buffer.map((b) => b.tool),
						reason: `本回合有 ${buffer.length} 个成功工具调用（${buffer.map((b) => b.tool).join(", ")}），可能值得沉淀。请用 memory_accept 确认后入正式记忆，或直接忽略。`,
					});
				} catch { /* 候选写入失败不影响主流程 */ }
				toolBuffers.delete(id);
			}
		}
		// 自动维护：低频率触发去重/压缩/统计/合并候选
		if (cfg.maintainEveryTurns > 0 && n % cfg.maintainEveryTurns === 0) {
			try {
				const ns = resolveNamespace(cfg);
				const root = nsRoot(cfg.memoryDir, ns);
				ensureNamespaceLayout(root);
				runMaintain(root, cfg.maxIndexLines);
			} catch { /* 维护失败不影响主流程 */ }
		}
		if (n % 10 !== 0) return undefined;
		const agent = agentsService?.get?.(id);
		if (!agent || typeof agent.inject !== "function") return undefined;
		try {
			agent.inject({
				content: [{
					type: "text",
					text: "[记忆检查] 已完成 10 轮。本任务是否产生了【行动验证成功】且未来可复用的经验？若有请用 memory_write 沉淀（须带 evidence）；若有 pending 候选可先 memory_pending 查看。"
				}],
				source: { kind: "plugin", plugin: "memory" }
			});
		} catch { /* agent 已 dispose 时忽略 */ }
		return undefined;
	}));
	disposers.push(ctx.on("tools/result", (exec, result) => {
		// 激活 memory skill 的既有逻辑
		if (!result?.isError
			&& exec?.name === "skill"
			&& exec?.agent
			&& exec?.arguments
			&& exec.arguments.name === "memory") {
			activate(exec.agent);
		}
		// 自动蒸馏缓冲：记录成功工具调用
		if (cfg.autoPending && !result?.isError && exec?.agent?.id) {
			const id = String(exec.agent.id);
			const arr = toolBuffers.get(id) || [];
			arr.push({ tool: exec.name || "unknown", time: Date.now() });
			toolBuffers.set(id, arr);
		}
		return undefined;
	}));
	disposers.push(ctx.on("agent/disposed", ({ agent }) => {
		if (agent) {
			turnCounters.delete(String(agent.id));
			toolBuffers.delete(String(agent.id));
		}
		return undefined;
	}));

	// ── 运行时 skill ──
	const skillDisposer = ctx.skills.register({
		name: "memory",
		description: "跨会话长期记忆：读写经验 SOP 与环境事实。当任务涉及本机环境、工具配置、以前踩过的坑，或任务完成发现值得沉淀的验证经验时使用。",
		whenToUse: "新任务开始时需要历史经验/环境事实；任务完成且存在行动验证成功、未来可复用的信息（写入）；记忆索引需要同步；pending 候选需要确认",
		source: "runtime",
		content: readFileSync(SKILL_MD, "utf8").replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "")
	});
	if (typeof skillDisposer === "function") disposers.push(skillDisposer);

	// ── 工具定义 ──
	const readTool = defineTool({
		name: "memory_read",
		description: "读取记忆内容：支持 L1 索引全文（name=index）、L2 事实条目（name=<topic>，匹配 facts.md 的 ## section）、L3 SOP（name=<sop文件名>，匹配 sops/<name>.md）。可选 namespace 隔离项目。返回内容与来源路径及溯源信息。",
		parameters: {
			name: {
				type: "string",
				required: true,
				description: "记忆名称：index / facts 的 section 主题 / sop 文件名（不带 .md）"
			},
			namespace: {
				type: "string",
				description: "命名空间（默认取 workspace/git 分支或配置 defaultNamespace）"
			}
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					name: { type: "string", required: true },
					source: { type: "string", required: true },
					content: { type: "string", required: true },
					namespace: { type: "string", required: true },
					meta: {
						type: "object",
						additionalProperties: true,
						properties: {
							sourceSession: { type: "string" },
							sourceSeqs: { type: "array", items: { type: "integer" } },
							evidence: { type: "string" },
							archived: { type: "boolean" },
							createdAt: { type: "string" },
							updatedAt: { type: "string" }
						}
					},
					not_found: { type: "boolean" }
				}
			},
			render: (_args, value) => [{
				type: "text",
				text: value.not_found
					? `记忆「${value.name}」未找到（可用 memory_list 查看全部）`
					: `记忆「${value.name}」（来源: ${value.source}, namespace: ${value.namespace}${value.meta?.archived ? ", 已归档" : ""}）：\n\n${value.content}`
			}]
		},
		async execute(args) {
			const key = String(args.name).trim();
			const ns = resolveNamespace(cfg, args.namespace);
			const root = nsRoot(cfg.memoryDir, ns);
			ensureNamespaceLayout(root);
			if (!isSafeMemName(key)) {
				throw new Error(`memory_read: 非法名称（不允许路径穿越/绝对路径）: ${key}`);
			}
			const lower = key.toLowerCase();
			if (lower === "index" || lower === "l1" || lower === "索引") {
				bumpAccess(root, "index");
				return {
					name: key,
					source: "index.txt",
					content: readIndex(root),
					namespace: ns,
					meta: { sourceSession: "", sourceSeqs: [], evidence: "", archived: false, createdAt: "", updatedAt: "" },
				};
			}
			const candidates = [key, slugify(key)];
			for (const c of candidates) {
				const sopPath = join(root, "sops", `${c}.md`);
				if (existsSync(sopPath)) {
					const m = getEntryMeta(root, "sop", c) || {};
					if (m.archived) {
						return { name: key, source: "", content: "", namespace: ns, meta: { sourceSession: "", sourceSeqs: [], evidence: "", archived: true, createdAt: "", updatedAt: "" }, not_found: true };
					}
					bumpAccess(root, `sop:${c}`);
					return {
						name: key,
						source: `sops/${c}.md`,
						content: readFileSync(sopPath, "utf8"),
						namespace: ns,
						meta: {
							sourceSession: m.sourceSession || "",
							sourceSeqs: m.sourceSeqs || [],
							evidence: m.evidence || "",
							archived: Boolean(m.archived),
							createdAt: m.createdAt || "",
							updatedAt: m.updatedAt || "",
						},
					};
				}
			}
			const fact = readFact(root, key);
			if (fact !== null) {
				const m = getEntryMeta(root, "fact", key) || {};
				if (m.archived) {
					return { name: key, source: "", content: "", namespace: ns, meta: { sourceSession: "", sourceSeqs: [], evidence: "", archived: true, createdAt: "", updatedAt: "" }, not_found: true };
				}
				bumpAccess(root, `fact:${key}`);
				return {
					name: key,
					source: "facts.md",
					content: fact,
					namespace: ns,
					meta: {
						sourceSession: m.sourceSession || "",
						sourceSeqs: m.sourceSeqs || [],
						evidence: m.evidence || "",
						archived: Boolean(m.archived),
						createdAt: m.createdAt || "",
						updatedAt: m.updatedAt || "",
					},
				};
			}
			if (key.includes("sops/")) {
				const p = join(root, key);
				if (existsSync(p)) {
					const slug = basename(p).replace(/\.md$/, "");
					if (isArchived(root, "sop", slug)) {
						return { name: key, source: "", content: "", namespace: ns, meta: { sourceSession: "", sourceSeqs: [], evidence: "", archived: true, createdAt: "", updatedAt: "" }, not_found: true };
					}
					return { name: key, source: key, content: readFileSync(p, "utf8"), namespace: ns, meta: { sourceSession: "", sourceSeqs: [], evidence: "", archived: false, createdAt: "", updatedAt: "" } };
				}
			}
			return { name: key, source: "", content: "", namespace: ns, meta: { sourceSession: "", sourceSeqs: [], evidence: "", archived: false, createdAt: "", updatedAt: "" }, not_found: true };
		},
		presentCall(args) {
			return { card: "generic", title: `读取记忆 ${args.name}`, kind: "read" };
		}
	});

	const listTool = defineTool({
		name: "memory_list",
		description: "列出记忆：L2 facts 条目 + L3 SOP 文件 + pending 候选数 + L1 索引行数。可选 namespace。",
		parameters: {
			namespace: {
				type: "string",
				description: "命名空间（默认取 workspace/git 分支或配置 defaultNamespace）"
			}
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					namespace: { type: "string", required: true },
					index_lines: { type: "integer", required: true },
					facts: { type: "array", items: { type: "string" }, required: true },
					sops: { type: "array", items: { type: "string" }, required: true },
					pending: { type: "array", items: { type: "string" }, required: true }
				}
			},
			render: (_args, value) => [{
				type: "text",
				text: `记忆库[${value.namespace}]（${value.index_lines} 行索引）\nL2 事实: ${value.facts.join("、") || "（空）"}\nL3 SOP: ${value.sops.join("、") || "（空）"}\nPending: ${value.pending.join("、") || "（空）"}`
			}]
		},
		execute(args) {
			const ns = resolveNamespace(cfg, args.namespace);
			const root = nsRoot(cfg.memoryDir, ns);
			ensureNamespaceLayout(root);
			const facts = factSections(root).filter((f) => !isArchived(root, "fact", f));
			const sops = sopNames(root).filter((s) => !isArchived(root, "sop", s));
			const pending = pendingNames(root);
			const lines = readIndex(root).split("\n").length;
			return { namespace: ns, index_lines: lines, facts, sops, pending };
		},
		presentCall() {
			return { card: "generic", title: "列出记忆", kind: "read" };
		}
	});

	const writeTool = defineTool({
		name: "memory_write",
		description: "写入跨会话记忆（行动验证公理：evidence 必填，只写【成功验证过】的信息）。entry_type=fact 存 L2 环境事实；entry_type=sop 存 L3 任务经验。可选 namespace 隔离项目；可选 sourceSession/sourceSeqs 记录溯源。写入后自动同步 L1 索引。",
		parameters: {
			topic: {
				type: "string",
				required: true,
				description: "记忆主题（fact 的 section 名 / sop 的文件名，简短自解释）"
			},
			entry_type: {
				type: "string",
				enum: ["fact", "sop"],
				required: true,
				description: "fact=环境事实(L2) / sop=任务经验(L3)"
			},
			content: {
				type: "string",
				required: true,
				description: "记忆内容：fact 用要点列表；sop 用「关键前置 + 典型坑 + 稳定步骤」精简格式，尽可能短"
			},
			evidence: {
				type: "string",
				required: true,
				description: "验证证据：本次成功验证该信息的工具调用/实测结果（行动验证公理：无行动，不记忆）。没有验证证据就不要调用本工具"
			},
			namespace: {
				type: "string",
				description: "命名空间（默认取 workspace/git 分支或配置 defaultNamespace）"
			},
			sourceSession: {
				type: "string",
				description: "来源 session id（溯源用，通常由插件自动填充）"
			},
			sourceSeqs: {
				type: "array",
				items: { type: "integer" },
				description: "来源事件 seq 列表（溯源用）"
			}
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					entry_type: { type: "string", required: true },
					topic: { type: "string", required: true },
					path: { type: "string", required: true },
					namespace: { type: "string", required: true },
					action: { type: "string", required: true },
					index: {
						type: "object",
						additionalProperties: false,
						properties: {
							index_lines: { type: "integer" },
							max_index_lines: { type: "integer" },
							over_limit: { type: "boolean" }
						}
					}
				}
			},
			render: (_args, value) => [{
				type: "text",
				text: `✅ 已${value.action === "created" ? "新建" : "更新"}记忆「${value.topic}」（${value.entry_type === "fact" ? "L2 事实" : "L3 SOP"}）→ ${value.path} [${value.namespace}]${value.index?.over_limit ? "\n⚠️ L1 索引超过限制，建议运行 memory_index 或 memory_maintain" : ""}`
			}]
		},
		async execute(args) {
			const topic = String(args.topic).trim();
			const type = args.entry_type === "fact" ? "fact" : "sop";
			const content = String(args.content).trim();
			const evidence = String(args.evidence ?? "").trim();
			if (!topic || !content) throw new Error("memory_write: topic 与 content 必填");
			if (!evidence) {
				throw new Error("memory_write: evidence 必填（行动验证公理：无行动，不记忆）。请提供本次成功验证该信息的工具调用/实测证据，或取消写入。");
			}
			const ns = resolveNamespace(cfg, args.namespace);
			const root = nsRoot(cfg.memoryDir, ns);
			ensureNamespaceLayout(root);
			const r = writeMemory(root, {
				topic,
				entryType: type,
				content,
				evidence,
				sourceSession: args.sourceSession || null,
				sourceSeqs: args.sourceSeqs || [],
				namespace: ns,
			});
			return { entry_type: type, topic, path: r.path, namespace: ns, action: r.action, index: r.index };
		},
		presentCall(args) {
			return { card: "generic", title: `写入记忆 ${args.topic}`, kind: "execute" };
		}
	});

	const indexTool = defineTool({
		name: "memory_index",
		description: "重建 L1 索引的自动段（活跃 L2 facts + L3 sops，过滤已归档），保留 [RULES] 手动段。在手动改动记忆文件后使用。可选 namespace。",
		parameters: {
			namespace: {
				type: "string",
				description: "命名空间"
			}
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					namespace: { type: "string", required: true },
					index_lines: { type: "integer", required: true },
					over_limit: { type: "boolean", required: true },
					facts: { type: "array", items: { type: "string" }, required: true },
					sops: { type: "array", items: { type: "string" }, required: true }
				}
			},
			render: (_args, value) => [{
				type: "text",
				text: `索引已重建[${value.namespace}]（${value.index_lines} 行${value.over_limit ? "，⚠️ 超过限制建议精简" : ""}）：\nL2: ${value.facts.join("、") || "（空）"}\nL3: ${value.sops.join("、") || "（空）"}`
			}]
		},
		execute(args) {
			const ns = resolveNamespace(cfg, args.namespace);
			const root = nsRoot(cfg.memoryDir, ns);
			ensureNamespaceLayout(root);
			const r = syncIndex(root, cfg.maxIndexLines);
			return { namespace: ns, index_lines: r.index_lines, over_limit: r.over_limit, facts: factSections(root).filter((f) => !isArchived(root, "fact", f)), sops: sopNames(root).filter((s) => !isArchived(root, "sop", s)) };
		},
		presentCall() {
			return { card: "generic", title: "重建记忆索引", kind: "execute" };
		}
	});

	const statsTool = defineTool({
		name: "memory_stats",
		description: "查看记忆库统计：各命名空间条目数、pending 数、归档数、总大小。可选 namespace。",
		parameters: {
			namespace: {
				type: "string",
				description: "命名空间"
			}
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					namespace: { type: "string", required: true },
					stats: {
						type: "object",
						additionalProperties: false,
						properties: {
							facts: { type: "integer", required: true },
							sops: { type: "integer", required: true },
							pending: { type: "integer", required: true },
							archived: { type: "integer", required: true },
							size_bytes: { type: "integer", required: true },
							updatedAt: { type: "string", required: true }
						},
						required: true
					}
				}
			},
			render: (_args, value) => [{
				type: "text",
				text: `统计[${value.namespace}]：L2=${value.stats.facts} L3=${value.stats.sops} pending=${value.stats.pending} archived=${value.stats.archived} size=${value.stats.size_bytes}B`
			}]
		},
		execute(args) {
			const ns = resolveNamespace(cfg, args.namespace);
			const root = nsRoot(cfg.memoryDir, ns);
			ensureNamespaceLayout(root);
			return { namespace: ns, stats: computeNamespaceStats(root) };
		},
		presentCall() {
			return { card: "generic", title: "查看记忆统计", kind: "read" };
		}
	});

	const maintainTool = defineTool({
		name: "memory_maintain",
		description: "执行记忆库维护：去重（重复项归档保留 citation）、压缩 L1 索引（按访问热度保留活跃条目）、生成统计、产出可合并 SOP 候选（需人工/模型确认）。可选 namespace。",
		parameters: {
			namespace: {
				type: "string",
				description: "命名空间"
			}
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					namespace: { type: "string", required: true },
					report: {
						type: "object",
						additionalProperties: true,
						properties: {
							runAt: { type: "string" },
							dedupe: { type: "object", additionalProperties: true },
							compress: { type: "object", additionalProperties: true },
							stats: { type: "object", additionalProperties: true },
							mergeCandidates: { type: "array", items: { type: "object", additionalProperties: true } }
						},
						required: true
					}
				}
			},
			render: (_args, value) => [{
				type: "text",
				text: `维护完成[${value.namespace}]：去重移除 ${value.report.dedupe?.removed?.length || 0} 条，索引保留 L2=${value.report.compress?.facts_kept || 0}/${value.report.compress?.total_facts || 0} L3=${value.report.compress?.sops_kept || 0}/${value.report.compress?.total_sops || 0}${(value.report.compress?.facts_hidden || value.report.compress?.sops_hidden) ? `（隐藏 L2=${value.report.compress?.facts_hidden || 0}、L3=${value.report.compress?.sops_hidden || 0}，可用 memory_list 查看）` : ""}，合并候选 ${value.report.mergeCandidates?.length || 0} 组`
			}]
		},
		execute(args) {
			const ns = resolveNamespace(cfg, args.namespace);
			const root = nsRoot(cfg.memoryDir, ns);
			ensureNamespaceLayout(root);
			const report = runMaintain(root, cfg.maxIndexLines);
			return { namespace: ns, report };
		},
		presentCall() {
			return { card: "generic", title: "执行记忆维护", kind: "execute" };
		}
	});

	const pendingTool = defineTool({
		name: "memory_pending",
		description: "列出自动蒸馏候选（pending/）：本回合成功工具调用自动生成，尚未进入正式记忆。用 memory_accept 确认入记忆，或忽略。可选 namespace。",
		parameters: {
			namespace: {
				type: "string",
				description: "命名空间"
			}
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					namespace: { type: "string", required: true },
					pending: {
						type: "array",
						items: {
							type: "object",
							additionalProperties: false,
							properties: {
								name: { type: "string", required: true },
								content: { type: "string", required: true }
							}
						},
						required: true
					}
				}
			},
			render: (_args, value) => [{
				type: "text",
				text: `Pending[${value.namespace}]：\n` + value.pending.map((p) => `- ${p.name}: ${p.content.split("\n").slice(-1)[0] || ""}`).join("\n") || "（空）"
			}]
		},
		execute(args) {
			const ns = resolveNamespace(cfg, args.namespace);
			const root = nsRoot(cfg.memoryDir, ns);
			ensureNamespaceLayout(root);
			const pending = pendingNames(root).map((f) => ({ name: f, content: readPending(root, f) || "" }));
			return { namespace: ns, pending };
		},
		presentCall() {
			return { card: "generic", title: "查看记忆候选", kind: "read" };
		}
	});

	const acceptTool = defineTool({
		name: "memory_accept",
		description: "接受一条 pending 候选，写入正式记忆（fact/sop）。需要 topic 与 entry_type；若 pending 内容里已有可推断信息可省略。evidence 必填或从 pending 中继承。可选 namespace。",
		parameters: {
			name: {
				type: "string",
				required: true,
				description: "pending 文件名（memory_pending 返回的 name）"
			},
			topic: {
				type: "string",
				description: "记忆主题（缺省时需从 pending 推断/由用户提供）"
			},
			entry_type: {
				type: "string",
				enum: ["fact", "sop"],
				description: "fact 或 sop（缺省时需从 pending 推断/由用户提供）"
			},
			evidence: {
				type: "string",
				description: "验证证据（若 pending 无证据则必填）"
			},
			namespace: {
				type: "string",
				description: "命名空间"
			}
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					accepted: { type: "boolean", required: true },
					topic: { type: "string", required: true },
					entry_type: { type: "string", required: true },
					namespace: { type: "string", required: true }
				}
			},
			render: (_args, value) => [{
				type: "text",
				text: value.accepted ? `✅ 已接受 pending → 记忆「${value.topic}」（${value.entry_type}）[${value.namespace}]` : `未接受：${value.reason || "未知原因"}`
			}]
		},
		async execute(args) {
			const ns = resolveNamespace(cfg, args.namespace);
			const root = nsRoot(cfg.memoryDir, ns);
			ensureNamespaceLayout(root);
			const name = String(args.name).trim();
			if (!isSafeMemName(name)) throw new Error("memory_accept: 非法 pending 文件名");
			const text = readPending(root, name);
			if (!text) throw new Error(`memory_accept: pending 不存在: ${name}`);
			const parsed = parsePending(text);
			const topic = String(args.topic || "").trim() || parsed.topic || "";
			const entryType = args.entry_type === "fact" ? "fact" : args.entry_type === "sop" ? "sop" : parsed.entryType || "";
			const evidence = String(args.evidence || "").trim() || parsed.evidence || "";
			if (!topic) throw new Error("memory_accept: 需要 topic（pending 未包含可推断主题）");
			if (!entryType) throw new Error("memory_accept: 需要 entry_type=fact|sop（pending 未包含可推断类型）");
			if (!evidence) throw new Error("memory_accept: 需要 evidence（行动验证公理：无行动，不记忆）");
			const content = text.replace(/^# Pending Memory Candidate\r?\n[\s\S]*?\r?\n\r?\n/, "").trim();
			if (!content) throw new Error("memory_accept: pending 内容为空，无法接受");
			writeMemory(root, {
				topic,
				entryType,
				content,
				evidence,
				sourceSession: parsed.sourceSession || null,
				sourceSeqs: parsed.sourceSeqs || [],
				namespace: ns,
			});
			// 接受成功后删除 pending（先归档副本到 archive/，再移除原文件）
			try {
				const p = join(root, PENDING_DIR, name);
				if (existsSync(p)) {
					copyFileSync(p, join(root, ARCHIVE_DIR, name));
					rmSync(p, { force: true });
				}
			} catch { /* 清理失败不阻断 */ }
			return { accepted: true, topic, entry_type: entryType, namespace: ns };
		},
		presentCall(args) {
			return { card: "generic", title: `接受记忆候选 ${args.name}`, kind: "execute" };
		}
	});

	const updateTool = defineTool({
		name: "memory_update",
		description: "更新已有记忆。supersede=true 时先把旧版本快照到 .history/ 再覆盖（保留历史）；false 则直接覆盖但仍记录 updatedAt。可选 namespace。",
		parameters: {
			topic: {
				type: "string",
				required: true,
				description: "记忆主题"
			},
			entry_type: {
				type: "string",
				enum: ["fact", "sop"],
				required: true,
				description: "fact 或 sop"
			},
			content: {
				type: "string",
				required: true,
				description: "新的记忆内容"
			},
			evidence: {
				type: "string",
				description: "本次更新的验证证据（建议提供）"
			},
			supersede: {
				type: "boolean",
				description: "是否保留旧版本快照（默认 true）"
			},
			namespace: {
				type: "string",
				description: "命名空间"
			}
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					topic: { type: "string", required: true },
					entry_type: { type: "string", required: true },
					action: { type: "string", required: true },
					namespace: { type: "string", required: true },
					history: { type: "string" }
				}
			},
			render: (_args, value) => [{
				type: "text",
				text: `✅ 已${value.action}「${value.topic}」[${value.namespace}]${value.history ? `，旧版本保留在 ${value.history}` : ""}`
			}]
		},
		async execute(args) {
			const ns = resolveNamespace(cfg, args.namespace);
			const root = nsRoot(cfg.memoryDir, ns);
			ensureNamespaceLayout(root);
			const topic = String(args.topic).trim();
			const type = args.entry_type === "fact" ? "fact" : "sop";
			const content = String(args.content).trim();
			if (!topic || !content) throw new Error("memory_update: topic 与 content 必填");
			const supersede = args.supersede !== false;
			let historyPath = "";
			if (supersede) {
				const ts = Date.now();
				if (type === "fact") {
					const old = readFact(root, topic);
					if (old !== null) {
						historyPath = join(HISTORY_DIR, `fact-${slugify(topic)}-${ts}.md`);
						writeFileSync(join(root, historyPath), `# ${topic}\n\n${old}\n`, "utf8");
					}
				} else {
					const slug = slugify(topic);
					const old = readSop(root, slug);
					if (old !== null) {
						historyPath = join(HISTORY_DIR, `sop-${slug}-${ts}.md`);
						writeFileSync(join(root, historyPath), old, "utf8");
					}
				}
			}
			const evidence = String(args.evidence || "").trim() || getEntryMeta(root, type, type === "fact" ? topic : slugify(topic))?.evidence || "";
			const r = writeMemory(root, {
				topic,
				entryType: type,
				content,
				evidence: evidence || "memory_update（历史更新）",
				sourceSession: getEntryMeta(root, type, type === "fact" ? topic : slugify(topic))?.sourceSession || null,
				sourceSeqs: getEntryMeta(root, type, type === "fact" ? topic : slugify(topic))?.sourceSeqs || [],
				namespace: ns,
			});
			return { topic, entry_type: type, action: supersede ? "superseded" : "updated", namespace: ns, history: historyPath || undefined };
		},
		presentCall(args) {
			return { card: "generic", title: `更新记忆 ${args.topic}`, kind: "execute" };
		}
	});

	const archiveTool = defineTool({
		name: "memory_archive",
		description: "归档一条记忆：从 L1 索引隐藏，但文件与历史保留（不物理删除）。可选 namespace。",
		parameters: {
			topic: {
				type: "string",
				required: true,
				description: "记忆主题"
			},
			entry_type: {
				type: "string",
				enum: ["fact", "sop"],
				required: true,
				description: "fact 或 sop"
			},
			namespace: {
				type: "string",
				description: "命名空间"
			}
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					topic: { type: "string", required: true },
					entry_type: { type: "string", required: true },
					namespace: { type: "string", required: true },
					archived: { type: "boolean", required: true }
				}
			},
			render: (_args, value) => [{
				type: "text",
				text: value.archived ? `📦 已归档「${value.topic}」[${value.namespace}]（可用 memory_rollback 恢复）` : `未找到「${value.topic}」`
			}]
		},
		async execute(args) {
			const ns = resolveNamespace(cfg, args.namespace);
			const root = nsRoot(cfg.memoryDir, ns);
			ensureNamespaceLayout(root);
			const topic = String(args.topic).trim();
			const type = args.entry_type === "fact" ? "fact" : "sop";
			const key = type === "fact" ? topic : slugify(topic);
			const exists = type === "fact" ? readFact(root, key) !== null : readSop(root, key) !== null;
			if (!exists) return { topic, entry_type: type, namespace: ns, archived: false };
			setEntryMeta(root, type, key, { archived: true, archivedAt: new Date().toISOString() });
			syncIndex(root, cfg.maxIndexLines);
			return { topic, entry_type: type, namespace: ns, archived: true };
		},
		presentCall(args) {
			return { card: "generic", title: `归档记忆 ${args.topic}`, kind: "execute" };
		}
	});

	const rollbackTool = defineTool({
		name: "memory_rollback",
		description: "回滚一条记忆到 .history/ 中最近一次快照（supersede 时自动保留）。可选 namespace。",
		parameters: {
			topic: {
				type: "string",
				required: true,
				description: "记忆主题"
			},
			entry_type: {
				type: "string",
				enum: ["fact", "sop"],
				required: true,
				description: "fact 或 sop"
			},
			namespace: {
				type: "string",
				description: "命名空间"
			}
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					topic: { type: "string", required: true },
					entry_type: { type: "string", required: true },
					namespace: { type: "string", required: true },
					restored: { type: "boolean", required: true },
					source: { type: "string" }
				}
			},
			render: (_args, value) => [{
				type: "text",
				text: value.restored ? `♻️ 已回滚「${value.topic}」[${value.namespace}] ← ${value.source}` : `未找到可回滚的历史「${value.topic}」`
			}]
		},
		async execute(args) {
			const ns = resolveNamespace(cfg, args.namespace);
			const root = nsRoot(cfg.memoryDir, ns);
			ensureNamespaceLayout(root);
			const topic = String(args.topic).trim();
			const type = args.entry_type === "fact" ? "fact" : "sop";
			const key = type === "fact" ? topic : slugify(topic);
			const prefix = type === "fact" ? `fact-${slugify(topic)}-` : `sop-${slugify(topic)}-`;
			let files = [];
			try {
				files = readdirSync(join(root, HISTORY_DIR))
					.filter((f) => f.startsWith(prefix) && f.endsWith(".md"))
					.sort();
			} catch { files = []; }
			if (!files.length) return { topic, entry_type: type, namespace: ns, restored: false };
			const latest = files[files.length - 1];
			const src = join(root, HISTORY_DIR, latest);
			const content = readFileSync(src, "utf8");
			if (type === "fact") {
				const clean = content.replace(/^# .+\n\n/, "").trim();
				upsertFact(root, topic, clean);
				setEntryMeta(root, "fact", topic, { archived: false, restoredFrom: latest });
			} else {
				writeFileSync(join(root, "sops", `${key}.md`), content, "utf8");
				setEntryMeta(root, "sop", key, { archived: false, restoredFrom: latest });
			}
			syncIndex(root, cfg.maxIndexLines);
			return { topic, entry_type: type, namespace: ns, restored: true, source: latest };
		},
		presentCall(args) {
			return { card: "generic", title: `回滚记忆 ${args.topic}`, kind: "execute" };
		}
	});

	const expandTool = defineTool({
		name: "memory_expand",
		description: "展开一条记忆的溯源：通过 sourceSession/sourceSeqs 从 DSH session log 读取原始事件。可选 namespace。",
		parameters: {
			topic: {
				type: "string",
				required: true,
				description: "记忆主题"
			},
			entry_type: {
				type: "string",
				enum: ["fact", "sop"],
				required: true,
				description: "fact 或 sop"
			},
			namespace: {
				type: "string",
				description: "命名空间"
			}
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					topic: { type: "string", required: true },
					entry_type: { type: "string", required: true },
					available: { type: "boolean", required: true },
					message: { type: "string" },
					sourceSession: { type: "string" },
					sourceSeqs: { type: "array", items: { type: "integer" } },
					events: {
						type: "array",
						items: {
							type: "object",
							additionalProperties: true,
							properties: {
								seq: { type: "integer" },
								type: { type: "string" },
								time: { type: "integer" },
								text: { type: "string" }
							}
						}
					}
				}
			},
			render: (_args, value) => [{
				type: "text",
				text: value.available
					? `📎 溯源「${value.topic}」[${value.entry_type}] session=${value.sourceSession} seqs=${JSON.stringify(value.sourceSeqs)}\n${value.events.map((e) => `#${e.seq} [${e.type}] ${e.text || ""}`).join("\n") || "（无事件）"}`
					: `溯源不可用：${value.message || "无 sourceSession/sourceSeqs"}`
			}]
		},
		async execute(args) {
			const ns = resolveNamespace(cfg, args.namespace);
			const root = nsRoot(cfg.memoryDir, ns);
			ensureNamespaceLayout(root);
			const topic = String(args.topic).trim();
			const type = args.entry_type === "fact" ? "fact" : "sop";
			const key = type === "fact" ? topic : slugify(topic);
			const meta = getEntryMeta(root, type, key);
			if (!meta?.sourceSession || !meta.sourceSeqs?.length) {
				return { topic, entry_type: type, available: false, message: "该记忆没有 sourceSession/sourceSeqs 溯源信息", sourceSession: meta?.sourceSession || "", sourceSeqs: meta?.sourceSeqs || [] };
			}
			const sq = ctx.get("sessionQuery");
			if (!sq || typeof sq.readSession !== "function") {
				return { topic, entry_type: type, available: false, message: "sessionQuery 服务不可用", sourceSession: meta.sourceSession || "", sourceSeqs: meta.sourceSeqs };
			}
			try {
				const snap = await sq.readSession(meta.sourceSession);
				const seqSet = new Set(meta.sourceSeqs.map(Number));
				const events = snap.events
					.filter((e) => seqSet.has(Number(e.seq)))
					.map((e) => ({
						seq: Number(e.seq),
						type: String(e.type || ""),
						time: Number(e.time || 0),
						text: typeof e.text === "string" ? e.text : JSON.stringify(e).slice(0, 2000),
					}));
				return { topic, entry_type: type, available: true, sourceSession: meta.sourceSession || "", sourceSeqs: meta.sourceSeqs, events };
			} catch (error) {
				return { topic, entry_type: type, available: false, message: `展开失败: ${error?.message || error}`, sourceSession: meta.sourceSession || "", sourceSeqs: meta.sourceSeqs };
			}
		},
		presentCall(args) {
			return { card: "generic", title: `展开溯源 ${args.topic}`, kind: "read" };
		}
	});

	const allTools = [readTool, listTool, writeTool, indexTool, statsTool, maintainTool, pendingTool, acceptTool, updateTool, archiveTool, rollbackTool, expandTool];

	// ── 渐进式暴露 ──
	const disposeAll = (fns) => {
		for (const fn of [...fns].reverse()) {
			try { fn(); } catch { /* 忽略 */ }
		}
	};
	const activate = (agent) => {
		if (agentStates.has(agent)) return { activated: false, tools: [] };
		const ds = [];
		try {
			for (const def of allTools) ds.push(agent.ctx.tools.register(def));
			try {
				const hide = agent.ctx.tools.restrict({ deny: ["memory_activate"] });
				if (hide) ds.push(hide);
			} catch { /* restrict 不可用时保留激活工具 */ }
			agentStates.set(agent, ds);
			return { activated: true, tools: allTools.map((d) => d.name) };
		} catch (error) {
			disposeAll(ds);
			throw error;
		}
	};
	const detach = (agent) => {
		const ds = agentStates.get(agent);
		if (ds) {
			disposeAll(ds);
			agentStates.delete(agent);
		}
	};

	const agents = ctx.get("agents");
	const progressive = cfg.progressive && Boolean(agents);
	if (progressive) {
		ctx.tools.register(defineTool({
			name: "memory_activate",
			description: "加载 memory skill 后，为当前 Agent 激活记忆工具（memory_read / memory_list / memory_write / memory_index / memory_stats / memory_maintain / memory_pending / memory_accept / memory_update / memory_archive / memory_rollback / memory_expand）。skill 加载成功后通常会自动激活；仅当工具未出现时调用一次。",
			parameters: {},
			output: {
				schema: {
					type: "object",
					additionalProperties: false,
					properties: {
						activated: { type: "boolean", required: true },
						tools: { type: "array", items: { type: "string" }, required: true }
					}
				},
				render: (_args, value) => [{ type: "text", text: `记忆工具已激活: ${value.tools.join(", ")}` }]
			},
			execute: (_args, exec) => {
				if (!exec.agent) throw new Error("memory_activate: 需要 Agent 会话");
				return Promise.resolve(activate(exec.agent));
			},
			presentCall: () => ({ card: "generic", title: "激活记忆工具", kind: "execute" })
		}));
		disposers.push(ctx.on("agent/disposed", ({ agent }) => detach(agent)));
	} else {
		for (const def of allTools) ctx.tools.register(def);
	}

	return () => {
		for (const agent of [...agentStates.keys()]) detach(agent);
		disposeAll(disposers);
	};
}

export { apply, inject, name };
