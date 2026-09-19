// 存储原语：命名空间、目录布局、facts/sops/pending 读写、meta 溯源、访问热度（带衰减）。
// 本模块不依赖索引逻辑（l1index），保持单向依赖。

import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { join, basename } from "node:path";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { atomicWriteFileSync, stageWrite, commitStaged } from "./atomic-write.js";
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

/** 命名空间缓存默认 TTL：60s——分支切换按分钟级感知；热路径每轮求值不再 spawn git。 */
export const NAMESPACE_CACHE_TTL_MS_DEFAULT = 60_000;

const nsCache = new Map(); // cwd -> { ns, expires }
/** 测试探针：累计 git 子进程 spawn 次数（验证缓存命中用）。 */
export const namespaceProbe = { gitSpawns: 0 };
/** 清空命名空间缓存与探针计数（测试隔离用）。 */
export function clearNamespaceCache() {
	nsCache.clear();
	namespaceProbe.gitSpawns = 0;
}

/** 查当前 git 分支（无分支/非仓库/git 缺失统一归一为空串）。 */
function queryCurrentBranch(cwd) {
	namespaceProbe.gitSpawns += 1;
	try {
		return execFileSync("git", ["branch", "--show-current"], {
			cwd,
			encoding: "utf8",
			stdio: ["ignore", "pipe", "ignore"],
			timeout: 2000,
		}).trim();
	} catch { /* 非 git 目录 / git 不可用 / 超时：视为无分支 */ return ""; }
}

/**
 * 自动命名空间：workspace 目录名 + git 分支名（若可用）。
 * [0.6.1 M3] 进程内 memoize（key=cwd）：autoNamespace 开启时本函数位于每轮
 * prompt 装配（systemPrompt.context 的 text 回调）与每次 memory_* 工具执行的
 * 同步路径上，此前无缓存导致每轮 spawn git（正常几十 ms、文件系统挂起时最长
 * 2s timeout），全程阻塞宿主事件循环。TTL 由配置 namespaceCacheTtlMs 控制，0 关闭缓存。
 */
export function detectNamespace(ttlMs = NAMESPACE_CACHE_TTL_MS_DEFAULT, now = Date.now()) {
	try {
		const cwd = process.cwd();
		// 家目录不是项目：此前实测在 ~/.dsh/memory 下生成了以用户名命名的垃圾命名空间。
		if (join(cwd).replace(/[\\/]+$/, "") === join(homedir()).replace(/[\\/]+$/, "")) return "default";
		const hit = nsCache.get(cwd);
		if (ttlMs > 0 && hit && hit.expires > now) return hit.ns;
		const base = basename(cwd) || "default";
		const branch = queryCurrentBranch(cwd);
		const ns = safeNs(branch ? `${base}__${branch}` : base);
		if (ttlMs > 0) nsCache.set(cwd, { ns, expires: now + ttlMs });
		return ns;
	} catch {
		return "default";
	}
}

