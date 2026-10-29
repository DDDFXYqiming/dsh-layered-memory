// 热度排序：热度只决定提示词视图里的推荐顺序与截断先后，不决定条目是否存在。
// 全量目录、memory_search、memory_list 永远不读这里。
import { entryHeat, hashText } from "./store.js";
import { BM25Index } from "./similarity.js";

export const NEW_ENTRY_DAYS_DEFAULT = 7;
export const NEW_ENTRY_BONUS_DEFAULT = 1.5;
export const RELATED_BONUS_DEFAULT = 0.25;
export const RELATED_BONUS_CAP_DEFAULT = 0.5;
export const COLD_EXPLORE_RATIO_DEFAULT = 0.12;
export const COLD_EXPLORE_MAX = 24;
// 热窗口（前 N 条）之外的条目都进入探索池轮转，避免排名靠后者永久隐身。
export const COLD_POOL_START = 24;
export const RECALL_LIMIT_DEFAULT = 8;
export const RECALL_MAX_CHARS_DEFAULT = 600;

const DAY_MS = 86400000;

export function entryId(kind, key) { return kind + ":" + key; }
export function parseEntryId(id) {
	const at = String(id).indexOf(":");
	return at < 0 ? { kind: "", key: String(id) } : { kind: id.slice(0, at), key: id.slice(at + 1) };
}

/** 被其它活跃条目 related 引用的次数（入链）。字符串形式的旧关系无法解析，跳过。 */
export function relatedIncoming(entries) {
	const counts = new Map();
	for (const entry of entries) {
		if (entry.meta?.archived) continue;
		for (const relation of entry.meta?.related || []) {
			if (!relation || typeof relation === "string") continue;
			const kind = relation.kind, key = relation.key;
			if (!kind || !key) continue;
			const id = entryId(kind, key);
			counts.set(id, (counts.get(id) || 0) + 1);
		}
	}
	return counts;
}

/** 新手保护：创建后 days 天内线性衰减，第 0 天拿满 bonus，到 days 天归零。 */
export function newbieBonus(meta, { now = Date.now(), days = NEW_ENTRY_DAYS_DEFAULT, bonus = NEW_ENTRY_BONUS_DEFAULT } = {}) {
	if (!(days > 0) || !(bonus > 0)) return 0;
	const created = Date.parse(meta?.createdAt || "");
	if (!Number.isFinite(created)) return 0;
	const ageDays = (now - created) / DAY_MS;
	if (ageDays < 0) return bonus;
	if (ageDays >= days) return 0;
	return bonus * (1 - ageDays / days);
}

/**
 * 计算每个活跃条目的热度分：衰减访问分 + related 入链小额加分（封顶）+ 新手保护。
 * access 是 file_access_stats.json 的内容，meta 是 memory-meta.json 的内容。
 */
export function scoreEntries(entries, {
	access = {}, meta = {}, heat = {}, now = Date.now(),
	relatedBonus = RELATED_BONUS_DEFAULT, relatedCap = RELATED_BONUS_CAP_DEFAULT,
	newEntryDays = NEW_ENTRY_DAYS_DEFAULT, newEntryBonus = NEW_ENTRY_BONUS_DEFAULT,
} = {}) {
	const incoming = relatedIncoming(entries);
	const scores = new Map();
	for (const entry of entries) {
		if (entry.meta?.archived) continue;
		const id = entryId(entry.kind, entry.key);
		const base = entryHeat(access, meta, entry.kind, entry.key, heat);
		const related = Math.min(relatedCap, (incoming.get(id) || 0) * relatedBonus);
		const newbie = newbieBonus(entry.meta, { now, days: newEntryDays, bonus: newEntryBonus });
		const bucket = entry.kind === "fact" ? meta?.facts : meta?.sops;
		const createdAt = entry.meta?.createdAt || bucket?.[entry.key]?.createdAt || null;
		scores.set(id, { score: base + related + newbie, base, related, newbie, createdAt, lastAt: access[id]?.lastAt || null });
	}
	return scores;
}

/**
 * 排序：分数降序；同分时新条目优先（创建时间倒序），再按原有目录顺序稳定。
 * 返回 id -> 序号（0 最热）。序号只用于提示词视图，不写回磁盘目录。
 */
export function rankEntries(entries, scores) {
	const rows = [];
	entries.forEach((entry, index) => {
		if (entry.meta?.archived) return;
		const id = entryId(entry.kind, entry.key);
		const item = scores.get(id);
		const created = Date.parse(item?.createdAt || "");
		rows.push({ id, index, score: item?.score ?? 0, created: Number.isFinite(created) ? created : -Infinity });
	});
	rows.sort((a, b) => b.score - a.score || b.created - a.created || a.index - b.index);
	const rank = new Map();
	rows.forEach((row, position) => rank.set(row.id, position));
	return rank;
}

/**
 * 冷条目探索位：从热窗口之外的全部条目里按会话种子轮转挑选，保证低热度条目不会被永久挤出提示词。
 * 同一会话稳定，不同会话换一批。
 */
export function pickColdSet(orderedIds, {
	sessionSeed = "", ratio = COLD_EXPLORE_RATIO_DEFAULT, max = COLD_EXPLORE_MAX, poolStart = COLD_POOL_START,
} = {}) {
	const total = orderedIds.length;
	if (!total) return new Set();
	const count = Math.min(max, Math.max(1, Math.ceil(total * ratio)));
	// 探索池覆盖“热条目窗口之外的全部条目”，而不是只取最冷的几条：
	// 否则排名靠后的条目永远进不了池子，等于永久隐身。排序决定的是优先推荐，不是存在性。
	const pool = orderedIds.slice(Math.min(total, Math.max(0, poolStart)));
	if (!pool.length) return new Set();
	const rotated = [...pool].sort((a, b) => {
		const ha = hashText(sessionSeed + "|" + a), hb = hashText(sessionSeed + "|" + b);
		return ha.localeCompare(hb) || a.localeCompare(b) || 0;
	});
	return new Set(rotated.slice(0, Math.min(count, rotated.length)));
}

/** 按当前请求召回相关条目（BM25 纯文本）。只作为提示词补充，不改变全量检索。 */
export function recallEntries(entries, query, { limit = RECALL_LIMIT_DEFAULT, minScore = 0 } = {}) {
	const text = String(query ?? "").trim();
	if (text.length < 2) return [];
	const index = new BM25Index();
	const byId = new Map();
	for (const entry of entries) {
		if (entry.meta?.archived) continue;
		const id = entryId(entry.kind, entry.key);
		index.addDoc(id, entry.title + "\n" + entry.key + "\n" + entry.content);
		byId.set(id, entry);
	}
	return index.search(text, limit)
		.filter(row => row.score >= minScore)
		.map(row => ({ entry: { kind: byId.get(row.id).kind, key: byId.get(row.id).key }, title: byId.get(row.id).title, score: Number(row.score.toFixed(4)) }));
}

/** 把召回结果渲染成一行提示词；与已有条目层重复的由 l1index 去重。 */
export function recallLine(rows) {
	if (!rows?.length) return "";
	return "召回（与本次请求相关）：" + rows.map(row => "[" + row.entry.kind + "] " + row.entry.key).join(" | ");
}
