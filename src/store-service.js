import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
	entryIdentity, hashText, listEntryHistory, nsRoot, parseEntryBody, readEntries, readEntry,
	readNamespaceIdentity, resolveNamespace, restoreEntry, safeNs, archiveEntry, withNsWriteLock,
	ensureNamespaceLayout,
} from "./store.js";
import { writeMemory } from "./memory-ops.js";
import { syncIndex, indexStats, L1_MAX_CHARS_DEFAULT, GLOBAL_L1_MAX_CHARS_DEFAULT } from "./l1index.js";
import { listNamespaces as discoverNamespaces } from "./search.js";

function textOrNull(value) {
	return typeof value === "string" && value ? value : null;
}

function requiredEntry(root, entry) {
	const value = readEntry(root, entry.kind, entry.key);
	if (!value) throw new Error(`记忆不存在：${entry.namespace}/${entry.kind}/${entry.key}`);
	return value;
}

function snapshotRevision(kind, key, raw, meta = {}) {
	const semantic = {
		evidence: meta.evidence || "",
		related: meta.related || [],
		archived: Boolean(meta.archived),
		replacedBy: meta.replacedBy || null,
	};
	return hashText(JSON.stringify([kind, key, raw, semantic]));
}

function snapshotDetails(root, record) {
	const path = join(root, record.path);
	if (!record.legacy) {
		const snapshot = JSON.parse(readFileSync(path, "utf8"));
		const parsed = parseEntryBody(record.kind, record.key, snapshot.raw);
		return {
			revision: snapshotRevision(record.kind, record.key, snapshot.raw, snapshot.meta),
			chars: parsed.content.length,
			content: parsed.content,
			evidence: snapshot.meta?.evidence || "",
		};
	}
	const file = readFileSync(path, "utf8");
	const heading = file.match(/^#{1,2}\s+(.+)(?:\r?\n|$)/);
	if (!heading) throw new Error("历史快照缺少标题");
	const raw = record.kind === "fact" || record.kind === "rule" ? file.slice(heading[0].length).trim() : file;
	let meta = {};
	try {
		const sidecar = JSON.parse(readFileSync(path.replace(/\.md$/, ".meta.json"), "utf8"));
		if (!sidecar?.missing) meta = sidecar || {};
	} catch (error) {
		if (error.code !== "ENOENT") throw error;
	}
	const parsed = parseEntryBody(record.kind, record.key, raw);
	return {
		revision: snapshotRevision(record.kind, record.key, raw, meta),
		chars: parsed.content.length,
		content: parsed.content,
		evidence: meta.evidence || "",
	};
}

function fail(action, error) {
	if (error instanceof Error && error.message.includes("revision_conflict")) return error;
	const message = error instanceof Error ? error.message : String(error);
	return new Error(`${action}失败：${message}`, { cause: error });
}

export function createLayeredMemoryStore(cfg) {
	const rootOf = entry => nsRoot(cfg.memoryDir, entry.namespace);
	const maxChars = cfg.l1MaxChars ?? L1_MAX_CHARS_DEFAULT;
	const run = async (action, operation) => {
		try { return await operation(); }
		catch (error) { throw fail(action, error); }
	};
	return {
		async listNamespaces() {
			return run("读取命名空间", async () => {
				const current = resolveNamespace(cfg, undefined);
				const names = new Set(discoverNamespaces(cfg.memoryDir));
				names.add(current);
				const ordered = [...names].sort((a, b) => {
					if (a === current) return -1;
					if (b === current) return 1;
					if (a === "default") return -1;
					if (b === "default") return 1;
					return a.localeCompare(b);
				});
				return ordered.map(namespace => ({
					namespace,
					workspace: textOrNull(readNamespaceIdentity(cfg.memoryDir, namespace).workspace),
				}));
			});
		},
		async namespaceStats({ namespace } = {}) {
			return run("读取索引占用", async () => {
				const name = safeNs(namespace);
				const budget = name === "default" ? (cfg.globalL1MaxChars ?? GLOBAL_L1_MAX_CHARS_DEFAULT) : maxChars;
				return { namespace: name, ...indexStats(nsRoot(cfg.memoryDir, name), budget) };
			});
		},
		async listEntries({ namespace, kind, query, includeArchived } = {}) {
			return run("读取记忆列表", async () => {
				if (kind !== undefined && !["rule", "fact", "sop"].includes(kind)) throw new Error("未知的记忆类型");
				const name = safeNs(namespace);
				const needle = query === undefined ? null : String(query).toLowerCase();
				const values = readEntries(nsRoot(cfg.memoryDir, name)).filter(value => {
					if (kind && value.kind !== kind) return false;
					if (value.meta.archived && !includeArchived) return false;
					return needle === null || `${value.title}\n${value.content}`.toLowerCase().includes(needle);
				}).map(value => ({
					entry: { namespace: name, kind: value.kind, key: value.key },
					title: value.title,
					archived: Boolean(value.meta.archived),
					updatedAt: textOrNull(value.meta.updatedAt),
					chars: value.content.length,
				}));
				values.sort((a, b) => {
					const aTime = a.updatedAt ? Date.parse(a.updatedAt) : NaN;
					const bTime = b.updatedAt ? Date.parse(b.updatedAt) : NaN;
					const aValid = Number.isFinite(aTime), bValid = Number.isFinite(bTime);
					if (aValid && bValid && aTime !== bTime) return bTime - aTime;
					if (aValid !== bValid) return aValid ? -1 : 1;
					return a.title.localeCompare(b.title);
				});
				return values.slice(0, 500);
			});
		},
		async readEntry({ entry: input }) {
			return run("读取记忆", async () => {
				const entry = entryIdentity(input.namespace, input.kind, input.key);
				const value = requiredEntry(rootOf(entry), entry);
				return {
					entry,
					title: value.title,
					content: value.content,
					revision: value.revision,
					archived: Boolean(value.meta.archived),
					evidence: typeof value.meta.evidence === "string" ? value.meta.evidence : "",
					sourceSession: textOrNull(value.meta.sourceSession),
					createdAt: textOrNull(value.meta.createdAt),
					updatedAt: textOrNull(value.meta.updatedAt),
				};
			});
		},
		async createEntry({ namespace, kind, topic, content, evidence }) {
			return run("创建记忆", async () => {
				const name = safeNs(namespace), root = nsRoot(cfg.memoryDir, name);
				return withNsWriteLock(root, () => {
					ensureNamespaceLayout(root);
					const stored = writeMemory(root, {
						mode: "create", topic, entryType: kind, content, evidence, namespace: name,
						sourceSession: null, sourceSeqs: [], preserveSource: false, maxChars,
					});
					return { entry: entryIdentity(name, kind, stored.key), revision: stored.entry.revision };
				});
			});
		},
		async updateEntry({ entry: input, content, evidence, ifRevision }) {
			return run("更新记忆", async () => {
				const entry = entryIdentity(input.namespace, input.kind, input.key), root = rootOf(entry);
				return withNsWriteLock(root, () => {
					const before = requiredEntry(root, entry);
					if (ifRevision !== undefined && before.revision !== ifRevision) throw new Error("revision_conflict：条目已变化，请重新读取后更新");
					const preserveSource = evidence === undefined;
					const stored = writeMemory(root, {
						mode: "update", key: entry.key, entryType: entry.kind, content,
						evidence: preserveSource ? before.meta.evidence : evidence, namespace: entry.namespace,
						sourceSession: null, sourceSeqs: [], preserveSource, maxChars,
					});
					return { revision: stored.entry.revision };
				});
			});
		},
		async setArchived({ entry: input, archived }) {
			return run(archived ? "归档记忆" : "恢复记忆", async () => {
				const entry = entryIdentity(input.namespace, input.kind, input.key), root = rootOf(entry);
				return withNsWriteLock(root, () => {
					requiredEntry(root, entry);
					archiveEntry(root, entry.kind, entry.key, { unarchive: !archived });
					syncIndex(root, maxChars);
					return { ok: true };
				});
			});
		},
		async entryHistory({ entry: input }) {
			return run("读取历史快照", async () => {
				const entry = entryIdentity(input.namespace, input.kind, input.key), root = rootOf(entry);
				const rows = listEntryHistory(root, entry.kind, entry.key).reverse().slice(0, 50).map(record => ({
					snapshotId: record.id,
					createdAt: record.createdAt,
					...snapshotDetails(root, record),
				}));
				return rows.map((row, index) => {
					const older = rows[index + 1];
					const firstLine = String(row.content || "").split(/\r?\n/).map(line => line.trim()).find(line => line !== "") || "";
					return {
						snapshotId: row.snapshotId,
						createdAt: row.createdAt,
						revision: row.revision,
						chars: row.chars,
						summary: firstLine.slice(0, 60),
						preview: String(row.content || "").slice(0, 2000),
						change: older === undefined
							? { contentDelta: null, evidenceChanged: false, initial: true }
							: { contentDelta: row.chars - older.chars, evidenceChanged: (row.evidence || "") !== (older.evidence || ""), initial: false },
					};
				});
			});
		},
		async rollbackEntry({ entry: input, snapshotId }) {
			return run("回滚记忆", async () => {
				const entry = entryIdentity(input.namespace, input.kind, input.key), root = rootOf(entry);
				return withNsWriteLock(root, () => {
					const restored = restoreEntry(root, entry.kind, entry.key, snapshotId);
					if (!restored.restored) throw new Error("未找到属于此记忆的历史快照");
					syncIndex(root, maxChars);
					return { revision: restored.entry.revision };
				});
			});
		},
	};
}
