// 记忆写操作与 pending 候选：writeMemory / pending 读写解析。
// 依赖方向：memory-ops → store + l1index（单向，无循环）。
// [v0.6] 三处硬约束（把 L0 公理从提示词变成代码）：
//  - 覆盖已有条目必须先快照到 .history/（神圣不可删改：任何调用方都走这条路径）；
//  - facts 正文禁止出现 "## " 行（否则会被解析成幽灵 section，实测已产生 10+ 条脏数据）；
//  - 疑似密钥形态直接拒写（L0：凭证只允许存"引用"）。

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { atomicWriteFileSync } from "./atomic-write.js";
import {
	PENDING_DIR,
	setEntryMeta,
	getEntryMeta,
	slugify,
	upsertFact,
	snapshotEntry,
	readFact,
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

/**
 * 写入侧 L0 判据回显：把方法论放到决策点（借鉴 GA 的 "'This is L0:' + 写入动作同屏"）。
 * 只提示不阻断——阻断只用于上面三条硬约束。
 */
export function buildAdvisories({ topic, content, existing, index, maxTopicChars = 40 }) {
	const out = [];
	if (String(topic).length > maxTopicChars) {
		out.push(`topic ${String(topic).length} 字符，超过最小充分指针建议（≤${maxTopicChars}）：名字应自解释，细节放正文`);
	}
	if (/20\d\d[-/]\d\d|commit\s+[0-9a-f]{6,}/i.test(String(topic))) {
		out.push("topic 含日期/commit 等易变状态（L0 公理 3）：这类信息放正文或删除，名字要能长期定位");
	}
	if (existing) {
		out.push("该主题已存在：本次已自动把旧版本快照到 .history/，同主题演进更推荐 memory_update（可显式 supersede:false）");
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
	topic, entryType, content, evidence, sourceSession, sourceSeqs, namespace, related,
	maxChars = L1_MAX_CHARS_DEFAULT, snapshot = true,
}) {
	// [0.6.1 M4] 校验逻辑提取为 assertSafeTopic 单源，供全部 topic 入参工具复用。
	const safeTopic = assertSafeTopic(topic, "memory_write");
	const body = String(content ?? "").trim();
	const secretHit = detectSecret(body);
	if (secretHit) {
		throw new Error(`memory_write: 内容疑似含密钥（命中 ${secretHit}）。行动验证公理之外还有 L0 红线「密钥仅引用」：请改存引用名/路径（如 keychain:<name> 或配置文件路径），不要写明文凭证。`);
	}
	if (entryType === "fact" && /^##\s+/m.test(body)) {
		throw new Error("memory_write: fact 正文禁止以 \"## \" 开头的行——它会被解析成新的 L2 section（幽灵条目）。需要小标题请用 \"### \" 或列表。");
	}
	const evidenceText = String(evidence ?? "").trim();
	if (!evidenceText) {
		throw new Error("memory_write: evidence 必填（行动验证公理：无行动，不记忆）");
	}
	const wrapped = `${body}\n\n> 证据: ${evidenceText}\n`;

	let path;
	let action;
	let history = "";
	let existing = false;
	// [0.6.1 N13] 快照失败不再静默：记录原因，出口统一进 advisories 响亮上报。
	let snapshotFailure = "";
	if (entryType === "fact") {
		path = join(root, "facts.md");
		existing = readFact(root, safeTopic) !== null;
		if (existing && snapshot) {
			const snap = snapshotEntry(root, "fact", safeTopic);
			history = snap.path;
			if (snap.error) snapshotFailure = snap.error;
		}
		action = upsertFact(root, safeTopic, wrapped.trim());
		setEntryMeta(root, "fact", safeTopic, metaPatch({ sourceSession, sourceSeqs, evidence: evidenceText, namespace, related, root, kind: "fact", key: safeTopic }));
	} else {
		const slug = slugify(safeTopic);
		path = join(root, "sops", `${slug}.md`);
		existing = existsSync(path);
		if (existing && snapshot) {
			const snap = snapshotEntry(root, "sop", slug);
			history = snap.path;
			if (snap.error) snapshotFailure = snap.error;
		}
		atomicWriteFileSync(path, `# ${safeTopic}\n\n${wrapped}`);
		action = existing ? "updated" : "created";
		setEntryMeta(root, "sop", slug, metaPatch({ sourceSession, sourceSeqs, evidence: evidenceText, namespace, related, root, kind: "sop", key: slug }));
	}
	const index = syncIndex(root, maxChars);
	const advisories = buildAdvisories({ topic: safeTopic, content: body, existing, index });
	// [0.6.1 N13] 「所有覆盖写统一先快照」是 v0.6 数据丢失级修复；磁盘满/EPERM 等
	// 持续故障下旧实现会静默绕过它。现在快照失败必须出现在返回体判据里，
	// 让调用方（模型/用户）知道旧版本没保住。（写本身仍继续——拒写会丢新数据。）
	if (snapshotFailure) advisories.unshift(`快照失败，旧版本未保留: ${snapshotFailure}`);
	return {
		entry_type: entryType,
		topic: safeTopic,
		path,
		action,
		history: history || undefined,
		index,
		advisories,
	};
}

function metaPatch({ sourceSession, sourceSeqs, evidence, namespace, related, root, kind, key }) {
	const prev = getEntryMeta(root, kind, key) || {};
	return {
		sourceSession: sourceSession || prev.sourceSession || null,
		sourceSeqs: Array.isArray(sourceSeqs) && sourceSeqs.length
			? sourceSeqs.map(Number).filter(Number.isFinite)
			: (prev.sourceSeqs || []),
		evidence,
		namespace: namespace || null,
		archived: prev.archived || false,
		...(Array.isArray(related) && related.length ? { related: related.map(String) } : {}),
	};
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

/** 写入 pending 候选。 */
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

/** 写入 pending 候选（重试序列尾部先过密钥消毒）。 */
export function writePending(root, payload) {
	const fileName = `pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.md`;
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
	atomicWriteFileSync(p, pendingContent(safe));
	return fileName;
}

/** 读取 pending 候选。 */
export function readPending(root, name) {
	const p = join(root, PENDING_DIR, name);
	if (!existsSync(p)) return null;
	const text = readFileSync(p, "utf8");
	const m = text.match(/^# Pending Memory Candidate[\s\S]*$/);
	return m ? text : null;
}

/** 从 pending 文件解析简单字段。 */
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
