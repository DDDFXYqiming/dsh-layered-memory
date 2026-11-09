// Adapted from https://github.com/Surajmaurya1/easyui/blob/main/src/lib/motion-tokens.ts
// MIT License, Copyright (c) 2026 Suraj Maurya. See ./LICENSE
//
// Adaptation: unchanged from upstream except for the source banner. The spring
// tuning is the upstream EasyUI design token set and is reused verbatim so the
// vendored components keep the motion character they were designed with.

import type { Transition } from "framer-motion";

export const motionTransitions = {
	// Gentle fluid transitions (for tabs, smooth accordion, dialog fades)
	// ~400ms to settle, near-critical damping — no overshoot, no oscillation.
	springGentle: {
		type: "spring",
		stiffness: 170,
		damping: 26,
		mass: 0.9,
	} as Transition,

	// Smooth standard motion
	// Slightly underdamped (~0.85) for the slightest organic feel on cards.
	springSmooth: {
		type: "spring",
		stiffness: 200,
		damping: 28,
		mass: 0.85,
	} as Transition,

	// Snappy responsive feedback (for buttons, hover indicators, dock icons)
	// High stiffness, low mass — settles in ~200ms with a subtle settle.
	springSnappy: {
		type: "spring",
		stiffness: 380,
		damping: 30,
		mass: 0.5,
	} as Transition,

	// Morphing shared layout (for layoutId dialogs, expanding search, tabs background)
	// Tuned to feel continuous — long settle, no overshoot, like a fluid surface.
	springMorph: {
		type: "spring",
		stiffness: 220,
		damping: 32,
		mass: 1.0,
	} as Transition,

	// Responsive bounce physics (for magnetic pull return, toasts stack)
	// Slightly underdamped for that tiny satisfying overshoot.
	springResponsive: {
		type: "spring",
		stiffness: 320,
		damping: 24,
		mass: 0.7,
	} as Transition,

	// Soft spring for natural-feeling follow / smoothing
	// (used as a default in useSpring when the caller didn't specify)
	springSoft: {
		type: "spring",
		stiffness: 150,
		damping: 22,
		mass: 0.9,
	} as Transition,

	// Subtle ease for standard property transitions (color, opacity)
	// Custom cubic-bezier similar to Apple's "emphasized" curve.
	easeSoft: {
		duration: 0.32,
		ease: [0.22, 1, 0.36, 1],
	} as Transition,

	// Snappy ease for fast property transitions
	easeFast: {
		duration: 0.2,
		ease: [0.2, 0, 0, 1],
	} as Transition,
};
