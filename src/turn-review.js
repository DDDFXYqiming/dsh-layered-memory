const MEMORY_READS = new Set(["memory_search", "memory_list"]);
const CONTROL_TOOLS = new Set(["skill", "todo_write", "render_ui", "validate_dsh_ui", "send_message", "list_agents", "wait_agent", "present", "get_goal", "create_goal", "update_goal", "job_list"]);

function turnActivity(events, turn, endSeq, inheritedEventCount) {
	const start = events.findLastIndex(event => event.type === "turn/start" && event.data.turn === turn && event.seq >= inheritedEventCount && event.seq < endSeq);
	if (start < 0) return null;
	const calls = new Map(), memories = new Map(), evidence = [];
	let usedMemory = false, userTask = false;
	function accept(name, args, callId, seq) {
		if (typeof args === "string") args = JSON.parse(args);
		if (MEMORY_READS.has(name) || name === "memory_read" && ["fact", "sop"].includes(args.entry?.kind)) {
			usedMemory = true;
			if (args.entry && ["fact", "sop"].includes(args.entry.kind)) memories.set(JSON.stringify(args.entry), args.entry);
		} else if (!name.startsWith("memory_") && !name.startsWith("team_task_") && !CONTROL_TOOLS.has(name) && name !== "run_code") {
			evidence.push({ tool: name, call_id: callId, seq });
		}
	}
	for (const event of events.slice(start + 1)) {
		if (event.seq >= endSeq) break;
		if (event.type === "user/message" && event.data.source?.kind === "user") userTask = true;
		if (event.type === "tool/call") calls.set(event.data.callId, event.data);
		if (event.type === "tool/result" && !event.data.message.source.isError) {
			const callId = event.data.message.source.callId, call = calls.get(callId);
			if (call) accept(call.name, call.arguments, callId, event.seq);
		}
		if (["tool/ptc-dispatch", "tool/code-dispatch"].includes(event.type) && !event.data.isError) accept(event.data.name, event.data.arguments, event.data.subCallId || event.data.callId, event.seq);
	}
	return userTask && (usedMemory || evidence.length) ? { turn, endSeq, memories: [...memories.values()], evidence } : null;
}

export function createTurnReviewer(ctx, cfg, io) {
	return async (agent, turn, endSeq) => {
		if (!cfg.turnReviewEnabled || agent.session.header.origin === "subagent" || !io.canWrite(agent)) return;
		const query = ctx.get("sessionQuery");
		if (!query) throw new Error("记忆收尾检查需要宿主 sessionQuery 服务");
		const observation = await query.observeSession(agent.session.id, { projectionMode: "none" });
		let activity;
		try { activity = turnActivity(observation.events, turn, endSeq, observation.inheritedEventCount); }
		finally { observation[Symbol.dispose](); }
		if (activity) await io.review(agent, activity);
	};
}
