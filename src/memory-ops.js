// 正式记忆写入和候选读写。正文、证据、来源和快照按同一条目身份提交。
import { existsSync, readFileSync } from "node:fs";
import { join, basename } from "node:path";
import { randomUUID } from "node:crypto";
import { atomicWriteFileSync } from "./atomic-write.js";
import {
	PENDING_DIR,
	slugify,
	snapshotEntry,
	withNsWriteLock,
	RESERVED_ENTRY_NAMES,
	readEntry,
	parseEntryBody,
	commitEntry,
	ensureNamespaceLayout,
	entryIdentity,
} from "./store.js";
import { syncIndex, L1_MAX_CHARS_DEFAULT } from "./l1index.js";

/** 疑似密钥形态（宁可响亮拒写，也不让凭证明文进记忆库再被检索回灌进上下文）。 */
const SECRET_PATTERNS = [
	/\bsk-[A-Za-z0-9_-]{16,}\b/,
	/\bAKIA[0-9A-Z]{12,}\b/,
	/\b(?:ghp|gho|ghs|github_pat)[_A-Za-z0-9]{16,}/,
	/\bxox[baprs]-[A-Za-z0-9-]{10,}/,
	/-----BEGIN [A-Z ]*PRIVATE KEY-----/,
	/\bBearer\s+[A-Za-z0-9._~+\/-]{16,}/i,
];
const LONG_TOKEN = /\b[A-Za-z0-9+/]{28,}={1,2}\b/;

export function detectSecret(text) {
	const s = String(text ?? "");
	for (const re of SECRET_PATTERNS) if (re.test(s)) return re.source;
	const m = s.match(LONG_TOKEN);
	if (m) {
		const tok = m[0];
		const isPureHex = /^[0-9a-fA-F]+$/.test(tok.replace(/=+$/, ""));
		const mixed = /[a-z]/.test(tok) && /[A-Z]/.test(tok) && /[0-9]/.test(tok);
		if (!isPureHex && mixed) return "long-token";
	}
	return "";
}

/**
 * [0.6.9] 逐行脱敏：命中疑似密钥的行整行替换为模式标识（只留模式，不留内容）。
 * 用于 evidence/related 这类"来源摘录"字段——它们常是工具输出复制，误杀整条写入
 * 会惩罚真实证据，所以采取脱敏而非拒写；正文仍保持拒写（正文是用户自己组织的措辞）。
 */
export function redactSecretLines(text) {
	return String(text ?? "").split("\n").map((line) => {
		const hit = detectSecret(line);
		return hit ? `[redacted:${hit}]` : line;
	}).join("\n");
}

// 新关系使用类型化身份；旧字符串保持原样，读取方展示为未解析。
export function normalizeRelatedKey(value) {
	return typeof value === "string" ? value.trim() : entryIdentity(value.namespace, value.kind, value.key);
}

/**
 * [0.6.9] evidence 逐行引用编码：每一行都以 "> " 引用（空行用 ">"），
 * 持久化后不可能再被 facts.md 解析成 "## " 新 section。首行保留
 * "> 证据: " 前缀以兼容既有正文字体与人工阅读习惯。
 */
export function quoteEvidence(evidenceText) {
	const lines = String(evidenceText ?? "").split("\n");
	const head = `> 证据: ${lines[0] ?? ""}`;
	const rest = lines.slice(1).map((l) => (l.trim() ? `> ${l}` : ">"));
	return [head, ...rest].join("\n");
}

/**
 * topic 控制字符判据（单一来源）。[0.6.1 M4] 提取自 writeMemory：topic 会进
 * facts.md 的 ## section 与 L1 索引（再注入 system prompt），含换行/控制字符会
 * 让 section 解析错位并成为提示词注入载体。所有以 topic 为条目名的工具
 * （write/update 经 writeMemory；accept/promote/archive/expand/rollback）必须复用
 * 本校验——rollback 曾绕过它，把 "x\n## evil" 拼进 facts.md 造出幽灵 section。
 */
export const TOPIC_CONTROL_CHARS = /[\n\r\u0000-\u001f\u007f]/;

export function assertSafeTopic(topic, caller = "memory_write") {
	const s = String(topic ?? "").trim();
	if (TOPIC_CONTROL_CHARS.test(s)) {
		throw new Error(`${caller}: topic 含换行或控制字符，拒绝写入: ${JSON.stringify(s.slice(0, 40))}`);
	}
	return s;
}

