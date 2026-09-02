// 存储原语：命名空间、目录布局、facts/sops/pending 读写、meta 溯源、访问热度（带衰减）。
// 本模块不依赖索引逻辑（l1index），保持单向依赖。

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { join, basename } from "node:path";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { atomicWriteFileSync } from "./atomic-write.js";
import { FACTS_TEMPLATE, INDEX_TEMPLATE, L0_TEMPLATE } from "./templates.js";

export const META_FILE = "memory-meta.json";
export const PENDING_DIR = "pending";
export const ARCHIVE_DIR = "archive";
export const HISTORY_DIR = ".history";
export const ACCESS_FILE = "file_access_stats.json";
export const TURN_STATE_FILE = "turn-state.json";

// [fix 2026-08-20] sops/ 保留名：非 SOP 内容文件不得计入 L3 条目。
export const SOP_RESERVED_NAMES = new Set(["readme", "license", "index"]);
// recency 保护窗口：新建条目在窗口内获得加成，避免"写完即隐身"。
export const RECENCY_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
export const RECENCY_BONUS = 1;
// [v0.5] 访问热度半衰期：14 天前的访问权重减半（Ebbinghaus 直觉，对齐 Generative Agents 的指数衰减）。
export const HEAT_HALF_LIFE_DAYS = 14;

export function defaultMemDir() {
	return join(homedir(), ".dsh", "memory");
}

/** 命名空间安全化：只允许小写字母、数字、下划线、连字符。 */
export function safeNs(value) {
	const s = String(value ?? "default").trim().toLowerCase()
		.replace(/[^a-z0-9_-]+/g, "-")
		.replace(/^-+|-+$/g, "");
	return s || "default";
}

/** namespace=default 时兼容旧根目录，其余使用 <memoryDir>/<namespace>/。 */
export function nsRoot(memDir, ns) {
	const s = safeNs(ns);
	return s === "default" ? memDir : join(memDir, s);
}

/** 自动命名空间：workspace 目录名 + git 分支名（若可用）。 */
export function detectNamespace() {
	try {
		const cwd = process.cwd();
		const base = basename(cwd) || "default";
		let branch = "";
		try {
			branch = execFileSync("git", ["branch", "--show-current"], {
				cwd,
				encoding: "utf8",
				stdio: ["ignore", "pipe", "ignore"],
				timeout: 2000,
			}).trim();
		} catch { /* 非 git 目录 */ }
		return safeNs(branch ? `${base}__${branch}` : base);
	} catch {
		return "default";
	}
}

export function resolveNamespace(cfg, explicit) {
	if (explicit) return safeNs(explicit);
	if (cfg.defaultNamespace) return safeNs(cfg.defaultNamespace);
	if (cfg.autoNamespace) return detectNamespace();
	return "default";
}

/** 初始化命名空间目录结构（幂等，不覆盖已有内容；种子文件缺失时写入模板）。 */
export function ensureNamespaceLayout(root) {
	mkdirSync(root, { recursive: true });
	mkdirSync(join(root, "sops"), { recursive: true });
	mkdirSync(join(root, PENDING_DIR), { recursive: true });
	mkdirSync(join(root, ARCHIVE_DIR), { recursive: true });
	mkdirSync(join(root, HISTORY_DIR), { recursive: true });
	const seeds = [
		["memory_management_sop.md", L0_TEMPLATE],
		["index.txt", INDEX_TEMPLATE],
		["facts.md", FACTS_TEMPLATE],
	];
	for (const [file, content] of seeds) {
		const p = join(root, file);
		if (!existsSync(p)) atomicWriteFileSync(p, content);
	}
}

export function slugify(topic) {
	const s = String(topic).trim().toLowerCase()
		.replace(/[^\p{L}\p{N}]+/gu, "-")
		.replace(/^-+|-+$/g, "");
	return s.slice(0, 48) || "entry";
}

