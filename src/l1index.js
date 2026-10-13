import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { atomicWriteFileSync } from "./atomic-write.js";
import { AUTO_BEGIN, AUTO_END, INDEX_TEMPLATE, migrateIndexPolicy } from "./templates.js";
import { activeEntries, nsRoot, safeNs, withNsWriteLock } from "./store.js";

export const L1_MAX_CHARS_DEFAULT = 12288;
export const GLOBAL_L1_MAX_CHARS_DEFAULT = 4096;

export function readIndex(root) {
	const path = join(root, "index.txt");
	return existsSync(path) ? migrateIndexPolicy(readFileSync(path, "utf8")) : "";
}
export function indexChars(text) { return text.replace(/\r\n?/g, "\n").trimEnd().length; }
function sections(text) {
	const begin = text.indexOf(AUTO_BEGIN), end = text.indexOf(AUTO_END);
	if (begin < 0 || end < begin) return { head: "", auto: "", rules: text.trim() };
	return { head: text.slice(0, begin).trim(), auto: text.slice(begin + AUTO_BEGIN.length, end).trim(), rules: text.slice(end + AUTO_END.length).trim() };
}
export function readRules(root) { return sections(readIndex(root)).rules; }
export function buildAutoLines(facts, sops) {
	return [`[L2] ${facts.join(" | ") || "（空）"}`, `[L3] ${sops.map(key => `sops/${key}.md`).join(" | ") || "（空）"}`];
}

// Disk keeps the full catalog and rules; only the prompt view is budgeted.
export function syncIndex(root, maxChars = L1_MAX_CHARS_DEFAULT, entries) {
	return withNsWriteLock(root, () => {
		const current = readIndex(root);
		const { head, rules } = sections(current || INDEX_TEMPLATE);
		const { facts, sops } = activeEntries(root, entries);
		const rebuilt = [head, AUTO_BEGIN, ...buildAutoLines(facts, sops), AUTO_END, rules].filter(Boolean).join("\n") + "\n";
		const rewritten = current !== rebuilt;
		if (rewritten) atomicWriteFileSync(join(root, "index.txt"), rebuilt);
		const chars = indexChars(rebuilt);
		return { index_chars: chars, max_chars: maxChars, over_limit: chars > maxChars, facts_listed: facts.length, sops_listed: sops.length, rewritten };
	});
}
function layerNames(auto, layer) {
	return auto.split("\n").filter(line => line.startsWith(`[${layer}]`))
		.flatMap(line => line.slice(4).trim().split(" | ")).filter(name => name && name !== "（空）");
}

// Whole rules and names only: long lines remain available via the full-content ref.
function fitLines(lines, cap) {
	const kept = []; let used = 0;
	for (const line of lines) {
		const cost = line.length + (kept.length ? 1 : 0);
		if (used + cost > cap) break;
		kept.push(line); used += cost;
	}
	return kept.join("\n");
}
export const INDEX_TRUNCATION_NOTE = "完整索引与规则用 memory_read 读取；memory_list / memory_search 返回可读 entry。";
export function buildPromptIndex(indexText, maxChars = L1_MAX_CHARS_DEFAULT, namespace = "default") {
	const cap = Math.floor(maxChars);
	if (cap < 1) throw new RangeError("L1 prompt budget must be positive");
	if (indexText.length <= cap) return indexText;
	const { auto, rules } = sections(indexText);
	const facts = layerNames(auto, "L2"), sops = layerNames(auto, "L3");
	const intro = `记忆 [${namespace}]：fact ${facts.length} 条，sop ${sops.length} 条。\n`;
	const note = `\n完整内容：memory_read({entry:{namespace:${JSON.stringify(namespace)},kind:"index",key:"index"},full:true})；规则入口 kind:"rules",key:"rules"。`;
	if (intro.length + note.length > cap) return `${intro}${INDEX_TRUNCATION_NOTE}`.slice(0, cap);
	const room = cap - intro.length - note.length - 3;
	const ruleView = fitLines(rules.split("\n"), Math.floor(room * 0.4));
	const factView = fitLines(facts.map(key => `[fact] ${key}`), Math.floor(room * 0.3));
	const sopView = fitLines(sops.map(key => `[sop] ${key.replace(/^sops\//, "").replace(/\.md$/, "")}`), Math.floor(room * 0.3));
	return intro + [ruleView, factView, sopView].filter(Boolean).join("\n") + note;
}
export function buildCombinedPromptIndex(memoryDir, namespace, { projectMaxChars = L1_MAX_CHARS_DEFAULT, globalMaxChars = GLOBAL_L1_MAX_CHARS_DEFAULT } = {}) {
	const current = safeNs(namespace);
	const budgets = current === "default" ? [["default", globalMaxChars]] : [["default", globalMaxChars], [current, projectMaxChars]];
	const sections = budgets.map(([ns, cap]) => {
		const full = readIndex(nsRoot(memoryDir, ns));
		const heading = `记忆空间 [${ns}]\n`;
		const text = full ? heading + buildPromptIndex(full, cap - heading.length, ns) : "";
		return { namespace: ns, text, totalChars: full.length, shownChars: text.length, maxChars: cap, overLimit: full.length + heading.length > cap };
	}).filter(section => section.text);
	return { text: sections.map(section => section.text).join("\n\n"), sections };
}
