import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { rewriteFile, hashText, readEntries, META_FILE, PENDING_DIR } from "./store.js";
import { readReviewState } from "./review.js";

export const REFLECTION_STATE_FILE = "reflection-state.json";
export const SETTLED_OUTCOMES = new Set(["no_action", "reviewed", "waiting_evidence"]);

function readOptional(path, fallback = "") {
	try { return readFileSync(path, "utf8"); }
	catch (error) { if (error.code === "ENOENT") return fallback; throw error; }
}
function markdownNames(path) {
	try { return readdirSync(path).filter(name => name.endsWith(".md")).sort(); }
	catch (error) { if (error.code === "ENOENT") return []; throw error; }
}

export function computeContentRevision(root) {
	const parts = readEntries(root).map(entry => [entry.kind, entry.key, entry.revision]);
	parts.push(["index.txt", readOptional(join(root, "index.txt"))]);
	for (const name of markdownNames(join(root, PENDING_DIR))) parts.push([`${PENDING_DIR}/${name}`, readOptional(join(root, PENDING_DIR, name))]);
	return hashText(JSON.stringify(parts));
}

export function readReflectionState(root) {
	return JSON.parse(readOptional(join(root, REFLECTION_STATE_FILE), "{}"));
}
export function writeReflectionState(root, patch) {
	let out;
	rewriteFile(join(root, REFLECTION_STATE_FILE), text => {
		const current = text === null ? {} : JSON.parse(text);
		out = { ...current, ...patch };
		if (JSON.stringify(out) === JSON.stringify(current)) return null;
		out.updatedAt = new Date().toISOString();
		return JSON.stringify(out, null, 2);
	});
	return out;
}

export function collectReflectionSignals(root) {
	const meta = JSON.parse(readOptional(join(root, META_FILE), "{}"));
	const sops = markdownNames(join(root, "sops")).map(name => name.slice(0, -3))
		.filter(name => !["readme", "license", "index"].includes(name.toLowerCase()) && !meta.sops?.[name]?.archived).length;
	return { sops, pending: markdownNames(join(root, PENDING_DIR)).length, indexChars: readOptional(join(root, "index.txt")).trimEnd().length };
}

export function reflectionBuckets(signals, cfg = {}) {
	const buckets = [];
	if (cfg.reflectPendingThreshold > 0 && signals.pending >= cfg.reflectPendingThreshold) buckets.push("pending");
	if (cfg.reflectSopsThreshold > 0 && signals.sops >= cfg.reflectSopsThreshold) buckets.push("sops");
	if (signals.indexChars > cfg.l1MaxChars) buckets.push("index");
	return buckets;
}
export function isSettledRevision(state, revision) {
	return state.scanVersion === 2 && state.revision === revision && !state.review?.ready && SETTLED_OUTCOMES.has(state.outcome);
}
function computeWorkRevision(root, report) {
	const review = readReviewState(root);
	const versions = new Map(readEntries(root).map(entry => [JSON.stringify([entry.kind, entry.key]), entry.revision]));
	const entryVersion = (kind, key) => [kind, key, versions.get(JSON.stringify([kind, key])) ?? null];
	const sorted = rows => rows.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
	const jobs = [review.pressure, ...review.conflicts].filter(job => job && job.status !== "complete").map(job => [
		job.id, job.kind, job.status, job.items === null ? null : sorted(job.items.map(item => [item.entry.kind, item.entry.key, item.revision, item.status])),
		job.evidence || [],
	]);
	const candidates = [
		...(report.dedupe?.conflicts || []).map(item => ["conflict", entryVersion(item.kind, item.name)]),
		...(report.dedupe?.exactDuplicates || []).map(item => ["exact", sorted([entryVersion(item.kind, item.a), entryVersion(item.kind, item.b)])]),
		...(report.dedupe?.nearDuplicates || []).map(item => ["near", sorted([entryVersion(item.kind, item.a), entryVersion(item.kind, item.b)])]),
		...(report.mergeCandidates || []).map(item => ["merge", sorted([entryVersion(item.kind, item.a), entryVersion(item.kind, item.b)])]),
	];
	const pending = markdownNames(join(root, PENDING_DIR)).map(name => [name, hashText(readOptional(join(root, PENDING_DIR, name)))]);
	return hashText(JSON.stringify([sorted(jobs), sorted(candidates), pending]));
}
export function recordMaintainOutcome(root, report) {
	const actionable = report.actionable;
	const revision = computeContentRevision(root);
	const previous = readReflectionState(root);
	const reviewed = previous.scanVersion === 2 && previous.reviewedRevision === revision;
	const workRevision = computeWorkRevision(root, report);
	return writeReflectionState(root, {
		scanVersion: 2, revision, review: report.review, workRevision,
		...(workRevision !== previous.workRevision ? { workChangedAt: report.runAt || new Date().toISOString() } : {}),
		outcome: actionable.needsModelReview ? "needs_review" : report.review?.waiting ? "waiting_evidence" : reviewed ? "reviewed" : "no_action",
		actionable,
		lastScanAt: report.runAt || new Date().toISOString(),
		lastCounts: { sops: report.stats.sops, pending: report.stats.pending, indexChars: report.index.index_chars_actual ?? report.index.index_chars },
	});
}
export function recordMaintainFailure(root, error) {
	return writeReflectionState(root, { outcome: "failed", lastErrorAt: new Date().toISOString(), lastError: String(error.message || error) });
}
