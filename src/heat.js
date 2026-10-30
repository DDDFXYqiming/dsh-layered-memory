import { entryHeat, hashText } from "./store.js";
import { BM25Index } from "./similarity.js";

export const NEW_ENTRY_DAYS_DEFAULT = 7;
export const NEW_ENTRY_BONUS_DEFAULT = 1.5;
export const RELATED_BONUS_DEFAULT = 0.25;
export const RELATED_BONUS_CAP_DEFAULT = 0.5;
export const COLD_EXPLORE_RATIO_DEFAULT = 0.12;
export const COLD_EXPLORE_MAX = 24;
export const COLD_POOL_START = 24;
export const RECALL_LIMIT_DEFAULT = 8;
export const RECALL_MAX_CHARS_DEFAULT = 600;

const DAY_MS = 86400000;

export function entryId(kind, key) { return kind + ":" + key; }
export function parseEntryId(id) {
	const at = String(id).indexOf(":");
	return at < 0 ? { kind: "", key: String(id) } : { kind: id.slice(0, at), key: id.slice(at + 1) };
}

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

export function pickColdSet(orderedIds, {
	sessionSeed = "", ratio = COLD_EXPLORE_RATIO_DEFAULT, max = COLD_EXPLORE_MAX, poolStart = COLD_POOL_START,
} = {}) {
	const total = orderedIds.length;
	if (!total) return new Set();
	const count = Math.min(max, Math.max(1, Math.ceil(total * ratio)));
	const pool = orderedIds.slice(Math.min(total, Math.max(0, poolStart)));
	if (!pool.length) return new Set();
	const rotated = [...pool].sort((a, b) => {
		const ha = hashText(sessionSeed + "|" + a), hb = hashText(sessionSeed + "|" + b);
		return ha.localeCompare(hb) || a.localeCompare(b) || 0;
	});
	return new Set(rotated.slice(0, Math.min(count, rotated.length)));
}

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

export function recallLine(rows) {
	if (!rows?.length) return "";
	return "召回（与本次请求相关）：" + rows.map(row => "[" + row.entry.kind + "] " + row.entry.key).join(" | ");
}