/** facts.md 的 section 名列表。 */
export function factSections(root) {
	try {
		const text = readFileSync(join(root, "facts.md"), "utf8");
		const out = [];
		for (const line of text.split("\n")) {
			const m = line.match(/^##\s+(.+)$/);
			if (m) out.push(m[1].trim());
		}
		return out;
	} catch {
		return [];
	}
}

/** sops/ 的文件名列表（去 .md，过滤保留名）。 */
export function sopNames(root) {
	try {
		return readdirSync(join(root, "sops"))
			.filter((f) => f.endsWith(".md"))
			.filter((f) => !SOP_RESERVED_NAMES.has(f.slice(0, -3).toLowerCase()))
			.map((f) => f.replace(/\.md$/, ""))
			.sort();
	} catch {
		return [];
	}
}

export function pendingNames(root) {
	try {
		return readdirSync(join(root, PENDING_DIR))
			.filter((f) => f.endsWith(".md"))
			.sort();
	} catch {
		return [];
	}
}

export function readMeta(root) {
	try {
		return JSON.parse(readFileSync(join(root, META_FILE), "utf8"));
	} catch {
		return { facts: {}, sops: {} };
	}
}

export function writeMeta(root, meta) {
	atomicWriteFileSync(join(root, META_FILE), JSON.stringify(meta, null, 2));
}

export function getEntryMeta(root, kind, key) {
	const m = readMeta(root);
	return (kind === "fact" ? m.facts : m.sops)[key] || null;
}

export function setEntryMeta(root, kind, key, patch) {
	const m = readMeta(root);
	const store = kind === "fact" ? m.facts : m.sops;
	const prev = store[key] || {};
	const now = new Date().toISOString();
	store[key] = {
		...prev,
		...patch,
		createdAt: prev.createdAt || now,
		updatedAt: now,
	};
	writeMeta(root, m);
	return store[key];
}

export function isArchived(root, kind, key) {
	return Boolean(getEntryMeta(root, kind, key)?.archived);
}

export function activeEntries(root) {
	return {
		facts: factSections(root).filter((f) => !isArchived(root, "fact", f)),
		sops: sopNames(root).filter((s) => !isArchived(root, "sop", s)),
	};
}

/** 记忆名称安全校验：拒绝绝对路径与任何 ".." 路径段。 */
export function isSafeMemName(value) {
	if (/^[a-zA-Z]:[\\/]/.test(value)) return false;
	if (value.split(/[\\/]/).includes("..")) return false;
	return true;
}

/** 读取 facts.md 的指定 section。 */
export function readFact(root, topic) {
	const text = existsSync(join(root, "facts.md")) ? readFileSync(join(root, "facts.md"), "utf8") : "";
	const lines = text.split("\n");
	let inSection = false;
	const out = [];
	for (const line of lines) {
		if (line.startsWith("## ")) {
			if (inSection) break;
			if (line.slice(3).trim() === topic) { inSection = true; continue; }
		}
		if (inSection) out.push(line);
	}
	return inSection ? out.join("\n").trim() : null;
}

/** 读取 sop 文件全文。 */
export function readSop(root, slug) {
	const p = join(root, "sops", `${slug}.md`);
	return existsSync(p) ? readFileSync(p, "utf8") : null;
}

/** upsert facts.md 的 ## SECTION（基于行解析）。 */
export function upsertFact(root, topic, content) {
	const p = join(root, "facts.md");
	const text = existsSync(p) ? readFileSync(p, "utf8") : FACTS_TEMPLATE;
	const lines = text.split("\n");
	let start = -1;
	let end = lines.length;
	for (let i = 0; i < lines.length; i++) {
		if (lines[i].startsWith("## ")) {
			if (start >= 0) { end = i; break; }
			if (lines[i].slice(3).trim() === topic) start = i;
		}
	}
	if (start >= 0) {
		const updated = [...lines.slice(0, start), `## ${topic}`, content, "", ...lines.slice(end)];
		atomicWriteFileSync(p, updated.join("\n"));
		return "updated";
	}
	atomicWriteFileSync(p, text.replace(/\s*$/, "\n") + `## ${topic}\n${content}\n\n`);
	return "created";
}

export function loadAccess(root) {
	try {
		return JSON.parse(readFileSync(join(root, ACCESS_FILE), "utf8"));
	} catch {
		return {};
	}
}

/**
 * 访问热度（v2 带衰减）：
 * - 存储格式升级为 { count, lastAt }；旧版纯数字按 { count: n, lastAt: now } 迁移。
 * - 衰减分 = count * 0.5^(ageDays / HEAT_HALF_LIFE_DAYS)，14 天半衰。
 * - 新建条目（RECENCY_WINDOW_MS 内）在无访问记录时保留 RECENCY_BONUS 保护。
 *
 * @param access loadAccess(root) 的结果（调用方复用，避免逐条重读文件）。
 */
export function entryHeat(access, meta, kind, key, heat = {}) {
	const halfLifeDays = heat.halfLifeDays ?? HEAT_HALF_LIFE_DAYS;
	const recencyWindowMs = heat.recencyWindowMs ?? RECENCY_WINDOW_MS;
	const entry = access[`${kind}:${key}`];
	let decayed = 0;
	if (typeof entry === "number") decayed = entry;
	else if (entry && typeof entry === "object") {
		const count = Number(entry.count ?? 0);
		const lastAt = Date.parse(entry.lastAt ?? "");
		const ageDays = Number.isFinite(lastAt)
			? Math.max(0, (Date.now() - lastAt) / 86400000)
			: 0;
		decayed = count * Math.pow(0.5, ageDays / halfLifeDays);
	}
	if (decayed > 0) return decayed;
	const e = (kind === "fact" ? meta.facts : meta.sops)[key];
	if (!e?.createdAt) return 0;
	const age = Date.now() - new Date(e.createdAt).getTime();
	return age >= 0 && age <= recencyWindowMs ? RECENCY_BONUS : 0;
}

/** 记录一次真实读取（v2 格式：count + lastAt）。写入不再计入热度（写≠读）。 */
export function bumpAccess(root, key) {
	try {
		const raw = loadAccess(root);
		const prev = raw[key];
		const count = (typeof prev === "number" ? prev : prev?.count ?? 0) + 1;
		raw[key] = { count, lastAt: new Date().toISOString() };
		atomicWriteFileSync(join(root, ACCESS_FILE), JSON.stringify(raw, null, 2));
	} catch { /* 热度统计失败不影响主流程 */ }
}

export function hashText(text) {
	return createHash("sha256").update(String(text || "")).digest("hex").slice(0, 16);
}

export function computeNamespaceStats(root) {
	const facts = factSections(root).filter((f) => !isArchived(root, "fact", f));
	const sops = sopNames(root).filter((s) => !isArchived(root, "sop", s));
	const archivedFacts = factSections(root).filter((f) => isArchived(root, "fact", f));
	const archivedSops = sopNames(root).filter((s) => isArchived(root, "sop", s));
	const pending = pendingNames(root);
	let sizeBytes = 0;
	for (const f of ["index.txt", "facts.md", "memory_management_sop.md"]) {
		try { sizeBytes += statSync(join(root, f)).size; } catch { /* 忽略 */ }
	}
	try {
		for (const f of readdirSync(join(root, "sops"))) sizeBytes += statSync(join(root, "sops", f)).size;
	} catch { /* 忽略 */ }
	try {
		for (const f of readdirSync(join(root, PENDING_DIR))) sizeBytes += statSync(join(root, PENDING_DIR, f)).size;
	} catch { /* 忽略 */ }
	return {
		facts: facts.length,
		sops: sops.length,
		pending: pending.length,
		archived: archivedFacts.length + archivedSops.length,
		size_bytes: sizeBytes,
		updatedAt: new Date().toISOString(),
	};
}

/** 全局 turn 计数持久化（跨会话累计，headless 一次性会话也能触发周期维护）。 */
export function bumpTurnCounter(root) {
	try {
		const p = join(root, TURN_STATE_FILE);
		let state = { totalTurns: 0, lastAt: "" };
		try { state = JSON.parse(readFileSync(p, "utf8")); } catch { /* 首次 */ }
		state.totalTurns = (Number(state.totalTurns) || 0) + 1;
		state.lastAt = new Date().toISOString();
		atomicWriteFileSync(p, JSON.stringify(state, null, 2));
		return state.totalTurns;
	} catch {
		return 0;
	}
}
