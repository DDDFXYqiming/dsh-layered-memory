import { readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { BM25Index, tokenize } from "./similarity.js";
import { collectDocs } from "./maintain.js";
import { nsRoot, safeNs } from "./store.js";

export function snippetAround(text, query, width = 180) {
	const flat = text.replace(/\s+/g, " ").trim();
	if (flat.length <= width) return flat;
	const lower = flat.toLowerCase();
	const hits = [...new Set(tokenize(query))].filter(term => term.length >= 2).map(term => lower.indexOf(term)).filter(pos => pos >= 0);
	const start = hits.length ? Math.max(0, Math.min(...hits) - Math.floor(width / 3)) : 0;
	const end = Math.min(flat.length, start + width);
	return `${start ? "…" : ""}${flat.slice(start, end)}${end < flat.length ? "…" : ""}`;
}

export function listNamespaces(memoryDir) {
	if (!existsSync(memoryDir)) return [];
	const names = existsSync(join(memoryDir, "facts.md")) || existsSync(join(memoryDir, "index.txt")) ? ["default"] : [];
	for (const dir of readdirSync(memoryDir, { withFileTypes: true })) {
		if (!dir.isDirectory() || dir.name !== safeNs(dir.name)) continue;
		const root = join(memoryDir, dir.name);
		if (existsSync(join(root, "facts.md")) || existsSync(join(root, "index.txt"))) names.push(dir.name);
	}
	return [...new Set(names)].sort();
}

export function searchNamespaces(memoryDir, namespaces, query, { limit = 8, includeArchived = false } = {}) {
	const index = new BM25Index(), docs = new Map();
	for (const namespace of new Set(namespaces.map(safeNs))) {
		const root = nsRoot(memoryDir, namespace);
		if (!existsSync(root)) continue;
		for (const doc of collectDocs(root, { includeArchived })) {
			const id = JSON.stringify([namespace, doc.kind, doc.name]);
			index.addDoc(id, `${doc.title}\n${doc.name}\n${doc.text}`);
			docs.set(id, { ...doc, entry: { namespace, kind: doc.kind, key: doc.name } });
		}
	}
	return index.search(query, limit).map(({ id, score }) => {
		const doc = docs.get(id);
		return { entry: doc.entry, title: doc.title, archived: doc.archived, score: Number(score.toFixed(4)), snippet: snippetAround(doc.text, query) };
	});
}
