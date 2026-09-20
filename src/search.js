// memory_search：BM25 全文检索（facts + sops + archive），支持跨命名空间。
// [v0.5 新增] 根治"L1 被裁剪的条目找不回"——隐藏/归档条目都可被主动检索。

import { readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { BM25Index, tokenize } from "./similarity.js";
import { collectDocs } from "./maintain.js";
import { stripArchiveBanner } from "./store.js";

/**
 * 摘要：优先展示命中位置附近的内容。
 * [0.6.8] 此前固定取正文开头 160 字符——命中信息在正文后段时，
 * 模型拿到了结果却看不到它为什么相关。
 */
export function snippetAround(text, query, width = 160) {
	const flat = String(text ?? "").replace(/\s+/g, " ").trim();
	if (flat.length <= width) return flat;
	const lower = flat.toLowerCase();
	let hit = -1;
	for (const term of new Set(tokenize(query))) {
		const t = term.toLowerCase();
		if (t.length < 2) continue;
		const i = lower.indexOf(t);
		if (i >= 0 && (hit < 0 || i < hit)) hit = i;
	}
	if (hit < 0) return flat.slice(0, width);
	const start = Math.max(0, hit - Math.floor(width / 3));
	const end = Math.min(flat.length, start + width);
	return `${start > 0 ? "…" : ""}${flat.slice(start, end)}${end < flat.length ? "…" : ""}`;
}

/** 列出全部命名空间根目录（default = memoryDir 本身，其余为子目录）。 */
export function listNamespaces(memDir) {
	const out = new Set(["default"]);
	try {
		for (const d of readdirSync(memDir, { withFileTypes: true })) {
			if (!d.isDirectory()) continue;
			if (d.name === "sops" || d.name === "pending" || d.name === "archive" || d.name === ".history") continue;
			if (existsSync(join(memDir, d.name, "facts.md")) || existsSync(join(memDir, d.name, "index.txt"))) {
				out.add(d.name);
			}
		}
	} catch { /* memoryDir 不存在 */ }
	return [...out];
}

/**
 * 在给定命名空间集合内执行 BM25 检索。
 * @returns [{ namespace, kind, name, archived, score, snippet }]
 */
export function searchNamespaces(memDir, namespaces, query, { limit = 8, includeArchived = true } = {}) {
	const index = new BM25Index();
	const metaByDocId = new Map();
	for (const ns of namespaces) {
		const root = ns === "default" ? memDir : join(memDir, ns);
		if (!existsSync(root)) continue;
		for (const doc of collectDocs(root, { includeArchived })) {
			const id = `${ns}::${doc.kind}::${doc.name}`;
			// [0.6.5] 归档横幅只服务于"用文件或 read 看正文的人"，对检索是噪声：
			// 它占了 160 字符摘录预算的约 60 字符，还往 BM25 索引里塞"已归档/历史快照"这类
			// 与内容无关的 token。归档状态由 archived 字段表达，这里统一剥掉。
			const text = stripArchiveBanner(doc.text || "");
			index.addDoc(id, `${doc.name}\n${text}`);
			metaByDocId.set(id, { namespace: ns, kind: doc.kind, name: doc.name, archived: Boolean(doc.archived), text });
		}
	}
	const hits = index.search(query, Math.max(1, limit) * 2);
	return hits
		.map(({ id, score }) => {
			const m = metaByDocId.get(id);
			return {
				namespace: m.namespace,
				kind: m.kind,
				name: m.name,
				archived: m.archived,
				score: Number(score.toFixed(4)),
				snippet: snippetAround(m.text, query),
			};
		})
		.slice(0, Math.max(1, limit));
}