export function buildAdvisories({ topic, content, existing, index, maxTopicChars = 40 }) {
	const out = [];
	if (String(topic).length > maxTopicChars) {
		out.push(`topic ${String(topic).length} 字符，超过最小充分指针建议（≤${maxTopicChars}）：名字应自解释，细节放正文`);
	}
	if (/20\d\d[-/]\d\d|commit\s+[0-9a-f]{6,}/i.test(String(topic))) {
		out.push("topic 含日期/commit 等易变状态（L0 公理 3）：这类信息放正文或删除，名字要能长期定位");
	}
	if (existing) {
		out.push("旧版本已保存在 .history/，可按快照 id 恢复。");
	}
	if (index?.over_limit) {
		out.push(`L1 索引 ${index.index_chars} 字符已超预算 ${index.max_chars}：请 memory_maintain 合并相近条目或归档冷条目（系统不会自动隐藏任何条目）`);
	}
	if (!String(content ?? "").trim()) out.push("content 为空");
	return out;
}

/**
 * 写入正式记忆（fact/sop），带溯源 meta 与可选关联链接。
 * 所有覆盖写都必须经过这里快照（memory_write / memory_update / memory_accept 共用）。
 */
export function writeMemory(root, {
  topic, key, entryType, content, evidence, sourceSession, sourceSeqs, sourceCallId,
  evidenceCallIds, namespace = "default", related, preserveSource = false, mode = "create",
  maxChars = L1_MAX_CHARS_DEFAULT,
}) {
  if (!["fact", "sop"].includes(entryType)) throw new Error("entryType must be fact or sop");
  if (!["create", "update"].includes(mode)) throw new Error("mode must be create or update");
  ensureNamespaceLayout(root);
  return withNsWriteLock(root, () => {
    const entryKey = key ?? (entryType === "sop" ? slugify(topic) : String(topic ?? "").trim());
    entryIdentity(namespace, entryType, entryKey);
    const previous = readEntry(root, entryType, entryKey);
    if (mode === "create" && previous) throw new Error("Entry already exists; update its entry id: " + entryKey);
    if (mode === "update" && !previous) throw new Error("Entry does not exist: " + entryKey);
    const title = assertSafeTopic(previous?.title ?? topic, "memory_write");
    if (!title) throw new Error("A new entry needs a title");
    if (detectSecret(title)) throw new Error("Entry title contains a credential");
    if (RESERVED_ENTRY_NAMES.has(title.toLowerCase()) || (entryType === "sop" && RESERVED_ENTRY_NAMES.has(entryKey))) throw new Error("Reserved entry name: " + title);

    // 接受纯正文，也规范化由已有文件复制来的包装；不会剥掉不同名的正文标题。
    const supplied = String(content ?? "").trim();
    const body = parseEntryBody(entryType, entryKey, entryType === "sop" ? "# " + title + "\n\n" + supplied : supplied).content;
    if (!body) throw new Error("Entry content must not be empty");
    if (detectSecret(body)) throw new Error("Entry content contains a credential; store a reference instead");
    if (entryType === "fact" && /^##\s+/m.test(body)) throw new Error('Fact content cannot contain "## " section headings');
    const evidenceText = redactSecretLines(String(evidence ?? (preserveSource ? previous?.meta.evidence : "") ?? "").trim());
    if (!evidenceText) throw new Error("Verified evidence is required");
    const relatedList = related === undefined ? previous?.meta.related || [] : related.map(normalizeRelatedKey);
    if (relatedList.some(value => detectSecret(JSON.stringify(value)))) throw new Error("Entry relations contain a credential");
    const history = previous ? snapshotEntry(root, entryType, entryKey).path : "";
    const now = new Date().toISOString();
    const prior = previous?.meta || {};
    const source = preserveSource
      ? { sourceSession: prior.sourceSession || null, sourceSeqs: prior.sourceSeqs || [], ...(prior.sourceCallId ? { sourceCallId: prior.sourceCallId } : {}) }
      : { sourceSession: sourceSession || null, sourceSeqs: Array.isArray(sourceSeqs) ? sourceSeqs : [], ...(sourceCallId ? { sourceCallId } : {}) };
    const meta = { ...prior, ...source, namespace, evidence: evidenceText, related: relatedList, archived: false, createdAt: prior.createdAt || now, updatedAt: now };
    if (!preserveSource && !sourceCallId) delete meta.sourceCallId;
    if (evidenceCallIds) meta.evidenceCallIds = evidenceCallIds;
    else if (!preserveSource) delete meta.evidenceCallIds;
    for (const field of ["archivedAt", "archivedFrom", "replacedBy", "promotedTo", "unarchivedAt"]) delete meta[field];
    const wrapped = body + "\n\n" + quoteEvidence(evidenceText) + "\n";
    const raw = entryType === "sop" ? "# " + title + "\n\n" + wrapped : wrapped;
    const entry = commitEntry(root, entryType, entryKey, raw, meta);
    const index = syncIndex(root, maxChars);
    return {
      entry_type: entryType, topic: title, key: entryKey, path: join(root, entryType === "fact" ? "facts.md" : "sops/" + entryKey + ".md"),
      action: previous ? "updated" : "created", history: history || undefined, index, entry,
      advisories: buildAdvisories({ topic: title, content: body, existing: Boolean(previous), index }),
    };
  });
}

/**
 * 生成 pending 候选内容。
 * [v0.5] 只为「有价值的信号」生成候选：同工具先失败后成功的重试序列（附错误/结果尾部摘要）。
 * [v0.6] autoPending 默认关闭：实测 6 天累积 108 条、消费≈0，且内容多为工具用法噪声。
 */
export function pendingContent({ sourceSession, sourceSeqs, retries, reason }) {
	const lines = [
		"# Pending Memory Candidate",
		"",
		`- sourceSession: ${sourceSession || ""}`,
		`- sourceSeqs: ${Array.isArray(sourceSeqs) && sourceSeqs.length ? JSON.stringify(sourceSeqs) : ""}`,
		`- capturedAt: ${new Date().toISOString()}`,
		`- kind: retry-sequence`,
		"",
	];
	if (Array.isArray(retries) && retries.length) {
		lines.push("## 重试序列（同工具先失败后成功，典型坑点信号）");
		lines.push("");
		for (const r of retries) {
			lines.push(`### ${r.tool}（失败 ${r.fails} 次后成功）`);
			if (r.errorTail) lines.push(`- 错误尾部: ${r.errorTail}`);
			if (r.successTail) lines.push(`- 成功结果尾部: ${r.successTail}`);
			lines.push("");
		}
	}
	lines.push(reason || "本回合出现失败后重试成功的工具调用，可能值得沉淀为 SOP。请用 memory_accept 确认或丢弃。");
	lines.push("");
	return lines.join("\n");
}

/**
 * [0.6.1 N12] 尾部摘要的密钥消毒：autoPending 开启时错误/结果尾部会原样进
 * pending/*.md 落盘；若工具错误回显了凭证，此前要到 accept 侧才被 detectSecret 拦
 * （已持久化）。与「宁可响亮拒写，也不让凭证明文进记忆库」同标准——落盘前过同一个
 * detectSecret，命中即整段替换为 [redacted:<pattern>]（只留模式标识，不留内容）。
 */
function redactSecretTail(text) {
	const s = String(text ?? "");
	const hit = detectSecret(s);
	return hit ? `[redacted:${hit}]` : s;
}

export function writePending(root, payload) {
	const fileName = "pending-" + randomUUID() + ".md";
	const p = join(root, PENDING_DIR, fileName);
	const safe = Array.isArray(payload?.retries)
		? {
			...payload,
			retries: payload.retries.map((r) => ({
				...r,
				errorTail: redactSecretTail(r?.errorTail),
				successTail: redactSecretTail(r?.successTail),
			})),
		}
		: payload;
	withNsWriteLock(root, () => atomicWriteFileSync(p, pendingContent(safe)));
	return fileName;
}

export function readPending(root, name) {
	if (basename(name) !== name || !name.endsWith(".md")) throw new Error("Invalid pending file name");
	const p = join(root, PENDING_DIR, name);
	if (!existsSync(p)) return null;
	const text = readFileSync(p, "utf8");
	const m = text.match(/^# Pending Memory Candidate[\s\S]*$/);
	return m ? text : null;
}

export function parsePending(text) {
	const out = {};
	const session = text.match(/^- sourceSession: (.+)$/m);
	const seqs = text.match(/^- sourceSeqs: (.+)$/m);
	if (session) out.sourceSession = session[1].trim();
	if (seqs && seqs[1].trim()) {
		try { out.sourceSeqs = JSON.parse(seqs[1].trim()); } catch { out.sourceSeqs = []; }
	}
	return out;
}
