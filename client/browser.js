export function createMemoryBrowserClient(require, styles) {
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
			["head", "head", Number(stats.headChars) || 0, null],
			["rules", "rules", Number(stats.rulesChars) || 0, null],
			["facts", "facts", Number(stats.factsChars) || 0, Number(stats.factCount) || 0],
			["sops", "sops", Number(stats.sopsChars) || 0, Number(stats.sopCount) || 0],
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
