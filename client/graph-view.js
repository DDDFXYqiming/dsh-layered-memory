/**
 * 关系图谱视图工厂。
 *
 * 调用签名（两种都支持）：
 * - createMemoryGraphView(require, runtime) —— 与宿主 UI runtime 对齐；
 * - createMemoryGraphView(React, ui, deps) —— 独立调试用。
 * runtime 可提供 { React, ui, d3, styles, reducedMotion() }。
 *
 * 渲染栈：
 * - 布局 / 视口 / 碰撞 / 路径：vendored d3@7.9.2（ISC，client/vendor/graph/d3.min.js）
 * - hover 邻居高亮、点击钉住、贝塞尔边的交互语义：移植 EasyUI Dependency Trace
 *   （MIT，client/vendor/graph/easyui/DependencyTrace.tsx，Copyright (c) 2026 Suraj Maurya）
 *
 * 本文件不依赖宿主打包器：d3 由构建脚本前置拼接为全局 d3，组件通过
 * deps.d3 或 globalThis.d3 取用；缺失时渲染显式错误态而不是崩溃。
 */

export function createMemoryGraphView(requireOrReact, runtimeOrUi, dependencies) {
	const isRequire = typeof requireOrReact === "function";
	const React = isRequire ? requireOrReact("react") : requireOrReact;
	const runtime = isRequire ? (runtimeOrUi || {}) : {};
	let ui = isRequire ? runtime.ui : (runtimeOrUi || {});
	if (!ui && isRequire) {
		try {
			ui = requireOrReact("@deepseek-ai/dsh-client-ui-primitives") || {};
		} catch {
			ui = {};
		}
	}
	const deps = {
		d3: runtime.d3,
		styles: runtime.styles,
		...(dependencies || {}),
	};
	const {
		Button, Input, Switch,
		IconLoadingOutlineRegular, IconSearchOutlineRegular, IconWarningOutlineRegular,
		IconArchiveOutlineRegular, IconRefreshOutlineRegular, IconCloseOutlineRegular,
		IconSlidersTwoOutlineRegular, useDismissOnOutsidePointer,
	} = ui || {};
	// 宿主提供的钩子；缺席时退化为空实现（不影响其它行为）。
	const useOutsideDismiss = typeof useDismissOnOutsidePointer === "function" ? useDismissOnOutsidePointer : () => {};
	const h = React.createElement;
	const { useCallback, useEffect, useMemo, useRef, useState } = React;

	const STRINGS = {
		zh: {
			graphLabel: "记忆关系图谱",
			loading: "读取中",
			loadFailed: "读取失败",
			retry: "重试",
			detail: "详情",
			empty: "没有记忆条目",
			noNamespace: "未选择命名空间",
			engineMissing: "图谱组件加载失败",
			reload: "刷新页面",
			search: "搜索节点",
			displayOptions: "显示选项",
			typeFilter: "类型",
			relationFilter: "关系",
			fitShort: "适屏",
			relations: "关联",
			locate: "定位",
			all: "全部",
			kindRule: "规则",
			kindFact: "事实",
			kindSop: "经验",
			onlyConnected: "仅看有边节点",
			explicit: "显式关联",
			similar: "相似关系",
			zoomIn: "放大",
			zoomOut: "缩小",
			fit: "适应窗口",
			reset: "重置视图",
			close: "关闭",
			counts: "{nodes} / {totalNodes} 节点 · {edges} / {totalEdges} 边",
			legend: "图例",
			detail: "节点详情",
			openEntry: "打开条目",
			noNeighbors: "无邻居",
			noMatch: "没有匹配的节点",
			clearFilters: "清除筛选",
			similarity: "相似度",
		},
		en: {
			graphLabel: "Memory relationship graph",
			loading: "Loading",
			loadFailed: "Failed to load",
			retry: "Retry",
			detail: "Details",
			empty: "No memory entries",
			noNamespace: "No namespace",
			engineMissing: "Graph component failed to load",
			reload: "Reload page",
			search: "Search nodes",
			displayOptions: "Display options",
			typeFilter: "Type",
			relationFilter: "Relations",
			fitShort: "Fit",
			relations: "Related",
			locate: "Locate",
			all: "All",
			kindRule: "Rule",
			kindFact: "Fact",
			kindSop: "Skill",
			onlyConnected: "Connected only",
			explicit: "Explicit link",
			similar: "Similarity",
			zoomIn: "Zoom in",
			zoomOut: "Zoom out",
			fit: "Fit",
			reset: "Reset view",
			close: "Close",
			counts: "{nodes} / {totalNodes} nodes · {edges} / {totalEdges} edges",
			legend: "Legend",
			detail: "Node details",
			openEntry: "Open entry",
			noNeighbors: "No neighbors",
			noMatch: "No matching node",
			clearFilters: "Clear filters",
			similarity: "Similarity",
		},
	};

	const KIND_ORDER = ["rule", "fact", "sop"];
	const EDGE_TYPES = ["related", "similar"];
	const LABEL_LIMIT = 10;
	const LABEL_TEXT_LIMIT = 14;
	const HUB_LABEL_LIMIT = 8;
	const NEIGHBOR_LABEL_LIMIT = 4;
	const ZOOM_MIN = 0.15;
	const ZOOM_MAX = 6;
	const LABEL_FONT_PX = 11;
	const LABEL_FONT = "11px system-ui, -apple-system, 'Segoe UI', sans-serif";

	const hashSeed = text => {
		let hash = 2166136261;
		const value = String(text || "");
		for (let index = 0; index < value.length; index++) {
			hash ^= value.charCodeAt(index);
			hash = Math.imul(hash, 16777619);
		}
		return hash >>> 0;
	};

	let measureContext = null;
	const measureText = (text, font) => {
		const fallback = String(text || "").length * 6.2;
		if (typeof document === "undefined") return fallback;
		if (!measureContext) {
			const canvas = document.createElement("canvas");
			measureContext = canvas.getContext ? canvas.getContext("2d") : null;
		}
		if (!measureContext) return fallback;
		measureContext.font = font || LABEL_FONT;
		return measureContext.measureText(String(text || "")).width;
	};

	const nodeRadius = node => {
		const heat = Number(node && node.heat) || 0;
		const degree = Number(node && node.degree) || 0;
		return Math.max(5, Math.min(13, 4.5 + Math.min(heat, 6) * 0.9 + Math.min(degree, 12) * 0.35));
	};

	// 画布上的标签用短标题：完整标题在 tooltip 与详情面板里给，
	// 长标题会让标签矩形宽到必然压住邻居，导致一个都放不下。
	const labelText = node => {
		const raw = String((node && (node.title || node.key)) || "");
		return raw.length > LABEL_TEXT_LIMIT ? raw.slice(0, LABEL_TEXT_LIMIT) + "…" : raw;
	};

	const rectsOverlap = (a, b, margin) => {
		const gap = margin == null ? 2 : margin;
		return !(a.x1 + gap < b.x0 || b.x1 + gap < a.x0 || a.y1 + gap < b.y0 || b.y1 + gap < a.y0);
	};

	const resolveD3 = () => {
		const candidate = deps.d3 || (typeof globalThis !== "undefined" ? globalThis.d3 : undefined);
		return candidate && candidate.forceSimulation && candidate.zoom ? candidate : null;
	};

	const ActionButton = ({ label, onClick, title, ariaLabel, ariaExpanded, ariaControls, icon, active, disabled, variant, extraClass, buttonRef }) => {
		const className = "lm-graph-btn" + (extraClass ? " " + extraClass : "") + (active ? " is-active" : "");
		if (Button) {
			return h(Button, {
				variant: variant || "outline",
				size: "sm",
				type: "button",
				className,
				title: title || label,
				"aria-label": ariaLabel || title || (typeof label === "string" ? label : undefined),
				"aria-pressed": active === undefined ? undefined : Boolean(active),
				"aria-expanded": ariaExpanded === undefined ? undefined : Boolean(ariaExpanded),
				"aria-controls": ariaControls,
				disabled: Boolean(disabled),
				icon,
				ref: buttonRef,
				onClick,
			}, label);
		}
		return h("button", {
			type: "button",
			className,
			title: title || label,
			"aria-label": ariaLabel || title || (typeof label === "string" ? label : undefined),
			"aria-pressed": active === undefined ? undefined : Boolean(active),
			"aria-expanded": ariaExpanded === undefined ? undefined : Boolean(ariaExpanded),
			"aria-controls": ariaControls,
			disabled: Boolean(disabled),
			ref: buttonRef,
			onClick,
		}, label);
	};

	// 状态标记直接用宿主 primitives 的既有图标：读取中 / 搜索无结果 / 警告 / 归档盒，
	// 不再为状态自绘 SVG。
	const StateIcon = ({ kind }) => {
		const Icon = kind === "loading" ? IconLoadingOutlineRegular
			: kind === "filtered" ? IconSearchOutlineRegular
				: kind === "error" ? IconWarningOutlineRegular
					: IconArchiveOutlineRegular;
		if (!Icon) return null;
		return h(Icon, {
			size: 28,
			className: "lm-graph-state-icon"
				+ (kind === "loading" ? " is-loading" : "")
				+ (kind === "error" ? " is-error" : ""),
		});
	};

	// 折叠区优先用 runtime 提供的共享 Disclosure；没有时退化为最小可访问折叠
	// （按钮 + aria-controls 区域），不另造弹层。
	// 兜底折叠：与共享 Disclosure 同样的 props 形状（含 renderHeader 槽）。
	const LocalDisclosure = ({ title, open, onOpenChange, children, id, count, className, renderHeader, rootRef, bodyClassName }) => {
		const contentId = id || "lm-disclosure-local";
		const toggle = () => { if (onOpenChange) onOpenChange(!open); };
		const header = renderHeader
			? renderHeader({ open: Boolean(open), toggle, contentId })
			: h("button", {
				type: "button",
				className: "lm-graph-disclosure-local-trigger",
				"aria-expanded": Boolean(open),
				"aria-controls": contentId,
				onClick: toggle,
			}, title, count != null ? h("span", { className: "lm-graph-disclosure-local-count" }, String(count)) : null);
		return h("div", {
			ref: rootRef,
			className: "lm-graph-disclosure-local" + (className ? " " + className : ""),
			"data-open": open ? "true" : "false",
		},
			header,
			h("div", { id: contentId, className: "lm-graph-disclosure-local-body" + (bodyClassName ? " " + bodyClassName : "") },
				open ? children : null));
	};

	const ToggleButton = ({ label, active, onClick, title, disabled }) => h("button", {
		type: "button",
		className: "lm-graph-chip" + (active ? " is-active" : ""),
		"aria-pressed": Boolean(active),
		"aria-disabled": Boolean(disabled),
		title: title || label,
		disabled: Boolean(disabled),
		onClick,
	}, label);

	// 共享组件：优先用 runtime 提供的实现，缺席时退回本地最小版本。
	const DisclosureView = (runtime && runtime.components && runtime.components.Disclosure) || LocalDisclosure;

	function MemoryGraphView(props) {
		const { controls, namespace, onJumpEntry, locale = "zh", kind: kindProp, onKindChange } = props;
		const s = STRINGS[locale] || STRINGS.zh;

		const [status, setStatus] = useState("loading");
		const [error, setError] = useState(null);
		const [graph, setGraph] = useState(null);
		const [query, setQuery] = useState("");
		const [onlyConnected, setOnlyConnected] = useState(false);
		const [edgeTypes, setEdgeTypes] = useState({ related: true, similar: true });
		const [hoverId, setHoverId] = useState(null);
		const [selectedId, setSelectedId] = useState(null);
		const [detailOpen, setDetailOpen] = useState(false);
		const [optionsOpen, setOptionsOpen] = useState(false);
		const [sections, setSections] = useState({});
		const [sceneVersion, setSceneVersion] = useState(0);

		const stageRef = useRef(null);
		const svgRef = useRef(null);
		const toolbarRef = useRef(null);
		const tooltipRef = useRef(null);
		const sceneRef = useRef(null);
		const suppressClickRef = useRef(false);
		const tooltipSizeRef = useRef({ width: 240, height: 72 });
		const firstFitRef = useRef(true);
		const [toolbarHeight, setToolbarHeight] = useState(0);
		const optionsCardRef = useRef(null);
		const optionsTriggerRef = useRef(null);
		const hoverIdRef = useRef(null);
		const selectedIdRef = useRef(null);
		const neighborIdsRef = useRef(new Set());

		// 类型过滤可由外部共享状态驱动（kind prop + onKindChange），也可在图谱内自行切换。
		const kindControlled = kindProp !== undefined;
		const [localKind, setLocalKind] = useState("");
		const kindFilter = kindControlled ? (kindProp || "") : localKind;
		const applyKind = useCallback(next => {
			if (typeof onKindChange === "function") onKindChange(next);
			if (!kindControlled) setLocalKind(next);
		}, [kindControlled, onKindChange]);

		const reducedMotion = useMemo(() => {
			if (runtime && typeof runtime.reducedMotion === "function") return Boolean(runtime.reducedMotion());
			if (typeof window === "undefined" || !window.matchMedia) return false;
			return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		}, []);

		const engineReady = useMemo(() => Boolean(resolveD3()), []);

		useEffect(() => { hoverIdRef.current = hoverId; }, [hoverId]);
		useEffect(() => { selectedIdRef.current = selectedId; }, [selectedId]);

		const load = useCallback(async () => {
			if (!namespace) {
				setStatus("no-namespace");
				return;
			}
			setStatus("loading");
			setError(null);
			setDetailOpen(false);
			try {
				const report = await controls.getMaintenanceReport({ namespace });
				const source = report && report.graph ? report.graph : {};
				const nodes = Array.isArray(source.nodes) ? source.nodes.filter(node => node && node.id) : [];
				const edges = Array.isArray(source.edges) ? source.edges.filter(edge => edge && edge.source && edge.target) : [];
				setGraph({ nodes, edges });
				setStatus("ready");
			} catch (failure) {
				setError(failure);
				setStatus("error");
			}
		}, [controls, namespace]);

		useEffect(() => {
			load();
		}, [load]);

		// 切换命名空间等于换一份图：清掉上一个命名空间留下的悬停、选中与过滤状态，
		// 免得旧状态在新图上表现为「联动假高亮」。
		useEffect(() => {
			setHoverId(null);
			setSelectedId(null);
			setLocalKind("");
			setQuery("");
			setDetailOpen(false);
			setOptionsOpen(false);
			setSections({});
		}, [namespace]);

		// 换一个节点就回到默认闭合，按需内容重新打开。
		useEffect(() => {
			setSections({});
		}, [selectedId]);

		const filtered = useMemo(() => {
			const nodes = graph ? graph.nodes : [];
			const edges = graph ? graph.edges : [];
			const connected = new Set();
			for (const edge of edges) {
				connected.add(edge.source);
				connected.add(edge.target);
			}
			const needle = query.trim().toLowerCase();
			const baseNodes = nodes.filter(node => {
				if (onlyConnected && !connected.has(node.id)) return false;
				if (needle) {
					const haystack = `${node.title || ""} ${node.key || ""} ${node.kind || ""}`.toLowerCase();
					if (!haystack.includes(needle)) return false;
				}
				return true;
			});
			const kindMatched = kindFilter ? baseNodes.filter(node => node.kind === kindFilter) : baseNodes;
			const baseIds = new Set(baseNodes.map(node => node.id));
			const edgeCounts = { related: 0, similar: 0 };
			for (const edge of edges) {
				if (!baseIds.has(edge.source) || !baseIds.has(edge.target)) continue;
				if (edgeCounts[edge.type] !== undefined) edgeCounts[edge.type] += 1;
			}
			const visibleEdges = edges.filter(edge => (
				edgeTypes[edge.type] !== false && baseIds.has(edge.source) && baseIds.has(edge.target)
			));
			return {
				nodes: baseNodes,
				kindMatched,
				edges: visibleEdges,
				base: baseNodes,
				edgeCounts,
				removingKey: baseNodes.map(node => node.id).join("|"),
				kindKey: kindMatched.map(node => node.id).join("|"),
			};
		}, [graph, kindFilter, query, onlyConnected, edgeTypes]);

		const selectedNode = useMemo(() => {
			if (!graph || !selectedId) return null;
			return graph.nodes.find(node => node.id === selectedId) || null;
		}, [graph, selectedId]);

		const hoveredNode = useMemo(() => {
			if (!graph || !hoverId) return null;
			return graph.nodes.find(node => node.id === hoverId) || null;
		}, [graph, hoverId]);

		const neighborsOf = useCallback(id => {
			if (!graph || !id) return [];
			const out = [];
			const seen = new Set();
			for (const edge of graph.edges) {
				let other = null;
				if (edge.source === id) other = edge.target;
				else if (edge.target === id) other = edge.source;
				if (!other || seen.has(other)) continue;
				seen.add(other);
				const node = graph.nodes.find(item => item.id === other);
				if (node) out.push({ node, edge });
			}
			return out;
		}, [graph]);

		const styleText = deps.styles != null
			? deps.styles
			: (typeof GRAPH_VIEW_CSS !== "undefined" ? GRAPH_VIEW_CSS : "");

		const buildScene = useCallback(() => {
			const d3 = resolveD3();
			const svgNode = svgRef.current;
			const stage = stageRef.current;
			if (!d3 || !svgNode || !stage || !graph) return undefined;

			// 容器尺寸只从当前可见的 stage 现读，布局、fit、宽高比修正共用同一来源。
			const measureStage = () => {
				const rect = stage.getBoundingClientRect();
				return {
					width: Math.max(280, rect.width || stage.clientWidth || 640),
					height: Math.max(240, rect.height || stage.clientHeight || 480),
				};
			};
			const initialSize = measureStage();
			const width = initialSize.width;
			const height = initialSize.height;

			const nodes = graph.nodes.map(node => ({ ...node, r: nodeRadius(node) }));
			const nodeIds = new Set(nodes.map(node => node.id));
			const links = graph.edges
				.filter(edge => nodeIds.has(edge.source) && nodeIds.has(edge.target))
				.map(edge => ({ source: edge.source, target: edge.target, type: edge.type, similarity: edge.similarity }));

			// 可视区：顶部预留工具栏高度，避免标签被工具栏压住。
			const computeFitArea = size => {
				const toolbar = toolbarRef.current;
				const reserve = toolbar ? Math.min(toolbar.getBoundingClientRect().height + 12, size.height * 0.4) : 0;
				return {
					reserve,
					areaWidth: Math.max(80, size.width - 24),
					areaHeight: Math.max(80, size.height - reserve - 16),
				};
			};

			const seed = hashSeed(`${namespace || ""}|${nodes.map(node => node.id).sort().join(",")}`);
			// 布局按当前可视区的宽高比塑形：宽屏时纵向约束更强，布局自然摊成宽形，
			// 不需要事后仿射拉伸（那会把节点压扁、造成挤团）。
			const layoutAspectFor = size => {
				const area = computeFitArea(size);
				return Math.max(0.7, Math.min(2.4, area.areaWidth / area.areaHeight));
			};
			let layoutAspect = layoutAspectFor(initialSize);
			const runLayout = size => {
				const aspect = layoutAspectFor(size);
				layoutAspect = aspect;
				for (const node of nodes) {
					delete node.x;
					delete node.y;
					delete node.vx;
					delete node.vy;
				}
				const simulation = d3.forceSimulation(nodes)
					.force("link", d3.forceLink(links).id(node => node.id).distance(link => (link.type === "similar" ? 88 : 46)).strength(0.45))
					.force("charge", d3.forceManyBody().strength(-28).distanceMax(260))
					.force("collide", d3.forceCollide(node => node.r + 3))
					.force("x", d3.forceX(size.width / 2).strength(0.11 / Math.sqrt(aspect)))
					.force("y", d3.forceY(size.height / 2).strength(0.11 * Math.sqrt(aspect)))
					.randomSource(d3.randomLcg(seed))
					.stop();
				for (let tick = 0; tick < 320; tick++) simulation.tick();
				simulation.stop();
			};
			runLayout(initialSize);
			for (const node of nodes) {
				node.baseX = node.x;
				node.baseY = node.y;
			}


			const svg = d3.select(svgNode);
			svg.selectAll("*").remove();
			svg.attr("width", "100%").attr("height", "100%");

			const viewport = svg.append("g").attr("class", "lm-graph-viewport");
			const edgeLayer = viewport.append("g").attr("class", "lm-graph-edges");
			const nodeLayer = viewport.append("g").attr("class", "lm-graph-nodes");
			const labelLayer = viewport.append("g").attr("class", "lm-graph-labels");

			// 贝塞尔边：沿用 EasyUI Dependency Trace 的中点偏移公式（MIT）。
			const edgePath = link => {
				const path = d3.path();
				path.moveTo(link.source.x, link.source.y);
				path.quadraticCurveTo(
					(link.source.x + link.target.x) / 2,
					(link.source.y + link.target.y) / 2 - 15,
					link.target.x,
					link.target.y,
				);
				return path.toString();
			};

			const edgeSelection = edgeLayer.selectAll("path")
				.data(links, link => `${link.source.id || link.source}->${link.target.id || link.target}:${link.type}`)
				.join("path")
				.attr("class", link => "lm-graph-edge lm-graph-edge-" + (link.type || "related"))
				.attr("d", edgePath);

			const nodeSelection = nodeLayer.selectAll("g")
				.data(nodes, node => node.id)
				.join("g")
				.attr("class", node => "lm-graph-node lm-graph-kind-" + (node.kind || "other"))
				.attr("transform", node => `translate(${node.x},${node.y})`)
				.attr("role", "button")
				.attr("aria-label", node => `${node.title || node.key} · ${node.kind || ""}`)
				.attr("tabindex", -1);

			nodeSelection.append("circle").attr("class", "lm-graph-halo").attr("r", node => node.r + 7);
			nodeSelection.append("circle").attr("class", "lm-graph-dot").attr("r", node => node.r);
			nodeSelection.append("circle").attr("class", "lm-graph-ring").attr("r", node => node.r + 4);

			const labelSelection = labelLayer.selectAll("text")
				.data(nodes, node => node.id)
				.join("text")
				.attr("class", "lm-graph-label")
				.attr("dy", "0.34em")
				.text(node => labelText(node))
				.attr("visibility", "hidden");

			const visibleSet = new Set(nodes.map(node => node.id));
			const emphasisSet = new Set(nodes.map(node => node.id));

			const importantNodes = [...nodes].sort((a, b) => (
				(Number(b.degree) || 0) - (Number(a.degree) || 0)
				|| (Number(b.heat) || 0) - (Number(a.heat) || 0)
			)).slice(0, LABEL_LIMIT);

			let labelFontSize = LABEL_FONT_PX;
			const labelRect = (node, option) => {
				const width = measureText(labelText(node), `${labelFontSize}px system-ui, -apple-system, 'Segoe UI', sans-serif`);
				const x0 = option.anchor === "start" ? option.x : option.anchor === "end" ? option.x - width : option.x - width / 2;
				return { x0, x1: x0 + width, y0: option.y - 11, y1: option.y + 3 };
			};

			// 标签之间不互相压住即可；不再要求标签避开节点圆——密集布局下这条会把
			// 所有候选位置否掉，结果一个标签都出不来。文字自带描边底色，压到节点也读得清。
			const placeLabels = (candidates, activeId, neighborIds, forcedIds) => {
				const placed = [];
				const result = new Map();
				const priority = node => (
					node.id === activeId ? 4
						: forcedIds.has(node.id) ? 3
							: neighborIds.has(node.id) ? 2
								: 1
				);
				const ordered = [...candidates].sort((a, b) => (
					priority(b) - priority(a)
					|| (Number(b.degree) || 0) - (Number(a.degree) || 0)
					|| (Number(b.heat) || 0) - (Number(a.heat) || 0)
				));
				for (const node of ordered) {
					const options = [
						{ x: node.x + node.r + 6, y: node.y + 4, anchor: "start" },
						{ x: node.x - node.r - 6, y: node.y + 4, anchor: "end" },
						{ x: node.x, y: node.y - node.r - 8, anchor: "middle" },
						{ x: node.x, y: node.y + node.r + 15, anchor: "middle" },
						{ x: node.x + node.r + 4, y: node.y - node.r - 4, anchor: "start" },
						{ x: node.x + node.r + 4, y: node.y + node.r + 14, anchor: "start" },
						{ x: node.x - node.r - 4, y: node.y - node.r - 4, anchor: "end" },
						{ x: node.x - node.r - 4, y: node.y + node.r + 14, anchor: "end" },
					];
					let chosen = null;
					for (const option of options) {
						const rect = labelRect(node, option);
						if (placed.some(other => rectsOverlap(other, rect, 2))) continue;
						chosen = { option, rect };
						break;
					}
					if (!chosen && priority(node) >= 3) {
						// 焦点节点与重点节点保底：宁可轻微压到别的标签也要显示出来
						const option = options[0];
						chosen = { option, rect: labelRect(node, option) };
					}
					if (!chosen) continue;
					placed.push(chosen.rect);
					result.set(node.id, chosen);
				}
				return result;
			};

			const applyLabels = (activeId, neighborIds) => {
				const candidates = new Map();
				for (const node of importantNodes) candidates.set(node.id, node);
				if (activeId) {
					const active = nodes.find(node => node.id === activeId);
					if (active) candidates.set(active.id, active);
					// 邻居只取前几个，避免悬停一个枢纽时冒出一片文字。
					const neighborNodes = [...neighborIds]
						.map(id => nodes.find(item => item.id === id))
						.filter(Boolean)
						.sort((a, b) => (
							(Number(b.degree) || 0) - (Number(a.degree) || 0)
							|| (Number(b.heat) || 0) - (Number(a.heat) || 0)
						))
						.slice(0, NEIGHBOR_LABEL_LIMIT);
					for (const node of neighborNodes) candidates.set(node.id, node);
				}
				const allowed = [...candidates.values()].filter(node => (
					visibleSet.has(node.id) && (emphasisSet.has(node.id) || node.id === activeId)
				));
				// 必显的一批：当前可见且未被类型过滤排除的节点里，连接度与热度最高的几个。
				const forcedIds = new Set([...allowed]
					.sort((a, b) => (
						(Number(b.degree) || 0) - (Number(a.degree) || 0)
						|| (Number(b.heat) || 0) - (Number(a.heat) || 0)
					))
					.slice(0, HUB_LABEL_LIMIT)
					.map(node => node.id));
				const placed = placeLabels(allowed, activeId, neighborIds, forcedIds);
				labelSelection
					.attr("font-size", labelFontSize)
					.attr("visibility", node => (placed.has(node.id) ? "visible" : "hidden"))
					.attr("x", node => (placed.get(node.id) ? placed.get(node.id).option.x : node.x))
					.attr("y", node => (placed.get(node.id) ? placed.get(node.id).option.y : node.y))
					.attr("text-anchor", node => (placed.get(node.id) ? placed.get(node.id).option.anchor : "middle"));
				nodeSelection.attr("tabindex", node => (placed.has(node.id) ? 0 : -1));
				return placed;
			};

			const redraw = () => {
				nodeSelection.attr("transform", node => `translate(${node.x},${node.y})`);
				edgeSelection.attr("d", edgePath);
				applyLabels(hoverIdRef.current || selectedIdRef.current, neighborIdsRef.current);
			};

			const drag = d3.drag()
				.on("start", (event, node) => {
					node.fx = node.x;
					node.fy = node.y;
					nodeSelection.classed("is-dragging", item => item.id === node.id);
				})
				.on("drag", (event, node) => {
					node.fx = event.x;
					node.fy = event.y;
					node.x = event.x;
					node.y = event.y;
					redraw();
				})
				.on("end", (event, node) => {
					node.fx = node.x;
					node.fy = node.y;
					nodeSelection.classed("is-dragging", false);
				});

			nodeSelection.call(drag);

			let pointerStart = null;
			const zoom = d3.zoom()
				.scaleExtent([ZOOM_MIN, ZOOM_MAX])
				.on("start", event => {
					if (event.sourceEvent) {
						pointerStart = d3.pointer(event.sourceEvent, svgNode);
						suppressClickRef.current = false;
						if (event.sourceEvent.type === "mousedown") stage.classList.add("lm-graph-is-panning");
					}
				})
				.on("zoom", event => {
					viewport.attr("transform", event.transform);
				})
				.on("end", event => {
					stage.classList.remove("lm-graph-is-panning");
					if (event.sourceEvent && pointerStart) {
						const end = d3.pointer(event.sourceEvent, svgNode);
						const moved = Math.abs(end[0] - pointerStart[0]) + Math.abs(end[1] - pointerStart[1]);
						suppressClickRef.current = moved > 4;
					}
				});
			svg.call(zoom);
			svg.on("dblclick.zoom", null);
			const endWindowGesture = () => {
				d3.select(window).on("mousemove.zoom mouseup.zoom", null);
			};
			window.addEventListener("pointerup", endWindowGesture, true);
			window.addEventListener("pointercancel", endWindowGesture, true);
			window.addEventListener("blur", endWindowGesture);
			svg.on("click", () => {
				const suppressed = suppressClickRef.current;
				suppressClickRef.current = false;
				if (suppressed) return;
				setSelectedId(null);
			});

			nodeSelection
				.on("mouseenter", (event, node) => setHoverId(node.id))
				.on("mouseleave", () => setHoverId(null))
				.on("focus", (event, node) => setHoverId(node.id))
				.on("blur", () => setHoverId(null))
				.on("click", (event, node) => {
					event.stopPropagation();
					setSelectedId(node.id);
				})
				.on("keydown", (event, node) => {
					if (event.key === "Enter" || event.key === " ") {
						event.preventDefault();
						event.stopPropagation();
						setSelectedId(node.id);
					}
				});

			const moveTooltip = node => {
				const tooltip = tooltipRef.current;
				if (!tooltip) return;
				const transform = d3.zoomTransform(svgNode);
				const x = node.x * transform.k + transform.x;
				const y = node.y * transform.k + transform.y;
				const bounds = stage.getBoundingClientRect();
				const rect = tooltip.getBoundingClientRect();
				const width = rect.width || tooltipSizeRef.current.width;
				const height = rect.height || tooltipSizeRef.current.height;
				// 提示框不压顶部工具栏卡片：卡片展开时按整张卡的下沿避让。
				const card = optionsCardRef.current;
				const toolbarBottom = card ? card.getBoundingClientRect().bottom - bounds.top + 6 : 8;
				const bottomLimit = bounds.height - 8 - height;
				let left = x + 16;
				let top = y - height / 2;
				if (left + width > bounds.width - 8) left = x - width - 16;
				if (left < 8) left = 8;
				if (top < toolbarBottom) top = toolbarBottom;
				if (top > bottomLimit) top = Math.max(toolbarBottom, bottomLimit);
				tooltip.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;
			};

			nodeSelection.on("mousemove", (event, node) => moveTooltip(node));

			const scene = {
				d3, svg, viewport, nodes, links, nodeSelection, edgeSelection, labelSelection,
				zoom, redraw, placeLabels, applyLabels, importantNodes, moveTooltip,
				visible: visibleSet,
				size: { width, height },
			};

			scene.setEmphasis = emphasisIds => {
				emphasisSet.clear();
				for (const id of emphasisIds) emphasisSet.add(id);
				nodeSelection.classed("is-muted", node => visibleSet.has(node.id) && !emphasisSet.has(node.id));
				edgeSelection.classed("is-muted", link => !emphasisSet.has(link.source.id) || !emphasisSet.has(link.target.id));
				applyLabels(hoverIdRef.current || selectedIdRef.current, neighborIdsRef.current);
			};

			scene.setVisible = visibleIds => {
				visibleSet.clear();
				for (const id of visibleIds) visibleSet.add(id);
				nodeSelection.style("display", node => (visibleSet.has(node.id) ? null : "none"));
				edgeSelection.style("display", link => (
					visibleSet.has(link.source.id) && visibleSet.has(link.target.id) ? null : "none"
				));
				labelSelection.style("display", node => (visibleSet.has(node.id) ? null : "none"));
			};

			scene.fit = animated => {
				const visibleNodes = nodes.filter(node => visibleSet.has(node.id));
				if (!visibleNodes.length) return;
				const size = measureStage();
				const area = computeFitArea(size);
				let x0 = Infinity;
				let y0 = Infinity;
				let x1 = -Infinity;
				let y1 = -Infinity;
				for (const node of visibleNodes) {
					x0 = Math.min(x0, node.x - node.r);
					y0 = Math.min(y0, node.y - node.r);
					x1 = Math.max(x1, node.x + node.r);
					y1 = Math.max(y1, node.y + node.r);
				}
				// 字号与画布利用率分开处理：先用节点包围盒估出缩放比，
				// 再把标签的世界字号放大到「屏上不小于基准字号」，标签始终读得清。
				const nodeBoxWidth = Math.max(1, x1 - x0);
				const nodeBoxHeight = Math.max(1, y1 - y0);
				const scaleHint = Math.min(area.areaWidth / nodeBoxWidth, area.areaHeight / nodeBoxHeight);
				labelFontSize = Math.max(LABEL_FONT_PX, Math.min(LABEL_FONT_PX * 2, LABEL_FONT_PX / Math.min(1, scaleHint)));
				const placed = applyLabels(hoverIdRef.current || selectedIdRef.current, neighborIdsRef.current);
				for (const entry of placed.values()) {
					x0 = Math.min(x0, entry.rect.x0);
					y0 = Math.min(y0, entry.rect.y0);
					x1 = Math.max(x1, entry.rect.x1);
					y1 = Math.max(y1, entry.rect.y1);
				}
				const reserve = area.reserve;
				const areaWidth = area.areaWidth;
				const areaHeight = area.areaHeight;
				const boxWidth = Math.max(1, x1 - x0);
				const boxHeight = Math.max(1, y1 - y0);
				const scale = Math.max(ZOOM_MIN, Math.min(2, 0.94 * Math.min(areaWidth / boxWidth, areaHeight / boxHeight)));
				const transform = d3.zoomIdentity
					.translate(size.width / 2, reserve + areaHeight / 2)
					.scale(scale)
					.translate(-(x0 + x1) / 2, -(y0 + y1) / 2);
				svg.interrupt();
				if (animated && !reducedMotion) {
					svg.transition().duration(360).ease(d3.easeCubicOut).call(zoom.transform, transform);
				} else {
					svg.call(zoom.transform, transform);
				}
			};

			scene.reset = () => {
				const visibleNodes = nodes.filter(node => visibleSet.has(node.id));
				if (!visibleNodes.length) return;
				const size = measureStage();
				let x0 = Infinity;
				let y0 = Infinity;
				let x1 = -Infinity;
				let y1 = -Infinity;
				for (const node of visibleNodes) {
					x0 = Math.min(x0, node.x - node.r);
					y0 = Math.min(y0, node.y - node.r);
					x1 = Math.max(x1, node.x + node.r);
					y1 = Math.max(y1, node.y + node.r);
				}
				const transform = d3.zoomIdentity
					.translate(size.width / 2, size.height / 2)
					.scale(1)
					.translate(-(x0 + x1) / 2, -(y0 + y1) / 2);
				svg.interrupt();
				if (reducedMotion) svg.call(zoom.transform, transform);
				else svg.transition().duration(320).ease(d3.easeCubicOut).call(zoom.transform, transform);
			};

			// 容器尺寸变化（侧栏开合、宽窄屏、浏览器缩放）时：按当前容器重算宽高比，
			// 再重新适屏；布局本身不重跑，节点不会因为尺寸变化而重新洗牌。
			scene.applyViewport = animated => {
				const size = measureStage();
				const nextAspect = layoutAspectFor(size);
				if (Math.abs(nextAspect - layoutAspect) / layoutAspect > 0.08) {
					// 可视区比例明显变化（侧栏开合、宽窄屏切换）：按新比例重排，
					// 同一 seed 结果稳定，再重新适屏。
					runLayout(size);
					redraw();
				}
				scene.fit(animated);
			};

			scene.zoomBy = factor => {
				svg.interrupt();
				if (reducedMotion) svg.call(zoom.scaleBy, factor);
				else svg.transition().duration(220).ease(d3.easeCubicOut).call(zoom.scaleBy, factor);
			};

			sceneRef.current = scene;
			firstFitRef.current = true;
			applyLabels(null, new Set());
			scene.fit(false);

			if (!reducedMotion) {
				nodeSelection.attr("opacity", 0)
					.transition()
					.duration(420)
					.delay((node, index) => Math.min(index * 5, 320))
					.ease(d3.easeCubicOut)
					.attr("opacity", 1);
				nodeSelection.select(".lm-graph-dot").attr("r", 0)
					.transition()
					.duration(300)
					.delay((node, index) => Math.min(index * 5, 320))
					.ease(d3.easeCubicOut)
					.attr("r", node => node.r);
				edgeSelection.attr("opacity", 0).transition().duration(520).attr("opacity", null);
			} else {
				nodeSelection.attr("opacity", 1);
				nodeSelection.select(".lm-graph-dot").attr("r", node => node.r);
				edgeSelection.attr("opacity", null);
			}

			setSceneVersion(version => version + 1);

			return () => {
				svg.interrupt();
				window.removeEventListener("pointerup", endWindowGesture, true);
				window.removeEventListener("pointercancel", endWindowGesture, true);
				window.removeEventListener("blur", endWindowGesture);
				d3.select(window).on("mousemove.zoom mouseup.zoom", null);
				svg.on(".zoom", null);
				svg.on("click", null);
				svg.selectAll("*").remove();
				if (sceneRef.current === scene) sceneRef.current = null;
			};
		}, [graph, namespace, reducedMotion]);

		useEffect(() => {
			// 把 buildScene 的清理函数交回 React：场景重建或卸载时，
			// 原生 window 监听、缩放行为与场景 DOM 才会真正释放。
			return buildScene();
		}, [buildScene]);

		useEffect(() => {
			const scene = sceneRef.current;
			if (!scene) return;
			const activeId = hoverId || selectedId;
			const neighborIds = new Set();
			if (activeId) {
				neighborIds.add(activeId);
				for (const link of scene.links) {
					if (link.source.id === activeId) neighborIds.add(link.target.id);
					if (link.target.id === activeId) neighborIds.add(link.source.id);
				}
			}
			neighborIdsRef.current = neighborIds;
			scene.nodeSelection
				.classed("is-active", node => node.id === activeId)
				.classed("is-linked", node => Boolean(activeId) && node.id !== activeId && neighborIds.has(node.id))
				.classed("is-dim", node => Boolean(activeId) && !neighborIds.has(node.id));
			scene.edgeSelection
				.classed("is-active", link => Boolean(activeId) && (link.source.id === activeId || link.target.id === activeId))
				.classed("is-dim", link => Boolean(activeId) && !(link.source.id === activeId || link.target.id === activeId));
			scene.labelSelection
				.classed("is-active", node => node.id === activeId)
				.classed("is-linked", node => Boolean(activeId) && node.id !== activeId && neighborIds.has(node.id));
			scene.applyLabels(activeId, neighborIds);
			if (hoverId) {
				const active = scene.nodes.find(node => node.id === hoverId);
				if (active) scene.moveTooltip(active);
			}
		}, [hoverId, selectedId, sceneVersion]);

		// 用内容签名做依赖：只有真正移除节点的过滤（搜索 / 仅看有边）才重新适屏，
		// 类型强调只改明暗，不动视口，避免筛选时画面跳动。
		useEffect(() => {
			const scene = sceneRef.current;
			if (!scene) return;
			scene.setVisible(new Set(filtered.nodes.map(node => node.id)));
			const animate = !firstFitRef.current;
			firstFitRef.current = false;
			scene.fit(animate);
		}, [filtered.removingKey, sceneVersion]);

		useEffect(() => {
			const scene = sceneRef.current;
			if (!scene) return;
			scene.setEmphasis(new Set(filtered.kindMatched.map(node => node.id)));
		}, [filtered.kindKey, sceneVersion]);

		useEffect(() => {
			const scene = sceneRef.current;
			const stage = stageRef.current;
			if (!scene || !stage || typeof ResizeObserver === "undefined") return undefined;
			let frame = 0;
			const observer = new ResizeObserver(() => {
				if (frame) cancelAnimationFrame(frame);
				frame = requestAnimationFrame(() => {
					const current = sceneRef.current;
					if (!current) return;
					current.applyViewport(true);
				});
			});
			observer.observe(stage);
			return () => {
				if (frame) cancelAnimationFrame(frame);
				observer.disconnect();
			};
		}, [sceneVersion]);

		const closeOptions = useCallback(restoreFocus => {
			setOptionsOpen(false);
			if (restoreFocus && optionsTriggerRef.current) {
				optionsTriggerRef.current.focus({ preventScroll: true });
			}
		}, []);
		const dismissOptions = useCallback(() => closeOptions(false), [closeOptions]);
		// 外点关闭：卡片根同时充当“内部”判定，卡片内（header 与展开区）的点击不会误关。
		useOutsideDismiss(optionsCardRef, optionsOpen, dismissOptions, optionsCardRef);

		useEffect(() => {
			const stage = stageRef.current;
			if (!stage) return undefined;
			const onKeyDown = event => {
				if (event.key === "Escape") {
					setSelectedId(null);
					setHoverId(null);
					closeOptions(true);
				}
			};
			stage.addEventListener("keydown", onKeyDown);
			return () => stage.removeEventListener("keydown", onKeyDown);
		}, []);

		useEffect(() => {
			const tooltip = tooltipRef.current;
			if (!tooltip) return;
			const rect = tooltip.getBoundingClientRect();
			tooltipSizeRef.current = { width: rect.width || 240, height: rect.height || 72 };
		}, [hoverId, selectedId]);

		const kindLabel = kind => {
			if (kind === "rule") return s.kindRule;
			if (kind === "fact") return s.kindFact;
			if (kind === "sop") return s.kindSop;
			return kind || "—";
		};

		const kindLocked = kindControlled && typeof onKindChange !== "function";
		// 类型 chip 上的数字是当前命名空间的库存数（不受搜索 / 仅看有边影响），
		// 与条目表的 facets 口径一致；搜索造成的可见数量变化由下面的节点计数体现。
		const kindCounts = useMemo(() => {
			const counts = { rule: 0, fact: 0, sop: 0 };
			for (const node of graph ? graph.nodes : []) {
				if (counts[node.kind] !== undefined) counts[node.kind] += 1;
			}
			return counts;
		}, [graph]);

		const countsText = s.counts
			.replace("{nodes}", String(filtered.nodes.length))
			.replace("{totalNodes}", String(graph ? graph.nodes.length : 0))
			.replace("{edges}", String(filtered.edges.length))
			.replace("{totalEdges}", String(graph ? graph.edges.length : 0));

		const activeConditions = (kindFilter ? 1 : 0)
			+ (edgeTypes.related === false || edgeTypes.similar === false ? 1 : 0)
			+ (onlyConnected ? 1 : 0);
		// 基础文案与生效条件后缀分开：基础文案永不收缩，后缀先被省略。
		const optionsSuffix = `${kindFilter ? " · " + kindLabel(kindFilter) : ""}${activeConditions ? " (" + activeConditions + ")" : ""}`;
		const optionsLabel = `${s.displayOptions}${optionsSuffix}`;

		const searchInput = Input
			? h(Input, {
				type: "search",
				className: "lm-graph-search",
				placeholder: s.search,
				value: query,
				onChange: event => setQuery(event.target.value),
			})
			: h("input", {
				type: "search",
				className: "lm-graph-search",
				placeholder: s.search,
				value: query,
				onChange: event => setQuery(event.target.value),
			});

		// 显示选项的内容：类型强调、关系类型、仅看有边、重置与计数。
		const optionsContent = h("div", { className: "lm-graph-options-body" },
			h("div", { className: "lm-graph-options-group" },
				h("span", { className: "lm-graph-options-label" }, s.typeFilter),
				h("div", { className: "lm-graph-chips" },
					h(ToggleButton, {
						label: `${s.all} (${graph ? graph.nodes.length : 0})`,
						active: kindFilter === "",
						disabled: kindLocked,
						onClick: () => applyKind(""),
					}),
					KIND_ORDER.map(kind => h(ToggleButton, {
						key: kind,
						label: `${kindLabel(kind)} (${kindCounts[kind] || 0})`,
						active: kindFilter === kind,
						disabled: kindLocked,
						onClick: () => applyKind(kindFilter === kind ? "" : kind),
					})))),
			h("div", { className: "lm-graph-options-group" },
				h("span", { className: "lm-graph-options-label" }, s.relationFilter),
				h("div", { className: "lm-graph-chips" },
					EDGE_TYPES.map(type => h(ToggleButton, {
						key: type,
						label: `${type === "similar" ? s.similar : s.explicit} (${filtered.edgeCounts[type] || 0})`,
						active: edgeTypes[type] !== false,
						onClick: () => setEdgeTypes(current => ({ ...current, [type]: current[type] === false })),
					})))),
			h("div", { className: "lm-graph-options-group" },
				Switch
					? h("label", { className: "lm-graph-switch" },
						h(Switch, { checked: onlyConnected, onChange: value => setOnlyConnected(Boolean(value)) }),
						h("span", null, s.onlyConnected))
					: h("label", { className: "lm-graph-switch" },
						h("input", { type: "checkbox", checked: onlyConnected, onChange: event => setOnlyConnected(event.target.checked) }),
						h("span", null, s.onlyConnected))),
			h("div", { className: "lm-graph-options-foot" },
				h(ActionButton, {
					label: s.reset,
					variant: "ghost",
					title: s.reset,
					onClick: () => sceneRef.current && sceneRef.current.reset(),
				}),
				h("span", { className: "lm-graph-counts" }, countsText)));

		// 一张可展开的卡片：header 行（搜索 + 适屏 + 显示选项入口）常驻，
		// 展开区接在同卡片下缘、同宽、内部滚动。
		// toolbarRef 只挂 header 行——适屏预留与 observer 只看它，
		// 展开高度因此不会触发 refit、也不会推动画布。
		const toolbar = h(DisclosureView, {
			open: optionsOpen,
			onOpenChange: next => setOptionsOpen(Boolean(next)),
			id: "lm-graph-options",
			rootRef: optionsCardRef,
			className: "lm-graph-toolbar-card",
			bodyClassName: "lm-graph-toolbar-body",
			renderHeader: ({ open, toggle, contentId }) => h("div", {
				className: "lm-graph-toolbar-header",
				ref: toolbarRef,
			},
				searchInput,
				h(ActionButton, {
					label: s.fitShort,
					title: s.fit,
					ariaLabel: s.fit,
					extraClass: "is-fixed",
					onClick: () => sceneRef.current && sceneRef.current.fit(true),
				}),
				h(ActionButton, {
					label: s.displayOptions,
					title: optionsLabel,
					ariaLabel: optionsLabel,
					ariaExpanded: open,
					ariaControls: contentId,
					extraClass: (open || activeConditions ? "is-active " : "") + "is-fixed",
					icon: IconSlidersTwoOutlineRegular ? h(IconSlidersTwoOutlineRegular, { size: 13 }) : undefined,
					buttonRef: optionsTriggerRef,
					onClick: toggle,
				}),
				optionsSuffix
					? h("span", { className: "lm-graph-options-state", title: optionsSuffix, "aria-hidden": "true" }, optionsSuffix)
					: null),
			children: optionsContent,
		});

		// 缩放做成地图角落的紧凑控件，键盘与触屏都能按到。
		const zoomCluster = h("div", { className: "lm-graph-zoom-cluster" },
			h(ActionButton, {
				label: "+",
				title: s.zoomIn,
				ariaLabel: s.zoomIn,
				onClick: () => sceneRef.current && sceneRef.current.zoomBy(1.4),
			}),
			h(ActionButton, {
				label: "−",
				title: s.zoomOut,
				ariaLabel: s.zoomOut,
				onClick: () => sceneRef.current && sceneRef.current.zoomBy(1 / 1.4),
			}));

		const legend = h("div", { className: "lm-graph-legend", "aria-label": s.legend },
			KIND_ORDER.map(kind => h("span", { key: kind, className: "lm-graph-legend-item" },
				h("span", { className: "lm-graph-legend-swatch lm-graph-kind-" + kind }),
				kindLabel(kind))));

		const hoveredNeighbors = hoveredNode ? neighborsOf(hoveredNode.id).length : 0;
		const tooltip = hoveredNode
			? h("div", { className: "lm-graph-tooltip", ref: tooltipRef, role: "status" },
				h("div", { className: "lm-graph-tooltip-title" }, hoveredNode.title || hoveredNode.key),
				h("div", { className: "lm-graph-tooltip-row" },
					h("span", { className: "lm-graph-tooltip-kind lm-graph-kind-" + (hoveredNode.kind || "other") }, kindLabel(hoveredNode.kind)),
					h("span", null, ` · ${s.relations} ${hoveredNeighbors}`)))
			: null;

		const neighbors = selectedNode ? neighborsOf(selectedNode.id) : [];

		const disclosure = (key, title, count, children, id) => h(DisclosureView, {
			title,
			open: Boolean(sections[key]),
			onOpenChange: next => setSections(current => ({ ...current, [key]: Boolean(next) })),
			children,
			id,
			count,
			className: "lm-graph-disclosure",
		});

		// 选中面板默认只留标题、类型、打开条目；关联与定位信息按需展开。
		const panel = selectedNode
			? h("aside", {
				key: selectedNode.id,
				className: "lm-graph-panel",
				"aria-label": s.detail,
				style: { "--lm-graph-panel-top": Math.round(toolbarHeight + 20) + "px" },
			},
				h("div", { className: "lm-graph-panel-head" },
					h("div", { className: "lm-graph-panel-titles" },
						h("h3", { className: "lm-graph-panel-title" }, selectedNode.title || selectedNode.key),
						h("span", { className: "lm-graph-panel-kind lm-graph-kind-" + (selectedNode.kind || "other") }, kindLabel(selectedNode.kind))),
					h(ActionButton, {
						label: IconCloseOutlineRegular ? null : "✕",
						title: s.close,
						ariaLabel: s.close,
						variant: "ghost",
						icon: IconCloseOutlineRegular ? h(IconCloseOutlineRegular, { size: 13 }) : undefined,
						onClick: () => setSelectedId(null),
					})),
				h(ActionButton, {
					label: s.openEntry,
					variant: "primary",
					onClick: () => {
						if (!onJumpEntry) return;
						onJumpEntry({
							namespace: selectedNode.namespace || namespace,
							kind: selectedNode.kind,
							key: selectedNode.key,
						});
					},
				}),
				disclosure("relations", s.relations, neighbors.length,
					neighbors.length
						? h("ul", { className: "lm-graph-neighbor-list" }, neighbors.map(entry => h("li", { key: entry.node.id },
							h("button", {
								type: "button",
								className: "lm-graph-neighbor-link",
								onClick: () => setSelectedId(entry.node.id),
							}, entry.node.title || entry.node.key),
							entry.edge.type === "similar" && entry.edge.similarity != null
								? h("span", { className: "lm-graph-neighbor-sim" }, `${s.similarity} ${Math.round(Number(entry.edge.similarity) * 100)}%`)
								: null)))
						: h("p", { className: "lm-graph-panel-empty" }, s.noNeighbors),
					"lm-graph-panel-relations"),
				disclosure("locate", s.locate, null,
					h("div", { className: "lm-graph-panel-locate" },
						h("span", null, selectedNode.namespace || namespace || "—"),
						h("span", null, selectedNode.kind || "—"),
						h("span", null, selectedNode.key || "—")),
					"lm-graph-panel-locate"))
			: null;

		const hasFilters = Boolean(query.trim())
			|| Boolean(kindFilter)
			|| onlyConnected
			|| edgeTypes.related === false
			|| edgeTypes.similar === false;
		const clearFilters = useCallback(() => {
			setQuery("");
			setOnlyConnected(false);
			setEdgeTypes({ related: true, similar: true });
			applyKind("");
		}, [applyKind]);
		const errorDetail = error && error.message ? error.message : "";

		const refreshIcon = IconRefreshOutlineRegular ? h(IconRefreshOutlineRegular, { size: 13 }) : undefined;
		const overlay = status === "loading"
			? h("div", { className: "lm-graph-overlay" },
				h(StateIcon, { kind: "loading" }),
				h("p", { className: "lm-graph-overlay-title" }, s.loading))
			: status === "error"
				? h("div", { className: "lm-graph-overlay lm-graph-overlay-error" },
					h(StateIcon, { kind: "error" }),
					h("p", { className: "lm-graph-overlay-title" }, s.loadFailed),
					h("div", { className: "lm-graph-overlay-actions" },
						h(ActionButton, {
							label: s.retry,
							variant: "primary",
							ariaLabel: s.retry,
							icon: refreshIcon,
							onClick: () => load(),
						}),
						errorDetail
							? h(ActionButton, {
								label: s.detail,
								variant: "ghost",
								ariaLabel: s.detail,
								ariaExpanded: detailOpen,
								onClick: () => setDetailOpen(open => !open),
							})
							: null),
					detailOpen && errorDetail
						? h("p", { className: "lm-graph-overlay-detail" }, errorDetail)
						: null)
				: status === "no-namespace"
					? h("div", { className: "lm-graph-overlay" },
						h(StateIcon, { kind: "empty" }),
						h("p", { className: "lm-graph-overlay-title" }, s.noNamespace))
					: status === "ready" && !engineReady
						? h("div", { className: "lm-graph-overlay lm-graph-overlay-error" },
							h(StateIcon, { kind: "error" }),
							h("p", { className: "lm-graph-overlay-title" }, s.engineMissing),
							h(ActionButton, {
								label: s.reload,
								variant: "primary",
								ariaLabel: s.reload,
								icon: refreshIcon,
								onClick: () => { if (typeof window !== "undefined") window.location.reload(); },
							}))
						: status === "ready" && (!filtered.nodes.length || (kindFilter && !filtered.kindMatched.length))
							? h("div", { className: "lm-graph-overlay" },
								h(StateIcon, { kind: graph && graph.nodes.length ? "filtered" : "empty" }),
								h("p", { className: "lm-graph-overlay-title" }, graph && graph.nodes.length ? s.noMatch : s.empty),
								hasFilters
									? h(ActionButton, { label: s.clearFilters, variant: "outline", onClick: () => clearFilters() })
									: null)
							: null;

		return h("div", { className: "lm-graph-view" },
			h("style", null, styleText),
			h("div", { className: "lm-graph-stage", ref: stageRef },
				h("svg", {
					className: "lm-graph-canvas",
					ref: svgRef,
					role: "img",
					"aria-label": s.graphLabel,
					tabIndex: 0,
				}),
				toolbar,
				zoomCluster,
				legend,
				tooltip,
				panel,
				overlay));
	}

	return MemoryGraphView;
}
