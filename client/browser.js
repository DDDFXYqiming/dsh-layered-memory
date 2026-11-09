export function createMemoryBrowserClient(require, styles, runtime) {
	const React = require("react");
	const {
		Button, Input, Menu, MenuItemButton, Switch, Tooltip,
		IconPlusOutlineRegular, IconSearchOutlineRegular, IconCloseOutlineRegular,
		IconChevronDownOutlineRegular, IconCheckOutlineRegular,
	} = require("@deepseek-ai/dsh-client-ui-primitives");
	// runtime 由 scripts/build.mjs 注入；未注入时各视图退回本文件内的实现。
	const runtimeComponents = (runtime && runtime.components) || {};
	const DataTable = runtimeComponents.DataTable || null;
	const DataTableContent = runtimeComponents.DataTableContent || null;
	const SegmentedControl = runtimeComponents.SegmentedControl || null;
	const Disclosure = runtimeComponents.Disclosure || LocalDisclosure;
	const ToolbarPopover = runtimeComponents.ToolbarPopover || null;
	const h = React.createElement;
	const locale = "layered-memory";

	const dictionaries = {
		zh: {
			ruleContentCount: "当前 {count} / {limit} 字符", ruleContentNearLimit: "接近规则正文上限，请保留完整适用条件。", ruleContentOverLimit: "规则正文超过 {limit} 字符，请精简后保存。",
			title: "记忆系统工作台", newEntry: "新建条目", namespace: "命名空间", search: "搜索记忆", searchPlaceholder: "搜索标题、正文或关键词", clearSearch: "清空",
			all: "全部", showArchived: "已归档", entries: "条目表格", loading: "正在读取…", empty: "没有匹配的记忆条目", emptyDetail: "从左侧列表选择条目查看详情",
			archived: "已归档", content: "正文内容", evidence: "证据与溯源", save: "保存", saving: "保存中…", archive: "归档", restore: "恢复",
			noHistory: "暂无历史快照", rollback: "回滚版本", rollbackConfirm: "确认回滚", cancel: "取消",
			rollbackWarning: "回滚将覆盖当前内容。", requiredFields: "标题、内容、依据都必须填写", loadTimeout: "记忆数据加载超时", saved: "已保存", archivedDone: "归档状态已更新", rolledBack: "已回滚到所选快照", preview: "对比", collapse: "收起", initialVersion: "初始版本", evidenceUpdated: "证据更新", contentDelta: "内容 {delta} 字符", noContentChange: "无正文变化", noSummary: "（空内容）", noPreview: "该快照没有可预览的正文", editMode: "编辑",
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
			backToList: "← 返回列表",
			heatLabel: "热度", accessLabel: "访问", statusLabel: "流态",
			inventoryLabel: "库存", resultCount: "{count} 条结果", clearFilter: "清除筛选",
			inventoryChipTitle: "库存：活跃 {active} · 归档 {archived}",
			loadMore: "加载更多",
			recallQuery: "召回预览词", recallPlaceholder: "输入词，模拟本地召回",
			statusUnknown: "未判定",
			previewScope: "空间预览", coldCandidateTitle: "候选",
			sourceBudget: "预算", sourceTarget: "目标", sourceColdRatio: "冷比例", sourceRecall: "召回词",
			copyReferenceFailed: "复制失败，请从「来源与依据」手动复制引用",
			statusActive: "活跃", statusArchived: "归档",
			coldTitle: "长期低热待审",
			cockpitTitle: "维护驾驶舱", recheck: "重新检查", checking: "检查中…", notChecked: "尚未检查",
			scannedAt: "检查于 {time}", checkedCount: "本次检查覆盖 {count} 条", candidateTitle: "相似与合并候选", noCandidates: "本次检查未发现候选",
			candidateReasonColumn: "入选理由", candidateScoreColumn: "相似分",
			candidateSideOne: "条目一", candidateSideTwo: "条目二", kindRuleLabel: "规则",
			candidateActionColumn: "操作", candidateCompareAction: "对比", candidateDecisionTitle: "判定详情", candidateSharedTokens: "共有 token",
			reasonExact: "内容相同", reasonNear: "高度相似", reasonOverlap: "内容重合", reasonContains: "包含关系",
			coldCriteriaLabel: "判定口径", coldDaysUnit: "天", coldHeatBase: "基础访问热度", coldExcludes: "排除",
			coldAgeBasisCreated: "以创建时间为准", mergePartial: "正文已保存，归档状态未确认。请重新审阅确认后再决定是否重试。", mergeIndexRefreshFailed: "合并与归档已完成，但 L1 索引刷新失败，索引目录可能仍保留被归档条目。「重新检查」只刷新本页状态，不会修复索引。", mergeIndexFailedTitle: "索引刷新失败", archiveAppliedIndexFailed: "归档已生效，但 L1 索引刷新失败，索引目录可能仍保留该条目；不会重复归档。「重新检查」只刷新本页状态。", reReview: "重新审阅",
			keepSideLeft: "保留第一条", keepSideRight: "保留第二条",
			compareTitle: "候选对比", candidateMetaTitle: "元数据与来源",
			mergeDraftTitle: "编辑合并草稿", keepWhich: "保留哪一条", mergeKeptTitle: "保留标题",
			mergeSubmit: "合并并归档另一条", mergeConfirmTitle: "确认合并", mergeKeepLabel: "将保留", mergeArchiveLabel: "将归档",
			mergeDone: "已合并并归档", mergeFailedTitle: "合并未完成", mergeConflict: "其中一条已被修改，请重新加载后再合并。",
			noColdEntries: "本次检查没有符合条件的长期低热条目",
			coldReasonText: "条目存续 {days} 天 / 低使用热度 {heat}", coldArchiveConfirmTitle: "确认归档",
			coldArchiveConfirmBody: "将归档这条长期低热条目", coldArchiveButton: "确认归档",
			storeEntriesTitle: "条目",
			retry: "重试", loadFailed: "读取失败", loadFailedHint: "请求失败，可以重试。", details: "详情", emptyEntries: "没有匹配的条目",
			rawPrompt: "原文", groupedPrompt: "分组", copyPrompt: "复制原文", copied: "已复制", copyFailed: "复制失败，请手动选择原文",
			groupRules: "规则", groupFacts: "事实目录", groupSops: "经验目录",
			notEntry: "索引头部，不是条目类型", openEntry: "打开条目", space: "空间", sidebarTitle: "记忆",
			draftSwitchWarning: "有未保存的修改，切换会丢弃。",
			ruleOverLimit: "规则正文超过 100 字符，无法保存",
			confirmTitle: "请确认", confirm: "继续", injectionEmpty: "当前筛选没有条目",
			sourceTitle: "来源与依据", relatedTitle: "关联", historyTitle: "历史",
			moreActions: "更多", copyReference: "复制引用", referenceCopied: "已复制引用",
			entryKey: "标识", noEvidence: "暂无依据", showAll: "展开全部", showLess: "收起",
			filters: "筛选", advancedTitle: "高级设置",
			injectionPaneLabel: "切换面板", injectionListPane: "名单", injectionPreviewPane: "预览",
		},
		en: {
			ruleContentCount: "Current {count} / {limit} chars", ruleContentNearLimit: "Approaching rule limit.", ruleContentOverLimit: "Rule exceeds {limit} chars.",
			title: "Memory Workspace", newEntry: "New Entry", namespace: "Namespace", search: "Search", searchPlaceholder: "Search title, body or keyword", clearSearch: "Clear",
			all: "All", showArchived: "Archived", entries: "Data Table", loading: "Loading…", empty: "No matching entries", emptyDetail: "Select an entry to view details",
			archived: "Archived", content: "Content", evidence: "Evidence", save: "Save", saving: "Saving…", archive: "Archive", restore: "Restore",
			noHistory: "No history", rollback: "Rollback", rollbackConfirm: "Confirm", cancel: "Cancel",
			rollbackWarning: "Rollback overwrites the current content.", requiredFields: "Title, content and evidence are required", loadTimeout: "Timed out", saved: "Saved", archivedDone: "Archive updated", rolledBack: "Rolled back", preview: "Diff", collapse: "Collapse", initialVersion: "Initial", evidenceUpdated: "Evidence updated", contentDelta: "{delta} chars", noContentChange: "No change", noSummary: "(empty)", noPreview: "No preview", editMode: "Edit",
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
			backToList: "← Back",
			heatLabel: "Heat", accessLabel: "Access", statusLabel: "Status",
			inventoryLabel: "Inventory", resultCount: "{count} results", clearFilter: "Clear filter",
			inventoryChipTitle: "Inventory: {active} active · {archived} archived",
			loadMore: "Load more",
			recallQuery: "Recall preview", recallPlaceholder: "Type a term to preview local recall",
			statusUnknown: "Undetermined",
			previewScope: "Space preview", coldCandidateTitle: "Candidates",
			sourceBudget: "Budget", sourceTarget: "Target", sourceColdRatio: "Cold ratio", sourceRecall: "Recall query",
			copyReferenceFailed: "Copy failed, copy the reference manually from Source",
			statusActive: "Active", statusArchived: "Archived",
			coldTitle: "Long-term low-heat entries",
			cockpitTitle: "Maintenance Cockpit", recheck: "Re-check", checking: "Checking…", notChecked: "Not checked yet",
			scannedAt: "Checked at {time}", checkedCount: "Checked {count} entries", candidateTitle: "Similar & merge candidates", noCandidates: "No candidates found in this check",
			candidateReasonColumn: "Reason", candidateScoreColumn: "Score",
			candidateSideOne: "Entry one", candidateSideTwo: "Entry two", kindRuleLabel: "Rule",
			candidateActionColumn: "Action", candidateCompareAction: "Compare", candidateDecisionTitle: "Decision details", candidateSharedTokens: "Shared tokens",
			reasonExact: "Identical", reasonNear: "Near duplicate", reasonOverlap: "Overlapping", reasonContains: "Contains",
			coldCriteriaLabel: "Criteria", coldDaysUnit: "days", coldHeatBase: "base access heat", coldExcludes: "excludes",
			coldAgeBasisCreated: "based on creation time", mergePartial: "The content was saved but the archive state is not confirmed. Review the entries again and decide whether to retry.", mergeIndexRefreshFailed: "The merge and archive succeeded, but the L1 index refresh failed, so the archived entry may still be listed in the index. Re-check only refreshes this page; it does not repair the index.", mergeIndexFailedTitle: "Index refresh failed", archiveAppliedIndexFailed: "The archive took effect but the L1 index refresh failed, so the entry may still be listed in the index. It will not be archived again. Re-check only refreshes this page.", reReview: "Review again",
			keepSideLeft: "Keep the first", keepSideRight: "Keep the second",
			compareTitle: "Candidate comparison", candidateMetaTitle: "Metadata & source",
			mergeDraftTitle: "Edit merge draft", keepWhich: "Which one to keep", mergeKeptTitle: "Kept title",
			mergeSubmit: "Merge and archive the other", mergeConfirmTitle: "Confirm merge", mergeKeepLabel: "Will keep", mergeArchiveLabel: "Will archive",
			mergeDone: "Merged and archived", mergeFailedTitle: "Merge failed", mergeConflict: "One entry was modified; reload before merging.",
			noColdEntries: "No long-term low-heat entries matched this check",
			coldReasonText: "Entry age {days}d / low usage heat {heat}", coldArchiveConfirmTitle: "Confirm archive",
			coldArchiveConfirmBody: "This long-term low-heat entry will be archived", coldArchiveButton: "Archive this entry",
			storeEntriesTitle: "Entries",
			retry: "Retry", loadFailed: "Failed to load", loadFailedHint: "The request failed. You can retry.", details: "Details", emptyEntries: "No matching entries",
			rawPrompt: "Raw", groupedPrompt: "Grouped", copyPrompt: "Copy raw text", copied: "Copied", copyFailed: "Copy failed, select the raw text manually",
			groupRules: "Rules", groupFacts: "Facts", groupSops: "Skills",
			notEntry: "Index header, not an entry type", openEntry: "Open entry", space: "Space", sidebarTitle: "Memory",
			draftSwitchWarning: "Unsaved changes will be discarded.",
			ruleOverLimit: "Rule content exceeds 100 characters and cannot be saved.",
			confirmTitle: "Please confirm", confirm: "Continue", injectionEmpty: "No entries in the current filter",
			sourceTitle: "Source & evidence", relatedTitle: "Related", historyTitle: "History",
			moreActions: "More", copyReference: "Copy reference", referenceCopied: "Reference copied",
			entryKey: "Key", noEvidence: "No evidence", showAll: "Show all", showLess: "Show less",
			filters: "Filters", advancedTitle: "Advanced",
			injectionPaneLabel: "Switch pane", injectionListPane: "List", injectionPreviewPane: "Preview",
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

	const ruleContentLimit = 100;
	const ruleContentLength = content => Array.from(String(content || "").trim()).length;
	const ruleContentOverLimit = (kind, content) => kind === "rule" && ruleContentLength(content) > ruleContentLimit;
	const entryKinds = ["rule", "fact", "sop"];
	const kindText = (kind, t) => (entryKinds.includes(kind) ? t("kind." + kind) : kind);

	const RING_PATH = "M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831";

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
		const containerRef = React.useRef(null);
		const [tabWidth, setTabWidth] = React.useState(98);
		React.useEffect(() => {
			const element = containerRef.current;
			if (!element) return undefined;
			const measure = () => {
				const width = element.clientWidth;
				if (width > 0) setTabWidth(Math.max(64, Math.floor((width - 8) / tabs.length)));
			};
			measure();
			if (typeof ResizeObserver === "undefined") return undefined;
			const observer = new ResizeObserver(measure);
			observer.observe(element);
			return () => observer.disconnect();
		}, []);
		return h("div", { className: "lm-bounce-tabs", ref: containerRef },
			h("div", { className: "lm-bounce-pill", style: { width: tabWidth + "px", transform: `translateX(${activeIndex * (tabWidth + 2)}px)` } }),
			tabs.map(tab => h("button", {
				key: tab.id,
				type: "button",
				style: { width: tabWidth + "px" },
				className: "lm-bounce-tab" + (currentTab === tab.id ? " is-active" : ""),
				onClick: () => onSelect(tab.id),
			}, h("span", { className: "lm-bounce-tab-label" }, tab.label))));
	}

	function LocalDisclosure({ title, open, onOpenChange, count, children, className = "" }) {
		return h("div", { className: ("lm-disclosure " + className).trim() },
			h("button", {
				type: "button",
				className: "lm-disclosure-head",
				"aria-expanded": Boolean(open),
				onClick: () => onOpenChange && onOpenChange(!open),
			},
				h("span", { className: "lm-disclosure-caret", "aria-hidden": "true" }, open ? "▾" : "▸"),
				h("span", { className: "lm-disclosure-title" }, title),
				count === undefined || count === null ? null : h("span", { className: "lm-disclosure-count" }, count)),
			open ? h("div", { className: "lm-disclosure-body" }, children) : null);
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
		const kindOptions = entryKinds.map(value => ({
			value,
			label: h("span", { className: "lm-kind-option" },
				h("span", { className: "lm-browser-kind-dot lm-browser-kind-dot-" + value }),
				kindText(value, t)),
		}));

		return h("div", { className: "lm-browser-modal-backdrop", onMouseDown: event => { if (event.target === event.currentTarget && !busy) onClose(); } },
			h("section", { className: "lm-browser-modal", role: "dialog", "aria-modal": true },
				h("div", { className: "lm-browser-modal-heading" },
					h("h2", null, t("createTitle")),
					h(Button, { variant: "ghost", size: "sm", "aria-label": t("close"), disabled: busy, onClick: onClose }, h(IconCloseOutlineRegular, { size: 16 }))),
				h("form", { onSubmit: event => { event.preventDefault(); onSubmit(); } },
					error ? h("p", { className: "lm-browser-error", role: "alert" }, error) : null,
					h("div", { className: "lm-browser-field" },
						h("span", { className: "lm-browser-field-label" }, t("space")),
						h("div", { className: "lm-create-namespace" }, form.namespace || "-")),
					h(Field, { label: t("kindLabel") }, h(SelectMenu, { value: form.kind, options: kindOptions, disabled: busy, onChange: value => update("kind", value), ariaLabel: t("kindLabel"), triggerClassName: "lm-browser-input" })),
					h(Field, { label: t("topic") }, h(Input, { value: form.topic, placeholder: t("topicPlaceholder"), disabled: busy, onChange: event => update("topic", event.target.value) })),
					h(Field, { label: t("content") },
						h("textarea", { className: "lm-browser-textarea", value: form.content, placeholder: t("contentPlaceholder"), disabled: busy, onChange: event => update("content", event.target.value) }),
						form.kind === "rule" ? h("div", { className: "lm-browser-rule-meter" + (ruleTooLong ? " is-over" : "") },
							h("div", { className: "lm-browser-rule-meter-track" },
								h("div", { className: "lm-browser-rule-meter-fill", style: { width: Math.min(100, ruleContentLength(form.content)) + "%" } })),
							h("span", { className: "lm-browser-rule-length" }, `${ruleContentLength(form.content)} / 100`),
							ruleTooLong ? h("span", { className: "lm-browser-rule-error", role: "alert" }, t("ruleOverLimit")) : null) : null),
					h(Field, { label: t("evidence") }, h("textarea", { className: "lm-browser-textarea lm-browser-evidence-textarea", value: form.evidence, placeholder: t(form.kind === "rule" ? "ruleEvidencePlaceholder" : "evidencePlaceholder"), disabled: busy, onChange: event => update("evidence", event.target.value) })),
					h("div", { style: { display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 } },
						h(Button, { variant: "outline", type: "button", disabled: busy, onClick: onClose }, t("cancel")),
						h(Button, { variant: "primary", type: "submit", disabled: busy || !form.namespace || ruleTooLong }, busy ? t("creating") : t("create"))))));
	}

	function ErrorNotice({ title, message, onRetry, t }) {
		return h("div", { className: "lm-inline-error", role: "alert" },
			h("strong", null, title),
			onRetry ? h(Button, { variant: "outline", size: "sm", onClick: onRetry }, t("retry")) : null,
			message ? h("details", { className: "lm-error-details" },
				h("summary", null, t("details")),
				h("pre", null, message)) : null);
	}

	function ConfirmDialog({ open, title, message, confirmLabel, cancelLabel, onConfirm, onCancel }) {
		if (!open) return null;
		return h("div", { className: "lm-browser-modal-backdrop", onMouseDown: event => { if (event.target === event.currentTarget) onCancel(); } },
			h("section", { className: "lm-browser-modal lm-confirm-modal", role: "dialog", "aria-modal": true },
				h("div", { className: "lm-browser-modal-heading" },
					h("h2", null, title)),
				h("div", { className: "lm-confirm-body" }, message),
				h("div", { style: { display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 } },
					h(Button, { variant: "outline", type: "button", onClick: onCancel }, cancelLabel),
					h(Button, { variant: "primary", type: "button", onClick: onConfirm }, confirmLabel))));
	}

	function IndexUsage({ stats, t, kind, onKindChange }) {
		const [open, setOpen] = React.useState(false);
		const [hovered, setHovered] = React.useState(null);
		const used = Number(stats?.indexChars) || 0;
		const budget = Number(stats?.budgetChars) || 0;
		if (!stats || used <= 0 || budget <= 0) return null;
		const percent = Math.round((used / budget) * 100);
		const over = percent > 100;

		const parts = [
			{ key: "head", label: t("usage.label.head"), chars: Number(stats.headChars) || 0, count: null, kind: null },
			{ key: "rules", label: t("usage.label.rules"), chars: Number(stats.rulesChars) || 0, count: Number(stats.ruleCount) || 0, kind: "rule" },
			{ key: "facts", label: t("usage.label.facts"), chars: Number(stats.factsChars) || 0, count: Number(stats.factCount) || 0, kind: "fact" },
			{ key: "sops", label: t("usage.label.sops"), chars: Number(stats.sopsChars) || 0, count: Number(stats.sopCount) || 0, kind: "sop" },
		];

		const toggleKind = part => {
			if (!part.kind || !onKindChange) return;
			onKindChange(kind === part.kind ? "" : part.kind);
		};

		const segmentClass = part => "lm-usage-segment lm-usage-color-" + part.key
			+ (hovered === part.key ? " is-active" : "")
			+ (hovered && hovered !== part.key ? " is-dim" : "");

		const hoverProps = part => ({
			onMouseEnter: () => setHovered(part.key),
			onMouseLeave: () => setHovered(null),
			onFocus: () => setHovered(part.key),
			onBlur: () => setHovered(null),
		});

		const bar = h("span", { className: "lm-usage-bar" },
			parts.map(part => part.kind
				? h("button", {
					key: part.key,
					type: "button",
					className: segmentClass(part),
					style: { width: (percent * part.chars / used) + "%" },
					"aria-pressed": kind === part.kind,
					"aria-label": `${part.label} · ${part.count || 0} 条 · ${compactChars(part.chars)} · ${Math.round((part.chars / used) * 100)}%`,
					onClick: event => { event.stopPropagation(); toggleKind(part); },
					...hoverProps(part),
				})
				: h("span", {
					key: part.key,
					className: segmentClass(part),
					style: { width: (percent * part.chars / used) + "%" },
					title: t("notEntry"),
					...hoverProps(part),
				})));

		const legend = h("div", { className: "lm-usage-legend" },
			parts.map(part => {
				const share = used > 0 ? Math.round((part.chars / used) * 100) : 0;
				const figures = `${part.count ? part.count + " 条 · " : ""}${compactChars(part.chars)}`;
				const tooltip = `${part.label} · ${figures} · ${share}%`;
				const swatch = h("span", { className: "lm-usage-swatch lm-usage-color-" + part.key });
				const label = h("span", { className: "lm-usage-legend-label" }, part.label);
				const chars = h("span", { className: "lm-usage-legend-chars" }, figures);
				if (!part.kind) {
					return h("span", { key: part.key, className: "lm-usage-legend-wrap" },
						h(Tooltip, { label: tooltip + " · " + t("notEntry") },
							h("span", { className: "lm-usage-legend-item" }, swatch, label, chars)));
				}
				return h("span", { key: part.key, className: "lm-usage-legend-wrap" },
					h(Tooltip, { label: tooltip },
						h("button", {
							type: "button",
							className: "lm-usage-legend-item is-clickable"
								+ (kind === part.kind ? " is-active" : "")
								+ (hovered && hovered !== part.key ? " is-dim" : ""),
							"aria-pressed": kind === part.kind,
							onClick: () => toggleKind(part),
							...hoverProps(part),
						}, swatch, label, chars)));
			}));

		return h("div", { className: "lm-browser-usage-wrap" + (open ? " is-open" : "") },
			h("div", {
				className: "lm-usage-summary",
				role: "button",
				tabIndex: 0,
				"aria-expanded": open,
				onClick: () => setOpen(!open),
				onKeyDown: event => {
					if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setOpen(!open); }
				},
			},
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
					legend)));
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

	function splitPromptNames(text) {
		return String(text || "")
			.split("|")
			.map(name => name.trim())
			.filter(name => name && name !== "（空）" && name !== "（暂无事实）" && name !== "（暂无经验）");
	}

	// 把注入提示词拆成可读分组：头部说明、规则正文、事实/经验目录 token、省略说明。
	function parsePromptGroups(sections, ruleCount) {
		const groups = [];
		for (const section of sections || []) {
			const text = String(section.text || "");
			const lines = text.split("\n").map(line => line.trim()).filter(line => line !== "");
			const hasRuleMarker = text.includes("[RULES]");
			const group = { namespace: section.namespace, intro: null, head: [], preamble: [], rules: [], facts: [], sops: [], notices: [], overLimit: Boolean(section.overLimit) };
			const ruleLines = [];
			let collectingRules = false;
			for (const line of lines) {
				if (line.startsWith("记忆空间 [") || /^记忆 \[[^\]]+\]：/.test(line)) {
					group.intro = line;
					collectingRules = !hasRuleMarker;
					continue;
				}
				if (line.startsWith("[L2]")) {
					splitPromptNames(line.slice(4)).forEach(name => group.facts.push(name));
					collectingRules = false;
					continue;
				}
				if (line.startsWith("[L3]")) {
					splitPromptNames(line.slice(4)).forEach(name => group.sops.push(name.replace(/^sops\//, "").replace(/\.md$/, "")));
					collectingRules = false;
					continue;
				}
				if (line.startsWith("[RULES]")) {
					collectingRules = true;
					continue;
				}
				if (line.startsWith("[fact] ")) {
					group.facts.push(line.slice(7).trim());
					collectingRules = false;
					continue;
				}
				if (line.startsWith("[sop] ")) {
					group.sops.push(line.slice(6).trim());
					collectingRules = false;
					continue;
				}
				if (/^（[^）]*(已省略|过长)[^）]*）$/.test(line)) {
					group.notices.push(line);
					continue;
				}
				if (collectingRules) {
					ruleLines.push(line);
					continue;
				}
				group.head.push(line);
			}
			let bodies = ruleLines;
			if (ruleCount > 0 && ruleLines.length >= ruleCount) bodies = ruleLines.slice(ruleLines.length - ruleCount);
			else bodies = ruleLines.filter(line => line.length <= 100);
			group.rules = bodies;
			group.preamble = ruleLines.slice(0, Math.max(0, ruleLines.length - bodies.length));
			groups.push(group);
		}
		return groups;
	}

	function InjectionView({ controls, namespace, kind, onKindChange, onOpenEntry, t }) {
		const [data, setData] = React.useState(null);
		const [loading, setLoading] = React.useState(true);
		const [error, setError] = React.useState(null);
		const [tab, setTab] = React.useState("grouped");
		const [focusedId, setFocusedId] = React.useState(null);
		const [copyState, setCopyState] = React.useState(null);
		const [recallInput, setRecallInput] = React.useState("");
		const [recallQuery, setRecallQuery] = React.useState("");
		const [showSource, setShowSource] = React.useState(false);
		const [mobilePane, setMobilePane] = React.useState("list");
		const requestRef = React.useRef(0);
		const itemRefs = React.useRef(new Map());
		const chipRefs = React.useRef(new Map());

		const load = React.useCallback(() => {
			if (!namespace) return;
			const token = ++requestRef.current;
			setLoading(true);
			setError(null);
			controls.getInjectionState({ namespace, query: recallQuery || undefined })
				.then(result => {
					if (token !== requestRef.current) return;
					setData(result);
					setLoading(false);
				})
				.catch(failure => {
					if (token !== requestRef.current) return;
					setData(null);
					setError(String(failure?.message || failure));
					setLoading(false);
				});
		}, [controls, namespace]);

		React.useEffect(() => { load(); }, [load]);

		React.useEffect(() => {
			if (!focusedId) return;
			const chip = chipRefs.current.get(focusedId);
			if (chip?.scrollIntoView) chip.scrollIntoView({ block: "nearest" });
			const row = itemRefs.current.get(focusedId);
			if (row?.scrollIntoView) row.scrollIntoView({ block: "nearest" });
		}, [focusedId, tab]);

		if (loading) return h("div", { className: "lm-injection-view" }, h("p", { className: "lm-injection-state" }, t("loading")));
		if (error || !data) {
			return h("div", { className: "lm-injection-view" },
				h(ErrorNotice, { title: t("loadFailed"), message: error, onRetry: load, t }));
		}

		const items = data.items || [];
		const ruleItems = items.filter(item => item.kind === "rule");
		const itemId = item => item.kind + ":" + item.key;
		const findItem = (entryKind, name) => items.find(item => item.kind === entryKind && item.promptToken === name)
			|| items.find(item => item.kind === entryKind && (item.key === name || item.title === name));
		const groups = parsePromptGroups(data.sections, ruleItems.length);
		const visibleItems = kind ? items.filter(item => item.kind === kind) : items;
		const focusedItem = items.find(item => itemId(item) === focusedId) || null;

		const rawLines = String(data.combinedText || "").split("\n");
		const sectionOffsets = new Map();
		let offset = 0;
		for (const section of data.sections || []) {
			sectionOffsets.set(section.namespace, offset);
			offset += String(section.text || "").split("\n").length + 2;
		}
		const itemByLine = new Map();
		const lineByItem = new Map();
		for (const item of items) {
			if (item.promptNamespace == null || item.promptLine == null) continue;
			const base = sectionOffsets.get(item.promptNamespace);
			if (base === undefined) continue;
			const line = base + item.promptLine;
			itemByLine.set(line, item);
			lineByItem.set(itemId(item), line);
		}
		const rawHit = new Set(focusedItem && lineByItem.has(focusedId) ? [lineByItem.get(focusedId)] : []);

		const copyRaw = async () => {
			const text = String(data.combinedText || "");
			try {
				if (!navigator?.clipboard?.writeText) throw new Error("clipboard unavailable");
				await navigator.clipboard.writeText(text);
				setCopyState("copied");
			} catch {
				setCopyState("failed");
			}
		};

		const filterChips = [["", t("all")], ...entryKinds.map(value => [value, kindText(value, t)])].map(([value, label]) => {
			const count = value ? items.filter(item => item.kind === value).length : items.length;
			return h("button", {
				key: value || "all",
				type: "button",
				className: "lm-injection-filter" + (kind === value ? " is-active" : ""),
				"aria-pressed": kind === value,
				onClick: () => onKindChange && onKindChange(value),
			}, label, h("span", { className: "lm-injection-filter-count" }, count));
		});

		const listPane = h("div", { className: "lm-injection-table-pane" },
			h("div", { className: "lm-injection-pane-head" },
				h("h3", null, "注入取舍名单"),
				h("span", { className: "lm-injection-pane-meta" }, `${visibleItems.length} / ${items.length}`)),
			visibleItems.length
				? h("div", { className: "lm-injection-items" },
					visibleItems.map(item => {
						const id = itemId(item);
						return h("div", {
							key: id,
							className: "lm-injection-item" + (focusedId === id ? " is-active" : ""),
							ref: element => { if (element) itemRefs.current.set(id, element); else itemRefs.current.delete(id); },
							onClick: () => { setFocusedId(id); setMobilePane("preview"); },
							tabIndex: 0,
							onKeyDown: event => { if (event.key === "Enter") { setFocusedId(id); setMobilePane("preview"); } },
						},
							h("span", { className: "lm-injection-item-title", title: item.title }, item.title),
							h("span", { className: "lm-injection-item-kind lm-browser-kind lm-browser-kind-" + item.kind }, kindText(item.kind, t)));
					}))
				: h("p", { className: "lm-injection-empty" }, t("injectionEmpty")));

		const chip = (entryKind, name, index) => {
			const item = findItem(entryKind, name);
			const id = item ? itemId(item) : entryKind + ":" + name;
			return h("button", {
				key: id + ":" + index,
				type: "button",
				className: "lm-prompt-chip lm-prompt-chip-" + entryKind + (focusedId === id ? " is-active" : ""),
				title: item ? item.title : name,
				ref: element => { if (element) chipRefs.current.set(id, element); else chipRefs.current.delete(id); },
				onClick: () => setFocusedId(id),
			}, name);
		};

		const groupedPane = h("div", { className: "lm-prompt-groups" },
			groups.length
				? groups.map((group, groupIndex) => h("section", { key: group.namespace + ":" + groupIndex, className: "lm-prompt-group" },
					h("h4", { className: "lm-prompt-group-title" }, group.namespace || namespace),
					group.intro ? h("p", { className: "lm-prompt-intro" }, group.intro) : null,
					group.head.length ? h("div", { className: "lm-prompt-head" }, renderMarkdown(group.head.join("\n"))) : null,
					group.preamble.length ? h("div", { className: "lm-prompt-preamble" }, group.preamble.map((line, index) => h("p", { key: "p" + index }, line))) : null,
					group.rules.length ? h("div", { className: "lm-prompt-block" },
						h("h5", null, `${t("groupRules")} (${group.rules.length})`),
						h("div", { className: "lm-prompt-rules" }, group.rules.map((body, index) => {
							const item = ruleItems[index];
							const id = item ? itemId(item) : "rule:" + index;
							return h("article", {
								key: id + ":" + index,
								className: "lm-prompt-rule" + (focusedId === id ? " is-active" : ""),
								ref: element => { if (element) chipRefs.current.set(id, element); else chipRefs.current.delete(id); },
								onClick: () => setFocusedId(id),
							}, renderMarkdown(body));
						}))) : null,
					group.facts.length ? h("div", { className: "lm-prompt-block" },
						h("h5", null, `${t("groupFacts")} (${group.facts.length})`),
						h("div", { className: "lm-prompt-chips" }, group.facts.map((name, index) => chip("fact", name, index)))) : null,
					group.sops.length ? h("div", { className: "lm-prompt-block" },
						h("h5", null, `${t("groupSops")} (${group.sops.length})`),
						h("div", { className: "lm-prompt-chips" }, group.sops.map((name, index) => chip("sop", name, index)))) : null,
					group.notices.length ? h("div", { className: "lm-prompt-notices" }, group.notices.map((line, index) => h("p", { key: "n" + index }, line))) : null))
				: h("p", { className: "lm-injection-empty" }, t("noPreview")));

		const rawPane = h("div", { className: "lm-prompt-raw" },
			rawLines.map((line, index) => {
				const item = itemByLine.get(index);
				return h("div", {
					key: index,
					className: "lm-prompt-raw-line" + (rawHit.has(index) ? " is-hit" : "") + (item ? " is-linked" : ""),
					onClick: item ? () => setFocusedId(itemId(item)) : undefined,
					title: item ? item.title : undefined,
				}, line === "" ? " " : line);
			}));

		const focusedHeader = focusedItem
			? h("div", { className: "lm-injection-focused" },
				h("span", { className: "lm-injection-focused-title", title: focusedItem.title }, focusedItem.title),
				h("button", {
					type: "button",
					className: "lm-capsule-tag",
					onClick: () => onOpenEntry && onOpenEntry({ namespace, kind: focusedItem.kind, key: focusedItem.key }),
				}, t("openEntry")))
			: null;

		const textPane = h("div", { className: "lm-injection-text-pane" },
			h("div", { className: "lm-injection-pane-head" },
				focusedHeader,
				h("div", { className: "lm-injection-tabs", role: "tablist" },
					h("button", { type: "button", role: "tab", "aria-selected": tab === "grouped", className: "lm-injection-tab" + (tab === "grouped" ? " is-active" : ""), onClick: () => setTab("grouped") }, t("groupedPrompt")),
					h("button", { type: "button", role: "tab", "aria-selected": tab === "raw", className: "lm-injection-tab" + (tab === "raw" ? " is-active" : ""), onClick: () => setTab("raw") }, t("rawPrompt"))),
				h(Button, { variant: "outline", size: "sm", className: "lm-copy-btn", onClick: copyRaw }, copyState === "copied" ? t("copied") : t("copyPrompt"))),
			copyState === "failed" ? h("p", { className: "lm-inline-error", role: "alert" }, t("copyFailed")) : null,
			tab === "grouped" ? groupedPane : rawPane);

		const advancedPanel = h("div", { className: "lm-injection-advanced-body" },
			h("div", { className: "lm-injection-recall" },
				h(Input, { type: "search", value: recallInput, placeholder: t("recallPlaceholder"), onChange: event => setRecallInput(event.target.value), onKeyDown: event => { if (event.key === "Enter") setRecallQuery(recallInput); } }),
				h(Button, { variant: "outline", size: "sm", className: "lm-recall-btn", onClick: () => setRecallQuery(recallInput) }, t("recallQuery")),
				recallQuery ? h(Button, { variant: "ghost", size: "sm", onClick: () => { setRecallInput(""); setRecallQuery(""); } }, t("clearFilter")) : null),
			h("dl", { className: "lm-injection-source" },
				h("div", null, h("dt", null, t("space")), h("dd", null, namespace || "-")),
				h("div", null, h("dt", null, t("sourceBudget")), h("dd", null, `${compactChars(data.indexChars)} / ${compactChars(data.budgetChars)}`)),
				h("div", null, h("dt", null, t("sourceTarget")), h("dd", null, compactChars(data.targetChars))),
				h("div", null, h("dt", null, t("sourceColdRatio")), h("dd", null, `${Math.round((Number(data.basis?.coldRatio) || 0) * 100)}%`)),
				h("div", null, h("dt", null, t("coldCandidateTitle")), h("dd", null, String(data.coldCount || 0))),
				h("div", null, h("dt", null, t("sourceRecall")), h("dd", null, data.basis?.recallQuery || "-"))));

		const paneSwitch = SegmentedControl
			? h("div", { className: "lm-injection-mobile-switch" },
				h(SegmentedControl, {
					value: mobilePane,
					onChange: setMobilePane,
					label: t("injectionPaneLabel"),
					options: [
						{ value: "list", label: t("injectionListPane") },
						{ value: "preview", label: t("injectionPreviewPane") },
					],
				}))
			: null;

		return h("div", { className: "lm-injection-view" },
			h("div", { className: "lm-injection-toolbar" },
				h("div", { className: "lm-injection-toolbar-row" },
					h("span", { className: "lm-injection-namespace" }, `${t("space")}: ${namespace || "-"}`),
					h("span", { className: "lm-injection-scope" }, t("previewScope")),
					paneSwitch),
				h("div", { className: "lm-injection-toolbar-row" },
					h("div", { className: "lm-injection-filters" }, filterChips),
					ToolbarPopover
					? h(ToolbarPopover, {
						title: t("advancedTitle"),
						open: showSource,
						onOpenChange: setShowSource,
						children: advancedPanel,
						ariaLabel: t("advancedTitle"),
						align: "end",
						side: "bottom",
						className: "lm-injection-advanced",
						panelClassName: "lm-injection-advanced-panel",
					})
					: h(Disclosure, { title: t("advancedTitle"), open: showSource, onOpenChange: setShowSource, className: "lm-injection-advanced" }, advancedPanel))),
			h("div", { className: "lm-injection-split" + (SegmentedControl ? " lm-injection-split-" + mobilePane : "") }, listPane, textPane));
	}

	// 维护驾驶舱：真实数据绑定
	// 驾驶舱数据来自后台维护工作区（纯只读）：候选 left/right 两端、长期低热集合与判定口径。
	const mapCandidate = raw => ({
		id: raw?.id || "",
		kind: raw?.kind || "",
		reason: raw?.reason || "",
		score: raw?.score ?? null,
		sharedTokens: raw?.sharedTokens ?? null,
		left: raw?.left || null,
		right: raw?.right || null,
	});

	const mapColdEntry = raw => ({
		entry: raw?.entry || null,
		title: raw?.title || raw?.entry?.key || "",
		revision: raw?.revision ?? null,
		heat: raw?.heat ?? null,
		ageDays: raw?.ageDays ?? null,
		ageBasis: raw?.ageBasis || "",
		reason: raw?.reason || "",
	});

	function CockpitView({ controls, namespace, draft, onDraftChange, onDiscardRequest, onBusyChange, onRefreshEntries, t }) {
		const [workspace, setWorkspace] = React.useState(null);
		const [workspaceBusy, setWorkspaceBusy] = React.useState(false);
		const [workspaceError, setWorkspaceError] = React.useState(null);
		const [candidate, setCandidate] = React.useState(null);
		const [review, setReview] = React.useState(null);
		const [reviewBusy, setReviewBusy] = React.useState(false);
		const [reviewError, setReviewError] = React.useState(null);
		const [submitBusy, setSubmitBusy] = React.useState(false);
		const [submitError, setSubmitError] = React.useState(null);
		const [submitNotice, setSubmitNotice] = React.useState(null);
		const [coldTarget, setColdTarget] = React.useState(null);
		const [coldDetail, setColdDetail] = React.useState(null);
		const [coldBusy, setColdBusy] = React.useState(false);
		const [coldError, setColdError] = React.useState(null);
		const [confirmState, setConfirmState] = React.useState(null);
		const [metaOpen, setMetaOpen] = React.useState(false);
		const [decisionOpen, setDecisionOpen] = React.useState(false);
		const [coldMetaOpen, setColdMetaOpen] = React.useState(false);
		const [showAllCandidates, setShowAllCandidates] = React.useState(false);
		const [showAllCold, setShowAllCold] = React.useState(false);
		const [partial, setPartial] = React.useState(false);
		const [pendingRebuild, setPendingRebuild] = React.useState(false);
		const [indexWarning, setIndexWarning] = React.useState(null);
		const workspaceRef = React.useRef(0);
		const reviewRef = React.useRef(0);

		const load = React.useCallback(() => {
			const token = ++workspaceRef.current;
			if (!namespace) {
				setWorkspace(null);
				setWorkspaceBusy(false);
				return;
			}
			setWorkspaceBusy(true);
			setWorkspaceError(null);
			controls.getMaintenanceWorkspace({ namespace })
				.then(value => {
					if (token !== workspaceRef.current) return;
					setWorkspace(value || null);
				})
				.catch(failure => {
					if (token !== workspaceRef.current) return;
					setWorkspace(null);
					setWorkspaceError(String(failure?.message || failure));
				})
				.finally(() => {
					if (token === workspaceRef.current) setWorkspaceBusy(false);
				});
		}, [controls, namespace]);

		React.useEffect(() => { load(); }, [load]);

		// 空间切换或重新检查后，迟回包不得覆盖当前结果。
		React.useEffect(() => {
			reviewRef.current += 1;
			setCandidate(null);
			setReview(null);
			setColdTarget(null);
			setColdDetail(null);
			setSubmitError(null);
			setSubmitNotice(null);
			setIndexWarning(null);
			setWorkspace(null);
		}, [namespace]);

		React.useEffect(() => {
			if (!draft || candidate || !draft.left || !draft.right) return;
			setCandidate({ id: "", kind: draft.kind || "", reason: "", score: null, left: { entry: draft.left, title: draft.title }, right: { entry: draft.right, title: "" } });
		}, [draft, candidate]);

		// 重新审阅：先经父的弃稿确认，确认后关闭旧对比并刷新工作区，由用户重新选择候选。
		React.useEffect(() => {
			if (!pendingRebuild || draft) return;
			setPendingRebuild(false);
			setCandidate(null);
			setReview(null);
			setPartial(false);
			setSubmitError(null);
			setShowAllCandidates(false);
			load();
		}, [pendingRebuild, draft]);

		const candidates = (workspace?.candidates || []).map(mapCandidate);
		const coldEntries = (workspace?.cold?.items || []).map(mapColdEntry);
		const visibleCandidates = showAllCandidates ? candidates : candidates.slice(0, 6);
		const visibleCold = showAllCold ? coldEntries : coldEntries.slice(0, 6);
		const criteria = workspace?.cold?.criteria || null;
		const counts = workspace?.counts || {};
		const scannedAt = workspace?.scannedAt || null;

		const reasonLabel = reason => {
			const map = { exact: t("reasonExact"), near: t("reasonNear"), overlap: t("reasonOverlap"), contains: t("reasonContains") };
			return map[reason] || reason || "";
		};

		const sideTitle = side => (side ? (side.title || side.entry?.key || "") : "");
		const sideEntry = side => (side ? side.entry : null);

		const ageBasisLabel = basis => (basis === "meta.createdAt" ? t("coldAgeBasisCreated") : basis || "");

		const excludeLabel = value => {
			const map = { rule: t("kindRuleLabel"), archived: t("archived") };
			return map[value] || value;
		};
		const criteriaText = criteria
			? `${t("coldCriteriaLabel")}: ${ageBasisLabel(criteria.ageBasis)} ≥ ${criteria.thresholdDays ?? "-"} ${t("coldDaysUnit")} · ${t("coldHeatBase")} < ${criteria.maxHeat ?? "-"}${Array.isArray(criteria.excludes) && criteria.excludes.length ? ` · ${t("coldExcludes")} ${criteria.excludes.map(excludeLabel).join(" / ")}` : ""}`
			: "";
		const criteriaTitle = criteria && criteria.heatBasis
			? String(criteria.heatBasis).replace(/^entryHeat\s*/, "").replace("基础热度", t("coldHeatBase"))
			: "";

		const candidateColumns = [
			{
				id: "sideOne",
				header: t("candidateSideOne"),
				width: "34%",
				accessorFn: row => sideTitle(row.left),
				cell: ({ row }) => h("span", { className: "lm-cockpit-cell-title", title: sideTitle(row.left) }, sideTitle(row.left)),
			},
			{
				id: "sideTwo",
				header: t("candidateSideTwo"),
				width: "34%",
				accessorFn: row => sideTitle(row.right),
				cell: ({ row }) => h("span", { className: "lm-cockpit-cell-title", title: sideTitle(row.right) }, sideTitle(row.right)),
			},
			{ id: "reason", header: t("candidateReasonColumn"), width: "18%", accessorFn: row => row.reason, cell: ({ row }) => h("span", { className: "lm-cockpit-cell-reason" }, reasonLabel(row.reason)) },
			{
				id: "action",
				header: t("candidateActionColumn"),
				width: "14%",
				accessorFn: () => "",
				cell: ({ row }) => h(Button, { variant: "outline", size: "sm", onClick: () => openCandidate(row) }, t("candidateCompareAction")),
			},
		];

		// 两端详情一次取回；按身份对齐，避免依赖返回顺序。
		const loadReview = (entries, apply) => {
			const token = ++reviewRef.current;
			setReviewBusy(true);
			setReviewError(null);
			controls.getMaintenanceReview({ namespace, entries })
				.then(value => {
					if (token !== reviewRef.current) return;
					const items = (value && value.items) || [];
					const byKey = new Map(items.map(item => [`${item.entry?.namespace}|${item.entry?.kind}|${item.entry?.key}`, item]));
					const pick = ref => byKey.get(`${ref?.namespace}|${ref?.kind}|${ref?.key}`) || null;
					apply(items, pick);
				})
				.catch(failure => {
					if (token !== reviewRef.current) return;
					setReviewError(String(failure?.message || failure));
				})
				.finally(() => {
					if (token === reviewRef.current) setReviewBusy(false);
				});
		};

		const openCandidate = row => {
			setCandidate(row);
			setPartial(false);
			setMetaOpen(false);
			setDecisionOpen(false);
			setReview(null);
			setSubmitError(null);
			setSubmitNotice(null);
			loadReview([sideEntry(row.left), sideEntry(row.right)], (items, pick) => {
				setReview({ left: pick(sideEntry(row.left)) || items[0] || null, right: pick(sideEntry(row.right)) || items[1] || null });
			});
		};

		const closeCandidate = () => {
			reviewRef.current += 1;
			setCandidate(null);
			setReview(null);
			setReviewError(null);
			setSubmitError(null);
			setSubmitNotice(null);
		};

		const joinBodies = (first, second) => {
			const left = String(first || "").trim();
			const right = String(second || "").trim();
			if (!left) return right;
			if (!right) return left;
			if (left === right) return left;
			return left + "\n\n---\n\n" + right;
		};

		const buildDraft = (keep, pair) => {
			const kept = keep === "right" ? pair.right : pair.left;
			const other = keep === "right" ? pair.left : pair.right;
			const exact = candidate?.reason === "exact";
			const content = exact ? String(kept?.content || "") : joinBodies(kept?.content, other?.content);
			const evidence = exact ? String(kept?.evidence || "") : joinBodies(kept?.evidence, other?.evidence);
			const next = {
				keep,
				kind: candidate?.kind || kept?.entry?.kind || "",
				title: kept?.title || sideTitle(candidate?.left),
				content,
				evidence,
				left: sideEntry(candidate?.left),
				right: sideEntry(candidate?.right),
				leftRevision: pair.left?.revision ?? null,
				rightRevision: pair.right?.revision ?? null,
			};
			next.baseline = { title: next.title, content: next.content, evidence: next.evidence };
			return next;
		};

		const startMerge = () => {
			if (!review || !candidate) return;
			onDraftChange(buildDraft(draft?.keep || "left", review));
		};

		// 切换保留身份不重置用户已经编辑过的正文；只有标题随保留方变化。
		const setKeep = keep => {
			if (!draft || !review) return;
			const kept = keep === "right" ? review.right : review.left;
			const title = kept?.title || draft.title;
			onDraftChange({ ...draft, keep, title, baseline: { ...(draft.baseline || {}), title } });
		};

		const ruleOverLimit = draft && draft.kind === "rule" && ruleContentLength(draft.content) > 100;

		const submitMerge = () => {
			if (!draft || submitBusy || ruleOverLimit) return;
			setConfirmState({
				title: t("mergeConfirmTitle"),
				message: h("div", null,
					h("p", null, `${t("mergeKeepLabel")}: ${draft.title}`),
					h("p", null, `${t("mergeArchiveLabel")}: ${draft.keep === "left" ? sideTitle(candidate?.right) : sideTitle(candidate?.left)}`)),
				confirmLabel: t("mergeSubmit"),
				cancelLabel: t("cancel"),
				onConfirm: () => { setConfirmState(null); runMerge(); },
				onCancel: () => setConfirmState(null),
			});
		};

		const runMerge = async () => {
			if (!draft || submitBusy) return;
			const keep = draft.keep === "right" ? "right" : "left";
			setSubmitBusy(true);
			setSubmitError(null);
			onBusyChange && onBusyChange(true);
			try {
				const result = await controls.mergeMaintenanceEntries({
					namespace,
					left: draft.left,
					right: draft.right,
					keep,
					ifLeftRevision: draft.leftRevision,
					ifRightRevision: draft.rightRevision,
					content: draft.content,
					evidence: draft.evidence,
				});
				if (result && result.partial) {
					const errorText = String(result.error || "");
					if (result.archived || errorText.includes("archive_applied_index_failed")) {
						// 合并与归档都已生效，只是 L1 索引刷新失败：写操作已完成，草稿作废。
						setPartial(false);
						onDraftChange(null);
						closeCandidate();
						setIndexWarning(t("mergeIndexRefreshFailed"));
						load();
						onRefreshEntries && onRefreshEntries();
						return;
					}
					setPartial(true);
					setSubmitError(t("mergePartial"));
					load();
					onRefreshEntries && onRefreshEntries();
					return;
				}
				if (!result || result.ok !== true) {
					setSubmitError(t("mergeFailedTitle"));
					return;
				}
				setPartial(false);
				onDraftChange(null);
				closeCandidate();
				setSubmitNotice(t("mergeDone"));
				load();
				onRefreshEntries && onRefreshEntries();
			} catch (failure) {
				const message = String(failure?.message || failure);
				setSubmitError(message.includes("revision_conflict") ? t("mergeConflict") : message);
			} finally {
				setSubmitBusy(false);
				onBusyChange && onBusyChange(false);
			}
		};

		const openCold = item => {
			setColdTarget(item);
			setColdMetaOpen(false);
			setColdDetail(null);
			setColdError(null);
			loadReview([item.entry], items => { setColdDetail(items[0] || null); });
		};

		const closeCold = () => {
			reviewRef.current += 1;
			setColdTarget(null);
			setColdDetail(null);
			setColdError(null);
		};

		const submitArchiveCold = () => {
			if (!coldTarget || submitBusy) return;
			setConfirmState({
				title: t("coldArchiveConfirmTitle"),
				message: h("p", null, `${t("coldArchiveConfirmBody")}: ${coldTarget.title}`),
				confirmLabel: t("coldArchiveButton"),
				cancelLabel: t("cancel"),
				onConfirm: () => { setConfirmState(null); runArchiveCold(); },
				onCancel: () => setConfirmState(null),
			});
		};

		const runArchiveCold = async () => {
			if (!coldTarget) return;
			const entry = coldTarget.entry;
			const revision = coldDetail?.revision ?? coldTarget.revision;
			setSubmitBusy(true);
			setColdError(null);
			onBusyChange && onBusyChange(true);
			try {
				await controls.archiveEntry({ namespace, entry, ifRevision: revision });
				closeCold();
				setSubmitNotice(t("archivedDone"));
				load();
				onRefreshEntries && onRefreshEntries();
			} catch (failure) {
				const message = String(failure?.message || failure);
				if (message.includes("archive_applied_index_failed")) {
					closeCold();
					setIndexWarning(t("archiveAppliedIndexFailed"));
					load();
					onRefreshEntries && onRefreshEntries();
					return;
				}
				setColdError(message.includes("revision_conflict") ? t("conflict") : message);
			} finally {
				setSubmitBusy(false);
				onBusyChange && onBusyChange(false);
			}
		};

		const sideBlock = (label, side) => h("div", { className: "lm-cockpit-compare-side" },
			h("div", { className: "lm-cockpit-compare-head" },
				h("span", { className: "lm-cockpit-side-label" }, label),
				h("strong", { className: "lm-cockpit-side-title", title: side?.title || "" }, side?.title || ""),
				h("span", { className: "lm-browser-kind" }, side?.entry?.kind ? kindText(side.entry.kind, t) : "")),
			h("div", { className: "lm-browser-md-preview lm-cockpit-content" }, renderMarkdown(side?.content || "")),
			h(Disclosure, { title: t("candidateMetaTitle"), open: metaOpen, onOpenChange: setMetaOpen, className: "lm-cockpit-meta" },
				h("div", { className: "lm-detail-meta-list" },
					h("div", null, h("span", { className: "lm-detail-meta-label" }, t("evidence")), h("pre", { className: "lm-detail-evidence" }, side?.evidence || t("noEvidence"))),
					h("div", null, h("span", { className: "lm-detail-meta-label" }, t("updatedAt")), h("span", null, side?.updatedAt ? time(side.updatedAt) : "-")),
					h("div", null, h("span", { className: "lm-detail-meta-label" }, t("entryKey")), h("code", null, side?.entry?.key || "-")))));

		const compareArea = candidate ? h("section", { className: "lm-cockpit-panel" },
			h("div", { className: "lm-cockpit-panel-head" },
				h("h3", null, t("compareTitle")),
				h(Button, { variant: "ghost", size: "sm", disabled: submitBusy, onClick: () => { if (draft) { onDiscardRequest && onDiscardRequest(); } else { closeCandidate(); } } }, t("cancel"))),
			reviewBusy ? h("p", { className: "lm-detail-hint" }, t("loading")) : null,
			reviewError ? h(ErrorNotice, { title: t("loadFailed"), message: reviewError, onRetry: () => openCandidate(candidate), t }) : null,
			review ? h("div", { className: "lm-cockpit-compare" },
				sideBlock(t("candidateSideOne"), review.left),
				sideBlock(t("candidateSideTwo"), review.right),
				h(Disclosure, { title: t("candidateDecisionTitle"), open: decisionOpen, onOpenChange: setDecisionOpen, className: "lm-cockpit-meta" },
					h("div", { className: "lm-detail-meta-list" },
						h("div", null, h("span", { className: "lm-detail-meta-label" }, t("candidateReasonColumn")), h("span", null, reasonLabel(candidate?.reason))),
						h("div", null, h("span", { className: "lm-detail-meta-label" }, t("candidateScoreColumn")), h("span", null, candidate?.score === null || candidate?.score === undefined ? "-" : String(Number(candidate.score).toFixed(2)))),
						h("div", null, h("span", { className: "lm-detail-meta-label" }, t("candidateSharedTokens")), h("span", null, candidate?.sharedTokens === null || candidate?.sharedTokens === undefined ? "-" : String(candidate.sharedTokens)))))) : null,
			review && !draft ? h("div", { className: "lm-cockpit-panel-actions" },
				h(Button, { variant: "primary", size: "sm", disabled: submitBusy, onClick: startMerge }, t("mergeDraftTitle"))) : null,
			draft ? h("div", { className: "lm-cockpit-draft" },
				h("div", { className: "lm-cockpit-draft-head" },
					h("h4", null, t("mergeDraftTitle")),
					h("div", { className: "lm-cockpit-keep" },
						h("span", { className: "lm-detail-meta-label" }, t("keepWhich")),
						h(Button, { variant: draft.keep === "left" ? "primary" : "outline", size: "sm", disabled: submitBusy || partial, onClick: () => setKeep("left") }, t("keepSideLeft")),
						h(Button, { variant: draft.keep === "right" ? "primary" : "outline", size: "sm", disabled: submitBusy || partial, onClick: () => setKeep("right") }, t("keepSideRight")))),
				h("div", { className: "lm-browser-field" },
					h("span", { className: "lm-browser-field-label" }, t("mergeKeptTitle")),
					h("div", { className: "lm-create-namespace" }, draft.title)),
				h("p", { className: "lm-cockpit-draft-meta" }, `${t("kindLabel")}: ${draft.kind ? kindText(draft.kind, t) : "-"} · ${t("space")}: ${namespace || "-"}`),
				h(Field, { label: t("content") },
					h("textarea", { className: "lm-browser-textarea lm-browser-content", readOnly: partial, value: draft.content, onChange: event => onDraftChange({ ...draft, content: event.target.value }) })),
				draft.kind === "rule" ? h("div", { className: "lm-browser-rule-meter" + (ruleOverLimit ? " is-over" : "") },
					h("div", { className: "lm-browser-rule-meter-track" },
						h("div", { className: "lm-browser-rule-meter-fill", style: { width: Math.min(100, ruleContentLength(draft.content)) + "%" } })),
					h("span", { className: "lm-browser-rule-length" }, `${ruleContentLength(draft.content)} / 100 字符`)) : null,
				h(Field, { label: t("evidence") }, h("textarea", { className: "lm-browser-textarea lm-browser-evidence-textarea", readOnly: partial, value: draft.evidence, onChange: event => onDraftChange({ ...draft, evidence: event.target.value }) })),
				submitError ? h(ErrorNotice, { title: t("mergeFailedTitle"), message: submitError, t }) : null,
				h("div", { className: "lm-cockpit-panel-actions" },
					h(Button, { variant: "ghost", size: "sm", disabled: submitBusy, onClick: () => { setSubmitError(null); onDiscardRequest && onDiscardRequest(); } }, t("cancel")),
					partial
						? h(Button, { variant: "primary", size: "sm", disabled: submitBusy, onClick: () => { setPendingRebuild(true); onDiscardRequest && onDiscardRequest(); } }, t("reReview"))
						: h(Button, { variant: "primary", size: "sm", disabled: submitBusy || ruleOverLimit || !draft.content.trim(), onClick: submitMerge }, submitBusy ? t("saving") : t("mergeSubmit")))) : null) : null;

		const coldArea = coldTarget ? h("section", { className: "lm-cockpit-panel" },
			h("div", { className: "lm-cockpit-panel-head" },
				h("h3", null, coldTarget.title),
				h(Button, { variant: "ghost", size: "sm", disabled: submitBusy, onClick: closeCold }, t("cancel"))),
			coldBusy ? h("p", { className: "lm-detail-hint" }, t("loading")) : null,
			coldError ? h(ErrorNotice, { title: t("loadFailed"), message: coldError, onRetry: () => openCold(coldTarget), t }) : null,
			coldDetail ? h("div", null,
				h("p", { className: "lm-detail-hint" }, t("coldReasonText", { days: coldTarget.ageDays === null || coldTarget.ageDays === undefined ? "-" : String(coldTarget.ageDays), heat: coldTarget.heat === null || coldTarget.heat === undefined ? "-" : String(coldTarget.heat) })),
				h("div", { className: "lm-browser-md-preview lm-cockpit-content" }, renderMarkdown(coldDetail.content || "")),
				h(Disclosure, { title: t("candidateMetaTitle"), open: coldMetaOpen, onOpenChange: setColdMetaOpen, className: "lm-cockpit-meta" },
					h("div", { className: "lm-detail-meta-list" },
						h("div", null, h("span", { className: "lm-detail-meta-label" }, t("evidence")), h("pre", { className: "lm-detail-evidence" }, coldDetail.evidence || t("noEvidence"))),
						h("div", null, h("span", { className: "lm-detail-meta-label" }, t("updatedAt")), h("span", null, coldDetail.updatedAt ? time(coldDetail.updatedAt) : "-")))),
				h("div", { className: "lm-cockpit-panel-actions" },
					h(Button, { variant: "primary", size: "sm", disabled: submitBusy, onClick: submitArchiveCold }, t("coldArchiveButton")))) : null) : null;

		const candidateSection = h("section", { className: "lm-cockpit-panel" },
			h("div", { className: "lm-cockpit-panel-head" },
				h("h3", null, `${t("candidateTitle")}${counts.candidates ? ` ${counts.candidates}` : ""}`),
				h("div", { className: "lm-cockpit-panel-tools" },
					scannedAt ? h("span", { className: "lm-cockpit-scanned" }, `${t("scannedAt", { time: time(scannedAt) })}${counts.checked ? ` · ${t("checkedCount", { count: counts.checked })}` : ""}`) : null,
					candidates.length > 6 ? h(Button, { variant: "ghost", size: "sm", onClick: () => setShowAllCandidates(value => !value) }, showAllCandidates ? t("showLess") : t("showAll")) : null)),
			workspaceBusy ? h("p", { className: "lm-detail-hint" }, t("checking")) : null,
			workspace && !candidates.length ? h("div", { className: "lm-empty-inline" }, h("span", { className: "lm-empty-icon" }, "○"), h("span", null, t("noCandidates"))) : null,
			candidates.length && DataTable
				? h("div", { className: "lm-browser-advanced-table lm-cockpit-advanced-table" },
					h(DataTable, {
						data: visibleCandidates,
						columns: candidateColumns,
						getRowId: (row, index) => row.id || `${index}`,
						hidePagination: true,
						isLoading: workspaceBusy,
						contentProps: { emptyTitle: t("noCandidates"), emptyDescription: null, emptyActionLabel: null },
						className: "lm-eui-dt-host",
					}, DataTableContent ? h(DataTableContent, { emptyTitle: t("noCandidates"), emptyDescription: null, emptyActionLabel: null }) : null))
				: null);

		const coldSection = h("section", { className: "lm-cockpit-panel" },
			h("div", { className: "lm-cockpit-panel-head" },
				h("h3", null, `${t("coldTitle")}${counts.cold ? ` ${counts.cold}` : ""}`),
				coldEntries.length > 6 ? h(Button, { variant: "ghost", size: "sm", onClick: () => setShowAllCold(value => !value) }, showAllCold ? t("showLess") : t("showAll")) : null),
			criteriaText ? h("p", { className: "lm-cockpit-criteria", title: criteriaTitle }, criteriaText) : null,
			workspace && !coldEntries.length ? h("div", { className: "lm-empty-inline" }, h("span", { className: "lm-empty-icon" }, "○"), h("span", null, t("noColdEntries"))) : null,
			coldEntries.length ? h("ul", { className: "lm-cockpit-cold-list" },
				visibleCold.map((item, index) => h("li", { key: `${item.entry?.key || index}` },
					h("button", {
						type: "button",
						className: "lm-capsule-tag",
						onClick: () => openCold(item),
					}, `❄️ ${item.title}`),
					h("span", { className: "lm-cockpit-cold-meta" }, t("coldReasonText", { days: item.ageDays === null || item.ageDays === undefined ? "-" : String(item.ageDays), heat: item.heat === null || item.heat === undefined ? "-" : String(item.heat) }))))) : null);

		return h("div", { className: "lm-cockpit-view" },
			h("div", { className: "lm-cockpit-head" },
				h("h2", null, t("cockpitTitle")),
				counts.active !== undefined || counts.archived !== undefined
					? h("span", { className: "lm-cockpit-inventory" }, `${t("statusActive")} ${counts.active ?? 0} · ${t("statusArchived")} ${counts.archived ?? 0}`)
					: null,
				h(Button, { variant: "outline", size: "sm", disabled: workspaceBusy || submitBusy, onClick: load }, workspaceBusy ? t("checking") : t("recheck"))),
			workspaceError ? h(ErrorNotice, { title: t("loadFailed"), message: workspaceError, onRetry: load, t }) : null,
			indexWarning ? h(ErrorNotice, { title: t("mergeIndexFailedTitle"), message: indexWarning, onRetry: load, t }) : null,
			submitNotice ? h("p", { className: "lm-detail-notice" }, submitNotice) : null,
			!workspace && !workspaceBusy && !workspaceError ? h("p", { className: "lm-detail-hint" }, t("checking")) : null,
			candidateSection,
			compareArea,
			coldSection,
			coldArea,
			confirmState ? h(ConfirmDialog, {
				open: true,
				title: confirmState.title,
				message: confirmState.message,
				confirmLabel: confirmState.confirmLabel,
				cancelLabel: confirmState.cancelLabel || t("cancel"),
				onConfirm: confirmState.onConfirm,
				onCancel: confirmState.onCancel,
			}) : null);
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
		const [facets, setFacets] = React.useState(null);
		const [matched, setMatched] = React.useState(0);
		const [truncated, setTruncated] = React.useState(false);
		const pageSize = 200;
		const [usage, setUsage] = React.useState(null);
		const [listBusy, setListBusy] = React.useState(false);
		const [selectedEntry, setSelectedEntry] = React.useState(null);
		const [detail, setDetail] = React.useState(null);
		const [detailBusy, setDetailBusy] = React.useState(false);
		const [content, setContent] = React.useState("");
		const [evidence, setEvidence] = React.useState("");
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
		const [detailMode, setDetailMode] = React.useState("read");
		const [openSource, setOpenSource] = React.useState(false);
		const [openRelated, setOpenRelated] = React.useState(false);
		const [openHistory, setOpenHistory] = React.useState(false);
		const [moreOpen, setMoreOpen] = React.useState(false);
		const [filtersOpen, setFiltersOpen] = React.useState(false);
		const [spaceOpen, setSpaceOpen] = React.useState(false);
		const [showReference, setShowReference] = React.useState(false);
		const [busy, setBusy] = React.useState(null);
		const [notice, setNotice] = React.useState(null);
		const [listError, setListError] = React.useState(null);
		const [usageError, setUsageError] = React.useState(null);
		const [detailError, setDetailError] = React.useState(null);
		const [confirmState, setConfirmState] = React.useState(null);
		const listRequestRef = React.useRef(0);
		const statsRequestRef = React.useRef(0);
		const detailRequestRef = React.useRef(0);

		const detailScrollRef = React.useRef(null);
		const listPaneRef = React.useRef(null);
		const draftRef = React.useRef(false);
		const [maintenanceDraft, setMaintenanceDraft] = React.useState(null);
		const [maintenanceBusy, setMaintenanceBusy] = React.useState(false);
		const [paneWidth, setPaneWidth] = React.useState(0);
		React.useEffect(() => {
			const element = listPaneRef.current;
			if (!element) return undefined;
			const measure = () => {
				const style = window.getComputedStyle(element);
				const inner = element.clientWidth - (parseFloat(style.paddingLeft) || 0) - (parseFloat(style.paddingRight) || 0);
				if (inner > 0) setPaneWidth(Math.round(inner));
			};
			measure();
			if (typeof ResizeObserver === "undefined") return undefined;
			const observer = new ResizeObserver(measure);
			observer.observe(element);
			return () => observer.disconnect();
		}, []);
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

		const loadEntries = React.useCallback((offset = 0, append = false) => {
			if (!namespace) return;
			const token = ++listRequestRef.current;
			setListBusy(true);
			setListError(null);
			controls.listEntriesPage({ namespace, kind: kind || undefined, query: query || undefined, includeArchived, offset, limit: pageSize })
				.then(page => {
					if (token !== listRequestRef.current) return;
					const rows = page?.entries || [];
					setEntries(current => append ? [...current, ...rows] : rows);
					setFacets(page?.facets || null);
					setMatched(Number(page?.matched) || 0);
					setTruncated(Boolean(page?.truncated));
					setListBusy(false);
					setSelectedEntry(current => {
						if (!current) return rows[0] ? rows[0].entry : null;
						if (rows.some(row => identity(row.entry) === identity(current))) return current;
						if (draftRef.current) return current;
						return rows[0] ? rows[0].entry : null;
					});
				})
				.catch(failure => {
					if (token !== listRequestRef.current) return;
					if (!append) setEntries([]);
					setListBusy(false);
					setListError(String(failure?.message || failure));
				});
		}, [controls, namespace, kind, query, includeArchived, pageSize]);

		const loadStats = React.useCallback(() => {
			if (!namespace) return;
			const token = ++statsRequestRef.current;
			controls.namespaceStats({ namespace })
				.then(stats => {
					if (token !== statsRequestRef.current) return;
					setUsage(stats);
					setUsageError(null);
				})
				.catch(failure => {
					if (token !== statsRequestRef.current) return;
					setUsage(null);
					setUsageError(String(failure?.message || failure));
				});
		}, [controls, namespace]);

		React.useEffect(() => { loadEntries(); }, [loadEntries]);
		React.useEffect(() => { loadStats(); }, [loadStats]);

		React.useEffect(() => {
			setDetailMode("read");
			setOpenSource(false);
			setOpenRelated(false);
			setOpenHistory(false);
			setMoreOpen(false);
		}, [selectedKey]);

		React.useEffect(() => {
			if (!selectedEntry) {
				setDetail(null);
				setHistory([]);
				return;
			}
			const token = ++detailRequestRef.current;
			setDetailBusy(true);
			setDetailError(null);
			controls.readEntry({ entry: selectedEntry })
				.then(value => {
					if (token !== detailRequestRef.current) return;
					setDetail(value);
					setContent(value.content);
					setEvidence(value.evidence);
					setDetailBusy(false);
				})
				.catch(failure => {
					if (token !== detailRequestRef.current) return;
					setDetailBusy(false);
					setDetail(null);
					setDetailError(String(failure?.message || failure));
				});
			setHistoryBusy(true);
			controls.entryHistory({ entry: selectedEntry })
				.then(rows => {
					if (token !== detailRequestRef.current) return;
					setHistory(rows);
					setHistoryBusy(false);
				})
				.catch(failure => {
					if (token !== detailRequestRef.current) return;
					setHistory([]);
					setHistoryBusy(false);
					setDetailError(String(failure?.message || failure));
				});
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

		const refreshEntries = () => loadEntries(0, false);

		const ruleOverLimitNow = detail ? ruleContentOverLimit(detail.entry.kind, content) : false;
		const detailDirty = Boolean(detail) && (content !== detail.content || evidence !== detail.evidence);
		const maintenanceDirty = Boolean(maintenanceDraft)
			&& (maintenanceDraft.title !== (maintenanceDraft.baseline?.title ?? maintenanceDraft.title)
				|| maintenanceDraft.content !== (maintenanceDraft.baseline?.content ?? maintenanceDraft.content)
				|| maintenanceDraft.evidence !== (maintenanceDraft.baseline?.evidence ?? maintenanceDraft.evidence));
		const hasDraft = detailDirty || maintenanceDirty;
		React.useEffect(() => { draftRef.current = detailDirty; }, [detailDirty]);

		const reference = detail ? `${detail.entry.namespace}/${detail.entry.kind}/${detail.entry.key}` : "";

		const discardDraft = () => {
			if (detail) {
				setContent(detail.content);
				setEvidence(detail.evidence);
			}
			setDetailMode("read");
			setMaintenanceDraft(null);
			draftRef.current = false;
		};

		const requestDiscardMaintenance = () => {
			if (!maintenanceDirty) {
				setMaintenanceDraft(null);
				return;
			}
			setConfirmState({
				title: t("confirmTitle"),
				message: t("draftSwitchWarning"),
				confirmLabel: t("confirm"),
				onConfirm: () => { discardDraft(); },
			});
		};

		const requestArchive = () => {
			if (!detail) return;
			if (hasDraft) {
				setConfirmState({
					title: t("confirmTitle"),
					message: t("draftSwitchWarning"),
					confirmLabel: t("confirm"),
					onConfirm: () => { discardDraft(); toggleArchived(); },
				});
				return;
			}
			toggleArchived();
		};

		const selectTab = next => {
			if (next === currentTab || maintenanceBusy) return;
			if (hasDraft) {
				setConfirmState({
					title: t("confirmTitle"),
					message: t("draftSwitchWarning"),
					confirmLabel: t("confirm"),
					onConfirm: () => { discardDraft(); setCurrentTab(next); },
				});
				return;
			}
			setCurrentTab(next);
		};

		const switchNamespace = next => {
			if (!next || next === namespace || maintenanceBusy) return;
			const apply = () => {
				discardDraft();
				setNamespace(next);
			};
			if (hasDraft) {
				setConfirmState({
					title: t("confirmTitle"),
					message: t("draftSwitchWarning"),
					confirmLabel: t("confirm"),
					onConfirm: apply,
				});
				return;
			}
			apply();
		};

		const enterEdit = () => {
			if (!detail) return;
			setDetailMode("edit");
		};

		const cancelEdit = () => {
			if (!detail) return;
			const restore = () => {
				discardDraft();
				setNotice(null);
			};
			if (detailDirty) {
				setConfirmState({
					title: t("confirmTitle"),
					message: t("draftSwitchWarning"),
					confirmLabel: t("confirm"),
					onConfirm: restore,
				});
				return;
			}
			restore();
		};

		const copyReference = async () => {
			if (!detail) return;
			try {
				await navigator?.clipboard?.writeText(reference);
				setNotice(t("referenceCopied"));
			} catch {
				setShowReference(true);
				setOpenSource(true);
				setNotice(t("copyReferenceFailed"));
			}
		};

		const saveEntry = async () => {
			if (!detail) return;
			if (ruleOverLimitNow) {
				setDetailError(t("ruleOverLimit"));
				return;
			}
			setBusy("save");
			setDetailError(null);
			try {
				await controls.updateEntry({ entry: detail.entry, content, evidence, ifRevision: detail.revision });
				setNotice(t("saved"));
				const updated = await controls.readEntry({ entry: detail.entry });
				setDetail(updated);
				setContent(updated.content);
				setEvidence(updated.evidence);
				setDetailMode("read");
			} catch (error) {
				const message = String(error?.message || error);
				setDetailError(message.includes("revision_conflict") ? t("conflict") : message);
			} finally {
				setBusy(null);
			}
		};

		const reloadDetail = async () => {
			if (!selectedEntry) return;
			try {
				const value = await controls.readEntry({ entry: selectedEntry });
				setDetail(value);
				setContent(value.content);
				setEvidence(value.evidence);
				setDetailError(null);
			} catch (error) {
				setDetailError(String(error?.message || error));
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
				setDetailError(String(error?.message || error));
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
				setDetailError(String(error?.message || error));
			} finally {
				setBusy(null);
			}
		};

		const requestRollback = snapshotId => {
			setConfirmState({
				title: t("confirmTitle"),
				message: t("rollbackWarning"),
				confirmLabel: t("rollbackConfirm"),
				onConfirm: () => rollback(snapshotId),
			});
		};

		const selectEntry = entry => {
			if (!entry) return;
			const apply = () => {
				discardDraft();
				setSelectedEntry(entry);
				setMobileTab("detail");
				setDetailError(null);
			};
			if (hasDraft) {
				setConfirmState({
					title: t("confirmTitle"),
					message: t("draftSwitchWarning"),
					confirmLabel: t("confirm"),
					onConfirm: apply,
				});
				return;
			}
			apply();
		};

		// 类型筛选是跨视图共享状态；切换会重排列表并可能丢掉当前条目的草稿，所以先过草稿守卫。
		const changeKind = next => {
			if (next === kind) return;
			if (hasDraft) {
				setConfirmState({
					title: t("confirmTitle"),
					message: t("draftSwitchWarning"),
					confirmLabel: t("confirm"),
					onConfirm: () => { discardDraft(); setKind(next); },
				});
				return;
			}
			setKind(next);
		};

		const clearFilters = () => {
			if (hasDraft) {
				setConfirmState({
					title: t("confirmTitle"),
					message: t("draftSwitchWarning"),
					confirmLabel: t("confirm"),
					onConfirm: () => { discardDraft(); setKind(""); setQuery(""); setIncludeArchived(false); },
				});
				return;
			}
			setKind("");
			setQuery("");
			setIncludeArchived(false);
		};

		const jumpToEntry = target => {
			if (!target) return;
			const entry = { namespace: target.namespace || namespace, kind: target.kind, key: target.key };
			const apply = () => {
				discardDraft();
				setNamespace(entry.namespace);
				setQuery("");
				setKind("");
				setCurrentTab("entries");
				setMobileTab("detail");
				setSelectedEntry(entry);
			};
			if (hasDraft) {
				setConfirmState({
					title: t("confirmTitle"),
					message: t("draftSwitchWarning"),
					confirmLabel: t("confirm"),
					onConfirm: apply,
				});
				return;
			}
			apply();
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

		const renderRow = row => {
			const rowId = identity(row.entry);
			const isExpanded = expandedRows.has(rowId);
			const isSelected = selectedKey === rowId;
			return h("li", { key: rowId, className: "lm-browser-row-wrap" + (isSelected ? " is-selected" : "") + (row.archived ? " is-archived" : "") },
				h("div", { className: "lm-table-row-main", onClick: () => selectEntry(row.entry) },
					h("button", { type: "button", className: "lm-row-expand-btn" + (isExpanded ? " is-open" : ""), onClick: event => toggleRowExpand(rowId, event) }, "›"),
					h("div", { className: "lm-col-title lm-row-title-cell" },
						h("span", { className: "lm-row-title-text" }, highlightText(row.title, query))),
					h("span", { className: "lm-col-kind" }, h("span", { className: "lm-browser-kind lm-browser-kind-" + row.entry.kind }, kindText(row.entry.kind, t))),
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

		const renderExpandedRow = row => h("div", { className: "lm-row-expanded-pane" },
			h("div", { className: "lm-row-summary-box" }, highlightText(row.summary || "暂无摘要", query)),
			row.related && row.related.length ? h("div", { className: "lm-row-capsules" },
				h("span", { style: { fontSize: 11, opacity: .6 } }, "关联条目:"),
				row.related.map((rel, index) => h("button", {
					key: index,
					type: "button",
					className: "lm-capsule-tag",
					onClick: () => jumpToEntry({ namespace: rel.namespace || namespace, kind: rel.kind, key: rel.key }),
				}, `🔗 ${rel.key}`))) : null,
			h("div", { className: "lm-row-evidence-preview" }, "证据: " + (row.evidence || "无最新依据")));

		const rowData = row => (row && row.original) || row;

		// 表格列宽按左侧列表面板的实际宽度分配（不是窗口宽），窄面板也保证类型/热度/流态可见。
		const TABLE_COLUMN_WIDTH = { expand: 28, kind: 56, updatedAt: 80 };
		const tableFixedWidth = TABLE_COLUMN_WIDTH.expand + TABLE_COLUMN_WIDTH.kind + TABLE_COLUMN_WIDTH.heat
			+ TABLE_COLUMN_WIDTH.status + TABLE_COLUMN_WIDTH.chars + TABLE_COLUMN_WIDTH.updatedAt;
		const tableTitleWidth = Math.max(140, (paneWidth || 520) - tableFixedWidth);
		const tableMinWidth = tableTitleWidth + tableFixedWidth;

		// 列定义适配 DataTable（EasyUI MIT land 改编，组件由 build 注入时启用）。
		const tableContentProps = {
			emptyTitle: t("emptyEntries"),
			emptyDescription: null,
			emptyActionLabel: t("clearFilter"),
			onClearFilters: clearFilters,
			errorTitle: t("loadFailed"),
			errorDetailLabel: t("details"),
		};

		const tableColumns = [
			{
				id: "title",
				header: "标题 / 摘要",
				accessorKey: "title",
				sortable: true,
				width: tableTitleWidth + "px",
				cell: ({ row }) => {
					const item = rowData(row);
					const active = selectedKey === identity(item.entry);
					return h("button", {
						type: "button",
						className: "lm-table-title-btn" + (active ? " is-selected" : ""),
						onClick: () => selectEntry(item.entry),
					},
						h("span", { className: "lm-row-title-text" }, highlightText(item.title, query)));
				},
			},
			{
				id: "kind",
				header: "类型",
				accessorFn: row => row.entry.kind,
				width: TABLE_COLUMN_WIDTH.kind + "px",
				cell: ({ row }) => {
					const item = rowData(row);
					return h("span", { className: "lm-browser-kind lm-browser-kind-" + item.entry.kind }, kindText(item.entry.kind, t));
				},
			},
			{
				id: "updatedAt",
				header: "更新",
				accessorFn: row => row.updatedAt || "",
				sortable: true,
				width: TABLE_COLUMN_WIDTH.updatedAt + "px",
				cell: ({ row }) => time(rowData(row).updatedAt),
			},
		];

		const detailPane = detail
			? h(React.Fragment, null,
				h(Button, { variant: "outline", size: "sm", className: "lm-detail-back-btn", onClick: () => setMobileTab("list") }, t("backToList")),
				detailError ? h(ErrorNotice, { title: t("detailFailed"), message: detailError, onRetry: reloadDetail, t }) : null,
				h("div", { className: "lm-detail-head" },
					h("h2", { className: "lm-detail-title" }, detail.title),
					h("span", { className: "lm-browser-kind lm-browser-kind-" + detail.entry.kind }, kindText(detail.entry.kind, t)),
					detail.archived ? h("span", { className: "lm-browser-kind" }, t("archived")) : null,
					detailMode === "read"
						? h(Button, { variant: "outline", size: "sm", className: "lm-detail-edit-btn", onClick: enterEdit }, t("editMode"))
						: null,
					h(Menu, {
						open: moreOpen,
						onClose: () => setMoreOpen(false),
						align: "end",
						portal: true,
						autoFocus: true,
						anchor: h(Button, {
							variant: "ghost",
							size: "sm",
							className: "lm-detail-more-btn",
							"aria-label": t("moreActions"),
							"aria-haspopup": "menu",
							"aria-expanded": moreOpen,
							disabled: Boolean(busy),
							onClick: () => setMoreOpen(value => !value),
						}, "⋯"),
					},
						h(MenuItemButton, { disabled: Boolean(busy), onSelect: () => { setMoreOpen(false); requestArchive(); } }, detail.archived ? t("restore") : t("archive")),
						h(MenuItemButton, { disabled: Boolean(busy), onSelect: () => { setMoreOpen(false); copyReference(); } }, t("copyReference")))),
				notice ? h("p", { className: "lm-detail-notice" }, notice) : null,
				detailMode === "read"
					? h("div", { className: "lm-browser-md-preview lm-detail-body" }, renderMarkdown(content))
					: h("div", { className: "lm-detail-edit" },
						h(Field, { label: t("content") },
							h("textarea", { className: "lm-browser-textarea lm-browser-content", value: content, onChange: event => setContent(event.target.value) })),
						h(Field, { label: t("evidence") },
							h("textarea", { className: "lm-browser-textarea lm-browser-evidence-textarea", value: evidence, onChange: event => setEvidence(event.target.value) })),
						detail.entry.kind === "rule" ? h("div", { className: "lm-browser-rule-meter" + (ruleOverLimitNow ? " is-over" : ruleContentLength(content) > 90 ? " is-near" : "") },
							h("div", { className: "lm-browser-rule-meter-track" },
								h("div", { className: "lm-browser-rule-meter-fill", style: { width: Math.min(100, ruleContentLength(content)) + "%" } })),
							h("span", { className: "lm-browser-rule-length" }, `${ruleContentLength(content)} / 100 字符`)) : null,
						h("div", { className: "lm-detail-actions" },
							h(Button, { variant: "ghost", size: "sm", disabled: Boolean(busy), onClick: cancelEdit }, t("cancel")),
							h(Button, { variant: "primary", size: "sm", disabled: Boolean(busy) || ruleOverLimitNow || !detailDirty, onClick: saveEntry }, busy === "save" ? t("saving") : t("save")))),
				h(Disclosure, { title: t("sourceTitle"), open: openSource, onOpenChange: setOpenSource, className: "lm-detail-disclosure" },
					h("div", { className: "lm-detail-meta-list" },
						h("pre", { className: "lm-detail-evidence" }, evidence || t("noEvidence")),
						showReference ? h("div", null,
							h("span", { className: "lm-detail-meta-label" }, t("entryKey")),
							h("code", { className: "lm-detail-reference" }, reference)) : null)),
				detail.related && detail.related.length
					? h(Disclosure, { title: t("relatedTitle"), count: detail.related.length, open: openRelated, onOpenChange: setOpenRelated, className: "lm-detail-disclosure" },
						h("div", { className: "lm-row-capsules" },
							detail.related.map((rel, index) => h("button", {
								key: index,
								type: "button",
								className: "lm-capsule-tag",
								onClick: () => jumpToEntry({ namespace: rel.namespace || namespace, kind: rel.kind, key: rel.key }),
							}, `🔗 ${rel.key}`))))
					: null,
				h(Disclosure, { title: t("historyTitle"), count: history.length, open: openHistory, onOpenChange: setOpenHistory, className: "lm-detail-disclosure" },
					historyBusy ? h("p", { className: "lm-detail-hint" }, t("loading")) : null,
					history.length
						? h("ol", { className: "lm-history-timeline" },
							history.map(snap => h("li", { key: snap.snapshotId, className: "lm-history-node" },
								h("span", { className: "lm-history-dot" }),
								h("div", { className: "lm-history-card" },
									h("div", { className: "lm-history-head" },
										h("div", { className: "lm-history-meta" },
											h("span", null, time(snap.createdAt)),
											h("span", { className: "lm-history-delta " + ((snap.change?.contentDelta || 0) >= 0 ? "lm-delta-pos" : "lm-delta-neg") }, `${(snap.change?.contentDelta || 0) >= 0 ? "+" : ""}${snap.change?.contentDelta || 0}`)),
										h("div", { style: { display: "flex", gap: 6 } },
											h(Button, { variant: "ghost", size: "sm", onClick: () => setPreviewSnapshotId(previewSnapshotId === snap.snapshotId ? null : snap.snapshotId) }, t("preview")),
											h(Button, { variant: "ghost", size: "sm", onClick: () => requestRollback(snap.snapshotId) }, t("rollback")))),
									snap.summary ? h("div", { className: "lm-history-summary" }, snap.summary) : null,
									h("details", { className: "lm-history-detail" },
										h("summary", null, t("details")),
										h("code", null, String(snap.revision || "").slice(0, 12))),
									previewSnapshotId === snap.snapshotId ? h(DiffViewer, { oldText: snap.preview || snap.content, newText: content }) : null))))
						: h("p", { className: "lm-detail-hint" }, t("noHistory"))))
			: h("p", { style: { padding: 40, textAlign: "center", opacity: .5 } }, detailBusy ? t("loading") : t("emptyDetail"));

		const facetActive = value => {
			if (!facets) return null;
			const active = facets.active || {};
			if (value === "rule") return Number(active.rule) || 0;
			if (value === "fact") return Number(active.fact) || 0;
			if (value === "sop") return Number(active.sop) || 0;
			return Number(active.total) || 0;
		};
		const facetArchivedOf = value => {
			if (!facets) return null;
			const archived = facets.archived || {};
			if (value === "rule") return Number(archived.rule) || 0;
			if (value === "fact") return Number(archived.fact) || 0;
			if (value === "sop") return Number(archived.sop) || 0;
			return Number(archived.total) || 0;
		};
		const filterActive = Boolean(kind) || Boolean(query) || includeArchived;

		const entriesPane = h("div", { style: { display: "flex", flexDirection: "column", flex: 1, minWidth: 0, minHeight: 0 } },
			h("div", { className: "lm-browser-entries-toolbar" + (mobileTab === "detail" ? " is-detail" : "") },
				h("div", { className: "lm-browser-search" },
					h(Input, { type: "search", className: "lm-search-input", icon: h(IconSearchOutlineRegular, { size: 14 }), placeholder: t("searchPlaceholder"), value: query, onChange: event => setQuery(event.target.value) })),
				h("div", { className: "lm-browser-filter-tabs" },
					[["", t("all")], ...entryKinds.map(value => [value, kindText(value, t)])].map(([value, label]) => {
						const active = facetActive(value);
						const archived = facetArchivedOf(value);
						const chipTitle = active === null ? t("inventoryLabel") : t("inventoryChipTitle", { active, archived });
						return h("button", {
							key: value || "all",
							type: "button",
							className: "lm-browser-filter-tab" + (kind === value ? " is-active" : ""),
							"aria-pressed": kind === value,
							title: chipTitle,
							"aria-label": `${label} ${chipTitle}`,
							onClick: () => changeKind(value),
						}, label, h("span", { className: "lm-browser-tab-count" }, active === null ? "—" : `(${active})`));
					})),
				h("span", { className: "lm-browser-result-count" }, t("resultCount", { count: entries.length })),
				h(Button, {
					variant: "ghost",
					size: "sm",
					className: "lm-browser-filters-toggle",
					"aria-expanded": filtersOpen,
					onClick: () => setFiltersOpen(value => !value),
				}, t("filters")),
				filtersOpen ? h("div", { className: "lm-browser-filters-panel" },
					h("label", { className: "lm-browser-archived-toggle" },
						h(Switch, { checked: includeArchived, onChange: setIncludeArchived }),
						h("span", null, t("showArchived"))),
					filterActive ? h(Button, { variant: "ghost", size: "sm", onClick: clearFilters }, t("clearFilter")) : null) : null),
			h("div", { className: "lm-browser-body" + (mobileTab === "detail" ? " show-detail" : " show-list") },
				h("section", { className: "lm-browser-list-pane", ref: listPaneRef },
					DataTable ? null : h("div", { className: "lm-table-header" },
						h("span", { className: "lm-col-expand" }),
						h("span", { className: "lm-col-title" }, h("button", { type: "button", className: "lm-th-btn", onClick: () => handleSort("title") }, "标题 / 摘要")),
						h("span", { className: "lm-col-kind" }, "类型"),
						h("span", { className: "lm-col-time" }, h("button", { type: "button", className: "lm-th-btn", onClick: () => handleSort("updatedAt") }, "更新"))),
					listError ? h(ErrorNotice, { title: t("listFailed"), message: listError, onRetry: loadEntries, t }) : null,
					listBusy && !DataTable ? h("p", { style: { padding: 20, textAlign: "center", opacity: .6 } }, t("loading")) : null,
					listError ? null : DataTable
						? h("div", { className: "lm-browser-advanced-table", style: { "--lm-table-min-width": tableMinWidth + "px" } },
							h(DataTable, {
								data: sortedEntries,
								columns: tableColumns,
								getRowId: row => identity(row.entry),
								renderSubComponent: row => renderExpandedRow(rowData(row)),
								hidePagination: true,
								isLoading: listBusy,
								contentProps: tableContentProps,
								className: "lm-eui-dt-host",
							},
								DataTableContent ? h(DataTableContent, tableContentProps) : null))
						: h("ul", { className: "lm-browser-table" }, sortedEntries.map(renderRow)),
					truncated ? h("div", { className: "lm-browser-load-more" },
						h(Button, { variant: "outline", size: "sm", disabled: listBusy, onClick: () => loadEntries(entries.length, true) }, t("loadMore")),
						h("span", { className: "lm-browser-load-more-meta" }, `${entries.length} / ${matched}`)) : null),
				h("article", { className: "lm-browser-detail" },
					h("div", { ref: detailScrollRef, className: "lm-browser-detail-scroll" }, detailPane))));

		return h("section", { className: "lm-browser-page", "data-memory-browser": true },
			h("style", null, styles),
			/* 页面公用顶部：四个 Tab 共用标题、命名空间、导航与预算仪表 */
			h("header", { className: "lm-browser-header-sticky" },
				h("div", { className: "lm-browser-top-row" },
					h("div", { className: "lm-browser-top-left" },
						h("h1", null, t("title")),
						h(Menu, {
							open: spaceOpen,
							onClose: () => setSpaceOpen(false),
							align: "start",
							portal: true,
							autoFocus: true,
							anchor: h(Button, {
								variant: "outline",
								size: "sm",
								className: "lm-space-button",
								"aria-label": t("space"),
								"aria-haspopup": "menu",
								"aria-expanded": spaceOpen,
								disabled: namespaceBusy || maintenanceBusy,
								onClick: () => setSpaceOpen(value => !value),
							}, t("space")),
						}, namespaces.map(row => h(MenuItemButton, {
							key: row.namespace,
							icon: row.namespace === namespace ? h(IconCheckOutlineRegular, { size: 14 }) : undefined,
							onSelect: () => { setSpaceOpen(false); switchNamespace(row.namespace); },
						}, row.namespace)))),
					h("div", { className: "lm-browser-top-actions" },
						h(Button, { variant: "primary", size: "sm", className: "lm-new-button", "aria-label": t("newEntry"), icon: h(IconPlusOutlineRegular, { size: 13 }), disabled: !namespaces.length, onClick: () => { setCreateError(null); setCreateForm(current => ({ ...current, namespace: namespace || current.namespace })); setCreateOpen(true); } }, t("newEntry")))),
				h("div", { className: "lm-bounce-nav-bar" },
					h(BounceNav, { currentTab, onSelect: selectTab, t })),
				h(IndexUsage, { stats: usage, t, kind, onKindChange: changeKind }),
				usageError ? h("div", { className: "lm-inline-error lm-usage-error", role: "alert" },
					h("strong", null, t("loadFailed")),
					h("span", null, usageError),
					h(Button, { variant: "outline", size: "sm", onClick: loadStats }, t("retry"))) : null),
			/* 工作台主体 */
			h("div", { className: "lm-browser-content-area" },
				currentTab === "injection" ? h(InjectionView, { controls, namespace, kind, onKindChange: changeKind, onOpenEntry: jumpToEntry, t }) : null,
				currentTab === "graph"
					? (runtime && runtime.graphView
						? h(runtime.graphView, { controls, namespace, onJumpEntry: jumpToEntry, t, kind, onKindChange: changeKind })
						: h("div", { className: "lm-graph-view" },
							h(ErrorNotice, { title: t("loadFailed"), message: t("loadFailedHint"), t })))
					: null,
				currentTab === "cockpit" ? h(CockpitView, {
					controls,
					namespace,
					draft: maintenanceDraft,
					onDraftChange: setMaintenanceDraft,
					onDiscardRequest: requestDiscardMaintenance,
					onBusyChange: setMaintenanceBusy,
					onRefreshEntries: refreshEntries,
					t,
				}) : null,
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
			}),
			h(ConfirmDialog, {
				open: Boolean(confirmState),
				title: confirmState?.title || t("confirmTitle"),
				message: confirmState?.message || "",
				confirmLabel: confirmState?.confirmLabel || t("confirm"),
				cancelLabel: t("cancel"),
				onConfirm: () => { const action = confirmState?.onConfirm; setConfirmState(null); if (action) action(); },
				onCancel: () => setConfirmState(null),
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
					listEntriesPage: req => resultValue(scope.remote.layeredMemoryStatus.listEntriesPage(req)),
					readEntry: req => resultValue(scope.remote.layeredMemoryStatus.readEntry(req)),
					createEntry: req => resultValue(scope.remote.layeredMemoryStatus.createEntry(req)),
					updateEntry: req => resultValue(scope.remote.layeredMemoryStatus.updateEntry(req)),
					setArchived: req => resultValue(scope.remote.layeredMemoryStatus.setArchived(req)),
					entryHistory: req => resultValue(scope.remote.layeredMemoryStatus.entryHistory(req)),
					rollbackEntry: req => resultValue(scope.remote.layeredMemoryStatus.rollbackEntry(req)),
					getInjectionState: req => resultValue(scope.remote.layeredMemoryStatus.getInjectionState(req)),
					getDiskMetrics: req => resultValue(scope.remote.layeredMemoryStatus.getDiskMetrics(req)),
					getMaintenanceReport: req => resultValue(scope.remote.layeredMemoryStatus.getMaintenanceReport(req)),
					getMaintenanceWorkspace: req => resultValue(scope.remote.layeredMemoryStatus.getMaintenanceWorkspace(req)),
					getMaintenanceReview: req => resultValue(scope.remote.layeredMemoryStatus.getMaintenanceReview(req)),
					mergeMaintenanceEntries: req => resultValue(scope.remote.layeredMemoryStatus.mergeMaintenanceEntries(req)),
					archiveEntry: req => resultValue(scope.remote.layeredMemoryStatus.archiveEntry(req)),
				};
				scope.slots.inject("main", () => scope.slots.register({ name: "main", key: "layered-memory", locale, inject: () => ({ controls }) }, MemoryBrowserPage));
				scope.slots.inject("sidebar.panellist", () => scope.slots.register({ name: "sidebar.panellist", id: "layered-memory", order: 20, locale, label: () => scope.locale.translate(locale, "sidebarTitle") }, MemoryBrowserIcon));
			});
			try { await ui; }
			catch (error) { await ui.dispose(); throw error; }
			return async () => { await ui.dispose(); };
		},
	};
}
