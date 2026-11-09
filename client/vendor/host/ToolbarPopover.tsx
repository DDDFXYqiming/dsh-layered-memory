// Toolbar popover for toolbars — built on the host's public primitives.
//
// This component is not vendored third-party code: it is an adapter over
// `@deepseek-ai/dsh-client-ui-primitives`, which the host already exposes to
// plugins. The host owns the positioning, so no measurement maths is
// duplicated here:
//
//   * `useAnchoredPosition` — anchor placement with viewport collision
//     handling, flipping and clamping. It tracks scrolling, Visual Viewport
//     panning, browser zoom and the size of both the anchor and the panel.
//     It returns viewport coordinates (`top` / `left`) and nothing else.
//   * `useDismissOnOutsidePointer` — outside-pointer dismissal.
//   * `MenuSurface` — the host's menu surface. It renders its own content
//     where it is placed and portals only a backing element to the document
//     body, so this adapter mounts the surface itself.
//
// Because the surface is placed by this adapter, it has to be pinned to the
// viewport: the host surface is `position: relative` and the anchor hook
// reports viewport coordinates, so the surface is given `position: fixed` in
// both states — while measuring and once positioned.
//
// The panel is only mounted while it is open, so a closed popover leaves no
// empty surface behind.

import React, { useCallback, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import {
	MenuSurface,
	useAnchoredPosition,
	useDismissOnOutsidePointer,
} from "@deepseek-ai/dsh-client-ui-primitives";
import { cn } from "../easyui/utils";

/**
 * Hidden but laid out, so the anchor hook can measure the real panel size
 * before it positions it.
 */
const MEASURE_STYLE: React.CSSProperties = {
	position: "fixed",
	top: 0,
	left: 0,
	visibility: "hidden",
	pointerEvents: "none",
};

export interface ToolbarPopoverProps {
	/** Trigger content. */
	title: React.ReactNode;
	/** Controlled open state. Defaults to closed. */
	open?: boolean;
	/** Called with the next state when the trigger is activated or the popover closes. */
	onOpenChange?: (open: boolean) => void;
	/** Panel content. Mounted only while open. */
	children?: React.ReactNode;
	/** Id of the panel. `aria-controls` points at it. */
	id?: string;
	/** Optional count badge next to the trigger label. */
	count?: number;
	/** Extra class on the inline root element that holds the trigger. */
	className?: string;
	/** Extra class on the portalled panel surface — separate from `className`,
	 *  because the panel is mounted outside the root in the DOM. */
	panelClassName?: string;
	/** Horizontal alignment of the panel against the trigger. */
	align?: "start" | "center" | "end";
	/** Side of the trigger the panel opens to. */
	side?: "bottom" | "top";
	/** Accessible name of the panel. Defaults to the trigger's own text. */
	ariaLabel?: string;
}

export const ToolbarPopover: React.FC<ToolbarPopoverProps> = ({
	title,
	open = false,
	onOpenChange,
	children,
	id,
	count,
	className,
	panelClassName,
	align = "end",
	side = "bottom",
	ariaLabel,
}) => {
	const generatedId = useId();
	const panelId = id || `lm-toolbar-popover-${generatedId}`;
	const triggerId = `${panelId}-trigger`;
	const triggerRef = useRef<HTMLButtonElement | null>(null);
	const panelRef = useRef<HTMLDivElement | null>(null);
	const dialogRef = useRef<HTMLDivElement | null>(null);
	const focusedForOpenRef = useRef(false);
	const isOpen = open === true;

	const setOpen = useCallback(
		(next: boolean) => {
			onOpenChange?.(next);
		},
		[onOpenChange],
	);

	const position = useAnchoredPosition({
		open: isOpen,
		anchorRef: triggerRef,
		panelRef,
		side,
		align,
		gap: 8,
		margin: 12,
	});

	useDismissOnOutsidePointer(triggerRef, isOpen, setOpen, panelRef);

	useEffect(() => {
		if (!isOpen) return;
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key !== "Escape") return;
			event.preventDefault();
			event.stopPropagation();
			setOpen(false);
			triggerRef.current?.focus();
		};
		document.addEventListener("keydown", onKeyDown, true);
		return () => document.removeEventListener("keydown", onKeyDown, true);
	}, [isOpen, setOpen]);

	// Move focus into the panel once per open, so Tab continues inside the
	// content instead of walking through the page behind it. The container
	// itself is focused rather than a field inside it, which would raise the
	// on-screen keyboard on touch devices. Re-positioning must not take the
	// focus back.
	useEffect(() => {
		if (!isOpen) {
			focusedForOpenRef.current = false;
			return;
		}
		if (focusedForOpenRef.current) return;
		if (!position) return;
		focusedForOpenRef.current = true;
		dialogRef.current?.focus({ preventScroll: true });
	}, [isOpen, position]);

	return (
		<span className={cn("lm-eui-toolbar-popover", className)}>
			<button
				type="button"
				id={triggerId}
				ref={triggerRef}
				aria-expanded={isOpen}
				aria-haspopup="dialog"
				aria-controls={panelId}
				className="lm-eui-toolbar-popover-trigger"
				onClick={() => setOpen(!isOpen)}
			>
				<span className="lm-eui-toolbar-popover-label">{title}</span>
				{typeof count === "number" && (
					<span className="lm-eui-toolbar-popover-count">{count}</span>
				)}
			</button>
			{isOpen
				? createPortal(
						<MenuSurface
							ref={panelRef}
							id={panelId}
							phase="enter"
							className={cn("lm-eui-toolbar-popover-panel", panelClassName)}
							style={{ ...(position ?? MEASURE_STYLE), position: "fixed" }}
						>
							<div
								ref={dialogRef}
								className="lm-eui-toolbar-popover-body"
								role="dialog"
								tabIndex={-1}
								aria-label={ariaLabel}
								aria-labelledby={ariaLabel ? undefined : triggerId}
							>
								{children}
							</div>
						</MenuSurface>,
						document.body,
					)
				: null}
		</span>
	);
};
