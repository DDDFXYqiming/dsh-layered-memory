import { hashText } from "./store.js";
import { prepareTurnReview, finishTurnReview } from "./turn-review-state.js";

const CONTROL_TOOLS = new Set(["skill", "todo_write", "render_ui", "validate_dsh_ui", "send_message", "list_agents", "wait_agent", "spawn_teammate", "interrupt_agent", "subagent", "subagent_fork", "present", "ask_user_question", "get_goal", "create_goal", "update_goal", "job_list", "job_kill", "terminal_list", "terminal_open", "terminal_close", "terminal_signal", "working_directory", "create_worktree", "list_subagent_models", "list_mcp_resources", "list_mcp_resource_templates", "bsk_session", "bsk_tabs", "run_code"]);
const WRITES = new Set(["write", "edit", "apply_patch"]);
const MEMORY_SAVES = new Set(["memory_write", "memory_update"]);

function canonical(value) {
	if (Array.isArray(value)) return value.map(canonical);
	if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
	return value;
}
function resultValue(content) {
	const text = content.filter(block => block.type === "text").map(block => block.text).join("\n");
	try { return JSON.parse(text); } catch { return null; }
}
function changedFile(name, args, value, meta, text) {
	if (!WRITES.has(name)) return false;
	if (value?.changed !== undefined) return value.changed === true;
	if (value && typeof value === "object" && "before" in value && "after" in value) return value.before !== value.after;
	if (meta?.operation === "create") return true;
	if (meta?.diffs) return meta.diffs.some(diff => diff.oldText !== diff.newText);
	if (name === "edit") return args.old_string !== args.new_string;
	return name === "apply_patch" && /(?:^|\n)[AMD] .+/m.test(text);
}
function turnActivity(events, turn, endSeq, inheritedEventCount, parentSession) {
	const end = events.find(event => event.seq === endSeq && event.type === "turn/end");
	if (end?.data.reason?.kind !== "completed") return null;
	const start = events.findLastIndex(event => event.type === "turn/start" && event.data.turn === turn && event.seq >= inheritedEventCount && event.seq < endSeq);
	if (start < 0) return null;
	const calls = new Map(), memories = new Map(), evidence = [], savedCalls = new Set(), savedSeqs = new Set();
	let userTask = false;
	function accept(name, args, callId, seq, content, isError, meta) {
		if (typeof args === "string") args = JSON.parse(args);
		const value = resultValue(content);
		const text = content.filter(block => block.type === "text").map(block => block.text).join("\n");
		const exit = value?.exitCode ?? text.match(/\[exit code: (-?\d+)\]/)?.[1];
		const failed = isError || exit !== undefined && exit !== null && Number(exit) !== 0 || name === "job_output" && ["failed", "killed"].includes(value?.job?.status);
		if (name === "memory_read" && !failed && !value?.not_found && ["fact", "sop"].includes(args.entry?.kind)) memories.set(JSON.stringify(args.entry), args.entry);
		if (MEMORY_SAVES.has(name) && !failed && value?.sourceTouched !== false) {
			for (const id of args.evidence_call_ids || []) savedCalls.add(id);
			if (args.sourceSession === parentSession) for (const sourceSeq of args.sourceSeqs || []) savedSeqs.add(sourceSeq);
		}
		if (name.startsWith("memory_") || name.startsWith("team_task_") || name.startsWith("schedule_") || CONTROL_TOOLS.has(name)) return;
		if (failed) { evidence.push({ tool: name, failed: true }); return; }
		if (["background", "promoted"].includes(value?.kind)) return;
		if (!content.some(block => block.type !== "text" || block.text.trim())) return;
		if (name === "job_output" && value && !value.text?.trim()) return;
		const { description, justification, ...inputs } = args;
		const actual = name === "job_output" && value ? value.text : value ?? content;
		evidence.push({ tool: name, call_id: callId, seq, fingerprint: hashText(JSON.stringify(canonical([name, inputs, actual, WRITES.has(name) ? meta ?? null : null]))), changed: changedFile(name, args, value, meta, text) });
	}
	for (const event of events.slice(start + 1)) {
		if (event.seq >= endSeq) break;
		if (event.type === "user/message" && event.data.source?.kind === "user") userTask = true;
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
	return userTask ? { turn, endSeq, memories: [...memories.values()], evidence, savedCalls: [...savedCalls], savedSeqs: [...savedSeqs] } : null;
}

export function createTurnReviewer(ctx, cfg, io) {
	return async (agent, turn, endSeq) => {
		if (!cfg.turnReviewEnabled || agent.session.header.origin === "subagent" || !io.canWrite(agent)) return;
		const query = ctx.get("sessionQuery");
		if (!query) throw new Error("记忆收尾检查需要宿主 sessionQuery 服务");
		const parentSession = agent.session.id;
		const observation = await query.observeSession(parentSession, { projectionMode: "none" });
		let activity;
		try { activity = turnActivity(observation.events, turn, endSeq, observation.inheritedEventCount, parentSession); }
		finally { observation[Symbol.dispose](); }
		if (!activity || !activity.evidence.length && !activity.savedCalls.length && !activity.savedSeqs.length) return;
		const { root, namespace } = io.scope(agent);
		const claim = prepareTurnReview(root, { parentSession, namespace, activity, minEvidence: cfg.turnReviewMinEvidence ?? 6, cooldownMinutes: cfg.turnReviewCooldownMinutes ?? 30, timeoutSeconds: cfg.maintenanceTimeoutSeconds ?? 300 });
		if (!claim) return;
		let result;
		try { result = await io.review(agent, claim.activity); return result; }
		finally { finishTurnReview(root, { parentSession, namespace, claimId: claim.id, dispatchedAt: result?.run?.dispatchedAt, completed: ["reviewed", "unchanged", "waiting_evidence"].includes(result?.status) }); }
	};
}
