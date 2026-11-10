import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
	entryIdentity, hashText, listEntryHistory, nsRoot, parseEntryBody, readEntries, readEntry,
	readNamespaceIdentity, resolveNamespace, restoreEntry, safeNs, archiveEntry, withNsWriteLock,
	ensureNamespaceLayout, loadAccess, readMeta, entryHeat, computeNamespaceStats, readRulePreamble,
	HEAT_HALF_LIFE_DAYS, RECENCY_WINDOW_MS,
} from "./store.js";
import { writeMemory } from "./memory-ops.js";
import { syncIndex, indexStats, L1_MAX_CHARS_DEFAULT, GLOBAL_L1_MAX_CHARS_DEFAULT, buildCombinedPromptIndex, ruleLinesLayout, RULES_MIN_RATIO } from "./l1index.js";
import { listNamespaces as discoverNamespaces } from "./search.js";
import {
	scoreEntries, rankEntries, pickColdSet, entryId, recallEntries, recallLine,
	COLD_EXPLORE_MAX, COLD_POOL_START, COLD_EXPLORE_RATIO_DEFAULT,
	RELATED_BONUS_DEFAULT, RELATED_BONUS_CAP_DEFAULT, NEW_ENTRY_DAYS_DEFAULT, NEW_ENTRY_BONUS_DEFAULT,
	RECALL_LIMIT_DEFAULT,
} from "./heat.js";

const LIST_LIMIT_DEFAULT = 200;
const LIST_LIMIT_MAX = 500;
const ENTRY_KINDS = ["rule", "fact", "sop"];
const INJECTION_DISCLAIMER = "按当前空间配置与磁盘内容计算的预览，不是本会话的实际注入；本会话真实注入还取决于会话级热榜轮换与当轮召回。";

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

const PASSTHROUGH_ERROR_MARKERS = ["revision_conflict"];

function fail(action, error) {
	if (error instanceof Error && PASSTHROUGH_ERROR_MARKERS.some(marker => error.message.includes(marker))) return error;
	const message = error instanceof Error ? error.message : String(error);
	return new Error(`${action}失败：${message}`, { cause: error });
}

function relatedList(meta, namespace) {
	if (!Array.isArray(meta?.related)) return [];
	return meta.related
		.filter(relation => relation && relation.kind && relation.key)
		.map(relation => ({ namespace: relation.namespace || namespace, kind: relation.kind, key: relation.key }));
}

/**
 * 同一套热度参数，列表、注入预览、关系图共用，避免各页各算一套。
 */
function heatContext(cfg, root, entries, namespace) {
	const access = loadAccess(root);
	const meta = readMeta(root);
	const heat = cfg.heat || {};
	const scores = scoreEntries(entries, {
		access, meta, heat,
		relatedBonus: cfg.heatRelatedBonus ?? RELATED_BONUS_DEFAULT,
		relatedCap: cfg.heatRelatedCap ?? RELATED_BONUS_CAP_DEFAULT,
		newEntryDays: cfg.heatNewEntryDays ?? NEW_ENTRY_DAYS_DEFAULT,
		newEntryBonus: cfg.heatNewEntryBonus ?? NEW_ENTRY_BONUS_DEFAULT,
	});
	const rank = rankEntries(entries, scores);
	const ordered = entries.filter(entry => !entry.meta?.archived).map(entry => entryId(entry.kind, entry.key))
		.sort((a, b) => (rank.get(a) ?? -Infinity) - (rank.get(b) ?? -Infinity));
	const cold = pickColdSet(ordered, {
		sessionSeed: namespace,
		ratio: cfg.l1ColdExploreRatio ?? COLD_EXPLORE_RATIO_DEFAULT,
	});
	return { access, meta, scores, rank, cold, ordered, heatConfig: cfg.heat };
}

