const SOURCE = "plugin:layered-memory:turn-review";
const MEMORY_READS = new Set(["memory_read", "memory_search", "memory_list"]);
const CONTROL_TOOLS = new Set(["skill", "todo_write", "render_ui", "validate_dsh_ui", "send_message", "list_agents", "wait_agent", "present"]);

function turnActivity(events, turn, inheritedEventCount) {
	const start = events.findLastIndex(event => event.type === "turn/start" && event.data.turn === turn && event.seq >= inheritedEventCount);
	if (start < 0) return null;
	const calls = new Map(), memories = new Map(), evidence = [];
	let usedMemory = false;
	function accept(name, args, callId, seq) {
		if (typeof args === "string") args = JSON.parse(args);
		if (MEMORY_READS.has(name)) {
			usedMemory = true;
			if (args.entry && ["fact", "sop"].includes(args.entry.kind)) memories.set(JSON.stringify(args.entry), args.entry);
		} else if (!name.startsWith("memory_") && !name.startsWith("team_task_") && !CONTROL_TOOLS.has(name) && name !== "run_code") {
			evidence.push({ tool: name, call_id: callId, seq });
		}
	}
	for (const event of events.slice(start + 1)) {
		if (event.type === "user/message" && event.data.source?.kind === SOURCE) return null;
		if (event.type === "tool/call") calls.set(event.data.callId, event.data);
		if (event.type === "tool/result" && !event.data.message.source.isError) {
			const callId = event.data.message.source.callId, call = calls.get(callId);
			if (call) accept(call.name, call.arguments, callId, event.seq);
		}
		if (["tool/ptc-dispatch", "tool/code-dispatch"].includes(event.type) && !event.data.isError) {
			accept(event.data.name, event.data.arguments, event.data.subCallId || event.data.callId, event.seq);
		}
	}
	return usedMemory || evidence.length ? { memories: [...memories.values()], evidence: evidence.slice(-8) } : null;
}

export function wireTurnReview(ctx, cfg, io) {
	if (!cfg.turnReviewEnabled) return () => {};
	return ctx.on("agent/turn-stopping", async ({ agent, turn, signal }) => {
		if (agent.session.header.origin === "subagent" || !io.canWrite(agent)) return;
		const query = ctx.get("sessionQuery");
		if (!query) throw new Error("记忆收尾检查需要宿主 sessionQuery 服务");
		const observation = await query.observeSession(agent.session.id, { projectionMode: "none" });
		let activity;
		try { activity = turnActivity(observation.events, turn, observation.inheritedEventCount); }
		finally { observation[Symbol.dispose](); }
		if (!activity) return;
		signal.throwIfAborted();
		io.activate(agent);
		agent.inject({
			id: `memory-turn-review:${agent.session.id}:${turn}`, role: "user", source: { kind: SOURCE },
			content: [{ type: "text", text: [
				"[记忆收尾检查] 本轮在此检查一次。结合刚完成的任务，核对相关旧记忆是否被本轮已验证的事实推翻，或是否获得了值得保留的可复用信息。工具成功返回只是证据线索，不自动代表事实成立。",
				"遵守用户当前的读写授权。只检查与本轮任务有关的记忆；已有条目先 memory_read({entry,full:true})，再用 memory_update 修正，填写实际验证的 evidence_call_ids，并使用读到的 if_revision。新知识先检索再决定是否创建。",
				"已经正确记录的内容无需重复写入；证据不足时保留原文，没有值得更新的信息即可结束。沿用当前任务上下文，不重新执行已完成的任务。",
				`本轮读取的条目：${JSON.stringify(activity.memories)}。最近成功工具的证据引用：${JSON.stringify(activity.evidence)}。`,
			].join("\n") }],
		});
	});
}
