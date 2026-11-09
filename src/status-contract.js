export const STATUS_PACKAGE = "@dsh-external/dsh-layered-memory-status";
export const STATUS_SERVICE = "layeredMemoryStatus";

function exactObject(value, keys) {
	if (!value || typeof value !== "object" || Array.isArray(value) || Object.keys(value).length !== keys.length || keys.some(key => !Object.hasOwn(value, key))) throw new TypeError("记忆状态对象字段不匹配");
	return value;
}
function text(value) {
	if (typeof value !== "string" || !value) throw new TypeError("记忆状态标识必须是非空字符串");
	return value;
}
function count(value) {
	if (!Number.isSafeInteger(value) || value < 0) throw new TypeError("记忆状态计数必须是非负整数");
	return value;
}
function number(value) {
	if (typeof value !== "number" || !Number.isFinite(value)) throw new TypeError("记忆状态数值必须是有限数字");
	return value;
}
function boolean(value) {
	if (typeof value !== "boolean") throw new TypeError("记忆状态标记必须是布尔值");
	return value;
}
function nullableText(value) { return value === null ? null : text(value); }
function item(value) {
	if (value === null) return value;
	exactObject(value, ["id", "namespace", "purpose", "status", "sessionId", "workerId", "legacy", "phase", "startedAt", "finishedAt", "changedEntries", "retainedEntries", "waitingEntries", "remainingEntries", "summary"]);
	for (const key of ["id", "namespace", "purpose", "status", "startedAt"]) text(value[key]);
	for (const key of ["sessionId", "workerId", "phase", "finishedAt", "summary"]) nullableText(value[key]);
	boolean(value.legacy);
	for (const key of ["changedEntries", "retainedEntries", "waitingEntries"]) count(value[key]);
	if (value.remainingEntries !== null) count(value.remainingEntries);
	return value;
}
export function parseActivitySnapshot(value) {
	exactObject(value, ["parentSessionId", "revision", "reflection", "running", "latestChanged", "latestFailure", "records"]);
	text(value.parentSessionId);
	count(value.revision);
	if (!Array.isArray(value.reflection)) throw new TypeError("空间整理状态必须是数组");
	for (const state of value.reflection) {
		exactObject(state, ["namespace", "nextEligibleAt", "retryCount", "retryReason"]);
		text(state.namespace);
		nullableText(state.nextEligibleAt);
		count(state.retryCount);
		nullableText(state.retryReason);
	}
	for (const key of ["running", "records"]) {
		if (!Array.isArray(value[key])) throw new TypeError("运行状态必须是数组");
		for (const row of value[key]) { if (row === null) throw new TypeError("运行状态缺少记录"); item(row); }
	}
	item(value.latestChanged);
	item(value.latestFailure);
	return value;
}
export function parseActivityFrame(value) {
	exactObject(value, ["type", "snapshot"]);
	if (value.type !== "snapshot" && value.type !== "update") throw new TypeError("未知的记忆状态帧");
	parseActivitySnapshot(value.snapshot);
	return value;
}
export function parseWorkers(value) {
	if (!Array.isArray(value)) throw new TypeError("维护会话必须是数组");
	for (const worker of value) {
		exactObject(worker, ["id", "purpose", "parentSessionId", "status", "runId", "phase", "canStop"]);
		nullableText(worker.id);
		text(worker.parentSessionId);
		if (!["turn_review", "batch"].includes(worker.purpose)) throw new TypeError("未知的维护会话用途");
		if (!["idle", "running", "stopping"].includes(worker.status)) throw new TypeError("未知的维护会话状态");
		nullableText(worker.runId);
		nullableText(worker.phase);
		boolean(worker.canStop);
	}
	return value;
}
export function parseWorkerHistory(value) {
	exactObject(value, ["workerId", "purpose", "rows", "offset", "nextOffset", "hasMore", "hasPrevious", "totalEvents", "minOffset"]);
	text(value.workerId);
	text(value.purpose);
	for (const key of ["offset", "nextOffset", "totalEvents", "minOffset"]) count(value[key]);
	boolean(value.hasMore);
	boolean(value.hasPrevious);
	if (!Array.isArray(value.rows)) throw new TypeError("会话记录必须是数组");
	for (const row of value.rows) {
		exactObject(row, ["id", "kind", "text", "at"]);
		text(row.id);
		if (!["assistant", "reasoning", "tool", "result", "notice"].includes(row.kind)) throw new TypeError("未知的会话记录类型");
		text(row.text);
		nullableText(row.at);
	}
	return value;
}
function parseStop(value) { exactObject(value, ["stopped"]); boolean(value.stopped); return value; }
const codec = (name, parse) => ({ mode: "strict", typeSymbol: STATUS_PACKAGE + "#" + name, create: () => ({ parse }) });
const parameter = { name: "sessionId", wire: "sessionId", source: "json", codec: codec("SessionId", text) };
const workerParameter = { name: "workerId", wire: "workerId", source: "json", codec: codec("WorkerId", text) };
const offsetParameter = { name: "offset", wire: "offset", source: "json", codec: codec("HistoryOffset", value => value === null ? null : count(value)) };
const limitParameter = { name: "limit", wire: "limit", source: "json", codec: codec("HistoryLimit", count) };
export const STATUS_REMOTE = {
	package: STATUS_PACKAGE,
	descriptors: [
		{ id: STATUS_PACKAGE + "#getSnapshot", service: STATUS_SERVICE, namespace: STATUS_SERVICE, method: "getSnapshot", invocation: { kind: "direct" }, parameters: [parameter], cancellation: { parameter: "signal" }, result: codec("ActivitySnapshot", parseActivitySnapshot) },
		{ id: STATUS_PACKAGE + "#watch", service: STATUS_SERVICE, namespace: STATUS_SERVICE, method: "watch", mode: "stream", invocation: { kind: "direct" }, parameters: [parameter], cancellation: { parameter: "signal" }, result: codec("ActivityFrame", parseActivityFrame) },
		{ id: STATUS_PACKAGE + "#listWorkers", service: STATUS_SERVICE, namespace: STATUS_SERVICE, method: "listWorkers", invocation: { kind: "direct" }, parameters: [parameter], cancellation: { parameter: "signal" }, result: codec("MaintenanceWorkers", parseWorkers) },
		{ id: STATUS_PACKAGE + "#readWorker", service: STATUS_SERVICE, namespace: STATUS_SERVICE, method: "readWorker", invocation: { kind: "direct" }, parameters: [parameter, workerParameter, offsetParameter, limitParameter], cancellation: { parameter: "signal" }, result: codec("WorkerHistory", parseWorkerHistory) },
		{ id: STATUS_PACKAGE + "#stopWorker", service: STATUS_SERVICE, namespace: STATUS_SERVICE, method: "stopWorker", invocation: { kind: "direct" }, parameters: [parameter, workerParameter], cancellation: { parameter: "signal" }, result: codec("WorkerStop", parseStop) },
	],
};

