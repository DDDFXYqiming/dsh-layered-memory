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
