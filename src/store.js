// 文件存储与条目身份。正文变更由命名空间锁串行化，索引是可重建的派生数据。
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync, cpSync, realpathSync } from "node:fs";
import { homedir } from "node:os";
import { join, basename, dirname, resolve } from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { atomicWriteFileSync, stageWrite, commitStaged } from "./atomic-write.js";
import { acquireProcessLock } from "./process-lock.js";
import { FACTS_TEMPLATE, INDEX_TEMPLATE, L0_TEMPLATE } from "./templates.js";

export const META_FILE = "memory-meta.json";
export const PENDING_DIR = "pending";
export const ARCHIVE_DIR = "archive";
export const HISTORY_DIR = ".history";
export const ACCESS_FILE = "file_access_stats.json";
export const TURN_STATE_FILE = "turn-state.json";
export const SOP_RESERVED_NAMES = new Set(["readme", "license", "index"]);
export const RESERVED_ENTRY_NAMES = new Set([...SOP_RESERVED_NAMES, "l1", "索引"]);
export const RECENCY_WINDOW_MS = 7 * 86400000;
export const RECENCY_BONUS = 1;
export const HEAT_HALF_LIFE_DAYS = 14;
export const NAMESPACE_CACHE_TTL_MS_DEFAULT = 60_000;
const WRITE_LOCK_FILE = ".write.lock";
const heldWriteLocks = new Set();

export function defaultMemDir() { return join(homedir(), ".dsh", "memory"); }
export function hashText(text) { return createHash("sha512").update(String(text ?? "")).digest("hex").slice(0, 32); }
export function safeNs(value) {
  return String(value ?? "default").trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || "default";
}
export function nsRoot(memDir, ns) { const name = safeNs(ns); return name === "default" ? memDir : join(memDir, name); }
export function canonicalWorkspacePath(cwd) {
  const path = realpathSync.native(resolve(cwd)).replace(/[\\\/]+$/, "");
  return process.platform === "win32" ? path.toLowerCase() : path;
}
export function detectNamespace(_ttl, _now, cwd = process.cwd()) {
  const path = canonicalWorkspacePath(cwd);
  if (path === canonicalWorkspacePath(homedir())) return "default";
  return `${safeNs(basename(path)).slice(0, 40)}-${hashText(path).slice(0, 12)}`;
}
export function resolveNamespace(cfg, explicit, cwd = process.cwd()) {
  if (explicit) return safeNs(explicit);
  if (cfg.defaultNamespace) return safeNs(cfg.defaultNamespace);
  return cfg.autoNamespace ? detectNamespace(undefined, undefined, cfg.workspaceRootFor?.(cwd) || cwd) : "default";
}

function readText(path) {
  try { return readFileSync(path, "utf8"); }
  catch (error) { if (error.code === "ENOENT") return null; throw error; }
}
function readJson(path, absent) {
  const text = readText(path);
  if (text === null) return absent;
  try { return JSON.parse(text); }
  catch (error) { throw new Error(`Invalid JSON in ${path}: ${error.message}`, { cause: error }); }
}
function markdownNames(dir) {
  try { return readdirSync(dir).filter(name => name.endsWith(".md")).sort(); }
  catch (error) { if (error.code === "ENOENT") return []; throw error; }
}

/** 只做创建，不迁移、不删除、不覆盖既有用户文件。 */
export function ensureNamespaceLayout(root, identity) {
  mkdirSync(root, { recursive: true });
  return withNsWriteLock(root, () => {
    for (const dir of ["sops", PENDING_DIR, ARCHIVE_DIR, HISTORY_DIR]) mkdirSync(join(root, dir), { recursive: true });
    for (const [name, content] of [["memory_management_sop.md", L0_TEMPLATE], ["index.txt", INDEX_TEMPLATE], ["facts.md", FACTS_TEMPLATE]]) {
      if (!existsSync(join(root, name))) atomicWriteFileSync(join(root, name), content);
    }
    if (identity && !existsSync(join(root, ".namespace.json"))) atomicWriteFileSync(join(root, ".namespace.json"), JSON.stringify(identity, null, 2));
  });
}

