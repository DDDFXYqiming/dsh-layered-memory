import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { atomicWriteFileSync } from "./atomic-write.js";
import { recordMaintainOutcome, recordMaintainFailure } from "./reflection.js";
import { ARCHIVE_DIR, readEntries, readMeta, computeNamespaceStats, pendingNames, loadAccess, entryHeat, withNsWriteLock, reconcileEntries } from "./store.js";
import { syncIndex, readIndex, indexChars, L1_MAX_CHARS_DEFAULT } from "./l1index.js";
import { exactNormalize, tokenize, jaccard } from "./similarity.js";

export const NEAR_DUPE_THRESHOLD = 0.85;
export const MERGE_CANDIDATE_THRESHOLD = 0.45;
export const MIN_TOKENS_FOR_FUZZY = 12;
export const NEAR_DUPE_REPORT_LIMIT = 20;
export const COLD_REVIEW_DAYS = 90;

// One file scan and one pair comparison pass feed both duplicate and merge reports.
function compareEntries(entries, opts) {
	const report = { removed: [], merged: [], conflicts: [], exactDuplicates: [], nearDuplicates: [] };
	const mergeCandidates = [];
	const identities = new Map();
	for (const entry of entries) {
		const id = JSON.stringify([entry.kind, entry.key]);
		const previous = identities.get(id);
		if (previous && exactNormalize(previous.content) !== exactNormalize(entry.content)) {
			report.conflicts.push({ kind: entry.kind, name: entry.key, reason: "同一条目存在不同正文的重复段" });
		}
		identities.set(id, entry);
	}
	const active = entries.filter(entry => !entry.meta.archived).map(entry => ({ ...entry, exact: exactNormalize(entry.content), tokens: new Set(tokenize(entry.content)) }));
	const near = opts.nearDupeThreshold ?? NEAR_DUPE_THRESHOLD;
	const merge = opts.mergeCandidateThreshold ?? MERGE_CANDIDATE_THRESHOLD;
	const min = opts.minTokensForFuzzy ?? MIN_TOKENS_FOR_FUZZY;
	for (let i = 0; i < active.length; i++) {
		for (let j = i + 1; j < active.length; j++) {
			const a = active[i], b = active[j];
			if (a.kind !== b.kind) continue;
			if (a.exact === b.exact) {
				report.exactDuplicates.push({ kind: a.kind, a: a.key, b: b.key, match: "exact", sameIdentity: a.key === b.key });
				continue;
			}
			if (a.tokens.size < min || b.tokens.size < min) continue;
			const score = jaccard(a.tokens, b.tokens);
			const row = { kind: a.kind, a: a.key, b: b.key, similarity: Number(score.toFixed(4)) };
			if (score >= near) report.nearDuplicates.push(row);
			if (a.kind === "sop" && score >= merge) mergeCandidates.push(row);
		}
	}
	const descending = (a, b) => b.similarity - a.similarity || a.a.localeCompare(b.a);
	report.nearDuplicates.sort(descending);
	mergeCandidates.sort(descending);
	return { dedupe: report, mergeCandidates };
}

export function dedupeEntries(root, opts = {}) { return compareEntries(readEntries(root), opts).dedupe; }
export function findMergeCandidates(root, opts = {}) { return compareEntries(readEntries(root), opts).mergeCandidates.slice(0, NEAR_DUPE_REPORT_LIMIT); }

export function findColdEntries(root, { heat = {}, days = COLD_REVIEW_DAYS, limit = 10, entries = readEntries(root) } = {}) {
	const access = loadAccess(root), meta = readMeta(root), now = Date.now();
	const rows = [];
	for (const entry of entries) {
		if (entry.meta.archived) continue;
		const created = Date.parse(entry.meta.createdAt);
		const age = Number.isFinite(created) ? (now - created) / 86400000 : null;
		const score = entryHeat(access, meta, entry.kind, entry.key, heat);
		if (age !== null && age < days || score >= 0.5) continue;
		rows.push({ kind: entry.kind, name: entry.key, heat: Number(score.toFixed(3)), age_days: age === null ? null : Math.round(age) });
	}
	rows.sort((a, b) => a.heat - b.heat || a.name.localeCompare(b.name));
	return { threshold_days: days, count: rows.length, entries: rows.slice(0, limit) };
}

export function runMaintain(root, maxChars = L1_MAX_CHARS_DEFAULT, opts = {}) {
	return withNsWriteLock(root, () => {
		try {
			const consistency = reconcileEntries(root);
			const entries = readEntries(root);
			const { dedupe, mergeCandidates } = compareEntries(entries, opts);
			const index = syncIndex(root, maxChars, entries);
			const stats = computeNamespaceStats(root, entries);
			const cold = findColdEntries(root, { ...opts, days: opts.coldReviewDays ?? COLD_REVIEW_DAYS, entries });
			const counts = { pending: pendingNames(root).length, conflicts: dedupe.conflicts.length, exact_duplicates: dedupe.exactDuplicates.length, near_duplicates: dedupe.nearDuplicates.length, merge_candidates: mergeCandidates.length };
			const reasons = Object.keys(counts).filter(key => counts[key] > 0);
			const report = {
				runAt: new Date().toISOString(), consistency, stats, cold,
				index: { ...index, index_chars_actual: indexChars(readIndex(root)) },
				dedupe: { ...dedupe, nearDuplicates: dedupe.nearDuplicates.slice(0, NEAR_DUPE_REPORT_LIMIT) },
				mergeCandidates: mergeCandidates.slice(0, NEAR_DUPE_REPORT_LIMIT),
				actionable: { needsModelReview: reasons.length > 0, reasons, counts },
			};
			atomicWriteFileSync(join(root, "maintenance-report.json"), JSON.stringify(report, null, 2));
			recordMaintainOutcome(root, report);
			return report;
		} catch (error) {
			recordMaintainFailure(root, error);
			throw error;
		}
	});
}

export function collectDocs(root, { includeArchived = false } = {}) {
	const docs = readEntries(root).filter(entry => includeArchived || !entry.meta.archived).map(entry => ({
		kind: entry.kind, name: entry.key, title: entry.title, archived: Boolean(entry.meta.archived), text: entry.content,
	}));
	const archive = join(root, ARCHIVE_DIR);
	if (includeArchived && existsSync(archive)) {
		for (const file of readdirSync(archive).filter(file => file.endsWith(".md"))) {
			docs.push({ kind: "archive", name: file, title: file, archived: true, text: readFileSync(join(archive, file), "utf8") });
		}
	}
	return docs;
}
