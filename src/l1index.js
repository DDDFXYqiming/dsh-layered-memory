// L1 索引：读取 / 重建。
// [0.6.1 N6] L1 字符预算唯一默认值（原以 12288 字面量散落 4 处：apply Config /
// runMaintain / syncIndex / writeMemory 形参）。改默认只动这一处。
export const L1_MAX_CHARS_DEFAULT = 12288;

// [v0.6] 存在性优先：AUTO 段全量列出 L2/L3 名字（每层一行、" | " 打包），
// 不再按热度裁剪隐藏条目——被裁掉的条目等于永久隐身（模型不会想到去搜不存在的东西）。
// 预算单位从"行数"改为"字符数"，与注入熔断 l1MaxChars 同源，杜绝"行数合规而 token 失控"。
// 另外：内容未变则不重写文件，避免无意义的前缀抖动（system prompt 缓存稳定性）。

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { atomicWriteFileSync } from "./atomic-write.js";
import { AUTO_BEGIN, AUTO_END, INDEX_TEMPLATE, migrateIndexPolicy } from "./templates.js";
import { activeEntries } from "./store.js";

export function readIndex(root) {
	try {
		return migrateIndexPolicy(readFileSync(join(root, "index.txt"), "utf8"));
	} catch {
		return "";
	}
}

/** 索引字符数（统一换行、去尾部空白后计数）。 */
export function indexChars(text) {
	const s = String(text ?? "").replace(/\r\n?/g, "\n").replace(/\n+$/, "");
	return s.length;
}

/** 规范化索引布局空白：保留手动内容，只消除会挤占预算的多余空行。 */
function normalizeIndexWhitespace(text) {
	return String(text ?? "")
		.replace(/\r\n?/g, "\n")
		.replace(/[ \t]+\n/g, "\n")
		.replace(/\n{3,}/g, "\n\n")
		.replace(/^\n+|\n+$/g, "");
}

/** 读取 AUTO 标记之外的头部与手动尾部（[RULES] 段），并规范化空白。 */
function readIndexSections(root) {
	const templateBegin = INDEX_TEMPLATE.indexOf(AUTO_BEGIN);
	const templateEnd = INDEX_TEMPLATE.indexOf(AUTO_END);
	let head = INDEX_TEMPLATE.slice(0, templateBegin);
	let tail = INDEX_TEMPLATE.slice(templateEnd + AUTO_END.length);
	try {
		const cur = migrateIndexPolicy(readFileSync(join(root, "index.txt"), "utf8"));
		const b = cur.indexOf(AUTO_BEGIN);
		const e = cur.indexOf(AUTO_END);
		if (b >= 0 && e > b) {
			head = cur.slice(0, b);
			tail = cur.slice(e + AUTO_END.length);
		} else if (cur.trim()) {
			head = cur;
			tail = "";
		}
	} catch { /* 用模板 */ }
	return {
		head: normalizeIndexWhitespace(head),
		tail: normalizeIndexWhitespace(tail),
	};
}

/** AUTO 段：两层各一行，全量名字 pipe 打包（存在性不可丢）。 */
export function buildAutoLines(facts, sops) {
	const l2 = facts.length ? `[L2] ${facts.join(" | ")}` : "[L2] （空）";
	const l3 = sops.length ? `[L3] ${sops.map((s) => `sops/${s}.md`).join(" | ")}` : "[L3] （空）";
	return [l2, l3];
}

function composeIndex(head, autoLines, tail) {
	const parts = [head, AUTO_BEGIN, autoLines.join("\n"), AUTO_END];
	if (tail) parts.push(tail);
	return parts.join("\n") + "\n";
}

/**
 * 重建 index.txt 的 AUTO 段（活跃 L2 + L3 全量），保留并清理 [RULES] 手动段。
 * @param root 命名空间根
 * @param maxChars L1 字符预算（cfg.l1MaxChars）
 * @returns {{index_chars:number, max_chars:number, over_limit:boolean, facts_listed:number, sops_listed:number, rewritten:boolean}}
 */
export function syncIndex(root, maxChars = L1_MAX_CHARS_DEFAULT) {
	const { head, tail } = readIndexSections(root);
	const { facts, sops } = activeEntries(root);
	const rebuilt = composeIndex(head, buildAutoLines(facts, sops), tail);
	const current = existsSync(join(root, "index.txt")) ? readFileSync(join(root, "index.txt"), "utf8") : null;
	let rewritten = false;
	if (current !== rebuilt) {
		// 只在内容真的变化时写盘。直接收益是避免 maintenance 自激与 revision 抖动：
		// computeContentRevision 含 size+mtime，无变化重写会让同内容反复"变更"、
		// 反思/维护轮询不停被重新触发；顺带保持文件稳定、少一次 I/O。
		// （API 前缀缓存按实际请求内容前缀匹配，与本机文件 mtime 无关。）
		atomicWriteFileSync(join(root, "index.txt"), rebuilt);
		rewritten = true;
	}
	const chars = indexChars(rebuilt);
	return {
		index_chars: chars,
		max_chars: maxChars,
		over_limit: chars > maxChars,
		facts_listed: facts.length,
		sops_listed: sops.length,
		rewritten,
	};
}

