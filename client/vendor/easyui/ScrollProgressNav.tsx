// Adapted from https://github.com/Surajmaurya1/easyui/blob/main/src/components/ui/ScrollProgressNav.tsx
// MIT License, Copyright (c) 2026 Suraj Maurya. See ./LICENSE
//
// Adaptation: upstream behaviour is unchanged — scroll depth drives a hairline
// progress line, crossing `scrollThreshold` morphs the bar into a floating
// pill, a shared-layout pill springs between sections, the active section is
// highlighted, clicks scroll smoothly, and the bar collapses into an
// expandable section menu on narrow viewports. `containerRef` + `mode` let it
// track an inner scroll container instead of the document.
// Only the Tailwind class strings were replaced with DSH-token classes
// (`lm-eui-*`); the upstream `motionTransitions` spring tokens are reused.

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowUp, ChevronRight } from "lucide-react";
import { cn } from "./utils";
import { motionTransitions } from "./motion-tokens";

export interface NavSectionItem {
	id: string;
	label: string;
	index?: string;
}

export interface ScrollProgressNavProps {
	/** Section navigation items */
	sections?: NavSectionItem[];
	/** Threshold in px to morph into floating pill */
	scrollThreshold?: number;
	/** Active section manual override or default */
	activeId?: string;
	/** Position mode: 'fixed' attaches to screen viewport, 'inline'/'sticky' stays within parent container */
	mode?: "fixed" | "inline" | "sticky";
	/** Optional scroll container reference */
	containerRef?: React.RefObject<HTMLElement | null>;
	/** Callback fired when a section is clicked */
	onSectionClick?: (id: string) => void;
	/** Position alignment when mode is 'fixed' */
	position?: "top-center" | "bottom-center" | "top-right";
	/** Custom class name */
	className?: string;
}

const defaultSections: NavSectionItem[] = [
	{ id: "overview", index: "01", label: "Overview" },
	{ id: "features", index: "02", label: "Features" },
	{ id: "components", index: "03", label: "Components" },
	{ id: "documentation", index: "04", label: "Documentation" },
	{ id: "pricing", index: "05", label: "Pricing" },
];

