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
function item(value) {
	if (value === null) return value;
	exactObject(value, ["id", "namespace", "purpose", "status", "childSessionId", "startedAt", "finishedAt", "changedEntries", "summary"]);
	for (const key of ["id", "namespace", "purpose", "status", "startedAt"]) text(value[key]);
	if (value.childSessionId !== null) text(value.childSessionId);
	if (value.finishedAt !== null) text(value.finishedAt);
	if (value.summary !== null) text(value.summary);
	count(value.changedEntries);
	return value;
}
export function parseActivitySnapshot(value) {
	exactObject(value, ["parentSessionId", "revision", "running", "latestChanged", "latestFailure"]);
	text(value.parentSessionId);
	count(value.revision);
	if (!Array.isArray(value.running)) throw new TypeError("运行状态必须是数组");
	for (const row of value.running) { if (row === null) throw new TypeError("运行状态缺少记录"); item(row); }
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
const codec = (name, parse) => ({ mode: "strict", typeSymbol: STATUS_PACKAGE + "#" + name, create: () => ({ parse }) });
const parameter = { name: "sessionId", wire: "sessionId", source: "json", codec: codec("SessionId", text) };
export const STATUS_REMOTE = {
	package: STATUS_PACKAGE,
	descriptors: [
		{ id: STATUS_PACKAGE + "#getSnapshot", service: STATUS_SERVICE, namespace: STATUS_SERVICE, method: "getSnapshot", invocation: { kind: "direct" }, parameters: [parameter], cancellation: { parameter: "signal" }, result: codec("ActivitySnapshot", parseActivitySnapshot) },
		{ id: STATUS_PACKAGE + "#watch", service: STATUS_SERVICE, namespace: STATUS_SERVICE, method: "watch", mode: "stream", invocation: { kind: "direct" }, parameters: [parameter], cancellation: { parameter: "signal" }, result: codec("ActivityFrame", parseActivityFrame) },
	],
};
