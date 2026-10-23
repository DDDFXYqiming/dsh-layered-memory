import { prepareTurnReview, finishTurnReview } from "./turn-review-state.js";
import { MEMORY_MUTATIONS } from "./tools.js";
import { toolResult, verificationEvidence } from "./maintenance-evidence.js";

const MEMORY_SAVES = new Set(["memory_write", "memory_update"]);

function turnActivity(events, turn, endSeq, inheritedEventCount, parentSession) {
	const end = events.find(event => event.seq === endSeq && event.type === "turn/end");
	if (end?.data.reason?.kind !== "completed") return null;
	const start = events.findLastIndex(event => event.type === "turn/start" && event.data.turn === turn && event.seq >= inheritedEventCount && event.seq < endSeq);
	if (start < 0) return null;
	const calls = new Map(), memories = new Map(), evidence = [], savedCalls = new Set(), savedSeqs = new Set();
	const memoryChanges = [], reviewRequests = [], tasks = [];
	let userTask = false;
	function accept(name, args, callId, seq, content, isError, meta) {
		if (typeof args === "string") args = JSON.parse(args);
		const { value, failed } = toolResult(content, isError, name);
		if (name === "memory_read" && !failed && !value?.not_found && ["fact", "sop"].includes(args.entry?.kind)) memories.set(JSON.stringify(args.entry), args.entry);
		if (MEMORY_SAVES.has(name) && !failed) {
			for (const id of args.evidence_call_ids || []) savedCalls.add(id);
			if (args.sourceSession === parentSession) for (const sourceSeq of args.sourceSeqs || []) savedSeqs.add(sourceSeq);
		}
		if (name === "memory_review" && !failed && value.review.queued) for (const source of value.sources || []) {
			if (source.sourceSession === parentSession) for (const seq of source.sourceSeqs) savedSeqs.add(seq);
		}
		if (MEMORY_MUTATIONS.has(name) && !failed && value.changed) memoryChanges.push({ entry: value.entry, revision: value.revision });
		if (name === "memory_review" && !failed && value.review.queued && value.review.changed) reviewRequests.push(value.review.id);
		const verified = verificationEvidence(name, args, callId, seq, content, isError, meta);
		if (verified) evidence.push(verified);
	}
	for (const event of events.slice(start + 1)) {
		if (event.seq >= endSeq) break;
		if (event.type === "user/message" && event.data.source?.kind === "user") { userTask = true; tasks.push({ seq: event.seq }); }
		if (event.type === "tool/call") calls.set(event.data.callId, event.data);
		if (event.type === "tool/result") {
			const message = event.data.message, callId = message.source.callId, call = calls.get(callId);
			if (call) accept(call.name, call.arguments, callId, event.seq, message.content, message.isError, event.data.meta);
		}
		if (["tool/ptc-dispatch", "tool/code-dispatch"].includes(event.type)) {
			const data = event.data;
			accept(data.name, data.arguments, data.subCallId || data.callId, event.seq, data.content, data.isError, data.meta);
		}
	}
	return userTask ? { turn, endSeq, tasks, memories: [...memories.values()], evidence, savedCalls: [...savedCalls], savedSeqs: [...savedSeqs], memoryChanges, reviewRequests } : null;
}

export function createTurnReviewer(ctx, cfg, io) {
	return async (agent, turn, endSeq) => {
		if (agent.session.header.origin === "subagent" || !io.canWrite(agent)) return;
		const query = ctx.get("sessionQuery");
		if (!query) throw new Error("记忆收尾检查需要宿主 sessionQuery 服务");
		const parentSession = agent.session.id;
		const observation = await query.observeSession(parentSession, { projectionMode: "none" });
		let activity;
		try { activity = turnActivity(observation.events, turn, endSeq, observation.inheritedEventCount, parentSession); }
		finally { observation[Symbol.dispose](); }
		if (!activity) return;
		const { root, namespace } = io.scope(agent);
		const prepared = prepareTurnReview(root, { parentSession, namespace, activity, enabled: cfg.turnReviewEnabled, minEvidence: cfg.turnReviewMinEvidence ?? 6, timeoutSeconds: cfg.maintenanceTimeoutSeconds ?? 300 });
		activity.hasNewEvidence = prepared.hasNewEvidence;
		const claim = prepared.claim;
		if (!claim) return { activity, result: null };
		let result;
		try { result = await io.review(agent, claim.activity); return { activity, result }; }
		finally { finishTurnReview(root, { parentSession, namespace, claimId: claim.id, completed: ["reviewed", "unchanged", "waiting_evidence"].includes(result?.status), attempted: Boolean(result?.run?.dispatchedAt), remaining: result?.run?.remaining }); }
	};
}
