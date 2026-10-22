export function createStatusClient(require, styles) {
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
