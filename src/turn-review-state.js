import { randomUUID } from "node:crypto";
import { join } from "node:path";
import { rewriteFile } from "./store.js";

const STATE_FILE = "turn-review-state.json";
const WINDOW = 32;
const SEEN_LIMIT = 128;
const SCOPE_LIMIT = 64;
const keyOf = (parentSession, namespace) => JSON.stringify([parentSession, namespace]);
const unique = values => [...new Set(values)];

function pendingWindow(items) {
	const turns = new Set(), selected = new Set();
	for (const item of items.toReversed()) {
		if (turns.size === 3) break;
		if (turns.has(item.turnSeq)) continue;
		turns.add(item.turnSeq);
		selected.add(item);
	}
	for (const item of items.toReversed()) {
		if (selected.size === WINDOW) break;
		selected.add(item);
	}
	return items.filter(item => selected.has(item));
}
function update(root, parentSession, namespace, change) {
	let result;
	rewriteFile(join(root, STATE_FILE), text => {
		const all = text === null ? { version: 1, scopes: {} } : JSON.parse(text);
		const key = keyOf(parentSession, namespace);
		const state = all.scopes[key] || { pending: [], seen: [], scanned: [], claim: null };
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

export function prepareTurnReview(root, { parentSession, namespace, activity, enabled, minEvidence, timeoutSeconds }) {
	return update(root, parentSession, namespace, state => {
		const now = Date.now();
		let hasNewEvidence = false;
		if (!state.scanned.includes(activity.endSeq)) {
			state.scanned = [...state.scanned, activity.endSeq].slice(-SEEN_LIMIT);
			const admitted = new Set();
			for (const event of activity.evidence) {
				if (event.failed) continue;
				if (state.seen.includes(event.fingerprint)) continue;
				const source = { call_id: event.call_id, seq: event.seq, turn: activity.turn, endSeq: activity.endSeq };
				let item = state.pending.find(item => item.fingerprint === event.fingerprint);
				if (item) {
					item.sources = [...item.sources, source].slice(-4);
					item.tasks = [...new Map([...(item.tasks || []), ...activity.tasks].map(task => [task.seq, task])).values()].slice(-4);
				} else {
					item = { fingerprint: event.fingerprint, tool: event.tool, turnSeq: activity.endSeq, sources: [source], memories: activity.memories.slice(-16), tasks: activity.tasks };
					state.pending.push(item); admitted.add(item.fingerprint);
				}
			}
			const captured = item => item.sources.some(source => activity.savedCalls.includes(source.call_id) || activity.savedSeqs.includes(source.seq));
			const saved = state.pending.filter(captured).map(item => item.fingerprint);
			state.seen = unique([...state.seen, ...saved]).slice(-SEEN_LIMIT);
			state.pending = pendingWindow(state.pending.filter(item => !captured(item)));
			hasNewEvidence = state.pending.some(item => admitted.has(item.fingerprint));
		}
		if (state.claim && now - state.claim.at > (timeoutSeconds + 60) * 1000) state.claim = null;
		const waiting = { claim: null, hasNewEvidence };
		if (!enabled || state.claim || !hasNewEvidence || state.pending.length < minEvidence) return waiting;
		if (unique(state.pending.map(item => item.turnSeq)).length < 3) return waiting;
		const id = randomUUID();
		state.claim = { id, at: now, fingerprints: state.pending.map(item => item.fingerprint) };
		const memories = new Map(state.pending.flatMap(item => item.memories).map(entry => [JSON.stringify(entry), entry]));
		const tasks = new Map(state.pending.flatMap(item => item.tasks || []).map(task => [task.seq, task]));
		return { hasNewEvidence, claim: { id, activity: { turn: activity.turn, endSeq: activity.endSeq, memories: [...memories.values()].slice(-16),
			tasks: [...tasks.values()],
			evidence: state.pending.map(item => ({ tool: item.tool, ...item.sources.at(-1) })),
		} } };
	});
}

export function finishTurnReview(root, { parentSession, namespace, claimId, completed }) {
	update(root, parentSession, namespace, state => {
		if (state.claim?.id !== claimId) return;
		if (completed) {
			const processed = state.claim.fingerprints;
			state.seen = unique([...state.seen, ...processed]).slice(-SEEN_LIMIT);
			state.pending = state.pending.filter(item => !processed.includes(item.fingerprint));
		}
		state.claim = null;
	});
}
