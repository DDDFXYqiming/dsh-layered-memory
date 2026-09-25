// 维护：近重复去重（内容级）、合并候选（内容级）、完整维护流程。
// [v0.5] 相似度从"文件名分词 + 精确内容相等"升级为词元集合 Jaccard，
// 消灭纯名称匹配产生的大量误报（实测 20/20 全错）。

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { atomicWriteFileSync } from "./atomic-write.js";
import { recordMaintainOutcome, recordMaintainFailure } from "./reflection.js";
import {
	ARCHIVE_DIR,
	factSections,
	sopNames,
	isArchived,
	readFact,
	readSop,
	readFactDupes,
	upsertFact,
	readMeta,
	hashText,
	computeNamespaceStats,
	activeEntries,
	loadAccess,
	entryHeat,
} from "./store.js";
import { syncIndex, readIndex, indexChars, L1_MAX_CHARS_DEFAULT } from "./l1index.js";
import { normalizeText, exactNormalize, tokenize, jaccard } from "./similarity.js";

/** 近重复候选阈值：分词集合 Jaccard 达到该值即列入候选（不自动归档，见 dedupeEntries）。 */
export const NEAR_DUPE_THRESHOLD = 0.85;
/** 合并候选报告阈值：达到该值提示"内容高度重叠，可考虑合并"。 */
export const MERGE_CANDIDATE_THRESHOLD = 0.45;
/** 模糊比对最小词元数：过短内容信号不足，只走精确 hash 去重（防止 "fact 1" vs "fact 2" 这类误判）。 */
export const MIN_TOKENS_FOR_FUZZY = 12;

/** 分词集合（ASCII 词 + 单数字 + CJK bigram）：对中文微编辑比字符 n-gram 更稳健。 */
function tokenSet(text) {
	return new Set(tokenize(text));
}

/** 模糊比对资格：双方词元数都达到 MIN_TOKENS_FOR_FUZZY 才参与 Jaccard 判定。 */
function fuzzyEligible(a, b, minTokens = MIN_TOKENS_FOR_FUZZY) {
	return a.size >= minTokens && b.size >= minTokens;
}

/**
 * 近重复候选的报告上限（候选只报告不处置，超出部分按相似度取前 N）。
 */
export const NEAR_DUPE_REPORT_LIMIT = 20;

/**
 * 在活跃条目之间收集近重复候选（只报告，不修改任何条目）。
 * 词元集合无法表达否定、参数与操作顺序，因此这里的结果必须经语义确认后才能合并。
 */
function collectNearDuplicates(entries, kind, threshold, minTokens, out) {
	const names = [...entries.keys()].sort();
	const found = [];
	for (let i = 0; i < names.length; i++) {
		for (let j = i + 1; j < names.length; j++) {
			const a = entries.get(names[i]);
			const b = entries.get(names[j]);
			if (!fuzzyEligible(a, b, minTokens)) continue;
			const score = jaccard(a, b);
			if (score < threshold) continue;
			found.push({ kind, a: names[i], b: names[j], similarity: Number(score.toFixed(4)) });
		}
	}
	found.sort((x, y) => y.similarity - x.similarity || x.a.localeCompare(y.a));
	for (const row of found.slice(0, NEAR_DUPE_REPORT_LIMIT)) out.push(row);
	return found.length;
}

/**
 * [0.6.9] 自动去重判定与检索归一化彻底分离（review 反例：normalizeText 折叠
 * 大小写与空白后，/srv/App 与 /srv/app、两空格与一空格被判同；且 fact 分支比较的
 * 是不含主题名的正文，"开发环境构建命令" 与 "生产环境构建命令" 同写 pnpm build
 * 也会被误判重复而隐藏）。现行判定：
 *  - 判定重复只用 exactNormalize（换行/行尾空白/尾部空行的明确规范化），不折叠大小写；
 *  - 只有同名同内容（同一身份）才自动处理——facts.md 同名重复 section 无损合并；
 *  - 同名不同内容是冲突不是重复：只报告，交人工/维护子任务裁决；
 *  - 跨条目内容一致（哪怕逐字节相同）只报候选：不同主题名在陈述不同对象的事实，
 *    正文一样不代表第二条可以被第一条替代。
 */