export function withNsWriteLock(root, fn, { waitBudgetMs = 3000 } = {}) {
  mkdirSync(root, { recursive: true });
  const canonical = canonicalWorkspacePath(root);
  if (heldWriteLocks.has(canonical)) return fn();
  const lockPath = join(canonical, WRITE_LOCK_FILE);
  const release = acquireProcessLock(lockPath, { waitBudgetMs });
  if (!release) throw new Error(`Namespace lock wait exceeded ${waitBudgetMs}ms: ${lockPath}`);
  heldWriteLocks.add(canonical);
  try {
    const result = fn();
    if (result && typeof result.then === "function") throw new Error("Namespace transaction callback must be synchronous");
    return result;
  } finally { heldWriteLocks.delete(canonical); release(); }
}
export function withNsWriteLocks(roots, fn) {
  for (const root of roots) mkdirSync(root, { recursive: true });
  const ordered = [...new Set(roots.map(canonicalWorkspacePath))].sort();
  const enter = i => i === ordered.length ? fn() : withNsWriteLock(ordered[i], () => enter(i + 1));
  return enter(0);
}

/** 锁内重读再写，避免比较后 rename 的伪 CAS 窗口。 */
export function rewriteFile(path, compute) {
  return withNsWriteLock(dirname(path), () => {
    const previous = readText(path);
    const next = compute(previous);
    if (next !== null && next !== previous) atomicWriteFileSync(path, next);
  });
}

// 多文件提交先完整暂存；运行期提交出错时恢复旧文件，并保留原始错误。
function commitFiles(root, changes) {
  return withNsWriteLock(root, () => {
    const staged = [];
    const committed = [];
    try {
      for (const [path, content] of changes) staged.push({ path, previous: readText(path), tmp: stageWrite(path, content) });
      for (const item of staged) { commitStaged(item.tmp, item.path); committed.push(item); }
    } catch (error) {
      for (const item of committed.reverse()) {
        if (item.previous === null) rmSync(item.path, { force: true });
        else atomicWriteFileSync(item.path, item.previous);
      }
      throw error;
    } finally { for (const item of staged) rmSync(item.tmp, { force: true }); }
  });
}

