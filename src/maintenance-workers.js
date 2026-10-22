import { randomUUID } from "node:crypto";
import { z } from "zod";
import { defineDomain, domainTable } from "@deepseek-ai/dsh-storage-domain";
import { installModelSelection } from "@deepseek-ai/dsh-agent";
import { createUserMessage } from "@deepseek-ai/dsh-llm";
import { appendDelegatedPolicyOverrides, applyChildComposition, captureDelegatedPolicyOverrides, childSessionMeta, resolveChildAgentOptions, resolveChildDepth } from "@deepseek-ai/dsh-subagent";
import { installMaintenanceCompletion } from "./maintenance-completion.js";

const Slot = z.object({ id: z.string(), purpose: z.enum(["turn_review", "batch"]), parentSessionId: z.string(), createdAt: z.string(), adopted: z.boolean(),
	lastJobId: z.string().optional(), namespace: z.string().optional(), lastStatus: z.string().optional(), lastStartedAt: z.string().optional(), lastFinishedAt: z.string().nullable().optional(), lastSummary: z.string().nullable().optional() });
const WORKERS = defineDomain({ name: "layered_memory_workers", version: 1, tables: { parents: domainTable(z.object({ turn_review: Slot.optional(), batch: Slot.optional() })) } });

export function createMaintenanceWorkers(ctx, cfg, io) {
	const ready = ctx.storage.domain.open(WORKERS);
	const active = new Map();
	const claims = new Map();
	let disposed = false;
	const warn = error => ctx.logger.warn(`[dsh-layered-memory] worker: ${error.stack || error}`);
	async function table() { return (await ready).table("parents"); }
	function serialize(parentId, operation) {
		const previous = claims.get(parentId) || Promise.resolve();
		const next = previous.then(operation, operation);
		claims.set(parentId, next);
		void next.finally(() => { if (claims.get(parentId) === next) claims.delete(parentId); }).catch(() => {});
		return next;
	}
	async function claim(parent, purpose, runs) {
		return serialize(parent.id, async () => {
			const parents = await table();
			const current = parents.get(parent.id) || {};
			if (current[purpose]) return current[purpose];
			const candidates = runs.filter(run => run.parentSession === parent.id && (run.purpose || "batch") === purpose)
				.sort((a, b) => (b.finishedAt || b.startedAt).localeCompare(a.finishedAt || a.startedAt));
			let adopted;
			for (const run of candidates) {
				const id = run.session || `memory-maintenance-${run.id}`;
				if (Object.values(current).some(slot => slot.id === id)) continue;
				const stored = await ctx.sessionPersistence.stat(id);
				if (stored?.header.parentSession === parent.id && stored.header.origin === "subagent") { adopted = stored; break; }
			}
			const slot = { id: adopted?.header.id || `layered-memory-${purpose === "turn_review" ? "review" : "batch"}-${randomUUID()}`, purpose, parentSessionId: parent.id,
				createdAt: adopted ? new Date(adopted.header.createdAt).toISOString() : new Date().toISOString(), adopted: Boolean(adopted) };
			await parents.put(parent.id, { ...current, [purpose]: slot });
			return slot;
		});
	}
	async function record(run) {
		if (!run.workerId) return;
		await serialize(run.parentSession, async () => {
			const parents = await table();
			await parents.update(run.parentSession, current => ({ ...current, [run.purpose]: { ...current[run.purpose], lastJobId: run.id, namespace: run.namespace,
				lastStatus: run.status, lastStartedAt: run.startedAt, lastFinishedAt: run.finishedAt || null, lastSummary: run.summary || null } }));
		});
	}
	async function start(spec) {
		if (disposed) throw new Error("maintenance workers are disposed");
		const slot = await claim(spec.parent, spec.purpose, spec.legacyRuns);
		if (disposed) throw new Error("maintenance workers are disposed");
		if (active.has(slot.id)) throw new Error("maintenance worker is already running");
		spec.onSlot(slot);
		const controller = new AbortController();
		const control = { parentId: spec.parent.id, slot, runId: spec.id, phase: "preparing", controller, agent: null, settled: false, closed: Promise.withResolvers() };
		control.stop = ({ kind, reason }) => {
			if (control.settled) return false;
			control.stopKind = kind;
			spec.onStop({ kind, reason }); controller.abort(reason); control.agent?.cancel({ kind: "parent" });
			return true;
		};
		active.set(slot.id, control);
		const signal = AbortSignal.any([spec.signal, controller.signal]);
		control.signal = signal;
		let handle, completion, end, failure, startedAt;
		const receipts = [];
		const usage = { requests: 0, reportedRequests: 0, complete: true, totals: {}, routes: [] };
		const phase = value => { control.phase = value; spec.onPhase(value); };
		const cancel = () => { phase("stopping"); control.agent?.cancel({ kind: "parent" }); };
		signal.addEventListener("abort", cancel, { once: true });
		const release = async () => {
			signal.removeEventListener("abort", cancel);
			await handle?.dispose();
		};
		const forget = () => { active.delete(slot.id); control.closed.resolve(); };
		try {
			phase("preparing");
			const depth = resolveChildDepth(spec.parent, undefined);
			const delegatedPolicies = captureDelegatedPolicyOverrides(spec.parent);
			const route = resolveChildAgentOptions(spec.parent, spec.agentOptions, depth);
			const setup = async (agentCtx, agent) => {
				control.agent = agent;
				await applyChildComposition(agentCtx, spec.parent, {});
				appendDelegatedPolicyOverrides(agent.session, delegatedPolicies);
				installModelSelection(agentCtx, { current: { provider: route.provider, model: route.model, ...(route.reasoningEffort ? { reasoningEffort: route.reasoningEffort } : {}) } });
				agentCtx.on("agent/request", async (_payload, next) => ({ ...await next(), maxTokens: cfg.maintenanceMaxTokens }));
				agentCtx.tools.restrict({ allow: [] });
				completion = installMaintenanceCompletion(agentCtx, agent, spec.parameters, spec.beforeComplete);
				agentCtx.on("agent/error", value => { failure = value.error; });
				agentCtx.on("session/event", (session, event) => {
					if (session !== agent.session || startedAt === undefined || event.seq < startedAt) return;
					if (event.type === "turn/end") end = event;
					if (event.type === "tool/result") receipts.push(event);
					if (event.type !== "assistant/message" && event.type !== "assistant/attempt") return;
					usage.requests++;
					const source = event.data.message?.source;
					if (source?.provider && !usage.routes.some(item => item.provider === source.provider && item.model === source.model)) usage.routes.push({ provider: source.provider, model: source.model });
					if (event.data.usage) {
						usage.reportedRequests++;
						for (const [key, value] of Object.entries(event.data.usage)) if (typeof value === "number") usage.totals[key] = (usage.totals[key] || 0) + value;
					}
					usage.complete = usage.requests === usage.reportedRequests;
				});
				await spec.setup(agentCtx, agent, slot);
			};
			const stored = await ctx.sessionPersistence.stat(slot.id, { signal });
			handle = stored ? await ctx.agents.resume({ resumeSessionId: slot.id, parentAgent: spec.parent, agentOptions: route, setup, signal })
				: await ctx.agents.create({ sessionId: slot.id, parentAgent: spec.parent, meta: childSessionMeta(spec.parent, depth, false), agentOptions: route, setup, signal });
			signal.throwIfAborted();
			const agent = handle.agent;
			if (stored) {
				phase("compacting");
				const compaction = ctx.agentPresets.serviceFor(agent, "compaction");
				if (!compaction) throw new Error("worker Agent preset does not provide compaction");
				await compaction.compactIfNeeded(agent, "pressure", signal);
			}
			signal.throwIfAborted();
			startedAt = agent.session.seq;
			phase("running");
			agent.followup(createUserMessage({ content: [{ type: "text", text: spec.prompt }], source: { kind: "dsh-layered-memory", form: "notice", summary: spec.purpose === "turn_review" ? "核对本轮记忆" : "整理已有记忆", runId: spec.id } }));
			const result = (async () => {
				try {
					await agent.whenIdle();
					control.settled = true;
					phase(signal.aborted ? "stopping" : "finishing");
					if (!await ctx.sessions.flush(agent.session)) throw new Error("maintenance session has no durability checkpoint route");
					const captured = completion.captured();
					const receipt = captured && receipts.find(event => event.seq >= captured.receiptFrom && event.data.message.source.callId === captured.rootCallId && !event.data.message.isError);
					const reason = end?.data.reason.kind;
					if (signal.aborted) return { stopReason: control.stopKind === "user" ? "stopped" : "aborted", usage };
					if (failure) return { stopReason: "error", diagnostic: String(failure.message || failure), usage };
					if (reason !== "completed") return { stopReason: reason || "error", usage };
					if (!captured || !receipt) throw new Error("maintenance worker completed without a committed completion receipt");
					return { stopReason: "completed", structured: captured.value, usage, receipt: { seq: receipt.seq, callId: captured.rootCallId, turn: end.data.turn } };
				} finally { await release(); }
			})();
			void result.catch(warn);
			return { childId: slot.id, localAgent: agent, requestedModel: route, usage, result, dispose: async () => {
				if (active.get(slot.id) === control && agent.status !== "idle") { controller.abort(new Error("maintenance runtime released")); agent.cancel({ kind: "parent" }); }
				try { await result; } finally { forget(); }
			} };
		} catch (error) { try { await release(); } finally { forget(); } throw error; }
	}
	async function list(parentId) {
		const row = (await table()).get(parentId) || {};
		return ["turn_review", "batch"].map(purpose => {
			const slot = row[purpose];
			if (!slot) return { id: null, purpose, parentSessionId: parentId, status: "idle", runId: null, phase: null, canStop: false };
			const live = active.get(slot.id);
			return { id: slot.id, purpose, parentSessionId: parentId, status: live ? live.signal.aborted ? "stopping" : "running" : "idle", runId: live?.runId || null, phase: live?.phase || null, canStop: Boolean(live && !live.settled && !live.signal.aborted) };
		});
	}
	async function owned(parentId, id) {
		const row = (await table()).get(parentId) || {};
		const slot = Object.values(row).find(item => item.id === id);
		if (!slot) throw new Error("worker does not belong to this parent session");
		return slot;
	}
	async function stop(parentId, id) {
		await owned(parentId, id);
		const live = active.get(id);
		if (!live) return { stopped: false };
		if (!live.stop({ kind: "user", reason: new Error("已停止") })) return { stopped: false };
		await live.closed.promise;
		return { stopped: true };
	}
	async function read(parentId, id, { offset = null, limit = 60 } = {}) {
		const slot = await owned(parentId, id);
		if (!Number.isInteger(limit) || limit < 1 || limit > 200 || offset !== null && (!Number.isInteger(offset) || offset < 0)) throw new Error("invalid worker history page");
		const live = ctx.sessions.get(id);
		if (live) await ctx.sessions.flush(live);
		const handle = await ctx.sessionPersistence.open(id, "read");
		try {
			const snapshot = await ctx.sessionPersistence.stat(id);
			const end = ctx.sessions.get(id)?.seq ?? snapshot.eventCount ?? (await handle.read()).events.length;
			const minOffset = handle.inheritedEventCount;
			const from = offset === null ? Math.max(minOffset, end - limit) : Math.max(minOffset, offset);
			const { events } = await handle.read(from, limit);
			const nextOffset = from + events.length;
			return { id, purpose: slot.purpose, header: handle.header, events, offset: from, nextOffset, hasMore: nextOffset < end, hasPrevious: from > minOffset, totalEvents: end - minOffset, minOffset };
		} finally { await handle.close(); }
	}
	const dispose = ctx.effect(() => async () => {
		disposed = true;
		for (const control of active.values()) control.stop({ kind: "disposed", reason: new Error("maintenance plugin disposed") });
		await io.drain();
		await Promise.allSettled([...claims.values()]);
		await (await ready).close();
	});
	return { start, record, list, stop, read, dispose };
}
