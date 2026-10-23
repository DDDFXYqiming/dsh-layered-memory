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

function createStatusClient(require, styles) {
	const React = require("react");
	const { createPortal } = require("react-dom");
	const { Button, SegmentedControl, IconCloseOutlineRegular, IconWarningOutlineRegular, useAnchoredPosition, useDismissOnOutsidePointer } = require("@deepseek-ai/dsh-client-ui-primitives");
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
			activity: "记忆活动", close: "关闭", runs: "运行记录", current: "当前任务", reviewWorker: "核对会话", batchWorker: "整理会话",
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
			activity: "Memory activity", close: "Close", runs: "Runs", current: "Current task", reviewWorker: "Review session", batchWorker: "Organization session",
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
	function ActivityPanel({ open, snapshot, controls, panelRef, panelId, position, onClose, t }) {
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
				h("span", { className: "lm-activity-title" }, h(Brain), t("activity")),
				h(Button, { variant: "ghost", size: "sm", className: "lm-close", onClick: onClose, "aria-label": t("close") }, h(IconCloseOutlineRegular, { size: 14 }))),
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
			open && createPortal(h(ActivityPanel, { open, snapshot, controls, panelRef, panelId, position, onClose: () => setOpen(false), t }), document.body));
	}
	return {
		inject: ["remote"],
		async apply(ctx) {
			const unmountRemote = await ctx.remote.$mount(STATUS_REMOTE);
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

return createStatusClient(require,"/* Match ui-chat's StatsPills and stat-dialog; controls come from ui-primitives. */\n.lm-status-seat {\n\tdisplay: inline-flex;\n\talign-items: center;\n\tflex: 0 1 auto;\n\tmin-width: 0;\n\tmax-width: min(240px, 35vw);\n\tfont-size: calc(var(--dsh-content-font-size-secondary, 13px) - 1px);\n\tline-height: calc(20px + var(--dsh-content-font-delta-secondary, 0px));\n}\n.lm-status-line {\n\tdisplay: inline-flex;\n\talign-items: center;\n\tgap: 6px;\n\tbox-sizing: border-box;\n\tmin-width: 0;\n\tmax-width: 100%;\n\tpadding: 1px 8px;\n\tborder: 0;\n\tborder-radius: var(--dsw-radius-sm);\n\tbackground: transparent;\n\tcolor: var(--dsw-alias-label-tertiary);\n\tfont: inherit;\n\tfont-variant-numeric: tabular-nums;\n\tline-height: inherit;\n\twhite-space: nowrap;\n\ttext-align: left;\n}\nbutton.lm-status-line { cursor: pointer; }\nbutton.lm-status-line:hover,\nbutton.lm-status-line[aria-expanded=\"true\"] {\n\tbackground: var(--dsw-alias-interactive-bg-hover);\n\tcolor: var(--dsw-alias-label-secondary);\n}\nbutton.lm-status-line:focus-visible,\n.lm-activity-panel summary:focus-visible {\n\toutline: var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color);\n\toutline-offset: -2px;\n}\n.lm-status-glyph { width: 14px; height: 14px; flex: none; }\n.lm-status-text {\n\tmin-width: 0;\n\toverflow: hidden;\n\ttext-overflow: ellipsis;\n\tbackground: linear-gradient(105deg, #b78535, #aa79bd);\n\tbackground-clip: text;\n\t-webkit-background-clip: text;\n\tcolor: transparent;\n}\n.lm-status-seat:is([data-memory-status=\"idle\"], [data-memory-status=\"loading\"], [data-memory-status=\"stopped\"]) .lm-status-text,\n.lm-status-line.is-failed .lm-status-text { background: none; color: inherit; }\n.lm-status-failure { flex: none; color: var(--dsw-alias-state-error-primary); }\n.lm-status-line.is-running .lm-status-glyph { animation: lm-status-pulse 1.8s ease-in-out infinite; }\n@keyframes lm-status-pulse { 0%, 100% { opacity: .5; } 50% { opacity: 1; } }\n@media (prefers-reduced-motion: reduce) { .lm-status-line.is-running .lm-status-glyph { animation: none; } }\n\n.lm-activity-panel {\n\tposition: fixed;\n\tz-index: 1100;\n\tdisplay: flex;\n\tflex-direction: column;\n\tbox-sizing: border-box;\n\twidth: max-content;\n\tmin-width: min(300px, calc(100vw - 24px));\n\tmax-width: min(440px, calc(100vw - 24px));\n\tmax-height: min(560px, calc(100dvh - 72px));\n\tmargin: 0;\n\tpadding: 16px;\n\tborder: 0;\n\tborder-radius: var(--dsw-radius-lg);\n\tbackground: var(--dsw-specific-menu);\n\tbackdrop-filter: var(--dsw-menu-backdrop-filter);\n\t--dsw-elevation-stroke-color: var(--dsw-alias-border-l1);\n\tbox-shadow: var(--dsw-elevation-prominent);\n\tfont: inherit;\n\tfont-size: 12px;\n\tline-height: 18px;\n\tcolor: var(--dsw-alias-label-secondary);\n\ttext-align: left;\n\tcursor: default;\n\toverflow: hidden;\n}\n.lm-activity-heading {\n\tdisplay: flex;\n\talign-items: center;\n\tjustify-content: space-between;\n\tflex: none;\n\tgap: 16px;\n\tmin-height: 20px;\n\tmargin-bottom: 8px;\n\tcolor: var(--dsw-alias-label-primary);\n\tfont-weight: 500;\n}\n.lm-activity-title { display: inline-flex; align-items: center; gap: 6px; min-width: 0; }\n.lm-activity-panel .lm-close { width: 20px; height: 20px; min-height: 0; padding: 0; border-radius: var(--dsw-radius-sm); }\n.lm-activity-rule { flex: none; margin-bottom: 10px; border-top: .5px solid var(--dsw-alias-border-l2); }\n.lm-activity-tabs { flex: none; align-self: stretch; margin-bottom: 12px; }\n.lm-activity-body { display: flex; flex-direction: column; min-height: 0; }\n.lm-activity-content { min-height: 0; overflow: auto; overscroll-behavior: contain; }\n.lm-activity-content h3 { margin: 0 0 8px; font: inherit; font-weight: 500; color: var(--dsw-alias-label-primary); }\n.lm-current-runs { margin-bottom: 16px; }\n.lm-current-run { padding: 10px; border: .5px solid var(--dsw-alias-border-l2); border-radius: var(--dsw-radius-md); }\n.lm-current-run + .lm-current-run { margin-top: 8px; }\n.lm-run-heading { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }\n.lm-run-heading strong { font-weight: 500; color: var(--dsw-alias-label-primary); }\n.lm-run-state { color: var(--dsw-alias-label-tertiary); }\n.lm-run-state[data-state=\"failed\"],\n.lm-run-state[data-state=\"deferred\"] { color: var(--dsw-alias-state-error-primary); }\n.lm-stop { margin-left: auto; }\n.lm-run-counts { display: flex; flex-wrap: wrap; gap: 6px 16px; margin-top: 8px; color: var(--dsw-alias-label-tertiary); font-variant-numeric: tabular-nums; }\n.lm-run-summary { margin: 8px 0 0; white-space: pre-wrap; overflow-wrap: anywhere; }\n.lm-finished-run { padding: 10px 0; border-bottom: .5px solid var(--dsw-alias-border-l2); }\n.lm-finished-run:first-child { padding-top: 0; }\n.lm-finished-run:last-child { border-bottom: 0; padding-bottom: 0; }\n.lm-finished-run > summary { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; cursor: pointer; list-style: none; }\n.lm-finished-run > summary::before { content: \"›\"; color: var(--dsw-alias-label-tertiary); }\n.lm-finished-run[open] > summary::before { transform: rotate(90deg); }\n.lm-finished-run time,\n.lm-history time { margin-left: auto; font-size: 11px; line-height: 16px; font-variant-numeric: tabular-nums; color: var(--dsw-alias-label-tertiary); }\n.lm-legacy { padding: 0 4px; border-radius: var(--dsw-radius-xs); background: var(--dsw-alias-interactive-bg-hover); font-size: 11px; line-height: 16px; color: var(--dsw-alias-label-tertiary); }\n.lm-history-heading { display: flex; align-items: center; gap: 8px; flex: none; margin-bottom: 8px; color: var(--dsw-alias-label-tertiary); }\n.lm-history-heading button:not(.lm-stop) { margin-left: auto; }\n.lm-activity-panel .lm-history-older { display: block; margin: 0 auto 10px; }\n.lm-history-message { margin-bottom: 16px; }\n.lm-history-label,\n.lm-history-event > summary { display: flex; align-items: center; gap: 6px; color: var(--dsw-alias-label-tertiary); }\n.lm-history-event { margin: 8px 0; padding: 8px; border-radius: var(--dsw-radius-sm); background: var(--dsw-alias-interactive-bg-hover); }\n.lm-history-event > summary { cursor: pointer; }\n.lm-history-body { margin: 6px 0 0; white-space: pre-wrap; overflow-wrap: anywhere; font: inherit; }\n.lm-activity-empty { margin: 4px 0; color: var(--dsw-alias-label-tertiary); }\n.lm-activity-error { margin: 8px 0; color: var(--dsw-alias-state-error-primary); white-space: pre-wrap; overflow-wrap: anywhere; }\n");
}});
