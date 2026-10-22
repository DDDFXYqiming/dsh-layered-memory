import { existsSync, readFileSync, readdirSync, copyFileSync, rmSync, mkdirSync } from "node:fs";
import { join, basename } from "node:path";
import { defineTool } from "@deepseek-ai/dsh-tools";
import { atomicWriteFileSync } from "./atomic-write.js";
import {
	PENDING_DIR, ARCHIVE_DIR, safeNs, nsRoot, resolveNamespace, ensureNamespaceLayout, slugify,
	readEntry, readEntries, listEntryHistory, restoreEntry, archiveEntry,
	withNsWriteLock, withNsWriteLocks, bumpAccess, computeNamespaceStats, pendingNames,
	readNamespaceIdentity, migrateNamespace, hashText,
} from "./store.js";
import { readIndex, readRules, syncIndex, indexChars, buildCombinedPromptIndex, L1_MAX_CHARS_DEFAULT } from "./l1index.js";
import { writeMemory, readPending, parsePending, redactSecretLines } from "./memory-ops.js";
import { enqueueReview, readReviewState } from "./review.js";
import { runMaintain } from "./maintain.js";
import { listNamespaces, searchNamespaces } from "./search.js";

const str = { type: "string" }, bool = { type: "boolean" }, num = { type: "integer" };
const req = schema => ({ ...schema, required: true });
const obj = properties => ({ type: "object", additionalProperties: false, properties });
const arr = items => ({ type: "array", items });
const nullable = schema => ({ oneOf: [schema, { type: "null" }] });
const record = { type: "object", additionalProperties: true };
const memoryKind = { type: "string", enum: ["fact", "sop"] };
const readKind = { type: "string", enum: ["fact", "sop", "archive", "pending", "index", "rules", "policy"] };
const entrySchema = kind => obj({ namespace: req(str), kind: req(kind), key: req(str) });
const entryRef = entrySchema(memoryKind), readableRef = entrySchema(readKind);
const namespaceArg = { ...str, description: "省略时使用当前工作区命名空间；default为全局" };
const refArg = { ...req(entryRef), description: "直接使用memory_list/search/read返回的entry" };
const sourceArgs = {
	sourceSession: { ...str, description: "已有证据所属会话；须与sourceSeqs成对提供" },
	sourceSeqs: { ...arr(num), description: "精确的来源事件序号，与sourceSession成对提供" },
	evidence_call_ids: { ...arr(str), description: "本会话中用于验证内容的工具call id（含PTC子调用id）" },
};
const mutationOutput = {
	entry: req(entryRef), changed: req(bool), sourceTouched: req(bool), revision: req(str),
	action: req(str), history: nullable(str), index: record,
};
const jsonRender = (_args, value) => [{ type: "text", text: JSON.stringify(value, null, 2) }];
function tool(name, description, parameters, properties, execute, readOnly = false, render = jsonRender) {
	return defineTool({ name, description, parameters, output: { schema: { type: "object", additionalProperties: true, properties }, render },
		execute, ...(readOnly ? { isConcurrencySafe: () => true } : {}),
		presentCall: () => ({ card: "generic", title: name, kind: readOnly ? "read" : "execute" }) });
}
function ref(value) { return { namespace: safeNs(value.namespace), kind: value.kind, key: value.key }; }
function mustRead(root, entry) {
	const value = readEntry(root, entry.kind, entry.key);
	if (!value) throw new Error(`记忆不存在：${entry.namespace}/${entry.kind}/${entry.key}`);
	return value;
}
function source(args, exec, preserve = false) {
	if ((args.sourceSession !== undefined) !== (args.sourceSeqs !== undefined)) throw new Error("sourceSession与sourceSeqs必须成对提供");
	if (args.sourceSession !== undefined) {
		if (!args.sourceSession.trim() || !args.sourceSeqs.length) throw new Error("显式来源需要会话id及至少一个事件seq");
		return { sourceSession: args.sourceSession, sourceSeqs: args.sourceSeqs, preserveSource: false };
	}
	if (preserve) return { preserveSource: true };
	return { sourceSession: exec.agent.session.id, sourceSeqs: [], sourceCallId: exec.callId, ...(args.evidence_call_ids ? { evidenceCallIds: args.evidence_call_ids } : {}), preserveSource: false };
}
function safeFile(key) {
	if (!key || basename(key) !== key || key === "." || key === ".." || /[\/]/.test(key)) throw new Error("请提供目录内的文件名");
	return key;
}

