export function createMemoryBrowserClient(require, styles) {
	const React = require("react");
	const {
		Button, Input, Menu, MenuItemButton,
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
			rollbackWarning: "回滚会覆盖当前内容，是否继续？", saved: "已保存", archivedDone: "归档状态已更新", rolledBack: "已回滚到所选快照",
			reload: "重新加载", conflict: "条目已被其他会话修改，请重新加载后再保存。", createTitle: "新建记忆条目", topic: "标题",
			topicPlaceholder: "输入条目标题", contentPlaceholder: "输入记忆正文", evidencePlaceholder: "输入本次写入的证据", create: "创建", creating: "创建中…",
			created: "条目已创建", close: "关闭", createdAt: "创建时间", updatedAt: "更新时间", characters: "{count} 字符",
			listFailed: "条目列表读取失败", detailFailed: "条目详情读取失败", historyFailed: "历史快照读取失败", noNamespace: "暂无可用命名空间",
		},
		en: {
			title: "Memory", newEntry: "New entry", namespace: "Namespace", search: "Search memory", searchPlaceholder: "Search titles or content", clearSearch: "Clear search",
			all: "All", showArchived: "Show archived", entries: "Memory entries", loading: "Loading…", empty: "No matching memory entries", emptyDetail: "Select a memory entry on the left",
			archived: "Archived", content: "Content", evidence: "Evidence", save: "Save", saving: "Saving…", archive: "Archive", restore: "Restore",
			history: "History", noHistory: "No history snapshots", rollback: "Roll back to this version", rollbackConfirm: "Confirm rollback", cancel: "Cancel",
			rollbackWarning: "Rolling back replaces the current content. Continue?", saved: "Saved", archivedDone: "Archive state updated", rolledBack: "Rolled back to the selected snapshot",
			reload: "Reload", conflict: "This entry changed elsewhere. Reload it before saving again.", createTitle: "New memory entry", topic: "Title",
			topicPlaceholder: "Enter an entry title", contentPlaceholder: "Enter memory content", evidencePlaceholder: "Enter evidence for this write", create: "Create", creating: "Creating…",
			created: "Entry created", close: "Close", createdAt: "Created", updatedAt: "Updated", characters: "{count} characters",
			listFailed: "Could not load entries", detailFailed: "Could not load entry details", historyFailed: "Could not load history", noNamespace: "No namespaces available",
		},
	};
	async function resultValue(request) {
		const result = await request;
		if (!result.ok) throw new Error(result.error.message);
		return result.value;
	}
	const identity = entry => JSON.stringify([entry.namespace, entry.kind, entry.key]);
	const time = value => value ? new Date(value).toLocaleString() : "—";
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
					h(Field, { label: t("namespace") }, h(SelectMenu, { value: form.namespace, options: namespaces.map(row => ({ value: row.namespace, label: row.namespace })), disabled: busy, onChange: value => update("namespace", value), ariaLabel: t("namespace"), triggerClassName: "lm-browser-input" })),
					h(Field, { label: "kind" }, h(SelectMenu, { value: form.kind, options: [{ value: "fact", label: "fact" }, { value: "sop", label: "sop" }], disabled: busy, onChange: value => update("kind", value), ariaLabel: "kind", triggerClassName: "lm-browser-input" })),
					h(Field, { label: t("topic") }, h("input", { className: "lm-browser-input", value: form.topic, required: true, placeholder: t("topicPlaceholder"), disabled: busy, onChange: event => update("topic", event.target.value) })),
					h(Field, { label: t("content") }, h("textarea", { className: "lm-browser-textarea lm-browser-create-content", value: form.content, required: true, placeholder: t("contentPlaceholder"), disabled: busy, onChange: event => update("content", event.target.value) })),
					h(Field, { label: t("evidence") }, h("input", { className: "lm-browser-input", value: form.evidence, required: true, placeholder: t("evidencePlaceholder"), disabled: busy, onChange: event => update("evidence", event.target.value) })),
					error ? h("p", { className: "lm-browser-error", role: "alert" }, error) : null,
					h("div", { className: "lm-browser-modal-actions" }, h(Button, { variant: "outline", type: "button", disabled: busy, onClick: onClose }, t("cancel")), h(Button, { variant: "primary", type: "submit", disabled: busy || !form.namespace }, busy ? t("creating") : t("create"))))));
	}
	function MemoryBrowserPage({ controls, t }) {
		const [namespaces, setNamespaces] = React.useState([]);
		const [namespace, setNamespace] = React.useState(null);
		const [namespaceError, setNamespaceError] = React.useState(null);
		const [query, setQuery] = React.useState("");
		const [kind, setKind] = React.useState("");
		const [includeArchived, setIncludeArchived] = React.useState(false);
		const [entries, setEntries] = React.useState([]);
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
		const [createOpen, setCreateOpen] = React.useState(false);
		const [createForm, setCreateForm] = React.useState({ namespace: "", kind: "fact", topic: "", content: "", evidence: "" });
		const [createError, setCreateError] = React.useState(null);
		const detailRequest = React.useRef(0);
		const historyRequest = React.useRef(0);
		React.useEffect(() => {
			let active = true;
			controls.listNamespaces().then(rows => {
				if (!active) return;
				setNamespaces(rows);
				setNamespaceError(null);
				setNamespace(current => current && rows.some(row => row.namespace === current) ? current : rows[0]?.namespace || null);
			}).catch(error => { if (active) setNamespaceError(error.message); });
			return () => { active = false; };
		}, [controls]);
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
		React.useEffect(() => {
			const request = ++detailRequest.current;
			const selected = entries.find(row => identity(row.entry) === selectedId);
			setRollbackId(null);
			setActionError(null);
			setNotice(null);
			setConflict(false);
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
		function renderSnapshot(snapshot) {
			const action = rollbackId === snapshot.snapshotId
				? h("div", { className: "lm-browser-rollback-confirm" },
					h("p", null, t("rollbackWarning")),
					h("div", null,
						h(Button, { variant: "ghost", size: "sm", disabled: Boolean(busy), onClick: () => setRollbackId(null) }, t("cancel")),
						h(Button, { variant: "primary", size: "sm", disabled: Boolean(busy), onClick: () => rollback(snapshot.snapshotId) }, t("rollbackConfirm"))))
				: h(Button, { variant: "ghost", size: "sm", disabled: Boolean(busy), onClick: () => setRollbackId(snapshot.snapshotId) }, t("rollback"));
			return h("li", { key: snapshot.snapshotId, className: "lm-browser-history-row" },
				h("div", { className: "lm-browser-history-meta" },
					h("time", { dateTime: snapshot.createdAt }, time(snapshot.createdAt)),
					h("code", { title: snapshot.revision }, snapshot.revision.slice(0, 12)),
					h("span", null, t("characters", { count: snapshot.chars }))),
				action);
		}
		const dirty = detail && (content !== detail.content || evidence !== detail.evidence);
		return h("section", { className: "lm-browser-page", "aria-label": t("title"), "data-memory-browser": true },
			h("style", null, styles),
			h("header", { className: "lm-browser-heading" }, h("h1", null, t("title")), h(Button, { variant: "primary", size: "sm", className: "lm-browser-new", icon: h(IconPlusOutlineRegular, { size: 13 }), disabled: !namespaces.length, onClick: openCreate }, t("newEntry"))),
			h("div", { className: "lm-browser-toolbar" },
				h("div", { className: "lm-browser-namespace" }, h(SelectMenu, { value: namespace || "", options: namespaces.length ? namespaces.map(row => ({ value: row.namespace, label: row.namespace })) : [{ value: "", label: t("noNamespace") }], disabled: !namespaces.length || Boolean(busy), onChange: setNamespace, ariaLabel: t("namespace") })),
				h("div", { className: "lm-browser-search" }, h(Input, { type: "search", icon: h(IconSearchOutlineRegular, { size: 14 }), "aria-label": t("search"), placeholder: t("searchPlaceholder"), value: query, onChange: event => setQuery(event.target.value) }), query ? h(Button, { variant: "ghost", size: "sm", className: "lm-browser-search-clear", "aria-label": t("clearSearch"), onClick: () => setQuery("") }, h(IconCloseOutlineRegular, { size: 14 })) : null),
				h("div", { className: "lm-browser-filter-tabs", role: "group", "aria-label": "kind" }, [["", t("all")], ["fact", "fact"], ["sop", "sop"]].map(([value, label]) => h("button", { key: value || "all", type: "button", className: "lm-browser-filter-tab" + (kind === value ? " is-active" : ""), "aria-pressed": kind === value, onClick: () => setKind(value) }, label))),
				h("label", { className: "lm-browser-archived-toggle" }, h("input", { type: "checkbox", role: "switch", checked: includeArchived, onChange: event => setIncludeArchived(event.target.checked) }), h("span", null, t("showArchived")))),
			namespaceError ? h("p", { className: "lm-browser-error lm-browser-banner", role: "alert" }, namespaceError) : null,
			h("div", { className: "lm-browser-body" },
				h("section", { className: "lm-browser-list-pane", "aria-label": t("entries") },
					listBusy ? h("p", { className: "lm-browser-empty", role: "status" }, t("loading")) : null,
					listError ? h("p", { className: "lm-browser-error", role: "alert" }, listError) : null,
					!listBusy && !listError && !entries.length ? h("p", { className: "lm-browser-empty" }, t("empty")) : null,
					h("ul", { className: "lm-browser-list" }, entries.map(row => h("li", { key: identity(row.entry) }, h("button", { type: "button", className: "lm-browser-row" + (selectedId === identity(row.entry) ? " is-selected" : "") + (row.archived ? " is-archived" : ""), onClick: () => setSelectedId(identity(row.entry)) },
						h("span", { className: "lm-browser-row-title" }, row.title),
						h("span", { className: "lm-browser-row-meta" }, h("span", { className: "lm-browser-kind" }, row.entry.kind), row.archived ? h("span", null, t("archived")) : null, row.updatedAt ? h("time", { dateTime: row.updatedAt }, time(row.updatedAt)) : null)))))),
				h("article", { className: "lm-browser-detail" },
					detailBusy && !detail ? h("p", { className: "lm-browser-empty", role: "status" }, t("loading")) : null,
					detailError ? h("div", { className: "lm-browser-detail-message" }, h("p", { className: "lm-browser-error", role: "alert" }, detailError), h(Button, { variant: "outline", size: "sm", onClick: reloadDetail }, t("reload"))) : null,
					!detailBusy && !detailError && !detail ? h("p", { className: "lm-browser-empty" }, t("emptyDetail")) : null,
					detail ? h("div", { className: "lm-browser-detail-scroll" },
						h("div", { className: "lm-browser-detail-heading" }, h("h2", null, detail.title), detail.archived ? h("span", { className: "lm-browser-archived-badge" }, t("archived")) : null),
						h("dl", { className: "lm-browser-readonly" }, [["namespace", detail.entry.namespace], ["kind", detail.entry.kind], ["key", detail.entry.key]].map(([label, value]) => h("div", { key: label }, h("dt", null, label), h("dd", null, value)))),
						h(Field, { label: t("content") }, h("textarea", { className: "lm-browser-textarea lm-browser-content", value: content, disabled: Boolean(busy), onChange: event => setContent(event.target.value) })),
						h(Field, { label: t("evidence") }, h(Input, { value: evidence, disabled: Boolean(busy), placeholder: t("evidencePlaceholder"), onChange: event => setEvidence(event.target.value) })),
						conflict ? h("div", { className: "lm-browser-conflict", role: "alert" }, h("span", null, t("conflict")), h(Button, { variant: "outline", size: "sm", onClick: reloadDetail }, t("reload"))) : null,
						actionError && !conflict ? h("p", { className: "lm-browser-error", role: "alert" }, actionError) : null,
						notice ? h("p", { className: "lm-browser-notice", role: "status" }, notice) : null,
						h("div", { className: "lm-browser-actions" }, h(Button, { variant: "outline", size: "sm", disabled: Boolean(busy), onClick: toggleArchived }, detail.archived ? t("restore") : t("archive")), h(Button, { variant: "primary", size: "sm", disabled: Boolean(busy) || !dirty, onClick: saveEntry }, busy === "save" ? t("saving") : t("save"))),
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
