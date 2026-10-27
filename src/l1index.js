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

// 每行加入视图的字符代价（含与前一行之间的换行）。
function sumCost(lines) {
	return lines.reduce((total, line, index) => total + line.length + (index ? 1 : 0), 0);
}
// 预算够就整层给出；不够就按方向取舍：rules 保最早的（红线在前），
// 条目保最新的（写入顺序里新的在尾部，旧条目被省略比新记忆隐身好），
// 省略时腾出一行说明省略条数与完整目录的读取入口。
function viewLayer(lines, cap, label, marker, keepNewest) {
	const full = lines.join("\n");
	if (full.length <= cap) return { text: full, omitted: 0 };
	const source = keepNewest ? [...lines].reverse() : lines;
	let kept = []; let used = 0;
	for (const line of source) {
		const cost = line.length + (kept.length ? 1 : 0);
		if (used + cost > cap) break;
		kept.push(line); used += cost;
	}
	if (keepNewest) kept = kept.reverse();
	const draw = () => `${label}${marker(lines.length - kept.length)}`;
	// 说明行自己也要占预算：腾不出空间时继续丢条目，直到说明行能放下。
	while (kept.length && kept.join("\n").length + 1 + draw().length > cap) {
		if (keepNewest) kept.shift(); else kept.pop();
	}
	const notice = draw();
	const text = kept.length ? `${notice}\n${kept.join("\n")}` : notice;
	return { text: text.length <= cap ? text : notice.slice(0, cap), omitted: lines.length - kept.length };
}
export const INDEX_TRUNCATION_NOTE = "完整索引与规则用 memory_read 读取；memory_list / memory_search 返回可读 entry。";
// 规则是红线，先按需保底；条目层（fact / sop）分剩余预算：
// 先按各自真实需要等比分担，再让需要少的层把富余让给另一层（避免固定比例饿死某一层）。
const RULES_MIN_RATIO = 0.25;
function splitEntryBudget(room, factsNeed, sopsNeed) {
	const total = factsNeed + sopsNeed;
	if (total <= room) return [factsNeed, sopsNeed];
	const factShare = Math.floor(room * (factsNeed / total));
	return [Math.min(factShare, factsNeed), Math.min(room - Math.min(factShare, factsNeed), sopsNeed)];
}
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
	// 规则优先：按真实需要给足，只保证条目层至少留下四分之一的预算，免得红线挤掉发现入口。
	const ruleNeed = sumCost(rules.split("\n"));
	const ruleRoom = Math.min(ruleNeed, Math.max(0, room - Math.floor(room * RULES_MIN_RATIO)));
	const ruleView = viewLayer(rules.split("\n"), ruleRoom, "", omitted => `（规则过长，省略 ${omitted} 行；${INDEX_TRUNCATION_NOTE}）`, false);
	const entryRoom = Math.max(0, room - (ruleView.text.length ? ruleView.text.length + 1 : 0));
	const factLines = facts.map(key => `[fact] ${key}`);
	const sopLines = sops.map(key => `[sop] ${key.replace(/^sops\//, "").replace(/\.md$/, "")}`);
	const [factRoom, sopRoom] = splitEntryBudget(entryRoom, sumCost(factLines), sumCost(sopLines));
	const factView = viewLayer(factLines, factRoom, "[fact] ", omitted => `（较早的 ${omitted} 条已省略；memory_list 可列举全部）`, true);
	const sopView = viewLayer(sopLines, sopRoom, "[sop] ", omitted => `（较早的 ${omitted} 条已省略；memory_list 可列举全部）`, true);
	const parts = [ruleView.text, factView.text, sopView.text].filter(Boolean);
	const tail = factView.omitted || sopView.omitted || ruleView.omitted ? `\n本视图受 ${cap} 字符预算限制：省略已写进对应层；${INDEX_TRUNCATION_NOTE}` : note;
	return (intro + parts.join("\n") + tail).slice(0, cap);
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
