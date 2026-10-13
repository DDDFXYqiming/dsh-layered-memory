// Rehydrate only this session's own successful activations through the host's
// public observation lease. Inherited parent history cannot grant child writes.
export async function readActivation(sessionQuery, sessionId) {
	const observation = await sessionQuery.observeSession(sessionId, { projectionMode: "none" });
	try {
		const calls = new Map();
		let activation;
		function accept(name, args) {
			if (name !== "memory_activate" && name !== "skill") return;
			if (typeof args === "string") args = JSON.parse(args);
			if (name === "memory_activate") activation = { mode: args.mode || "common", access: args.access };
			if (name === "skill" && args.name === "memory") activation ||= { mode: "common" };
		}
		for (const event of observation.events) {
			if (event.seq < observation.inheritedEventCount) continue;
			if (event.type === "tool/call") calls.set(event.data.callId, event.data);
			if (event.type === "tool/result" && !event.data.message.source.isError) {
				const call = calls.get(event.data.message.source.callId);
				if (call) accept(call.name, call.arguments);
			}
			if (["tool/ptc-dispatch", "tool/code-dispatch"].includes(event.type) && !event.data.isError) accept(event.data.name, event.data.arguments);
			if (event.type === "user/message" && event.data.source?.kind === "user" && event.data.content.some(block => block.type === "text" && /(^|\s)\/memory(?=\s|$)/.test(block.text))) activation ||= { mode: "common" };
		}
		return activation;
	} finally { observation[Symbol.dispose](); }
}