export function slugify(topic) { return String(topic).trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "").slice(0, 48) || "entry"; }
export function isSafeMemName(value) {
  return typeof value === "string" && Boolean(value.trim()) && !/^[\\\/]|^[a-z]:/i.test(value) && !value.split(/[\\\/]/).includes("..") && !/[\x00-\x1f\x7f]/.test(value);
}
function assertEntryKey(kind, key) {
  if (!["fact", "sop"].includes(kind)) throw new Error(`Unknown entry kind: ${kind}`);
  if (!key || /[\x00-\x1f\x7f]/.test(key)) throw new Error("Entry key must be nonempty and contain no control characters");
  if (kind === "sop" && (!isSafeMemName(key) || /[\\\/]/.test(key))) throw new Error(`Invalid SOP key: ${key}`);
}
export function entryIdentity(namespace, kind, key) { assertEntryKey(kind, key); return { namespace: safeNs(namespace), kind, key }; }
export function parseFacts(text) {
  const lines = String(text ?? "").split(/\r?\n/);
  const out = [];
  let entry;
  lines.forEach((line, index) => {
    const heading = line.match(/^##\s+(.+)$/);
    if (heading) {
      if (entry) { entry.end = index; out.push(entry); }
      entry = { key: heading[1].trim(), start: index, lines: [] };
    } else if (entry) entry.lines.push(line);
  });
  if (entry) { entry.end = lines.length; out.push(entry); }
  return out.map(({ lines: body, ...rest }) => ({ ...rest, raw: body.join("\n").trim() }));
}
export function factSections(root) { return parseFacts(readText(join(root, "facts.md"))).map(entry => entry.key); }
export function sopNames(root) { return markdownNames(join(root, "sops")).map(name => name.slice(0, -3)).filter(name => !SOP_RESERVED_NAMES.has(name.toLowerCase())); }
export function pendingNames(root) { return markdownNames(join(root, PENDING_DIR)); }
export function readFact(root, topic) { return parseFacts(readText(join(root, "facts.md"))).find(entry => entry.key === topic)?.raw ?? null; }
export function readSop(root, key) { assertEntryKey("sop", key); return readText(join(root, "sops", key + ".md")); }
export function entryExists(root, kind, key) { return kind === "fact" ? readFact(root, key) !== null : readSop(root, key) !== null; }
export function readMeta(root) {
  const meta = readJson(join(root, META_FILE), { facts: {}, sops: {} });
  if (!meta || typeof meta !== "object" || !meta.facts || !meta.sops || typeof meta.facts !== "object" || typeof meta.sops !== "object" || Array.isArray(meta.facts) || Array.isArray(meta.sops)) throw new Error("Invalid memory metadata structure: " + join(root, META_FILE));
  Object.setPrototypeOf(meta.facts, null);
  Object.setPrototypeOf(meta.sops, null);
  return meta;
}
export function getEntryMeta(root, kind, key) { assertEntryKey(kind, key); return readMeta(root)[kind === "fact" ? "facts" : "sops"][key] ?? null; }
export function setEntryMeta(root, kind, key, patch) {
  assertEntryKey(kind, key);
  return withNsWriteLock(root, () => {
    const meta = readMeta(root), bucket = kind === "fact" ? meta.facts : meta.sops;
    const change = typeof patch === "function" ? patch(bucket[key] || null) : patch;
    if (change === null) return bucket[key] || null;
    const now = new Date().toISOString();
    bucket[key] = { ...bucket[key], ...change, createdAt: bucket[key]?.createdAt || change.createdAt || now, updatedAt: now };
    atomicWriteFileSync(join(root, META_FILE), JSON.stringify(meta, null, 2));
    return bucket[key];
  });
}
export function isArchived(root, kind, key) { return Boolean(getEntryMeta(root, kind, key)?.archived); }
export function activeEntries(root, entries = readEntries(root)) {
  const all = entries.filter(entry => !entry.meta?.archived);
  return { facts: all.filter(entry => entry.kind === "fact").map(entry => entry.key), sops: all.filter(entry => entry.kind === "sop").map(entry => entry.key) };
}

export const ARCHIVE_BANNER_PREFIX = "> [已归档";
export function archiveBannerLine(at = new Date()) { return ARCHIVE_BANNER_PREFIX + " " + new Date(at).toISOString().slice(0, 10) + "] 历史快照；现行结论请查同主题活跃条目。"; }
export function hasArchiveBanner(text) {
  const lines = String(text ?? "").split(/\r?\n/);
  let index = 0;
  while (index < lines.length && !lines[index].trim()) index++;
  if (/^#\s/.test(lines[index] || "")) index++;
  while (index < lines.length && !lines[index].trim()) index++;
  return Boolean(lines[index]?.trim().startsWith(ARCHIVE_BANNER_PREFIX));
}
export function stripArchiveBanner(text) {
  const lines = String(text ?? "").split(/\r?\n/);
  let index = 0;
  while (index < lines.length && !lines[index].trim()) index++;
  const title = /^#\s/.test(lines[index] || "") ? lines[index++] : null;
  while (index < lines.length && (!lines[index].trim() || lines[index].trim().startsWith(ARCHIVE_BANNER_PREFIX))) index++;
  return (title ? title + "\n\n" : "") + lines.slice(index).join("\n");
}
export function withArchiveBanner(text, at = new Date()) {
  const clean = stripArchiveBanner(text);
  const match = clean.match(/^(# .+)\n+/);
  return match ? match[1] + "\n\n" + archiveBannerLine(at) + "\n\n" + clean.slice(match[0].length)
    : archiveBannerLine(at) + "\n\n" + clean;
}
export function parseEntryBody(kind, key, raw) {
  let content = String(raw ?? "").trim(), title = key;
  if (kind === "sop") {
    const first = content.match(/^#\s+(.+)(?:\r?\n|$)/);
    if (first) {
      title = first[1].trim();
      content = content.slice(first[0].length).trimStart();
      for (;;) {
        const duplicate = content.match(/^#\s+(.+)(?:\r?\n|$)/);
        if (!duplicate || duplicate[1].trim() !== title) break;
        content = content.slice(duplicate[0].length).trimStart();
      }
    }
  }
  content = stripArchiveBanner(content).trim();
  // 只剥离文件格式的尾部证据块；正文中间的引用不变。
  for (;;) {
    const marker = content.lastIndexOf("\n\n> 证据:");
    if (marker < 0 || !content.slice(marker + 2).split("\n").every(line => !line.trim() || line.startsWith(">"))) break;
    content = content.slice(0, marker).trimEnd();
  }
  return { title, content };
}
function entryFromRaw(kind, key, raw, meta = {}) {
  const body = parseEntryBody(kind, key, raw);
  const semantic = { evidence: meta.evidence || "", related: meta.related || [], archived: Boolean(meta.archived), replacedBy: meta.replacedBy || null };
  return { kind, key, ...body, raw, meta, revision: hashText(JSON.stringify([kind, key, raw, semantic])) };
}
export function readEntry(root, kind, key) {
  assertEntryKey(kind, key);
  const raw = kind === "fact" ? readFact(root, key) : readSop(root, key);
  return raw === null ? null : entryFromRaw(kind, key, raw, getEntryMeta(root, kind, key) || {});
}
export function readEntries(root) {
  const meta = readMeta(root);
  const facts = parseFacts(readText(join(root, "facts.md"))).map(entry => entryFromRaw("fact", entry.key, entry.raw, meta.facts[entry.key] || {}));
  const sops = sopNames(root).map(key => entryFromRaw("sop", key, readSop(root, key), meta.sops[key] || {}));
  return [...facts, ...sops];
}
export function entryContentRevision(root, kind, key) { return readEntry(root, kind, key)?.revision ?? null; }
function factTextWith(text, key, content) {
  const base = text ?? FACTS_TEMPLATE;
  const spans = parseFacts(base).filter(entry => entry.key === key);
  if (!spans.length) return base.trimEnd() + "\n\n## " + key + "\n" + content.trim() + "\n";
  const lines = base.split(/\r?\n/);
  for (const span of spans.slice(1).reverse()) lines.splice(span.start, span.end - span.start);
  lines.splice(spans[0].start, spans[0].end - spans[0].start, "## " + key, content.trim(), "");
  return lines.join("\n");
}
/** 内部正文写入原语。重复段的每份内容先单独保存，再合并。 */
export function upsertFact(root, key, content) {
  assertEntryKey("fact", key);
  return withNsWriteLock(root, () => {
    const path = join(root, "facts.md"), previous = readText(path);
    const duplicates = parseFacts(previous).filter(entry => entry.key === key);
    for (const entry of duplicates.slice(1)) saveSnapshot(root, "fact", key, entry.raw, getEntryMeta(root, "fact", key));
    atomicWriteFileSync(path, factTextWith(previous, key, content));
    return duplicates.length > 1 ? "merged" : duplicates.length ? "updated" : "created";
  });
}
/** 正文与元数据一起提交；meta 为完整的新版本。索引由上层在同一锁内重建。 */
export function commitEntry(root, kind, key, raw, entryMeta) {
  assertEntryKey(kind, key);
  return withNsWriteLock(root, () => {
    const meta = readMeta(root);
    const path = kind === "fact" ? join(root, "facts.md") : join(root, "sops", key + ".md");
    const previous = readText(path);
    if (kind === "fact") {
      for (const duplicate of parseFacts(previous).filter(entry => entry.key === key).slice(1)) saveSnapshot(root, kind, key, duplicate.raw, meta.facts[key]);
    }
    meta[kind === "fact" ? "facts" : "sops"][key] = entryMeta;
    const entry = entryFromRaw(kind, key, kind === "fact" ? raw.trim() : raw, entryMeta);
    commitFiles(root, [[path, kind === "fact" ? factTextWith(previous, key, raw) : raw], [join(root, META_FILE), JSON.stringify(meta, null, 2)]]);
    return entry;
  });
}
function saveSnapshot(root, kind, key, raw, meta) {
  const id = randomUUID(), createdAt = new Date().toISOString();
  const path = join(HISTORY_DIR, id + ".json");
  const sequencePath = join(root, HISTORY_DIR, "sequence.json");
  const sequence = readJson(sequencePath, { value: 0 }).value + 1;
  atomicWriteFileSync(sequencePath, JSON.stringify({ value: sequence }));
  const snapshot = { format: "memory-snapshot-v2", id, kind, key, title: parseEntryBody(kind, key, raw).title, createdAt, sequence, raw, meta: meta || {} };
  atomicWriteFileSync(join(root, path), JSON.stringify(snapshot, null, 2));
  return { id, path, createdAt };
}
export function snapshotEntry(root, kind, key) {
  return withNsWriteLock(root, () => {
    const entry = readEntry(root, kind, key);
    return entry ? saveSnapshot(root, kind, key, entry.raw, entry.meta) : { path: "" };
  });
}
function historyRecords(root, kind, key) {
  let files;
  try { files = readdirSync(join(root, HISTORY_DIR)); }
  catch (error) { if (error.code === "ENOENT") return []; throw error; }
  const records = [];
  for (const name of files) {
    const path = join(HISTORY_DIR, name);
    if (name.endsWith(".json") && !name.endsWith(".meta.json")) {
      const record = readJson(join(root, path), null);
      if (record?.format === "memory-snapshot-v2" && record.kind === kind && record.key === key) records.push({ ...record, path, legacy: false, metaAvailable: true });
      continue;
    }
    if (!name.endsWith(".md") || !name.startsWith(kind + "-")) continue;
    const rawFile = readFileSync(join(root, path), "utf8");
    const heading = rawFile.match(/^#{1,2}\s+(.+)(?:\r?\n|$)/);
    if (!heading) continue;
    const title = heading[1].trim();
    if (kind === "fact" ? title !== key : slugify(title) !== key) continue;
    const raw = kind === "fact" ? rawFile.slice(heading[0].length).trim() : rawFile;
    const sidecar = readJson(join(root, HISTORY_DIR, name.replace(/\.md$/, ".meta.json")), null);
    const timestamp = name.match(/-(\d{10,})\.md$/)?.[1];
    records.push({ id: name, path, kind, key, title, raw, meta: sidecar?.missing ? null : sidecar, metaAvailable: Boolean(sidecar && !sidecar.missing), createdAt: timestamp ? new Date(Number(timestamp)).toISOString() : statSync(join(root, path)).mtime.toISOString(), legacy: true });
  }
  return records.sort((a, b) => a.createdAt.localeCompare(b.createdAt) || (a.sequence || 0) - (b.sequence || 0) || a.id.localeCompare(b.id));
}
export function listEntryHistory(root, kind, key) {
  assertEntryKey(kind, key);
  return historyRecords(root, kind, key).map(({ raw, meta, ...record }) => record);
}
export function restoreEntry(root, kind, key, snapshotId) {
  return withNsWriteLock(root, () => {
    const records = historyRecords(root, kind, key);
    const record = snapshotId ? records.find(item => item.id === snapshotId) : records.at(-1);
    if (!record) return { restored: false, entry: null };
    const current = readEntry(root, kind, key);
    const history = current ? snapshotEntry(root, kind, key).path : "";
    const now = new Date().toISOString();
    // 旧快照无来源时明确标未知，不能把新版本证据冒充旧版证据。
    const meta = { ...(record.meta || {}), sourceSession: record.meta?.sourceSession || null, sourceSeqs: record.meta?.sourceSeqs || [], evidence: record.meta?.evidence || "", restoredFrom: record.id, createdAt: record.meta?.createdAt || record.createdAt, updatedAt: now };
    const raw = meta.archived ? withArchiveBanner(record.raw) : stripArchiveBanner(record.raw);
    if (kind === "fact" && /^##\s+/m.test(raw)) throw new Error("Historical fact contains section headings; inspect its snapshot before restoring");
    const entry = commitEntry(root, kind, key, raw, meta);
    return { restored: true, source: record.id, history, meta_restored: record.metaAvailable, entry };
  });
}
export function archiveEntry(root, kind, key, { unarchive = false, replacement } = {}) {
  return withNsWriteLock(root, () => {
    const previous = readEntry(root, kind, key);
    if (!previous) return { archived: false, unarchived: false, entry: null };
    const history = snapshotEntry(root, kind, key).path;
    const now = new Date().toISOString();
    const meta = { ...previous.meta, archived: !unarchive, updatedAt: now };
    if (unarchive) { meta.unarchivedAt = now; delete meta.replacedBy; }
    else { meta.archivedAt = now; meta.archivedFrom = history; if (replacement) meta.replacedBy = replacement; }
    const entry = commitEntry(root, kind, key, unarchive ? stripArchiveBanner(previous.raw) : withArchiveBanner(previous.raw), meta);
    return { archived: !unarchive, unarchived: unarchive, history, entry };
  });
}

export function loadAccess(root) { return readJson(join(root, ACCESS_FILE), {}); }
export function entryHeat(access, meta, kind, key, heat = {}) {
  const value = access[kind + ":" + key];
  const halfLife = heat.halfLifeDays || HEAT_HALF_LIFE_DAYS;
  if (typeof value === "number") return value;
  if (value) {
    const age = Math.max(0, Date.now() - Date.parse(value.lastAt));
    return Number(value.score ?? value.count ?? 0) * Math.pow(0.5, age / (halfLife * 86400000));
  }
  const created = meta[kind === "fact" ? "facts" : "sops"]?.[key]?.createdAt;
  const age = created ? Date.now() - Date.parse(created) : Infinity;
  return age >= 0 && age <= (heat.recencyWindowMs ?? RECENCY_WINDOW_MS) ? RECENCY_BONUS : 0;
}
// 真实读取才计分；同一会话同一条目只计一次，避免反复读同一条把热度刷爆。
export function bumpAccess(root, key, { halfLifeDays = HEAT_HALF_LIFE_DAYS, sessionId = null } = {}) {
  return withNsWriteLock(root, () => {
    const access = loadAccess(root), previous = access[key];
    if (sessionId && previous && typeof previous === "object" && previous.lastSession === sessionId) return previous;
    const age = previous?.lastAt ? Math.max(0, Date.now() - Date.parse(previous.lastAt)) : 0;
    const oldScore = typeof previous === "number" ? previous : Number(previous?.score ?? previous?.count ?? 0);
    const count = (typeof previous === "number" ? previous : previous?.count || 0) + 1;
    access[key] = {
      count,
      score: oldScore * Math.pow(0.5, age / (halfLifeDays * 86400000)) + 1,
      lastAt: new Date().toISOString(),
      ...(sessionId ? { lastSession: sessionId } : {}),
    };
    atomicWriteFileSync(join(root, ACCESS_FILE), JSON.stringify(access, null, 2));
    return access[key];
  });
}
export function bumpTurnCounter(root) {
  let count;
  rewriteFile(join(root, TURN_STATE_FILE), text => {
    const state = text === null ? { totalTurns: 0 } : JSON.parse(text);
    count = state.totalTurns + 1;
    return JSON.stringify({ totalTurns: count, lastAt: new Date().toISOString() }, null, 2);
  });
  return count;
}
function directoryBytes(path) {
  let names;
  try { names = readdirSync(path, { withFileTypes: true }); }
  catch (error) { if (error.code === "ENOENT") return 0; throw error; }
  return names.reduce((total, name) => total + (name.isDirectory() ? directoryBytes(join(path, name.name)) : statSync(join(path, name.name)).size), 0);
}
function fileBytes(path) {
  try { return statSync(path).size; }
  catch (error) { if (error.code === "ENOENT") return 0; throw error; }
}
export function computeNamespaceStats(root, entries = readEntries(root)) {
  const active = entries.filter(entry => !entry.meta.archived);
  const contentBytes = ["facts.md", "index.txt", "memory_management_sop.md"].reduce((sum, name) => sum + fileBytes(join(root, name)), 0) + directoryBytes(join(root, "sops"));
  const historyBytes = directoryBytes(join(root, HISTORY_DIR)) + directoryBytes(join(root, ARCHIVE_DIR));
  const pendingBytes = directoryBytes(join(root, PENDING_DIR));
  let metadataBytes = 0;
  try {
    for (const name of readdirSync(root, { withFileTypes: true })) {
      if (name.isFile() && !["facts.md", "index.txt", "memory_management_sop.md", WRITE_LOCK_FILE, ".maintenance-agent.lock"].includes(name.name) && !name.name.startsWith(".write-owner-")) metadataBytes += statSync(join(root, name.name)).size;
    }
  } catch (error) { if (error.code !== "ENOENT") throw error; }
  return { facts: active.filter(entry => entry.kind === "fact").length, sops: active.filter(entry => entry.kind === "sop").length, archived: entries.length - active.length, pending: pendingNames(root).length, size_bytes: contentBytes + historyBytes + pendingBytes + metadataBytes, content_bytes: contentBytes, history_bytes: historyBytes, pending_bytes: pendingBytes, metadata_bytes: metadataBytes, updatedAt: new Date().toISOString() };
}
export function backfillMeta(root, { namespace = "default", now = new Date() } = {}) {
  return withNsWriteLock(root, () => {
    const meta = readMeta(root), added = [];
    for (const [kind, names] of [["fact", factSections(root)], ["sop", sopNames(root)]]) {
      const bucket = meta[kind === "fact" ? "facts" : "sops"];
      for (const key of names) {
        const file = join(root, kind === "fact" ? "facts.md" : "sops/" + key + ".md");
        const mtimeIso = new Date(Math.min(statSync(file).mtimeMs, now.getTime())).toISOString();
        if (bucket[key]) {
          // 老条目已有 meta 但缺 createdAt：热度排序要用创建时间做新手保护与同分排序，
          // 缺了这些条目永远拿不到新手保护。文件 mtime 是可得的最佳近似。
          if (!bucket[key].createdAt) {
            bucket[key] = { ...bucket[key], createdAt: mtimeIso };
            added.push(kind + ":" + key);
          }
          continue;
        }
        bucket[key] = { sourceSession: null, sourceSeqs: [], evidence: "", namespace, archived: false, createdAt: mtimeIso, updatedAt: mtimeIso, backfilled: true, backfilledAt: now.toISOString() };
        added.push(kind + ":" + key);
      }
    }
    if (added.length) atomicWriteFileSync(join(root, META_FILE), JSON.stringify(meta, null, 2));
    return added;
  });
}
/** 定向修复库存状态：孤儿元数据保存在历史中，只给缺标记的已归档正文补横幅。 */
export function reconcileEntries(root) {
  return withNsWriteLock(root, () => {
    const entries = readEntries(root), meta = readMeta(root);
    const found = new Set(entries.map(entry => JSON.stringify([entry.kind, entry.key])));
    const orphans = [];
    for (const [kind, bucket] of [["fact", meta.facts], ["sop", meta.sops]]) {
      for (const key of Object.keys(bucket)) {
        if (found.has(JSON.stringify([kind, key]))) continue;
        orphans.push({ kind, key, meta: bucket[key] });
        delete bucket[key];
      }
    }
    if (orphans.length) {
      const file = join(root, HISTORY_DIR, "orphan-meta-" + randomUUID() + ".json");
      atomicWriteFileSync(file, JSON.stringify({ format: "memory-orphan-meta-v1", at: new Date().toISOString(), entries: orphans }, null, 2));
      atomicWriteFileSync(join(root, META_FILE), JSON.stringify(meta, null, 2));
    }
    const banners = [];
    for (const entry of entries) {
      if (!entry.meta.archived || hasArchiveBanner(entry.raw)) continue;
      snapshotEntry(root, entry.kind, entry.key);
      commitEntry(root, entry.kind, entry.key, withArchiveBanner(entry.raw, entry.meta.archivedAt || new Date()), entry.meta);
      banners.push({ kind: entry.kind, key: entry.key });
    }
    return { orphan_meta_archived: orphans.map(({ kind, key }) => ({ kind, key })), archive_banners_added: banners };
  });
}
export function readNamespaceIdentity(memDir, namespace) {
  const name = safeNs(namespace), root = nsRoot(memDir, name);
  return { namespace: name, root, ...readJson(join(root, ".namespace.json"), {}) };
}
export function migrateNamespace(memDir, fromNamespace, toNamespace, { workspace } = {}) {
  const from = safeNs(fromNamespace), to = safeNs(toNamespace);
  if (from === to) throw new Error("Source and destination namespace must differ");
  const source = nsRoot(memDir, from), target = nsRoot(memDir, to);
  if (!existsSync(source)) throw new Error("Source namespace does not exist: " + source);
  mkdirSync(target, { recursive: true });
  return withNsWriteLocks([source, target], () => {
    const dataDirs = new Set(["sops", PENDING_DIR, ARCHIVE_DIR, HISTORY_DIR]);
    const contents = readdirSync(target, { withFileTypes: true }).filter(name => name.name !== WRITE_LOCK_FILE && !name.name.startsWith(".write-owner-") && !name.name.startsWith(".write.lock.owner-") && (to !== "default" || !name.isDirectory() || dataDirs.has(name.name)));
    if (contents.length) throw new Error("Destination namespace must be empty: " + target);
    const names = readdirSync(source, { withFileTypes: true }).filter(name => ![WRITE_LOCK_FILE, ".maintenance-agent.lock"].includes(name.name) && !name.name.startsWith(".write-owner-") && !name.name.startsWith(".write.lock.owner-") && !name.name.startsWith(".maintenance-agent.lock.owner-") && (!name.isDirectory() || from !== "default" || dataDirs.has(name.name)));
    for (const name of names) cpSync(join(source, name.name), join(target, name.name), { recursive: name.isDirectory(), errorOnExist: true, force: false });
    const identity = { namespace: to, ...(workspace ? { workspace: canonicalWorkspacePath(workspace) } : {}), migratedFrom: from, migratedAt: new Date().toISOString(), sourcePreserved: true };
    atomicWriteFileSync(join(target, ".namespace.json"), JSON.stringify(identity, null, 2));
    return { from, to, source_preserved: true, root: target, identity };
  });
}
