// Adapted from https://github.com/Surajmaurya1/easyui/blob/main/src/components/ui/SmoothAccordion.tsx
// MIT License, Copyright (c) 2026 Suraj Maurya. See ./LICENSE
//
// Component Hunt: https://componenthunt.dev/easyui/smooth-accordion
// Upstream source: https://easyui.site/components/smooth-accordion
//
// Adaptation: upstream is a multi-item accordion that owns its open state
// internally (`openIds`) and renders a `subtitle` under each title. This
// vendored copy keeps upstream's trigger mechanics — a real `<button>` with
// `aria-expanded`, a spring-animated chevron and an `AnimatePresence` height
// transition — and turns it into a single, fully controlled disclosure:
//
//   * `open` belongs to the caller; the component never keeps a second copy
//     of the business state. It only reports the next state.
//   * `title` accepts a node (upstream was a plain string) and an optional
//     `count` badge sits next to it.
//   * The panel container is always rendered so `aria-controls` always
//     resolves, but the children are unmounted while collapsed, so a closed
//     disclosure leaves no focusable control behind.
//   * Styling is expressed with DSH tokens instead of Tailwind utilities.

import React, { useCallback, useId } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "./utils";
import { motionTransitions } from "./motion-tokens";

export interface DisclosureProps {
	/** Trigger content of the default trigger button. Optional: a caller that
	 *  supplies `renderHeader` provides its own header instead. */
	title?: React.ReactNode;
	/** Controlled open state. Defaults to closed. */
	open?: boolean;
	/** Called with the next state when the trigger is activated. */
	onOpenChange?: (open: boolean) => void;
	/** Panel content. Unmounted while collapsed. */
	children?: React.ReactNode;
	/** Id of the panel region. `aria-controls` points at it. */
	id?: string;
	/** Optional count badge rendered next to the title. */
	count?: number;
	/** Extra class on the root element, for layout only. */
	className?: string;
	/** Custom header, for callers that need their own controls in the header
	 *  row. It replaces the default trigger button; the caller owns the
	 *  element and its accessibility wiring, using the state it receives. */
	renderHeader?: (state: DisclosureHeaderState) => React.ReactNode;
	/** Ref to the root element, for callers that measure it or dismiss on
	 *  an outside pointer. */
	rootRef?: React.Ref<HTMLDivElement>;
	/** Class for the expanded body region. Providing one hands that region
	 *  over to the caller: the component then applies no padding, height
	 *  limit or scrolling of its own. */
	bodyClassName?: string;
}

/** State handed to a custom header. */
export interface DisclosureHeaderState {
	/** The controlled open state. */
	open: boolean;
	/** Requests the next state; the caller keeps ownership of `open`. */
	toggle: () => void;
	/** Id of the panel region, for the header's `aria-controls`. */
	contentId: string;
}

export const Disclosure: React.FC<DisclosureProps> = ({
	title,
	open = false,
	onOpenChange,
	children,
	id,
	count,
	className,
	renderHeader,
	rootRef,
	bodyClassName,
}) => {
	const generatedId = useId();
	const contentId = id || `lm-disclosure-${generatedId}`;
	const isOpen = open === true;
	const reduceMotion = useReducedMotion();
	const heightTransition = reduceMotion
		? { duration: 0 }
		: motionTransitions.springGentle;
	const chevronTransition = reduceMotion
		? { duration: 0 }
		: motionTransitions.springSnappy;
	const toggle = useCallback(
		() => onOpenChange?.(!isOpen),
		[isOpen, onOpenChange],
	);

	return (
		<div
			ref={rootRef}
			className={cn("lm-eui-disclosure", className)}
			data-open={isOpen ? "true" : "false"}
		>
			{renderHeader ? (
				renderHeader({ open: isOpen, toggle, contentId })
			) : (
				<button
					type="button"
					aria-expanded={isOpen}
					aria-controls={contentId}
					onClick={toggle}
					className="lm-eui-disclosure-trigger"
				>
					<span className="lm-eui-disclosure-heading">
						<span className="lm-eui-disclosure-title">{title}</span>
						{typeof count === "number" && (
							<span className="lm-eui-disclosure-count">{count}</span>
						)}
					</span>
					<motion.span
						aria-hidden
						animate={{ rotate: isOpen ? 180 : 0 }}
						transition={chevronTransition}
						className="lm-eui-disclosure-chevron"
					>
						<ChevronDown className="lm-eui-icon" />
					</motion.span>
				</button>
			)}

			{/*
			 * The panel container is always present so `aria-controls` always
			 * resolves, but while it is collapsed the whole region is
			 * `aria-hidden` and `inert`. That also covers the exit
			 * animation: `open` is already false while the old children are
			 * still mounted, so they cannot be reached by Tab in the
			 * meantime.
			 *
			 * The host runtime is React 18, where `inert` is not a known
			 * boolean prop: it is emitted as the empty-string attribute,
			 * which is what the HTML boolean attribute expects.
			 */}
			<div
				id={contentId}
				className="lm-eui-disclosure-panel"
				aria-hidden={isOpen ? undefined : true}
				inert={isOpen ? undefined : ""}
			>
				<AnimatePresence initial={false}>
					{isOpen && (
						<motion.div
							key="content"
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: "auto", opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={heightTransition}
							className={cn(
								"lm-eui-disclosure-body",
								!bodyClassName && "lm-eui-disclosure-body-default",
								bodyClassName,
							)}
						>
							{children}
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
};
