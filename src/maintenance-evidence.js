import { defineTool } from "@deepseek-ai/dsh-tools";
import { extractSessionEventText } from "@deepseek-ai/dsh-session-query";
import { hashText, readEntry } from "./store.js";
import { parsePending, readPending, redactSecretLines } from "./memory-ops.js";

const MAX_REFS = 128;
const refBudgetFor = job => {
	const writes = Number(job?.writeBudget) || 0;
	return Math.min(1024, Math.max(384, writes * 16));
};
const TEXT_BUDGET = 12000;
const PAGE_BUDGET = 12000;
const keyOf = (session, seq) => JSON.stringify([session, seq]);
const unique = values => [...new Set(values)];
const CONTROL_TOOLS = new Set(["skill", "todo_write", "render_ui", "validate_dsh_ui", "send_message", "list_agents", "wait_agent", "spawn_teammate", "interrupt_agent", "subagent", "subagent_fork", "present", "ask_user_question", "get_goal", "create_goal", "update_goal", "job_list", "job_kill", "terminal_list", "terminal_open", "terminal_close", "terminal_signal", "working_directory", "create_worktree", "list_subagent_models", "list_mcp_resources", "list_mcp_resource_templates", "bsk_session", "bsk_tabs", "run_code"]);
const WRITES = new Set(["write", "edit", "apply_patch"]);

function canonical(value) {
	if (Array.isArray(value)) return value.map(canonical);
	if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
	return value;
}

export function toolResult(content, isError, name) {
	const text = content.filter(block => block.type === "text").map(block => block.text).join("\n");
	let value = null;
	try { value = JSON.parse(text); } catch {}
	const exit = value?.exitCode ?? text.match(/\[exit code: (-?\d+)\]/)?.[1];
	return { text, value, failed: Boolean(isError || exit !== undefined && exit !== null && Number(exit) !== 0 || (name === "job_output" || name === undefined) && ["failed", "killed"].includes(value?.job?.status)) };
}

export function verificationEvidence(name, args, callId, seq, content, isError, meta) {
	if (name.startsWith("memory_") || name.startsWith("team_task_") || name.startsWith("schedule_") || CONTROL_TOOLS.has(name)) return null;
	const { value, failed } = toolResult(content, isError, name);
	if (failed) return { tool: name, failed: true };
	if (["background", "promoted"].includes(value?.kind)) return null;
	if (!content.some(block => block.type !== "text" || block.text.trim())) return null;
	if (name === "job_output" && value && !value.text?.trim()) return null;
	const { description, justification, ...inputs } = args;
	const actual = name === "job_output" && value ? value.text : value ?? content;
	return { tool: name, call_id: callId, seq, fingerprint: hashText(JSON.stringify(canonical([name, inputs, actual, WRITES.has(name) ? meta ?? null : null]))) };
}

function describeEvent(event, tool) {
	if (event.type === "tool/result") {
		const { message } = event.data;
		tool ||= event.data.name;
		return { ...toolResult(message.content, message.isError, tool), call_id: message.source.callId, tool };
	}
	if (["tool/ptc-dispatch", "tool/code-dispatch"].includes(event.type)) {
		const data = event.data;
		return { ...toolResult(data.content, data.isError, data.name), call_id: data.subCallId || data.callId, tool: data.name };
	}
	if (event.type === "user/message") return { text: extractSessionEventText(event), failed: false, call_id: null, tool: null };
	throw new Error("维护来源仅支持用户任务和工具结果事件");
}

function quotedEvidence(sourceSession, event, description) {
	const text = redactSecretLines(description.text);
	return { text: text.length > PAGE_BUDGET ? `${text.slice(0, PAGE_BUDGET)}\n[证据片段已截断，完整结果见来源事件]` : text, sourceSession, sourceSeqs: [event.seq] };
}

