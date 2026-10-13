import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { rewriteFile, hashText, readEntries, META_FILE, PENDING_DIR } from "./store.js";

export const REFLECTION_STATE_FILE = "reflection-state.json";
export const REFLECTION_OUTCOME = {
	NO_ACTION: "no_action", NEEDS_REVIEW: "needs_review", DONE: "done", FAILED: "failed",
};
export const SETTLED_OUTCOMES = new Set(["no_action", "done"]);

function readOptional(path, fallback = "") {
	try { return readFileSync(path, "utf8"); }
	catch (error) { if (error.code === "ENOENT") return fallback; throw error; }
}
function markdownNames(path) {
	try { return readdirSync(path).filter(name => name.endsWith(".md")).sort(); }
	catch (error) { if (error.code === "ENOENT") return []; throw error; }
}

// One content revision for scanning, notification and model maintenance. Provenance,
// access counts, timestamps and reports do not change the semantic memory version.
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

// Thresholds request a program scan; only its actionable result may request a model.
export function reflectionBuckets(signals, cfg = {}) {
	const buckets = [];
	if (cfg.reflectPendingThreshold > 0 && signals.pending >= cfg.reflectPendingThreshold) buckets.push("pending");
	if (cfg.reflectSopsThreshold > 0 && signals.sops >= cfg.reflectSopsThreshold) buckets.push("sops");
	if (signals.indexChars > cfg.l1MaxChars) buckets.push("index");
	return buckets;
}
export function isSettledRevision(state, revision) {
	return state.revision === revision && SETTLED_OUTCOMES.has(state.outcome);
}
export function decideReflection({ enabled, cooled, state, revision, signals, cfg }) {
	const buckets = reflectionBuckets(signals, cfg);
	if (!enabled) return { notify: false, reason: "disabled", buckets };
	if (!cooled) return { notify: false, reason: "cooldown", buckets };
	if (isSettledRevision(state, revision)) return { notify: false, reason: "settled", buckets };
	if (state.notifiedRevision === revision) return { notify: false, reason: "already-notified", buckets };
	if (!state.actionable?.needsModelReview) return { notify: false, reason: "no-action", buckets };
	return { notify: true, reason: "triggered", buckets };
}
export function recordMaintainOutcome(root, report) {
	const actionable = report.actionable;
	const revision = computeContentRevision(root);
	const previous = readReflectionState(root);
	const reviewed = previous.reviewedRevision === revision && SETTLED_OUTCOMES.has(previous.outcome);
	const changed = (report.dedupe?.removed?.length || 0) + (report.dedupe?.merged?.length || 0);
	return writeReflectionState(root, {
		revision,
		outcome: reviewed ? previous.outcome : actionable.needsModelReview ? "needs_review" : changed ? "done" : "no_action",
		actionable,
		lastScanAt: report.runAt || new Date().toISOString(),
		lastCounts: { sops: report.stats.sops, pending: report.stats.pending, indexChars: report.index.index_chars_actual ?? report.index.index_chars },
	});
}
export function recordMaintainFailure(root, error) {
	return writeReflectionState(root, { outcome: "failed", lastErrorAt: new Date().toISOString(), lastError: String(error.message || error) });
}
