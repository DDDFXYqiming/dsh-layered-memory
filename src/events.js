import { randomUUID } from "node:crypto";
import { bumpTurnCounter, nsRoot, resolveNamespace, setEntryMeta, slugify, entryExists, entryContentRevision } from "./store.js";
import { computeContentRevision, readReflectionState, writeReflectionState, collectReflectionSignals, decideReflection, isSettledRevision, reflectionBuckets } from "./reflection.js";
import { runMaintain } from "./maintain.js";
import { writePending } from "./memory-ops.js";
import { createMaintenanceRunner } from "./maintenance-agent.js";

const MUTATIONS_WITH_SOURCE = new Set(["memory_write", "memory_update", "memory_accept"]);
function resultText(result) { return (result.content || []).filter(block => block.type === "text").map(block => block.text).join("\n").replace(/\s+/g, " ").slice(0, 600); }
function resultCallId(event) {
	if (event.type === "tool/result") return event.data.callId || event.data.message?.source?.callId || event.data.message?.tool_call_id;
	if (event.type === "tool/ptc-dispatch" || event.type === "tool/code-dispatch") return event.data.subCallId || event.data.callId;
}

export function wireEvents(ctx, cfg, io) {
	const maintenance = createMaintenanceRunner(ctx, cfg, {
		readState: readReflectionState, writeState: writeReflectionState, slugify, entryExists, entryContentRevision,
		maintain: root => runMaintain(root, cfg.l1MaxChars, cfg.maintainOpts),
		tools: namespace => io.maintenanceTools(namespace),
	});
	io.onMaintenanceRunner(maintenance);
	const sessions = new Map();
	const scheduled = new Set();
	const namespaceScans = new Map();
	const disposers = [];
	let disposed = false;
	const logError = (stage, error) => ctx.logger.warn(`[dsh-layered-memory] ${stage}: ${error.stack || error}`);
	function stateFor(session) {
		if (!sessions.has(session.id)) sessions.set(session.id, { calls: new Map(), writes: new Map(), retries: new Map(), captured: [] });
		return sessions.get(session.id);
	}
	function schedule(stage, fn) {
		const handle = setImmediate(() => {
			scheduled.delete(handle);
			if (!disposed) Promise.resolve().then(fn).catch(error => logError(stage, error));
		});
		scheduled.add(handle);
	}
	function bindSource(session, callId, eventSeq) {
		const state = stateFor(session);
		const write = state.writes.get(callId);
		if (!write) return;
		state.writes.delete(callId);
		const root = nsRoot(cfg.memoryDir, write.entry.namespace);
				const refs = write.evidenceCallIds.map(id => state.calls.get(id)?.seq);
		const missing = write.evidenceCallIds.filter((_, i) => refs[i] === undefined);
		const sourceSeqs = [...new Set([...refs.filter(seq => seq !== undefined), eventSeq])];
		setEntryMeta(root, write.entry.kind, write.entry.key, previous => previous?.sourceCallId === callId ? { sourceSession: session.id, sourceSeqs, sourceCallId: callId, missingEvidenceCallIds: missing } : null);
	}
	disposers.push(ctx.on("tools/result", (exec, result) => {
		io.onSkillResult(exec, result);
		if (!exec.agent) return;
		const session = exec.agent.session;
		const state = stateFor(session);
		if (!result.isError && MUTATIONS_WITH_SOURCE.has(exec.name) && result.value?.sourceTouched && result.value.entry && !(exec.arguments.sourceSession && exec.arguments.sourceSeqs?.length)) {
			state.writes.set(exec.callId, { entry: result.value.entry, evidenceCallIds: exec.arguments.evidence_call_ids || [] });
			const previousEvent = state.calls.get(exec.callId);
			if (previousEvent?.seq !== undefined) bindSource(session, exec.callId, previousEvent.seq);
		}
		if (!cfg.autoPending || maintenance.owns(exec.agent) || exec.name.startsWith("memory_")) return;
		if (result.isError) {
			const previous = state.retries.get(exec.name) || { fails: 0, calls: [] };
			state.retries.set(exec.name, { fails: previous.fails + 1, calls: [...previous.calls, exec.callId], errorTail: resultText(result) });
		} else if (state.retries.has(exec.name)) {
			const previous = state.retries.get(exec.name);
			state.captured.push({ tool: exec.name, fails: previous.fails, errorTail: previous.errorTail, successTail: resultText(result), callIds: [...previous.calls, exec.callId] });
			state.retries.delete(exec.name);
		}
	}));
	function flushPending(session) {
		const state = sessions.get(session.id);
		if (!state?.captured.length) return;
		const retries = state.captured;
		const sourceSeqs = [...new Set(retries.flatMap(retry => retry.callIds.map(id => state.calls.get(id)?.seq).filter(seq => seq !== undefined)))];
		writePending(io.resolveRoot(session.header.cwd), { sourceSession: session.id, sourceSeqs, retries, reason: `本次捕获 ${retries.length} 个失败后成功序列，需确认是否有可复用经验。` });
		state.captured = [];
	}
	async function scanNamespace(session, root, totalTurns, periodic) {
		const state = readReflectionState(root);
		const revision = computeContentRevision(root);
		if (!periodic && isSettledRevision(state, revision)) return;
		const signals = collectReflectionSignals(root);
		if (!periodic && !reflectionBuckets(signals, cfg).length && state.outcome !== "needs_review") return;
		const report = runMaintain(root, cfg.l1MaxChars, cfg.maintainOpts);
		if (!cfg.reflectionEnabled || !report.actionable.needsModelReview) return;
		const namespace = resolveNamespace(cfg, undefined, session.header.cwd);
		const agent = ctx.get("agents").get(session.id);
		if (!agent) return;
		if (cfg.reflectionMode === "auto") { await maintenance.request(root, namespace, agent, report); return; }
		const current = readReflectionState(root);
		const currentRevision = computeContentRevision(root);
		const decision = decideReflection({ enabled: true, cooled: true, state: current, revision: currentRevision, signals, cfg });
		if (!decision.notify) return;
		agent.inject({ id: randomUUID(), role: "user", content: [{ type: "text", text: `[记忆整理请求] 插件扫描发现待确认事项：${report.actionable.reasons.join("、")}。需要时使用 memory_activate({mode:"manage"}) 与 memory_maintain 检查；当前任务优先。` }], source: { kind: "plugin:layered-memory" } });
		writeReflectionState(root, { notifiedRevision: currentRevision, notifiedAt: new Date().toISOString(), notifiedSession: session.id });
	}
	disposers.push(ctx.on("session/event", (session, event) => {
		const state = stateFor(session);
		if (event.type === "tool/call") state.calls.set(event.data.callId, { name: event.data.name });
		const callId = resultCallId(event);
		if (callId) {
			state.calls.set(callId, { ...state.calls.get(callId), name: event.data.name || state.calls.get(callId)?.name, seq: event.seq });
			bindSource(session, callId, event.seq);
			if (state.calls.size > 4096) state.calls.delete(state.calls.keys().next().value);
		}
		if (event.type !== "turn/end") return;
		flushPending(session);
		state.retries.clear();
		if (session.header.parentSession !== undefined) return;
		const root = io.resolveRoot(session.header.cwd);
		const totalTurns = bumpTurnCounter(root);
		const periodic = cfg.maintainEveryTurns > 0 && totalTurns % cfg.maintainEveryTurns === 0;
		if (!periodic && !cfg.reflectionEnabled) return;
		const previous = namespaceScans.get(root) || { turn: -Infinity, at: -Infinity };
		const cooled = totalTurns - previous.turn >= cfg.reflectCooldownTurns;
		if ((!periodic && !cooled) || Date.now() - previous.at < 600000) return;
		namespaceScans.set(root, { turn: totalTurns, at: Date.now() });
		schedule("namespace scan", () => scanNamespace(session, root, totalTurns, periodic));
	}));
	disposers.push(ctx.on("agent/disposed", ({ agent }) => {
		flushPending(agent.session);
		sessions.delete(agent.session.id);
	}));
	return () => {
		disposed = true;
		maintenance.dispose();
		for (const handle of scheduled) clearImmediate(handle);
		for (const dispose of disposers.reverse()) dispose();
	};
}
