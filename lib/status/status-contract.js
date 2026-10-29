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
	exactObject(value, ["parentSessionId", "revision", "running", "latestChanged", "latestFailure", "records"]);
	text(value.parentSessionId);
	count(value.revision);
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
	if (!["fact", "sop"].includes(value.kind)) throw new TypeError("未知的记忆类型");
	text(value.key);
	return value;
}
function parseListEntriesInput(value) {
	inputObject(value, ["namespace"], ["kind", "query", "includeArchived"]);
	text(value.namespace);
	if (value.kind !== undefined && !["fact", "sop"].includes(value.kind)) throw new TypeError("未知的记忆类型");
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
	if (!["fact", "sop"].includes(value.kind)) throw new TypeError("未知的记忆类型");
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
function parseEntries(value) {
	if (!Array.isArray(value)) throw new TypeError("记忆列表必须是数组");
	for (const row of value) {
		exactObject(row, ["entry", "title", "archived", "updatedAt", "chars"]);
		parseEntry(row.entry);
		text(row.title);
		boolean(row.archived);
		nullableText(row.updatedAt);
		count(row.chars);
	}
	return value;
}
function parseReadEntry(value) {
	exactObject(value, ["entry", "title", "content", "revision", "archived", "evidence", "sourceSession", "createdAt", "updatedAt"]);
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
function parseHistory(value) {
	if (!Array.isArray(value)) throw new TypeError("历史快照列表必须是数组");
	for (const row of value) {
		exactObject(row, ["snapshotId", "createdAt", "revision", "chars"]);
		text(row.snapshotId);
		text(row.createdAt);
		text(row.revision);
		count(row.chars);
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
		storeDescriptor("listEntries", parseEntries, parseListEntriesInput),
		storeDescriptor("readEntry", parseReadEntry, parseEntryInput),
		storeDescriptor("createEntry", parseCreatedEntry, parseCreateInput),
		storeDescriptor("updateEntry", parseRevision, parseUpdateInput),
		storeDescriptor("setArchived", parseArchived, parseArchivedInput),
		storeDescriptor("entryHistory", parseHistory, parseEntryInput),
		storeDescriptor("rollbackEntry", parseRevision, parseRollbackInput),
	],
};
