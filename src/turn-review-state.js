import { randomUUID } from "node:crypto";
import { join } from "node:path";
import { readFileSync } from "node:fs";
import { rewriteFile } from "./store.js";

const STATE_FILE = "turn-review-state.json";
const WINDOW = 32;
const SEEN_LIMIT = 128;
const SCOPE_LIMIT = 64;
const keyOf = (parentSession, namespace) => JSON.stringify([parentSession, namespace]);
const unique = values => [...new Set(values)];

function initialState(root, parentSession, namespace) {
	let runs;
	try { runs = JSON.parse(readFileSync(join(root, "maintenance-runs.json"), "utf8")).runs; }
	catch (error) { if (error.code !== "ENOENT") throw error; runs = []; }
	const dispatched = runs.filter(run => run.purpose === "turn_review" && run.parentSession === parentSession && run.namespace === namespace)
		.map(run => run.dispatchedAt || (run.session ? run.startedAt : null)).filter(Boolean)
		.sort((a, b) => Date.parse(b) - Date.parse(a));
	return { pending: [], seen: [], scanned: [], failures: [], lastDispatchedAt: dispatched[0] || null, claim: null };
}
function update(root, parentSession, namespace, change) {
	let result;
	rewriteFile(join(root, STATE_FILE), text => {
		const all = text === null ? { version: 1, scopes: {} } : JSON.parse(text);
		const key = keyOf(parentSession, namespace);
		const state = all.scopes[key] || initialState(root, parentSession, namespace);
		const previous = JSON.stringify(state);
		result = change(state);
		if (JSON.stringify(state) === previous) return null;
		state.updatedAt = new Date().toISOString();
		all.scopes[key] = state;
		const removable = Object.keys(all.scopes).filter(id => id !== key && !all.scopes[id].claim)
			.sort((a, b) => all.scopes[a].updatedAt.localeCompare(all.scopes[b].updatedAt));
		while (Object.keys(all.scopes).length > SCOPE_LIMIT && removable.length) delete all.scopes[removable.shift()];
		return JSON.stringify(all, null, 2);
	});
	return result;
}

export function prepareTurnReview(root, { parentSession, namespace, activity, minEvidence, cooldownMinutes, timeoutSeconds }) {
	return update(root, parentSession, namespace, state => {
		const now = Date.now();
		if (!state.scanned.includes(activity.endSeq)) {
			state.scanned = [...state.scanned, activity.endSeq].slice(-SEEN_LIMIT);
			const admitted = new Set();
			for (const event of activity.evidence) {
				if (event.failed) { state.failures = unique([...state.failures, event.tool]).slice(-WINDOW); continue; }
				const recovered = state.failures.includes(event.tool);
				state.failures = state.failures.filter(tool => tool !== event.tool);
				if (state.seen.includes(event.fingerprint)) continue;
				const source = { call_id: event.call_id, seq: event.seq, turn: activity.turn, endSeq: activity.endSeq };
				let item = state.pending.find(item => item.fingerprint === event.fingerprint);
				if (item) {
					item.sources = [...item.sources, source].slice(-4);
				} else {
					item = { fingerprint: event.fingerprint, tool: event.tool, turnSeq: activity.endSeq, outcome: event.changed || recovered, sources: [source], memories: activity.memories.slice(-16) };
					state.pending.push(item); admitted.add(item.fingerprint);
				}
			}
			const captured = item => item.sources.some(source => activity.savedCalls.includes(source.call_id) || activity.savedSeqs.includes(source.seq));
			const saved = state.pending.filter(captured).map(item => item.fingerprint);
			state.seen = unique([...state.seen, ...saved]).slice(-SEEN_LIMIT);
			state.pending = state.pending.filter(item => !captured(item)).slice(-WINDOW);
			if (state.pending.some(item => admitted.has(item.fingerprint))) state.triggerSeq = activity.endSeq;
		}
		if (state.claim && now - state.claim.at > (timeoutSeconds + 60) * 1000) state.claim = null;
		if (state.claim || state.triggerSeq !== activity.endSeq || state.pending.length < minEvidence) return null;
		if (now - Date.parse(state.lastDispatchedAt || "1970-01-01") < cooldownMinutes * 60000) return null;
		if (unique(state.pending.map(item => item.turnSeq)).length < 3 && !state.pending.some(item => item.outcome)) return null;
		const id = randomUUID();
		state.claim = { id, at: now, fingerprints: state.pending.map(item => item.fingerprint) };
		const memories = new Map(state.pending.flatMap(item => item.memories).map(entry => [JSON.stringify(entry), entry]));
		return { id, activity: { turn: activity.turn, endSeq: activity.endSeq, memories: [...memories.values()].slice(-16),
			evidence: state.pending.map(item => ({ tool: item.tool, ...item.sources.at(-1) })),
		} };
	});
}

export function finishTurnReview(root, { parentSession, namespace, claimId, dispatchedAt, completed }) {
	update(root, parentSession, namespace, state => {
		if (state.claim?.id !== claimId) return;
		if (completed) {
			const processed = state.claim.fingerprints;
			state.seen = unique([...state.seen, ...processed]).slice(-SEEN_LIMIT);
			state.pending = state.pending.filter(item => !processed.includes(item.fingerprint));
		}
		if (dispatchedAt) state.lastDispatchedAt = dispatchedAt;
		state.claim = null;
	});
}
