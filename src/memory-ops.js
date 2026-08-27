// 记忆写操作与 pending 候选：writeMemory / pending 读写解析。
// 依赖方向：memory-ops → store + l1index（单向，无循环）。

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { atomicWriteFileSync } from "./atomic-write.js";
import {
	PENDING_DIR,
	setEntryMeta,
	getEntryMeta,
	slugify,
	upsertFact,
} from "./store.js";
import { compressIndexEntries, readIndex, syncIndex } from "./l1index.js";

/**
 * 写入正式记忆（fact/sop），带溯源 meta 与可选关联链接。
 * [v0.5 变更]
 * - related: string[] 存入 meta（A-MEM 轻量链接），memory_read 时回显。
 * - 写入不再计入访问热度（写≠读）；recency 保护由 entryHeat 的 createdAt 分支承担。
 * - 写入后若 L1 超限，立即执行一次热度压缩（毫秒级本地操作），
 *   告警只在压缩后仍超限时出现——消灭"反复提示 over_limit"。
 */
export function writeMemory(root, { topic, entryType, content, evidence, sourceSession, sourceSeqs, namespace, related, maxIndexLines = 30 }) {
	const safeTopic = String(topic).trim();
	// topic 会进入 facts.md 的 ## section 与 L1 索引（再注入 system prompt）：
	// 含换行/控制字符会让 section 解析错位，也会成为提示词注入载体，直接拒绝。
	if (/[\n\r\u0000-\u001f\u007f]/.test(safeTopic)) {
		throw new Error(`memory_write: topic 含换行或控制字符，拒绝写入: ${JSON.stringify(safeTopic.slice(0, 40))}`);
	}
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
			...(Array.isArray(related) && related.length ? { related: related.map(String) } : {}),
		});
	} else {
		const slug = slugify(safeTopic);
		path = join(root, "sops", `${slug}.md`);
		const existed = existsSync(path);
		const header = `# ${safeTopic}\n\n`;
		atomicWriteFileSync(path, header + body);
		action = existed ? "updated" : "created";
		setEntryMeta(root, "sop", slug, {
			sourceSession: sourceSession || null,
			sourceSeqs: Array.isArray(sourceSeqs) ? sourceSeqs.map(Number).filter(Number.isFinite) : [],
			evidence: evidence || "",
			namespace: namespace || null,
			archived: getEntryMeta(root, "sop", slug)?.archived || false,
			...(Array.isArray(related) && related.length ? { related: related.map(String) } : {}),
		});
	}
	let index = syncIndex(root, maxIndexLines);
	if (index.over_limit) {
		// 写入即压缩：热度排序裁剪 L1 指针，记忆文件不动。
		const compressed = compressIndexEntries(root, maxIndexLines);
		const linesAfter = readIndex(root).replace(/\r\n?/g, "\n").replace(/\n+$/, "").split("\n").length;
		index = {
			...index,
			index_lines: linesAfter,
			compressed: compressed.compressed,
			facts_hidden: compressed.facts_hidden,
			sops_hidden: compressed.sops_hidden,
			// 压缩后仍超限（RULES 手动段过长等极端情况）才保留 over_limit=true
			over_limit: linesAfter > maxIndexLines,
		};
	}
	return { entry_type: entryType, topic: safeTopic, path, action, index };
}

/**
 * 生成 pending 候选内容。
 * [v0.5 变更] 只为「有价值的信号」生成候选：同工具先失败后成功的重试序列
 * （附错误/结果尾部摘要），不再为普通成功调用生成垃圾候选。
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
export function writePending(root, payload) {
	const fileName = `pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.md`;
	const p = join(root, PENDING_DIR, fileName);
	atomicWriteFileSync(p, pendingContent(payload));
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