// ── [0.6.8] 注入视图：结构化预算 ──
// 磁盘 index.txt 保持全量（存在性不可丢），注入模型时按结构分配预算：
// 规则段（AUTO_END 之后，含 [RULES]）与头部完整保留；条目段超预算时按分类入口折叠，
// 并给出显式压缩标注。旧实现是前缀截断——先丢的正是尾部 [RULES]，且不给任何提示。

/** 注入视图被压缩时的显式标注（合成表达，不是静默截断）。 */
export const INDEX_TRUNCATION_NOTE = "[memory:index 注入视图已压缩：规则段完整保留，条目按分类入口折叠；完整索引见 index.txt，用 memory_list / memory_search 取全量]";

/**
 * 条目分组键：ASCII 首词（长度 ≥3）或中文前 2 字；取不到返回 null（视为独立条目）。
 * 只依赖名字本身，不引入热度/时间——折叠不等于按热度隐藏低频记忆。
 */
export function entryGroupKey(name) {
	const s = String(name ?? "");
	const ascii = s.match(/^[A-Za-z0-9][A-Za-z0-9._+-]*/);
	if (ascii) {
		const first = ascii[0].split(/[._+-]+/).find((p) => p.length >= 3);
		if (first) return first.toLowerCase();
	}
	const cjk = s.match(/^[\u4e00-\u9fff]{2,}/);
	if (cjk) return cjk[0].slice(0, 2);
	return null;
}

/** 条目名规范化：剥掉 L3 的 sops/ 前缀与 .md 后缀，只用于推导分组键。 */
function normalizeEntryName(name) {
	return String(name ?? "").replace(/^sops\//, "").replace(/\.md$/, "");
}

/** 把一组条目名压成入口摘要，例如 "dsh(12) | qwen(6) | cua-driver(4)"，并按 limit 裁剪。 */
function fitSummary(names, limit) {
	const groups = new Map();
	for (const n of names) {
		const bare = normalizeEntryName(n);
		const key = entryGroupKey(bare) ?? bare;
		groups.set(key, (groups.get(key) ?? 0) + 1);
	}
	const parts = [...groups.entries()].map(([k, c]) => (c > 1 ? `${k}(${c})` : k));
	const room = Math.max(4, limit);
	const kept = [];
	let len = 0;
	for (const p of parts) {
		const add = (kept.length ? 3 : 0) + p.length;
		// 还有后续条目时预留 " | …" 的位置
		const reserve = parts.length > kept.length + 1 ? 4 : 0;
		if (len + add + reserve > room) break;
		kept.push(p);
		len += add;
	}
	if (!kept.length) return parts.length ? `${parts.length} 组入口` : "";
	return kept.length < parts.length ? `${kept.join(" | ")} | …` : kept.join(" | ");
}

function parseAutoLine(line) {
	const m = line.match(/^(\[[^\]]+\])\s*(.*)$/);
	if (!m) return null;
	const raw = m[2].trim();
	const names = raw && raw !== "（空）" ? raw.split(" | ").filter(Boolean) : [];
	return { prefix: m[1], names };
}

/**
 * [0.6.9] 每层最小保底行：层前缀 + 总条数。预算再紧也不让整层消失——
 * 保证"模型还能发现这一层存在"比塞满几个具体条目更重要（此前按序消费预算，
 * 后面的层会被整行省略：1024 字符预算下 37 条 facts 挤掉整个 L3 入口）。
 */
function minLayerLine(parsed) {
	return `${parsed.prefix} 共 ${parsed.names.length} 条`;
}

/**
 * 渲染 AUTO 段（每层保底 + 剩余预算展开）：
 * 1) 先为每个非空层保留"前缀 + 总条数"的最小入口行；
 * 2) 剩余预算按层顺序把入口升级为逐条名字 + 分类聚合，且不侵占后面层的保底；
 * 3) 保底都放不下的极端情况：按行填充到预算并显式标注省略。
 */
