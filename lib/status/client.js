// 由 scripts/build.mjs 生成。
window.__ModuleLoader__.load({id:"@dsh-external/dsh-layered-memory-status",factory(require){
const STATUS_PACKAGE = "@dsh-external/dsh-layered-memory-status";
const STATUS_SERVICE = "layeredMemoryStatus";

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
function parseActivitySnapshot(value) {
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
function parseActivityFrame(value) {
	exactObject(value, ["type", "snapshot"]);
	if (value.type !== "snapshot" && value.type !== "update") throw new TypeError("未知的记忆状态帧");
	parseActivitySnapshot(value.snapshot);
	return value;
}
function parseWorkers(value) {
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
function parseWorkerHistory(value) {
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
const STATUS_REMOTE = {
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
function parseNamespaceInput(value) {
	inputObject(value, ["namespace"]);
	text(value.namespace);
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
		factCount: chars("factCount"),
		sopCount: chars("sopCount"),
	};
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
const STORE_REMOTE = {
	package: STATUS_PACKAGE,
	descriptors: [
		storeDescriptor("listNamespaces", parseNamespaces),
		storeDescriptor("namespaceStats", parseNamespaceStats, parseNamespaceInput),
		storeDescriptor("listEntries", parseEntries, parseListEntriesInput),
		storeDescriptor("readEntry", parseReadEntry, parseEntryInput),
		storeDescriptor("createEntry", parseCreatedEntry, parseCreateInput),
		storeDescriptor("updateEntry", parseRevision, parseUpdateInput),
		storeDescriptor("setArchived", parseArchived, parseArchivedInput),
		storeDescriptor("entryHistory", parseHistory, parseEntryInput),
		storeDescriptor("rollbackEntry", parseRevision, parseRollbackInput),
	],
};

function createStatusClient(require, styles) {
	const React = require("react");
	const { createPortal } = require("react-dom");
	const { Button, SegmentedControl, IconWarningOutlineRegular, useAnchoredPosition, useDismissOnOutsidePointer } = require("@deepseek-ai/dsh-client-ui-primitives");
	const { RemoteSnapshotStream, RemoteStreamCarrierError } = require("@deepseek-ai/dsh-api-gateway/client");
	const h = React.createElement;
	async function resultValue(request) {
		const result = await request;
		if (!result.ok) throw new Error(result.error.message);
		return result.value;
	}
	const locale = "layered-memory-status";
	const dictionaries = {
		zh: {
			reviewing: "正在核对记忆", organizing: "正在整理记忆", changed: "记忆已整理 {count} 条",
			settled: "记忆核对完成", awaitingEvidence: "记忆等待补充证据", idle: "记忆待命", initializing: "记忆状态加载中",
			stoppedReview: "记忆核对已停止", stoppedBatch: "记忆整理已停止",
			failed: "上次记忆核对未完成", partial: "记忆已整理 {count} 条 · 上次核对未完成", details: "查看记忆活动",
			unavailable: "记忆状态暂不可用", concurrent: "还有 {count} 项记忆任务运行中",
			activity: "记忆活动", runs: "运行记录", current: "当前任务", reviewWorker: "核对会话", batchWorker: "整理会话",
			review: "本轮核对", batch: "批量整理", legacy: "旧记录", empty: "还没有维护记录", historyEmpty: "暂无可显示的记录",
			loading: "正在读取…", refresh: "更新", older: "更早记录", stopping: "停止中…", stop: "停止", notStarted: "尚未开始",
			changedCount: "变更 {count} 条", retainedCount: "保留 {count} 条", waitingCount: "待证据 {count} 条", remainingCount: "未完成 {count} 条",
			"phase-preparing": "准备中", "phase-compacting": "压缩会话", "phase-running": "执行中", "phase-finishing": "保存结果", "phase-stopping": "正在停止", "phase-stopped": "已停止",
			"state-running": "运行中", "state-reviewed": "已完成", "state-unchanged": "无需更新", "state-waiting_evidence": "等待证据", "state-deferred": "未完成", "state-failed": "失败", "state-idle": "空闲", "state-stopped": "已停止",
			"trace-assistant": "回复", "trace-reasoning": "思考", "trace-tool": "工具调用", "trace-result": "工具结果", "trace-notice": "运行事件",
		},
		en: {
			reviewing: "Reviewing memory", organizing: "Organizing memory", changed: "Organized {count} memory entries",
			settled: "Memory review complete", awaitingEvidence: "Memory awaiting evidence", idle: "Memory ready", initializing: "Loading memory status",
			stoppedReview: "Memory review stopped", stoppedBatch: "Memory organization stopped",
			failed: "Last memory review incomplete", partial: "Organized {count} entries · last review incomplete", details: "View memory activity",
			unavailable: "Memory status unavailable", concurrent: "{count} more memory tasks running",
			activity: "Memory activity", runs: "Runs", current: "Current task", reviewWorker: "Review session", batchWorker: "Organization session",
			review: "Turn review", batch: "Memory organization", legacy: "Legacy", empty: "No maintenance runs yet", historyEmpty: "No records to display",
			loading: "Loading…", refresh: "Refresh", older: "Earlier records", stopping: "Stopping…", stop: "Stop", notStarted: "Not started",
			changedCount: "{count} changed", retainedCount: "{count} retained", waitingCount: "{count} awaiting evidence", remainingCount: "{count} remaining",
			"phase-preparing": "Preparing", "phase-compacting": "Compacting session", "phase-running": "Running", "phase-finishing": "Saving results", "phase-stopping": "Stopping", "phase-stopped": "Stopped",
			"state-running": "Running", "state-reviewed": "Completed", "state-unchanged": "No changes needed", "state-waiting_evidence": "Awaiting evidence", "state-deferred": "Incomplete", "state-failed": "Failed", "state-idle": "Idle", "state-stopped": "Stopped",
			"trace-assistant": "Reply", "trace-reasoning": "Thinking", "trace-tool": "Tool call", "trace-result": "Tool result", "trace-notice": "Run event",
		},
	};
	function createStore(remote, sessionId, stores) {
		let value = { snapshot: null, error: false };
		let stream;
		let closing = Promise.resolve();
		const listeners = new Set();
		const publish = next => { value = next; for (const listener of listeners) listener(); };
		const accept = frame => {
			const snapshot = parseActivityFrame(frame).snapshot;
			if (snapshot.parentSessionId !== sessionId) throw new Error("记忆状态所属会话不匹配");
			publish({ snapshot, error: false });
		};
		const fail = () => publish({ ...value, error: true });
		function start() {
			stores.add(store);
			stream = new RemoteSnapshotStream(remote.$stream({
				name: "layered memory status",
				open: signal => remote.layeredMemoryStatus.watch(sessionId, signal),
				ended: accepted => accepted ? new RemoteStreamCarrierError("记忆状态流已断开") : new Error("记忆状态流缺少初始快照"),
				carrierFailed: fail,
			}), { name: "layered memory status", isSnapshot: frame => frame.type === "snapshot", replace: accept, update: accept, failed: fail });
			stream.start();
		}
		function stop() {
			stores.delete(store);
			const current = stream;
			stream = undefined;
			if (current) closing = Promise.all([closing, current.dispose()]).then(() => undefined);
			return closing;
		}
		const store = {
			getSnapshot: () => value,
			subscribe(listener) {
				listeners.add(listener);
				if (listeners.size === 1) start();
				return () => { listeners.delete(listener); if (!listeners.size) void stop().catch(fail); };
			},
			dispose: stop,
		};
		return store;
	}
	function Brain() {
		return h("svg", { className: "lm-status-glyph", width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true },
			h("path", { d: "M12 18V6a3 3 0 0 0-5.7-1.3A4 4 0 0 0 3 11a4 4 0 0 0 1.5 7.5A4 4 0 0 0 12 20a4 4 0 0 0 7.5-1.5A4 4 0 0 0 21 11a4 4 0 0 0-3.3-6.3A3 3 0 0 0 12 6" }),
			h("path", { d: "M8 8a3 3 0 0 1-3 3m14 0a3 3 0 0 1-3-3M8 16a3 3 0 0 0-3 2m14 0a3 3 0 0 0-3-2" }));
	}
	const time = value => new Date(value).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
	function Counts({ run, t }) {
		return h("div", { className: "lm-run-counts" },
			h("span", null, t("changedCount", { count: run.changedEntries })),
			run.retainedEntries ? h("span", null, t("retainedCount", { count: run.retainedEntries })) : null,
			run.waitingEntries ? h("span", null, t("waitingCount", { count: run.waitingEntries })) : null,
			run.remainingEntries ? h("span", null, t("remainingCount", { count: run.remainingEntries })) : null);
	}
	function ActivityPanel({ open, snapshot, controls, panelRef, panelId, position, t }) {
		const [workers, setWorkers] = React.useState([]);
		const [workersError, setWorkersError] = React.useState(null);
		const [refresh, setRefresh] = React.useState(0);
		const [workerId, setWorkerId] = React.useState(null);
		const [history, setHistory] = React.useState({ page: null, busy: false, error: null });
		const [historyRevision, setHistoryRevision] = React.useState(0);
		const [stopping, setStopping] = React.useState(null);
		const [stopError, setStopError] = React.useState(null);
		const historyRequest = React.useRef(null);
		const stopRequest = React.useRef(null);
		const historyEnd = React.useRef(null);
		React.useEffect(() => {
			if (!open) return;
			const controller = new AbortController();
			controls.list(controller.signal).then(value => { setWorkers(parseWorkers(value)); setWorkersError(null); }).catch(error => { if (!controller.signal.aborted) setWorkersError(error.message); });
			return () => controller.abort();
		}, [open, snapshot?.revision, refresh, controls]);
		React.useEffect(() => {
			if (!open || !workerId) return;
			const controller = new AbortController();
			historyRequest.current = controller;
			setHistory({ page: null, busy: true, error: null });
			controls.read(workerId, null, 60, controller.signal).then(value => setHistory({ page: parseWorkerHistory(value), busy: false, error: null })).catch(error => { if (!controller.signal.aborted) setHistory({ page: null, busy: false, error: error.message }); });
			return () => historyRequest.current.abort();
		}, [open, workerId, historyRevision, controls]);
		React.useEffect(() => { historyEnd.current?.scrollIntoView({ block: "nearest" }); }, [history.page?.nextOffset, workerId]);
		React.useEffect(() => () => stopRequest.current?.abort(), []);
		async function loadOlder() {
			const page = history.page;
			const offset = Math.max(page.minOffset, page.offset - 60);
			const controller = new AbortController();
			historyRequest.current = controller;
			setHistory(value => ({ ...value, busy: true, error: null }));
			try {
				const earlier = parseWorkerHistory(await controls.read(workerId, offset, page.offset - offset, controller.signal));
				setHistory({ page: { ...page, rows: [...earlier.rows, ...page.rows], offset: earlier.offset, hasPrevious: earlier.hasPrevious }, busy: false, error: null });
			} catch (error) { if (!controller.signal.aborted) setHistory(value => ({ ...value, busy: false, error: error.message })); }
		}
		async function stop(worker) {
			const controller = new AbortController();
			stopRequest.current = controller;
			setStopping(worker.id);
			setStopError(null);
			try { await controls.stop(worker.id, controller.signal); setRefresh(value => value + 1); }
			catch (error) { if (!controller.signal.aborted) setStopError(error.message); }
			finally { setStopping(null); }
		}
		function stopButton(worker) {
			return worker?.canStop ? h(Button, { variant: "ghost", size: "sm", className: "lm-stop", disabled: Boolean(stopping), onClick: () => stop(worker), "data-memory-stop": worker.purpose }, stopping === worker.id ? t("stopping") : t("stop")) : null;
		}
		function runBody(run) {
			return h(React.Fragment, null, h(Counts, { run, t }), run.summary ? h("p", { className: "lm-run-summary" }, run.summary) : null);
		}
		const worker = workers.find(value => value.id === workerId);
		const finished = snapshot?.records.filter(run => run.finishedAt !== null) || [];
		const view = workerId || "runs";
		const tabsId = panelId + "-views";
		return h("div", { ref: panelRef, id: panelId, role: "dialog", "aria-label": t("activity"), className: "lm-activity-panel", "data-memory-details": true, style: position || { visibility: "hidden", left: 0, top: 0 } },
			h("header", { className: "lm-activity-heading" },
				h("span", { className: "lm-activity-title" }, h(Brain), t("activity"))),
			h("div", { className: "lm-activity-rule", "aria-hidden": true }),
			h(SegmentedControl, {
				id: tabsId, value: view, label: t("activity"), className: "lm-activity-tabs",
				onChange: value => setWorkerId(value === "runs" ? null : value),
				options: [{ value: "runs", label: t("runs") }, ...workers.map(value => ({ value: value.id || value.purpose, label: t(value.purpose === "turn_review" ? "reviewWorker" : "batchWorker"), disabled: !value.id, title: value.id ? undefined : t("notStarted") }))],
			}),
			workersError ? h("p", { className: "lm-activity-error", role: "alert" }, workersError) : null,
			stopError ? h("p", { className: "lm-activity-error", role: "alert" }, stopError) : null,
			h("div", { className: "lm-activity-body", role: "tabpanel", id: tabsId + "-" + view + "-panel", "aria-labelledby": tabsId + "-" + view },
			workerId === null ? h("div", { className: "lm-activity-content" },
				snapshot?.running.length ? h("section", { className: "lm-current-runs" }, h("h3", null, t("current")), ...snapshot.running.map(run => h("article", { key: run.id, className: "lm-current-run", "data-memory-run": run.id, "data-phase": run.phase },
					h("div", { className: "lm-run-heading" }, h("strong", null, t(run.purpose === "turn_review" ? "review" : "batch")), h("span", { className: "lm-run-state" }, t(run.phase ? "phase-" + run.phase : "state-running")), stopButton(workers.find(value => value.runId === run.id))), runBody(run)))) : null,
				finished.length ? h("section", null, h("h3", null, t("runs")), ...finished.map(run => h("details", { key: run.id, className: "lm-finished-run", open: run.id === snapshot.latestFailure?.id, "data-memory-run": run.id, "data-run-status": run.status },
					h("summary", null, h("span", null, t(run.purpose === "turn_review" ? "review" : "batch")), h("span", { className: "lm-run-state", "data-state": run.status }, t("state-" + run.status)), run.changedEntries ? h("span", { className: "lm-run-state" }, t("changedCount", { count: run.changedEntries })) : null, h("time", { dateTime: run.finishedAt, title: run.finishedAt }, time(run.finishedAt)), run.legacy ? h("span", { className: "lm-legacy", title: run.sessionId }, t("legacy")) : null), runBody(run)))) : !snapshot?.running.length ? h("p", { className: "lm-activity-empty" }, t("empty")) : null)
				: h(React.Fragment, null,
					h("div", { className: "lm-history-heading" }, h("span", null, t(worker.phase ? "phase-" + worker.phase : "state-" + worker.status)), stopButton(worker), h(Button, { variant: "ghost", size: "sm", onClick: () => setHistoryRevision(value => value + 1), disabled: history.busy }, t("refresh"))),
					h("div", { className: "lm-activity-content lm-history", "data-memory-history": workerId },
						history.page?.hasPrevious ? h(Button, { variant: "ghost", size: "sm", className: "lm-history-older", disabled: history.busy, onClick: loadOlder }, t("older")) : null,
						history.error ? h("p", { className: "lm-activity-error", role: "alert" }, history.error) : null,
						history.busy ? h("p", { className: "lm-activity-empty", role: "status" }, t("loading")) : null,
						...((history.page?.rows || []).map(row => row.kind === "assistant" ? h("article", { key: row.id, className: "lm-history-message", "data-memory-history-row": row.id }, h("div", { className: "lm-history-label" }, t("trace-" + row.kind), row.at ? h("time", { dateTime: row.at }, time(row.at)) : null), h("div", { className: "lm-history-body" }, row.text))
							: h("details", { key: row.id, className: "lm-history-event", "data-memory-history-row": row.id }, h("summary", null, t("trace-" + row.kind), row.at ? h("time", { dateTime: row.at }, time(row.at)) : null), h("pre", { className: "lm-history-body" }, row.text)))),
						!history.busy && history.page && !history.page.rows.length ? h("p", { className: "lm-activity-empty" }, t("historyEmpty")) : null,
						h("div", { ref: historyEnd })))));
	}
	function MemoryStatus({ activityStore, controls, t }) {
		const buttonRef = React.useRef(null);
		const panelRef = React.useRef(null);
		const panelId = React.useId();
		const [open, setOpen] = React.useState(false);
		const position = useAnchoredPosition({ open, anchorRef: buttonRef, panelRef, side: "top", gap: 8, margin: 12 });
		useDismissOnOutsidePointer(buttonRef, open, setOpen, panelRef);
		React.useEffect(() => {
			if (!open) return;
			const keydown = event => { if (event.key === "Escape") setOpen(false); };
			const click = event => {
				if (!buttonRef.current?.contains(event.target) && !panelRef.current?.contains(event.target)) setOpen(false);
			};
			document.addEventListener("keydown", keydown);
			document.addEventListener("click", click, true);
			return () => { document.removeEventListener("keydown", keydown); document.removeEventListener("click", click, true); };
		}, [open]);
		const value = React.useSyncExternalStore(activityStore.subscribe, activityStore.getSnapshot);
		const snapshot = value.snapshot;
		const running = snapshot?.running[0];
		const failure = snapshot?.latestFailure;
		const latestFinished = snapshot?.records.find(run => run.finishedAt !== null);
		const waiting = latestFinished?.status === "waiting_evidence" ? latestFinished : null;
		const stopped = latestFinished?.status === "stopped" ? latestFinished : null;
		const item = running || failure || waiting || stopped || snapshot?.latestChanged || snapshot?.records[0];
		const isFailure = value.error || (!running && Boolean(failure));
		let label = t(snapshot ? "idle" : "initializing");
		if (value.error) label = t("unavailable");
		else if (running) label = t(running.purpose === "turn_review" ? "reviewing" : "organizing");
		else if (failure) label = failure.changedEntries ? t("partial", { count: failure.changedEntries }) : t("failed");
		else if (waiting) label = t("awaitingEvidence");
		else if (stopped) label = t(stopped.purpose === "turn_review" ? "stoppedReview" : "stoppedBatch");
		else if (item) label = item.changedEntries ? t("changed", { count: item.changedEntries }) : t("settled");
		const clickable = !value.error && snapshot !== null;
		const title = [label, !running && (failure?.summary || waiting?.summary || stopped?.summary), !running && (waiting || stopped)?.changedEntries ? t("changedCount", { count: (waiting || stopped).changedEntries }) : "", clickable ? t("details") : "", running && snapshot.running.length > 1 ? t("concurrent", { count: snapshot.running.length - 1 }) : ""].filter(Boolean).join(" · ");
		return h(React.Fragment, null,
			h("style", null, styles),
			h("span", { className: "lm-status-seat", "data-memory-status": value.error ? "unavailable" : running ? "running" : failure ? "failed" : waiting ? "waiting" : stopped ? "stopped" : item ? item.changedEntries ? "changed" : "reviewed" : snapshot ? "idle" : "loading" },
				h(clickable ? "button" : "span", {
					className: "lm-status-line" + (running && !value.error ? " is-running" : "") + (isFailure ? " is-failed" : ""),
					...(clickable ? { ref: buttonRef, type: "button", onClick: () => setOpen(!open), "aria-haspopup": "dialog", "aria-expanded": open, "aria-controls": panelId } : {}),
					title, "aria-label": title,
				}, h(Brain), h("span", { className: "lm-status-text", role: "status", "aria-live": "polite" }, label),
					isFailure ? h(IconWarningOutlineRegular, { className: "lm-status-failure", size: 14 }) : null)),
			open && createPortal(h(ActivityPanel, { open, snapshot, controls, panelRef, panelId, position, t }), document.body));
	}
	return {
		inject: ["remote"],
		async apply(ctx) {
			// 状态与管理页的描述符合并挂载，避免同 package 两次 $mount
			const unmountRemote = await ctx.remote.$mount({ package: STATUS_PACKAGE, descriptors: [...STATUS_REMOTE.descriptors, ...STORE_REMOTE.descriptors] });
			const stores = new Set();
			const ui = ctx.inject(["remote.layeredMemoryStatus", "slots", "locale"], scope => {
				scope.effect(() => scope.locale.register(locale, dictionaries), "memory-status: locale");
				scope.slots.inject("conversation.composer.dock", () => scope.slots.register({
					name: "conversation.composer.dock", id: "layered-memory-status", order: 5, locale,
					inject: sessionId => {
						const store = createStore(scope.remote, sessionId, stores);
						return {
							activityStore: store,
							controls: {
								list: signal => resultValue(scope.remote.layeredMemoryStatus.listWorkers(sessionId, signal)),
								read: (workerId, offset, limit, signal) => resultValue(scope.remote.layeredMemoryStatus.readWorker(sessionId, workerId, offset, limit, signal)),
								stop: (workerId, signal) => resultValue(scope.remote.layeredMemoryStatus.stopWorker(sessionId, workerId, signal)),
							},
						};
					},
				}, MemoryStatus));
			});
			try { await ui; }
			catch (error) { await ui.dispose(); await unmountRemote(); throw error; }
			return async () => { await ui.dispose(); await Promise.all([...stores].map(store => store.dispose())); await unmountRemote(); };
		},
	};
}

function createMemoryBrowserClient(require, styles) {
	const React = require("react");
	const {
		Button, Input, Menu, MenuItemButton, Switch, Tooltip,
		IconPlusOutlineRegular, IconSearchOutlineRegular, IconCloseOutlineRegular,
		IconChevronDownOutlineRegular, IconCheckOutlineRegular,
	} = require("@deepseek-ai/dsh-client-ui-primitives");
	const h = React.createElement;
	const locale = "layered-memory";
	const dictionaries = {
		zh: {
			title: "记忆", newEntry: "新建条目", namespace: "命名空间", search: "搜索记忆", searchPlaceholder: "搜索标题或正文", clearSearch: "清空搜索",
			all: "全部", showArchived: "显示已归档", entries: "记忆条目", loading: "正在读取…", empty: "没有匹配的记忆条目", emptyDetail: "从左侧选择一条记忆",
			archived: "已归档", content: "内容", evidence: "证据", save: "保存", saving: "保存中…", archive: "归档", restore: "恢复",
			history: "历史快照", noHistory: "暂无历史快照", rollback: "回滚到此版本", rollbackConfirm: "确认回滚", cancel: "取消",
			rollbackWarning: "回滚会覆盖当前内容，是否继续？", requiredFields: "命名空间、标题、内容、证据都必须填写", loadTimeout: "记忆数据加载超时", saved: "已保存", archivedDone: "归档状态已更新", rolledBack: "已回滚到所选快照", preview: "预览", collapse: "收起", initialVersion: "初始版本", evidenceUpdated: "证据更新", contentDelta: "内容 {delta} 字符", noContentChange: "无正文变化", noSummary: "（空内容）", noPreview: "该快照没有可预览的正文", editMode: "编辑", previewMode: "预览",
			reload: "重新加载", conflict: "条目已被其他会话修改，请重新加载后再保存。", createTitle: "新建记忆条目", topic: "标题",
			topicPlaceholder: "输入条目标题", contentPlaceholder: "输入记忆正文", evidencePlaceholder: "输入本次写入的证据", create: "创建", creating: "创建中…",
			created: "条目已创建", close: "关闭", createdAt: "创建时间", updatedAt: "更新时间", characters: "{count} 字符",
			listFailed: "条目列表读取失败", detailFailed: "条目详情读取失败", historyFailed: "历史快照读取失败", noNamespace: "暂无可用命名空间",
			"usage.used": "索引已用", "usage.total": "{used} / {budget} 字符", "usage.over": "已超注入预算，较早条目不会进入提示词",
			"usage.count": "{count} 条", "usage.share": "占已用 {share}%",
			"usage.label.head": "说明", "usage.label.rules": "规则", "usage.label.facts": "事实目录", "usage.label.sops": "经验目录",
			"usage.tip.head": "索引头部说明", "usage.tip.rules": "L0 红线规则", "usage.tip.facts": "事实条目目录（facts.md）", "usage.tip.sops": "任务经验目录（sops/）",
		},
		en: {
			title: "Memory", newEntry: "New entry", namespace: "Namespace", search: "Search memory", searchPlaceholder: "Search titles or content", clearSearch: "Clear search",
			all: "All", showArchived: "Show archived", entries: "Memory entries", loading: "Loading…", empty: "No matching memory entries", emptyDetail: "Select a memory entry on the left",
			archived: "Archived", content: "Content", evidence: "Evidence", save: "Save", saving: "Saving…", archive: "Archive", restore: "Restore",
			history: "History", noHistory: "No history snapshots", rollback: "Roll back to this version", rollbackConfirm: "Confirm rollback", cancel: "Cancel",
			rollbackWarning: "Rolling back replaces the current content. Continue?", requiredFields: "Namespace, title, content, and evidence are required", loadTimeout: "Timed out loading memory data", saved: "Saved", archivedDone: "Archive state updated", rolledBack: "Rolled back to the selected snapshot", preview: "Preview", collapse: "Collapse", initialVersion: "Initial version", evidenceUpdated: "Evidence updated", contentDelta: "Content {delta} chars", noContentChange: "No content change", noSummary: "(empty)", noPreview: "This snapshot has no preview", editMode: "Edit", previewMode: "Preview",
			reload: "Reload", conflict: "This entry changed elsewhere. Reload it before saving again.", createTitle: "New memory entry", topic: "Title",
			topicPlaceholder: "Enter an entry title", contentPlaceholder: "Enter memory content", evidencePlaceholder: "Enter evidence for this write", create: "Create", creating: "Creating…",
			created: "Entry created", close: "Close", createdAt: "Created", updatedAt: "Updated", characters: "{count} characters",
			listFailed: "Could not load entries", detailFailed: "Could not load entry details", historyFailed: "Could not load history", noNamespace: "No namespaces available",
			"usage.used": "Index used", "usage.total": "{used} / {budget} chars", "usage.over": "Over the injection budget; older entries stay out of the prompt",
			"usage.count": "{count} entries", "usage.share": "{share}% of used",
			"usage.label.head": "Header", "usage.label.rules": "Rules", "usage.label.facts": "Facts", "usage.label.sops": "Skills",
			"usage.tip.head": "Index header", "usage.tip.rules": "L0 red-line rules", "usage.tip.facts": "Fact entries (facts.md)", "usage.tip.sops": "Skill entries (sops/)",
		},
	};
	async function resultValue(request) {
		const result = await request;
		if (!result.ok) throw new Error(result.error.message);
		return result.value;
	}
	const identity = entry => JSON.stringify([entry.namespace, entry.kind, entry.key]);
	// 与界面语言一致的时间格式，避免中文界面出现美式日期
	const time = value => {
		if (!value) return "—";
		const lang = (typeof document !== "undefined" && document.documentElement.lang) || "zh-CN";
		return new Date(value).toLocaleString(lang, { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
	};
	// 字符数紧凑写法：9003 → 9.0K，12288 → 12.3K，120000 → 120K
	function compactChars(value) {
		const number = Number(value);
		if (!Number.isFinite(number) || number <= 0) return "0";
		if (number < 1000) return String(Math.round(number));
		const scaled = number / 1000;
		return (scaled >= 100 ? String(Math.round(scaled)) : scaled.toFixed(1)) + "K";
	}
	// 极简 Markdown → React 元素，零依赖，覆盖标题/粗斜体/行内代码/列表/链接/引用/分隔线
	function renderInline(text, keyPrefix) {
		const parts = [];
		let rest = text;
		let idx = 0;
		const patterns = [
			[/\*\*([^*]+)\*\*/, (m, t) => h("strong", { key: keyPrefix + idx++ }, t)],
			[/\*([^*]+)\*/, (m, t) => h("em", { key: keyPrefix + idx++ }, t)],
			[/`([^`]+)`/, (m, t) => h("code", { key: keyPrefix + idx++ }, t)],
			[/\[([^\]]+)\]\(([^)]+)\)/, (m, t, u) => h("a", { key: keyPrefix + idx++, href: u, target: "_blank", rel: "noopener" }, t)],
		];
		while (rest.length > 0) {
			let earliest = null, earliestRe = null, earliestFn = null;
			for (const [re, fn] of patterns) {
				const m = rest.match(re);
				if (m && (earliest === null || m.index < earliest)) {
					earliest = m.index; earliestRe = m; earliestFn = fn;
				}
			}
			if (earliest === null) { parts.push(rest); break; }
			if (earliest > 0) parts.push(rest.slice(0, earliest));
			parts.push(earliestFn(...earliestRe));
			rest = rest.slice(earliest + earliestRe[0].length);
		}
		return parts;
	}
	function renderMarkdown(text) {
		const lines = String(text || "").split(/\r?\n/);
		const blocks = [];
		let listItems = null, listOrdered = false;
		let paraLines = [];
		const flushPara = () => {
			if (paraLines.length) {
				blocks.push(h("p", { key: "p" + blocks.length }, renderInline(paraLines.join("\n"), "pi")));
				paraLines = [];
			}
		};
		const flushList = () => {
			if (listItems && listItems.length) {
				const tag = listOrdered ? "ol" : "ul";
				blocks.push(h(tag, { key: "l" + blocks.length }, listItems.map((item, i) => h("li", { key: "li" + i }, renderInline(item, "li" + i)))));
			}
			listItems = null;
		};
		for (const line of lines) {
			const hMatch = line.match(/^(#{1,6})\s+(.*)/);
			const ulMatch = line.match(/^[-*+]\s+(.*)/);
			const olMatch = line.match(/^\d+[.)]\s+(.*)/);
			const quoteMatch = line.match(/^>\s?(.*)/);
			if (hMatch) {
				flushPara(); flushList();
				const level = hMatch[1].length;
				blocks.push(h("h" + Math.min(level + 1, 6), { key: "h" + blocks.length }, renderInline(hMatch[2], "hi")));
			} else if (ulMatch || olMatch) {
				flushPara();
				const isOl = !!olMatch;
				if (listItems && listOrdered !== isOl) flushList();
				if (!listItems) { listItems = []; listOrdered = isOl; }
				listItems.push((ulMatch || olMatch)[1]);
			} else if (quoteMatch) {
				flushPara(); flushList();
				blocks.push(h("blockquote", { key: "q" + blocks.length }, renderInline(quoteMatch[1], "qi")));
			} else if (/^---+$/.test(line.trim())) {
				flushPara(); flushList();
				blocks.push(h("hr", { key: "hr" + blocks.length }));
			} else if (line.trim() === "") {
				flushPara(); flushList();
			} else {
				flushList();
				paraLines.push(line);
			}
		}
		flushPara(); flushList();
		return blocks;
	}
	function MemoryBrowserIcon({ size = 20 }) {
		return h("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true },
			h("path", { d: "M5 4.5A2.5 2.5 0 0 1 7.5 2H20v17H7.5A2.5 2.5 0 0 0 5 21.5z" }),
			h("path", { d: "M5 4.5v17M8.5 6H16M8.5 10H16M8.5 14H13" }));
	}
	function Field({ label, children, className = "" }) {
		return h("label", { className: "lm-browser-field " + className }, h("span", { className: "lm-browser-field-label" }, label), children);
	}
	// 官方 Menu + MenuItemButton 风格的选中下拉，替代原生 select 控件
	function SelectMenu({ value, options, disabled, onChange, ariaLabel, triggerClassName }) {
		const [open, setOpen] = React.useState(false);
		const current = options.find(option => option.value === value);
		return h(Menu, {
			open,
			onClose: () => setOpen(false),
			align: "start",
			portal: true,
			autoFocus: true,
			listClassName: "lm-browser-select-menu",
			anchor: h(Button, {
				variant: "outline",
				size: "sm",
				type: "button",
				className: "lm-browser-select-trigger" + (triggerClassName ? " " + triggerClassName : ""),
				disabled,
				"aria-label": ariaLabel,
				"aria-haspopup": "menu",
				"aria-expanded": open,
				onClick: () => setOpen(value => !value),
				onKeyDown: event => {
					if (!open && event.key === "ArrowDown") { event.preventDefault(); setOpen(true); }
				},
			},
				h("span", { className: "lm-browser-select-value" }, current ? current.label : (options[0]?.label ?? "")),
				h(IconChevronDownOutlineRegular, { size: 12, "aria-hidden": "true" })),
		}, options.map(option => h(MenuItemButton, {
			key: option.value,
			icon: option.value === value ? h(IconCheckOutlineRegular, { size: 14 }) : undefined,
			onSelect: () => { setOpen(false); onChange(option.value); },
		}, option.label)));
	}

	function CreateDialog({ open, form, setForm, namespaces, busy, error, onClose, onSubmit, t }) {
		React.useEffect(() => {
			if (!open) return;
			const keydown = event => { if (event.key === "Escape" && !busy) onClose(); };
			document.addEventListener("keydown", keydown);
			return () => document.removeEventListener("keydown", keydown);
		}, [open, busy, onClose]);
		if (!open) return null;
		const update = (key, value) => setForm(current => ({ ...current, [key]: value }));
		return h("div", { className: "lm-browser-modal-backdrop", onMouseDown: event => { if (event.target === event.currentTarget && !busy) onClose(); } },
			h("section", { className: "lm-browser-modal", role: "dialog", "aria-modal": true, "aria-labelledby": "lm-browser-create-title" },
				h("div", { className: "lm-browser-modal-heading" }, h("h2", { id: "lm-browser-create-title" }, t("createTitle")), h(Button, { variant: "ghost", size: "sm", "aria-label": t("close"), disabled: busy, onClick: onClose }, h(IconCloseOutlineRegular, { size: 16 }))),
				h("form", { onSubmit: event => { event.preventDefault(); onSubmit(); } },
					error ? h("p", { className: "lm-browser-error", role: "alert" }, error) : null,
					h(Field, { label: t("namespace") }, h(SelectMenu, { value: form.namespace, options: namespaces.map(row => ({ value: row.namespace, label: row.namespace })), disabled: busy, onChange: value => update("namespace", value), ariaLabel: t("namespace"), triggerClassName: "lm-browser-input" })),
					h(Field, { label: "kind" }, h(SelectMenu, { value: form.kind, options: [{ value: "fact", label: "fact" }, { value: "sop", label: "sop" }], disabled: busy, onChange: value => update("kind", value), ariaLabel: "kind", triggerClassName: "lm-browser-input" })),
					h(Field, { label: t("topic") }, h(Input, { value: form.topic, placeholder: t("topicPlaceholder"), disabled: busy, onChange: event => update("topic", event.target.value) })),
					h(Field, { label: t("content") }, h("textarea", { className: "lm-browser-textarea lm-browser-create-content", value: form.content, placeholder: t("contentPlaceholder"), disabled: busy, onChange: event => update("content", event.target.value) })),
					h(Field, { label: t("evidence") }, h(Input, { value: form.evidence, placeholder: t("evidencePlaceholder"), disabled: busy, onChange: event => update("evidence", event.target.value) })),
					h("div", { className: "lm-browser-modal-actions" }, h(Button, { variant: "outline", type: "button", disabled: busy, onClick: onClose }, t("cancel")), h(Button, { variant: "primary", type: "submit", disabled: busy || !form.namespace }, busy ? t("creating") : t("create"))))));
	}
	// 索引占用：常态一行总览，点击展开分段明细；分段悬停高亮，术语沿用插件其余处的 head/rules/facts/sops。
	function IndexUsage({ stats, t }) {
		const [open, setOpen] = React.useState(false);
		const [hovered, setHovered] = React.useState(null);
		const used = Number(stats?.indexChars) || 0;
		const budget = Number(stats?.budgetChars) || 0;
		// 取数失败或索引为空时不渲染。
		if (!stats || used <= 0 || budget <= 0) return null;
		const percent = Math.round((used / budget) * 100);
		const over = percent > 100;
		const parts = [
			["head", t("usage.label.head"), Number(stats.headChars) || 0, null],
			["rules", t("usage.label.rules"), Number(stats.rulesChars) || 0, null],
			["facts", t("usage.label.facts"), Number(stats.factsChars) || 0, Number(stats.factCount) || 0],
			["sops", t("usage.label.sops"), Number(stats.sopsChars) || 0, Number(stats.sopCount) || 0],
		];
		const dimmed = kind => hovered !== null && hovered !== kind;
		// 气泡文案：术语含义 + 条目数（facts/sops）+ 占已用比例。
		const tipFor = (kind, value, count) => [
			t("usage.tip." + kind),
			count === null ? "" : t("usage.count", { count }),
			t("usage.share", { share: Math.round((value / used) * 100) }),
		].filter(Boolean).join(" · ");
		return h("div", { className: "lm-browser-usage" + (open ? " is-open" : "") },
			h("button", {
				type: "button", className: "lm-usage-summary",
				"aria-expanded": open, "aria-controls": "lm-usage-detail",
				onClick: () => setOpen(!open),
			},
				h("span", { className: "lm-usage-label" }, t("usage.used")),
				h("span", { className: "lm-usage-percent" + (over ? " is-over" : "") }, percent + "%"),
				h("span", { className: "lm-usage-bar", "aria-hidden": "true" },
					parts.map(([kind, , value]) => h("span", {
						key: kind,
						className: "lm-usage-segment lm-usage-color-" + kind + (dimmed(kind) ? " is-dim" : ""),
						style: { width: (percent * value / used) + "%" },
					}))),
				h("span", { className: "lm-usage-figures" }, "~" + t("usage.total", { used: compactChars(used), budget: compactChars(budget) })),
				h(IconChevronDownOutlineRegular, { size: 12, className: "lm-usage-chevron" })),
			h("div", { className: "lm-usage-detail", id: "lm-usage-detail", "aria-hidden": open ? undefined : "true" },
				h("div", { className: "lm-usage-detail-inner" },
					h("div", { className: "lm-usage-legend" },
						parts.map(([kind, term, value, count]) => h("span", {
							key: kind,
							className: "lm-usage-legend-wrap" + (dimmed(kind) ? " is-dim" : ""),
							onMouseEnter: () => setHovered(kind),
							onMouseLeave: () => setHovered(null),
						},
							h(Tooltip, { label: tipFor(kind, value, count), side: "bottom", delayMs: 120 },
								h("span", { className: "lm-usage-legend-item" },
									h("span", { className: "lm-usage-swatch lm-usage-color-" + kind, "aria-hidden": "true" }),
									h("span", { className: "lm-usage-legend-label" }, term),
									h("span", { className: "lm-usage-legend-chars" }, compactChars(value))))))),
					over ? h("p", { className: "lm-usage-over", role: "status" }, t("usage.over")) : null)));
	}
	function MemoryBrowserPage({ controls, t }) {
		const [namespaces, setNamespaces] = React.useState([]);
		const [namespace, setNamespace] = React.useState(null);
		const [namespaceError, setNamespaceError] = React.useState(null);
		const [namespaceBusy, setNamespaceBusy] = React.useState(true);
		const [namespaceVersion, setNamespaceVersion] = React.useState(0);
		const [query, setQuery] = React.useState("");
		const [kind, setKind] = React.useState("");
		const [includeArchived, setIncludeArchived] = React.useState(false);
		const [entries, setEntries] = React.useState([]);
		const [usage, setUsage] = React.useState(null);
		const [listBusy, setListBusy] = React.useState(false);
		const [listError, setListError] = React.useState(null);
		const [selectedId, setSelectedId] = React.useState(null);
		const [detail, setDetail] = React.useState(null);
		const [detailBusy, setDetailBusy] = React.useState(false);
		const [detailError, setDetailError] = React.useState(null);
		const [content, setContent] = React.useState("");
		const [evidence, setEvidence] = React.useState("");
		const [history, setHistory] = React.useState([]);
		const [historyBusy, setHistoryBusy] = React.useState(false);
		const [historyError, setHistoryError] = React.useState(null);
		const [listVersion, setListVersion] = React.useState(0);
		const [detailVersion, setDetailVersion] = React.useState(0);
		const [historyVersion, setHistoryVersion] = React.useState(0);
		const [busy, setBusy] = React.useState(null);
		const [actionError, setActionError] = React.useState(null);
		const [notice, setNotice] = React.useState(null);
		const [conflict, setConflict] = React.useState(false);
		const [rollbackId, setRollbackId] = React.useState(null);
		const [contentPreview, setContentPreview] = React.useState(true);
		const [previewId, setPreviewId] = React.useState(null);
		const [createOpen, setCreateOpen] = React.useState(false);
		const [createForm, setCreateForm] = React.useState({ namespace: "", kind: "fact", topic: "", content: "", evidence: "" });
		const [createError, setCreateError] = React.useState(null);
		const detailRequest = React.useRef(0);
		const historyRequest = React.useRef(0);
		React.useEffect(() => {
			let active = true;
			setNamespaceBusy(true);
			// 首屏时远程命名空间可能尚未就绪，调用会一直悬挂；带超时重试，避免页面空着
			const attempt = async () => {
				for (let index = 0; index < 3; index += 1) {
					if (!active) return;
					try {
						const rows = await Promise.race([
							controls.listNamespaces(),
							new Promise((_, reject) => setTimeout(() => reject(new Error(t("loadTimeout"))), 2500)),
						]);
						if (!active) return;
						setNamespaces(rows);
						setNamespaceError(null);
						setNamespaceBusy(false);
						setNamespace(current => current && rows.some(row => row.namespace === current) ? current : rows[0]?.namespace || null);
						return;
					} catch (error) {
						if (!active) return;
						if (index === 2) { setNamespaceBusy(false); setNamespaceError(error.message); return; }
						await new Promise(resolve => setTimeout(resolve, 400));
					}
				}
			};
			attempt();
			return () => { active = false; };
		}, [controls, namespaceVersion]);
		React.useEffect(() => {
			if (!namespace) { setEntries([]); setSelectedId(null); setListBusy(false); return; }
			let active = true;
			setListBusy(true);
			setListError(null);
			const timer = setTimeout(() => {
				const request = { namespace, includeArchived };
				if (kind) request.kind = kind;
				if (query) request.query = query;
				controls.listEntries(request).then(rows => {
					if (!active) return;
					setEntries(rows);
					setListBusy(false);
					setSelectedId(current => rows.some(row => identity(row.entry) === current) ? current : rows[0] ? identity(rows[0].entry) : null);
				}).catch(error => { if (active) { setListBusy(false); setListError(error.message); } });
			}, 160);
			return () => { active = false; clearTimeout(timer); };
		}, [controls, namespace, kind, query, includeArchived, listVersion]);
		// 命名空间切换与条目写入都会改变索引，listVersion 变化时同步刷新占用数据。
		React.useEffect(() => {
			if (!namespace) { setUsage(null); return; }
			let active = true;
			controls.namespaceStats({ namespace }).then(value => {
				if (!active) return;
				setUsage(value);
			}).catch(() => { if (active) setUsage(null); });
			return () => { active = false; };
		}, [controls, namespace, listVersion]);
		React.useEffect(() => {
			const request = ++detailRequest.current;
			const selected = entries.find(row => identity(row.entry) === selectedId);
			setRollbackId(null);
			setPreviewId(null);
			setContentPreview(true);
			if (!selected) { setDetail(null); setDetailBusy(false); setDetailError(null); return; }
			setDetail(null);
			setDetailBusy(true);
			setDetailError(null);
			controls.readEntry({ entry: selected.entry }).then(value => {
				if (request !== detailRequest.current) return;
				setDetail(value);
				setContent(value.content);
				setEvidence(value.evidence);
				setDetailBusy(false);
			}).catch(error => { if (request === detailRequest.current) { setDetailBusy(false); setDetailError(error.message); } });
		}, [controls, selectedId, detailVersion, entries]);
		React.useEffect(() => {
			const request = ++historyRequest.current;
			const selected = entries.find(row => identity(row.entry) === selectedId);
			if (!selected) { setHistory([]); setHistoryBusy(false); setHistoryError(null); return; }
			setHistoryBusy(true);
			setHistoryError(null);
			controls.entryHistory({ entry: selected.entry }).then(rows => {
				if (request !== historyRequest.current) return;
				setHistory(rows);
				setHistoryBusy(false);
			}).catch(error => { if (request === historyRequest.current) { setHistoryBusy(false); setHistoryError(error.message); } });
		}, [controls, selectedId, historyVersion, entries]);
		function refreshAll() {
			setListVersion(value => value + 1);
			setDetailVersion(value => value + 1);
			setHistoryVersion(value => value + 1);
		}
		function reloadDetail() {
			setActionError(null);
			setConflict(false);
			setDetailVersion(value => value + 1);
			setHistoryVersion(value => value + 1);
		}
		function openCreate() {
			setCreateForm({ namespace: namespace || namespaces[0]?.namespace || "", kind: kind || "fact", topic: "", content: "", evidence: "" });
			setCreateError(null);
			setCreateOpen(true);
		}
		async function createEntry() {
			if (!createForm.namespace || !createForm.topic.trim() || !createForm.content.trim() || !createForm.evidence.trim()) {
				setCreateError(t("requiredFields"));
				return;
			}
			setBusy("create");
			setCreateError(null);
			try {
				const result = await controls.createEntry(createForm);
				setCreateOpen(false);
				setNamespace(result.entry.namespace);
				setSelectedId(identity(result.entry));
				setNotice(t("created"));
				refreshAll();
			} catch (error) { setCreateError(error.message); }
			finally { setBusy(null); }
		}
		async function saveEntry() {
			if (!detail) return;
			setBusy("save");
			setActionError(null);
			setNotice(null);
			setConflict(false);
			try {
				const request = { entry: detail.entry, content, ifRevision: detail.revision };
				if (evidence !== detail.evidence) request.evidence = evidence;
				await controls.updateEntry(request);
				setNotice(t("saved"));
				refreshAll();
			} catch (error) {
				if (error.message.includes("revision_conflict")) setConflict(true);
				setActionError(error.message);
			} finally { setBusy(null); }
		}
		async function toggleArchived() {
			if (!detail) return;
			setBusy("archive");
			setActionError(null);
			setNotice(null);
			try {
				await controls.setArchived({ entry: detail.entry, archived: !detail.archived });
				setNotice(t("archivedDone"));
				refreshAll();
			} catch (error) { setActionError(error.message); }
			finally { setBusy(null); }
		}
		async function rollback(snapshotId) {
			if (!detail) return;
			setBusy("rollback");
			setActionError(null);
			setNotice(null);
			try {
				await controls.rollbackEntry({ entry: detail.entry, snapshotId });
				setRollbackId(null);
				setNotice(t("rolledBack"));
				refreshAll();
			} catch (error) { setActionError(error.message); }
			finally { setBusy(null); }
		}
		function changeText(change) {
			if (!change) return "";
			if (change.initial) return t("initialVersion");
			const parts = [];
			if (change.contentDelta !== null && change.contentDelta !== 0) parts.push(t("contentDelta", { delta: (change.contentDelta > 0 ? "+" : "") + change.contentDelta }));
			if (change.evidenceChanged) parts.push(t("evidenceUpdated"));
			return parts.length ? parts.join(" · ") : t("noContentChange");
		}
		function renderSnapshot(snapshot) {
			const expanded = previewId === snapshot.snapshotId;
			const confirming = rollbackId === snapshot.snapshotId;
			return h("li", { key: snapshot.snapshotId, className: "lm-browser-history-row" },
				h("div", { className: "lm-browser-history-head" },
					h("div", { className: "lm-browser-history-meta" },
						h("time", { dateTime: snapshot.createdAt }, time(snapshot.createdAt)),
						h("code", { title: snapshot.revision }, snapshot.revision.slice(0, 12)),
						h("span", null, t("characters", { count: snapshot.chars }))),
					h("div", { className: "lm-browser-history-tools" },
						h(Button, { variant: "ghost", size: "sm", onClick: () => setPreviewId(expanded ? null : snapshot.snapshotId) }, expanded ? t("collapse") : t("preview")),
						h(Button, { variant: "ghost", size: "sm", disabled: Boolean(busy), onClick: () => setRollbackId(confirming ? null : snapshot.snapshotId) }, t("rollback")))),
				h("div", { className: "lm-browser-history-summary" },
					h("span", { className: "lm-browser-history-summary-text" }, snapshot.summary || t("noSummary")),
					h("span", { className: "lm-browser-history-change" }, changeText(snapshot.change))),
				confirming ? h("div", { className: "lm-browser-rollback-confirm" },
					h("p", null, t("rollbackWarning")),
					h("div", null,
						h(Button, { variant: "ghost", size: "sm", disabled: Boolean(busy), onClick: () => setRollbackId(null) }, t("cancel")),
						h(Button, { variant: "primary", size: "sm", disabled: Boolean(busy), onClick: () => rollback(snapshot.snapshotId) }, t("rollbackConfirm")))) : null,
				expanded ? h("pre", { className: "lm-browser-history-preview" }, snapshot.preview || t("noPreview")) : null);
		}
		const dirty = detail && (content !== detail.content || evidence !== detail.evidence);
		return h("section", { className: "lm-browser-page", "aria-label": t("title"), "data-memory-browser": true },
			h("style", null, styles),
			h("header", { className: "lm-browser-heading" }, h("h1", null, t("title")), h(Button, { variant: "primary", size: "sm", className: "lm-browser-new", icon: h(IconPlusOutlineRegular, { size: 13 }), disabled: !namespaces.length, onClick: openCreate }, t("newEntry"))),
			h("div", { className: "lm-browser-toolbar" },
				h("div", { className: "lm-browser-namespace" }, h(SelectMenu, { value: namespace || "", options: namespaces.length ? namespaces.map(row => ({ value: row.namespace, label: row.namespace })) : [{ value: "", label: namespaceBusy ? t("loading") : t("noNamespace") }], disabled: namespaceBusy || !namespaces.length || Boolean(busy), onChange: value => { setNamespace(value); setNotice(null); setActionError(null); setConflict(false); }, ariaLabel: t("namespace") })),
				h("div", { className: "lm-browser-search" }, h(Input, { type: "search", icon: h(IconSearchOutlineRegular, { size: 14 }), "aria-label": t("search"), placeholder: t("searchPlaceholder"), value: query, onChange: event => setQuery(event.target.value) }), query ? h(Button, { variant: "ghost", size: "sm", className: "lm-browser-search-clear", "aria-label": t("clearSearch"), onClick: () => setQuery("") }, h(IconCloseOutlineRegular, { size: 14 })) : null),
				h("div", { className: "lm-browser-filter-tabs", role: "group", "aria-label": "kind" }, [["", t("all")], ["fact", "fact"], ["sop", "sop"]].map(([value, label]) => h("button", { key: value || "all", type: "button", className: "lm-browser-filter-tab" + (kind === value ? " is-active" : ""), "aria-pressed": kind === value, onClick: () => setKind(value) }, label))),
				h("label", { className: "lm-browser-archived-toggle" }, h(Switch, { checked: includeArchived, label: t("showArchived"), onChange: next => setIncludeArchived(next) }), h("span", { "aria-hidden": "true" }, t("showArchived")))),
			h(IndexUsage, { stats: usage, t }),
			namespaceError ? h("div", { className: "lm-browser-error lm-browser-banner", role: "alert" }, h("span", null, namespaceError), h(Button, { variant: "outline", size: "sm", onClick: () => setNamespaceVersion(value => value + 1) }, t("reload"))) : null,
			h("div", { className: "lm-browser-body" },
				h("section", { className: "lm-browser-list-pane", "aria-label": t("entries") },
					listBusy ? h("p", { className: "lm-browser-empty", role: "status" }, t("loading")) : null,
					listError ? h("p", { className: "lm-browser-error", role: "alert" }, listError) : null,
					namespaceBusy ? h("p", { className: "lm-browser-empty", role: "status" }, t("loading")) : (!listBusy && !listError && !entries.length ? h("p", { className: "lm-browser-empty" }, t("empty")) : null),
					h("ul", { className: "lm-browser-list" }, entries.map(row => h("li", { key: identity(row.entry) }, h("button", { type: "button", className: "lm-browser-row" + (selectedId === identity(row.entry) ? " is-selected" : "") + (row.archived ? " is-archived" : ""), onClick: () => { setSelectedId(identity(row.entry)); setNotice(null); setActionError(null); setConflict(false); } },
						h("span", { className: "lm-browser-row-title" }, row.title),
						h("span", { className: "lm-browser-row-meta" }, h("span", { className: "lm-browser-kind" }, row.entry.kind), row.archived ? h("span", null, t("archived")) : null, row.updatedAt ? h("time", { dateTime: row.updatedAt }, time(row.updatedAt)) : null)))))),
				h("article", { className: "lm-browser-detail" },
					detailBusy && !detail ? h("p", { className: "lm-browser-empty", role: "status" }, t("loading")) : null,
					detailError ? h("div", { className: "lm-browser-detail-message" }, h("p", { className: "lm-browser-error", role: "alert" }, detailError), h(Button, { variant: "outline", size: "sm", onClick: reloadDetail }, t("reload"))) : null,
					!detailBusy && !detailError && !detail ? h("p", { className: "lm-browser-empty" }, t("emptyDetail")) : null,
					detail ? h("div", { className: "lm-browser-detail-scroll" },
						h("div", { className: "lm-browser-detail-heading" },
							h("div", { className: "lm-browser-detail-title" }, h("h2", null, detail.title), detail.archived ? h("span", { className: "lm-browser-archived-badge" }, t("archived")) : null),
							h("div", { className: "lm-browser-detail-actions" },
								notice ? h("span", { className: "lm-browser-inline-notice", role: "status" }, notice) : null,
								h(Button, { variant: "outline", size: "sm", disabled: Boolean(busy), onClick: toggleArchived }, detail.archived ? t("restore") : t("archive")),
								h(Button, { variant: "primary", size: "sm", disabled: Boolean(busy) || !dirty, onClick: saveEntry }, busy === "save" ? t("saving") : t("save")))),
						conflict ? h("div", { className: "lm-browser-conflict", role: "alert" }, h("span", null, t("conflict")), h(Button, { variant: "outline", size: "sm", onClick: reloadDetail }, t("reload"))) : null,
						actionError && !conflict ? h("p", { className: "lm-browser-error", role: "alert" }, actionError) : null,
						h("dl", { className: "lm-browser-readonly" }, [["namespace", detail.entry.namespace], ["kind", detail.entry.kind], ["key", detail.entry.key]].map(([label, value]) => h("div", { key: label }, h("dt", null, label), h("dd", null, value)))),
						h(Field, { label: h("span", { style: { display: "inline-flex", alignItems: "center", gap: 8 } }, t("content"), h("span", { className: "lm-browser-seg-toggle" },
													h("button", { type: "button", className: "lm-browser-seg-btn" + (contentPreview ? " is-active" : ""), onClick: () => setContentPreview(true) }, t("previewMode")),
													h("button", { type: "button", className: "lm-browser-seg-btn" + (!contentPreview ? " is-active" : ""), onClick: () => setContentPreview(false) }, t("editMode")))) },
									contentPreview
										? h("div", { className: "lm-browser-md-preview", onClick: () => setContentPreview(false) }, renderMarkdown(content))
										: h("textarea", { className: "lm-browser-textarea lm-browser-content", value: content, disabled: Boolean(busy), onChange: event => setContent(event.target.value), onBlur: () => setContentPreview(true) })),
						h(Field, { label: t("evidence") }, h(Input, { value: evidence, disabled: Boolean(busy), placeholder: t("evidencePlaceholder"), onChange: event => setEvidence(event.target.value) })),
						h("section", { className: "lm-browser-history" },
							h("h3", null, t("history")),
							historyBusy ? h("p", { className: "lm-browser-empty", role: "status" }, t("loading")) : null,
							historyError ? h("p", { className: "lm-browser-error", role: "alert" }, historyError) : null,
							!historyBusy && !historyError && !history.length ? h("p", { className: "lm-browser-muted" }, t("noHistory")) : null,
							h("ol", { className: "lm-browser-history-list" }, history.map(renderSnapshot)))) : null)),
			h(CreateDialog, { open: createOpen, form: createForm, setForm: setCreateForm, namespaces, busy: busy === "create", error: createError, onClose: () => setCreateOpen(false), onSubmit: createEntry, t }));
	}
	return {
		inject: ["remote"],
		async apply(ctx) {
			const ui = ctx.inject(["remote.layeredMemoryStatus", "slots", "locale"], scope => {
				scope.effect(() => scope.locale.register(locale, dictionaries), "memory-browser: locale");
				const controls = {
					listNamespaces: () => resultValue(scope.remote.layeredMemoryStatus.listNamespaces()),
					namespaceStats: request => resultValue(scope.remote.layeredMemoryStatus.namespaceStats(request)),
					listEntries: request => resultValue(scope.remote.layeredMemoryStatus.listEntries(request)),
					readEntry: request => resultValue(scope.remote.layeredMemoryStatus.readEntry(request)),
					createEntry: request => resultValue(scope.remote.layeredMemoryStatus.createEntry(request)),
					updateEntry: request => resultValue(scope.remote.layeredMemoryStatus.updateEntry(request)),
					setArchived: request => resultValue(scope.remote.layeredMemoryStatus.setArchived(request)),
					entryHistory: request => resultValue(scope.remote.layeredMemoryStatus.entryHistory(request)),
					rollbackEntry: request => resultValue(scope.remote.layeredMemoryStatus.rollbackEntry(request)),
				};
				scope.slots.inject("main", () => scope.slots.register({ name: "main", key: "layered-memory", locale, inject: () => ({ controls }) }, MemoryBrowserPage));
				scope.slots.inject("sidebar.panellist", () => scope.slots.register({ name: "sidebar.panellist", id: "layered-memory", order: 20, locale, label: () => "记忆" }, MemoryBrowserIcon));
			});
			try { await ui; }
			catch (error) { await ui.dispose(); throw error; }
			return async () => { await ui.dispose(); };
		},
	};
}

const statusClient = createStatusClient(require,"/* Match ui-chat's StatsPills and stat-dialog; controls come from ui-primitives. */\n.lm-status-seat {\n\tdisplay: inline-flex;\n\talign-items: center;\n\tflex: 0 1 auto;\n\tmin-width: 0;\n\tmax-width: min(240px, 35vw);\n\tfont-size: calc(var(--dsh-content-font-size-secondary, 13px) - 1px);\n\tline-height: calc(20px + var(--dsh-content-font-delta-secondary, 0px));\n}\n.lm-status-line {\n\tdisplay: inline-flex;\n\talign-items: center;\n\tgap: 6px;\n\tbox-sizing: border-box;\n\tmin-width: 0;\n\tmax-width: 100%;\n\tpadding: 1px 8px;\n\tborder: 0;\n\tborder-radius: var(--dsw-radius-sm);\n\tbackground: transparent;\n\tcolor: var(--dsw-alias-label-tertiary);\n\tfont: inherit;\n\tfont-variant-numeric: tabular-nums;\n\tline-height: inherit;\n\twhite-space: nowrap;\n\ttext-align: left;\n}\nbutton.lm-status-line { cursor: pointer; }\nbutton.lm-status-line:hover,\nbutton.lm-status-line[aria-expanded=\"true\"] {\n\tbackground: var(--dsw-alias-interactive-bg-hover);\n\tcolor: var(--dsw-alias-label-secondary);\n}\nbutton.lm-status-line:focus-visible,\n.lm-activity-panel summary:focus-visible {\n\toutline: var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color);\n\toutline-offset: -2px;\n}\n.lm-status-glyph { width: 14px; height: 14px; flex: none; }\n.lm-status-text {\n\tmin-width: 0;\n\toverflow: hidden;\n\ttext-overflow: ellipsis;\n\tbackground: linear-gradient(105deg, #b78535, #aa79bd);\n\tbackground-clip: text;\n\t-webkit-background-clip: text;\n\tcolor: transparent;\n}\n.lm-status-seat:is([data-memory-status=\"idle\"], [data-memory-status=\"loading\"], [data-memory-status=\"stopped\"]) .lm-status-text,\n.lm-status-line.is-failed .lm-status-text { background: none; color: inherit; }\n.lm-status-failure { flex: none; color: var(--dsw-alias-state-error-primary); }\n.lm-status-line.is-running .lm-status-glyph { animation: lm-status-pulse 1.8s ease-in-out infinite; }\n@keyframes lm-status-pulse { 0%, 100% { opacity: .5; } 50% { opacity: 1; } }\n@media (prefers-reduced-motion: reduce) { .lm-status-line.is-running .lm-status-glyph { animation: none; } }\n\n.lm-activity-panel {\n\tposition: fixed;\n\tz-index: 1100;\n\tdisplay: flex;\n\tflex-direction: column;\n\tbox-sizing: border-box;\n\twidth: max-content;\n\tmin-width: min(300px, calc(100vw - 24px));\n\tmax-width: min(440px, calc(100vw - 24px));\n\tmax-height: min(560px, calc(100dvh - 72px));\n\tmargin: 0;\n\tpadding: 16px;\n\tborder: 0;\n\tborder-radius: var(--dsw-radius-lg);\n\tbackground: var(--dsw-specific-menu);\n\tbackdrop-filter: var(--dsw-menu-backdrop-filter);\n\t--dsw-elevation-stroke-color: var(--dsw-alias-border-l1);\n\tbox-shadow: var(--dsw-elevation-prominent);\n\tfont: inherit;\n\tfont-size: 12px;\n\tline-height: 18px;\n\tcolor: var(--dsw-alias-label-secondary);\n\ttext-align: left;\n\tcursor: default;\n\toverflow: hidden;\n}\n.lm-activity-heading {\n\tdisplay: flex;\n\talign-items: center;\n\tjustify-content: space-between;\n\tflex: none;\n\tgap: 16px;\n\tmin-height: 20px;\n\tmargin-bottom: 8px;\n\tcolor: var(--dsw-alias-label-primary);\n\tfont-weight: 500;\n}\n.lm-activity-title { display: inline-flex; align-items: center; gap: 6px; min-width: 0; }\n.lm-activity-rule { flex: none; margin-bottom: 10px; border-top: .5px solid var(--dsw-alias-border-l2); }\n.lm-activity-tabs { flex: none; align-self: stretch; margin-bottom: 12px; }\n.lm-activity-body { display: flex; flex-direction: column; min-height: 0; }\n.lm-activity-content { min-height: 0; overflow: auto; overscroll-behavior: contain; }\n.lm-activity-content h3 { margin: 0 0 8px; font: inherit; font-weight: 500; color: var(--dsw-alias-label-primary); }\n.lm-current-runs { margin-bottom: 16px; }\n.lm-current-run { padding: 10px; border: .5px solid var(--dsw-alias-border-l2); border-radius: var(--dsw-radius-md); }\n.lm-current-run + .lm-current-run { margin-top: 8px; }\n.lm-run-heading { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }\n.lm-run-heading strong { font-weight: 500; color: var(--dsw-alias-label-primary); }\n.lm-run-state { color: var(--dsw-alias-label-tertiary); }\n.lm-run-state[data-state=\"failed\"],\n.lm-run-state[data-state=\"deferred\"] { color: var(--dsw-alias-state-error-primary); }\n.lm-stop { margin-left: auto; }\n.lm-run-counts { display: flex; flex-wrap: wrap; gap: 6px 16px; margin-top: 8px; color: var(--dsw-alias-label-tertiary); font-variant-numeric: tabular-nums; }\n.lm-run-summary { margin: 8px 0 0; white-space: pre-wrap; overflow-wrap: anywhere; }\n.lm-finished-run { padding: 10px 0; border-bottom: .5px solid var(--dsw-alias-border-l2); }\n.lm-finished-run:first-child { padding-top: 0; }\n.lm-finished-run:last-child { border-bottom: 0; padding-bottom: 0; }\n.lm-finished-run > summary { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; cursor: pointer; list-style: none; }\n.lm-finished-run > summary::before { content: \"›\"; color: var(--dsw-alias-label-tertiary); }\n.lm-finished-run[open] > summary::before { transform: rotate(90deg); }\n.lm-finished-run time,\n.lm-history time { margin-left: auto; font-size: 11px; line-height: 16px; font-variant-numeric: tabular-nums; color: var(--dsw-alias-label-tertiary); }\n.lm-legacy { padding: 0 4px; border-radius: var(--dsw-radius-xs); background: var(--dsw-alias-interactive-bg-hover); font-size: 11px; line-height: 16px; color: var(--dsw-alias-label-tertiary); }\n.lm-history-heading { display: flex; align-items: center; gap: 8px; flex: none; margin-bottom: 8px; color: var(--dsw-alias-label-tertiary); }\n.lm-history-heading button:not(.lm-stop) { margin-left: auto; }\n.lm-activity-panel .lm-history-older { display: block; margin: 0 auto 10px; }\n.lm-history-message { margin-bottom: 16px; }\n.lm-history-label,\n.lm-history-event > summary { display: flex; align-items: center; gap: 6px; color: var(--dsw-alias-label-tertiary); }\n.lm-history-event { margin: 8px 0; padding: 8px; border-radius: var(--dsw-radius-sm); background: var(--dsw-alias-interactive-bg-hover); }\n.lm-history-event > summary { cursor: pointer; }\n.lm-history-body { margin: 6px 0 0; white-space: pre-wrap; overflow-wrap: anywhere; font: inherit; }\n.lm-activity-empty { margin: 4px 0; color: var(--dsw-alias-label-tertiary); }\n.lm-activity-error { margin: 8px 0; color: var(--dsw-alias-state-error-primary); white-space: pre-wrap; overflow-wrap: anywhere; }\n");
const memoryBrowserClient = createMemoryBrowserClient(require,".lm-browser-page {\n\tbox-sizing: border-box;\n\twidth: 100%;\n\theight: 100%;\n\tmin-width: 0;\n\tmin-height: 0;\n\tdisplay: flex;\n\tflex-direction: column;\n\toverflow: hidden;\n\tcolor: var(--dsw-alias-label-primary);\n\tbackground: var(--dsw-alias-bg-base);\n\tfont-size: 14px;\n\tline-height: 1.6;\n}\n.lm-browser-page *, .lm-browser-page *::before, .lm-browser-page *::after { box-sizing: border-box; }\n.lm-browser-heading { flex: none; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 28px clamp(24px, 4vw, 48px) 20px; }\n.lm-browser-heading h1 { min-width: 0; margin: 0; font-size: 20px; font-weight: 500; line-height: 28px; }\n.lm-browser-new { flex: none; height: 32px; padding: 0 12px; border-radius: 16px; }\n.lm-browser-toolbar { flex: none; display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px; padding: 0 clamp(24px, 4vw, 48px) 16px; }\n.lm-browser-namespace { flex: 0 1 220px; min-width: 150px; }\n.lm-browser-input { width: 100%; height: 36px; border: .5px solid var(--dsw-alias-border-l3); border-radius: 12px; outline: none; padding: 0 10px; color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-base); font: inherit; }\n.lm-browser-input:focus { border-color: var(--dsw-alias-state-business-primary); }\n/* 官方 Menu 下拉触发器：与工具栏其它控件同高同圆角，按钮内容左值右箭头 */\n.lm-browser-select-trigger.lm-browser-select-trigger { width: 100%; height: 36px; justify-content: space-between; gap: 8px; padding: 0 10px; border-radius: 12px; border: .5px solid var(--dsw-alias-border-l3); color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-base); font: inherit; font-weight: 400; }\n.lm-browser-select-trigger.lm-browser-select-trigger:hover { border-color: var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-base); }\n.lm-browser-select-trigger.lm-browser-select-trigger[aria-expanded=\"true\"] { border-color: var(--dsw-alias-state-business-primary); }\n.lm-browser-select-value { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: left; }\n.lm-browser-select-trigger svg { flex: none; color: var(--dsw-alias-label-tertiary); }\n.lm-browser-select-menu { max-height: 320px; overflow: auto; min-width: 220px; }\n.lm-browser-search { display: flex; align-items: center; flex: 1 1 240px; min-width: 180px; height: 36px; margin: 0; padding: 0 10px; border: .5px solid var(--dsw-alias-border-l3); border-radius: 12px; color: var(--dsw-alias-label-tertiary); transition: border-color .15s; }\n.lm-browser-search:hover { border-color: var(--dsw-alias-border-l2); }\n.lm-browser-search:focus-within { border-color: var(--dsw-alias-state-business-primary); }\n.lm-browser-search > :first-child { flex: 1; min-width: 0; height: 100%; padding: 0; border: 0; border-radius: 0; background: transparent; }\n.lm-browser-search > :first-child:focus-within { border-color: transparent; }\n.lm-browser-search input::placeholder { color: var(--dsw-alias-label-caption); }\n.lm-browser-search input:focus-visible { outline: none; }\n.lm-browser-search input::-webkit-search-cancel-button { display: none; }\n.lm-browser-search-clear { flex: none; width: 28px; height: 28px; margin-right: -6px; padding: 0; }\n.lm-browser-filter-tabs { display: flex; flex: none; align-items: center; gap: 4px; }\n.lm-browser-filter-tab { display: inline-flex; align-items: center; flex: none; height: 28px; padding: 0 10px; border: 0; border-radius: 14px; color: var(--dsw-alias-label-tertiary); background: transparent; font: inherit; font-size: 14px; line-height: 22px; white-space: nowrap; cursor: pointer; }\n.lm-browser-filter-tab:hover { background: var(--dsw-alias-interactive-bg-hover); }\n.lm-browser-filter-tab.is-active { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-interactive-bg-hover); }\n.lm-browser-archived-toggle { display: inline-flex; align-items: center; gap: 8px; flex: none; color: var(--dsw-alias-label-secondary); font-size: 13px; cursor: pointer; }\n.lm-browser-banner { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 12px; margin: 0 clamp(24px, 4vw, 48px) 12px; }\n/* 索引占用：常态只有一行总览，点击展开分段明细；不设卡片容器，跟随页面留白与字号 */\n.lm-browser-usage { flex: none; padding: 0 clamp(24px, 4vw, 48px) 12px; }\n.lm-usage-summary { box-sizing: border-box; display: flex; align-items: center; gap: 10px; width: calc(100% + 16px); margin: 0 -8px; padding: 4px 8px; background: 0 0; border: 0; border-radius: var(--dsw-radius-sm); color: inherit; font: inherit; text-align: left; cursor: pointer; }\n.lm-usage-summary:hover, .lm-usage-summary[aria-expanded=\"true\"] { background: var(--dsw-alias-interactive-bg-hover); }\n.lm-usage-summary:focus-visible { outline: 2px solid var(--dsw-focus-ring-color); outline-offset: -2px; }\n.lm-usage-label { flex: none; color: var(--dsw-alias-label-tertiary); font-size: 12px; line-height: 18px; white-space: nowrap; }\n.lm-usage-percent { flex: none; color: var(--dsw-alias-label-secondary); font-size: 12px; line-height: 18px; font-weight: 500; font-variant-numeric: tabular-nums; white-space: nowrap; }\n.lm-usage-percent.is-over { color: var(--dsw-alias-state-error-primary); }\n.lm-usage-bar { flex: 1 1 auto; display: flex; gap: 1px; height: 4px; min-width: 80px; overflow: hidden; border-radius: 999px; background: var(--dsw-alias-interactive-bg-hover); }\n.lm-usage-segment { flex: none; min-width: 2px; height: 100%; border-radius: 1px; background: var(--meter-tint, var(--dsw-alias-label-tertiary)); transition: opacity .12s ease; }\n.lm-usage-segment.is-dim { opacity: .28; }\n.lm-usage-figures { flex: none; color: var(--dsw-alias-label-tertiary); font-size: 12px; line-height: 18px; font-variant-numeric: tabular-nums; white-space: nowrap; }\n.lm-usage-chevron { flex: none; color: var(--dsw-alias-label-tertiary); transition: transform .16s ease; }\n.lm-browser-usage.is-open .lm-usage-chevron { transform: rotate(180deg); }\n.lm-usage-detail { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .18s ease; }\n.lm-browser-usage.is-open .lm-usage-detail { grid-template-rows: 1fr; }\n.lm-usage-detail-inner { min-height: 0; overflow: hidden; }\n.lm-usage-legend { display: flex; flex-wrap: wrap; align-items: center; gap: 2px 18px; padding-top: 8px; color: var(--dsw-alias-label-tertiary); font-size: 12px; line-height: 18px; }\n.lm-usage-legend-wrap { display: inline-flex; transition: opacity .12s ease; }\n.lm-usage-legend-wrap.is-dim { opacity: .4; }\n.lm-usage-legend-item { display: inline-flex; align-items: center; gap: 5px; cursor: default; }\n.lm-usage-swatch { display: inline-block; width: 7px; height: 7px; border-radius: 2px; background: var(--meter-tint); }\n.lm-usage-legend-label { color: var(--dsw-alias-label-secondary); }\n.lm-usage-legend-chars { color: var(--dsw-alias-label-tertiary); font-variant-numeric: tabular-nums; }\n.lm-usage-over { margin: 6px 0 0; color: var(--dsw-alias-state-error-primary); font-size: 12px; line-height: 18px; }\n.lm-usage-color-note { --meter-tint: var(--dsw-static-neutral-bluish-400); }\n.lm-usage-color-rules { --meter-tint: var(--dsw-static-violet-400); }\n.lm-usage-color-facts { --meter-tint: var(--dsw-static-blue-450); }\n.lm-usage-color-sops { --meter-tint: #b78535; }\n.lm-browser-body { display: flex; flex: 1; min-width: 0; min-height: 0; border-top: .5px solid var(--dsw-alias-border-l3); }\n.lm-browser-list-pane { flex: 0 0 39%; min-width: 260px; min-height: 0; overflow: auto; padding: 14px clamp(16px, 2.5vw, 32px) 32px; scrollbar-gutter: stable; --dsh-scrollbar-width: 9px; --dsh-scrollbar-thumb-border: 2px; }\n.lm-browser-list { display: flex; flex-direction: column; gap: 2px; margin: 0; padding: 0; list-style: none; }\n.lm-browser-row { display: flex; flex-direction: column; align-items: stretch; gap: 3px; width: 100%; min-width: 0; padding: 10px 12px; border: 0; border-radius: 12px; color: var(--dsw-alias-label-primary); background: transparent; font: inherit; text-align: left; cursor: pointer; }\n.lm-browser-row:hover { background: var(--dsw-alias-interactive-bg-hover); }\n.lm-browser-row.is-selected { background: var(--dsw-alias-interactive-bg-active); }\n.lm-browser-row.is-archived { opacity: .55; }\n.lm-browser-row-title { overflow: hidden; font-weight: 500; line-height: 23px; text-overflow: ellipsis; white-space: nowrap; }\n.lm-browser-row-meta { display: flex; align-items: center; gap: 8px; min-width: 0; color: var(--dsw-alias-label-tertiary); font-size: 12px; line-height: 20px; }\n.lm-browser-row-meta time { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.lm-browser-kind { display: inline-flex; align-items: center; flex: none; height: 20px; padding: 0 7px; border-radius: 10px; color: var(--dsw-alias-label-secondary); background: var(--dsw-alias-bg-layer-1); font-size: 11px; line-height: 20px; }\n.lm-browser-detail { display: flex; flex: 1; flex-direction: column; min-width: 0; min-height: 0; border-left: .5px solid var(--dsw-alias-border-l3); }\n.lm-browser-detail-scroll { flex: 1; min-height: 0; overflow: auto; padding: 24px clamp(20px, 3vw, 36px) 36px; scrollbar-gutter: stable; --dsh-scrollbar-width: 9px; --dsh-scrollbar-thumb-border: 2px; }\n.lm-browser-detail-heading { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px 12px; margin-bottom: 14px; }\n.lm-browser-detail-title { display: flex; flex: 1 1 auto; align-items: center; gap: 10px; min-width: 0; }\n.lm-browser-detail-title h2 { flex: 1; min-width: 0; margin: 0; overflow-wrap: anywhere; font-size: 18px; font-weight: 500; line-height: 26px; }\n.lm-browser-detail-actions { display: flex; flex: none; align-items: center; gap: 8px; }\n.lm-browser-md-preview { min-height: 240px; max-height: 520px; overflow: auto; padding: 12px 14px; border: .5px solid var(--dsw-alias-border-l3); border-radius: 12px; background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-primary); font-size: 14px; line-height: 1.75; cursor: text; }\n.lm-browser-md-preview h2, .lm-browser-md-preview h3, .lm-browser-md-preview h4, .lm-browser-md-preview h5, .lm-browser-md-preview h6 { margin: 14px 0 6px; font-size: 15px; font-weight: 600; line-height: 1.5; }\n.lm-browser-md-preview h2 { font-size: 17px; }\n.lm-browser-md-preview p { margin: 6px 0; }\n.lm-browser-md-preview ul, .lm-browser-md-preview ol { margin: 6px 0; padding-left: 22px; }\n.lm-browser-md-preview li { margin: 2px 0; }\n.lm-browser-md-preview code { padding: 1px 5px; border-radius: 4px; background: var(--dsw-alias-interactive-bg-hover); font-family: var(--dsh-font-family-mono, ui-monospace, SFMono-Regular, Consolas, monospace); font-size: 13px; }\n.lm-browser-md-preview pre { margin: 8px 0; padding: 10px 12px; overflow: auto; border-radius: 8px; background: var(--dsw-alias-interactive-bg-hover); }\n.lm-browser-md-preview pre code { padding: 0; background: none; }\n.lm-browser-md-preview blockquote { margin: 8px 0; padding: 4px 12px; border-left: 3px solid var(--dsw-alias-border-l2); color: var(--dsw-alias-label-secondary); }\n.lm-browser-md-preview a { color: var(--dsw-alias-state-business-primary); text-decoration: underline; text-underline-offset: 2px; }\n.lm-browser-md-preview hr { margin: 12px 0; border: 0; border-top: .5px solid var(--dsw-alias-border-l3); }\n.lm-browser-md-preview strong { font-weight: 600; }\n.lm-browser-seg-toggle { display: inline-flex; overflow: hidden; border: .5px solid var(--dsw-alias-border-l3); border-radius: 8px; }\n.lm-browser-seg-btn { height: 26px; padding: 0 10px; border: 0; background: transparent; color: var(--dsw-alias-label-tertiary); font: inherit; font-size: 12px; cursor: pointer; }\n.lm-browser-seg-btn:hover { background: var(--dsw-alias-interactive-bg-hover); }\n.lm-browser-seg-btn.is-active { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-interactive-bg-hover); font-weight: 500; }\n.lm-browser-inline-notice { color: var(--dsw-alias-state-success-primary, #1a7f37); font-size: 13px; white-space: nowrap; }\n.lm-browser-archived-badge { flex: none; padding: 2px 8px; border-radius: 10px; color: var(--dsw-alias-label-tertiary); background: var(--dsw-alias-bg-layer-1); font-size: 12px; }\n.lm-browser-readonly { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin: 0 0 20px; }\n.lm-browser-readonly div { min-width: 0; }\n.lm-browser-readonly dt { color: var(--dsw-alias-label-tertiary); font-size: 12px; line-height: 20px; }\n.lm-browser-readonly dd { margin: 1px 0 0; overflow-wrap: anywhere; color: var(--dsw-alias-label-secondary); font-family: var(--dsh-font-family-mono, monospace); font-size: 12px; line-height: 20px; }\n.lm-browser-field { display: flex; flex-direction: column; gap: 7px; min-width: 0; margin-bottom: 16px; }\n.lm-browser-field-label { color: var(--dsw-alias-label-secondary); font-size: 13px; line-height: 20px; }\n.lm-browser-textarea { display: block; width: 100%; max-width: 100%; min-height: 112px; margin: 0; padding: 12px; border: .5px solid var(--dsw-alias-border-l3); border-radius: 12px; outline: 0; resize: vertical; color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-base); font: inherit; font-size: 14px; line-height: 24px; transition: border-color .15s; }\n.lm-browser-textarea:hover { border-color: var(--dsw-alias-border-l2); }\n.lm-browser-textarea:focus { border-color: var(--dsw-alias-state-business-primary); }\n.lm-browser-content { min-height: 260px; font-family: var(--dsh-font-family-mono, ui-monospace, SFMono-Regular, Consolas, monospace); font-size: 13px; line-height: 22px; }\n.lm-browser-create-content { min-height: 96px; font-family: var(--dsh-font-family-mono, ui-monospace, SFMono-Regular, Consolas, monospace); }\n.lm-browser-error { margin: 8px 0; color: var(--dsw-alias-state-error-primary); font-size: 13px; line-height: 21px; letter-spacing: normal; text-align: left; }\n.lm-browser-notice { margin: 8px 0; color: var(--dsw-alias-label-tertiary); font-size: 13px; }\n.lm-browser-conflict { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; margin: 8px 0; padding: 10px 12px; border-radius: 10px; color: var(--dsw-alias-state-error-primary); background: var(--dsw-alias-bg-layer-1); font-size: 13px; }\n.lm-browser-history { padding-top: 20px; border-top: .5px solid var(--dsw-alias-border-l3); }\n.lm-browser-history h3 { margin: 0 0 10px; font-size: 14px; font-weight: 500; line-height: 22px; }\n.lm-browser-history-list { display: flex; flex-direction: column; gap: 6px; margin: 0; padding: 0; list-style: none; }\n.lm-browser-history-row { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 4px 8px; padding: 9px 10px; border-radius: 10px; background: var(--dsw-alias-bg-layer-1); }\n.lm-browser-history-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; flex: 1 1 100%; }\n.lm-browser-history-tools { display: flex; flex: none; align-items: center; gap: 8px; }\n.lm-browser-history-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; min-width: 0; color: var(--dsw-alias-label-tertiary); font-size: 12px; }\n.lm-browser-history-meta code { color: var(--dsw-alias-label-secondary); }\n.lm-browser-history-summary { display: flex; flex: 1 1 100%; align-items: baseline; gap: 10px; min-width: 0; max-width: 100%; overflow: hidden; padding-left: 1px; color: var(--dsw-alias-label-caption); font-size: 12px; line-height: 18px; }\n.lm-browser-history-summary-text { display: block; flex: 1 1 auto; min-width: 0; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.lm-browser-history-change { flex: none; white-space: nowrap; color: var(--dsw-alias-label-tertiary); }\n.lm-browser-history-preview { flex: 1 1 100%; max-height: 240px; margin: 4px 0 2px; padding: 10px 12px; overflow: auto; border-radius: 8px; background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-secondary); font-family: var(--dsh-font-family-mono, ui-monospace, SFMono-Regular, Consolas, monospace); font-size: 12px; line-height: 20px; white-space: pre-wrap; overflow-wrap: anywhere; }\n.lm-browser-rollback-confirm { display: flex; flex: 1 1 100%; align-items: center; justify-content: space-between; gap: 10px; margin-top: 2px; padding: 8px 0 2px; border-top: .5px solid var(--dsw-alias-border-l3); }\n.lm-browser-rollback-confirm p { margin: 0; color: var(--dsw-alias-label-secondary); font-size: 13px; }\n.lm-browser-rollback-confirm > div { display: flex; flex: none; gap: 8px; }\n.lm-browser-history-tools button:nth-of-type(1), .lm-browser-rollback-confirm button:nth-of-type(1) { width: 56px; justify-content: center; }\n.lm-browser-history-tools button:nth-of-type(2), .lm-browser-rollback-confirm button:nth-of-type(2) { width: 112px; justify-content: center; }\n.lm-browser-empty { margin: 0; padding: 36px 16px; color: var(--dsw-alias-label-tertiary); text-align: center; font-size: 14px; }\n.lm-browser-detail > .lm-browser-empty { margin: auto; }\n.lm-browser-muted { margin: 8px 0; color: var(--dsw-alias-label-tertiary); font-size: 13px; }\n.lm-browser-detail-message { margin: auto; padding: 24px; text-align: center; }\n.lm-browser-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }\n.lm-browser-modal-backdrop { position: fixed; z-index: 1000; inset: 0; display: flex; align-items: center; justify-content: center; padding: 24px; background: var(--dsw-alias-mask, rgb(0 0 0 / 35%)); }\n.lm-browser-modal { display: flex; flex-direction: column; width: min(560px, 100%); max-height: calc(100dvh - 48px); overflow: hidden; padding: 0; border: .5px solid var(--dsw-alias-border-l3); border-radius: 16px; color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-base); box-shadow: 0 16px 48px rgb(0 0 0 / 18%); }\n.lm-browser-modal form { display: flex; flex-direction: column; min-height: 0; overflow: auto; padding: 0 24px 20px; }\n.lm-browser-modal form > :last-child { margin-bottom: 0; }\n.lm-browser-modal-heading { flex: none; display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 18px; padding: 20px 24px 0; }\n.lm-browser-modal-heading h2 { margin: 0; font-size: 20px; font-weight: 500; line-height: 28px; }\n.lm-browser-modal-actions { position: sticky; bottom: 0; display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; padding-top: 12px; background: var(--dsw-alias-bg-base); }\n.lm-browser-page :focus-visible { outline: 2px solid var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary)); outline-offset: 2px; }\n.lm-browser-page .lm-browser-textarea:focus-visible, .lm-browser-page .lm-browser-input:focus-visible { outline: none; }\n@media (width <= 980px) {\n\t.lm-browser-list-pane { flex-basis: 44%; min-width: 230px; }\n\t.lm-browser-readonly { grid-template-columns: 1fr; gap: 5px; }\n}\n@media (width <= 700px) {\n\t.lm-browser-heading, .lm-browser-toolbar { padding-left: 16px; padding-right: 16px; }\n\t.lm-browser-body { flex-direction: column; }\n\t.lm-browser-list-pane { flex: 0 0 38%; width: 100%; min-width: 0; padding-left: 12px; padding-right: 12px; }\n\t.lm-browser-detail { border-top: .5px solid var(--dsw-alias-border-l3); border-left: 0; }\n}\n@media (pointer: coarse) {\n\t.lm-browser-search input, .lm-browser-input, .lm-browser-textarea { font-size: 16px; }\n}\n");
return {
	inject: statusClient.inject,
	async apply(ctx) {
		const disposeStatus = await statusClient.apply(ctx);
		let disposeBrowser;
		try { disposeBrowser = await memoryBrowserClient.apply(ctx); }
		catch (error) { await disposeStatus(); throw error; }
		return async () => { await disposeBrowser(); await disposeStatus(); };
	},
};
}});
