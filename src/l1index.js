import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { atomicWriteFileSync } from "./atomic-write.js";
import { AUTO_BEGIN, AUTO_END, INDEX_TEMPLATE, migrateIndexPolicy } from "./templates.js";
import { activeEntries, ensureNamespaceLayout, nsRoot, readEntries, readRulePreamble, safeNs, withNsWriteLock } from "./store.js";
import { COLD_EXPLORE_RATIO_DEFAULT } from "./heat.js";

export const L1_MAX_CHARS_DEFAULT = 12288;
export const GLOBAL_L1_MAX_CHARS_DEFAULT = 4096;

function countLines(text) { return String(text ?? "").split("\n").length; }

export function readIndex(root) {
	const path = join(root, "index.txt");
	return existsSync(path) ? migrateIndexPolicy(readFileSync(path, "utf8")) : "";
}
export function indexChars(text) { return text.replace(/\r\n?/g, "\n").trimEnd().length; }
export function sections(text) {
	const begin = text.indexOf(AUTO_BEGIN), end = text.indexOf(AUTO_END);
	if (begin < 0 || end < begin) return { head: "", auto: "", rules: text.trim() };
	return { head: text.slice(0, begin).trim(), auto: text.slice(begin + AUTO_BEGIN.length, end).trim(), rules: text.slice(end + AUTO_END.length).trim() };
}

/**
 * 规则区文本与每条规则正文所占的行区间。
 * readRules 与提示词视图共用同一份排版，索引里的规则块才能被逐条判定。
 */
export function ruleLinesLayout(preamble, bodies) {
	const parts = [{ text: "[RULES]", body: -1 }, { text: preamble, body: -1 }];
	for (let index = 0; index < bodies.length; index++) parts.push({ text: bodies[index], body: index });
	const kept = parts.filter(part => part.text);
	const ranges = [];
	let line = 0;
	for (const part of kept) {
		const lines = countLines(part.text);
		if (part.body >= 0) ranges.push({ index: part.body, start: line, end: line + lines - 1 });
		line += lines;
	}
	return { text: kept.map(part => part.text).join("\n"), ranges };
}
export function readRules(root) {
	if (!existsSync(join(root, "rules.md"))) return sections(readIndex(root)).rules;
	const bodies = readEntries(root).filter(entry => entry.kind === "rule" && !entry.meta.archived).map(entry => entry.content);
	return ruleLinesLayout(readRulePreamble(root), bodies).text;
}

export function indexStats(root, budgetChars = L1_MAX_CHARS_DEFAULT) {
	const text = readIndex(root);
	const { head, auto, rules } = sections(text);
	const autoLines = auto ? auto.split("\n") : [];
	const factsLine = autoLines.find(line => line.startsWith("[L2]")) || "";
	const sopsLine = autoLines.find(line => line.startsWith("[L3]")) || "";
	return {
		indexChars: indexChars(text),
		budgetChars: Math.max(0, Math.floor(budgetChars)),
		headChars: head.length,
		rulesChars: rules.length,
		factsChars: factsLine.length,
		sopsChars: sopsLine.length,
		rulesLines: rules ? rules.split("\n").length : 0,
		ruleCount: activeEntries(root).rules.length,
		factCount: layerNames(auto, "L2").length,
		sopCount: layerNames(auto, "L3").length,
	};
}
export function buildAutoLines(facts, sops) {
	return [`[L2] ${facts.join(" | ") || "（空）"}`, `[L3] ${sops.map(key => `sops/${key}.md`).join(" | ") || "（空）"}`];
}