function stringValue(value) {
	if (typeof value !== "string") throw new TypeError("记忆文本必须是字符串");
	return value;
}
function inputObject(value, required, optional = []) {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError("记忆参数必须是对象");
	const allowed = new Set([...required, ...optional]);
	if (Object.keys(value).some(key => !allowed.has(key)) || required.some(key => !Object.hasOwn(value, key))) throw new TypeError("记忆参数字段不匹配");
	return value;
}
function parseEntry(value) {
	exactObject(value, ["namespace", "kind", "key"]);
	text(value.namespace);
	if (!["rule", "fact", "sop"].includes(value.kind)) throw new TypeError("未知的记忆类型");
	text(value.key);
	return value;
}
function parseListEntriesInput(value) {
	inputObject(value, ["namespace"], ["kind", "query", "includeArchived"]);
	text(value.namespace);
	if (value.kind !== undefined && !["rule", "fact", "sop"].includes(value.kind)) throw new TypeError("未知的记忆类型");
	if (value.query !== undefined) stringValue(value.query);
	if (value.includeArchived !== undefined) boolean(value.includeArchived);
	return value;
}
function parseEntryInput(value) {
	inputObject(value, ["entry"]);
	parseEntry(value.entry);
	return value;
}
function parseCreateInput(value) {
	inputObject(value, ["namespace", "kind", "topic", "content", "evidence"]);
	text(value.namespace);
	if (!["rule", "fact", "sop"].includes(value.kind)) throw new TypeError("未知的记忆类型");
	text(value.topic);
	stringValue(value.content);
	stringValue(value.evidence);
	return value;
}
function parseUpdateInput(value) {
	inputObject(value, ["entry", "content"], ["evidence", "ifRevision"]);
	parseEntry(value.entry);
	stringValue(value.content);
	if (value.evidence !== undefined) stringValue(value.evidence);
	if (value.ifRevision !== undefined) stringValue(value.ifRevision);
	return value;
}
function parseArchivedInput(value) {
	inputObject(value, ["entry", "archived"]);
	parseEntry(value.entry);
	boolean(value.archived);
	return value;
}
function parseRollbackInput(value) {
	inputObject(value, ["entry", "snapshotId"]);
	parseEntry(value.entry);
	text(value.snapshotId);
	return value;
}
function parseNamespaces(value) {
	if (!Array.isArray(value)) throw new TypeError("命名空间列表必须是数组");
	for (const row of value) {
		exactObject(row, ["namespace", "workspace"]);
		text(row.namespace);
		nullableText(row.workspace);
	}
	return value;
}
function parseNamespaceInput(value) {
	inputObject(value, ["namespace"]);
	text(value.namespace);
	return value;
}
function parseListEntriesPageInput(value) {
	inputObject(value, ["namespace"], ["kind", "query", "includeArchived", "offset", "limit"]);
	text(value.namespace);
	if (value.kind !== undefined && !["rule", "fact", "sop"].includes(value.kind)) throw new TypeError("未知的记忆类型");
	if (value.query !== undefined) stringValue(value.query);
	if (value.includeArchived !== undefined) boolean(value.includeArchived);
	if (value.offset !== undefined) count(value.offset);
	if (value.limit !== undefined) count(value.limit);
	return value;
}
function parseInjectionInput(value) {
	inputObject(value, ["namespace"], ["query"]);
	text(value.namespace);
	if (value.query !== undefined) stringValue(value.query);
	return value;
}
// 容错解析：缺字段或类型不符按 0 处理，避免旧服务端数据让整个面板报错。
function parseNamespaceStats(value) {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError("索引占用统计必须是对象");
	const chars = key => (Number.isSafeInteger(value[key]) && value[key] >= 0 ? value[key] : 0);
	return {
		namespace: typeof value.namespace === "string" ? value.namespace : "",
		indexChars: chars("indexChars"),
		budgetChars: chars("budgetChars"),
		headChars: chars("headChars"),
		rulesChars: chars("rulesChars"),
		factsChars: chars("factsChars"),
		sopsChars: chars("sopsChars"),
		rulesLines: chars("rulesLines"),
		ruleCount: chars("ruleCount"),
		factCount: chars("factCount"),
		sopCount: chars("sopCount"),
	};
}
function parseRelatedList(value) {
	if (!Array.isArray(value)) throw new TypeError("关联列表必须是数组");
	for (const row of value) {
		if (!row || typeof row !== "object") throw new TypeError("关联项必须是对象");
		text(row.namespace);
		text(row.kind);
		text(row.key);
	}
	return value;
}
function parseEntryRow(value) {
	if (!value || typeof value !== "object") throw new TypeError("记忆条目必须是对象");
	parseEntry(value.entry);
	text(value.title);
	boolean(value.archived);
	nullableText(value.updatedAt);
	count(value.chars);
	if (value.heat !== undefined) number(value.heat);
	if (value.accessCount !== undefined) count(value.accessCount);
	nullableText(value.lastAt);
	if (value.related !== undefined) parseRelatedList(value.related);
	if (value.relatedCount !== undefined) count(value.relatedCount);
	stringValue(value.summary);
	if (value.rank !== null && value.rank !== undefined) count(value.rank);
	if (!["rule", "cold", "hot", "archived"].includes(value.injectionStatus)) throw new TypeError("未知的记忆注入状态");
	return value;
}
function parseEntries(value) {
	if (!Array.isArray(value)) throw new TypeError("记忆列表必须是数组");
	for (const row of value) parseEntryRow(row);
	return value;
}
function parseKindCounts(value) {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError("记忆分类统计必须是对象");
	for (const key of ["rule", "fact", "sop", "total"]) count(value[key]);
	return value;
}
function parseEntriesPage(value) {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError("记忆列表分页必须是对象");
	text(value.namespace);
	if (!Array.isArray(value.entries)) throw new TypeError("记忆列表必须是数组");
	for (const row of value.entries) parseEntryRow(row);
	const facets = value.facets;
	if (!facets || typeof facets !== "object" || Array.isArray(facets)) throw new TypeError("记忆库存统计必须是对象");
	count(facets.total);
	parseKindCounts(facets.active);
	parseKindCounts(facets.archived);
	for (const key of ["matched", "returned", "offset", "limit"]) count(value[key]);
	boolean(value.truncated);
	return value;
}
function parseReadEntry(value) {
	if (!value || typeof value !== "object") throw new TypeError("记忆条目详情必须是对象");
	parseEntry(value.entry);
	text(value.title);
	stringValue(value.content);
	text(value.revision);
	boolean(value.archived);
	stringValue(value.evidence);
	nullableText(value.sourceSession);
	nullableText(value.createdAt);
	nullableText(value.updatedAt);
	return value;
}
function parseCreatedEntry(value) {
	exactObject(value, ["entry", "revision"]);
	parseEntry(value.entry);
	text(value.revision);
	return value;
}
function parseRevision(value) {
	exactObject(value, ["revision"]);
	text(value.revision);
	return value;
}
function parseArchived(value) {
	exactObject(value, ["ok"]);
	if (value.ok !== true) throw new TypeError("记忆归档结果不正确");
	return value;
}
function parseHistoryChange(value) {
	exactObject(value, ["contentDelta", "evidenceChanged", "initial"]);
	if (value.contentDelta !== null) {
		if (!Number.isSafeInteger(value.contentDelta)) throw new TypeError("内容变化量必须是整数");
	}
	boolean(value.evidenceChanged);
	boolean(value.initial);
	return value;
}
function parseHistory(value) {
	if (!Array.isArray(value)) throw new TypeError("历史快照列表必须是数组");
	for (const row of value) {
		exactObject(row, ["snapshotId", "createdAt", "revision", "chars", "summary", "preview", "change"]);
		text(row.snapshotId);
		text(row.createdAt);
		text(row.revision);
		count(row.chars);
		stringValue(row.summary);
		stringValue(row.preview);
		parseHistoryChange(row.change);
	}
	return value;
}
function parseObjectResult(value) {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError("结果必须是对象");
	return value;
}
function parseInjectionItem(value) {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError("注入条目必须是对象");
	text(value.kind);
	text(value.key);
	text(value.title);
	count(value.chars);
	number(value.heat);
	if (value.rank !== null && value.rank !== undefined) count(value.rank);
	if (!["rule", "included", "cold", "recall", "partial", "omitted", "unknown"].includes(value.status)) throw new TypeError("未知的注入状态");
	boolean(value.included);
	if (!["body", "title", null].includes(value.promptLevel)) throw new TypeError("未知的提示词层级");
	nullableText(value.promptToken);
	nullableText(value.promptNamespace);
	if (value.promptLine !== null && value.promptLine !== undefined) count(value.promptLine);
	count(value.relatedCount);
	parseRelatedList(value.related);
	return value;
}
function parseInjectionState(value) {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError("注入预览必须是对象");
	text(value.namespace);
	boolean(value.preview);
	text(value.previewKind);
	text(value.disclaimer);
	boolean(value.sessionTracked);
	const basis = value.basis;
	if (!basis || typeof basis !== "object" || Array.isArray(basis)) throw new TypeError("注入预览依据必须是对象");
	for (const key of ["heatHalfLifeDays", "heatRecencyWindowDays", "relatedBonus", "relatedCap", "newEntryDays", "newEntryBonus", "rulesMinRatio", "coldRatio", "coldMax", "coldPoolStart", "recallLimit", "indexTargetRatio"]) number(basis[key]);
	text(basis.coldSeedScope);
	nullableText(basis.recallQuery);
	boolean(basis.rulesAttributed);
	boolean(basis.coldRatioApplied);
	stringValue(value.combinedText);
	if (!Array.isArray(value.sections)) throw new TypeError("注入分段必须是数组");
	for (const section of value.sections) {
		if (!section || typeof section !== "object") throw new TypeError("注入分段必须是对象");
		text(section.namespace);
		stringValue(section.text);
		count(section.totalChars);
		count(section.shownChars);
		count(section.maxChars);
		boolean(section.overLimit);
		count(section.entryCount);
		count(section.includedCount);
		count(section.omittedCount);
		boolean(section.coldRatioApplied);
	}
	for (const key of ["budgetChars", "indexChars", "targetChars", "triggerChars", "coldCount", "coldIncludedCount", "rankedCount", "includedCount", "omittedCount", "partialCount", "recallCount", "combinedIncludedCount"]) count(value[key]);
	const counts = value.counts;
	if (!counts || typeof counts !== "object" || Array.isArray(counts)) throw new TypeError("注入条目统计必须是对象");
	for (const key of ["total", "active", "archived", "rule", "fact", "sop"]) count(counts[key]);
	if (!Array.isArray(value.items)) throw new TypeError("注入条目必须是数组");
	for (const item of value.items) parseInjectionItem(item);
	return value;
}
function parseMaintenanceReport(value) {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError("维护报告必须是对象");
	const graph = value.graph;
	if (!graph || typeof graph !== "object" || Array.isArray(graph)) throw new TypeError("关系图谱必须是对象");
	if (!Array.isArray(graph.nodes)) throw new TypeError("关系图节点必须是数组");
	for (const node of graph.nodes) {
		if (!node || typeof node !== "object") throw new TypeError("关系图节点必须是对象");
		text(node.id);
		text(node.namespace);
		text(node.kind);
		text(node.key);
		text(node.title);
		number(node.heat);
		count(node.chars);
		count(node.degree);
	}
	if (!Array.isArray(graph.edges)) throw new TypeError("关系图边必须是数组");
	for (const edge of graph.edges) {
		if (!edge || typeof edge !== "object") throw new TypeError("关系图边必须是对象");
		text(edge.source);
		text(edge.target);
		text(edge.type);
		text(edge.sourceNamespace);
		text(edge.targetNamespace);
		if (edge.similarity !== null && edge.similarity !== undefined) number(edge.similarity);
	}
	count(graph.nodeCount);
	count(graph.edgeCount);
	if (graph.skipped !== undefined) {
		if (!Array.isArray(graph.skipped)) throw new TypeError("跳过的边必须是数组");
		for (const row of graph.skipped) {
			if (!row || typeof row !== "object") throw new TypeError("跳过的边必须是对象");
			text(row.source);
			text(row.target);
			text(row.type);
			text(row.reason);
		}
	}
	return value;
}
const storeParameter = (name, parse) => ({ name: "args", wire: "args", source: "json", codec: codec(name, parse) });
const storeDescriptor = (method, parseResult, parseInput) => ({
	id: STATUS_PACKAGE + "#" + method,
	service: STATUS_SERVICE,
	namespace: STATUS_SERVICE,
	method,
	invocation: { kind: "direct" },
	parameters: parseInput ? [storeParameter(method + "Input", parseInput)] : [],
	cancellation: { parameter: "signal" },
	result: codec(method + "Result", parseResult),
});
export const STORE_REMOTE = {
	package: STATUS_PACKAGE,
	descriptors: [
		storeDescriptor("listNamespaces", parseNamespaces),
		storeDescriptor("namespaceStats", parseNamespaceStats, parseNamespaceInput),
		storeDescriptor("listEntries", parseEntries, parseListEntriesInput),
		storeDescriptor("listEntriesPage", parseEntriesPage, parseListEntriesPageInput),
		storeDescriptor("readEntry", parseReadEntry, parseEntryInput),
		storeDescriptor("createEntry", parseCreatedEntry, parseCreateInput),
		storeDescriptor("updateEntry", parseRevision, parseUpdateInput),
		storeDescriptor("setArchived", parseArchived, parseArchivedInput),
		storeDescriptor("entryHistory", parseHistory, parseEntryInput),
		storeDescriptor("rollbackEntry", parseRevision, parseRollbackInput),
		storeDescriptor("getInjectionState", parseInjectionState, parseInjectionInput),
		storeDescriptor("getDiskMetrics", parseObjectResult, parseNamespaceInput),
		storeDescriptor("getMaintenanceReport", parseMaintenanceReport, parseNamespaceInput),
	],
};