function renderAutoSection(autoText, budget) {
	const rows = autoText.split("\n").filter((l) => l.trim()).map((line) => ({ line, parsed: parseAutoLine(line) }));
	const minOf = (r) => (r.parsed && r.parsed.names.length ? minLayerLine(r.parsed) : r.line);
	const minTotal = rows.reduce((s, r) => s + minOf(r).length + 1, 0);
	if (minTotal > budget) {
		const out = [];
		let used = 0;
		for (const r of rows) {
			const m = minOf(r);
			if (used + m.length + 1 > budget) { out.push("…（预算不足，后续层省略）"); break; }
			out.push(m);
			used += m.length + 1;
		}
		return out.join("\n");
	}
	const out = [];
	let used = 0;
	for (let i = 0; i < rows.length; i++) {
		const { line, parsed } = rows[i];
		const restMin = rows.slice(i + 1).reduce((s, r) => s + minOf(r).length + 1, 0);
		const room = budget - used - restMin; // 本层可用：为后面层留保底
		if (!parsed || parsed.names.length === 0) {
			const m = line;
			out.push(m);
			used += m.length + 1;
			continue;
		}
		if (line.length + 1 <= room) { out.push(line); used += line.length + 1; continue; }
		const min = minOf(rows[i]);
		let rendered = min;
		if (room > min.length + 8) {
			// 给"其余按入口聚合"预留空间：否则逐条会把预算吃光，折叠信息反而丢失
			const reserve = Math.min(200, Math.max(60, Math.floor(room * 0.3)));
			const kept = [];
			let len = parsed.prefix.length + 1;
			for (const name of parsed.names) {
				const add = (kept.length ? 3 : 0) + name.length;
				if (len + add + reserve > room) break;
				kept.push(name);
				len += add;
			}
			const rest = parsed.names.slice(kept.length);
			if (kept.length) {
				rendered = `${parsed.prefix} ${kept.join(" | ")}`;
				if (rest.length) {
					const summary = fitSummary(rest, Math.max(24, room - rendered.length - 14));
					rendered += ` | … 其余 ${rest.length} 条按入口聚合：${summary}`;
				}
			} else {
				rendered = `${min} · 入口：${fitSummary(parsed.names, Math.max(12, room - min.length - 8))}`;
			}
			if (rendered.length + 1 > room) rendered = min;
		}
		out.push(rendered);
		used += rendered.length + 1;
	}
	return out.join("\n");
}

/** 极端情况：连逐条列出的预算都没有时，每层只留入口摘要。 */
function summarizeAutoSection(autoText, limit = 200) {
	return autoText
		.split("\n")
		.filter((l) => l.trim())
		.map((line) => {
			const parsed = parseAutoLine(line);
			if (!parsed || parsed.names.length === 0) return line;
			return `${parsed.prefix} 共 ${parsed.names.length} 条 · 入口：${fitSummary(parsed.names, limit)}`;
		})
		.join("\n");
}

/**
 * 注入视图（纯函数）。未超预算时原样返回；超预算时头部与规则段完整保留，
 * 条目段按分类入口折叠，并在末尾给出显式压缩标注。
 * @param indexText index.txt 内容
 * @param maxChars 注入预算（cfg.l1MaxChars）
 */
export function buildPromptIndex(indexText, maxChars) {
	const text = String(indexText ?? "");
	const cap = Math.max(1, Number(maxChars) || L1_MAX_CHARS_DEFAULT);
	if (text.length <= cap) return text;
	const b = text.indexOf(AUTO_BEGIN);
	const e = text.indexOf(AUTO_END);
	if (b < 0 || e < b) {
		// 非标准结构（缺 AUTO 标记）：尾部优先完整保留，头部按剩余预算熔断。
		const reserve = INDEX_TRUNCATION_NOTE.length + 2;
		const keepTail = text.slice(-Math.max(1, cap - reserve));
		const headBudget = Math.max(0, cap - reserve - keepTail.length);
		return `${text.slice(0, headBudget)}\n${keepTail}\n${INDEX_TRUNCATION_NOTE}`;
	}
	const head = text.slice(0, b + AUTO_BEGIN.length);
	const auto = text.slice(b + AUTO_BEGIN.length, e);
	const tail = text.slice(e);
	const fixed = head.length + tail.length + INDEX_TRUNCATION_NOTE.length + 2;
	// 头部+规则段本身已吃满预算：条目只留"共 N 条 · 入口"保底行，规则仍不截断。
	// 压缩标注在此分支允许溢出标注本身的长度——"压缩原因可见"优先于严格字符对齐。
	if (fixed >= cap) {
		const summary = summarizeAutoSection(auto);
		return `${head}\n${summary}\n${INDEX_TRUNCATION_NOTE}\n${tail}`;
	}
	return `${head}\n${renderAutoSection(auto, cap - fixed)}\n${tail}\n${INDEX_TRUNCATION_NOTE}`;
}