export function syncIndex(root, maxChars = L1_MAX_CHARS_DEFAULT, entries) {
	return withNsWriteLock(root, () => {
		ensureNamespaceLayout(root);
		const current = readIndex(root);
		const { head } = sections(current || INDEX_TEMPLATE);
		const rules = readRules(root);
		const { facts, sops } = activeEntries(root, entries);
		const rebuilt = [head, AUTO_BEGIN, ...buildAutoLines(facts, sops), AUTO_END, rules].filter(Boolean).join("\n") + "\n";
		const rewritten = current !== rebuilt;
		if (rewritten) atomicWriteFileSync(join(root, "index.txt"), rebuilt);
		const chars = indexChars(rebuilt);
		return { index_chars: chars, max_chars: maxChars, over_limit: chars > maxChars, facts_listed: facts.length, sops_listed: sops.length, rules_listed: activeEntries(root).rules.length, rewritten };
	});
}
function layerNames(auto, layer) {
	return auto.split("\n").filter(line => line.startsWith(`[${layer}]`))
		.flatMap(line => line.slice(4).trim().split(" | ")).filter(name => name && name !== "（空）");
}

function sumCost(lines) {
	return lines.reduce((total, line, index) => total + line.length + (index ? 1 : 0), 0);
}
function viewLayer(lines, cap, label, marker, keepNewest) {
	const full = lines.join("\n");
	if (full.length <= cap) return { text: full, omitted: 0, kept: lines.map((_, index) => index) };
	const source = lines.map((line, index) => ({ line, index }));
	if (keepNewest) source.reverse();
	let kept = []; let keptIndices = []; let used = 0;
	for (const item of source) {
		const cost = item.line.length + (kept.length ? 1 : 0);
		if (used + cost > cap) break;
		kept.push(item.line); keptIndices.push(item.index); used += cost;
	}
	if (keepNewest) { kept = kept.reverse(); keptIndices = keptIndices.reverse(); }
	const draw = () => `${label}${marker(lines.length - kept.length)}`;
	while (kept.length && kept.join("\n").length + 1 + draw().length > cap) {
		if (keepNewest) { kept.shift(); keptIndices.shift(); } else { kept.pop(); keptIndices.pop(); }
	}
	const notice = draw();
	const text = kept.length ? `${notice}\n${kept.join("\n")}` : notice;
	return { text: text.length <= cap ? text : notice.slice(0, cap), omitted: lines.length - kept.length, kept: keptIndices };
}
export const INDEX_TRUNCATION_NOTE = "完整索引与规则用 memory_read 读取；memory_list / memory_search 返回可读 entry。";
// 条目层至少保留下 25% 的 room，规则区因此最多可占 room 的 75%。
export const RULES_MIN_RATIO = 0.25;
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
function orderLayer(lines, kind, rank) {
	if (!rank) return { entries: lines.map((line, index) => ({ line, index, id: idOfLine(kind, line), rank: index })) };
	return lines.map((line, index) => {
		const id = idOfLine(kind, line);
		const value = rank.get(id);
		return { line, index, id, rank: value === undefined ? -Infinity : value };
	}).sort((a, b) => (a.rank === b.rank ? a.index - b.index : a.rank - b.rank));
}
function viewLayerHeat(entries, cap, label, marker, cold, ratio) {
	const full = entries.map(entry => entry.line).join("\n");
	if (full.length <= cap) {
		return { text: full, omitted: 0, coldShown: 0, keptIds: entries.map(entry => entry.id), keptIndices: entries.map(entry => entry.index) };
	}
	const coldIds = cold || new Set();
	const coldPool = entries.filter(entry => coldIds.has(entry.id));
	const hot = entries.filter(entry => !coldIds.has(entry.id));
	const noticeFor = omitted => `${label}${marker(omitted)}`;
	const reserveDigits = String(entries.length).length;
	const noticeCost = noticeFor(entries.length).length + 1;
	const coldBudget = Math.min(Math.floor(cap * ratio), Math.max(0, cap - noticeCost));
	const hotBudget = Math.max(0, cap - noticeCost - coldBudget);
	const kept = []; const keptIds = new Set(); const keptIndices = []; let used = 0;
	const push = entry => {
		if (keptIds.has(entry.id)) return false;
		const cost = entry.line.length + (kept.length ? 1 : 0);
		if (used + cost > cap - noticeCost) return false;
		kept.push(entry); keptIds.add(entry.id); keptIndices.push(entry.index); used += cost; return true;
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
	const notice = () => noticeFor(entries.length - kept.length).length;
	while (kept.length && used + notice() > cap) {
		const dropped = kept.pop();
		keptIndices.pop();
		keptIds.delete(dropped.id);
		used -= dropped.line.length + (kept.length ? 1 : 0);
		if (coldIds.has(dropped.id)) coldShown -= 1;
	}
	const text = kept.length ? `${noticeFor(entries.length - kept.length)}\n${kept.map(entry => entry.line).join("\n")}` : noticeFor(entries.length);
	return { text: text.length <= cap ? text : noticeFor(entries.length).slice(0, cap), omitted: entries.length - kept.length, coldShown, keptIds: [...keptIds], keptIndices };
}

function recallSection(recall, cap) {
	const line = String(recall?.lines || "").trim();
	if (!line) return "";
	const budget = Math.max(0, Math.min(recall.budget ?? 600, Math.floor(cap * 0.12)));
	if (budget < 8) return "";
	return line.length <= budget ? line : line.slice(0, Math.max(0, budget - 1)) + "…";
}

function emptySelection(mode) {
	return { mode, facts: [], sops: [], recall: [], rules: { blob: "", kept: [], lines: {} } };
}
function partStartIndex(parts) {
	const starts = [];
	let line = 0;
	for (const part of parts) { starts.push(line); line += countLines(part.text); }
	return starts;
}

/**
 * 提示词视图。不传 options 时与旧实现逐字节一致；
 * 传 rank / cold / recall 时只在视图层重排与补充，磁盘目录不参与。
 * 同时返回 selection：这次真正进入提示词的条目与它在提示词里的行号。
 */
export function buildPromptIndexView(indexText, maxChars = L1_MAX_CHARS_DEFAULT, namespace = "default", options = {}) {
	const cap = Math.floor(maxChars);
	if (cap < 1) throw new RangeError("L1 prompt budget must be positive");
	const ranked = options.rank instanceof Map, cold = options.cold instanceof Set, recall = options.recall?.lines;
	const selection = emptySelection("none");

	if (!ranked && !cold && !recall && indexText.length <= cap) {
		const { auto, rules } = sections(indexText);
		const facts = layerNames(auto, "L2"), sops = layerNames(auto, "L3");
		const lines = indexText.split("\n");
		const l2 = lines.findIndex(line => line.startsWith("[L2]"));
		const l3 = lines.findIndex(line => line.startsWith("[L3]"));
		for (const key of facts) selection.facts.push({ id: idOfLine("fact", key), line: l2 < 0 ? null : l2 });
		for (const key of sops) selection.sops.push({ id: idOfLine("sop", key), line: l3 < 0 ? null : l3 });
		selection.mode = "full";
		selection.rules = { blob: rules, kept: rules.split("\n").map((_, index) => index), lines: {} };
		return { text: indexText, selection };
	}

	const { head, auto, rules } = sections(indexText);
	const facts = layerNames(auto, "L2"), sops = layerNames(auto, "L3");
	const ruleLines = rules.split("\n");

	if (!ranked && !cold && !recall) {
		const intro = `记忆 [${namespace}]：fact ${facts.length} 条，sop ${sops.length} 条。\n`;
		const note = `\n完整内容：memory_read({entry:{namespace:${JSON.stringify(namespace)},kind:"index",key:"index"},full:true})；规则入口 kind:"rules",key:"rules"）。`;
		if (intro.length + note.length > cap) return { text: `${intro}${INDEX_TRUNCATION_NOTE}`.slice(0, cap), selection };
		const room = cap - intro.length - note.length - 3;
		const ruleNeed = sumCost(ruleLines);
		const ruleRoom = Math.min(ruleNeed, Math.max(0, room - Math.floor(room * RULES_MIN_RATIO)));
		const ruleView = viewLayer(ruleLines, ruleRoom, "", omitted => `（规则过长，省略 ${omitted} 行；${INDEX_TRUNCATION_NOTE}）`, false);
		const entryRoom = Math.max(0, room - (ruleView.text.length ? ruleView.text.length + 1 : 0));
		const factLines = facts.map(key => `[fact] ${key}`);
		const sopLines = sops.map(key => `[sop] ${key.replace(/^sops\//, "").replace(/\.md$/, "")}`);
		const [factRoom, sopRoom] = splitEntryBudget(entryRoom, sumCost(factLines), sumCost(sopLines));
		const factView = viewLayer(factLines, factRoom, "[fact] ", omitted => `（较早的 ${omitted} 条已省略；memory_list 可列举全部）`, true);
		const sopView = viewLayer(sopLines, sopRoom, "[sop] ", omitted => `（较早的 ${omitted} 条已省略；memory_list 可列举全部）`, true);
		const partList = [
			{ kind: "rules", text: ruleView.text },
			{ kind: "facts", text: factView.text, ids: facts.map(key => idOfLine("fact", key)) },
			{ kind: "sops", text: sopView.text, ids: sops.map(key => idOfLine("sop", key)) },
		].filter(part => part.text);
		const parts = partList.map(part => part.text);
		const tail = factView.omitted || sopView.omitted || ruleView.omitted ? `\n本视图受 ${cap} 字符预算限制：省略已写进对应层；${INDEX_TRUNCATION_NOTE}` : note;
		const text = (intro + parts.join("\n") + tail).slice(0, cap);
		selection.mode = "trimmed";
		selection.rules = { blob: rules, kept: ruleView.kept, lines: {} };
		let offset = 1;
		for (const part of partList) {
			if (part.kind === "rules") {
				const noticeOffset = ruleView.kept.length ? 1 : 0;
				ruleView.kept.forEach((blobLine, position) => { selection.rules.lines[blobLine] = offset + noticeOffset + position; });
			} else {
				const noticeOffset = 1;
				const kept = part.kind === "facts" ? factView.kept : sopView.kept;
				kept.forEach((keptIndex, position) => {
					const id = part.ids[keptIndex];
					if (id) selection[part.kind].push({ id, line: offset + noticeOffset + position });
				});
			}
			offset += countLines(part.text);
		}
		return { text, selection };
	}

	const recallIdList = Array.isArray(options.recall?.ids) ? options.recall.ids : [];
	const recallIds = new Set(recallIdList);
	const factEntries = orderLayer(facts, "fact", options.rank).filter(entry => !recallIds.has(entry.id));
	const sopEntries = orderLayer(sops, "sop", options.rank).filter(entry => !recallIds.has(entry.id));
	const l2Line = `[L2] ${factEntries.map(entry => entry.line).join(" | ") || "（空）"}`;
	const l3Line = `[L3] ${sopEntries.map(entry => entry.line).join(" | ") || "（空）"}`;
	const fullParts = [head, AUTO_BEGIN, l2Line, l3Line, AUTO_END, rules].filter(Boolean);
	const full = fullParts.join("\n");
	const recallText = recallSection(options.recall, cap);
	if (full.length + (recallText ? recallText.length + 1 : 0) <= cap) {
		const text = recallText ? full.replace(head, `${head}\n${recallText}`) : full;
		const starts = partStartIndex(fullParts.map(part => ({ text: part })));
		const l2Index = fullParts.indexOf(l2Line), l3Index = fullParts.indexOf(l3Line);
		for (const entry of factEntries) selection.facts.push({ id: entry.id, line: l2Index < 0 ? null : starts[l2Index] });
		for (const entry of sopEntries) selection.sops.push({ id: entry.id, line: l3Index < 0 ? null : starts[l3Index] });
		selection.mode = "full";
		selection.rules = { blob: rules, kept: ruleLines.map((_, index) => index), lines: {} };
		if (recallText) {
			const recallLine = head ? countLines(head) : 0;
			for (const id of recallIdList) selection.recall.push({ id, line: recallLine });
		}
		return { text, selection };
	}
	const intro = `记忆 [${namespace}]：fact ${facts.length} 条，sop ${sops.length} 条。\n`;
	const note = `\n完整内容：memory_read({entry:{namespace:${JSON.stringify(namespace)},kind:"index",key:"index"},full:true})；规则入口 kind:"rules",key:"rules"）。`;
	if (intro.length + note.length > cap) return { text: `${intro}${INDEX_TRUNCATION_NOTE}`.slice(0, cap), selection };
	const recallCost = recallText ? recallText.length + 1 : 0;
	const room = Math.max(0, cap - intro.length - note.length - 3 - recallCost);
	const ruleNeed = sumCost(ruleLines);
	const ruleRoom = Math.min(ruleNeed, Math.max(0, room - Math.floor(room * RULES_MIN_RATIO)));
	const ruleView = viewLayer(ruleLines, ruleRoom, "", omitted => `（规则过长，省略 ${omitted} 行；${INDEX_TRUNCATION_NOTE}）`, false);
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
	const text = (intro + parts.join("\n") + tail).slice(0, cap);
	selection.mode = "trimmed";
	selection.rules = { blob: rules, kept: ruleView.kept, lines: {} };
	let offset = 1;
	for (const part of parts) {
		if (part === ruleView.text) {
			const noticeOffset = ruleView.kept.length ? 1 : 0;
			ruleView.kept.forEach((blobLine, position) => { selection.rules.lines[blobLine] = offset + noticeOffset + position; });
		} else if (part === recallText) {
			for (const id of recallIdList) selection.recall.push({ id, line: offset });
		} else if (part === factView.text) {
			const noticeOffset = factView.keptIds.length ? 1 : 0;
			factView.keptIds.forEach((id, position) => selection.facts.push({ id, line: offset + noticeOffset + position }));
		} else if (part === sopView.text) {
			const noticeOffset = sopView.keptIds.length ? 1 : 0;
			sopView.keptIds.forEach((id, position) => selection.sops.push({ id, line: offset + noticeOffset + position }));
		}
		offset += countLines(part);
	}
	return { text, selection };
}

export function buildPromptIndex(indexText, maxChars = L1_MAX_CHARS_DEFAULT, namespace = "default", options = {}) {
	return buildPromptIndexView(indexText, maxChars, namespace, options).text;
}

export function buildCombinedPromptIndex(memoryDir, namespace, { projectMaxChars = L1_MAX_CHARS_DEFAULT, globalMaxChars = GLOBAL_L1_MAX_CHARS_DEFAULT, forNamespace } = {}) {
	const current = safeNs(namespace);
	const budgets = current === "default" ? [["default", globalMaxChars]] : [["default", globalMaxChars], [current, projectMaxChars]];
	const blocks = budgets.map(([ns, cap]) => {
		const full = readIndex(nsRoot(memoryDir, ns));
		const heading = `记忆空间 [${ns}]\n`;
		const options = typeof forNamespace === "function" ? (forNamespace(ns) || {}) : {};
		const view = full ? buildPromptIndexView(full, cap - heading.length, ns, options) : { text: "", selection: emptySelection("none") };
		const text = full ? heading + view.text : "";
		return { namespace: ns, text, totalChars: full.length, shownChars: text.length, maxChars: cap, overLimit: full.length + heading.length > cap, selection: shiftSelection(view.selection, 1) };
	}).filter(section => section.text);
	return { text: blocks.map(section => section.text).join("\n\n"), sections: blocks };
}

/** 分段文本前面还有一行空间标题，行号要跟着挪。 */
function shiftSelection(selection, offset) {
	if (!selection) return selection;
	const shift = line => (line === null || line === undefined ? line : line + offset);
	return {
		mode: selection.mode,
		facts: selection.facts.map(row => ({ id: row.id, line: shift(row.line) })),
		sops: selection.sops.map(row => ({ id: row.id, line: shift(row.line) })),
		recall: selection.recall.map(row => ({ id: row.id, line: shift(row.line) })),
		rules: {
			blob: selection.rules.blob,
			kept: selection.rules.kept,
			lines: Object.fromEntries(Object.entries(selection.rules.lines).map(([key, line]) => [key, shift(line)])),
		},
	};
}