export const ScrollProgressNav: React.FC<ScrollProgressNavProps> = ({
	sections = defaultSections,
	scrollThreshold = 150,
	activeId: controlledActiveId,
	mode = "fixed",
	containerRef,
	onSectionClick,
	position = "top-center",
	className,
}) => {
	const uniqueId = React.useId();
	const [isFloating, setIsFloating] = useState(mode !== "inline");
	const [scrollProgress, setScrollProgress] = useState(0);
	const [activeSection, setActiveSection] = useState<string>(
		controlledActiveId || sections[0]?.id || "",
	);
	const [isExpanded, setIsExpanded] = useState(false);

	useEffect(() => {
		if (controlledActiveId) {
			setActiveSection(controlledActiveId);
		}
	}, [controlledActiveId]);

	const handleScroll = useCallback(() => {
		let totalHeight = 0;
		let currentScroll = 0;

		if (containerRef && containerRef.current) {
			const el = containerRef.current;
			totalHeight = el.scrollHeight - el.clientHeight;
			currentScroll = el.scrollTop;
		} else if (mode === "fixed") {
			totalHeight = document.documentElement.scrollHeight - window.innerHeight;
			currentScroll = window.scrollY;
		}

		if (totalHeight > 0) {
			const progress = Math.min(100, Math.max(0, (currentScroll / totalHeight) * 100));
			setScrollProgress(progress);
		}

		if (mode === "fixed") {
			setIsFloating(currentScroll > scrollThreshold);
		}

		if (!controlledActiveId) {
			if (containerRef && containerRef.current) {
				const containerRect = containerRef.current.getBoundingClientRect();
				for (let i = sections.length - 1; i >= 0; i--) {
					const el = containerRef.current.querySelector(`#${sections[i].id}`) as HTMLElement | null;
					if (el) {
						const rect = el.getBoundingClientRect();
						if (rect.top - containerRect.top <= 120) {
							setActiveSection(sections[i].id);
							break;
						}
					}
				}
			} else if (mode === "fixed") {
				for (let i = sections.length - 1; i >= 0; i--) {
					const el = document.getElementById(sections[i].id);
					if (el) {
						const rect = el.getBoundingClientRect();
						if (rect.top <= window.innerHeight * 0.4) {
							setActiveSection(sections[i].id);
							break;
						}
					}
				}
			}
		}
	}, [scrollThreshold, controlledActiveId, sections, containerRef, mode]);

	useEffect(() => {
		const target = containerRef?.current || (mode === "fixed" ? window : null);
		if (!target) return;
		target.addEventListener("scroll", handleScroll, { passive: true });
		handleScroll();
		return () => target.removeEventListener("scroll", handleScroll);
	}, [handleScroll, containerRef, mode]);

	const scrollToSection = (id: string) => {
		setActiveSection(id);
		onSectionClick?.(id);
		if (containerRef && containerRef.current) {
			const target = containerRef.current.querySelector(`#${id}`) as HTMLElement | null;
			if (target) {
				const containerTop = containerRef.current.getBoundingClientRect().top;
				const targetTop = target.getBoundingClientRect().top;
				containerRef.current.scrollBy({
					top: targetTop - containerTop - 20,
					behavior: "smooth",
				});
			}
		} else {
			const target = document.getElementById(id);
			if (target) {
				target.scrollIntoView({ behavior: "smooth", block: "start" });
			}
		}
		setIsExpanded(false);
	};

	const scrollToTop = () => {
		if (containerRef && containerRef.current) {
			containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
		} else {
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	};

	const currentActiveItem = sections.find((s) => s.id === activeSection) || sections[0];

	const wrapperClass =
		mode === "fixed"
			? cn("lm-eui-spnav is-fixed", `is-${position}`, className)
			: cn("lm-eui-spnav", mode === "sticky" ? "is-sticky" : "is-inline", className);

	return (
		<div className={wrapperClass}>
			<motion.nav
				layout
				transition={motionTransitions.springMorph}
				className={cn("lm-eui-spnav-bar", isFloating && "is-floating")}
				role="navigation"
				aria-label="Table of contents"
			>
				{/* Ambient progress line */}
				<div className="lm-eui-spnav-track">
					<div className="lm-eui-spnav-progress" style={{ width: `${scrollProgress}%` }} />
				</div>

				{/* Floating compact indicator (mobile or compact state) */}
				<div className="lm-eui-spnav-compact">
					<span className="lm-eui-spnav-compact-index">{currentActiveItem?.index}</span>
					<span className="lm-eui-spnav-compact-label">{currentActiveItem?.label}</span>
					<button
						type="button"
						onClick={() => setIsExpanded(!isExpanded)}
						className="lm-eui-spnav-toggle"
						aria-label="Toggle section menu"
						aria-expanded={isExpanded}
					>
						<ChevronRight className={cn("lm-eui-icon", isExpanded && "is-open")} />
					</button>
				</div>

				{/* Full navigation buttons (Desktop / Expanded) */}
				<div
					className={cn(
						"lm-eui-spnav-items",
						isExpanded && "is-expanded",
					)}
				>
					{sections.map((section, idx) => {
						const isActive = activeSection === section.id;
						const indexStr = section.index || `0${idx + 1}`;

						return (
							<button
								key={section.id}
								type="button"
								onClick={() => scrollToSection(section.id)}
								aria-current={isActive ? "true" : undefined}
								className={cn("lm-eui-spnav-item", isActive && "is-active")}
							>
								{isActive && (
									<motion.div
										layoutId={`active-scroll-pill-${uniqueId}`}
										transition={motionTransitions.springMorph}
										className="lm-eui-spnav-pill"
									/>
								)}
								<span className="lm-eui-spnav-index">{indexStr}</span>
								<span className="lm-eui-spnav-label">{section.label}</span>
							</button>
						);
					})}
				</div>

				{/* Scroll To Top Action */}
				{isFloating && (
					<button
						type="button"
						onClick={scrollToTop}
						className="lm-eui-spnav-top"
						title="Scroll to top"
						aria-label="Scroll back to top"
					>
						<ArrowUp className="lm-eui-icon" />
					</button>
				)}
			</motion.nav>
		</div>
	);
};
