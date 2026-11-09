// Adapted from https://github.com/Surajmaurya1/easyui/blob/main/src/lib/utils.ts
// MIT License, Copyright (c) 2026 Suraj Maurya. See ./LICENSE
//
// Adaptation: upstream `cn` relies on clsx + tailwind-merge, which only make
// sense with Tailwind utility classes. This plugin renders DSH-token classes
// instead, so the class joiner is reduced to a plain truthy filter and the
// two Tailwind-only dependencies are dropped. Behaviour of the exported
// helpers is unchanged.

export type ClassValue = string | false | null | undefined;

export function cn(...inputs: ClassValue[]): string {
	return inputs.filter(Boolean).join(" ");
}

export function copyToClipboard(text: string): Promise<boolean> {
	if (navigator.clipboard && window.isSecureContext) {
		return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
	}
	const textArea = document.createElement("textarea");
	textArea.value = text;
	textArea.style.position = "fixed";
	textArea.style.left = "-999999px";
	textArea.style.top = "-999999px";
	document.body.appendChild(textArea);
	textArea.focus();
	textArea.select();
	return new Promise((resolve) => {
		const successful = document.execCommand("copy");
		textArea.remove();
		resolve(successful);
	});
}

export function scrollToTop(behavior: ScrollBehavior = "instant") {
	if (typeof window === "undefined") return;
	window.scrollTo({ top: 0, left: 0, behavior });
	document.documentElement.scrollTop = 0;
	document.body.scrollTop = 0;
}