export function resolveNamespace(cfg, explicit) {
	if (explicit) return safeNs(explicit);
	if (cfg.defaultNamespace) return safeNs(cfg.defaultNamespace);
	if (cfg.autoNamespace) return detectNamespace(cfg.namespaceCacheTtlMs ?? NAMESPACE_CACHE_TTL_MS_DEFAULT);
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

// [0.6.6] meta 读取缓存：getEntryMeta / isArchived 是 turn/end 热路径上的按条查询，
// 此前每一条都要 readFileSync + JSON.parse 整份 memory-meta.json（实测 46 条 SOP 的
// 一轮判定 = 46 次全量解析 200KB+ 文件）。缓存键为 size+mtime+ino：任何写盘（含
// rename 换 inode）都会自动换键；写入方另调 invalidateMetaCache 做显式双保险。
const metaCache = new Map(); // path -> { key, value }

/** 失效命名空间（或全部）的 meta 缓存。写入方调用。 */
export function invalidateMetaCache(root) {
	if (root) metaCache.delete(join(root, META_FILE));
	else metaCache.clear();
}

function metaCacheKey(p) {
	try {
		const s = statSync(p);
		return `${s.size}:${Math.round(s.mtimeMs)}:${s.ino ?? 0}`;
	} catch {
		return null;
	}
}

export function readMeta(root) {
	const p = join(root, META_FILE);
	const key = metaCacheKey(p);
	if (key === null) {
		metaCache.delete(p);
		return { facts: {}, sops: {} };
	}
	const hit = metaCache.get(p);
	if (hit && hit.key === key) return hit.value;
	try {
		const value = JSON.parse(readFileSync(p, "utf8"));
		metaCache.set(p, { key, value });
		return value;
	} catch {
		metaCache.delete(p);
		return { facts: {}, sops: {} };
	}
}

const SLEEP_BUF = new Int32Array(new SharedArrayBuffer(4));
/**
 * 跨进程更新丢失防护：CAS 读改写（无锁无死锁），三段关窗。
 * 1) 暂存：内容先写进唯一下 tmp（rename 的弹药备好，正式文件未动）；
 * 2) 关窗复核：rename 前一刻重读正式文件，仍等于本方基座才提交——校验与
 *    rename 之间不再夹任何耗时操作（tmp 已备好），窗口压到微秒级；
 * 3) 回读兜底：rename 成功后回读确认。EPERM 退避的每轮 sleep 后同样复核基座，
 *    基座已被并发改写则放弃本次 rename 回炉重算（新基座已含胜者内容，单调收敛）。
 * 持续冲突超预算抛错，绝不静默丢。单进程内写都在同一同步段，本防护只针对多宿主
 * 进程共享同一命名空间的场景。compute(text) 必须是仅依赖传入文本的纯函数；
 * 返回 null 表示无需写入。
 */
export function casRewrite(path, compute, budgetMs = 3000) {
	const t0 = Date.now();
	for (;;) {
		const text = existsSync(path) ? readFileSync(path, "utf8") : null;
		const next = compute(text);
		if (next === null) return;
		const tmp = stageWrite(path, next);
		const cur = existsSync(path) ? readFileSync(path, "utf8") : null;
		let settled = false;
		if (cur === text) {
			const r = commitStaged(tmp, path, () => {
				const now = existsSync(path) ? readFileSync(path, "utf8") : null;
				return now === text;
			});
			if (r === "ok") {
				const done = existsSync(path) ? readFileSync(path, "utf8") : null;
				if (done === next) settled = true;
			}
		}
		// [0.6.1 N1] rmSync 此前未导入，这里必抛 ReferenceError 并被 catch 静默吞掉，
		// CAS 复核失败分支的 .tmp-* 永久泄漏。补导入后 force:true 已吸收 ENOENT
		// （成功提交时 commitStaged 的 finally 已删掉 tmp）；仍能到这里只剩
		// EPERM/EBUSY（杀软短暂持锁）——残留可接受，不阻断 CAS 重试。
		try { rmSync(tmp, { force: true }); } catch { /* EPERM/EBUSY：tmp 残留但不影响正确性 */ }
		if (settled) return;
		if (Date.now() - t0 > budgetMs) {
			throw new Error(`casRewrite: 并发冲突持续超 ${budgetMs}ms 预算，放弃写入（防更新丢失）: ${path}`);
		}
		Atomics.wait(SLEEP_BUF, 0, 0, 2 + Math.floor(Math.random() * 8));
	}
}

export function getEntryMeta(root, kind, key) {
	const m = readMeta(root);
	return (kind === "fact" ? m.facts : m.sops)[key] || null;
}

export function setEntryMeta(root, kind, key, patch) {
	let out = null;
	casRewrite(join(root, META_FILE), (text) => {
		let m = null;
		try { m = text === null ? null : JSON.parse(text); } catch { m = null; }
		if (!m || !m.facts || !m.sops) m = { facts: {}, sops: {} };
		const store = kind === "fact" ? m.facts : m.sops;
		const prev = store[key] || {};
		const now = new Date().toISOString();
		store[key] = {
			...prev,
			...patch,
			createdAt: prev.createdAt || now,
			updatedAt: now,
		};
		out = store[key];
		return JSON.stringify(m, null, 2);
	});
	invalidateMetaCache(root);
	return out;
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

/** facts.md 里所有同名 ## SECTION 的 [start,end) 行区间。 */
function factSectionSpans(text, topic) {
	const lines = String(text ?? "").split("\n");
	const heads = [];
	lines.forEach((line, i) => { if (line.startsWith("## ")) heads.push(i); });
	const spans = [];
	for (let k = 0; k < heads.length; k++) {
		const start = heads[k];
		const end = k + 1 < heads.length ? heads[k + 1] : lines.length;
		if (lines[start].slice(3).trim() === topic) spans.push([start, end]);
	}
	return spans;
}

/**
 * upsert facts.md 的 ## SECTION（基于行解析；CAS 防跨进程更新丢失）。
 * [v0.6] 同名 section 只保留一个：历史上正文里的 "## " 行造成过重复 section，
 * 旧实现只替换第一个 → 第二个永久隐身且互相覆盖 meta。多余的重复段先落 .history/
 * 快照再合并掉（神圣不可删改：不丢内容）。
 */
export function upsertFact(root, topic, content) {
	let action = "created";
	const factsPath = join(root, "facts.md");
	const current = existsSync(factsPath) ? readFileSync(factsPath, "utf8") : null;
	if (current !== null) {
		const dupes = factSectionSpans(current, topic).slice(1);
		for (const [s, e] of dupes) {
			try {
				const ts = Date.now();
				const rel = join(HISTORY_DIR, `fact-${slugify(topic)}-dup-${ts}.md`);
				atomicWriteFileSync(join(root, rel), current.split("\n").slice(s, e).join("\n").trim() + "\n");
			} catch { /* 快照失败不阻断合并 */ }
		}
	}
	casRewrite(factsPath, (text) => {
		const base = text ?? FACTS_TEMPLATE;
		const lines = base.split("\n");
		const spans = factSectionSpans(base, topic);
		if (!spans.length) {
			action = "created";
			return base.replace(/\s*$/, "\n") + `## ${topic}\n${content}\n\n`;
		}
		action = spans.length > 1 ? "merged" : "updated";
		// 从后往前删掉多余的同名段（不影响首段行号），再把首段整体换成新内容。
		const out = [...lines];
		for (const [s, e] of spans.slice(1).reverse()) out.splice(s, e - s);
		const [firstStart, firstEnd] = spans[0];
		out.splice(firstStart, firstEnd - firstStart, `## ${topic}`, content, "");
		return out.join("\n").replace(/\n{3,}/g, "\n\n");
	});
	return action;
}

/**
 * 把一条已有记忆的当前内容快照到 .history/，返回 { path, error? }。
 * path === "" 表示条目本无内容（不算失败）。
 * [v0.6] 所有覆盖写（memory_write / memory_update / memory_accept）统一走这里，
 * 修复此前"write 静默覆盖且不留历史"的数据丢失缺陷。
 * [0.6.1 N13] 此前失败也静默返回 ""，与「无内容」不可区分——磁盘满/EPERM 会让
 * 上述保护被无声绕过。现失败原因显式返回，由 writeMemory 汇入 advisories 响亮上报。
 */
export function snapshotEntry(root, kind, key) {
	try {
		const ts = Date.now();
		if (kind === "fact") {
			const old = readFact(root, key);
			if (old === null) return { path: "" };
			const rel = join(HISTORY_DIR, `fact-${slugify(key)}-${ts}.md`);
			atomicWriteFileSync(join(root, rel), `# ${key}\n\n${old}\n`);
			return { path: rel };
		}
		const old = readSop(root, key);
		if (old === null) return { path: "" };
		const rel = join(HISTORY_DIR, `sop-${key}-${ts}.md`);
		atomicWriteFileSync(join(root, rel), old);
		return { path: rel };
	} catch (error) {
		return { path: "", error: String(error?.message || error) };
	}
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

// ── [0.6.4] 归档横幅 ─────────────────────────────────────────────────────────
// 动因（2026-09-18 记忆库体检）：memory_archive 只把条目从 L1 隐藏，正文照旧留在
// facts.md / sops/*.md 里。人工读文件或 memory_search 命中的读者会把历史快照当成
// 现行事实（Jev 判「会误导」0.74）。现在归档时给正文首部写一行自解释横幅；任何
// 再次写入（write / update / accept / rollback）都会先剥掉它，避免取消归档后残留。
export const ARCHIVE_BANNER_PREFIX = "> [已归档";

export function archiveBannerLine(at = new Date()) {
	const day = new Date(at).toISOString().slice(0, 10);
	return `${ARCHIVE_BANNER_PREFIX} ${day}] 历史快照：已不在 L1 索引中，现行结论请以同主题活跃条目为准；本条仍可被 memory_search 检索到。`;
}

export function hasArchiveBanner(text) {
	return String(text ?? "").split("\n").some((line) => line.trim().startsWith(ARCHIVE_BANNER_PREFIX));
}

/** 剥掉正文首部的归档横幅（含其后的空行），其余内容原样保留。 */
export function stripArchiveBanner(text) {
	const lines = String(text ?? "").split("\n");
	let i = 0;
	while (i < lines.length && (lines[i].trim() === "" || lines[i].trim().startsWith(ARCHIVE_BANNER_PREFIX))) i++;
	return lines.slice(i).join("\n");
}

export function withArchiveBanner(text, at = new Date()) {
	return `${archiveBannerLine(at)}\n\n${stripArchiveBanner(text)}`;
}

/** 归档时把横幅写进正文：fact 走 upsertFact（保留 section 结构），sop 保留 # 标题行位置。返回是否发生改动。 */
export function archiveEntryBody(root, kind, key, at = new Date()) {
	if (kind === "fact") {
		const body = readFact(root, key);
		if (body === null || hasArchiveBanner(body)) return false;
		upsertFact(root, key, withArchiveBanner(body, at));
		return true;
	}
	const text = readSop(root, key);
	if (text === null || hasArchiveBanner(text)) return false;
	const lines = text.split("\n");
	const head = lines.length && lines[0].startsWith("# ") ? lines.shift() : null;
	const rest = lines.join("\n").replace(/^\n+/, "");
	atomicWriteFileSync(join(root, "sops", `${key}.md`), `${head ? head + "\n\n" : ""}${archiveBannerLine(at)}\n\n${rest}`);
	return true;
}

/**
 * [0.6.4] 元数据补登记：facts.md 的 ## section 与 sops/*.md 中可能存在
 * memory-meta.json 没有记录的条目（旧版本迁移、examples 种子、跨机导入的记忆）。
 * 缺记录 = 没有 updatedAt/证据追踪，冷条目复核对它们只能报 age_days=null。
 * 只补「存在性 + 文件 mtime」，**不把正文里的证据行抄进 evidence**——那会把别处的
 * 验证洗成本机验证（行动验证公理）。补登记条目带 backfilled 标记，便于事后分辨。
 * 幂等：无缺失时返回空数组且不写文件。
 */
export function backfillMeta(root, { namespace = "default", now = new Date() } = {}) {
	const added = [];
	casRewrite(join(root, META_FILE), (text) => {
		let meta = null;
		try { meta = text === null ? null : JSON.parse(text); } catch { meta = null; }
		if (!meta || !meta.facts || !meta.sops) meta = { facts: {}, sops: {} };
		const ensure = (kind, key, file) => {
			const bucket = kind === "fact" ? meta.facts : meta.sops;
			if (bucket[key]) return;
			let iso = now.toISOString();
			try {
				const st = statSync(file);
				iso = new Date(Math.min(st.mtimeMs, now.getTime())).toISOString();
			} catch { /* 取不到 mtime 就用 now */ }
			bucket[key] = {
				sourceSession: null, sourceSeqs: [], evidence: "", namespace,
				archived: false, createdAt: iso, updatedAt: iso,
				backfilled: true, backfilledAt: now.toISOString(),
			};
			added.push(`${kind}:${key}`);
		};
		for (const name of factSections(root)) ensure("fact", name, join(root, "facts.md"));
		for (const name of sopNames(root)) ensure("sop", name, join(root, "sops", `${name}.md`));
		return added.length ? JSON.stringify(meta, null, 2) : null;
	});
	return added;
}
