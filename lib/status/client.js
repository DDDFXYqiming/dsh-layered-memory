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
function parseEntries(value) {
	if (!Array.isArray(value)) throw new TypeError("记忆列表必须是数组");
	for (const row of value) {
		if (!row || typeof row !== "object") throw new TypeError("记忆条目必须是对象");
		parseEntry(row.entry);
		text(row.title);
		boolean(row.archived);
		nullableText(row.updatedAt);
		count(row.chars);
	}
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
		storeDescriptor("getInjectionState", parseObjectResult, parseNamespaceInput),
		storeDescriptor("getDiskMetrics", parseObjectResult, parseNamespaceInput),
		storeDescriptor("getMaintenanceReport", parseObjectResult, parseNamespaceInput),
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
			"retrySchedule": "自动整理计划", "nextEligibleAt": "最早可重试时间", "retryCount": "连续退避 {count} 次", "retryReason": "原因", "retry-failed": "运行失败", "retry-timeout": "运行超时", "retry-deferred": "尚未完成", "retry-no_progress": "本轮无进展", "retry-interrupted": "运行中断", "retry-user_stopped": "本次已停止", "retry-cooldown": "共享冷却",
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
			"retrySchedule": "Organization schedule", "nextEligibleAt": "Next eligible time", "retryCount": "Backoff count: {count}", "retryReason": "Reason", "retry-failed": "Run failed", "retry-timeout": "Run timed out", "retry-deferred": "Incomplete", "retry-no_progress": "No progress", "retry-interrupted": "Run interrupted", "retry-user_stopped": "Current run stopped", "retry-cooldown": "Shared cooldown",
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
		ja: {
			"retrySchedule": "整理の再実行予定", "nextEligibleAt": "次回実行可能時刻", "retryCount": "連続待機 {count} 回", "retryReason": "理由", "retry-failed": "実行失敗", "retry-timeout": "実行タイムアウト", "retry-deferred": "未完了", "retry-no_progress": "進展なし", "retry-interrupted": "実行中断", "retry-user_stopped": "今回の実行を停止", "retry-cooldown": "共通クールダウン",
			"reviewing": "メモリを確認中", "organizing": "メモリを整理中", "changed": "メモリを {count} 件整理しました",
			"settled": "メモリ確認完了", "awaitingEvidence": "メモリは根拠待ち", "idle": "メモリ待機中", "initializing": "メモリ状態を読み込み中",
			"stoppedReview": "メモリ確認を停止しました", "stoppedBatch": "メモリ整理を停止しました",
			"failed": "前回のメモリ確認は未完了", "partial": "メモリを {count} 件整理 · 前回の確認は未完了", "details": "メモリ活動を表示",
			"unavailable": "メモリ状態は利用できません", "concurrent": "他に {count} 件のメモリタスクが実行中",
			"activity": "メモリ活動", "runs": "実行記録", "current": "現在のタスク", "reviewWorker": "確認セッション", "batchWorker": "整理セッション",
			"review": "今回の確認", "batch": "一括整理", "legacy": "旧記録", "empty": "まだメンテナンス記録がありません", "historyEmpty": "表示できる記録がありません",
			"loading": "読み込み中…", "refresh": "更新", "older": "以前の記録", "stopping": "停止中…", "stop": "停止", "notStarted": "未開始",
			"changedCount": "変更 {count} 件", "retainedCount": "保持 {count} 件", "waitingCount": "根拠待ち {count} 件", "remainingCount": "未完了 {count} 件",
			"phase-preparing": "準備中", "phase-compacting": "セッションを圧縮", "phase-running": "実行中", "phase-finishing": "結果を保存", "phase-stopping": "停止中", "phase-stopped": "停止済み",
			"state-running": "実行中", "state-reviewed": "完了", "state-unchanged": "更新不要", "state-waiting_evidence": "根拠待ち", "state-deferred": "未完了", "state-failed": "失敗", "state-idle": "アイドル", "state-stopped": "停止済み",
			"trace-assistant": "返信", "trace-reasoning": "思考", "trace-tool": "ツール呼び出し", "trace-result": "ツール結果", "trace-notice": "実行イベント",
		},
		es: {
			"retrySchedule": "Plan de organización", "nextEligibleAt": "Próxima hora elegible", "retryCount": "Esperas consecutivas: {count}", "retryReason": "Motivo", "retry-failed": "Ejecución fallida", "retry-timeout": "Tiempo agotado", "retry-deferred": "Incompleto", "retry-no_progress": "Sin progreso", "retry-interrupted": "Ejecución interrumpida", "retry-user_stopped": "Ejecución actual detenida", "retry-cooldown": "Espera compartida",
			"reviewing": "Revisando memoria", "organizing": "Organizando memoria", "changed": "Se organizaron {count} entradas",
			"settled": "Revisión de memoria completa", "awaitingEvidence": "Memoria esperando evidencia", "idle": "Memoria lista", "initializing": "Cargando estado de memoria",
			"stoppedReview": "Revisión de memoria detenida", "stoppedBatch": "Organización detenida",
			"failed": "La última revisión quedó incompleta", "partial": "{count} entradas organizadas · última revisión incompleta", "details": "Ver actividad de memoria",
			"unavailable": "Estado de memoria no disponible", "concurrent": "{count} tareas de memoria en ejecución",
			"activity": "Actividad de memoria", "runs": "Ejecuciones", "current": "Tarea actual", "reviewWorker": "Sesión de revisión", "batchWorker": "Sesión de organización",
			"review": "Revisión del turno", "batch": "Organización por lotes", "legacy": "Histórico", "empty": "Aún no hay registros de mantenimiento", "historyEmpty": "No hay registros que mostrar",
			"loading": "Cargando…", "refresh": "Actualizar", "older": "Registros anteriores", "stopping": "Deteniendo…", "stop": "Detener", "notStarted": "Sin empezar",
			"changedCount": "{count} cambiadas", "retainedCount": "{count} retenidas", "waitingCount": "{count} esperando evidencia", "remainingCount": "{count} pendientes",
			"phase-preparing": "Preparando", "phase-compacting": "Compactando sesión", "phase-running": "En ejecución", "phase-finishing": "Guardando resultados", "phase-stopping": "Deteniendo", "phase-stopped": "Detenido",
			"state-running": "En ejecución", "state-reviewed": "Completado", "state-unchanged": "Sin cambios", "state-waiting_evidence": "Esperando evidencia", "state-deferred": "Incompleto", "state-failed": "Fallido", "state-idle": "Inactivo", "state-stopped": "Detenido",
			"trace-assistant": "Respuesta", "trace-reasoning": "Pensamiento", "trace-tool": "Llamada a herramienta", "trace-result": "Resultado de herramienta", "trace-notice": "Evento de ejecución",
		},
		fr: {
			"retrySchedule": "Plan d’organisation", "nextEligibleAt": "Prochaine heure admissible", "retryCount": "Attentes consécutives : {count}", "retryReason": "Motif", "retry-failed": "Échec de l’exécution", "retry-timeout": "Délai dépassé", "retry-deferred": "Incomplet", "retry-no_progress": "Aucun progrès", "retry-interrupted": "Exécution interrompue", "retry-user_stopped": "Exécution actuelle arrêtée", "retry-cooldown": "Délai partagé",
			"reviewing": "Vérification de la mémoire", "organizing": "Organisation de la mémoire", "changed": "{count} entrées organisées",
			"settled": "Vérification terminée", "awaitingEvidence": "Mémoire en attente de preuve", "idle": "Mémoire prête", "initializing": "Chargement de l’état",
			"stoppedReview": "Vérification arrêtée", "stoppedBatch": "Organisation arrêtée",
			"failed": "La dernière vérification est incomplète", "partial": "{count} entrées organisées · vérification incomplète", "details": "Voir l’activité",
			"unavailable": "État de la mémoire indisponible", "concurrent": "{count} autres tâches en cours",
			"activity": "Activité mémoire", "runs": "Exécutions", "current": "Tâche actuelle", "reviewWorker": "Session de vérification", "batchWorker": "Session d’organisation",
			"review": "Vérification du tour", "batch": "Organisation par lot", "legacy": "Anciens enregistrements", "empty": "Aucun entretien enregistré", "historyEmpty": "Aucun enregistrement à afficher",
			"loading": "Chargement…", "refresh": "Actualiser", "older": "Enregistrements antérieurs", "stopping": "Arrêt…", "stop": "Arrêter", "notStarted": "Non démarré",
			"changedCount": "{count} modifiées", "retainedCount": "{count} conservées", "waitingCount": "{count} en attente de preuve", "remainingCount": "{count} restantes",
			"phase-preparing": "Préparation", "phase-compacting": "Compactage de la session", "phase-running": "En cours", "phase-finishing": "Enregistrement des résultats", "phase-stopping": "Arrêt", "phase-stopped": "Arrêté",
			"state-running": "En cours", "state-reviewed": "Terminé", "state-unchanged": "Aucun changement", "state-waiting_evidence": "En attente de preuve", "state-deferred": "Incomplet", "state-failed": "Échec", "state-idle": "Inactif", "state-stopped": "Arrêté",
			"trace-assistant": "Réponse", "trace-reasoning": "Réflexion", "trace-tool": "Appel d’outil", "trace-result": "Résultat d’outil", "trace-notice": "Événement d’exécution",
		},
		de: {
			"retrySchedule": "Organisationsplan", "nextEligibleAt": "Nächster möglicher Start", "retryCount": "Wartefolgen: {count}", "retryReason": "Grund", "retry-failed": "Lauf fehlgeschlagen", "retry-timeout": "Zeitüberschreitung", "retry-deferred": "Unvollständig", "retry-no_progress": "Kein Fortschritt", "retry-interrupted": "Lauf unterbrochen", "retry-user_stopped": "Aktueller Lauf gestoppt", "retry-cooldown": "Gemeinsame Wartezeit",
			"reviewing": "Speicher wird geprüft", "organizing": "Speicher wird organisiert", "changed": "{count} Einträge organisiert",
			"settled": "Speicherprüfung abgeschlossen", "awaitingEvidence": "Speicher wartet auf Nachweis", "idle": "Speicher bereit", "initializing": "Speicherstatus wird geladen",
			"stoppedReview": "Speicherprüfung gestoppt", "stoppedBatch": "Speicherorganisation gestoppt",
			"failed": "Letzte Speicherprüfung unvollständig", "partial": "{count} Einträge organisiert · letzte Prüfung unvollständig", "details": "Speicheraktivität anzeigen",
			"unavailable": "Speicherstatus nicht verfügbar", "concurrent": "{count} weitere Speicheraufgaben laufen",
			"activity": "Speicheraktivität", "runs": "Läufe", "current": "Aktuelle Aufgabe", "reviewWorker": "Prüfsitzung", "batchWorker": "Organisationssitzung",
			"review": "Prüfung dieses Turns", "batch": "Sammelorganisation", "legacy": "Altbestand", "empty": "Noch keine Wartungsläufe", "historyEmpty": "Keine Einträge anzuzeigen",
			"loading": "Wird geladen…", "refresh": "Aktualisieren", "older": "Frühere Einträge", "stopping": "Wird gestoppt…", "stop": "Stoppen", "notStarted": "Nicht gestartet",
			"changedCount": "{count} geändert", "retainedCount": "{count} behalten", "waitingCount": "{count} warten auf Nachweis", "remainingCount": "{count} offen",
			"phase-preparing": "Vorbereitung", "phase-compacting": "Sitzung wird komprimiert", "phase-running": "Läuft", "phase-finishing": "Ergebnisse werden gespeichert", "phase-stopping": "Wird gestoppt", "phase-stopped": "Gestoppt",
			"state-running": "Läuft", "state-reviewed": "Abgeschlossen", "state-unchanged": "Keine Änderungen", "state-waiting_evidence": "Wartet auf Nachweis", "state-deferred": "Unvollständig", "state-failed": "Fehlgeschlagen", "state-idle": "Leerlauf", "state-stopped": "Gestoppt",
			"trace-assistant": "Antwort", "trace-reasoning": "Denken", "trace-tool": "Werkzeugaufruf", "trace-result": "Werkzeugergebnis", "trace-notice": "Laufereignis",
		},
		ru: {
			"retrySchedule": "План организации", "nextEligibleAt": "Следующее допустимое время", "retryCount": "Отсрочек подряд: {count}", "retryReason": "Причина", "retry-failed": "Сбой запуска", "retry-timeout": "Время истекло", "retry-deferred": "Не завершено", "retry-no_progress": "Нет прогресса", "retry-interrupted": "Запуск прерван", "retry-user_stopped": "Текущий запуск остановлен", "retry-cooldown": "Общая пауза",
			"reviewing": "Проверка памяти", "organizing": "Организация памяти", "changed": "Организовано {count} записей",
			"settled": "Проверка памяти завершена", "awaitingEvidence": "Память ждёт доказательств", "idle": "Память готова", "initializing": "Загрузка состояния памяти",
			"stoppedReview": "Проверка памяти остановлена", "stoppedBatch": "Организация остановлена",
			"failed": "Прошлая проверка не завершена", "partial": "Организовано {count} записей · проверка не завершена", "details": "Показать активность памяти",
			"unavailable": "Состояние памяти недоступно", "concurrent": "Ещё {count} задач памяти выполняется",
			"activity": "Активность памяти", "runs": "Запуски", "current": "Текущая задача", "reviewWorker": "Сеанс проверки", "batchWorker": "Сеанс организации",
			"review": "Проверка хода", "batch": "Пакетная организация", "legacy": "Старые записи", "empty": "Записей обслуживания пока нет", "historyEmpty": "Нет записей для отображения",
			"loading": "Загрузка…", "refresh": "Обновить", "older": "Ранние записи", "stopping": "Остановка…", "stop": "Остановить", "notStarted": "Не начато",
			"changedCount": "Изменено {count}", "retainedCount": "Сохранено {count}", "waitingCount": "Ждут доказательств {count}", "remainingCount": "Осталось {count}",
			"phase-preparing": "Подготовка", "phase-compacting": "Сжатие сеанса", "phase-running": "Выполнение", "phase-finishing": "Сохранение результатов", "phase-stopping": "Остановка", "phase-stopped": "Остановлено",
			"state-running": "Выполняется", "state-reviewed": "Завершено", "state-unchanged": "Без изменений", "state-waiting_evidence": "Ждёт доказательств", "state-deferred": "Не завершено", "state-failed": "Ошибка", "state-idle": "Простой", "state-stopped": "Остановлено",
			"trace-assistant": "Ответ", "trace-reasoning": "Размышление", "trace-tool": "Вызов инструмента", "trace-result": "Результат инструмента", "trace-notice": "Событие запуска",
		},
		pt: {
			"retrySchedule": "Plano de organização", "nextEligibleAt": "Próximo horário elegível", "retryCount": "Esperas consecutivas: {count}", "retryReason": "Motivo", "retry-failed": "Falha na execução", "retry-timeout": "Tempo esgotado", "retry-deferred": "Incompleto", "retry-no_progress": "Sem progresso", "retry-interrupted": "Execução interrompida", "retry-user_stopped": "Execução atual interrompida", "retry-cooldown": "Espera compartilhada",
			"reviewing": "Revisando memória", "organizing": "Organizando memória", "changed": "{count} entradas organizadas",
			"settled": "Revisão da memória concluída", "awaitingEvidence": "Memória aguardando evidência", "idle": "Memória pronta", "initializing": "Carregando estado da memória",
			"stoppedReview": "Revisão da memória interrompida", "stoppedBatch": "Organização interrompida",
			"failed": "A última revisão ficou incompleta", "partial": "{count} entradas organizadas · revisão incompleta", "details": "Ver atividade da memória",
			"unavailable": "Estado da memória indisponível", "concurrent": "Mais {count} tarefas de memória em execução",
			"activity": "Atividade da memória", "runs": "Execuções", "current": "Tarefa atual", "reviewWorker": "Sessão de revisão", "batchWorker": "Sessão de organização",
			"review": "Revisão do turno", "batch": "Organização em lote", "legacy": "Registros antigos", "empty": "Ainda não há registros de manutenção", "historyEmpty": "Sem registros para exibir",
			"loading": "Carregando…", "refresh": "Atualizar", "older": "Registros anteriores", "stopping": "Parando…", "stop": "Parar", "notStarted": "Não iniciado",
			"changedCount": "{count} alteradas", "retainedCount": "{count} mantidas", "waitingCount": "{count} aguardando evidência", "remainingCount": "{count} restantes",
			"phase-preparing": "Preparando", "phase-compacting": "Compactando sessão", "phase-running": "Em execução", "phase-finishing": "Salvando resultados", "phase-stopping": "Parando", "phase-stopped": "Parado",
			"state-running": "Em execução", "state-reviewed": "Concluído", "state-unchanged": "Sem alterações", "state-waiting_evidence": "Aguardando evidência", "state-deferred": "Incompleto", "state-failed": "Falhou", "state-idle": "Ocioso", "state-stopped": "Parado",
			"trace-assistant": "Resposta", "trace-reasoning": "Raciocínio", "trace-tool": "Chamada de ferramenta", "trace-result": "Resultado da ferramenta", "trace-notice": "Evento de execução",
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
			async refresh(signal) { accept({ type: "update", snapshot: await resultValue(remote.layeredMemoryStatus.getSnapshot(sessionId, signal)) }); },
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
			controls.refresh(controller.signal).catch(error => { if (!controller.signal.aborted) setWorkersError(error.message); });
			return () => controller.abort();
		}, [open, controls]);
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
		const retries = snapshot?.reflection.filter(state => state.nextEligibleAt || state.retryCount || state.retryReason) || [];
		const retryRows = retries.map(state => h("details", { key: "retry-" + state.namespace, className: "lm-finished-run", "data-memory-retry": true, "data-namespace": state.namespace },
			h("summary", null,
				h("span", null, t("retrySchedule")),
				state.retryReason ? h("span", { className: "lm-run-state", "data-state": state.retryReason }, t("retry-" + state.retryReason)) : null,
				state.retryCount > 0 ? h("span", { className: "lm-run-state" }, t("retryCount", { count: state.retryCount })) : null,
				state.nextEligibleAt ? h("time", { dateTime: state.nextEligibleAt, title: state.nextEligibleAt }, time(state.nextEligibleAt)) : null),
			h("div", { className: "lm-run-counts" },
				h("span", null, state.namespace),
				state.nextEligibleAt ? h("span", null, t("nextEligibleAt"), " ", time(state.nextEligibleAt)) : null)));
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
				retryRows.length || finished.length ? h("section", null, retryRows, ...finished.map(run => h("details", { key: run.id, className: "lm-finished-run", open: run.id === snapshot.latestFailure?.id, "data-memory-run": run.id, "data-run-status": run.status },
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
								refresh: signal => store.refresh(signal),
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
			ruleContentCount: "当前 {count} / {limit} 字符", ruleContentNearLimit: "接近规则正文上限，请保留完整适用条件。", ruleContentOverLimit: "规则正文超过 {limit} 字符，请精简后保存。",
			title: "记忆系统工作台", newEntry: "新建条目", namespace: "命名空间", search: "搜索记忆", searchPlaceholder: "搜索标题、正文或关键词", clearSearch: "清空",
			all: "全部", showArchived: "已归档", entries: "条目表格", loading: "正在读取…", empty: "没有匹配的记忆条目", emptyDetail: "从左侧列表选择条目查看详情",
			archived: "已归档", content: "正文内容", evidence: "证据与溯源", save: "保存", saving: "保存中…", archive: "归档", restore: "恢复",
			history: "历史快照时间轴", noHistory: "暂无历史快照", rollback: "回滚版本", rollbackConfirm: "确认回滚", cancel: "取消",
			rollbackWarning: "回滚会覆盖当前内容，是否继续？", requiredFields: "命名空间、标题、内容、证据都必须填写", loadTimeout: "记忆数据加载超时", saved: "已保存", archivedDone: "归档状态已更新", rolledBack: "已回滚到所选快照", preview: "对比/预览", collapse: "收起", initialVersion: "初始版本", evidenceUpdated: "证据更新", contentDelta: "内容 {delta} 字符", noContentChange: "无正文变化", noSummary: "（空内容）", noPreview: "该快照没有可预览的正文", editMode: "编辑模式", previewMode: "预览模式",
			reload: "重新加载", conflict: "条目已被修改，请重新加载后再保存。", createTitle: "新建记忆条目", topic: "标识 / 标题",
			topicPlaceholder: "输入条目标题或唯一标识", contentPlaceholder: "输入记忆正文", evidencePlaceholder: "输入本次写入的证据来源", create: "创建条目", creating: "创建中…",
			created: "条目已创建", close: "关闭", createdAt: "创建时间", updatedAt: "更新时间", characters: "{count} 字符",
			listFailed: "条目列表读取失败", detailFailed: "条目详情读取失败", historyFailed: "历史快照读取失败", noNamespace: "暂无可用命名空间",
			"usage.used": "索引已用", "usage.total": "{used} / {budget} 字符", "usage.over": "已超预算",
			"usage.count": "{count} 条", "usage.share": "占已用 {share}%",
			"usage.label.head": "说明", "usage.label.rules": "规则", "usage.label.facts": "事实目录", "usage.label.sops": "经验目录",
			"kind.rule": "规则", "kind.fact": "事实", "kind.sop": "经验", kindLabel: "类型", ruleEvidencePlaceholder: "输入规则依据，例如用户的明确指令",
			"usage.tip.head": "索引头部说明", "usage.tip.rules": "L0 红线规则", "usage.tip.facts": "事实条目目录 (facts.md)", "usage.tip.sops": "任务经验目录 (sops/)",
			tabEntries: "条目表格", tabInjection: "注入透视", tabGraph: "关系图谱", tabCockpit: "维护驾驶舱",
			backToList: "← 返回列表", relatedCapsules: "关联记忆", sourceSession: "来源会话",
			heatLabel: "热度", accessLabel: "访问", statusLabel: "流态",
		},
		en: {
			ruleContentCount: "Current {count} / {limit} chars", ruleContentNearLimit: "Approaching rule limit.", ruleContentOverLimit: "Rule exceeds {limit} chars.",
			title: "Memory Workspace", newEntry: "New Entry", namespace: "Namespace", search: "Search", searchPlaceholder: "Search title, body or keyword", clearSearch: "Clear",
			all: "All", showArchived: "Archived", entries: "Data Table", loading: "Loading…", empty: "No matching entries", emptyDetail: "Select an entry to view details",
			archived: "Archived", content: "Content", evidence: "Evidence", save: "Save", saving: "Saving…", archive: "Archive", restore: "Restore",
			history: "Timeline & Snapshots", noHistory: "No history", rollback: "Rollback", rollbackConfirm: "Confirm", cancel: "Cancel",
			rollbackWarning: "Rollback will overwrite current content. Continue?", requiredFields: "Required fields missing", loadTimeout: "Timed out", saved: "Saved", archivedDone: "Archive updated", rolledBack: "Rolled back", preview: "Diff / Preview", collapse: "Collapse", initialVersion: "Initial", evidenceUpdated: "Evidence updated", contentDelta: "{delta} chars", noContentChange: "No change", noSummary: "(empty)", noPreview: "No preview", editMode: "Edit", previewMode: "Preview",
			reload: "Reload", conflict: "Conflict detected.", createTitle: "New Memory Entry", topic: "Title / Key",
			topicPlaceholder: "Enter title or key", contentPlaceholder: "Enter content", evidencePlaceholder: "Enter evidence", create: "Create", creating: "Creating…",
			created: "Created", close: "Close", createdAt: "Created", updatedAt: "Updated", characters: "{count} chars",
			listFailed: "Failed to load", detailFailed: "Failed to load detail", historyFailed: "Failed to load history", noNamespace: "No namespace",
			"usage.used": "Index Used", "usage.total": "{used} / {budget} chars", "usage.over": "Over Budget",
			"usage.count": "{count} entries", "usage.share": "{share}%",
			"usage.label.head": "Header", "usage.label.rules": "Rules", "usage.label.facts": "Facts", "usage.label.sops": "Skills",
			"kind.rule": "Rule", "kind.fact": "Fact", "kind.sop": "Skill", kindLabel: "Type", ruleEvidencePlaceholder: "Rule evidence",
			"usage.tip.head": "Index header", "usage.tip.rules": "L0 Rules", "usage.tip.facts": "Facts (facts.md)", "usage.tip.sops": "Skills (sops/)",
			tabEntries: "Data Table", tabInjection: "Injection Flow", tabGraph: "Memory Graph", tabCockpit: "Maintenance Cockpit",
			backToList: "← Back", relatedCapsules: "Related Entries", sourceSession: "Source Session",
			heatLabel: "Heat", accessLabel: "Access", statusLabel: "Status",
		}
	};

	async function resultValue(request) {
		const result = await request;
		if (!result.ok) throw new Error(result.error.message);
		return result.value;
	}

	const identity = entry => JSON.stringify([entry.namespace, entry.kind, entry.key]);
	const time = value => {
		if (!value) return "—";
		const date = new Date(value);
		const diffMs = Date.now() - date.getTime();
		const diffMin = Math.round(diffMs / 60000);
		if (diffMin < 1) return "刚刚";
		if (diffMin < 60) return `${diffMin}分钟前`;
		const diffHour = Math.round(diffMin / 60);
		if (diffHour < 24) return `${diffHour}小时前`;
		return `${Math.round(diffHour / 24)}天前`;
	};
	const formatBytes = bytes => {
		if (!bytes || bytes <= 0) return "0 B";
		const units = ["B", "KB", "MB", "GB"];
		const index = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
		return (bytes / Math.pow(1024, index)).toFixed(1) + " " + units[index];
	};

	const ruleContentLimit = 100;
	const ruleContentLength = content => Array.from(String(content || "").trim()).length;
	const ruleContentOverLimit = (kind, content) => kind === "rule" && ruleContentLength(content) > ruleContentLimit;
	const entryKinds = ["rule", "fact", "sop"];
	const kindText = (kind, t) => (entryKinds.includes(kind) ? t("kind." + kind) : kind);

	const RING_PATH = "M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831";
	const KIND_COLOR = { rule: "#a855f7", fact: "#3b82f6", sop: "#b78535" };

	function compactChars(value) {
		const number = Number(value);
		if (!Number.isFinite(number) || number <= 0) return "0";
		if (number < 1000) return String(Math.round(number));
		const scaled = number / 1000;
		return (scaled >= 100 ? String(Math.round(scaled)) : scaled.toFixed(1)) + "K";
	}

	function highlightText(text, query) {
		if (!query || !text) return text;
		const parts = String(text).split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
		return parts.map((part, index) => part.toLowerCase() === query.toLowerCase()
			? h("mark", { key: index, className: "lm-highlight-match" }, part)
			: part);
	}

	// 完整 Markdown 渲染（包含标题、列表、代码块、行内格式）
	function renderMarkdown(text) {
		const lines = String(text || "").split(/\r?\n/);
		const elements = [];
		let inCode = false;
		let codeBuffer = [];

		lines.forEach((line, index) => {
			if (line.startsWith("```")) {
				if (inCode) {
					elements.push(h("pre", { key: "code-" + index, style: { background: "var(--dsw-alias-bg-layer-1)", padding: 10, borderRadius: 8, overflow: "auto" } },
						h("code", null, codeBuffer.join("\n"))));
					codeBuffer = [];
					inCode = false;
				} else {
					inCode = true;
				}
				return;
			}
			if (inCode) {
				codeBuffer.push(line);
				return;
			}
			if (line.startsWith("### ")) {
				elements.push(h("h3", { key: index, style: { margin: "10px 0 4px", fontSize: 14, fontWeight: 600 } }, line.slice(4)));
			} else if (line.startsWith("## ")) {
				elements.push(h("h2", { key: index, style: { margin: "14px 0 6px", fontSize: 16, fontWeight: 600 } }, line.slice(3)));
			} else if (line.startsWith("# ")) {
				elements.push(h("h1", { key: index, style: { margin: "16px 0 8px", fontSize: 18, fontWeight: 600 } }, line.slice(2)));
			} else if (line.startsWith("- ") || line.startsWith("* ")) {
				elements.push(h("li", { key: index, style: { marginLeft: 16, margin: "2px 0" } }, line.slice(2)));
			} else if (line.trim() === "") {
				elements.push(h("div", { key: index, style: { height: 6 } }));
			} else {
				elements.push(h("p", { key: index, style: { margin: "4px 0" } }, line));
			}
		});
		return elements;
	}

	function MemoryBrowserIcon({ size = 20 }) {
		return h("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true },
			h("path", { d: "M5 4.5A2.5 2.5 0 0 1 7.5 2H20v17H7.5A2.5 2.5 0 0 0 5 21.5z" }),
			h("path", { d: "M5 4.5v17M8.5 6H16M8.5 10H16M8.5 14H13" }));
	}

	// BounceNav 弹性导航条
	function BounceNav({ currentTab, onSelect, t }) {
		const tabs = [
			{ id: "entries", label: t("tabEntries") },
			{ id: "injection", label: t("tabInjection") },
			{ id: "graph", label: t("tabGraph") },
			{ id: "cockpit", label: t("tabCockpit") },
		];
		const activeIndex = Math.max(0, tabs.findIndex(tab => tab.id === currentTab));
		const tabWidth = 98;
		return h("div", { className: "lm-bounce-tabs" },
			h("div", { className: "lm-bounce-pill", style: { width: tabWidth + "px", transform: `translateX(${activeIndex * (tabWidth + 2)}px)` } }),
			tabs.map(tab => h("button", {
				key: tab.id,
				type: "button",
				style: { width: tabWidth + "px" },
				className: "lm-bounce-tab" + (currentTab === tab.id ? " is-active" : ""),
				onClick: () => onSelect(tab.id),
			}, tab.label)));
	}

	function Field({ label, children, className = "" }) {
		return h("label", { className: "lm-browser-field " + className }, h("span", { className: "lm-browser-field-label" }, label), children);
	}

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
		if (!open) return null;
		const update = (key, value) => setForm(current => ({ ...current, [key]: value }));
		const ruleTooLong = ruleContentOverLimit(form.kind, form.content);
		const explainerText = form.kind === "rule"
			? "【L0 规则】：写入 rules.md，全局常驻注入（占房间 ≥25%），硬上限 ≤100 字符，用于全局行为红线约束。"
			: form.kind === "fact"
				? "【L2 事实】：写入 facts.md（## 标题段落），按热度排序注入模型提示词，用于环境与项目事实知识。"
				: "【L3 经验】：写入 sops/*.md 独立文件，作为专业经验按需召回或常驻探索目录。";

		return h("div", { className: "lm-browser-modal-backdrop", onMouseDown: event => { if (event.target === event.currentTarget && !busy) onClose(); } },
			h("section", { className: "lm-browser-modal", role: "dialog", "aria-modal": true },
				h("div", { className: "lm-browser-modal-heading" },
					h("h2", null, t("createTitle")),
					h(Button, { variant: "ghost", size: "sm", "aria-label": t("close"), disabled: busy, onClick: onClose }, h(IconCloseOutlineRegular, { size: 16 }))),
				h("form", { onSubmit: event => { event.preventDefault(); onSubmit(); } },
					error ? h("p", { className: "lm-browser-error", role: "alert" }, error) : null,
					h("div", { className: "lm-kind-explainer" }, explainerText),
					h(Field, { label: t("namespace") }, h(SelectMenu, { value: form.namespace, options: namespaces.map(row => ({ value: row.namespace, label: row.namespace })), disabled: busy, onChange: value => update("namespace", value), ariaLabel: t("namespace"), triggerClassName: "lm-browser-input" })),
					h(Field, { label: t("kindLabel") }, h(SelectMenu, { value: form.kind, options: entryKinds.map(value => ({ value, label: kindText(value, t) })), disabled: busy, onChange: value => update("kind", value), ariaLabel: t("kindLabel"), triggerClassName: "lm-browser-input" })),
					h(Field, { label: t("topic") }, h(Input, { value: form.topic, placeholder: t("topicPlaceholder"), disabled: busy, onChange: event => update("topic", event.target.value) })),
					h(Field, { label: t("content") }, h("textarea", { className: "lm-browser-textarea", value: form.content, placeholder: t("contentPlaceholder"), disabled: busy, onChange: event => update("content", event.target.value) })),
					h(Field, { label: t("evidence") }, h("textarea", { className: "lm-browser-textarea lm-browser-evidence-textarea", value: form.evidence, placeholder: t(form.kind === "rule" ? "ruleEvidencePlaceholder" : "evidencePlaceholder"), disabled: busy, onChange: event => update("evidence", event.target.value) })),
					h("div", { style: { display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 } },
						h(Button, { variant: "outline", type: "button", disabled: busy, onClick: onClose }, t("cancel")),
						h(Button, { variant: "primary", type: "submit", disabled: busy || !form.namespace || ruleTooLong }, busy ? t("creating") : t("create"))))));
	}

	function IndexUsage({ stats, t, kind, onKindChange }) {
		const [open, setOpen] = React.useState(false);
		const used = Number(stats?.indexChars) || 0;
		const budget = Number(stats?.budgetChars) || 0;
		if (!stats || used <= 0 || budget <= 0) return null;
		const percent = Math.round((used / budget) * 100);
		const over = percent > 100;
		const targetChars = Math.round(budget * 0.9);
		const triggerChars = Math.round(targetChars * 1.02);
		const toTrigger = triggerChars - used;

		const parts = [
			{ key: "head", label: t("usage.label.head"), chars: Number(stats.headChars) || 0, count: null, kind: null },
			{ key: "rules", label: t("usage.label.rules"), chars: Number(stats.rulesChars) || 0, count: Number(stats.ruleCount) || 0, kind: "rule" },
			{ key: "facts", label: t("usage.label.facts"), chars: Number(stats.factsChars) || 0, count: Number(stats.factCount) || 0, kind: "fact" },
			{ key: "sops", label: t("usage.label.sops"), chars: Number(stats.sopsChars) || 0, count: Number(stats.sopCount) || 0, kind: "sop" },
		];

		const bar = h("span", { className: "lm-usage-bar" },
			parts.map(part => h("span", {
				key: part.key,
				className: "lm-usage-segment lm-usage-color-" + part.key,
				style: { width: (percent * part.chars / used) + "%" },
			})));

		const legend = h("div", { className: "lm-usage-legend" },
			parts.map(part => h("span", { key: part.key, className: "lm-usage-legend-wrap" },
				h(Tooltip, { label: `${part.label} · ${part.count ? part.count + " 条 · " : ""}${compactChars(part.chars)}` },
					part.kind
						? h("button", {
							type: "button",
							className: "lm-usage-legend-item is-clickable" + (kind === part.kind ? " is-active" : ""),
							onClick: () => onKindChange && onKindChange(part.kind),
						},
							h("span", { className: "lm-usage-swatch lm-usage-color-" + part.key }),
							h("span", { className: "lm-usage-legend-label" }, part.label),
							h("span", { className: "lm-usage-legend-chars" }, `${part.count ? part.count + " 条 · " : ""}${compactChars(part.chars)}`))
						: h("span", { className: "lm-usage-legend-item" },
							h("span", { className: "lm-usage-swatch lm-usage-color-" + part.key }),
							h("span", { className: "lm-usage-legend-label" }, part.label),
							h("span", { className: "lm-usage-legend-chars" }, compactChars(part.chars)))))));

		return h("div", { className: "lm-browser-usage-wrap" + (open ? " is-open" : "") },
			h("button", { type: "button", className: "lm-usage-summary", onClick: () => setOpen(!open) },
				h("div", { className: "lm-usage-ring-wrap" },
					h("svg", { className: "lm-usage-ring", viewBox: "0 0 36 36" },
						h("path", { className: "lm-usage-ring-bg", d: RING_PATH }),
						h("path", { className: "lm-usage-ring-fill" + (over ? " is-over" : percent > 90 ? " is-near" : ""), strokeDasharray: `${Math.min(100, percent)}, 100`, d: RING_PATH }))),
				h("span", { className: "lm-usage-percent" + (over ? " is-over" : "") }, percent + "%"),
				bar,
				h("span", { className: "lm-usage-figures" }, "~" + t("usage.total", { used: compactChars(used), budget: compactChars(budget) })),
				h(IconChevronDownOutlineRegular, { size: 12, className: "lm-usage-chevron" })),
			h("div", { className: "lm-usage-detail" },
				h("div", { className: "lm-usage-detail-inner" },
					h("div", { className: "lm-usage-status-line" },
						toTrigger > 0
							? h("span", { className: "lm-usage-trigger-hint" }, `距自动整理触发还差约 ${toTrigger} 字符 (触发水位: ${triggerChars})`)
							: h("span", { className: "lm-usage-trigger-hint is-triggered" }, `已超过触发整理水位 (${triggerChars} 字符)，下次将执行自动维护`)),
					legend)));
	}

	function ScrollProgressPill({ targetRef }) {
		const [progress, setProgress] = React.useState(0);
		const [menuOpen, setMenuOpen] = React.useState(false);
		React.useEffect(() => {
			const element = targetRef.current;
			if (!element) return;
			const onScroll = () => {
				const max = element.scrollHeight - element.clientHeight;
				setProgress(max > 0 ? Math.round((element.scrollTop / max) * 100) : 0);
			};
			element.addEventListener("scroll", onScroll);
			return () => element.removeEventListener("scroll", onScroll);
		}, [targetRef]);

		const scrollTo = id => {
			const target = document.getElementById(id);
			if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
			setMenuOpen(false);
		};

		const menu = h("div", { className: "lm-scroll-menu" },
			h("button", { type: "button", className: "lm-scroll-menu-item", onClick: () => scrollTo("sec-meta") }, "元数据与热度"),
			h("button", { type: "button", className: "lm-scroll-menu-item", onClick: () => scrollTo("sec-content") }, "正文内容"),
			h("button", { type: "button", className: "lm-scroll-menu-item", onClick: () => scrollTo("sec-evidence") }, "证据与溯源"),
			h("button", { type: "button", className: "lm-scroll-menu-item", onClick: () => scrollTo("sec-history") }, "历史快照时间轴"));

		return h("div", { className: "lm-scroll-pill-wrap" },
			menuOpen ? menu : null,
			h("button", { type: "button", className: "lm-scroll-pill", onClick: () => setMenuOpen(!menuOpen) },
				h("svg", { className: "lm-scroll-ring-svg", viewBox: "0 0 36 36" },
					h("path", { fill: "none", stroke: "var(--dsw-alias-interactive-bg-hover)", strokeWidth: 4, d: RING_PATH }),
					h("path", { fill: "none", stroke: "var(--dsw-static-blue-450, #3b82f6)", strokeWidth: 4, strokeDasharray: `${progress}, 100`, d: RING_PATH })),
				h("span", null, `${progress}%`)));
	}

	function DiffViewer({ oldText, newText }) {
		const oldLines = String(oldText || "").split("\n");
		const newLines = String(newText || "").split("\n");
		const max = Math.max(oldLines.length, newLines.length);
		const rows = [];
		for (let index = 0; index < max; index++) {
			const before = oldLines[index];
			const after = newLines[index];
			if (before === after) {
				rows.push(h("div", { key: index, className: "lm-diff-line" }, h("span", { style: { opacity: .4 } }, " "), before));
			} else {
				if (before !== undefined) rows.push(h("div", { key: index + "-del", className: "lm-diff-line lm-diff-del" }, "- ", before));
				if (after !== undefined) rows.push(h("div", { key: index + "-add", className: "lm-diff-line lm-diff-add" }, "+ ", after));
			}
		}
		return h("div", { className: "lm-diff-view" }, rows);
	}

	function InjectionView({ controls, namespace, t }) {
		const [data, setData] = React.useState(null);
		const [loading, setLoading] = React.useState(true);
		React.useEffect(() => {
			if (!namespace) return;
			setLoading(true);
			controls.getInjectionState({ namespace })
				.then(result => {
					setData(result);
					setLoading(false);
				})
				.catch(() => setLoading(false));
		}, [controls, namespace]);

		if (loading) return h("div", { className: "lm-injection-view" }, t("loading"));
		if (!data) return h("div", { className: "lm-injection-view" }, "无注入透视数据");

		const items = data.items || [];
		const ruleCount = items.filter(item => item.status === "rule").length;
		const statusText = { rule: "常驻规则", cold: "冷探索 🎲", included: "热注入", omitted: "已裁剪 ✂️" };

		const funnel = h("div", { className: "lm-funnel-card" },
			h("div", { className: "lm-funnel-step" }, h("h4", null, "磁盘总目录"), h("span", null, `${items.length} 条`)),
			h("span", { className: "lm-funnel-arrow" }, "→"),
			h("div", { className: "lm-funnel-step" }, h("h4", null, "规则常驻 (≥25%)"), h("span", null, `${ruleCount} 条`)),
			h("span", { className: "lm-funnel-arrow" }, "→"),
			h("div", { className: "lm-funnel-step" }, h("h4", null, "冷探索配额 (12%)"), h("span", null, `${data.coldCount || 0} 条`)),
			h("span", { className: "lm-funnel-arrow" }, "→"),
			h("div", { className: "lm-funnel-step" }, h("h4", null, "最终提示词注入"), h("span", { style: { color: "#16a34a" } }, `${data.includedCount || 0} 条`)));

		const table = h("div", { className: "lm-injection-table-pane" },
			h("h3", { style: { margin: "0 0 10px", fontSize: 14 } }, "注入明细与取舍名单"),
			h("div", { style: { display: "flex", flexDirection: "column", gap: 4 } },
				items.map((item, index) => h("div", {
					key: index,
					style: { display: "flex", justifyContent: "space-between", padding: "6px 8px", background: "var(--dsw-alias-bg-layer-1)", borderRadius: 6, fontSize: 12 },
				},
					h("span", { style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "60%" } }, item.title),
					h("span", { className: "lm-status-badge lm-status-" + item.status }, statusText[item.status] || item.status)))));

		const prompt = h("div", { className: "lm-injection-text-pane" },
			h("h3", { style: { margin: "0 0 10px", fontSize: 14 } }, "实际合并注入提示词原文 (带结构高亮)"),
			h("pre", { className: "lm-prompt-preview" }, data.combinedText || "（空）"));

		return h("div", { className: "lm-injection-view" },
			funnel,
			h("div", { className: "lm-injection-split" }, table, prompt));
	}

	// 关系图谱：同心圆星系布局
	function GraphView({ controls, namespace, onJumpEntry, t }) {
		const [report, setReport] = React.useState(null);
		const [selectedNode, setSelectedNode] = React.useState(null);
		const [search, setSearch] = React.useState("");
		const [onlyConnected, setOnlyConnected] = React.useState(true);
		const [zoom, setZoom] = React.useState(1);

		React.useEffect(() => {
			if (!namespace) return;
			controls.getMaintenanceReport({ namespace }).then(setReport).catch(console.error);
		}, [controls, namespace]);

		if (!report || !report.graph) return h("div", { style: { padding: 40, textAlign: "center" } }, t("loading"));

		const edges = report.graph.edges || [];
		const edgeSet = new Set(edges.flatMap(edge => [edge.source, edge.target]));

		let nodes = report.graph.nodes || [];
		if (onlyConnected) nodes = nodes.filter(node => edgeSet.has(node.id) || node.heat > 0);
		if (search) nodes = nodes.filter(node => String(node.title || node.key || "").toLowerCase().includes(search.toLowerCase()));

		const sortedNodes = [...nodes].sort((a, b) => (b.heat || 0) - (a.heat || 0));
		const activeEdges = selectedNode
			? edges.filter(edge => edge.source === selectedNode.id || edge.target === selectedNode.id)
			: [];
		const neighborIds = new Set(activeEdges.flatMap(edge => [edge.source, edge.target]));

		// 同心圆星系布局：热度最高的节点位于核心，其余按环层均匀分布
		const centerX = 400;
		const centerY = 300;
		const perRing = 12;
		const positions = new Map();
		sortedNodes.forEach((node, index) => {
			if (index === 0) {
				positions.set(node.id, { x: centerX, y: centerY });
				return;
			}
			const ring = Math.floor((index - 1) / perRing) + 1;
			const ringIndex = (index - 1) % perRing;
			const angle = (ringIndex / perRing) * Math.PI * 2 + ring * 0.35;
			const radius = ring * 70;
			positions.set(node.id, {
				x: centerX + Math.cos(angle) * radius,
				y: centerY + Math.sin(angle) * radius,
			});
		});

		const canvas = h("svg", { width: "100%", height: "100%", viewBox: "0 0 800 600", style: { transform: `scale(${zoom})`, transformOrigin: "center center" } },
			edges.map((edge, index) => {
				const from = positions.get(edge.source);
				const to = positions.get(edge.target);
				if (!from || !to) return null;
				const highlighted = Boolean(selectedNode) && (edge.source === selectedNode.id || edge.target === selectedNode.id);
				return h("line", {
					key: index,
					x1: from.x,
					y1: from.y,
					x2: to.x,
					y2: to.y,
					stroke: highlighted ? "var(--dsw-state-business-primary, #2563eb)" : "var(--dsw-alias-border-l3)",
					strokeWidth: highlighted ? 2 : 1,
					strokeOpacity: highlighted ? 1 : 0.35,
				});
			}),
			sortedNodes.map(node => {
				const position = positions.get(node.id);
				if (!position) return null;
				const isSelected = Boolean(selectedNode) && selectedNode.id === node.id;
				const isNeighbor = neighborIds.has(node.id);
				const radius = isSelected ? 10 : isNeighbor ? 7 : Math.min(8, 4 + (node.heat || 0));
				return h("g", { key: node.id, onClick: () => setSelectedNode(node), style: { cursor: "pointer" } },
					h("circle", {
						cx: position.x,
						cy: position.y,
						r: radius,
						fill: KIND_COLOR[node.kind] || "#94a3b8",
						stroke: isSelected ? "#ffffff" : "transparent",
						strokeWidth: 2,
					}),
					(isSelected || isNeighbor || node.heat > 0)
						? h("text", { x: position.x + 9, y: position.y + 4, fontSize: 11, fill: "var(--dsw-alias-label-primary)", fontWeight: isSelected ? 600 : 400 }, String(node.title || node.key || "").slice(0, 12))
						: null);
			}));

		const toolbar = h("div", { className: "lm-graph-toolbar" },
			h(Input, { placeholder: "搜索节点…", value: search, onChange: event => setSearch(event.target.value) }),
			h("label", { style: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, cursor: "pointer" } },
				h("input", { type: "checkbox", checked: onlyConnected, onChange: event => setOnlyConnected(event.target.checked) }),
				"仅看有边节点"),
			h("div", { style: { display: "flex", gap: 4 } },
				h(Button, { variant: "outline", size: "sm", onClick: () => setZoom(value => Math.min(2, value + 0.2)) }, "+"),
				h(Button, { variant: "outline", size: "sm", onClick: () => setZoom(value => Math.max(0.5, value - 0.2)) }, "-"),
				h(Button, { variant: "ghost", size: "sm", onClick: () => setZoom(1) }, "重置")),
			h("span", { style: { fontSize: 12, opacity: .7 } }, `${sortedNodes.length} 节点 · ${edges.length} 边`));

		const infoCard = selectedNode
			? h("div", { className: "lm-graph-info-card" },
				h("h3", { style: { margin: "0 0 8px", fontSize: 15 } }, selectedNode.title),
				h("p", { style: { fontSize: 12, color: "var(--dsw-alias-label-secondary)" } }, `类型：${kindText(selectedNode.kind, t)} · 字符：${selectedNode.chars || 0}`),
				h("p", { style: { fontSize: 12, color: "var(--dsw-alias-label-secondary)" } }, `邻居关联数：${neighborIds.size} 项`),
				h(Button, { variant: "primary", size: "sm", onClick: () => onJumpEntry && onJumpEntry({ namespace, kind: selectedNode.kind, key: selectedNode.key }) }, "进入条目编辑"))
			: null;

		return h("div", { className: "lm-graph-view" },
			h("div", { className: "lm-graph-canvas-wrap" }, toolbar, canvas),
			infoCard);
	}

	// 维护驾驶舱：真实数据绑定
	function CockpitView({ controls, namespace, entries, onJumpEntry }) {
		const [metrics, setMetrics] = React.useState(null);
		const [report, setReport] = React.useState(null);
		React.useEffect(() => {
			if (!namespace) return;
			controls.getDiskMetrics({ namespace }).then(setMetrics).catch(console.error);
			controls.getMaintenanceReport({ namespace }).then(setReport).catch(console.error);
		}, [controls, namespace]);

		if (!metrics) return h("div", { className: "lm-cockpit-view" }, "正在读取维护指标…");

		const totalBytes = Number(metrics.size_bytes) || 0;
		const share = value => (totalBytes > 0 ? Math.round((value / totalBytes) * 100) : 0);
		const activeCount = (Number(metrics.rules) || 0) + (Number(metrics.facts) || 0) + (Number(metrics.sops) || 0);
		const archivedCount = Number(metrics.archived) || 0;

		const segments = [
			{ key: "content", label: "正文内容", value: Number(metrics.content_bytes) || 0, color: "#3b82f6" },
			{ key: "history", label: "历史快照", value: Number(metrics.history_bytes) || 0, color: "#a855f7" },
			{ key: "meta", label: "元数据索引", value: Number(metrics.metadata_bytes) || 0, color: "#f59e0b" },
			{ key: "pending", label: "待整理", value: Number(metrics.pending_bytes) || 0, color: "#16a34a" },
		].filter(segment => segment.value > 0);

		const duplicates = [
			...(report?.dedupe?.nearDuplicates || []),
			...(report?.mergeCandidates || []),
		];
		const sideKey = side => (side && typeof side === "object" ? (side.key || side.title || "-") : (side || "-"));
		const coldItems = (entries || []).filter(entry => entry.injectionStatus === "cold" || entry.heat === 0).slice(0, 15);

		const storageCard = h("div", { className: "lm-bento-card lm-bento-span-8" },
			h("h3", null, `磁盘存储构成 · 总量 ${formatBytes(totalBytes)}`),
			h("div", { style: { display: "flex", height: 14, borderRadius: 7, overflow: "hidden", margin: "14px 0 18px", gap: 2 } },
				segments.map(segment => h("div", { key: segment.key, title: segment.label, style: { width: share(segment.value) + "%", background: segment.color } }))),
			h("div", { style: { display: "flex", flexWrap: "wrap", gap: "4px 16px", fontSize: 12, color: "var(--dsw-alias-label-secondary)" } },
				segments.map(segment => h("span", null, `● ${segment.label}: ${formatBytes(segment.value)} (${share(segment.value)}%)`))));

		const activeCard = h("div", { className: "lm-bento-card lm-bento-span-4" },
			h("h3", null, "活跃条目 vs 历史归档"),
			h("div", { style: { fontSize: 24, fontWeight: 600, margin: "8px 0" } }, `${activeCount} 活跃 / ${archivedCount} 归档`),
			h("p", { style: { fontSize: 12, color: "var(--dsw-alias-label-secondary)" } }, `历史快照占 ${share(Number(metrics.history_bytes) || 0)}% 存储空间，由可回滚版本链管理。`));

		const duplicateCard = h("div", { className: "lm-bento-card lm-bento-span-6" },
			h("h3", null, "相似与合并候选 (Near Duplicates)"),
			duplicates.length
				? duplicates.slice(0, 4).map((item, index) => h("div", {
					key: index,
					style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: ".5px solid var(--dsw-alias-border-l3)", fontSize: 12 },
				},
					h("span", { style: { maxWidth: "75%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, `${sideKey(item.a)} ⟷ ${sideKey(item.b)}`),
					h("span", { style: { color: "#f59e0b", fontWeight: 500 } }, `${Math.round((Number(item.similarity ?? item.score) || 0) * 100)}% 相似`)))
				: h("p", { style: { fontSize: 13, color: "var(--dsw-alias-label-caption)", margin: "10px 0" } }, "当前空间无重复或待合并冲突，记忆库状态健康 ✓"));

		const coldCard = h("div", { className: "lm-bento-card lm-bento-span-6" },
			h("h3", null, "冷条目巡检 (低频访问/冷探索)"),
			h("p", { style: { fontSize: 12, margin: "0 0 10px", color: "var(--dsw-alias-label-secondary)" } }, "以下条目进入了探索轮换通道，点击可直接进入检查或归档："),
			h("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" } },
				coldItems.map((item, index) => h("button", {
					key: index,
					type: "button",
					className: "lm-capsule-tag",
					onClick: () => onJumpEntry && onJumpEntry(item.entry),
				}, `❄️ ${item.title}`))));

		return h("div", { className: "lm-cockpit-view" },
			h("h2", { style: { margin: "0 0 16px", fontSize: 18, fontWeight: 600 } }, "记忆系统维护驾驶舱 (Bento Dashboard)"),
			h("div", { className: "lm-bento-grid" }, storageCard, activeCard, duplicateCard, coldCard));
	}

	function MemoryBrowserPage({ controls, t }) {
		const [currentTab, setCurrentTab] = React.useState("entries");
		const [namespaces, setNamespaces] = React.useState([]);
		const [namespace, setNamespace] = React.useState(null);
		const [namespaceBusy, setNamespaceBusy] = React.useState(true);
		const [query, setQuery] = React.useState("");
		const [kind, setKind] = React.useState("");
		const [includeArchived, setIncludeArchived] = React.useState(false);
		const [entries, setEntries] = React.useState([]);
		const [usage, setUsage] = React.useState(null);
		const [listBusy, setListBusy] = React.useState(false);
		const [selectedEntry, setSelectedEntry] = React.useState(null);
		const [detail, setDetail] = React.useState(null);
		const [detailBusy, setDetailBusy] = React.useState(false);
		const [content, setContent] = React.useState("");
		const [evidence, setEvidence] = React.useState("");
		const [contentPreview, setContentPreview] = React.useState(true);
		const [history, setHistory] = React.useState([]);
		const [historyBusy, setHistoryBusy] = React.useState(false);
		const [sortField, setSortField] = React.useState("updatedAt");
		const [sortAsc, setSortAsc] = React.useState(false);
		const [expandedRows, setExpandedRows] = React.useState(new Set());
		const [mobileTab, setMobileTab] = React.useState("list");
		const [createOpen, setCreateOpen] = React.useState(false);
		const [createForm, setCreateForm] = React.useState({ namespace: "", kind: "fact", topic: "", content: "", evidence: "" });
		const [createError, setCreateError] = React.useState(null);
		const [previewSnapshotId, setPreviewSnapshotId] = React.useState(null);
		const [busy, setBusy] = React.useState(null);
		const [notice, setNotice] = React.useState(null);

		const detailScrollRef = React.useRef(null);
		const selectedKey = selectedEntry ? identity(selectedEntry) : "";

		React.useEffect(() => {
			controls.listNamespaces()
				.then(rows => {
					setNamespaces(rows);
					setNamespaceBusy(false);
					setNamespace(current => current || rows[0]?.namespace || "default");
				})
				.catch(() => setNamespaceBusy(false));
		}, [controls]);

		React.useEffect(() => {
			if (!namespace) return;
			setListBusy(true);
			controls.listEntries({ namespace, kind: kind || undefined, query: query || undefined, includeArchived })
				.then(rows => {
					setEntries(rows);
					setListBusy(false);
					setSelectedEntry(current => {
						if (current && current.namespace === namespace) return current;
						return rows[0] ? rows[0].entry : null;
					});
				})
				.catch(() => setListBusy(false));
			controls.namespaceStats({ namespace }).then(setUsage).catch(() => setUsage(null));
		}, [controls, namespace, kind, query, includeArchived]);

		React.useEffect(() => {
			if (!selectedEntry) {
				setDetail(null);
				setHistory([]);
				return;
			}
			setDetailBusy(true);
			controls.readEntry({ entry: selectedEntry })
				.then(value => {
					setDetail(value);
					setContent(value.content);
					setEvidence(value.evidence);
					setDetailBusy(false);
				})
				.catch(() => {
					setDetailBusy(false);
					setDetail(null);
				});
			setHistoryBusy(true);
			controls.entryHistory({ entry: selectedEntry })
				.then(rows => {
					setHistory(rows);
					setHistoryBusy(false);
				})
				.catch(() => setHistoryBusy(false));
		}, [controls, selectedKey]);

		const toggleRowExpand = (id, event) => {
			event.stopPropagation();
			const next = new Set(expandedRows);
			if (next.has(id)) next.delete(id); else next.add(id);
			setExpandedRows(next);
		};

		const handleSort = field => {
			if (sortField === field) setSortAsc(!sortAsc);
			else { setSortField(field); setSortAsc(false); }
		};

		const sortedEntries = [...entries].sort((a, b) => {
			let valueA = a[sortField];
			let valueB = b[sortField];
			if (sortField === "heat") { valueA = a.heat || 0; valueB = b.heat || 0; }
			if (sortField === "updatedAt") { valueA = new Date(valueA || 0).getTime(); valueB = new Date(valueB || 0).getTime(); }
			if (valueA < valueB) return sortAsc ? -1 : 1;
			if (valueA > valueB) return sortAsc ? 1 : -1;
			return 0;
		});

		const refreshEntries = () => controls.listEntries({ namespace, kind: kind || undefined, query: query || undefined, includeArchived })
			.then(rows => { setEntries(rows); return rows; })
			.catch(() => undefined);

		const saveEntry = async () => {
			if (!detail) return;
			setBusy("save");
			try {
				await controls.updateEntry({ entry: detail.entry, content, evidence });
				setNotice(t("saved"));
				const updated = await controls.readEntry({ entry: detail.entry });
				setDetail(updated);
				setContent(updated.content);
			} catch (error) {
				console.error(error);
				setNotice(t("conflict"));
			} finally {
				setBusy(null);
			}
		};

		const toggleArchived = async () => {
			if (!detail) return;
			setBusy("archive");
			try {
				await controls.setArchived({ entry: detail.entry, archived: !detail.archived });
				setNotice(t("archivedDone"));
				const updated = await controls.readEntry({ entry: detail.entry });
				setDetail(updated);
				await refreshEntries();
			} catch (error) {
				console.error(error);
			} finally {
				setBusy(null);
			}
		};

		const rollback = async snapshotId => {
			if (!detail) return;
			setBusy("rollback");
			try {
				await controls.rollbackEntry({ entry: detail.entry, snapshotId });
				setNotice(t("rolledBack"));
				const updated = await controls.readEntry({ entry: detail.entry });
				setDetail(updated);
				setContent(updated.content);
			} catch (error) {
				console.error(error);
			} finally {
				setBusy(null);
			}
		};

		const jumpToEntry = target => {
			if (!target) return;
			setNamespace(target.namespace || namespace);
			setCurrentTab("entries");
			setMobileTab("detail");
			setSelectedEntry({ namespace: target.namespace || namespace, kind: target.kind, key: target.key });
		};

		const handleCreate = async () => {
			setCreateError(null);
			if (!createForm.namespace || !createForm.topic.trim() || !createForm.content.trim() || !createForm.evidence.trim()) {
				setCreateError(t("requiredFields"));
				return;
			}
			setBusy("create");
			try {
				const created = await controls.createEntry(createForm);
				setCreateOpen(false);
				setCreateForm(current => ({ ...current, topic: "", content: "", evidence: "" }));
				setSelectedEntry(created.entry);
				setNotice(t("created"));
			} catch (error) {
				console.error(error);
				setCreateError(String(error?.message || error));
			} finally {
				setBusy(null);
			}
		};

		const statusBadge = row => {
			const status = row.injectionStatus || (row.archived ? "archived" : "included");
			if (status === "rule") return { className: "lm-status-rule", label: "规则" };
			if (status === "cold") return { className: "lm-status-cold", label: "冷探索 🎲" };
			if (status === "omitted") return { className: "lm-status-omitted", label: "已裁剪" };
			if (status === "archived") return { className: "lm-status-archived", label: t("archived") };
			return { className: "lm-status-included", label: "常驻" };
		};

		const renderRow = row => {
			const rowId = identity(row.entry);
			const isExpanded = expandedRows.has(rowId);
			const isSelected = selectedKey === rowId;
			const badge = statusBadge(row);
			return h("li", { key: rowId, className: "lm-browser-row-wrap" + (isSelected ? " is-selected" : "") + (row.archived ? " is-archived" : "") },
				h("div", { className: "lm-table-row-main", onClick: () => { setSelectedEntry(row.entry); setMobileTab("detail"); } },
					h("button", { type: "button", className: "lm-row-expand-btn" + (isExpanded ? " is-open" : ""), onClick: event => toggleRowExpand(rowId, event) }, "›"),
					h("div", { className: "lm-col-title lm-row-title-cell" },
						h("span", { className: "lm-browser-kind-dot lm-browser-kind-dot-" + row.entry.kind }),
						h("span", { className: "lm-row-title-text" }, highlightText(row.title, query))),
					h("span", { className: "lm-col-kind" }, h("span", { className: "lm-browser-kind lm-browser-kind-" + row.entry.kind }, kindText(row.entry.kind, t))),
					h("div", { className: "lm-col-heat lm-heat-cell", title: `热度分: ${row.heat || 0} · 访问: ${row.accessCount || 0}次` },
						h("div", { className: "lm-heat-bar" }, h("div", { className: "lm-heat-fill", style: { width: Math.min(100, (row.heat || 0) * 10) + "%" } })),
						h("span", null, row.heat || 0)),
					h("span", { className: "lm-col-status" }, h("span", { className: "lm-status-badge " + badge.className }, badge.label)),
					h("span", { className: "lm-col-chars lm-chars-cell" }, row.chars),
					h("span", { className: "lm-col-time lm-time-cell" }, time(row.updatedAt))),
				isExpanded ? h("div", { className: "lm-row-expanded-pane" },
					h("div", { className: "lm-row-summary-box" }, highlightText(row.summary || "暂无摘要", query)),
					row.related && row.related.length ? h("div", { className: "lm-row-capsules" },
						h("span", { style: { fontSize: 11, opacity: .6 } }, "关联条目:"),
						row.related.map((rel, index) => h("button", {
							key: index,
							type: "button",
							className: "lm-capsule-tag",
							onClick: () => jumpToEntry({ namespace: rel.namespace || namespace, kind: rel.kind, key: rel.key }),
						}, `🔗 ${rel.key}`))) : null,
					h("div", { className: "lm-row-evidence-preview" }, "证据: " + (row.evidence || "无最新依据"))) : null);
		};

		const detailPane = detail
			? h(React.Fragment, null,
				h(Button, { variant: "outline", size: "sm", className: "lm-detail-back-btn", onClick: () => setMobileTab("list") }, t("backToList")),
				h("div", { id: "sec-meta", className: "lm-browser-detail-heading" },
					h("div", { className: "lm-browser-detail-title" },
						h("h2", null, detail.title),
						detail.archived ? h("span", { className: "lm-browser-kind" }, t("archived")) : null),
					h("div", { className: "lm-browser-detail-actions" },
						notice ? h("span", { style: { color: "#16a34a", fontSize: 12 } }, notice) : null,
						h(Button, { variant: "outline", size: "sm", disabled: Boolean(busy), onClick: toggleArchived }, detail.archived ? t("restore") : t("archive")),
						h(Button, { variant: "primary", size: "sm", disabled: Boolean(busy), onClick: saveEntry }, busy === "save" ? t("saving") : t("save")))),
				h("div", { className: "lm-detail-stats-bar" },
					h("span", null, `${t("heatLabel")}:`, h("strong", null, detail.heat || 0)),
					h("span", null, `${t("accessLabel")}:`, h("strong", null, `${detail.accessCount || 0}次`)),
					detail.sourceSession ? h("span", null, `${t("sourceSession")}:`, h("strong", null, detail.sourceSession)) : null),
				h("dl", { className: "lm-browser-readonly" },
					h("div", null, h("dt", null, "命名空间"), h("dd", null, detail.entry.namespace)),
					h("div", null, h("dt", null, "记忆类型"), h("dd", null, kindText(detail.entry.kind, t))),
					h("div", null, h("dt", null, "条目标识"), h("dd", null, detail.entry.key))),
				detail.related && detail.related.length ? h("div", { style: { marginBottom: 16 } },
					h("span", { style: { fontSize: 12, fontWeight: 500, display: "block", marginBottom: 6 } }, t("relatedCapsules")),
					h("div", { className: "lm-row-capsules" },
						detail.related.map((rel, index) => h("button", {
							key: index,
							type: "button",
							className: "lm-capsule-tag",
							onClick: () => jumpToEntry({ namespace: rel.namespace || namespace, kind: rel.kind, key: rel.key }),
						}, `🔗 ${rel.key}`)))) : null,
				h("div", { id: "sec-content" },
					h(Field, {
						label: h("span", { style: { display: "inline-flex", alignItems: "center", gap: 8 } },
							t("content"),
							h("span", { className: "lm-browser-seg-toggle" },
								h("button", { type: "button", className: "lm-browser-seg-btn" + (contentPreview ? " is-active" : ""), onClick: () => setContentPreview(true) }, t("previewMode")),
								h("button", { type: "button", className: "lm-browser-seg-btn" + (!contentPreview ? " is-active" : ""), onClick: () => setContentPreview(false) }, t("editMode"))))
					},
						contentPreview
							? h("div", { className: "lm-browser-md-preview", onClick: () => setContentPreview(false) }, renderMarkdown(content))
							: h("textarea", { className: "lm-browser-textarea lm-browser-content", value: content, onChange: event => setContent(event.target.value) }),
						detail.entry.kind === "rule" ? h("div", { className: "lm-browser-rule-meter" },
							h("div", { className: "lm-browser-rule-meter-track" },
								h("div", { className: "lm-browser-rule-meter-fill", style: { width: Math.min(100, ruleContentLength(content)) + "%" } })),
							h("span", { className: "lm-browser-rule-length" }, `${ruleContentLength(content)} / 100 字符`)) : null,
					)),
				h("div", { id: "sec-evidence" },
					h(Field, { label: t("evidence") },
						h("textarea", { className: "lm-browser-textarea lm-browser-evidence-textarea", value: evidence, onChange: event => setEvidence(event.target.value) }))),
				h("section", { id: "sec-history", className: "lm-browser-history" },
					h("h3", null, t("history")),
					historyBusy ? h("p", { style: { padding: 12, opacity: .6 } }, t("loading")) : null,
					history.length
						? h("ol", { className: "lm-history-timeline" },
							history.map(snap => h("li", { key: snap.snapshotId, className: "lm-history-node" },
								h("span", { className: "lm-history-dot" }),
								h("div", { className: "lm-history-card" },
									h("div", { className: "lm-history-head" },
										h("div", { className: "lm-history-meta" },
											h("span", { style: { fontWeight: 600 } }, String(snap.revision || "").slice(0, 8)),
											h("span", { style: { color: "var(--dsw-alias-label-tertiary)" } }, time(snap.createdAt))),
										h("span", { className: "lm-history-delta " + ((snap.change?.contentDelta || 0) >= 0 ? "lm-delta-pos" : "lm-delta-neg") }, `${(snap.change?.contentDelta || 0) >= 0 ? "+" : ""}${snap.change?.contentDelta || 0} 字`),
										h("div", { style: { display: "flex", gap: 6 } },
											h(Button, { variant: "ghost", size: "sm", onClick: () => setPreviewSnapshotId(previewSnapshotId === snap.snapshotId ? null : snap.snapshotId) }, t("preview")),
											h(Button, { variant: "ghost", size: "sm", onClick: () => rollback(snap.snapshotId) }, t("rollback")))),
									snap.summary ? h("div", { className: "lm-history-summary" }, snap.summary) : null,
									previewSnapshotId === snap.snapshotId ? h(DiffViewer, { oldText: snap.preview || snap.content, newText: content }) : null))))
						: h("p", { style: { padding: 12, opacity: .6 } }, t("noHistory"))))
			: h("p", { style: { padding: 40, textAlign: "center", opacity: .5 } }, detailBusy ? t("loading") : t("emptyDetail"));

		const entriesPane = h("div", { style: { display: "flex", flexDirection: "column", flex: 1, minWidth: 0, minHeight: 0 } },
			h("div", { className: "lm-browser-entries-toolbar" },
				h("div", { className: "lm-browser-search" },
					h(Input, { type: "search", icon: h(IconSearchOutlineRegular, { size: 14 }), placeholder: t("searchPlaceholder"), value: query, onChange: event => setQuery(event.target.value) })),
				h("div", { className: "lm-browser-filter-tabs" },
					[["", t("all")], ...entryKinds.map(value => [value, kindText(value, t)])].map(([value, label]) => h("button", {
						key: value || "all",
						type: "button",
						className: "lm-browser-filter-tab" + (kind === value ? " is-active" : ""),
						onClick: () => setKind(value),
					}, label, entries.length ? h("span", { className: "lm-browser-tab-count" }, `(${entries.filter(entry => !value || entry.entry.kind === value).length})`) : null))),
				h("label", { className: "lm-browser-archived-toggle" },
					h(Switch, { checked: includeArchived, onChange: setIncludeArchived }),
					h("span", null, t("showArchived")))),
			h("div", { className: "lm-browser-body" + (mobileTab === "detail" ? " show-detail" : " show-list") },
				h("section", { className: "lm-browser-list-pane" },
					h("div", { className: "lm-table-header" },
						h("span", { className: "lm-col-expand" }),
						h("span", { className: "lm-col-title" }, h("button", { type: "button", className: "lm-th-btn", onClick: () => handleSort("title") }, "标题 / 摘要")),
						h("span", { className: "lm-col-kind" }, "类型"),
						h("span", { className: "lm-col-heat" }, h("button", { type: "button", className: "lm-th-btn", onClick: () => handleSort("heat") }, "热度")),
						h("span", { className: "lm-col-status" }, "流态"),
						h("span", { className: "lm-col-chars" }, h("button", { type: "button", className: "lm-th-btn", onClick: () => handleSort("chars") }, "字符")),
						h("span", { className: "lm-col-time" }, h("button", { type: "button", className: "lm-th-btn", onClick: () => handleSort("updatedAt") }, "更新"))),
					listBusy ? h("p", { style: { padding: 20, textAlign: "center", opacity: .6 } }, t("loading")) : null,
					h("ul", { className: "lm-browser-table" }, sortedEntries.map(renderRow))),
				h("article", { className: "lm-browser-detail" },
					h(ScrollProgressPill, { targetRef: detailScrollRef }),
					h("div", { ref: detailScrollRef, className: "lm-browser-detail-scroll" }, detailPane))));

		return h("section", { className: "lm-browser-page", "data-memory-browser": true },
			h("style", null, styles),
			/* 页面公用顶部：四个 Tab 共用标题、命名空间、导航与预算仪表 */
			h("header", { className: "lm-browser-header-sticky" },
				h("div", { className: "lm-browser-top-row" },
					h("div", { className: "lm-browser-top-left" },
						h("h1", null, t("title")),
						h("div", { className: "lm-browser-namespace-select" },
							h(SelectMenu, {
								value: namespace || "",
								options: namespaces.map(row => ({ value: row.namespace, label: row.namespace })),
								disabled: namespaceBusy,
								onChange: setNamespace,
								ariaLabel: t("namespace"),
							}))),
					h("div", { className: "lm-browser-top-actions" },
						h(Button, { variant: "primary", size: "sm", icon: h(IconPlusOutlineRegular, { size: 13 }), disabled: !namespaces.length, onClick: () => { setCreateError(null); setCreateOpen(true); } }, t("newEntry")))),
				h("div", { className: "lm-bounce-nav-bar" },
					h(BounceNav, { currentTab, onSelect: setCurrentTab, t })),
				h(IndexUsage, { stats: usage, t, kind, onKindChange: setKind })),
			/* 工作台主体 */
			h("div", { className: "lm-browser-content-area" },
				currentTab === "injection" ? h(InjectionView, { controls, namespace, t }) : null,
				currentTab === "graph" ? h(GraphView, { controls, namespace, onJumpEntry: jumpToEntry, t }) : null,
				currentTab === "cockpit" ? h(CockpitView, { controls, namespace, entries, onJumpEntry: jumpToEntry }) : null,
				currentTab === "entries" ? entriesPane : null),
			h(CreateDialog, {
				open: createOpen,
				form: createForm,
				setForm: setCreateForm,
				namespaces,
				busy: busy === "create",
				error: createError,
				onClose: () => setCreateOpen(false),
				onSubmit: handleCreate,
				t,
			}));
	}

	return {
		inject: ["remote"],
		async apply(ctx) {
			const ui = ctx.inject(["remote.layeredMemoryStatus", "slots", "locale"], scope => {
				scope.effect(() => scope.locale.register(locale, dictionaries), "memory-browser: locale");
				const controls = {
					listNamespaces: () => resultValue(scope.remote.layeredMemoryStatus.listNamespaces()),
					namespaceStats: req => resultValue(scope.remote.layeredMemoryStatus.namespaceStats(req)),
					listEntries: req => resultValue(scope.remote.layeredMemoryStatus.listEntries(req)),
					readEntry: req => resultValue(scope.remote.layeredMemoryStatus.readEntry(req)),
					createEntry: req => resultValue(scope.remote.layeredMemoryStatus.createEntry(req)),
					updateEntry: req => resultValue(scope.remote.layeredMemoryStatus.updateEntry(req)),
					setArchived: req => resultValue(scope.remote.layeredMemoryStatus.setArchived(req)),
					entryHistory: req => resultValue(scope.remote.layeredMemoryStatus.entryHistory(req)),
					rollbackEntry: req => resultValue(scope.remote.layeredMemoryStatus.rollbackEntry(req)),
					getInjectionState: req => resultValue(scope.remote.layeredMemoryStatus.getInjectionState(req)),
					getDiskMetrics: req => resultValue(scope.remote.layeredMemoryStatus.getDiskMetrics(req)),
					getMaintenanceReport: req => resultValue(scope.remote.layeredMemoryStatus.getMaintenanceReport(req)),
				};
				scope.slots.inject("main", () => scope.slots.register({ name: "main", key: "layered-memory", locale, inject: () => ({ controls }) }, MemoryBrowserPage));
				scope.slots.inject("sidebar.panellist", () => scope.slots.register({ name: "sidebar.panellist", id: "layered-memory", order: 20, locale, label: () => scope.locale.translate(locale, "title") }, MemoryBrowserIcon));
			});
			try { await ui; }
			catch (error) { await ui.dispose(); throw error; }
			return async () => { await ui.dispose(); };
		},
	};
}

