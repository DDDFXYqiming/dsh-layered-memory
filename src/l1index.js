// L1 索引：读取/分段/重建/按热度压缩。行为与 v0.4 保持一致（测试锁定）。

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { atomicWriteFileSync } from "./atomic-write.js";
import { AUTO_BEGIN, AUTO_END, INDEX_TEMPLATE } from "./templates.js";
import { activeEntries, entryHeat, loadAccess, readMeta } from "./store.js";

export function readIndex(root) {
	try {
		return readFileSync(join(root, "index.txt"), "utf8");
	} catch {
		return "";
	}
}

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

/** 重建 index.txt 的自动段（活跃 L2 + L3），过滤 archived；保留并清理 RULES 手动段。 */
export function syncIndex(root, maxIndexLines = 30) {
	const p = join(root, "index.txt");
	const { head, tail } = readIndexSections(root);
	const { facts, sops } = activeEntries(root);
	const rebuilt = composeIndex(head, buildAutoLines(facts, sops), tail);
	atomicWriteFileSync(p, rebuilt);
	const lines = countIndexLines(rebuilt);
	return { index_lines: lines, max_index_lines: maxIndexLines, over_limit: lines > maxIndexLines };
}

/**
 * 压缩 L1 索引：只有完整索引超过 maxIndexLines 时才按访问热度裁剪。
 * 实际记忆文件不删除；被裁剪的层仍保留隐藏数量提示，避免完全不可发现。
 */
export function compressIndexEntries(root, maxLines, heat = {}) {
	const { facts: allFacts, sops: allSops } = activeEntries(root);
	const access = loadAccess(root);
	const meta = readMeta(root);
	const heatOf = (kind, key) => entryHeat(access, meta, kind, key, heat);
	const rank = (kind) => (a, b) => {
		const heat = heatOf(kind, b) - heatOf(kind, a);
		return heat || String(a).localeCompare(String(b));
	};
	const facts = [...allFacts].sort(rank("fact"));
	const sops = [...allSops].sort(rank("sop"));
	const { head, tail } = readIndexSections(root);
	const fullLines = buildAutoLines(facts, sops);
	const fullIndex = composeIndex(head, fullLines, tail);
	const totalLines = countIndexLines(fullIndex);

	// 未超限时也写回规范化后的完整索引，但绝不裁剪条目。
	if (totalLines <= maxLines) {
		atomicWriteFileSync(join(root, "index.txt"), fullIndex);
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

	// [v0.5] 贪心装入：从每层保底 1 条开始，按热度降序逐个尝试加入，
	// 每步用真实行数核算（含空层占位行），保证压缩结果不超预算。
	const linesFor = (fc, sc, hf, hs) =>
		countIndexLines(composeIndex(head, buildAutoLines(facts.slice(0, fc), sops.slice(0, sc), hf, hs), tail));
	let factCount = facts.length ? 1 : 0;
	let sopCount = sops.length ? 1 : 0;
	let hiddenFacts = facts.length - factCount;
	let hiddenSops = sops.length - sopCount;
	if (linesFor(factCount, sopCount, hiddenFacts, hiddenSops) <= maxLines) {
		const candidates = [
			...facts.slice(factCount).map((topic) => ({ kind: "fact", topic, score: heatOf("fact", topic) })),
			...sops.slice(sopCount).map((slug) => ({ kind: "sop", topic: slug, score: heatOf("sop", slug) })),
		].sort((a, b) => (b.score - a.score) || a.kind.localeCompare(b.kind) || a.topic.localeCompare(b.topic));
		for (const candidate of candidates) {
			const nextFacts = factCount + (candidate.kind === "fact" ? 1 : 0);
			const nextSops = sopCount + (candidate.kind === "sop" ? 1 : 0);
			const nextHiddenFacts = facts.length - nextFacts;
			const nextHiddenSops = sops.length - nextSops;
			if (linesFor(nextFacts, nextSops, nextHiddenFacts, nextHiddenSops) <= maxLines) {
				factCount = nextFacts;
				sopCount = nextSops;
				hiddenFacts = nextHiddenFacts;
				hiddenSops = nextHiddenSops;
			}
		}
	}
	const keptFacts = facts.slice(0, factCount);
	const keptSops = sops.slice(0, sopCount);
	const autoLines = buildAutoLines(keptFacts, keptSops, hiddenFacts, hiddenSops);
	atomicWriteFileSync(join(root, "index.txt"), composeIndex(head, autoLines, tail));
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
