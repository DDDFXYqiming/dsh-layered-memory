// memory_search：BM25 全文检索（facts + sops + archive），支持跨命名空间。
// [v0.5 新增] 根治"L1 被裁剪的条目找不回"——隐藏/归档条目都可被主动检索。

import { readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { BM25Index } from "./similarity.js";
import { collectDocs } from "./maintain.js";

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
			index.addDoc(id, `${doc.name}\n${doc.text}`);
			metaByDocId.set(id, { namespace: ns, kind: doc.kind, name: doc.name, archived: Boolean(doc.archived), text: doc.text });
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
				snippet: (m.text || "").replace(/\s+/g, " ").trim().slice(0, 160),
			};
		})
		.slice(0, Math.max(1, limit));
}