const statusClient = createStatusClient(require,"/* Match ui-chat's StatsPills and stat-dialog; controls come from ui-primitives. */\n.lm-status-seat {\n\tdisplay: inline-flex;\n\talign-items: center;\n\tflex: 0 1 auto;\n\tmin-width: 0;\n\tmax-width: min(240px, 35vw);\n\tfont-size: calc(var(--dsh-content-font-size-secondary, 13px) - 1px);\n\tline-height: calc(20px + var(--dsh-content-font-delta-secondary, 0px));\n}\n.lm-status-line {\n\tdisplay: inline-flex;\n\talign-items: center;\n\tgap: 6px;\n\tbox-sizing: border-box;\n\tmin-width: 0;\n\tmax-width: 100%;\n\tpadding: 1px 8px;\n\tborder: 0;\n\tborder-radius: var(--dsw-radius-sm);\n\tbackground: transparent;\n\tcolor: var(--dsw-alias-label-tertiary);\n\tfont: inherit;\n\tfont-variant-numeric: tabular-nums;\n\tline-height: inherit;\n\twhite-space: nowrap;\n\ttext-align: left;\n}\nbutton.lm-status-line { cursor: pointer; }\nbutton.lm-status-line:hover,\nbutton.lm-status-line[aria-expanded=\"true\"] {\n\tbackground: var(--dsw-alias-interactive-bg-hover);\n\tcolor: var(--dsw-alias-label-secondary);\n}\nbutton.lm-status-line:focus-visible,\n.lm-activity-panel summary:focus-visible {\n\toutline: var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color);\n\toutline-offset: -2px;\n}\n.lm-status-glyph { width: 14px; height: 14px; flex: none; }\n.lm-status-text {\n\tmin-width: 0;\n\toverflow: hidden;\n\ttext-overflow: ellipsis;\n\tbackground: linear-gradient(105deg, #b78535, #aa79bd);\n\tbackground-clip: text;\n\t-webkit-background-clip: text;\n\tcolor: transparent;\n}\n.lm-status-seat:is([data-memory-status=\"idle\"], [data-memory-status=\"loading\"], [data-memory-status=\"stopped\"]) .lm-status-text,\n.lm-status-line.is-failed .lm-status-text { background: none; color: inherit; }\n.lm-status-failure { flex: none; color: var(--dsw-alias-state-error-primary); }\n.lm-status-line.is-running .lm-status-glyph { animation: lm-status-pulse 1.8s ease-in-out infinite; }\n@keyframes lm-status-pulse { 0%, 100% { opacity: .5; } 50% { opacity: 1; } }\n@media (prefers-reduced-motion: reduce) { .lm-status-line.is-running .lm-status-glyph { animation: none; } }\n\n.lm-activity-panel {\n\tposition: fixed;\n\tz-index: 1100;\n\tdisplay: flex;\n\tflex-direction: column;\n\tbox-sizing: border-box;\n\twidth: max-content;\n\tmin-width: min(300px, calc(100vw - 24px));\n\tmax-width: min(440px, calc(100vw - 24px));\n\tmax-height: min(560px, calc(100dvh - 72px));\n\tmargin: 0;\n\tpadding: 16px;\n\tborder: 0;\n\tborder-radius: var(--dsw-radius-lg);\n\tbackground: var(--dsw-specific-menu);\n\tbackdrop-filter: var(--dsw-menu-backdrop-filter);\n\t--dsw-elevation-stroke-color: var(--dsw-alias-border-l1);\n\tbox-shadow: var(--dsw-elevation-prominent);\n\tfont: inherit;\n\tfont-size: 12px;\n\tline-height: 18px;\n\tcolor: var(--dsw-alias-label-secondary);\n\ttext-align: left;\n\tcursor: default;\n\toverflow: hidden;\n}\n.lm-activity-heading {\n\tdisplay: flex;\n\talign-items: center;\n\tjustify-content: space-between;\n\tflex: none;\n\tgap: 16px;\n\tmin-height: 20px;\n\tmargin-bottom: 8px;\n\tcolor: var(--dsw-alias-label-primary);\n\tfont-weight: 500;\n}\n.lm-activity-title { display: inline-flex; align-items: center; gap: 6px; min-width: 0; }\n.lm-activity-rule { flex: none; margin-bottom: 10px; border-top: .5px solid var(--dsw-alias-border-l2); }\n.lm-activity-tabs { flex: none; align-self: stretch; margin-bottom: 12px; }\n.lm-activity-body { display: flex; flex-direction: column; min-height: 0; }\n.lm-activity-content { min-height: 0; overflow: auto; overscroll-behavior: contain; }\n.lm-activity-content h3 { margin: 0 0 8px; font: inherit; font-weight: 500; color: var(--dsw-alias-label-primary); }\n.lm-current-runs { margin-bottom: 16px; }\n.lm-current-run { padding: 10px; border: .5px solid var(--dsw-alias-border-l2); border-radius: var(--dsw-radius-md); }\n.lm-current-run + .lm-current-run { margin-top: 8px; }\n.lm-run-heading { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }\n.lm-run-heading strong { font-weight: 500; color: var(--dsw-alias-label-primary); }\n.lm-run-state { color: var(--dsw-alias-label-tertiary); }\n.lm-run-state[data-state=\"failed\"],\n.lm-run-state[data-state=\"deferred\"] { color: var(--dsw-alias-state-error-primary); }\n.lm-stop { margin-left: auto; }\n.lm-run-counts { display: flex; flex-wrap: wrap; gap: 6px 16px; margin-top: 8px; color: var(--dsw-alias-label-tertiary); font-variant-numeric: tabular-nums; }\n.lm-run-summary { margin: 8px 0 0; white-space: pre-wrap; overflow-wrap: anywhere; }\n.lm-finished-run { padding: 10px 0; border-bottom: .5px solid var(--dsw-alias-border-l2); }\n.lm-finished-run:first-child { padding-top: 0; }\n.lm-finished-run:last-child { border-bottom: 0; padding-bottom: 0; }\n.lm-finished-run > summary { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; cursor: pointer; list-style: none; }\n.lm-finished-run > summary::before { content: \"›\"; color: var(--dsw-alias-label-tertiary); }\n.lm-finished-run[open] > summary::before { transform: rotate(90deg); }\n.lm-finished-run time,\n.lm-history time { margin-left: auto; font-size: 11px; line-height: 16px; font-variant-numeric: tabular-nums; color: var(--dsw-alias-label-tertiary); }\n.lm-legacy { padding: 0 4px; border-radius: var(--dsw-radius-xs); background: var(--dsw-alias-interactive-bg-hover); font-size: 11px; line-height: 16px; color: var(--dsw-alias-label-tertiary); }\n.lm-history-heading { display: flex; align-items: center; gap: 8px; flex: none; margin-bottom: 8px; color: var(--dsw-alias-label-tertiary); }\n.lm-history-heading button:not(.lm-stop) { margin-left: auto; }\n.lm-activity-panel .lm-history-older { display: block; margin: 0 auto 10px; }\n.lm-history-message { margin-bottom: 16px; }\n.lm-history-label,\n.lm-history-event > summary { display: flex; align-items: center; gap: 6px; color: var(--dsw-alias-label-tertiary); }\n.lm-history-event { margin: 8px 0; padding: 8px; border-radius: var(--dsw-radius-sm); background: var(--dsw-alias-interactive-bg-hover); }\n.lm-history-event > summary { cursor: pointer; }\n.lm-history-body { margin: 6px 0 0; white-space: pre-wrap; overflow-wrap: anywhere; font: inherit; }\n.lm-activity-empty { margin: 4px 0; color: var(--dsw-alias-label-tertiary); }\n.lm-activity-error { margin: 8px 0; color: var(--dsw-alias-state-error-primary); white-space: pre-wrap; overflow-wrap: anywhere; }\n");
const memoryBrowserClient = createMemoryBrowserClient(require,".lm-browser-page {\n\tbox-sizing: border-box;\n\twidth: 100%;\n\theight: 100%;\n\tmin-width: 0;\n\tmin-height: 0;\n\tdisplay: flex;\n\tflex-direction: column;\n\toverflow: hidden;\n\tcolor: var(--dsw-alias-label-primary);\n\tbackground: var(--dsw-alias-bg-base);\n\tfont-size: 14px;\n\tline-height: 1.6;\n}\n.lm-browser-page *, .lm-browser-page *::before, .lm-browser-page *::after { box-sizing: border-box; }\n\n/* 页面公用顶部：标题 + 命名空间 + 新建 + BounceNav */\n.lm-browser-header-sticky {\n\tflex: none;\n\tdisplay: flex;\n\tflex-direction: column;\n\tbackground: var(--dsw-alias-bg-base);\n\tborder-bottom: .5px solid var(--dsw-alias-border-l3);\n\tz-index: 20;\n}\n.lm-browser-top-row {\n\tdisplay: flex;\n\talign-items: center;\n\tjustify-content: space-between;\n\tgap: 16px;\n\tpadding: 16px clamp(16px, 3vw, 36px) 10px;\n}\n.lm-browser-top-left {\n\tdisplay: flex;\n\talign-items: center;\n\tgap: 14px;\n\tmin-width: 0;\n\tflex: 1;\n}\n.lm-browser-top-left h1 {\n\tmargin: 0;\n\tfont-size: 19px;\n\tfont-weight: 600;\n\tline-height: 26px;\n\twhite-space: nowrap;\n}\n.lm-browser-namespace-select {\n\twidth: 180px;\n\tflex: none;\n}\n.lm-browser-top-actions {\n\tdisplay: flex;\n\talign-items: center;\n\tgap: 10px;\n\tflex: none;\n}\n\n/* BounceNav 弹性导航栏：高对比度修复 (Bug 1) */\n.lm-bounce-nav-bar {\n\tdisplay: flex;\n\talign-items: center;\n\tpadding: 0 clamp(16px, 3vw, 36px) 10px;\n}\n.lm-bounce-tabs {\n\tposition: relative;\n\tdisplay: inline-flex;\n\talign-items: center;\n\tbackground: var(--dsw-alias-bg-layer-1);\n\tborder: .5px solid var(--dsw-alias-border-l3);\n\tborder-radius: 20px;\n\tpadding: 3px;\n\tgap: 2px;\n}\n.lm-bounce-pill {\n\tposition: absolute;\n\ttop: 3px;\n\tbottom: 3px;\n\tleft: 0;\n\tborder-radius: 16px;\n\tbackground: var(--dsw-alias-state-business-primary, var(--dsw-static-blue-450, #2563eb));\n\tbox-shadow: 0 2px 6px rgba(0,0,0,.2);\n\ttransition: transform .32s cubic-bezier(0.34, 1.56, 0.64, 1), width .2s ease;\n\tpointer-events: none;\n\tz-index: 1;\n}\n.lm-bounce-tab {\n\tposition: relative;\n\tz-index: 2;\n\tdisplay: inline-flex;\n\talign-items: center;\n\tjustify-content: center;\n\tpadding: 6px 16px;\n\tborder: 0;\n\tborder-radius: 16px;\n\tbackground: transparent;\n\tcolor: var(--dsw-alias-label-secondary);\n\tfont: inherit;\n\tfont-size: 13px;\n\tfont-weight: 500;\n\tcursor: pointer;\n\ttransition: color .2s ease;\n\twhite-space: nowrap;\n}\n.lm-bounce-tab:hover { color: var(--dsw-alias-label-primary); }\n.lm-bounce-tab.is-active { color: #ffffff !important; font-weight: 600; text-shadow: 0 1px 2px rgba(0,0,0,.25); }\n\n/* 公用预算水位仪表 (Bug 2: 全 Tab 共享) */\n.lm-browser-usage-wrap {\n\tflex: none;\n\tpadding: 0 clamp(16px, 3vw, 36px) 10px;\n}\n.lm-usage-summary {\n\tbox-sizing: border-box;\n\tdisplay: flex;\n\talign-items: center;\n\tgap: 10px;\n\twidth: 100%;\n\tpadding: 6px 12px;\n\tbackground: var(--dsw-alias-bg-layer-1);\n\tborder: .5px solid var(--dsw-alias-border-l3);\n\tborder-radius: 10px;\n\tcolor: inherit;\n\tfont: inherit;\n\ttext-align: left;\n\tcursor: pointer;\n}\n.lm-usage-summary:hover { background: var(--dsw-alias-interactive-bg-hover); }\n.lm-usage-ring-wrap { width: 22px; height: 22px; flex: none; display: flex; align-items: center; justify-content: center; }\n.lm-usage-ring { width: 100%; height: 100%; transform: rotate(-90deg); }\n.lm-usage-ring-bg { fill: none; stroke: var(--dsw-alias-border-l3); stroke-width: 4; }\n.lm-usage-ring-fill { fill: none; stroke: var(--dsw-static-blue-450, #3b82f6); stroke-width: 4; stroke-linecap: round; transition: stroke-dasharray .3s ease; }\n.lm-usage-ring-fill.is-near { stroke: var(--dsw-alias-state-warn-primary, #eab308); }\n.lm-usage-ring-fill.is-over { stroke: var(--dsw-alias-state-error-primary, #ef4444); }\n.lm-usage-label { flex: none; color: var(--dsw-alias-label-tertiary); font-size: 12px; font-weight: 500; }\n.lm-usage-percent { flex: none; font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums; }\n.lm-usage-percent.is-over { color: var(--dsw-alias-state-error-primary); }\n.lm-usage-bar { flex: 1 1 auto; display: flex; gap: 1px; height: 5px; min-width: 80px; overflow: hidden; border-radius: 999px; background: var(--dsw-alias-interactive-bg-hover); }\n.lm-usage-segment { flex: none; min-width: 2px; height: 100%; border-radius: 1px; background: var(--meter-tint, var(--dsw-alias-label-tertiary)); transition: opacity .12s ease; }\n.lm-usage-segment.is-dim { opacity: .28; }\n.lm-usage-figures { flex: none; color: var(--dsw-alias-label-tertiary); font-size: 12px; font-variant-numeric: tabular-nums; }\n.lm-usage-chevron { flex: none; color: var(--dsw-alias-label-tertiary); transition: transform .16s ease; }\n.lm-browser-usage-wrap.is-open .lm-usage-chevron { transform: rotate(180deg); }\n.lm-usage-detail { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .18s ease; }\n.lm-browser-usage-wrap.is-open .lm-usage-detail { grid-template-rows: 1fr; }\n.lm-usage-detail-inner { min-height: 0; overflow: hidden; }\n.lm-usage-status-line { margin: 8px 0 4px; font-size: 12px; }\n.lm-usage-trigger-hint { color: var(--dsw-alias-label-secondary); background: var(--dsw-alias-bg-base); padding: 3px 8px; border-radius: 6px; border: .5px solid var(--dsw-alias-border-l3); }\n.lm-usage-trigger-hint.is-triggered { color: var(--dsw-alias-state-warn-primary, #eab308); font-weight: 600; }\n.lm-usage-legend { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 18px; padding-top: 6px; color: var(--dsw-alias-label-tertiary); font-size: 12px; }\n.lm-usage-legend-wrap { display: inline-flex; }\n.lm-usage-legend-item { display: inline-flex; align-items: center; gap: 5px; cursor: default; }\n.lm-usage-swatch { display: inline-block; width: 8px; height: 8px; border-radius: 2px; background: var(--meter-tint); }\n.lm-usage-legend-label { color: var(--dsw-alias-label-secondary); }\n.lm-usage-legend-chars { color: var(--dsw-alias-label-tertiary); font-variant-numeric: tabular-nums; }\n.lm-usage-legend-item.is-clickable { appearance: none; padding: 2px 8px; border: 0; border-radius: 10px; background: transparent; color: inherit; font: inherit; font-size: 12px; cursor: pointer; }\n.lm-usage-legend-item.is-clickable:hover { background: var(--dsw-alias-interactive-bg-hover); }\n.lm-usage-legend-item.is-clickable.is-active { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-interactive-bg-hover); font-weight: 600; }\n.lm-usage-color-head { --meter-tint: var(--dsw-static-neutral-bluish-400, #94a3b8); }\n.lm-usage-color-rules { --meter-tint: var(--dsw-static-violet-400, #a855f7); }\n.lm-usage-color-facts { --meter-tint: var(--dsw-static-blue-450, #3b82f6); }\n.lm-usage-color-sops { --meter-tint: #b78535; }\n\n/* 条目表格工具栏（仅在 entries 视图） */\n.lm-browser-entries-toolbar {\n\tflex: none;\n\tdisplay: flex;\n\tflex-wrap: wrap;\n\talign-items: center;\n\tgap: 8px 12px;\n\tpadding: 8px clamp(16px, 3vw, 36px) 12px;\n\tbackground: var(--dsw-alias-bg-base);\n}\n.lm-browser-search { display: flex; align-items: center; flex: 1 1 200px; min-width: 150px; height: 34px; padding: 0 10px; border: .5px solid var(--dsw-alias-border-l3); border-radius: 10px; color: var(--dsw-alias-label-tertiary); transition: border-color .15s; }\n.lm-browser-search:hover { border-color: var(--dsw-alias-border-l2); }\n.lm-browser-search:focus-within { border-color: var(--dsw-alias-state-business-primary); }\n.lm-browser-search > :first-child { flex: 1; min-width: 0; height: 100%; padding: 0; border: 0; background: transparent; }\n.lm-browser-search input::placeholder { color: var(--dsw-alias-label-caption); }\n.lm-browser-search input:focus-visible { outline: none; }\n.lm-browser-search-clear { flex: none; width: 24px; height: 24px; padding: 0; }\n.lm-browser-filter-tabs { display: flex; flex: none; flex-wrap: wrap; align-items: center; gap: 4px; }\n.lm-browser-filter-tab { display: inline-flex; align-items: center; gap: 4px; height: 28px; padding: 0 10px; border: 0; border-radius: 14px; color: var(--dsw-alias-label-tertiary); background: transparent; font: inherit; font-size: 13px; cursor: pointer; }\n.lm-browser-filter-tab:hover { background: var(--dsw-alias-interactive-bg-hover); }\n.lm-browser-filter-tab.is-active { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-interactive-bg-hover); font-weight: 600; }\n.lm-browser-tab-count { font-size: 11px; opacity: .75; font-variant-numeric: tabular-nums; }\n.lm-browser-archived-toggle { display: inline-flex; align-items: center; gap: 6px; flex: none; color: var(--dsw-alias-label-secondary); font-size: 13px; cursor: pointer; }\n\n/* 页面内容区与表格分栏 */\n.lm-browser-content-area { flex: 1; min-width: 0; min-height: 0; display: flex; overflow: hidden; }\n.lm-browser-body { display: flex; flex: 1; min-width: 0; min-height: 0; }\n.lm-browser-list-pane { flex: 0 0 52%; min-width: 320px; min-height: 0; overflow: auto; padding: 10px clamp(12px, 2vw, 24px) 32px; scrollbar-gutter: stable; }\n\n/* Advanced Data Table */\n.lm-table-header { display: flex; align-items: center; padding: 8px 10px; border-bottom: 1.5px solid var(--dsw-alias-border-l2); color: var(--dsw-alias-label-tertiary); font-size: 12px; font-weight: 600; }\n.lm-th-btn { display: inline-flex; align-items: center; gap: 4px; border: 0; background: transparent; color: inherit; font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; padding: 2px 4px; border-radius: 4px; }\n.lm-th-btn:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }\n.lm-col-expand { width: 28px; flex: none; }\n.lm-col-title { flex: 1 1 180px; min-width: 120px; }\n.lm-col-kind { width: 68px; flex: none; text-align: center; }\n.lm-col-heat { width: 75px; flex: none; text-align: right; }\n.lm-col-status { width: 75px; flex: none; text-align: center; }\n.lm-col-chars { width: 65px; flex: none; text-align: right; }\n.lm-col-time { width: 75px; flex: none; text-align: right; }\n\n.lm-browser-table { display: flex; flex-direction: column; gap: 3px; margin: 4px 0 0; padding: 0; list-style: none; }\n.lm-browser-row-wrap { display: flex; flex-direction: column; border-radius: 10px; border: .5px solid transparent; transition: background .12s; }\n.lm-browser-row-wrap:hover { background: var(--dsw-alias-interactive-bg-hover); }\n.lm-browser-row-wrap.is-selected { background: var(--dsw-alias-interactive-bg-active); border-color: var(--dsw-alias-border-l3); }\n.lm-browser-row-wrap.is-archived { opacity: .65; }\n\n.lm-table-row-main { display: flex; align-items: center; width: 100%; padding: 8px 10px; cursor: pointer; text-align: left; background: transparent; border: 0; font: inherit; color: inherit; }\n.lm-row-expand-btn { width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; border: 0; background: transparent; color: var(--dsw-alias-label-tertiary); border-radius: 4px; cursor: pointer; transition: transform .16s; font-size: 14px; }\n.lm-row-expand-btn:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }\n.lm-row-expand-btn.is-open { transform: rotate(90deg); }\n\n.lm-row-title-cell { display: flex; align-items: center; gap: 6px; overflow: hidden; min-width: 0; }\n.lm-row-title-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 500; font-size: 13px; }\n.lm-highlight-match { background: rgba(234, 179, 8, 0.35); color: inherit; padding: 0 1px; border-radius: 2px; }\n\n/* 类型色点与徽标 */\n.lm-browser-kind-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; flex: none; }\n.lm-browser-kind-dot-rule { background: var(--dsw-static-violet-400, #a855f7); }\n.lm-browser-kind-dot-fact { background: var(--dsw-static-blue-450, #3b82f6); }\n.lm-browser-kind-dot-sop { background: #b78535; }\n.lm-browser-kind { display: inline-flex; align-items: center; justify-content: center; height: 20px; padding: 0 6px; border-radius: 10px; font-size: 11px; font-weight: 500; white-space: nowrap; }\n.lm-browser-kind-rule { background: rgba(168, 85, 247, 0.14); color: var(--dsw-static-violet-400, #a855f7); border: .5px solid rgba(168, 85, 247, 0.3); }\n.lm-browser-kind-fact { background: rgba(59, 130, 246, 0.14); color: var(--dsw-static-blue-450, #3b82f6); border: .5px solid rgba(59, 130, 246, 0.3); }\n.lm-browser-kind-sop { background: rgba(183, 133, 53, 0.14); color: #b78535; border: .5px solid rgba(183, 133, 53, 0.3); }\n\n/* 热度微条与流态 */\n.lm-heat-cell { display: flex; align-items: center; justify-content: flex-end; gap: 4px; font-size: 11px; font-variant-numeric: tabular-nums; }\n.lm-heat-bar { width: 32px; height: 4px; background: var(--dsw-alias-interactive-bg-hover); border-radius: 2px; overflow: hidden; }\n.lm-heat-fill { height: 100%; background: #f97316; border-radius: 2px; }\n.lm-status-badge { display: inline-flex; align-items: center; justify-content: center; padding: 1px 5px; border-radius: 4px; font-size: 11px; white-space: nowrap; }\n.lm-status-rule { background: rgba(168, 85, 247, 0.12); color: #a855f7; }\n.lm-status-included { background: rgba(34, 197, 94, 0.12); color: #16a34a; }\n.lm-status-cold { background: rgba(59, 130, 246, 0.12); color: #2563eb; }\n.lm-status-omitted { background: rgba(239, 68, 68, 0.12); color: #dc2626; text-decoration: line-through; }\n.lm-status-archived { background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-caption); }\n.lm-chars-cell, .lm-time-cell { font-size: 11.5px; color: var(--dsw-alias-label-tertiary); font-variant-numeric: tabular-nums; white-space: nowrap; text-align: right; }\n\n/* 行内展开详情 */\n.lm-row-expanded-pane { padding: 10px 14px 14px 38px; border-top: .5px solid var(--dsw-alias-border-l3); font-size: 13px; background: var(--dsw-alias-bg-layer-1); border-radius: 0 0 10px 10px; }\n.lm-row-summary-box { color: var(--dsw-alias-label-secondary); margin-bottom: 8px; line-height: 1.5; font-size: 12.5px; }\n.lm-row-capsules { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-bottom: 8px; }\n.lm-capsule-tag { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 12px; font-size: 11px; background: var(--dsw-alias-bg-base); border: .5px solid var(--dsw-alias-border-l3); color: var(--dsw-alias-label-secondary); cursor: pointer; }\n.lm-capsule-tag:hover { border-color: var(--dsw-alias-state-business-primary); color: var(--dsw-alias-state-business-primary); }\n.lm-row-evidence-preview { font-size: 11.5px; color: var(--dsw-alias-label-caption); font-family: var(--dsh-font-family-mono, monospace); white-space: pre-wrap; overflow-wrap: anywhere; max-height: 80px; overflow: auto; padding: 6px 8px; background: var(--dsw-alias-bg-base); border-radius: 6px; }\n\n/* 右侧详情栏 */\n.lm-browser-detail { display: flex; flex: 1; flex-direction: column; min-width: 0; min-height: 0; border-left: .5px solid var(--dsw-alias-border-l3); position: relative; }\n.lm-browser-detail-scroll { flex: 1; min-height: 0; overflow: auto; padding: 20px clamp(16px, 2.5vw, 32px) 36px; scrollbar-gutter: stable; }\n.lm-detail-back-btn { display: none; align-items: center; gap: 4px; margin-bottom: 12px; }\n.lm-browser-detail-heading { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px 12px; margin-bottom: 14px; }\n.lm-browser-detail-title { display: flex; flex: 1 1 auto; align-items: center; gap: 10px; min-width: 0; }\n.lm-browser-detail-title h2 { flex: 1; min-width: 0; margin: 0; overflow-wrap: anywhere; font-size: 18px; font-weight: 600; line-height: 26px; }\n.lm-browser-detail-actions { display: flex; flex: none; align-items: center; gap: 8px; }\n\n.lm-browser-readonly { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin: 0 0 16px; padding: 10px 12px; background: var(--dsw-alias-bg-layer-1); border-radius: 10px; }\n.lm-browser-readonly dt { color: var(--dsw-alias-label-tertiary); font-size: 11.5px; }\n.lm-browser-readonly dd { margin: 2px 0 0; color: var(--dsw-alias-label-primary); font-size: 12px; font-weight: 500; font-family: var(--dsh-font-family-mono, monospace); overflow-wrap: anywhere; }\n\n.lm-detail-stats-bar { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; padding: 8px 12px; margin-bottom: 16px; background: var(--dsw-alias-bg-layer-1); border-radius: 8px; font-size: 12px; color: var(--dsw-alias-label-secondary); }\n.lm-detail-stats-bar strong { color: var(--dsw-alias-label-primary); margin-left: 3px; }\n\n/* Markdown 预览与段落切换 */\n.lm-browser-seg-toggle { display: inline-flex; overflow: hidden; border: .5px solid var(--dsw-alias-border-l3); border-radius: 8px; }\n.lm-browser-seg-btn { height: 24px; padding: 0 8px; border: 0; background: transparent; color: var(--dsw-alias-label-tertiary); font: inherit; font-size: 11.5px; cursor: pointer; }\n.lm-browser-seg-btn:hover { background: var(--dsw-alias-interactive-bg-hover); }\n.lm-browser-seg-btn.is-active { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-interactive-bg-hover); font-weight: 600; }\n.lm-browser-md-preview { min-height: 180px; max-height: 480px; overflow: auto; padding: 12px 14px; border: .5px solid var(--dsw-alias-border-l3); border-radius: 12px; background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-primary); font-size: 13.5px; line-height: 1.7; }\n.lm-browser-md-preview h1, .lm-browser-md-preview h2, .lm-browser-md-preview h3 { margin: 12px 0 6px; font-weight: 600; }\n.lm-browser-md-preview p { margin: 6px 0; }\n.lm-browser-md-preview code { padding: 1px 4px; border-radius: 4px; background: var(--dsw-alias-bg-layer-1); font-family: var(--dsh-font-family-mono, monospace); font-size: 12.5px; }\n\n.lm-browser-field { display: flex; flex-direction: column; gap: 7px; min-width: 0; margin-bottom: 16px; }\n.lm-browser-field-label { color: var(--dsw-alias-label-secondary); font-size: 13px; font-weight: 500; }\n.lm-browser-textarea { display: block; width: 100%; max-width: 100%; min-height: 112px; margin: 0; padding: 10px 12px; border: .5px solid var(--dsw-alias-border-l3); border-radius: 12px; outline: 0; resize: vertical; color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-base); font: inherit; font-size: 13px; line-height: 22px; transition: border-color .15s; }\n.lm-browser-textarea:focus { border-color: var(--dsw-alias-state-business-primary); }\n.lm-browser-content { min-height: 220px; font-family: var(--dsh-font-family-mono, monospace); }\n.lm-browser-evidence-textarea { min-height: 72px; max-height: 160px; font-family: var(--dsh-font-family-mono, monospace); font-size: 12.5px; }\n\n/* 规则 100 字符动态计量条 */\n.lm-browser-rule-meter { display: flex; flex-direction: column; gap: 4px; width: 100%; margin-top: 4px; }\n.lm-browser-rule-meter-track { width: 100%; height: 4px; background: var(--dsw-alias-bg-layer-1); border-radius: 2px; overflow: hidden; }\n.lm-browser-rule-meter-fill { height: 100%; background: var(--dsw-static-violet-400, #a855f7); transition: width .2s ease; }\n.lm-browser-rule-meter.is-near .lm-browser-rule-meter-fill { background: var(--dsw-alias-state-warn-primary, #eab308); }\n.lm-browser-rule-meter.is-over .lm-browser-rule-meter-fill { background: var(--dsw-alias-state-error-primary, #ef4444); }\n.lm-browser-rule-length { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 10px; color: var(--dsw-alias-label-tertiary); font-size: 12px; }\n\n/* Scroll Progress Pill (Component Hunt 形态三) */\n.lm-scroll-pill-wrap {\n\tposition: absolute;\n\tright: 18px;\n\tbottom: 24px;\n\tz-index: 50;\n\tdisplay: flex;\n\tflex-direction: column;\n\talign-items: flex-end;\n}\n.lm-scroll-pill {\n\tdisplay: inline-flex;\n\talign-items: center;\n\tgap: 6px;\n\tpadding: 6px 12px;\n\tborder-radius: 20px;\n\tbackground: var(--dsw-alias-bg-base);\n\tborder: .5px solid var(--dsw-alias-border-l2);\n\tbox-shadow: 0 4px 16px rgba(0,0,0,.15);\n\tcolor: var(--dsw-alias-label-primary);\n\tfont-size: 12px;\n\tfont-weight: 600;\n\tcursor: pointer;\n\ttransition: transform .2s ease;\n}\n.lm-scroll-pill:hover { transform: translateY(-2px); }\n.lm-scroll-ring-svg { width: 14px; height: 14px; transform: rotate(-90deg); }\n.lm-scroll-menu {\n\tdisplay: flex;\n\tflex-direction: column;\n\tgap: 4px;\n\tmargin-bottom: 8px;\n\tpadding: 6px;\n\tbackground: var(--dsw-alias-bg-base);\n\tborder: .5px solid var(--dsw-alias-border-l2);\n\tborder-radius: 12px;\n\tbox-shadow: 0 8px 24px rgba(0,0,0,.18);\n\tmin-width: 140px;\n}\n.lm-scroll-menu-item {\n\tborder: 0;\n\tbackground: transparent;\n\tpadding: 6px 10px;\n\tborder-radius: 6px;\n\ttext-align: left;\n\tcolor: var(--dsw-alias-label-secondary);\n\tfont: inherit;\n\tfont-size: 12px;\n\tcursor: pointer;\n}\n.lm-scroll-menu-item:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }\n\n/* 历史快照 Timeline + 行级 Diff (Bug 3 修复) */\n.lm-browser-history { padding-top: 20px; border-top: .5px solid var(--dsw-alias-border-l3); }\n.lm-browser-history h3 { margin: 0 0 12px; font-size: 14px; font-weight: 600; }\n.lm-history-timeline { display: flex; flex-direction: column; margin: 0; padding: 0 0 0 16px; list-style: none; position: relative; border-left: 2px solid var(--dsw-alias-border-l3); }\n.lm-history-node { position: relative; margin-bottom: 16px; }\n.lm-history-dot { position: absolute; left: -21px; top: 8px; width: 8px; height: 8px; border-radius: 50%; background: var(--dsw-alias-border-l2); border: 2px solid var(--dsw-alias-bg-base); }\n.lm-history-card { padding: 10px 12px; border-radius: 10px; background: var(--dsw-alias-bg-layer-1); border: .5px solid var(--dsw-alias-border-l3); }\n.lm-history-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px; }\n.lm-history-meta { display: flex; align-items: center; gap: 8px; font-size: 12px; }\n.lm-history-delta { font-size: 11px; padding: 1px 6px; border-radius: 4px; font-weight: 500; }\n.lm-delta-pos { background: rgba(34, 197, 94, 0.12); color: #16a34a; }\n.lm-delta-neg { background: rgba(239, 68, 68, 0.12); color: #dc2626; }\n.lm-history-summary { font-size: 12px; color: var(--dsw-alias-label-caption); margin-bottom: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.lm-diff-view { margin-top: 8px; padding: 8px 10px; border-radius: 6px; background: var(--dsw-alias-bg-base); font-family: var(--dsh-font-family-mono, monospace); font-size: 12px; max-height: 240px; overflow: auto; }\n.lm-diff-line { display: flex; gap: 8px; padding: 1px 4px; border-radius: 2px; }\n.lm-diff-add { background: rgba(34, 197, 94, 0.15); color: #15803d; }\n.lm-diff-del { background: rgba(239, 68, 68, 0.15); color: #b91c1c; text-decoration: line-through; }\n\n/* 注入透视视图 (Injection View) */\n.lm-injection-view { display: flex; flex-direction: column; flex: 1; height: 100%; overflow: auto; padding: 16px clamp(16px, 3vw, 36px); }\n.lm-funnel-card { display: flex; align-items: center; justify-content: space-around; padding: 14px; margin-bottom: 16px; background: var(--dsw-alias-bg-layer-1); border-radius: 12px; border: .5px solid var(--dsw-alias-border-l3); }\n.lm-funnel-step { display: flex; flex-direction: column; align-items: center; text-align: center; }\n.lm-funnel-step h4 { margin: 0 0 4px; font-size: 12.5px; color: var(--dsw-alias-label-secondary); }\n.lm-funnel-step span { font-size: 17px; font-weight: 600; color: var(--dsw-alias-label-primary); }\n.lm-funnel-arrow { font-size: 18px; color: var(--dsw-alias-label-caption); }\n.lm-injection-split { display: flex; flex: 1; gap: 16px; min-height: 440px; }\n.lm-injection-table-pane { flex: 1; overflow: auto; border: .5px solid var(--dsw-alias-border-l3); border-radius: 12px; padding: 12px; background: var(--dsw-alias-bg-base); }\n.lm-injection-text-pane { flex: 1; display: flex; flex-direction: column; border: .5px solid var(--dsw-alias-border-l3); border-radius: 12px; padding: 12px; background: var(--dsw-alias-bg-base); }\n.lm-prompt-preview { flex: 1; margin: 0; padding: 12px; overflow: auto; border-radius: 8px; background: var(--dsw-alias-bg-layer-1); font-family: var(--dsh-font-family-mono, monospace); font-size: 12px; line-height: 1.6; white-space: pre-wrap; }\n\n/* 关系图谱视图：星系与环形网络 (Bug 4 修复) */\n.lm-graph-view { display: flex; flex: 1; height: 100%; overflow: hidden; position: relative; }\n.lm-graph-canvas-wrap { flex: 1; height: 100%; background: var(--dsw-alias-bg-base); position: relative; overflow: hidden; }\n.lm-graph-toolbar { position: absolute; top: 14px; left: 16px; z-index: 10; display: flex; gap: 8px; background: var(--dsw-alias-bg-base); border: .5px solid var(--dsw-alias-border-l3); border-radius: 8px; padding: 6px 10px; box-shadow: 0 4px 12px rgba(0,0,0,.1); align-items: center; }\n.lm-graph-info-card { width: 320px; border-left: .5px solid var(--dsw-alias-border-l3); background: var(--dsw-alias-bg-layer-1); padding: 16px; overflow: auto; }\n\n/* 维护驾驶舱 Bento Grid (Bug 5 修复) */\n.lm-cockpit-view { display: flex; flex-direction: column; flex: 1; height: 100%; overflow: auto; padding: 16px clamp(16px, 3vw, 36px); }\n.lm-bento-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 16px; margin-top: 10px; }\n.lm-bento-card { background: var(--dsw-alias-bg-layer-1); border: .5px solid var(--dsw-alias-border-l3); border-radius: 14px; padding: 16px; display: flex; flex-direction: column; }\n.lm-bento-card h3 { margin: 0 0 12px; font-size: 14px; font-weight: 600; color: var(--dsw-alias-label-secondary); }\n.lm-bento-span-4 { grid-column: span 4; }\n.lm-bento-span-6 { grid-column: span 6; }\n.lm-bento-span-8 { grid-column: span 8; }\n.lm-bento-span-12 { grid-column: span 12; }\n\n/* 弹层样式 */\n.lm-browser-modal-backdrop { position: fixed; z-index: 1000; inset: 0; display: flex; align-items: center; justify-content: center; padding: 24px; background: var(--dsw-alias-mask, rgb(0 0 0 / 40%)); }\n.lm-browser-modal { display: flex; flex-direction: column; width: min(580px, 100%); max-height: calc(100dvh - 48px); overflow: hidden; border: .5px solid var(--dsw-alias-border-l3); border-radius: 16px; color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-base); box-shadow: 0 16px 48px rgb(0 0 0 / 24%); }\n.lm-browser-modal form { display: flex; flex-direction: column; min-height: 0; overflow: auto; padding: 0 24px 20px; }\n.lm-browser-modal-heading { flex: none; display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px; padding: 20px 24px 0; }\n.lm-browser-modal-heading h2 { margin: 0; font-size: 19px; font-weight: 600; }\n.lm-kind-explainer { padding: 10px 12px; margin-bottom: 14px; border-radius: 8px; background: var(--dsw-alias-bg-layer-1); font-size: 12px; color: var(--dsw-alias-label-secondary); border-left: 3px solid var(--dsw-alias-state-business-primary); line-height: 1.6; }\n\n/* 移动端与窄屏响应式 (<700px) */\n@media (width <= 980px) {\n\t.lm-browser-list-pane { flex-basis: 48%; }\n\t.lm-bento-span-4, .lm-bento-span-6, .lm-bento-span-8 { grid-column: span 12; }\n}\n@media (width <= 700px) {\n\t.lm-browser-top-row, .lm-bounce-nav-bar, .lm-browser-usage-wrap, .lm-browser-entries-toolbar { padding-left: 12px; padding-right: 12px; }\n\t.lm-browser-body.show-list .lm-browser-detail { display: none; }\n\t.lm-browser-body.show-detail .lm-browser-list-pane { display: none; }\n\t.lm-browser-list-pane { flex: 1; width: 100%; min-width: 0; padding: 10px; }\n\t.lm-browser-detail { border-left: 0; width: 100%; }\n\t.lm-detail-back-btn { display: inline-flex; }\n\t.lm-col-heat, .lm-col-time { display: none; }\n\t.lm-injection-split { flex-direction: column; }\n\t.lm-graph-info-card { display: none; }\n}\n");
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
