// Client runtime bundle entry.
//
// Everything the memory workbench needs that the DSH host does not provide is
// bundled here by scripts/build.mjs (esbuild) and handed to the view
// factories as a single `runtime` object:
//
//   * framer-motion (MIT) — the animation engine used by the vendored
//     components and by the views.
//   * lucide-react (MIT) — the icon set used by the vendored components.
//   * The vendored EasyUI (MIT) components, adapted to DSH-token classes.
//
// `react`, `react-dom` and every `@deepseek-ai/*` module stay EXTERNAL so the
// bundle resolves them through the host-injected `require` at load time. That
// guarantees a single React instance is used and that no host package is
// duplicated inside the artifact.
//
// The bundle is emitted as an IIFE whose exports land on the local
// `__LM_UI__` binding inside the module factory — nothing is published on
// `globalThis`.

import {
	AnimatePresence,
	LayoutGroup,
	animate,
	motion,
	useMotionValue,
	useReducedMotion,
	useSpring,
	useTransform,
} from "framer-motion";

import {
	DataTable,
	DataTableContent,
	DataTableFilters,
	DataTablePagination,
	DataTableToolbar,
	useDataTable,
} from "./vendor/easyui/AdvancedDataTable.tsx";
import { AnimatedTabs } from "./vendor/easyui/AnimatedTabs.tsx";
import { Disclosure } from "./vendor/easyui/Disclosure.tsx";
import { ChartCard, SegmentedControl } from "./vendor/easyui/chart-primitives.tsx";
import { ToolbarPopover } from "./vendor/host/ToolbarPopover.tsx";
import easyuiStyles from "./vendor/easyui/easyui.css";
import toolbarPopoverStyles from "./vendor/host/toolbar-popover.css";

const STYLE_ELEMENT_ID = "lm-easyui-styles";
const TOOLBAR_POPOVER_STYLE_ELEMENT_ID = "lm-toolbar-popover-styles";

function injectStyles(id, css) {
	if (typeof document === "undefined") return;
	if (document.getElementById(id)) return;
	const element = document.createElement("style");
	element.id = id;
	element.textContent = css;
	document.head.appendChild(element);
}

function prefersReducedMotion() {
	if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * @param {Function} require host-injected module resolver
 * @param {{ d3?: object }} [options] extra runtimes resolved by the build
 */
export function createMemoryUiRuntime(require, options) {
	const React = require("react");
	const ui = require("@deepseek-ai/dsh-client-ui-primitives");
	const d3 = (options && options.d3) || (typeof globalThis !== "undefined" ? globalThis.d3 : undefined);
	injectStyles(STYLE_ELEMENT_ID, easyuiStyles);
	injectStyles(TOOLBAR_POPOVER_STYLE_ELEMENT_ID, toolbarPopoverStyles);
	return {
		React,
		ui,
		motion,
		AnimatePresence,
		LayoutGroup,
		useReducedMotion,
		useMotionValue,
		useTransform,
		useSpring,
		animate,
		d3,
		components: {
			DataTable,
			DataTableToolbar,
			DataTableFilters,
			DataTableContent,
			DataTablePagination,
			AnimatedTabs,
			Disclosure,
			ToolbarPopover,
			ChartCard,
			SegmentedControl,
		},
		useDataTable,
		reducedMotion: prefersReducedMotion,
	};
}
