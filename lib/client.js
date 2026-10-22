// 由 scripts/build.mjs 生成。
window.__ModuleLoader__.load({id:"@dsh-external/dsh-layered-memory",factory(require){
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
function parseActivitySnapshot(value) {
	exactObject(value, ["parentSessionId", "revision", "running", "latestChanged", "latestFailure"]);
	text(value.parentSessionId);
	count(value.revision);
	if (!Array.isArray(value.running)) throw new TypeError("运行状态必须是数组");
	for (const row of value.running) { if (row === null) throw new TypeError("运行状态缺少记录"); item(row); }
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
const codec = (name, parse) => ({ mode: "strict", typeSymbol: STATUS_PACKAGE + "#" + name, create: () => ({ parse }) });
const parameter = { name: "sessionId", wire: "sessionId", source: "json", codec: codec("SessionId", text) };
const STATUS_REMOTE = {
	package: STATUS_PACKAGE,
	descriptors: [
		{ id: STATUS_PACKAGE + "#getSnapshot", service: STATUS_SERVICE, namespace: STATUS_SERVICE, method: "getSnapshot", invocation: { kind: "direct" }, parameters: [parameter], cancellation: { parameter: "signal" }, result: codec("ActivitySnapshot", parseActivitySnapshot) },
		{ id: STATUS_PACKAGE + "#watch", service: STATUS_SERVICE, namespace: STATUS_SERVICE, method: "watch", mode: "stream", invocation: { kind: "direct" }, parameters: [parameter], cancellation: { parameter: "signal" }, result: codec("ActivityFrame", parseActivityFrame) },
	],
};

function createStatusClient(require, styles) {
	const React = require("react");
	const { RemoteSnapshotStream, RemoteStreamCarrierError } = require("@deepseek-ai/dsh-api-gateway/client");
	const h = React.createElement;
	const locale = "layered-memory-status";
	const dictionaries = {
		zh: {
			reviewing: "正在核对记忆", organizing: "正在整理记忆", changed: "记忆已整理 {count} 条",
			failed: "上次记忆核对未完成", partial: "记忆已整理 {count} 条 · 上次核对未完成", details: "查看记忆核对子会话",
			unavailable: "记忆状态暂不可用", concurrent: "还有 {count} 项记忆任务运行中",
		},
		en: {
			reviewing: "Reviewing memory", organizing: "Organizing memory", changed: "Organized {count} memory entries",
			failed: "Last memory review incomplete", partial: "Organized {count} entries · last review incomplete", details: "Open memory review session",
			unavailable: "Memory status unavailable", concurrent: "{count} more memory tasks running",
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
	function MemoryStatus({ useMemoryActivity, openDetails, t }) {
		const value = useMemoryActivity(state => state);
		const snapshot = value.snapshot;
		const running = snapshot?.running[0];
		const failure = snapshot?.latestFailure;
		const item = running || failure || snapshot?.latestChanged;
		const visible = value.error || Boolean(item);
		const isFailure = value.error || (!running && Boolean(failure));
		let label = "";
		if (value.error) label = t("unavailable");
		else if (running) label = t(running.purpose === "turn_review" ? "reviewing" : "organizing");
		else if (failure) label = failure.changedEntries ? t("partial", { count: failure.changedEntries }) : t("failed");
		else if (item) label = t("changed", { count: item.changedEntries });
		const clickable = !value.error && Boolean(item?.childSessionId);
		const title = [label, !running && failure?.summary, clickable ? t("details") : "", running && snapshot.running.length > 1 ? t("concurrent", { count: snapshot.running.length - 1 }) : ""].filter(Boolean).join(" · ");
		return h(React.Fragment, null,
			h("style", null, styles),
			h("span", { className: "lm-status-seat", "data-memory-status": value.error ? "unavailable" : running ? "running" : failure ? "failed" : item ? "changed" : "idle" },
				h(clickable ? "button" : "span", {
					className: "lm-status-line" + (running && !value.error ? " is-running" : "") + (isFailure ? " is-failed" : "") + (!visible ? " is-empty" : ""),
					...(clickable ? { type: "button", onClick: () => openDetails(item) } : {}),
					title, "aria-label": title || undefined, "aria-hidden": !visible || undefined,
				}, h(Brain), h("span", { className: "lm-status-text", role: "status", "aria-live": "polite" }, label),
					isFailure ? h("span", { className: "lm-status-failure", "aria-hidden": true }, "!") : clickable ? h("span", { className: "lm-status-details", "aria-hidden": true }, "↗") : null)));
	}
	return {
		inject: ["remote"],
		async apply(ctx) {
			const unmountRemote = await ctx.remote.$mount(STATUS_REMOTE);
			const stores = new Set();
			const ui = ctx.inject(["remote.layeredMemoryStatus", "slots", "locale", "uiWorkspace"], scope => {
				scope.effect(() => scope.locale.register(locale, dictionaries), "memory-status: locale");
				scope.slots.inject("conversation.composer.dock", () => scope.slots.register({
					name: "conversation.composer.dock", id: "layered-memory-status", order: 5, locale,
					inject: sessionId => {
						const store = createStore(scope.remote, sessionId, stores);
						return {
							hooks: { memoryActivity: store },
							openDetails: item => scope.uiWorkspace.openSession({ parentSessionId: sessionId, childSessionId: item.childSessionId, mode: "continuable" }),
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

return createStatusClient(require,".lm-status-seat{display:inline-flex;align-items:center;flex:0 1 auto;min-width:0;max-width:min(240px,35vw);height:20px;min-height:20px;max-height:20px;overflow:hidden}\n.lm-status-seat[data-memory-status=\"idle\"]{display:none}\n.lm-status-line{display:inline-flex;align-items:center;gap:5px;box-sizing:border-box;min-width:0;max-width:100%;height:20px;border:0;border-radius:var(--dsw-radius-sm,4px);padding:0 3px;background:transparent;color:var(--dsw-alias-label-tertiary);font:inherit;font-size:11px;line-height:18px;white-space:nowrap;text-align:left}\nbutton.lm-status-line{cursor:pointer}\nbutton.lm-status-line:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}\nbutton.lm-status-line:focus-visible{outline:2px solid var(--dsw-alias-label-secondary);outline-offset:-2px}\n.lm-status-glyph{flex:none;color:var(--dsw-alias-label-secondary)}\n.lm-status-text{min-width:0;overflow:hidden;text-overflow:ellipsis;background:linear-gradient(105deg,#b78535,#aa79bd);background-clip:text;-webkit-background-clip:text;color:transparent}\n.lm-status-details{flex:none;font-size:11px;opacity:.65}\n.lm-status-failure{display:inline-flex;justify-content:center;align-items:center;flex:none;width:12px;height:12px;border:1px solid currentColor;border-radius:50%;font-size:9px;line-height:1;color:var(--dsw-alias-state-error-primary)}\n.lm-status-line.is-failed .lm-status-text{background:none;color:var(--dsw-alias-label-tertiary)}\n.lm-status-line.is-running .lm-status-glyph{animation:lm-status-pulse 1.8s ease-in-out infinite}\n@keyframes lm-status-pulse{0%,100%{opacity:.5}50%{opacity:1}}\n@media(prefers-reduced-motion:reduce){.lm-status-line.is-running .lm-status-glyph{animation:none}}\n");
}});
