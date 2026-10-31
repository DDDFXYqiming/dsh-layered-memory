import { readFileSync } from "node:fs";
import { join } from "node:path";
import { rewriteFile } from "./store.js";

export const MAINTENANCE_RETRY_FILE = "maintenance-retry.json";
const BASE_DELAY_MS = 30 * 60000;
const MAX_DELAY_MS = 6 * 3600000;

const emptyRetry = revision => ({ revision, retryCount: 0, retryReason: null, nextEligibleAt: null });

export function readMaintenanceRetry(root, revision) {
	let state;
	try { state = JSON.parse(readFileSync(join(root, MAINTENANCE_RETRY_FILE), "utf8")); }
	catch (error) { if (error.code === "ENOENT") return emptyRetry(revision); throw error; }
	return state.revision === revision ? state : emptyRetry(revision);
}

export function resetMaintenanceRetry(root, revision) {
	const state = readMaintenanceRetry(root, revision);
	rewriteFile(join(root, MAINTENANCE_RETRY_FILE), text => {
		if (text !== null && JSON.parse(text).revision === revision) return null;
		return JSON.stringify(state, null, 2);
	});
	return state;
}

export function maintenanceEligibility(retry, lastDispatchedAt, cooldownMinutes, now = Date.now()) {
	const cooldownUntil = (Date.parse(lastDispatchedAt) || 0) + cooldownMinutes * 60000;
	const retryUntil = Date.parse(retry.nextEligibleAt) || 0;
	const next = Math.max(cooldownUntil, retryUntil);
	return { retryCount: retry.retryCount, retryReason: retry.retryReason || (cooldownUntil > now ? "cooldown" : null),
		nextEligibleAt: next > now ? new Date(next).toISOString() : null };
}

export function recordMaintenanceRetry(root, { revision, progressed, reason, runId, finishedAt }) {
	let state;
	rewriteFile(join(root, MAINTENANCE_RETRY_FILE), text => {
		const previous = text === null ? emptyRetry(revision) : JSON.parse(text);
		if (previous.lastRunId === runId && previous.revision === revision && previous.retryReason === (reason || null)) {
			state = previous;
			return null;
		}
		const count = previous.revision === revision && !progressed ? previous.retryCount || 0 : 0;
		const retryCount = reason && reason !== "user_stopped" ? count + 1 : 0;
		const delay = reason === "user_stopped" ? BASE_DELAY_MS : Math.min(MAX_DELAY_MS, BASE_DELAY_MS * 2 ** Math.min(4, Math.max(0, retryCount - 1)));
		state = { revision, retryCount, retryReason: reason || null,
			nextEligibleAt: reason ? new Date(Date.parse(finishedAt) + delay).toISOString() : null,
			lastRunId: runId, lastFinishedAt: finishedAt };
		return JSON.stringify(state, null, 2);
	});
	return state;
}