export async function readSuccessfulCallEvidence(query, sourceSession, callIds, signal) {
	const observation = await query.observeSession(sourceSession, { projectionMode: "none", signal });
	try {
		return unique(callIds).map(callId => {
			const event = observation.events.findLast(event => event.type === "tool/result" && event.data.message.source.callId === callId
				|| ["tool/ptc-dispatch", "tool/code-dispatch"].includes(event.type) && (event.data.subCallId || event.data.callId) === callId);
			if (!event) throw new Error(`本会话未找到成功的证据调用：${callId}`);
			const tool = event.data.name || observation.events.findLast(item => item.type === "tool/call" && item.data.callId === callId)?.data.name;
			const description = describeEvent(event, tool);
			if (description.failed) throw new Error(`本会话未找到成功的证据调用：${callId}`);
			return quotedEvidence(sourceSession, event, description);
		});
	} finally { observation[Symbol.dispose](); }
}

export async function readCurrentTurnEvidence(query, sourceSession, signal) {
	const observation = await query.observeSession(sourceSession, { projectionMode: "none", signal });
	try {
		const events = observation.events;
		const start = events.findLastIndex(event => event.type === "turn/start" && event.seq >= observation.inheritedEventCount);
		const calls = new Map(), candidates = [], savedCalls = new Set(), savedSeqs = new Set();
		for (const event of start < 0 ? [] : events.slice(start + 1)) {
			if (event.type === "tool/call") { calls.set(event.data.callId, event.data); continue; }
			let name, args, callId, content, isError;
			if (event.type === "tool/result") {
				const { message } = event.data;
				callId = message.source.callId;
				const call = calls.get(callId);
				if (!call) continue;
				({ name, arguments: args } = call);
				({ content, isError } = message);
			} else if (["tool/ptc-dispatch", "tool/code-dispatch"].includes(event.type)) {
				({ name, arguments: args, content, isError } = event.data);
				callId = event.data.subCallId || event.data.callId;
			} else continue;
			if (typeof args === "string") args = JSON.parse(args);
			if (name.startsWith("memory_")) {
				const result = toolResult(content, isError, name);
				if (name === "memory_review" && !result.failed && !result.value.review.queued) continue;
				if (!result.failed && ["memory_write", "memory_update", "memory_accept", "memory_review"].includes(name)) {
					for (const id of args.evidence_call_ids || []) savedCalls.add(id);
					if (args.sourceSession === sourceSession) for (const seq of args.sourceSeqs || []) savedSeqs.add(seq);
					for (const source of result.value?.sources || []) if (source.sourceSession === sourceSession) for (const seq of source.sourceSeqs) savedSeqs.add(seq);
				}
				continue;
			}
			const evidence = verificationEvidence(name, args, callId, event.seq, content, isError, event.data.meta);
			if (evidence && !evidence.failed) candidates.push({ ...evidence, event });
		}
		const saved = new Set(candidates.filter(item => savedCalls.has(item.call_id) || savedSeqs.has(item.seq)).map(item => item.fingerprint));
		const distinct = new Map(candidates.filter(item => !saved.has(item.fingerprint)).map(item => [item.fingerprint, item]));
		const selected = [...distinct.values()].sort((a, b) => a.seq - b.seq).slice(-4);
		if (!selected.length) throw new Error("当前回合没有尚未保存的成功验证证据；先实际验证冲突内容，再调用memory_review");
		return selected.map(item => quotedEvidence(sourceSession, item.event, describeEvent(item.event, item.tool)));
	} finally { observation[Symbol.dispose](); }
}