export function dedupeEntries(root, opts = {}) {
	const nearDupe = opts.nearDupeThreshold ?? NEAR_DUPE_THRESHOLD;
	const minTokens = opts.minTokensForFuzzy ?? MIN_TOKENS_FOR_FUZZY;
	const report = { removed: [], merged: [], conflicts: [], exactDuplicates: [], nearDuplicates: [] };

	// ── facts：同名重复段处理 + 跨名一致候选 + 近重复候选 ──
	const seenTopics = new Set();
	const byExactHash = new Map();
	const byNormHash = new Map();
	const liveFacts = new Map();
	for (const topic of factSections(root)) {
		if (seenTopics.has(topic)) continue; // 同名重复段只按首次出现处理一次
		seenTopics.add(topic);
		const dupes = readFactDupes(root, topic);
		if (dupes.length > 1) {
			const hashes = new Set(dupes.map((d) => hashText(exactNormalize(d))));
			if (hashes.size === 1) {
				// 同名同内容：无损合并（upsertFact 会先把多余段快照到 .history/）。
				try {
					upsertFact(root, topic, dupes[0]);
					report.merged.push(`fact:${topic}（同名同内容重复段已合并）`);
				} catch { /* 合并失败保持现状，等下轮 */ }
			} else {
				report.conflicts.push({ kind: "fact", name: topic, sections: dupes.length, reason: "同名段内容不同，需人工裁决（未自动合并）" });
			}
		}
		if (isArchived(root, "fact", topic)) continue;
		const content = readFact(root, topic);
		if (content === null) continue;
		const exactHash = hashText(exactNormalize(content));
		const normHash = hashText(normalizeText(content));
		if (byExactHash.has(exactHash)) {
			report.exactDuplicates.push({ kind: "fact", a: byExactHash.get(exactHash), b: topic, match: "exact" });
		} else if (byNormHash.has(normHash)) {
			report.exactDuplicates.push({ kind: "fact", a: byNormHash.get(normHash), b: topic, match: "normalized" });
		} else {
			byExactHash.set(exactHash, topic);
			byNormHash.set(normHash, topic);
		}
		liveFacts.set(topic, tokenSet(normalizeText(content)));
	}
	collectNearDuplicates(liveFacts, "fact", nearDupe, minTokens, report.nearDuplicates);

	// ── sops：跨名一致候选 + 近重复候选（文件名唯一，无同名重复段）──
	const bySopExact = new Map();
	const bySopNorm = new Map();
	const liveSops = new Map();
	for (const slug of sopNames(root)) {
		if (isArchived(root, "sop", slug)) continue;
		const content = readSop(root, slug);
		if (content === null) continue;
		const exactHash = hashText(exactNormalize(content));
		const normHash = hashText(normalizeText(content));
		if (bySopExact.has(exactHash)) {
			report.exactDuplicates.push({ kind: "sop", a: bySopExact.get(exactHash), b: slug, match: "exact" });
		} else if (bySopNorm.has(normHash)) {
			report.exactDuplicates.push({ kind: "sop", a: bySopNorm.get(normHash), b: slug, match: "normalized" });
		} else {
			bySopExact.set(exactHash, slug);
			bySopNorm.set(normHash, slug);
		}
		liveSops.set(slug, tokenSet(normalizeText(content)));
	}
	collectNearDuplicates(liveSops, "sop", nearDupe, minTokens, report.nearDuplicates);

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

/** 零访问复核窗口：创建超过该天数且衰减热度 < 0.5 的条目列入"待复核"（不自动隐藏、不自动删）。 */
export const COLD_REVIEW_DAYS = 90;

/**
 * 冷条目复核清单：让访问热度有真实消费者（此前热度只服务于 L1 裁剪，
 * 而裁剪本身已被证明是"能力永久隐身"的来源）。这里只做报告，不动数据。
 */
export function findColdEntries(root, { heat = {}, days, limit = 10 } = {}) {
	// [0.6.1 N5] 窗口天数入 Config（maintainOpts.coldReviewDays 经 runMaintain 传进 days）；
	// limit 是报告展示条数上限，保留模块常量语义。
	const windowDays = days ?? COLD_REVIEW_DAYS;
	const access = loadAccess(root);
	const meta = readMeta(root);
	const { facts, sops } = activeEntries(root);
	const now = Date.now();
	const rows = [];
	for (const [kind, list] of [["fact", facts], ["sop", sops]]) {
		for (const key of list) {
			const createdAt = (kind === "fact" ? meta.facts : meta.sops)[key]?.createdAt;
			// [0.6.1 M1] createdAt 缺失/非法时 ageDays 为 Infinity/NaN，Math.round 后仍是非有限数，
			// 整个返回体会被宿主判「not lossless JSON」而整包报废（老库必炸，2026-09-17 已知 bug）。
			// 根因处消毒：不可得的时间差一律落 null；heat 同法（访问统计损坏时 score 可为 NaN）。
			const parsed = createdAt ? Date.parse(createdAt) : NaN;
			const ageDays = Number.isFinite(parsed) ? (now - parsed) / 86400000 : Infinity;
			if (ageDays < windowDays) continue;
			const score = entryHeat(access, meta, kind, key, heat);
			if (score >= 0.5) continue;
			rows.push({
				kind,
				name: key,
				heat: Number.isFinite(score) ? Number(score.toFixed(3)) : null,
				age_days: Number.isFinite(ageDays) ? Math.round(ageDays) : null,
			});
		}
	}
	rows.sort((a, b) => a.heat - b.heat || a.name.localeCompare(b.name));
	return { threshold_days: windowDays, count: rows.length, entries: rows.slice(0, limit) };
}

/** 执行一次完整维护：去重 + 索引核对（存在性全量，不裁剪）+ 统计 + 合并候选 + 冷条目复核。
 * [0.6.6] 结束时把「这批内容已检查过、结论是什么」写回命名空间级反思状态：
 * 自动周期维护与手动 memory_maintain 共用同一份消警依据（审查 F1：此前维护结果
 * 无人消费，健康存量每过一个冷却窗口就被重新要求整理一次）。 */
export function runMaintain(root, maxChars = L1_MAX_CHARS_DEFAULT, opts = {}) {
	try {
		const dedupe = dedupeEntries(root, opts);
		const index = syncIndex(root, maxChars);
		const stats = computeNamespaceStats(root);
		const mergeCandidates = findMergeCandidates(root, opts);
		const cold = findColdEntries(root, { ...opts, days: opts.coldReviewDays });
		const report = {
			runAt: new Date().toISOString(),
			dedupe,
			index: { ...index, index_chars_actual: indexChars(readIndex(root)) },
			stats,
			mergeCandidates,
			cold,
		};
		atomicWriteFileSync(join(root, "maintenance-report.json"), JSON.stringify(report, null, 2));
		try { recordMaintainOutcome(root, report); } catch { /* 状态回写失败不阻断维护 */ }
		return report;
	} catch (err) {
		try { recordMaintainFailure(root, err); } catch { /* 忽略 */ }
		throw err;
	}
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