export function createLayeredMemoryStore(cfg) {
	const rootOf = entry => nsRoot(cfg.memoryDir, entry.namespace);
	const maxChars = cfg.l1MaxChars ?? L1_MAX_CHARS_DEFAULT;
	const globalMaxChars = cfg.globalL1MaxChars ?? GLOBAL_L1_MAX_CHARS_DEFAULT;
	const budgetOf = namespace => namespace === "default" ? globalMaxChars : maxChars;
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
				return { namespace: name, ...indexStats(nsRoot(cfg.memoryDir, name), budgetOf(name)) };
			});
		},
		async listEntries({ namespace, kind, query, includeArchived } = {}) {
			return run("读取记忆列表", async () => {
				if (kind !== undefined && !ENTRY_KINDS.includes(kind)) throw new Error("未知的记忆类型");
				const name = safeNs(namespace);
				const root = nsRoot(cfg.memoryDir, name);
				const allEntries = readEntries(root);
				const heat = heatContext(cfg, root, allEntries, name);
				const needle = query === undefined ? null : String(query).toLowerCase();
				const values = allEntries.filter(value => {
					if (kind && value.kind !== kind) return false;
					if (value.meta.archived && !includeArchived) return false;
					return needle === null || `${value.title}\n${value.content}`.toLowerCase().includes(needle);
				}).map(value => entryRow(value, { name, heat }));
				values.sort((a, b) => {
					const aTime = a.updatedAt ? Date.parse(a.updatedAt) : NaN;
					const bTime = b.updatedAt ? Date.parse(b.updatedAt) : NaN;
					const aValid = Number.isFinite(aTime), bValid = Number.isFinite(bTime);
					if (aValid && bValid && aTime !== bTime) return bTime - aTime;
					if (aValid !== bValid) return aValid ? -1 : 1;
					return a.title.localeCompare(b.title);
				});
				return values.slice(0, LIST_LIMIT_MAX);
			});
		},
		/**
		 * 有界分页 + 与过滤无关的库存统计。facets 永远统计整个命名空间的真实磁盘条目，
		 * 不受 kind/query/includeArchived 与单页上限影响。
		 */
		async listEntriesPage({ namespace, kind, query, includeArchived, offset, limit } = {}) {
			return run("读取记忆列表", async () => {
				if (kind !== undefined && !ENTRY_KINDS.includes(kind)) throw new Error("未知的记忆类型");
				const name = safeNs(namespace);
				const root = nsRoot(cfg.memoryDir, name);
				const allEntries = readEntries(root);
				const heat = heatContext(cfg, root, allEntries, name);
				const facets = {
					total: 0,
					active: { rule: 0, fact: 0, sop: 0, total: 0 },
					archived: { rule: 0, fact: 0, sop: 0, total: 0 },
				};
				for (const value of allEntries) {
					const bucket = value.meta.archived ? facets.archived : facets.active;
					bucket[value.kind] = (bucket[value.kind] || 0) + 1;
					bucket.total += 1;
					facets.total += 1;
				}
				const needle = query === undefined ? null : String(query).toLowerCase();
				const matched = allEntries.filter(value => {
					if (kind && value.kind !== kind) return false;
					if (value.meta.archived && !includeArchived) return false;
					return needle === null || `${value.title}\n${value.content}`.toLowerCase().includes(needle);
				});
				const rows = matched.map(value => entryRow(value, { name, heat }));
				rows.sort((a, b) => {
					const aTime = a.updatedAt ? Date.parse(a.updatedAt) : NaN;
					const bTime = b.updatedAt ? Date.parse(b.updatedAt) : NaN;
					const aValid = Number.isFinite(aTime), bValid = Number.isFinite(bTime);
					if (aValid && bValid && aTime !== bTime) return bTime - aTime;
					if (aValid !== bValid) return aValid ? -1 : 1;
					return a.title.localeCompare(b.title);
				});
				const max = Math.min(LIST_LIMIT_MAX, Math.max(1, Math.floor(Number(limit) || LIST_LIMIT_DEFAULT)));
				const start = Math.max(0, Math.floor(Number(offset) || 0));
				const page = rows.slice(start, start + max);
				return {
					namespace: name,
					entries: page,
					facets,
					matched: rows.length,
					returned: page.length,
					truncated: start + page.length < rows.length,
					offset: start,
					limit: max,
				};
			});
		},
		async readEntry({ entry: input }) {
			return run("读取记忆", async () => {
				const entry = entryIdentity(input.namespace, input.kind, input.key);
				const root = rootOf(entry);
				const heat = heatContext(cfg, root, readEntries(root), entry.namespace);
				return entryDetail(root, entry, heat);
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
							: { contentDelta: row.chars - older.chars, evidenceChanged: (older.evidence || "") !== (row.evidence || ""), initial: false },
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
		/**
		 * 注入预览：按空间当前配置与磁盘内容算出「这次提示词会长什么样」。
		 * 它不是某个会话的实际注入——真实注入用会话级热榜轮换与当轮召回，这里如实标注。
		 */
		async getInjectionState({ namespace, query } = {}) {
			return run("获取注入视图", async () => {
				const name = safeNs(namespace);
				const root = nsRoot(cfg.memoryDir, name);
				const budget = budgetOf(name);
				const stats = indexStats(root, budget);
				const targetRatio = cfg.indexTargetRatio ?? 0.9;
				const targetChars = Math.max(0, Math.floor(budget * targetRatio));
				const triggerChars = targetChars + Math.max(80, Math.floor(targetChars * 0.02));
				const coldRatio = cfg.l1ColdExploreRatio ?? COLD_EXPLORE_RATIO_DEFAULT;
				const recallLimit = cfg.recallLimit ?? RECALL_LIMIT_DEFAULT;
				const recallQuery = query === undefined || query === null || String(query).trim() === "" ? null : String(query);

				const views = new Map();
				for (const space of name === "default" ? ["default"] : ["default", name]) {
					const spaceRoot = nsRoot(cfg.memoryDir, space);
					const entries = readEntries(spaceRoot);
					views.set(space, { entries, heat: heatContext(cfg, spaceRoot, entries, space) });
				}

				const combined = buildCombinedPromptIndex(cfg.memoryDir, name, {
					projectMaxChars: maxChars,
					globalMaxChars,
					forNamespace: space => {
						const view = views.get(space);
						if (!view) return {};
						const rows = recallQuery ? recallEntries(view.entries, recallQuery, { limit: recallLimit }) : [];
						const line = recallLine(rows);
						return {
							rank: view.heat.rank,
							cold: view.heat.cold,
							coldRatio,
							...(line ? { recall: { lines: [line], ids: rows.map(row => entryId(row.entry.kind, row.entry.key)) } } : {}),
						};
					},
				});

				const describe = space => {
					const view = views.get(space);
					if (!view) return null;
					const spaceRoot = nsRoot(cfg.memoryDir, space);
					const spaceEntries = view.entries;
					const spaceHeat = view.heat;
					const spaceActive = spaceEntries.filter(entry => !entry.meta?.archived);
					const section = (combined.sections || []).find(item => item.namespace === space) || null;
					const selection = section?.selection || null;
					const includedFacts = new Map((selection?.facts || []).map(row => [row.id, row.line]));
					const includedSops = new Map((selection?.sops || []).map(row => [row.id, row.line]));
					const recallLines = new Map((selection?.recall || []).map(row => [row.id, row.line]));

					// 规则区逐条归属：索引里的规则块必须与当前规则正文一致，否则不猜。
					const ruleEntries = spaceActive.filter(entry => entry.kind === "rule");
					const layout = ruleLinesLayout(readRulePreamble(spaceRoot), ruleEntries.map(entry => entry.content));
					const rulesAttributable = Boolean(selection?.rules) && selection.rules.blob === layout.text;
					const keptRuleLines = new Set(rulesAttributable ? selection.rules.kept : []);
					const rulePromptLine = rulesAttributable ? selection.rules.lines : {};
					const ruleRangeByKey = new Map(ruleEntries.map((entry, index) => [entry.key, layout.ranges[index]]));

					const items = spaceActive.map(value => {
						const id = entryId(value.kind, value.key);
						const score = spaceHeat.scores.get(id)?.score ?? entryHeat(spaceHeat.access, spaceHeat.meta, value.kind, value.key, cfg.heat);
						const rank = spaceHeat.rank.has(id) ? spaceHeat.rank.get(id) + 1 : null;
						const related = relatedList(value.meta, space);
						let status = "omitted";
						let included = false;
						let promptLevel = null;
						let promptToken = null;
						let promptNamespace = null;
						let promptLine = null;

						if (value.kind === "rule") {
							const range = ruleRangeByKey.get(value.key);
							if (!rulesAttributable || !range) {
								status = "unknown";
							} else {
								let kept = 0;
								for (let line = range.start; line <= range.end; line++) if (keptRuleLines.has(line)) kept += 1;
								const total = range.end - range.start + 1;
								if (kept === 0) status = "omitted";
								else if (kept < total) { status = "partial"; included = true; promptLevel = "body"; }
								else { status = "rule"; included = true; promptLevel = "body"; }
								if (included) promptLine = rulePromptLine[range.start] ?? null;
							}
						} else {
							const line = value.kind === "fact" ? includedFacts.get(id) : includedSops.get(id);
							if (line !== undefined) {
								included = true;
								promptLevel = "title";
								promptToken = value.key;
								promptNamespace = space;
								promptLine = line ?? null;
								status = spaceHeat.cold.has(id) ? "cold" : "included";
							} else if (recallLines.has(id)) {
								included = true;
								promptLevel = "title";
								promptToken = value.key;
								promptNamespace = space;
								promptLine = recallLines.get(id) ?? null;
								status = "recall";
							}
						}

						return {
							kind: value.kind,
							key: value.key,
							title: value.title,
							chars: value.content.length,
							heat: Number(score.toFixed(2)),
							rank,
							status,
							included,
							promptLevel,
							promptToken,
							promptNamespace,
							promptLine,
							relatedCount: related.length,
							related,
						};
					});

					const counts = {
						total: spaceEntries.length,
						active: spaceActive.length,
						archived: spaceEntries.length - spaceActive.length,
						rule: spaceActive.filter(entry => entry.kind === "rule").length,
						fact: spaceActive.filter(entry => entry.kind === "fact").length,
						sop: spaceActive.filter(entry => entry.kind === "sop").length,
					};
					return {
						namespace: space,
						items,
						counts,
						rulesAttributable,
						coldRatioApplied: selection?.mode === "trimmed",
						includedCount: items.filter(item => item.included).length,
						omittedCount: items.filter(item => item.status === "omitted" || item.status === "unknown").length,
						partialCount: items.filter(item => item.status === "partial").length,
						coldCount: spaceHeat.cold.size,
						coldIncludedCount: items.filter(item => item.status === "cold" && item.included).length,
						rankedCount: spaceHeat.rank.size,
						recallCount: (selection?.recall || []).length,
					};
				};

				const own = describe(name);
				const spaces = [...views.keys()].map(describe).filter(Boolean);
				const counts = own ? own.counts : { total: 0, active: 0, archived: 0, rule: 0, fact: 0, sop: 0 };

				return {
					namespace: name,
					preview: true,
					previewKind: "namespace-config-preview",
					disclaimer: INJECTION_DISCLAIMER,
					sessionTracked: false,
					basis: {
						heatHalfLifeDays: cfg.heat?.halfLifeDays ?? HEAT_HALF_LIFE_DAYS,
						heatRecencyWindowDays: cfg.heat?.recencyWindowMs ? cfg.heat.recencyWindowMs / 86400000 : RECENCY_WINDOW_MS / 86400000,
						relatedBonus: cfg.heatRelatedBonus ?? RELATED_BONUS_DEFAULT,
						relatedCap: cfg.heatRelatedCap ?? RELATED_BONUS_CAP_DEFAULT,
						newEntryDays: cfg.heatNewEntryDays ?? NEW_ENTRY_DAYS_DEFAULT,
						newEntryBonus: cfg.heatNewEntryBonus ?? NEW_ENTRY_BONUS_DEFAULT,
						rulesMinRatio: RULES_MIN_RATIO,
						coldRatio,
						coldMax: COLD_EXPLORE_MAX,
						coldPoolStart: COLD_POOL_START,
						coldSeedScope: "namespace",
						recallQuery,
						recallLimit,
						indexTargetRatio: targetRatio,
						rulesAttributed: own?.rulesAttributable ?? false,
						coldRatioApplied: own?.coldRatioApplied ?? false,
					},
					combinedText: combined.text,
					sections: (combined.sections || []).map(item => {
						const described = spaces.find(space => space.namespace === item.namespace);
						return {
							namespace: item.namespace,
							text: item.text,
							totalChars: item.totalChars,
							shownChars: item.shownChars,
							maxChars: item.maxChars,
							overLimit: item.overLimit,
							entryCount: described?.counts.active ?? 0,
							includedCount: described?.includedCount ?? 0,
							omittedCount: described?.omittedCount ?? 0,
							coldRatioApplied: described?.coldRatioApplied ?? false,
						};
					}),
					budgetChars: budget,
					indexChars: stats.indexChars,
					targetChars,
					triggerChars,
					counts,
					coldCount: own?.coldCount ?? 0,
					coldIncludedCount: own?.coldIncludedCount ?? 0,
					rankedCount: own?.rankedCount ?? 0,
					includedCount: own?.includedCount ?? 0,
					omittedCount: own?.omittedCount ?? 0,
					partialCount: own?.partialCount ?? 0,
					recallCount: own?.recallCount ?? 0,
					combinedIncludedCount: spaces.reduce((sum, space) => sum + space.includedCount, 0),
					items: own?.items ?? [],
				};
			});
		},


		async getMaintenanceReport({ namespace } = {}) {
			return run("获取维护报告", async () => {
				const name = safeNs(namespace);
				const root = nsRoot(cfg.memoryDir, name);
				const entries = readEntries(root);
				const active = entries.filter(entry => !entry.meta?.archived);
				const access = loadAccess(root);
				const meta = readMeta(root);
				const heat = heatContext(cfg, root, entries, name);
				const activeIds = new Set(active.map(entry => entryId(entry.kind, entry.key)));
				const archivedIds = new Set(entries.filter(entry => entry.meta?.archived).map(entry => entryId(entry.kind, entry.key)));

				let reportData = { actionable: { counts: {} }, dedupe: { nearDuplicates: [] }, mergeCandidates: [], cold: [], review: [] };
				const reportFile = join(root, "maintenance-report.json");
				if (existsSync(reportFile)) {
					let raw;
					try {
						raw = readFileSync(reportFile, "utf8");
					} catch (error) {
						if (error.code !== "ENOENT") throw new Error(`读取维护报告失败：${error.message}`);
					}
					if (raw !== undefined) {
						try {
							reportData = JSON.parse(raw);
						} catch (error) {
							throw new Error(`维护报告解析失败：${error.message}`);
						}
						if (!reportData || typeof reportData !== "object" || Array.isArray(reportData)) throw new Error("维护报告格式不正确");
					}
				}

				// 关系图数据：只保留两端都真实存在的边，缺失目标单独列出。
				const degreeMap = new Map();
				const edges = [];
				const edgeKeys = new Set();
				const skipped = [];

				const addEdge = (source, target, type, extra = {}) => {
					if (!source || !target || source === target) return;
					const key = `${source}->${target}:${type}`;
					if (edgeKeys.has(key)) return;
					edgeKeys.add(key);
					edges.push({ source, target, type, sourceNamespace: name, targetNamespace: name, ...extra });
					degreeMap.set(source, (degreeMap.get(source) || 0) + 1);
					degreeMap.set(target, (degreeMap.get(target) || 0) + 1);
				};
				const skipEdge = (source, target, type, reason) => skipped.push({ source, target, type, reason });

				// (a) meta.related 显式关联边：related 带命名空间，跨空间不硬接到本空间。
				for (const entry of active) {
					const sourceId = entryId(entry.kind, entry.key);
					for (const relation of entry.meta?.related || []) {
						if (!relation || !relation.kind || !relation.key) continue;
						const relationNamespace = relation.namespace || name;
						if (relationNamespace !== name) {
							skipEdge(sourceId, `${relationNamespace}:${entryId(relation.kind, relation.key)}`, "related", "cross-namespace");
							continue;
						}
						const targetId = entryId(relation.kind, relation.key);
						if (!activeIds.has(targetId)) {
							skipEdge(sourceId, targetId, "related", archivedIds.has(targetId) ? "archived-target" : "missing-target");
							continue;
						}
						addEdge(sourceId, targetId, "related");
					}
				}

				// (b) 相似边：报告行是 { kind, a: key 字符串, b: key 字符串, similarity }。
				const sideOf = (side, fallbackKind) => {
					if (typeof side === "string" && side) return { kind: fallbackKind, key: side };
					if (side && typeof side === "object" && side.key) return { kind: side.kind || side.entryType || fallbackKind, key: side.key };
					return null;
				};
				const addSimilar = row => {
					if (!row) return;
					const left = sideOf(row.a, row.kind);
					const right = sideOf(row.b, row.kind);
					if (!left || !right) return;
					const sourceId = entryId(left.kind, left.key);
					const targetId = entryId(right.kind, right.key);
					if (!activeIds.has(sourceId) || !activeIds.has(targetId)) {
						skipEdge(sourceId, targetId, "similar", archivedIds.has(sourceId) || archivedIds.has(targetId) ? "archived-target" : "missing-target");
						return;
					}
					addEdge(sourceId, targetId, "similar", { similarity: row.similarity ?? row.score ?? null });
				};
				for (const row of reportData.dedupe?.nearDuplicates || []) addSimilar(row);
				for (const row of reportData.mergeCandidates || []) addSimilar(row);

				const nodes = active.map(entry => {
					const id = entryId(entry.kind, entry.key);
					const score = heat.scores.get(id)?.score ?? entryHeat(access, meta, entry.kind, entry.key, cfg.heat);
					return {
						id,
						namespace: name,
						kind: entry.kind,
						key: entry.key,
						title: entry.title,
						heat: Number(score.toFixed(2)),
						chars: entry.content.length,
						degree: degreeMap.get(id) || 0,
					};
				});

				return {
					...reportData,
					graph: { nodes, edges, nodeCount: nodes.length, edgeCount: edges.length, skipped },
				};
			});
		},







	};
}

function entryDetail(root, entry, heat) {
	const value = readEntry(root, entry.kind, entry.key);
	if (!value) throw new Error(`记忆不存在：${entry.namespace}/${entry.kind}/${entry.key}`);
	const id = entryId(entry.kind, entry.key);
	const score = heat.scores.get(id)?.score ?? entryHeat(heat.access, heat.meta, entry.kind, entry.key, heat.heatConfig);
	const access = heat.access;
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
		heat: Number(score.toFixed(2)),
		accessCount: Number(access[id]?.count || 0),
		lastAt: access[id]?.lastAt || null,
		related: relatedList(value.meta, entry.namespace),
		sourceSeqs: Array.isArray(value.meta.sourceSeqs) ? value.meta.sourceSeqs : [],
	};
}

function entryRow(value, { name, heat }) {
	const id = entryId(value.kind, value.key);
	const rawSummary = String(value.content || "").split(/\r?\n/).map(line => line.trim()).find(line => line !== "") || "";
	const summary = rawSummary.replace(/^[#> \-*`~]+\s*/, "").slice(0, 90);
	const related = relatedList(value.meta, name);
	const injectionStatus = value.meta.archived
		? "archived"
		: value.kind === "rule"
			? "rule"
			: heat.cold.has(id)
				? "cold"
				: "hot";
	return {
		entry: { namespace: name, kind: value.kind, key: value.key },
		title: value.title,
		archived: Boolean(value.meta.archived),
		updatedAt: textOrNull(value.meta.updatedAt),
		chars: value.content.length,
		heat: Number((heat.scores.get(id)?.score ?? entryHeat(heat.access, heat.meta, value.kind, value.key, heat.heatConfig)).toFixed(2)),
		accessCount: Number(heat.access[id]?.count || 0),
		lastAt: heat.access[id]?.lastAt || null,
		related,
		relatedCount: related.length,
		summary,
		rank: heat.rank.has(id) ? heat.rank.get(id) + 1 : null,
		injectionStatus,
	};
}
