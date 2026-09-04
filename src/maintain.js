// 维护：近重复去重（内容级）、合并候选（内容级）、完整维护流程。
// [v0.5] 相似度从"文件名分词 + 精确内容相等"升级为词元集合 Jaccard，
// 消灭纯名称匹配产生的大量误报（实测 20/20 全错）。

import { existsSync, readFileSync, copyFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { atomicWriteFileSync } from "./atomic-write.js";
import {
	ARCHIVE_DIR,
	factSections,
	sopNames,
	isArchived,
	setEntryMeta,
	readFact,
	readSop,
	readMeta,
	hashText,
	slugify,
	computeNamespaceStats,
} from "./store.js";
import { compressIndexEntries } from "./l1index.js";
import { normalizeText, tokenize, jaccard } from "./similarity.js";

/** 近重复判定阈值：分词集合 Jaccard 达到该值视为同一记忆的微编辑版本。 */
export const NEAR_DUPE_THRESHOLD = 0.85;
/** 合并候选报告阈值：达到该值提示"内容高度重叠，可考虑合并"。 */
export const MERGE_CANDIDATE_THRESHOLD = 0.45;
/** 模糊比对最小词元数：过短内容信号不足，只走精确 hash 去重（防止 "fact 1" vs "fact 2" 这类误判）。 */
export const MIN_TOKENS_FOR_FUZZY = 12;

function factArchiveText(root, topic) {
	return `# ${topic}\n\n${readFact(root, topic) ?? ""}\n`;
}

/** 分词集合（ASCII 词 + 单数字 + CJK bigram）：对中文微编辑比字符 n-gram 更稳健。 */
function tokenSet(text) {
	return new Set(tokenize(text));
}

/** 模糊比对资格：双方词元数都达到 MIN_TOKENS_FOR_FUZZY 才参与 Jaccard 判定。 */
function fuzzyEligible(a, b, minTokens = MIN_TOKENS_FOR_FUZZY) {
	return a.size >= minTokens && b.size >= minTokens;
}

/**
 * 去重：两级检测。
 * 1) 精确内容 hash（快速路径，行为与 v0.4 一致）；
 * 2) [v0.5] 词元集合 Jaccard ≥ NEAR_DUPE_THRESHOLD 的近重复（同事实改写/微调）。
 * 重复项归档并保留 citation（不物理删除）。
 */
export function dedupeEntries(root, opts = {}) {
	const nearDupe = opts.nearDupeThreshold ?? NEAR_DUPE_THRESHOLD;
	const minTokens = opts.minTokensForFuzzy ?? MIN_TOKENS_FOR_FUZZY;
	const report = { removed: [], merged: [] };
	const meta = readMeta(root);

	// ── SOP：精确 hash 快速路径 ──
	const seenSopHash = new Map();
	const sopTokenSets = new Map();
	for (const slug of sopNames(root)) {
		if (isArchived(root, "sop", slug)) continue;
		const content = readSop(root, slug);
		if (content === null) continue;
		const norm = normalizeText(content);
		const h = hashText(norm);
		let duplicateOf = null;
		if (seenSopHash.has(h)) {
			duplicateOf = seenSopHash.get(h);
		} else {
			// 近重复：与之前每个 SOP 比 Jaccard（条目量级为百以内，O(n²) 可接受）
			const cur = tokenSet(norm);
			for (const [prevSlug, prevSet] of sopTokenSets) {
				if (!fuzzyEligible(cur, prevSet, minTokens)) continue;
				if (jaccard(cur, prevSet) >= nearDupe) {
					duplicateOf = prevSlug;
					break;
				}
			}
		}
		if (duplicateOf) {
			const ts = Date.now();
			try {
				copyFileSync(join(root, "sops", `${slug}.md`), join(root, ARCHIVE_DIR, `sop-${slug}-${ts}.md`));
			} catch { /* 忽略 */ }
			setEntryMeta(root, "sop", slug, { archived: true, duplicateOf, archivedAt: new Date().toISOString() });
			report.removed.push(`sop:${slug} -> duplicate of ${duplicateOf}`);
		} else {
			seenSopHash.set(h, slug);
			sopTokenSets.set(slug, tokenSet(norm));
		}
	}

	// ── fact：同样两级 ──
	const seenFactHash = new Map();
	const factTokenSets = new Map();
	for (const topic of factSections(root)) {
		if (isArchived(root, "fact", topic)) continue;
		const content = readFact(root, topic);
		if (content === null) continue;
		const norm = normalizeText(content);
		const h = hashText(norm);
		let duplicateOf = null;
		if (seenFactHash.has(h)) {
			duplicateOf = seenFactHash.get(h);
		} else {
			const cur = tokenSet(norm);
			for (const [prevTopic, prevSet] of factTokenSets) {
				if (!fuzzyEligible(cur, prevSet, minTokens)) continue;
				if (jaccard(cur, prevSet) >= nearDupe) {
					duplicateOf = prevTopic;
					break;
				}
			}
		}
		if (duplicateOf) {
			const ts = Date.now();
			try {
				atomicWriteFileSync(join(root, ARCHIVE_DIR, `fact-${slugify(topic)}-${ts}.md`), factArchiveText(root, topic));
			} catch { /* 忽略 */ }
			setEntryMeta(root, "fact", topic, { archived: true, duplicateOf, archivedAt: new Date().toISOString() });
			report.removed.push(`fact:${topic} -> duplicate of ${duplicateOf}`);
		} else {
			seenFactHash.set(h, topic);
			factTokenSets.set(topic, tokenSet(norm));
		}
	}
	return report;
}

/**
 * 合并候选：内容词元集合 Jaccard ≥ MERGE_CANDIDATE_THRESHOLD 的活跃 SOP 对。
 * [v0.5] 不再按文件名分词配对——名称只作为提示字段（nameOverlap）附带。
 * 仅报告，需模型/用户确认后真正合并。
 */
export function findMergeCandidates(root, opts = {}) {
	const mergeThreshold = opts.mergeCandidateThreshold ?? MERGE_CANDIDATE_THRESHOLD;
	const minTokens = opts.minTokensForFuzzy ?? MIN_TOKENS_FOR_FUZZY;
	const names = sopNames(root).filter((s) => !isArchived(root, "sop", s));
	const shingleByName = new Map();
	for (const slug of names) {
		const content = readSop(root, slug);
		if (content === null) continue;
		shingleByName.set(slug, tokenSet(content));
	}
	const candidates = [];
	const sorted = [...shingleByName.keys()].sort();
	for (let i = 0; i < sorted.length; i++) {
		for (let j = i + 1; j < sorted.length; j++) {
			const a = sorted[i];
			const b = sorted[j];
			const setA = shingleByName.get(a);
			const setB = shingleByName.get(b);
			if (!fuzzyEligible(setA, setB, minTokens)) continue;
			const score = jaccard(setA, setB);
			if (score < mergeThreshold) continue;
			const wordsA = a.replace(/[-_]/g, " ").toLowerCase().split(" ").filter(Boolean);
			const wordsB = b.replace(/[-_]/g, " ").toLowerCase().split(" ").filter(Boolean);
			const nameOverlap = wordsA.filter((w) => wordsB.includes(w)).length;
			candidates.push({ a, b, similarity: Number(score.toFixed(4)), nameOverlap });
		}
	}
	candidates.sort((x, y) => y.similarity - x.similarity);
	return candidates.slice(0, 20);
}

/** 执行一次完整维护：去重 + 压缩索引 + 统计 + 合并候选。 */
export function runMaintain(root, maxLines, opts = {}) {
	const dedupe = dedupeEntries(root, opts);
	const compress = compressIndexEntries(root, maxLines, opts.heat);
	const stats = computeNamespaceStats(root);
	const mergeCandidates = findMergeCandidates(root, opts);
	const report = {
		runAt: new Date().toISOString(),
		dedupe,
		compress,
		stats,
		mergeCandidates,
	};
	atomicWriteFileSync(join(root, "maintenance-report.json"), JSON.stringify(report, null, 2));
	return report;
}

/** 收集一个命名空间的全部可检索文档（facts sections + sops + 归档条目）。 */
export function collectDocs(root, { includeArchived = true } = {}) {
	const docs = [];
	for (const topic of factSections(root)) {
		const archived = isArchived(root, "fact", topic);
		if (archived && !includeArchived) continue;
		docs.push({ kind: "fact", name: topic, archived, text: readFact(root, topic) ?? "" });
	}
	for (const slug of sopNames(root)) {
		const archived = isArchived(root, "sop", slug);
		if (archived && !includeArchived) continue;
		docs.push({ kind: "sop", name: slug, archived, text: readSop(root, slug) ?? "" });
	}
	if (includeArchived) {
		// archive/ 里的独立文件（dedupe/update 留下的副本）也可检索
		try {
			for (const f of readdirSync(join(root, ARCHIVE_DIR))) {
				if (!f.endsWith(".md")) continue;
				const text = readFileSync(join(root, ARCHIVE_DIR, f), "utf8");
				docs.push({ kind: "archived", name: f.replace(/\.md$/, ""), archived: true, text });
			}
		} catch { /* 无 archive 目录 */ }
	}
	return docs;
}