export async function createMaintenanceEvidence(ctx, job) {
	const query = ctx.get("sessionQuery");
	const refs = new Map();
	const loaded = new Map();
	const maxRefs = refBudgetFor(job);
	function add(sourceSession, seq, details = {}) {
		const key = keyOf(sourceSession, seq);
		if (!refs.has(key) && refs.size === maxRefs) throw new Error("本次维护的来源引用预算已用尽，请保存进度后继续");
		const ref = { ...refs.get(key), sourceSession, seq, ...details };
		refs.set(key, ref);
		return ref;
	}
	function addSource(source, assigned = false) {
		if (source.sourceSession) for (const seq of source.sourceSeqs || []) add(source.sourceSession, seq, assigned ? { assigned: true } : {});
	}
	async function load(ref, signal) {
		const key = keyOf(ref.sourceSession, ref.seq);
		if (!loaded.has(key)) {
			const { target } = await query.readEvent({ sessionId: ref.sourceSession, seq: ref.seq, before: 0, after: 0 }, signal);
			const description = describeEvent(target, ref.tool);
			if (ref.call_id && description.call_id !== ref.call_id) throw new Error("维护证据引用与实际工具事件不符");
			Object.assign(ref, { call_id: description.call_id, tool: description.tool });
			loaded.set(key, { event: target, ...description, text: redactSecretLines(description.text) });
		}
		return loaded.get(key);
	}
	async function includeEntry(value) {
		addSource(value.meta);
	}
	for (const evidence of job.turnReview?.evidence || []) add(job.parentId, evidence.seq, { tool: evidence.tool, call_id: evidence.call_id, turn: evidence.turn, endSeq: evidence.endSeq, assigned: true });
	for (const task of job.turnReview?.tasks || []) add(job.parentId, task.seq, { task: true });
	for (const work of job.work.jobs) for (const evidence of work.evidence || []) addSource(evidence, true);
	for (const name of job.pendingNames) addSource(parsePending(readPending(job.root, name)), true);
	const entries = [...(job.turnReview?.memories || []), ...job.work.jobs.flatMap(work => work.items?.map(item => item.entry) || [])];
	for (const entry of entries) {
		const value = readEntry(job.root, entry.kind, entry.key);
		if (value) addSource(value.meta);
	}
	let remaining = TEXT_BUDGET;
	let remainingWeight = [...refs.values()].reduce((total, ref) => total + (ref.task ? 4 : 1), 0);
	const packet = { parentSession: job.parentId, references: [], textBudget: TEXT_BUDGET };
	for (const ref of refs.values()) {
		let value;
		try { value = await load(ref, job.controller.signal); }
		catch (error) {
			if (String(error?.message ?? "").includes("维护来源仅支持")) { remainingWeight -= ref.task ? 4 : 1; continue; }
			throw error;
		}
		if (job.turnReview?.evidence.some(item => item.seq === ref.seq && ref.sourceSession === job.parentId) && value.failed) throw new Error("本次核对包含失败工具证据");
		const weight = ref.task ? 4 : 1;
		const length = Math.min(Math.floor(remaining * weight / remainingWeight), ref.task ? 2000 : 480);
		const excerpt = value.text.slice(0, length);
		remaining -= excerpt.length;
		remainingWeight -= weight;
		packet.references.push({ ...ref, type: value.event.type, is_error: value.failed, excerpt, complete: excerpt.length === value.text.length });
	}
	async function success(ref, signal) {
		const value = await load(ref, signal);
		if (!value.call_id || value.failed) throw new Error("写入来源必须是本次维护已分配的成功工具事件");
		return value;
	}
	async function byCallIds(callIds, signal) {
		const selected = [];
		for (const callId of unique(callIds)) {
			let found;
			for (const ref of refs.values()) {
				const value = await load(ref, signal);
				if (value.call_id === callId) { found = ref; break; }
			}
			if (!found) throw new Error(`调用不属于本次维护证据：${callId}`);
			await success(found, signal);
			selected.push(found);
		}
		return selected;
	}
	async function bindSource(args) {
		const explicit = args.sourceSession !== undefined || args.sourceSeqs !== undefined;
		if (!explicit && args.evidence_call_ids === undefined && args.evidence === undefined) return args;
		if (args.evidence_call_ids !== undefined && !args.evidence_call_ids.length) throw new Error("evidence_call_ids需要至少一个成功工具调用");
		let selected;
		if (args.evidence_call_ids?.length) {
			selected = await byCallIds(args.evidence_call_ids, job.controller.signal);
			if (explicit && (args.sourceSession !== selected[0].sourceSession || JSON.stringify(unique(args.sourceSeqs || []).sort()) !== JSON.stringify(selected.map(ref => ref.seq).sort()))) throw new Error(`MEMORY_SOURCE_MISMATCH: evidence_call_ids对应 ${JSON.stringify(selected.map(({ sourceSession, seq }) => ({ sourceSession, seq })))}。请只保留 evidence_call_ids，或使用这些 sourceSession/sourceSeqs，不要混填两套不一致的引用。`);
		} else {
			if (!args.sourceSession || !args.sourceSeqs?.length) throw new Error("MEMORY_SOURCE_REQUIRED: 新事实写入请从本次证据包选用 evidence_call_ids，或成对提供 sourceSession/sourceSeqs。仅整理已有正文时省略 evidence 与来源参数即可保留原来源。");
			selected = unique(args.sourceSeqs).map(seq => {
				const ref = refs.get(keyOf(args.sourceSession, seq));
				if (!ref) throw new Error("来源事件不属于本次维护");
				return ref;
			});
			for (const ref of selected) await success(ref, job.controller.signal);
		}
		if (new Set(selected.map(ref => ref.sourceSession)).size !== 1) throw new Error("一次写入需要引用同一来源会话");
		const { evidence_call_ids, ...result } = args;
		return { ...result, sourceSession: selected[0].sourceSession, sourceSeqs: selected.map(ref => ref.seq) };
	}
	async function resolveReview(callIds, signal) {
		let selected;
		if (callIds !== undefined) selected = await byCallIds(callIds, signal);
		else {
			selected = [];
			for (const ref of refs.values()) {
				if (!ref.assigned) continue;
				const value = await load(ref, signal);
				if (value.call_id && !value.failed && value.text.trim()) selected.push(ref);
			}
			selected = selected.slice(-4);
			if (!selected.length) throw new Error("本次维护没有已分配的成功验证证据");
		}
		return Promise.all(selected.map(async ref => {
			const value = await success(ref, signal);
			return quotedEvidence(ref.sourceSession, value.event, value);
		}));
	}
	const tools = [defineTool({
		name: "memory_maintenance_evidence",
		description: "分页补读本次维护分配的精确来源事件。sourceSession和seq必须来自本次证据包或已完整读取条目的meta；offset为字符偏移。",
		parameters: { sourceSession: { type: "string", required: true }, seq: { type: "integer", required: true }, offset: { type: "integer" }, max_chars: { type: "integer" } },
		output: { schema: { type: "object", additionalProperties: true }, render: (_args, value) => [{ type: "text", text: JSON.stringify(value) }] },
		isConcurrencySafe: () => true,
		async execute(args, exec) {
			const ref = refs.get(keyOf(args.sourceSession, args.seq));
			if (!ref) throw new Error("来源事件不属于本次维护");
			const value = await load(ref, exec.signal);
			const offset = args.offset ?? 0, budget = args.max_chars ?? PAGE_BUDGET;
			if (!Number.isInteger(offset) || offset < 0 || offset > value.text.length) throw new RangeError("offset超出来源文本");
			if (!Number.isInteger(budget) || budget < 1 || budget > PAGE_BUDGET) throw new RangeError(`max_chars必须为1至${PAGE_BUDGET}`);
			const content = value.text.slice(offset, offset + budget), next = offset + content.length;
			return { ...ref, type: value.event.type, is_error: value.failed, content, offset, next_offset: next < value.text.length ? next : null, total_chars: value.text.length, complete: offset === 0 && next === value.text.length };
		},
	})];
	return { packet, tools, bindSource, includeEntry, resolveReview };
}
