// Adapted from https://github.com/Surajmaurya1/easyui/blob/main/src/lib/chart-primitives.tsx
// MIT License, Copyright (c) 2026 Suraj Maurya. See ./LICENSE
//
// Adaptation: the shared chart primitives are reused verbatim in behaviour
// (colour ramp, nice-axis step, ResizeObserver width hook, outside-click
// dismissal, spring-follow tooltip). Only the Tailwind class strings were
// replaced with DSH-token classes (`lm-eui-*`), and the `focus`/`ring`/`muted`
// constants now point at those classes instead of Tailwind utilities.

import {
	useEffect,
	useId,
	useLayoutEffect,
	useRef,
	useState,
	type ReactNode,
	type RefObject,
} from "react";
import { motion, useSpring } from "framer-motion";

export const CHART_COLORS = ["#6d7cff", "#34d1bf", "#ffb44c", "#ff6b8b", "#a78bfa", "#5ac8fa"];

export const EASE_OUT = [0.23, 1, 0.32, 1] as const;
export const SPRING = { type: "spring", duration: 0.5, bounce: 0 } as const;

export const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
export const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(" ");

const compactFmt = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
export const fullFmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
export const defaultFormat = (n: number) => fullFmt.format(n);
export const defaultTick = (n: number) => compactFmt.format(n);

export const ring = "lm-eui-ring";
export const muted = "lm-eui-muted";
export const focus = "lm-eui-focus";

// "Nice" step so that step × 4 covers `raw × 4`
export function niceStep(raw: number) {
	if (!(raw > 0) || !isFinite(raw)) return 1;
	const exp = Math.floor(Math.log10(raw));
	const base = raw / 10 ** exp;
	const nice = base <= 1 ? 1 : base <= 2 ? 2 : base <= 2.5 ? 2.5 : base <= 5 ? 5 : 10;
	return nice * 10 ** exp;
}

/** Container width via ResizeObserver (initial value keeps SSR output sensible) */
export function useElementWidth<T extends HTMLElement>(initial: number) {
	const ref = useRef<T>(null);
	const [width, setWidth] = useState(initial);
	useLayoutEffect(() => {
		const el = ref.current;
		if (!el) return;
		const update = () => setWidth(Math.round(el.clientWidth) || initial);
		update();
		const ro = new ResizeObserver(update);
		ro.observe(el);
		return () => ro.disconnect();
	}, [initial]);
	return [ref, width] as const;
}

/** Clear a hover/tap selection when the user taps outside the chart (touch) */
export function useDismissOutside(ref: RefObject<HTMLElement | null>, open: boolean, close: () => void) {
	useEffect(() => {
		if (!open) return;
		const down = (e: PointerEvent) => {
			if (!ref.current?.contains(e.target as Node)) close();
		};
		document.addEventListener("pointerdown", down);
		return () => document.removeEventListener("pointerdown", down);
	}, [ref, open, close]);
}

/* ---------------------------------- Tooltip -------------------------------- */

export function Tooltip({
	pos,
	boundsWidth,
	children,
}: {
	pos: { x: number; y: number } | null;
	boundsWidth: number;
	children: ReactNode;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const seen = useRef(false);
	const x = useSpring(0, { stiffness: 520, damping: 42, mass: 0.6 });
	const y = useSpring(0, { stiffness: 520, damping: 42, mass: 0.6 });

	useLayoutEffect(() => {
		if (!pos) {
			seen.current = false;
			return;
		}
		const w = ref.current?.offsetWidth ?? 130;
		const h = ref.current?.offsetHeight ?? 60;
		const tx = clamp(pos.x - w / 2, 0, Math.max(0, boundsWidth - w));
		let ty = pos.y - h - 12;
		if (ty < 0) ty = pos.y + 18;
		if (!seen.current) {
			x.jump(tx);
			y.jump(ty);
			seen.current = true;
		} else {
			x.set(tx);
			y.set(ty);
		}
	}, [pos, boundsWidth, x, y]);

	return (
		<motion.div
			ref={ref}
			aria-hidden
			className="lm-eui-tooltip"
			style={{ x, y }}
			initial={false}
			animate={{ opacity: pos ? 1 : 0 }}
			transition={{ duration: 0.14, ease: EASE_OUT }}
		>
			{children}
		</motion.div>
	);
}

export function Dot({ color }: { color: string }) {
	return <span className="lm-eui-dot" style={{ background: color }} aria-hidden />;
}

/* ---------------------------------- Card ----------------------------------- */

export function ChartCard({
	title,
	description,
	actions,
	children,
	className = "",
}: {
	title: string;
	description?: string;
	actions?: ReactNode;
	children: ReactNode;
	className?: string;
}) {
	return (
		<section className={cx("lm-eui-card", className)}>
			<header className="lm-eui-card-head">
				<div className="lm-eui-card-headings">
					<h3 className="lm-eui-card-title">{title}</h3>
					{description && <p className="lm-eui-card-desc">{description}</p>}
				</div>
				{actions}
			</header>
			{children}
		</section>
	);
}

export function SegmentedControl<T extends string>({
	value,
	onChange,
	options,
	label,
}: {
	value: T;
	onChange: (v: T) => void;
	options: { value: T; label: string }[];
	label: string;
}) {
	const id = useId();
	return (
		<div role="radiogroup" aria-label={label} className="lm-eui-segmented">
			{options.map((o) => {
				const on = o.value === value;
				return (
					<button
						key={o.value}
						type="button"
						role="radio"
						aria-checked={on}
						onClick={() => onChange(o.value)}
						className={cx("lm-eui-segmented-item", on && "is-on")}
					>
						{on && (
							<motion.span
								layoutId={id}
								className="lm-eui-segmented-thumb"
								transition={{ type: "spring", duration: 0.3, bounce: 0.15 }}
							/>
						)}
						{o.label}
					</button>
				);
			})}
		</div>
	);
}