// 分页只能按整行切；单行超长时整行返回。
export function pageContent(text, args = {}) {
	const lines = text.split("\n"), total = lines.length;
	const from = args.full ? 1 : args.from_line ?? 1;
	const requestedTo = args.full ? total : args.to_line ?? total;
	if (from < 1 || from > total || requestedTo < from) throw new RangeError(`有效行范围为1..${total}`);
	const last = Math.min(requestedTo, total), cap = args.full ? Infinity : args.max_chars ?? 16000;
	if (cap < 1) throw new RangeError("max_chars必须大于0");
	let to = from - 1, used = 0;
	for (let line = from; line <= last; line++) {
		const cost = lines[line - 1].length + (to >= from ? 1 : 0);
		if (to >= from && used + cost > cap) break;
		used += cost; to = line;
	}
	return { content: lines.slice(from - 1, to).join("\n"), complete: from === 1 && to === total,
		from_line: from, to_line: to, total_lines: total, next_line: to < total ? to + 1 : null, oversized_line: used > cap };
}
export function pendingSummary(content) {
	return content.split(/\r?\n/).map(line => line.trim()).find(line => line && !line.startsWith("#") && !line.startsWith("- source"))?.slice(0, 180) ?? "";
}

export function buildTools(ctx, cfg) {
	const nsOf = (args, exec) => resolveNamespace(cfg, args.namespace, exec.agent.session.header.cwd);
	const rootOf = entry => nsRoot(cfg.memoryDir, entry.namespace);
	const cap = cfg.l1MaxChars ?? L1_MAX_CHARS_DEFAULT;
	const rootsFor = (args, exec) => args.all_namespaces ? listNamespaces(cfg.memoryDir) : args.namespace ? [safeNs(args.namespace)] : [...new Set([nsOf(args, exec), "default"])];
	const result = (entry, action, stored, sourceTouched = false) => ({ entry, action, changed: stored.changed ?? true, sourceTouched, revision: mustRead(rootOf(entry), entry).revision, history: stored.history || null, ...(stored.index ? { index: stored.index } : {}) });
	const defs = [];
	defs.push(tool("memory_read", "按entry读取活跃或归档记忆。返回连续整行及revision；只有完整正文才complete=true。kind=index/rules/policy可读取完整索引、规则、L0。", {
		entry: req(readableRef), full: bool, from_line: num, to_line: num,
		max_chars: { ...num, description: "正整数，整行分页目标；单行超限时仍返回完整该行" }, if_revision: str,
	}, {
		entry: req(readableRef), title: req(str), content: req(str), meta: req(record), revision: req(str),
		complete: req(bool), not_found: req(bool), from_line: req(num), to_line: req(num), total_lines: req(num), next_line: req(nullable(num)), oversized_line: req(bool),
	}, async args => {
		const entry = ref(args.entry), root = rootOf(entry);
		let value;
		if (entry.kind === "fact" || entry.kind === "sop") value = readEntry(root, entry.kind, entry.key);
		else {
			const fixed = { index: "index.txt", rules: "index.txt", policy: "memory_management_sop.md" };
			const path = fixed[entry.kind] ? join(root, fixed[entry.kind]) : join(root, entry.kind === "archive" ? ARCHIVE_DIR : PENDING_DIR, safeFile(entry.key));
			if (existsSync(path)) {
				const content = entry.kind === "rules" ? readRules(root) : readFileSync(path, "utf8");
				value = { title: entry.key, content, meta: { archived: entry.kind === "archive" }, revision: hashText(content) };
			}
		}
		if (!value) return { entry, title: entry.key, content: "", meta: {}, revision: "", complete: false, not_found: true, from_line: 0, to_line: 0, total_lines: 0, next_line: null, oversized_line: false };
		if (args.if_revision && args.if_revision !== value.revision) throw new Error("条目已变化，请从第1行重新读取");
		if (entry.kind === "fact" || entry.kind === "sop") bumpAccess(root, `${entry.kind}:${entry.key}`, { halfLifeDays: cfg.heatHalfLifeDays });
		return { entry, title: value.title, meta: value.meta, revision: value.revision, not_found: false, ...pageContent(value.content, args) };
	}, true));

	defs.push(tool("memory_list", "列出当前空间与全局空间的活跃条目，返回可直接读取的entry；include_archived显示归档。", {
		namespace: namespaceArg, all_namespaces: bool, include_archived: bool,
	}, { namespaces: req(arr(str)), entries: req(arr(obj({ entry: req(entryRef), title: req(str), archived: req(bool), revision: req(str) }))) }, async (args, exec) => {
		const namespaces = rootsFor(args, exec), entries = [];
		for (const namespace of namespaces) {
			for (const value of readEntries(nsRoot(cfg.memoryDir, namespace))) {
				if (value.meta.archived && !args.include_archived) continue;
				entries.push({ entry: { namespace, kind: value.kind, key: value.key }, title: value.title, archived: Boolean(value.meta.archived), revision: value.revision });
			}
		}
		return { namespaces, entries };
	}, true));

	defs.push(tool("memory_search", "全文检索当前空间与default全局空间，默认只查活跃正文。需要历史内容时显式include_archived；每个结果entry均可memory_read。", {
		query: req(str), namespace: namespaceArg, all_namespaces: bool, include_archived: bool, limit: { ...num, description: "返回1至50条结果，默认8" },
	}, { namespaces: req(arr(str)), results: req(arr(obj({ entry: req(readableRef), title: req(str), archived: req(bool), score: req({ type: "number" }), snippet: req(str) }))) }, async (args, exec) => {
		const namespaces = rootsFor(args, exec), limit = args.limit ?? 8;
		if (limit < 1 || limit > 50) throw new RangeError("limit必须在1至50之间");
		return { namespaces, results: searchNamespaces(cfg.memoryDir, namespaces, args.query, { limit, includeArchived: args.include_archived ?? false }) };
	}, true));

	defs.push(tool("memory_write", "创建新的fact或SOP。已有条目使用memory_update；必须提供本次验证证据。", {
		namespace: namespaceArg, kind: req(memoryKind), topic: req(str), content: req(str), evidence: req(str), related: arr(entryRef), ...sourceArgs,
	}, mutationOutput, async (args, exec) => {
		const namespace = nsOf(args, exec), root = nsRoot(cfg.memoryDir, namespace);
		return withNsWriteLock(root, () => {
			ensureNamespaceLayout(root);
			const key = args.kind === "fact" ? args.topic.trim() : slugify(args.topic);
			const entry = { namespace, kind: args.kind, key };
			if (readEntry(root, entry.kind, entry.key)) throw new Error("条目已存在，请使用memory_update及此entry");
			const stored = writeMemory(root, { mode: "create", topic: args.topic, entryType: args.kind, content: args.content, evidence: args.evidence, namespace, ...source(args, exec), ...(args.related ? { related: args.related } : {}), maxChars: cap });
			return result(entry, "created", stored, args.sourceSession === undefined);
		});
	}));

	defs.push(tool("memory_update", "仅更新已有entry并保存旧版本，保持原展示标题及key。仅整理措辞时省略evidence保留原来源；新增事实须给新evidence。", {
		entry: refArg, content: req(str), evidence: str, related: arr(entryRef), if_revision: str, ...sourceArgs,
	}, mutationOutput, async (args, exec) => {
		const entry = ref(args.entry), root = rootOf(entry);
		return withNsWriteLock(root, () => {
			const before = mustRead(root, entry);
			if (args.if_revision && before.revision !== args.if_revision) throw new Error("条目已变化，请重新读取后更新");
			const newEvidence = args.evidence !== undefined || args.sourceSession !== undefined || args.evidence_call_ids !== undefined;
			const stored = writeMemory(root, { mode: "update", key: entry.key, entryType: entry.kind, content: args.content,
				evidence: args.evidence ?? before.meta.evidence, namespace: entry.namespace, ...source(args, exec, !newEvidence), ...(args.related !== undefined ? { related: args.related } : {}), maxChars: cap, snapshot: true });
			return result(entry, "updated", stored, newEvidence && args.sourceSession === undefined);
		});
	}));
	defs.push(tool("memory_review", "为已发现但尚未解决的新旧事实冲突登记复核。提供确切entry、冲突原因和本会话成功验证工具的call id；宿主保存真实证据片段供维护代理读取。", {
		entry: refArg, reason: req(str), evidence_call_ids: req(arr(str)),
	}, { review: req(record) }, async (args, exec) => {
		if (args.evidence_call_ids.length < 1 || args.evidence_call_ids.length > 4) throw new Error("请提供1至4个验证调用id");
		const entry = ref(args.entry), root = rootOf(entry);
		const { extractSessionEventText } = await import("@deepseek-ai/dsh-session-query");
		const observation = await ctx.get("sessionQuery").observeSession(exec.agent.session.id, { projectionMode: "none", signal: exec.signal });
		const evidence = [];
		try {
			for (const callId of new Set(args.evidence_call_ids)) {
				const event = observation.events.findLast(event =>
					(event.type === "tool/result" && event.data.message.source.callId === callId && !event.data.message.isError) ||
					(["tool/ptc-dispatch", "tool/code-dispatch"].includes(event.type) && (event.data.subCallId || event.data.callId) === callId && !event.data.isError));
				if (!event) throw new Error(`本会话未找到成功的证据调用：${callId}`);
				const text = redactSecretLines(event.type === "tool/result" ? extractSessionEventText(event) : event.data.content.filter(block => block.type === "text").map(block => block.text).join("\n"));
				evidence.push({ text: text.length > 12000 ? `${text.slice(0, 12000)}\n[证据片段已截断，完整结果见来源事件]` : text, sourceSession: exec.agent.session.id, sourceSeqs: [event.seq] });
			}
		} finally { observation[Symbol.dispose](); }
		return { review: enqueueReview(root, { entry, revision: mustRead(root, entry).revision, reason: redactSecretLines(args.reason), evidence }) };
	}));

	defs.push(tool("memory_archive", "归档或恢复可见性；归档正文仍可memory_read。replacement可指向已保存的替代entry。", {
		entry: refArg, unarchive: bool, replacement: entryRef, if_revision: str,
	}, mutationOutput, async args => {
		const entry = ref(args.entry), root = rootOf(entry), replacement = args.replacement ? ref(args.replacement) : null;
		return withNsWriteLocks(replacement ? [root, rootOf(replacement)] : [root], () => {
			const before = mustRead(root, entry);
			if (args.if_revision && before.revision !== args.if_revision) throw new Error("条目已变化，请重新读取后归档");
			if (replacement && (JSON.stringify(replacement) === JSON.stringify(entry) || mustRead(rootOf(replacement), replacement).meta.archived)) throw new Error("替代条目必须是另一个活跃entry");
			const stored = archiveEntry(root, entry.kind, entry.key, { unarchive: args.unarchive ?? false, ...(replacement ? { replacement } : {}) });
			stored.index = syncIndex(root, cap);
			return result(entry, args.unarchive ? "unarchived" : "archived", stored);
		});
	}));

	defs.push(tool("memory_history", "列出指定entry的精确历史快照。用返回的id作为memory_rollback的snapshot_id。", { entry: refArg }, {
		entry: req(entryRef), snapshots: req(arr(record)),
	}, async args => {
		const entry = ref(args.entry);
		return { entry, snapshots: listEntryHistory(rootOf(entry), entry.kind, entry.key) };
	}, true));

	defs.push(tool("memory_rollback", "恢复指定snapshot_id；省略时恢复最近快照。恢复前保存当前正文与元数据，可再从history撤销恢复。", {
		entry: refArg, snapshot_id: str,
	}, { ...mutationOutput, restored_from: req(str), meta_restored: req(bool) }, async args => {
		const entry = ref(args.entry), root = rootOf(entry);
		return withNsWriteLock(root, () => {
			const restored = restoreEntry(root, entry.kind, entry.key, args.snapshot_id);
			if (!restored.restored) throw new Error("未找到属于此entry的历史快照");
			return { ...result(entry, "restored", { ...restored, index: syncIndex(root, cap) }), restored_from: restored.source, meta_restored: restored.meta_restored };
		});
	}));

	defs.push(tool("memory_index", "重建指定空间的完整L1磁盘索引；提示视图另外受字符预算限制。", { namespace: namespaceArg }, {
		namespace: req(str), index: req(record), changed: req(bool), sourceTouched: req(bool),
	}, async (args, exec) => {
		const namespace = nsOf(args, exec), root = nsRoot(cfg.memoryDir, namespace);
		return withNsWriteLock(root, () => {
			ensureNamespaceLayout(root);
			const index = syncIndex(root, cap);
			return { namespace, index, changed: index.rewritten, sourceTouched: false };
		});
	}));

	defs.push(tool("memory_maintain", "扫描重复、冲突、pending及冷条目，整理索引和元数据一致性。actionable列出需要语义复核的实际待办。", { namespace: namespaceArg }, {
		namespace: req(str), report: req(record),
	}, async (args, exec) => {
		const namespace = nsOf(args, exec), root = nsRoot(cfg.memoryDir, namespace);
		return withNsWriteLock(root, () => {
			ensureNamespaceLayout(root);
			return { namespace, report: runMaintain(root, cap, { ...cfg.maintainOpts, nearDupeThreshold: cfg.nearDupeThreshold, mergeCandidateThreshold: cfg.mergeCandidateThreshold, minTokensForFuzzy: cfg.minTokensForFuzzy, coldReviewDays: cfg.coldReviewDays }) };
		});
	}));

	defs.push(tool("memory_stats", "查看所有空间的条目、历史、pending及最近维护状态。namespace可限定单个空间。", { namespace: namespaceArg }, {
		runtime: req(record), namespaces: req(arr(record)),
	}, async args => {
		const namespaces = args.namespace ? [safeNs(args.namespace)] : listNamespaces(cfg.memoryDir);
		return { runtime: cfg.runtimeInfo, namespaces: namespaces.map(namespace => {
			const root = nsRoot(cfg.memoryDir, namespace), history = join(root, ".history");
			const readState = name => existsSync(join(root, name)) ? JSON.parse(readFileSync(join(root, name), "utf8")) : null;
			const views = buildCombinedPromptIndex(cfg.memoryDir, namespace, { projectMaxChars: cap, globalMaxChars: cfg.globalL1MaxChars }).sections;
			return { ...readNamespaceIdentity(cfg.memoryDir, namespace), ...computeNamespaceStats(root), index_chars: indexChars(readIndex(root)),
				history_files: existsSync(history) ? readdirSync(history).filter(name => name.endsWith(".md") || name.endsWith(".json") && !name.endsWith(".meta.json") && JSON.parse(readFileSync(join(history, name), "utf8")).format === "memory-snapshot-v2").length : 0,
				prompt_views: views.map(({ namespace, totalChars, shownChars, maxChars, overLimit }) => ({ namespace, total_chars: totalChars, shown_chars: shownChars, max_chars: maxChars, truncated: overLimit })),
				maintenance: readState("maintenance-report.json"), maintenance_runs: readState("maintenance-runs.json"), reflection: readState("reflection-state.json"), review: readReviewState(root) };
		}) };
	}, true));

	defs.push(tool("memory_pending", "列出候选摘要和可读entry。使用memory_read读取候选，再接受整理后的内容或discard。", { namespace: namespaceArg }, {
		namespace: req(str), pending: req(arr(obj({ name: req(str), entry: req(readableRef), summary: req(str) }))),
	}, async (args, exec) => {
		const namespace = nsOf(args, exec), root = nsRoot(cfg.memoryDir, namespace);
		return { namespace, pending: pendingNames(root).map(name => ({ name, entry: { namespace, kind: "pending", key: name }, summary: pendingSummary(readPending(root, name)) })) };
	}, true));
	function closePending(root, name, disposition, details) {
		const key = `${Date.now()}-${disposition}-${safeFile(name)}`;
		mkdirSync(join(root, ARCHIVE_DIR), { recursive: true });
		copyFileSync(join(root, PENDING_DIR, name), join(root, ARCHIVE_DIR, key));
		atomicWriteFileSync(join(root, ARCHIVE_DIR, `${key}.json`), JSON.stringify({ disposition, ...details, closedAt: new Date().toISOString() }, null, 2));
		rmSync(join(root, PENDING_DIR, name));
		return key;
	}
	defs.push(tool("memory_accept", "把候选整理成新的fact/SOP。content必须是精炼后的可复用正文，evidence说明验证；原候选留档。", {
		namespace: namespaceArg, name: req(str), kind: req(memoryKind), topic: req(str), content: req(str), evidence: req(str), related: arr(entryRef), ...sourceArgs,
	}, { ...mutationOutput, candidate_archive: req(readableRef) }, async (args, exec) => {
		const namespace = nsOf(args, exec), root = nsRoot(cfg.memoryDir, namespace);
		return withNsWriteLock(root, () => {
			const pending = readPending(root, safeFile(args.name));
			if (!pending) throw new Error("候选不存在或格式无效");
			const key = args.kind === "fact" ? args.topic.trim() : slugify(args.topic), entry = { namespace, kind: args.kind, key };
			const stored = writeMemory(root, { mode: "create", topic: args.topic, entryType: args.kind, content: args.content, evidence: args.evidence,
				namespace, ...source(args, exec), ...(args.related ? { related: args.related } : {}), maxChars: cap });
			const archiveKey = closePending(root, args.name, "accepted", { entry, originalSource: parsePending(pending) });
			return { ...result(entry, "accepted", stored, args.sourceSession === undefined), candidate_archive: { namespace, kind: "archive", key: archiveKey } };
		});
	}));

	defs.push(tool("memory_discard", "关闭无需入库的候选并留可恢复的原文及处置原因。", {
		namespace: namespaceArg, name: req(str), reason: req(str),
	}, { discarded: req(bool), archive: req(readableRef) }, async (args, exec) => {
		const namespace = nsOf(args, exec), root = nsRoot(cfg.memoryDir, namespace);
		return withNsWriteLock(root, () => {
			if (!readPending(root, safeFile(args.name))) throw new Error("候选不存在或格式无效");
			const key = closePending(root, args.name, "discarded", { reason: args.reason });
			return { discarded: true, archive: { namespace, kind: "archive", key } };
		});
	}));

	defs.push(tool("memory_promote", "把entry复制到目标空间（默认default全局），保留纯正文与原来源。目标同名已存在时报错；可归档源条目并链接新entry。", {
		entry: refArg, to_namespace: str, archive_source: bool,
	}, { ...mutationOutput, source: req(entryRef), source_archived: req(bool) }, async args => {
		const original = ref(args.entry), namespace = safeNs(args.to_namespace ?? "default");
		if (namespace === original.namespace) throw new Error("目标空间必须与来源不同");
		const fromRoot = rootOf(original), toRoot = nsRoot(cfg.memoryDir, namespace);
		return withNsWriteLocks([fromRoot, toRoot], () => {
			const originalValue = mustRead(fromRoot, original);
			ensureNamespaceLayout(toRoot);
			const entry = { ...original, namespace };
			const stored = writeMemory(toRoot, { mode: "create", key: entry.key, topic: originalValue.title, entryType: entry.kind, content: originalValue.content,
				evidence: originalValue.meta.evidence, sourceSession: originalValue.meta.sourceSession, sourceSeqs: originalValue.meta.sourceSeqs,
				namespace, related: [...(originalValue.meta.related || []), original], maxChars: cap });
			const sourceArchived = args.archive_source ?? true;
			if (sourceArchived) { archiveEntry(fromRoot, original.kind, original.key, { replacement: entry }); syncIndex(fromRoot, cap); }
			return { ...result(entry, "promoted", stored), source: original, source_archived: sourceArchived };
		});
	}));

	defs.push(tool("memory_namespace", "列出命名空间与工作区映射，或迁移到新空间并保留原目录。目标必须为空。", {
		action: req({ type: "string", enum: ["list", "migrate"] }), from_namespace: str, to_namespace: str, workspace: str,
	}, { namespaces: arr(record), migration: record }, async args => {
		if (args.action === "list") return { namespaces: listNamespaces(cfg.memoryDir).map(namespace => readNamespaceIdentity(cfg.memoryDir, namespace)) };
		if (!args.from_namespace || !args.to_namespace) throw new Error("迁移需要from_namespace和to_namespace");
		const workspace = args.workspace && cfg.workspaceRootFor ? cfg.workspaceRootFor(args.workspace) : args.workspace;
		return { migration: migrateNamespace(cfg.memoryDir, args.from_namespace, args.to_namespace, workspace ? { workspace } : {}) };
	}));
	const expandCursor = obj({ event_offset: req(num), from_line: req(num) });
	defs.push(tool("memory_expand", "按精确sourceSeqs读取来源事件，支持普通工具与PTC子调用。用next继续读取完整证据，不序列化整份会话或模型内部元数据。", {
		entry: refArg, event_offset: { ...num, description: "从第几个来源事件开始，0起" }, from_line: num,
		max_events: { ...num, description: "本页1至20个事件，默认4" }, max_chars: { ...num, description: "本页正整数字符预算，默认12000" },
	}, {
		entry: req(entryRef), available: req(bool), sourceSession: nullable(str), sourceSeqs: req(arr(num)),
		events: req(arr(record)), next: req(nullable(expandCursor)), complete: req(bool), message: str,
	}, async (args, exec) => {
		const entry = ref(args.entry), value = mustRead(rootOf(entry), entry);
		const { sourceSession, sourceSeqs = [] } = value.meta;
		if (!sourceSession || !sourceSeqs.length) return { entry, available: false, sourceSession: sourceSession || null, sourceSeqs, events: [], next: null, complete: false, message: "该条目没有可回放的精确来源事件" };
		const query = ctx.get("sessionQuery");
		if (!query) return { entry, available: false, sourceSession, sourceSeqs, events: [], next: null, complete: false, message: "此宿主未提供sessionQuery服务" };
		const { extractSessionEventText } = await import("@deepseek-ai/dsh-session-query");
		const offset = args.event_offset ?? 0, maxEvents = args.max_events ?? 4, budget = args.max_chars ?? 12000;
		if (offset < 0 || offset >= sourceSeqs.length) throw new RangeError("event_offset超出来源事件列表");
		if (maxEvents < 1 || maxEvents > 20) throw new RangeError("max_events必须在1至20之间");
		if (budget < 1) throw new RangeError("max_chars必须大于0");
		const events = []; let used = 0, next = null;
		for (let i = offset; i < sourceSeqs.length && events.length < maxEvents; i++) {
			exec.signal?.throwIfAborted();
			const { target } = await query.readEvent({ sessionId: sourceSession, seq: sourceSeqs[i], before: 0, after: 0 }, exec.signal);
			const ptc = target.type === "tool/ptc-dispatch" || target.type === "tool/code-dispatch";
			const text = ptc ? target.data.content.filter(block => block.type === "text").map(block => block.text).join("\n") : extractSessionEventText(target);
			const page = pageContent(text, { from_line: i === offset ? args.from_line ?? 1 : 1, max_chars: Math.max(1, budget - used) });
			events.push({ seq: target.seq, type: target.type, time: target.time, ...(ptc ? { tool: target.data.name, call_id: target.data.subCallId, is_error: target.data.isError } : {}), ...page });
			used += page.content.length;
			if (page.next_line !== null) { next = { event_offset: i, from_line: page.next_line }; break; }
			if (i + 1 < sourceSeqs.length) next = { event_offset: i + 1, from_line: 1 }; else next = null;
			if (used >= budget) break;
		}
		return { entry, available: true, sourceSession, sourceSeqs, events, next, complete: offset === 0 && (args.from_line ?? 1) === 1 && next === null };
	}, true));

	return defs;
}
