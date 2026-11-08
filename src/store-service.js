import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
	entryIdentity, hashText, listEntryHistory, nsRoot, parseEntryBody, readEntries, readEntry,
	readNamespaceIdentity, resolveNamespace, restoreEntry, safeNs, archiveEntry, withNsWriteLock,
	ensureNamespaceLayout, loadAccess, readMeta, entryHeat, computeNamespaceStats,
} from "./store.js";
import { writeMemory } from "./memory-ops.js";
import { syncIndex, indexStats, L1_MAX_CHARS_DEFAULT, GLOBAL_L1_MAX_CHARS_DEFAULT, buildCombinedPromptIndex } from "./l1index.js";
import { listNamespaces as discoverNamespaces } from "./search.js";
import { scoreEntries, rankEntries, pickColdSet, entryId } from "./heat.js";

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
				const root = nsRoot(cfg.memoryDir, name);
				const allEntries = readEntries(root);
				const access = loadAccess(root);
				const meta = readMeta(root);
				const scores = scoreEntries(allEntries, { access, meta });
				const rank = rankEntries(allEntries, scores);
				const cold = pickColdSet([...rank.keys()], { sessionSeed: name });

				const needle = query === undefined ? null : String(query).toLowerCase();
				const values = allEntries.filter(value => {
					if (kind && value.kind !== kind) return false;
					if (value.meta.archived && !includeArchived) return false;
					return needle === null || `${value.title}\n${value.content}`.toLowerCase().includes(needle);
				}).map(value => {
					const id = entryId(value.kind, value.key);
					const rawSummary = String(value.content || "").split(/\r?\n/).map(line => line.trim()).find(line => line !== "") || "";
					const summary = rawSummary.replace(/^[#> \-*`~]+\s*/, "").slice(0, 90);
					const related = Array.isArray(value.meta.related)
						? value.meta.related.filter(r => r && r.kind && r.key).map(r => ({ kind: r.kind, key: r.key }))
						: [];
					const injectionStatus = value.meta.archived
						? "archived"
						: value.kind === "rule"
							? "rule"
							: cold.has(id)
								? "cold"
								: "hot";

					return {
						entry: { namespace: name, kind: value.kind, key: value.key },
						title: value.title,
						archived: Boolean(value.meta.archived),
						updatedAt: textOrNull(value.meta.updatedAt),
						chars: value.content.length,
						heat: Number((scores.get(id)?.score ?? entryHeat(access, meta, value.kind, value.key)).toFixed(2)),
						accessCount: Number(access[id]?.count || 0),
						lastAt: access[id]?.lastAt || null,
						related,
						relatedCount: related.length,
						summary,
						rank: rank.has(id) ? rank.get(id) + 1 : null,
						injectionStatus,
					};
				});
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
				const root = rootOf(entry);
				const value = requiredEntry(root, entry);
				const access = loadAccess(root);
				const meta = readMeta(root);
				const id = entryId(entry.kind, entry.key);
				const heat = Number(entryHeat(access, meta, entry.kind, entry.key).toFixed(2));
				const accessCount = Number(access[id]?.count || 0);
				const lastAt = access[id]?.lastAt || null;
				const related = Array.isArray(value.meta.related)
					? value.meta.related.filter(r => r && r.kind && r.key).map(r => ({ kind: r.kind, key: r.key }))
					: [];
				const sourceSeqs = Array.isArray(value.meta.sourceSeqs) ? value.meta.sourceSeqs : [];

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
					heat,
					accessCount,
					lastAt,
					related,
					sourceSeqs,
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
		async getInjectionState({ namespace } = {}) {
			return run("获取注入视图", async () => {
				const name = safeNs(namespace);
				const root = nsRoot(cfg.memoryDir, name);
				const allEntries = readEntries(root);
				const access = loadAccess(root);
				const meta = readMeta(root);
				const scores = scoreEntries(allEntries, { access, meta });
				const rank = rankEntries(allEntries, scores);
				const cold = pickColdSet([...rank.keys()], { sessionSeed: name });

				const budget = name === "default" ? (cfg.globalL1MaxChars ?? GLOBAL_L1_MAX_CHARS_DEFAULT) : maxChars;
				const stats = indexStats(root, budget);
				const targetChars = Math.floor(budget * 0.9);
				const triggerChars = Math.floor(targetChars * 1.02);

				const combined = buildCombinedPromptIndex(cfg.memoryDir, name, {
					projectMaxChars: maxChars,
					globalMaxChars: cfg.globalL1MaxChars ?? GLOBAL_L1_MAX_CHARS_DEFAULT,
					forNamespace: ns => ns === name ? { rank, cold } : {},
				});

				const active = allEntries.filter(e => !e.meta?.archived);
				const currentSection = (combined.sections || []).find(s => s.namespace === name);
				const sectionText = currentSection ? currentSection.text : "";

				const items = active.map(value => {
					const id = entryId(value.kind, value.key);
					const rPos = rank.has(id) ? rank.get(id) + 1 : null;
					const h = Number((scores.get(id)?.score ?? entryHeat(access, meta, value.kind, value.key)).toFixed(2));
					const relatedCount = Array.isArray(value.meta.related) ? value.meta.related.length : 0;

					let status = "omitted";
					if (value.kind === "rule") {
						status = "rule";
					} else {
						// 检查是否进入 sectionText
						// 提示词中的规则/事实/经验行通常包含条目 key 或特征字符串
						const inText = sectionText.includes(value.key);
						if (inText) {
							status = cold.has(id) ? "cold" : "included";
						} else {
							status = "omitted";
						}
					}

					return {
						kind: value.kind,
						key: value.key,
						title: value.title,
						chars: value.content.length,
						heat: h,
						rank: rPos,
						status,
						relatedCount,
					};
				});

				const includedCount = items.filter(i => i.status === "included" || i.status === "cold" || i.status === "rule").length;
				const omittedCount = items.filter(i => i.status === "omitted").length;

				return {
					namespace: name,
					combinedText: combined.text,
					sections: combined.sections,
					budgetChars: budget,
					indexChars: stats.indexChars,
					targetChars,
					triggerChars,
					coldCount: cold.size,
					rankedCount: rank.size,
					omittedCount,
					includedCount,
					items,
				};
			});
		},
		async getDiskMetrics({ namespace } = {}) {
			return run("获取磁盘指标", async () => {
				const name = safeNs(namespace);
				const root = nsRoot(cfg.memoryDir, name);
				const entries = readEntries(root);
				const budget = name === "default" ? (cfg.globalL1MaxChars ?? GLOBAL_L1_MAX_CHARS_DEFAULT) : maxChars;
				return {
					namespace: name,
					...computeNamespaceStats(root, entries),
					...indexStats(root, budget),
				};
			});
		},
		async getMaintenanceReport({ namespace } = {}) {
			return run("获取维护报告", async () => {
				const name = safeNs(namespace);
				const root = nsRoot(cfg.memoryDir, name);
				const entries = readEntries(root);
				const active = entries.filter(e => !e.meta?.archived);
				const access = loadAccess(root);
				const meta = readMeta(root);

				let reportData = { actionable: { counts: {} }, dedupe: { nearDuplicates: [] }, mergeCandidates: [], cold: [], review: [] };
				const reportFile = join(root, "maintenance-report.json");
				if (existsSync(reportFile)) {
					try {
						reportData = JSON.parse(readFileSync(reportFile, "utf8"));
					} catch {
						// ignore error and use default
					}
				}

				// 构建完整关系图数据 graph: { nodes, edges }
				const degreeMap = new Map();
				const edges = [];
				const edgeKeys = new Set();

				const addEdge = (source, target, type, extra = {}) => {
					if (!source || !target || source === target) return;
					const key = `${source}->${target}:${type}`;
					if (edgeKeys.has(key)) return;
					edgeKeys.add(key);
					edges.push({ source, target, type, ...extra });
					degreeMap.set(source, (degreeMap.get(source) || 0) + 1);
					degreeMap.set(target, (degreeMap.get(target) || 0) + 1);
				};

				// (a) meta.related 显式关联边
				for (const entry of active) {
					const sId = entryId(entry.kind, entry.key);
					for (const rel of entry.meta?.related || []) {
						if (!rel || !rel.kind || !rel.key) continue;
						const tId = entryId(rel.kind, rel.key);
						addEdge(sId, tId, "related");
					}
				}

				// (b) nearDuplicates 和 mergeCandidates 相似边
				for (const dupe of reportData.dedupe?.nearDuplicates || []) {
					if (dupe.a && dupe.b) {
						const sId = entryId(dupe.a.kind || dupe.a.entryType, dupe.a.key);
						const tId = entryId(dupe.b.kind || dupe.b.entryType, dupe.b.key);
						addEdge(sId, tId, "similar", { similarity: dupe.similarity ?? dupe.score ?? null });
					}
				}
				for (const cand of reportData.mergeCandidates || []) {
					if (cand.a && cand.b) {
						const sId = entryId(cand.a.kind || cand.a.entryType, cand.a.key);
						const tId = entryId(cand.b.kind || cand.b.entryType, cand.b.key);
						addEdge(sId, tId, "similar", { similarity: cand.similarity ?? cand.score ?? null });
					}
				}

				const nodes = active.map(entry => {
					const id = entryId(entry.kind, entry.key);
					const heat = Number(entryHeat(access, meta, entry.kind, entry.key).toFixed(2));
					return {
						id,
						kind: entry.kind,
						key: entry.key,
						title: entry.title,
						heat,
						chars: entry.content.length,
						degree: degreeMap.get(id) || 0,
					};
				});

				return {
					...reportData,
					graph: { nodes, edges },
				};
			});
		},
	};
}
