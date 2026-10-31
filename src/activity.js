import { readFileSync } from "node:fs";
import { join } from "node:path";
import { nsRoot, resolveNamespace } from "./store.js";
import { readReflectionState } from "./reflection.js";

const RUN_LIMIT = 50;
const SESSION_LIMIT = 128;
const finishedTime = item => item.finishedAt || item.startedAt;

function activityItem(record) {
	const changes = record.changes instanceof Map ? record.changes : new Map(record.changes || []);
	return {
		id: record.id,
		namespace: record.namespace,
		purpose: record.purpose || "batch",
		status: record.status,
		sessionId: record.workerId || record.session || null,
		workerId: record.workerId || null,
		legacy: !record.workerId && record.provider !== "plugin-worker" && Boolean(record.session),
		phase: record.phase || null,
		startedAt: record.startedAt,
		finishedAt: record.finishedAt || null,
		changedEntries: changes.size,
		retainedEntries: (record.entries || []).filter(entry => entry.status === "retained").length,
		waitingEntries: (record.entries || []).filter(entry => entry.status === "waiting_evidence").length,
		remainingEntries: record.remaining ? record.remaining.length : null,
		summary: record.summary || null,
	};
}

export function createActivitySource(ctx, cfg) {
	const parents = new Map();
	const lifetime = new AbortController();
	function prune(currentSessionId) {
		for (const [id, state] of parents) {
			if (parents.size <= SESSION_LIMIT) break;
			if (id !== currentSessionId && !state.listeners.size && ![...state.runs.values()].some(item => item.status === "running")) parents.delete(id);
		}
	}
	function stateFor(parentSessionId) {
		let state = parents.get(parentSessionId);
		if (!state) {
			state = { revision: 0, runs: new Map(), hydrated: new Set(), listeners: new Set(), reflection: [] };
			parents.set(parentSessionId, state);
			prune(parentSessionId);
		}
		return state;
	}
	function snapshot(parentSessionId, state) {
		const namespaces = new Set([...state.hydrated, ...[...state.runs.values()].map(run => run.namespace)]);
		const reflection = [...namespaces].map(namespace => {
			const current = readReflectionState(nsRoot(cfg.memoryDir, namespace));
			return { namespace, nextEligibleAt: current.nextEligibleAt || null, retryCount: current.retryCount || 0, retryReason: current.retryReason || null };
		});
		if (JSON.stringify(state.reflection) !== JSON.stringify(reflection)) { state.reflection = reflection; state.revision++; }
		const items = [...state.runs.values()].sort((a, b) => finishedTime(b).localeCompare(finishedTime(a)));
		const finished = items.filter(item => item.finishedAt !== null);
		return {
			parentSessionId,
			revision: state.revision,
			reflection: state.reflection,
			running: items.filter(item => item.status === "running" && item.finishedAt === null),
			latestChanged: finished.find(item => item.changedEntries > 0) || null,
			latestFailure: finished[0]?.status === "failed" ? finished[0] : null,
			records: items,
		};
	}
	function store(state, item) {
		if (JSON.stringify(state.runs.get(item.id)) === JSON.stringify(item)) return false;
		state.runs.set(item.id, item);
		const completed = [...state.runs.values()].filter(row => row.finishedAt !== null).sort((a, b) => finishedTime(b).localeCompare(finishedTime(a)));
		for (const row of completed.slice(RUN_LIMIT)) state.runs.delete(row.id);
		state.revision++;
		return true;
	}
	function publish(record) {
		if (lifetime.signal.aborted) return;
		if (!record.parentSession || !record.id) throw new Error("记忆状态记录缺少父会话或运行标识");
		const state = stateFor(record.parentSession);
		store(state, activityItem(record));
		for (const [parentSessionId, current] of parents) {
			if (parentSessionId !== record.parentSession && (!current.listeners.size || !current.hydrated.has(record.namespace))) continue;
			const value = snapshot(parentSessionId, current);
			for (const listener of current.listeners) listener(value);
		}
		prune(record.parentSession);
	}
	async function getSnapshot(parentSessionId, signal = lifetime.signal) {
		lifetime.signal.throwIfAborted();
		signal.throwIfAborted();
		const query = ctx.get("sessionQuery");
		if (!query) throw new Error("记忆状态需要 sessionQuery 服务");
		const observation = await query.observeSession(parentSessionId, { signal, projectionMode: "none" });
		let namespace;
		try {
			if (!observation.header.cwd) throw new Error("父会话缺少工作目录");
			namespace = resolveNamespace(cfg, undefined, observation.header.cwd);
		} finally { observation[Symbol.dispose](); }
		signal.throwIfAborted();
		const state = stateFor(parentSessionId);
		for (const current of new Set([namespace, "default"])) {
			if (state.hydrated.has(current)) continue;
			let runs;
			try { runs = JSON.parse(readFileSync(join(nsRoot(cfg.memoryDir, current), "maintenance-runs.json"), "utf8")).runs; }
			catch (error) { if (error.code !== "ENOENT") throw error; runs = []; }
			for (const record of runs) {
				if (record.parentSession !== parentSessionId || !record.finishedAt || state.runs.has(record.id)) continue;
				store(state, activityItem(record));
			}
			state.hydrated.add(current);
		}
		return snapshot(parentSessionId, state);
	}
	async function* watch(parentSessionId, signal) {
		const abort = AbortSignal.any([signal, lifetime.signal]);
		await getSnapshot(parentSessionId, abort);
		const state = stateFor(parentSessionId);
		let pending = { type: "snapshot", snapshot: snapshot(parentSessionId, state) };
		let wake;
		const changed = value => { pending = { type: "update", snapshot: value }; wake?.(); };
		const stopped = () => wake?.();
		state.listeners.add(changed);
		abort.addEventListener("abort", stopped, { once: true });
		try {
			while (!abort.aborted) {
				if (pending) {
					const frame = pending;
					pending = null;
					yield frame;
				} else await new Promise(resolve => { wake = resolve; });
			}
		} finally {
			state.listeners.delete(changed);
			abort.removeEventListener("abort", stopped);
			prune();
		}
	}
	return { publish, getSnapshot, watch, dispose() { lifetime.abort(); parents.clear(); } };
}
