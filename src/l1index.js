import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { atomicWriteFileSync } from "./atomic-write.js";
import { AUTO_BEGIN, AUTO_END, INDEX_TEMPLATE, migrateIndexPolicy } from "./templates.js";
import { activeEntries, nsRoot, safeNs, withNsWriteLock } from "./store.js";
import { COLD_EXPLORE_RATIO_DEFAULT } from "./heat.js";

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

function idOfLine(kind, line) {
	const name = kind === "sop" ? line.replace(/^sops\//, "").replace(/\.md$/, "") : line;
	return kind + ":" + name;
}
// 按热度序号排序；rank 里没有的 id 视为新条目，置顶。
function orderLayer(lines, kind, rank) {
	if (!rank) return { entries: lines.map((line, index) => ({ line, index, id: idOfLine(kind, line), rank: index })) };
	return lines.map((line, index) => {
		const id = idOfLine(kind, line);
		const value = rank.get(id);
		return { line, index, id, rank: value === undefined ? -Infinity : value };
	}).sort((a, b) => (a.rank === b.rank ? a.index - b.index : a.rank - b.rank));
}
/**
 * 热度视图的整层裁剪：热条目按序号优先，冷探索位预留一部分预算单独补进来，
 * 保证低热度条目轮换曝光而不是永久隐身。输出顺序仍是热 → 冷。
 */
function viewLayerHeat(entries, cap, label, marker, cold, ratio) {
	const full = entries.map(entry => entry.line).join("\n");
	if (full.length <= cap) return { text: full, omitted: 0, coldShown: 0 };
	const coldIds = cold || new Set();
	const coldPool = entries.filter(entry => coldIds.has(entry.id));
	const hot = entries.filter(entry => !coldIds.has(entry.id));
	const noticeFor = omitted => `${label}${marker(omitted)}`;
	const reserveDigits = String(entries.length).length;
	const noticeCost = noticeFor(entries.length).length + 1;
	const coldBudget = Math.min(Math.floor(cap * ratio), Math.max(0, cap - noticeCost));
	const hotBudget = Math.max(0, cap - noticeCost - coldBudget);
	const kept = []; const keptIds = new Set(); let used = 0;
	const push = entry => {
		if (keptIds.has(entry.id)) return false;
		const cost = entry.line.length + (kept.length ? 1 : 0);
		if (used + cost > cap - noticeCost) return false;
		kept.push(entry); keptIds.add(entry.id); used += cost; return true;
	};
	let hotUsed = 0;
	for (const entry of hot) {
		const cost = entry.line.length + (kept.length ? 1 : 0);
		if (hotUsed + cost > hotBudget) continue;
		if (push(entry)) hotUsed += cost;
	}
	let coldShown = 0;
	for (const entry of coldPool) if (push(entry)) coldShown += 1;
	for (const entry of hot) push(entry);
	// 说明行放不下时从尾部丢条目，直到能放下。
	const notice = () => noticeFor(entries.length - kept.length).length;
	while (kept.length && used + notice() > cap) {
		const dropped = kept.pop();
		used -= dropped.line.length + (kept.length ? 1 : 0);
		if (coldIds.has(dropped.id)) coldShown -= 1;
	}
	const text = kept.length ? `${noticeFor(entries.length - kept.length)}\n${kept.map(entry => entry.line).join("\n")}` : noticeFor(entries.length);
	return { text: text.length <= cap ? text : noticeFor(entries.length).slice(0, cap), omitted: entries.length - kept.length, coldShown };
}

function recallSection(recall, cap) {
	const line = String(recall?.lines || "").trim();
	if (!line) return "";
	const budget = Math.max(0, Math.min(recall.budget ?? 600, Math.floor(cap * 0.12)));
	if (budget < 8) return "";
	return line.length <= budget ? line : line.slice(0, Math.max(0, budget - 1)) + "…";
}

/**
 * 提示词视图。不传 options 时与旧实现逐字节一致；
 * 传 rank / cold / recall 时只在视图层重排与补充，磁盘目录不参与。
 */
export function buildPromptIndex(indexText, maxChars = L1_MAX_CHARS_DEFAULT, namespace = "default", options = {}) {
	const cap = Math.floor(maxChars);
	if (cap < 1) throw new RangeError("L1 prompt budget must be positive");
	const ranked = options.rank instanceof Map, cold = options.cold instanceof Set, recall = options.recall?.lines;
	if (!ranked && !cold && !recall) {
		if (indexText.length <= cap) return indexText;
	}
	const { head, auto, rules } = sections(indexText);
	const facts = layerNames(auto, "L2"), sops = layerNames(auto, "L3");
	if (!ranked && !cold && !recall) {
		// 兼容路径：保持旧版逐字节行为。
		const intro = `记忆 [${namespace}]：fact ${facts.length} 条，sop ${sops.length} 条。\n`;
		const note = `\n完整内容：memory_read({entry:{namespace:${JSON.stringify(namespace)},kind:"index",key:"index"},full:true})；规则入口 kind:"rules",key:"rules"）。`;
		if (intro.length + note.length > cap) return `${intro}${INDEX_TRUNCATION_NOTE}`.slice(0, cap);
		const room = cap - intro.length - note.length - 3;
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

	// 热度路径：重建 AUTO 段（head 与 rules 原样保留），条目按热度排序。
	const recallIds = new Set(Array.isArray(options.recall?.ids) ? options.recall.ids : []);
	const factEntries = orderLayer(facts, "fact", options.rank).filter(entry => !recallIds.has(entry.id));
	const sopEntries = orderLayer(sops, "sop", options.rank).filter(entry => !recallIds.has(entry.id));
	const full = [head, AUTO_BEGIN, `[L2] ${factEntries.map(entry => entry.line).join(" | ") || "（空）"}`,
		`[L3] ${sopEntries.map(entry => entry.line).join(" | ") || "（空）"}`, AUTO_END, rules].filter(Boolean).join("\n");
	const recallText = recallSection(options.recall, cap);
	if (full.length + (recallText ? recallText.length + 1 : 0) <= cap) {
		return recallText ? full.replace(head, `${head}\n${recallText}`) : full;
	}
	// 预算不够：规则优先 + 召回 + 两层分预算，冷条目走探索位。
	const intro = `记忆 [${namespace}]：fact ${facts.length} 条，sop ${sops.length} 条。\n`;
	const note = `\n完整内容：memory_read({entry:{namespace:${JSON.stringify(namespace)},kind:"index",key:"index"},full:true})；规则入口 kind:"rules",key:"rules"）。`;
	if (intro.length + note.length > cap) return `${intro}${INDEX_TRUNCATION_NOTE}`.slice(0, cap);
	const recallCost = recallText ? recallText.length + 1 : 0;
	const room = Math.max(0, cap - intro.length - note.length - 3 - recallCost);
	const ruleNeed = sumCost(rules.split("\n"));
	const ruleRoom = Math.min(ruleNeed, Math.max(0, room - Math.floor(room * RULES_MIN_RATIO)));
	const ruleView = viewLayer(rules.split("\n"), ruleRoom, "", omitted => `（规则过长，省略 ${omitted} 行；${INDEX_TRUNCATION_NOTE}）`, false);
	const entryRoom = Math.max(0, room - (ruleView.text.length ? ruleView.text.length + 1 : 0));
	const factLines = factEntries.map(entry => ({ ...entry, line: `[fact] ${entry.line}` }));
	const sopLines = sopEntries.map(entry => ({ ...entry, line: `[sop] ${entry.line.replace(/^sops\//, "").replace(/\.md$/, "")}` }));
	const [factRoom, sopRoom] = splitEntryBudget(entryRoom, sumCost(factLines.map(entry => entry.line)), sumCost(sopLines.map(entry => entry.line)));
	const ratio = options.coldRatio ?? COLD_EXPLORE_RATIO_DEFAULT;
	const factView = viewLayerHeat(factLines, factRoom, "[fact] ", omitted => `（较早的 ${omitted} 条已省略；memory_list 可列举全部）`, options.cold, ratio);
	const sopView = viewLayerHeat(sopLines, sopRoom, "[sop] ", omitted => `（较早的 ${omitted} 条已省略；memory_list 可列举全部）`, options.cold, ratio);
	const parts = [ruleView.text, recallText, factView.text, sopView.text].filter(Boolean);
	const omitted = factView.omitted || sopView.omitted || ruleView.omitted;
	const tail = omitted ? `\n本视图受 ${cap} 字符预算限制：省略已写进对应层；${INDEX_TRUNCATION_NOTE}` : note;
	return (intro + parts.join("\n") + tail).slice(0, cap);
}
export function buildCombinedPromptIndex(memoryDir, namespace, { projectMaxChars = L1_MAX_CHARS_DEFAULT, globalMaxChars = GLOBAL_L1_MAX_CHARS_DEFAULT, forNamespace } = {}) {
	const current = safeNs(namespace);
	const budgets = current === "default" ? [["default", globalMaxChars]] : [["default", globalMaxChars], [current, projectMaxChars]];
	const sections = budgets.map(([ns, cap]) => {
		const full = readIndex(nsRoot(memoryDir, ns));
		const heading = `记忆空间 [${ns}]\n`;
		const options = typeof forNamespace === "function" ? (forNamespace(ns) || {}) : {};
		const text = full ? heading + buildPromptIndex(full, cap - heading.length, ns, options) : "";
		return { namespace: ns, text, totalChars: full.length, shownChars: text.length, maxChars: cap, overLimit: full.length + heading.length > cap };
	}).filter(section => section.text);
	return { text: sections.map(section => section.text).join("\n\n"), sections };
}
