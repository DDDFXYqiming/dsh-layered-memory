import { entryHeat } from "./store.js";
import { exactNormalize, tokenize } from "./similarity.js";

// 阈值与后台维护共用同一份来源；工作区只读不改这里的数值。
export const NEAR_DUPE_THRESHOLD = 0.85;
export const MERGE_CANDIDATE_THRESHOLD = 0.45;
export const MIN_TOKENS_FOR_FUZZY = 12;
export const NEAR_DUPE_REPORT_LIMIT = 20;
export const COLD_REVIEW_DAYS = 90;
export const COLD_MAX_HEAT = 0.5;
// 长短悬殊时的保守包含度：短侧 token 至少九成落在长侧里才算候选。
export const CONTAINMENT_MIN_RATIO = 0.9;

function sharedTokenCount(a, b) {
	let shared = 0;
	const [small, large] = a.size <= b.size ? [a, b] : [b, a];
	for (const token of small) if (large.has(token)) shared += 1;
	return shared;
}

function containmentRatio(a, b, shared) {
	const smaller = Math.min(a.size, b.size);
	return smaller === 0 ? 0 : shared / smaller;
}

/**
 * 长期低热条目：与后台维护同一套纯判定（同阈值、同排除、同排序）。
 * age 基准是条目 meta 的 createdAt（创建时间），不是最后访问时间。
 */
export function collectColdEntries(entries, { access = {}, meta = {}, heat = {}, days = COLD_REVIEW_DAYS, maxHeat = COLD_MAX_HEAT, now = Date.now() } = {}) {
	const rows = [];
	for (const entry of entries) {
		if (entry.kind === "rule" || entry.meta?.archived) continue;
		const created = Date.parse(entry.meta?.createdAt || "");
		const age = Number.isFinite(created) ? (now - created) / 86400000 : null;
		const score = entryHeat(access, meta, entry.kind, entry.key, heat);
		if (age !== null && age < days || score >= maxHeat) continue;
		rows.push({ kind: entry.kind, name: entry.key, heat: Number(score.toFixed(3)), age_days: age === null ? null : Math.round(age) });
	}
	rows.sort((a, b) => a.heat - b.heat || a.name.localeCompare(b.name));
	return rows;
}

/**
 * 人工维护工作区的候选扫描：纯计算，不写盘、不改后台阈值。
 * 复用后台的规范化与分词（src/similarity.js）；后台 compareEntries 的口径不变，
 * 这里额外覆盖 fact 的同类重合与长短悬殊内容的保守包含。
 */
export function scanCandidates(entries, {
	nearThreshold = NEAR_DUPE_THRESHOLD,
	overlapThreshold = MERGE_CANDIDATE_THRESHOLD,
	minTokens = MIN_TOKENS_FOR_FUZZY,
	minContainment = CONTAINMENT_MIN_RATIO,
	namespace = "default",
} = {}) {
	const prepared = entries
		.filter(entry => !entry.meta?.archived)
		.map(entry => ({
			kind: entry.kind,
			key: entry.key,
			title: entry.title,
			chars: entry.content.length,
			revision: entry.revision,
			exact: exactNormalize(entry.content),
			tokens: new Set(tokenize(entry.content)),
		}));
	const rows = [];
	for (let i = 0; i < prepared.length; i++) {
		for (let j = i + 1; j < prepared.length; j++) {
			const a = prepared[i], b = prepared[j];
			if (a.kind !== b.kind) continue;
			const shared = sharedTokenCount(a.tokens, b.tokens);
			let reason = null;
			let score = 0;
			if (a.exact === b.exact) {
				reason = "exact";
				score = 1;
			} else if (a.tokens.size >= minTokens && b.tokens.size >= minTokens) {
				const similarity = similarityScore(a.tokens, b.tokens);
				if (similarity >= nearThreshold) { reason = "near"; score = similarity; }
				else if (similarity >= overlapThreshold) { reason = "overlap"; score = similarity; }
			}
			if (!reason && shared >= minTokens) {
				const ratio = containmentRatio(a.tokens, b.tokens, shared);
				if (ratio >= minContainment) { reason = "contains"; score = ratio; }
			}
			if (!reason) continue;
			const left = a.key <= b.key ? a : b;
			const right = left === a ? b : a;
			rows.push({
				id: `${left.kind}:${left.key}::${right.kind}:${right.key}`,
				kind: left.kind,
				reason,
				score: Number(score.toFixed(4)),
				sharedTokens: shared,
				left: { entry: { namespace, kind: left.kind, key: left.key }, title: left.title, revision: left.revision, chars: left.chars },
				right: { entry: { namespace, kind: right.kind, key: right.key }, title: right.title, revision: right.revision, chars: right.chars },
			});
		}
	}
	rows.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
	return rows;
}

function similarityScore(a, b) {
	if (a.size === 0 && b.size === 0) return 1;
	if (a.size === 0 || b.size === 0) return 0;
	let inter = 0;
	for (const token of a) if (b.has(token)) inter += 1;
	const union = a.size + b.size - inter;
	return union === 0 ? 0 : inter / union;
}
