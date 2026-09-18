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
import { AUTO_BEGIN, AUTO_END, INDEX_TEMPLATE } from "./templates.js";
import { activeEntries } from "./store.js";

export function readIndex(root) {
	try {
		return readFileSync(join(root, "index.txt"), "utf8");
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
		const cur = readFileSync(join(root, "index.txt"), "utf8");
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
		// 只在内容真的变化时写盘：无变化的重写会打碎 system prompt 前缀缓存。
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
