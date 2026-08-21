// 全部记忆工具定义。工厂函数 buildTools(ctx, cfg) 返回工具定义数组。
// [v0.5] 新增 memory_search（BM25 全文检索）/ memory_promote（跨命名空间提升）；
// memory_write/update 支持 related 关联链接；memory_read 回显关联指针。

import { existsSync, readFileSync, readdirSync, writeFileSync, copyFileSync, rmSync } from "node:fs";
import { join, basename } from "node:path";
import { defineTool as defineToolRaw } from "@deepseek-ai/dsh-tools";
import {
	PENDING_DIR,
	ARCHIVE_DIR,
	HISTORY_DIR,
	safeNs,
	nsRoot,
	resolveNamespace,
	ensureNamespaceLayout,
	slugify,
	factSections,
	sopNames,
	pendingNames,
	readMeta,
	getEntryMeta,
	setEntryMeta,
	isArchived,
	isSafeMemName,
	readFact,
	readSop,
	upsertFact,
	bumpAccess,
	computeNamespaceStats,
} from "./store.js";
import { readIndex, syncIndex } from "./l1index.js";
import { writeMemory, readPending, parsePending } from "./memory-ops.js";
import { runMaintain } from "./maintain.js";
import { listNamespaces, searchNamespaces } from "./search.js";

const EMPTY_META = { sourceSession: "", sourceSeqs: [], evidence: "", archived: false, createdAt: "", updatedAt: "" };

/**
 * 递归剥离 undefined 值的键。宿主对工具结果有两条硬校验：可无损 JSON 往返
 * （显式 undefined 键会被 JSON.stringify 丢弃 → 整个结果判死）与 output schema
 * 声明一致性。纯文本记忆系统的可用性优先：在出口统一消毒，任何工具返回值
 * 都不再可能因单个字段翻车被整包拒收。
 */
function pruneUndefined(value) {
	if (Array.isArray(value)) return value.map(pruneUndefined);
	if (value !== null && typeof value === "object") {
		const out = {};
		for (const [k, v] of Object.entries(value)) if (v !== undefined) out[k] = pruneUndefined(v);
		return out;
	}
	return value;
}

/** 出口消毒版 defineTool：execute 结果先过 pruneUndefined 再交还宿主。 */
const defineTool = (def) => defineToolRaw({
	...def,
	async execute(...args) {
		return pruneUndefined(await def.execute(...args));
	},
});

function normalizeMeta(m) {
	return {
		sourceSession: m?.sourceSession || "",
		sourceSeqs: m?.sourceSeqs || [],
		evidence: m?.evidence || "",
		archived: Boolean(m?.archived),
		createdAt: m?.createdAt || "",
		updatedAt: m?.updatedAt || "",
		...(Array.isArray(m?.related) && m.related.length ? { related: m.related } : {}),
	};
}

/** 解析关联指针的存在状态，供 memory_read 回显。 */
function resolveRelated(root, related) {
	if (!Array.isArray(related) || related.length === 0) return [];
	return related.map((name) => {
		const key = String(name).trim();
		let state = "missing";
		if (existsSync(join(root, "sops", `${slugify(key)}.md`)) || readFact(root, key) !== null) {
			state = isArchived(root, "sop", slugify(key)) || isArchived(root, "fact", key) ? "archived" : "active";
		}
		return { name: key, state };
	});
}

export function buildTools(ctx, cfg) {
	const readTool = defineTool({
		name: "memory_read",
		description: "读取记忆内容：支持 L1 索引全文（name=index）、L2 事实条目（name=<topic>，匹配 facts.md 的 ## section）、L3 SOP（name=<sop文件名>，匹配 sops/<name>.md）。可选 namespace 隔离项目。返回内容与来源路径及溯源信息（含 related 关联指针）。",
		parameters: {
			name: {
				type: "string",
				required: true,
				description: "记忆名称：index / facts 的 section 主题 / sop 文件名（不带 .md）"
			},
			namespace: {
				type: "string",
				description: "命名空间（默认取 workspace/git 分支或配置 defaultNamespace）"
			}
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					name: { type: "string", required: true },
					source: { type: "string", required: true },
					content: { type: "string", required: true },
					namespace: { type: "string", required: true },
					meta: {
						type: "object",
						additionalProperties: true,
						properties: {
							sourceSession: { type: "string" },
							sourceSeqs: { type: "array", items: { type: "integer" } },
							evidence: { type: "string" },
							archived: { type: "boolean" },
							createdAt: { type: "string" },
							updatedAt: { type: "string" },
							related: { type: "array", items: { type: "string" } }
						}
					},
					not_found: { type: "boolean" }
				}
			},
			render: (_args, value) => [{
				type: "text",
				text: value.not_found
					? `记忆「${value.name}」未找到（可用 memory_list 查看全部，或用 memory_search 全文检索）`
					: `记忆「${value.name}」（来源: ${value.source}, namespace: ${value.namespace}${value.meta?.archived ? ", 已归档" : ""}）：\n\n${value.content}${formatRelated(value.meta?.related)}`
			}]
		},
		async execute(args) {
			const key = String(args.name).trim();
			const ns = resolveNamespace(cfg, args.namespace);
			const root = nsRoot(cfg.memoryDir, ns);
			ensureNamespaceLayout(root);
			if (!isSafeMemName(key)) {
				throw new Error(`memory_read: 非法名称（不允许路径穿越/绝对路径）: ${key}`);
			}
			const lower = key.toLowerCase();
			if (lower === "index" || lower === "l1" || lower === "索引") {
				bumpAccess(root, "index");
				return {
					name: key,
					source: "index.txt",
					content: readIndex(root),
					namespace: ns,
					meta: { ...EMPTY_META },
				};
			}
			const candidates = [key, slugify(key)];
			for (const c of candidates) {
				const sopPath = join(root, "sops", `${c}.md`);
				if (existsSync(sopPath)) {
					const m = getEntryMeta(root, "sop", c) || {};
					if (m.archived) {
						return { name: key, source: "", content: "", namespace: ns, meta: { ...EMPTY_META, archived: true }, not_found: true };
					}
					bumpAccess(root, `sop:${c}`);
					return {
						name: key,
						source: `sops/${c}.md`,
						content: readFileSync(sopPath, "utf8"),
						namespace: ns,
						meta: normalizeMeta(m),
					};
				}
			}
			const fact = readFact(root, key);
			if (fact !== null) {
				const m = getEntryMeta(root, "fact", key) || {};
				if (m.archived) {
					return { name: key, source: "", content: "", namespace: ns, meta: { ...EMPTY_META, archived: true }, not_found: true };
				}
				bumpAccess(root, `fact:${key}`);
				return {
					name: key,
					source: "facts.md",
					content: fact,
					namespace: ns,
					meta: normalizeMeta(m),
				};
			}
			if (key.includes("sops/")) {
				const p = join(root, key);
				if (existsSync(p)) {
					const slug = basename(p).replace(/\.md$/, "");
					if (isArchived(root, "sop", slug)) {
						return { name: key, source: "", content: "", namespace: ns, meta: { ...EMPTY_META, archived: true }, not_found: true };
					}
					return { name: key, source: key, content: readFileSync(p, "utf8"), namespace: ns, meta: { ...EMPTY_META } };
				}
			}
			return { name: key, source: "", content: "", namespace: ns, meta: { ...EMPTY_META }, not_found: true };
		},
		presentCall(args) {
			return { card: "generic", title: `读取记忆 ${args.name}`, kind: "read" };
		}
	});

	const listTool = defineTool({
		name: "memory_list",
		description: "列出记忆：L2 facts 条目 + L3 SOP 文件 + pending 候选数 + L1 索引行数。可选 namespace。",
		parameters: {
			namespace: {
				type: "string",
				description: "命名空间（默认取 workspace/git 分支或配置 defaultNamespace）"
			}
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					namespace: { type: "string", required: true },
					index_lines: { type: "integer", required: true },
					facts: { type: "array", items: { type: "string" }, required: true },
					sops: { type: "array", items: { type: "string" }, required: true },
					pending: { type: "array", items: { type: "string" }, required: true }
				}
			},
			render: (_args, value) => [{
				type: "text",
				text: `记忆库[${value.namespace}]（${value.index_lines} 行索引）\nL2 事实: ${value.facts.join("、") || "（空）"}\nL3 SOP: ${value.sops.join("、") || "（空）"}\nPending: ${value.pending.join("、") || "（空）"}`
			}]
		},
		execute(args) {
			const ns = resolveNamespace(cfg, args.namespace);
			const root = nsRoot(cfg.memoryDir, ns);
			ensureNamespaceLayout(root);
			const facts = factSections(root).filter((f) => !isArchived(root, "fact", f));
			const sops = sopNames(root).filter((s) => !isArchived(root, "sop", s));
			const pending = pendingNames(root);
			const lines = readIndex(root).split("\n").length;
			return { namespace: ns, index_lines: lines, facts, sops, pending };
		},
		presentCall() {
			return { card: "generic", title: "列出记忆", kind: "read" };
		}
	});

	const writeTool = defineTool({
		name: "memory_write",
		description: "写入跨会话记忆（行动验证公理：evidence 必填，只写【成功验证过】的信息）。entry_type=fact 存 L2 环境事实；entry_type=sop 存 L3 任务经验。可选 namespace 隔离项目；可选 sourceSession/sourceSeqs 记录溯源；可选 related 关联其他记忆条目。写入后自动同步 L1 索引，超限时自动按热度压缩。",
		parameters: {
			topic: {
				type: "string",
				required: true,
				description: "记忆主题（fact 的 section 名 / sop 的文件名，简短自解释）"
			},
			entry_type: {
				type: "string",
				enum: ["fact", "sop"],
				required: true,
				description: "fact=环境事实(L2) / sop=任务经验(L3)"
			},
			content: {
				type: "string",
				required: true,
				description: "记忆内容：fact 用要点列表；sop 用「关键前置 + 典型坑 + 稳定步骤」精简格式，尽可能短"
			},
			evidence: {
				type: "string",
				required: true,
				description: "验证证据：本次成功验证该信息的工具调用/实测结果（行动验证公理：无行动，不记忆）。没有验证证据就不要调用本工具"
			},
			related: {
				type: "array",
				items: { type: "string" },
				description: "关联的其他记忆条目名（可选，建立记忆间链接）"
			},
			namespace: {
				type: "string",
				description: "命名空间（默认取 workspace/git 分支或配置 defaultNamespace）"
			},
			sourceSession: {
				type: "string",
				description: "来源 session id（溯源用，通常由插件自动填充）"
			},
			sourceSeqs: {
				type: "array",
				items: { type: "integer" },
				description: "来源事件 seq 列表（溯源用）"
			}
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					entry_type: { type: "string", required: true },
					topic: { type: "string", required: true },
					path: { type: "string", required: true },
					namespace: { type: "string", required: true },
					action: { type: "string", required: true },
					index: {
						type: "object",
						additionalProperties: false,
						properties: {
							index_lines: { type: "integer" },
							max_index_lines: { type: "integer" },
							over_limit: { type: "boolean" },
							compressed: { type: "boolean" },
							facts_hidden: { type: "integer" },
							sops_hidden: { type: "integer" }
						}
					}
				}
			},
			render: (_args, value) => [{
				type: "text",
				text: `✅ 已${value.action === "created" ? "新建" : "更新"}记忆「${value.topic}」（${value.entry_type === "fact" ? "L2 事实" : "L3 SOP"}）→ ${value.path} [${value.namespace}]${value.index?.compressed ? `\n📦 L1 超限已自动按热度压缩${(value.index?.facts_hidden || value.index?.sops_hidden) ? `（隐藏 L2=${value.index.facts_hidden || 0}、L3=${value.index.sops_hidden || 0}，可用 memory_list 查看）` : ""}` : ""}${value.index?.over_limit ? "\n⚠️ L1 索引压缩后仍超过限制（多为 RULES 手动段过长），建议手动精简 [RULES]" : ""}`
			}]
		},
		async execute(args) {
			const topic = String(args.topic).trim();
			const type = args.entry_type === "fact" ? "fact" : "sop";
			const content = String(args.content).trim();
			const evidence = String(args.evidence ?? "").trim();
			if (!topic || !content) throw new Error("memory_write: topic 与 content 必填");
			if (!evidence) {
				throw new Error("memory_write: evidence 必填（行动验证公理：无行动，不记忆）。请提供本次成功验证该信息的工具调用/实测证据，或取消写入。");
			}
			const ns = resolveNamespace(cfg, args.namespace);
			const root = nsRoot(cfg.memoryDir, ns);
			ensureNamespaceLayout(root);
			const r = writeMemory(root, {
				topic,
				entryType: type,
				content,
				evidence,
				sourceSession: args.sourceSession || null,
				sourceSeqs: args.sourceSeqs || [],
				namespace: ns,
				related: Array.isArray(args.related) ? args.related : [],
				maxIndexLines: cfg.maxIndexLines,
			});
			return { entry_type: type, topic, path: r.path, namespace: ns, action: r.action, index: r.index };
		},
		presentCall(args) {
			return { card: "generic", title: `写入记忆 ${args.topic}`, kind: "execute" };
		}
	});

	const indexTool = defineTool({
		name: "memory_index",
		description: "重建 L1 索引的自动段（活跃 L2 facts + L3 sops，过滤已归档），保留 [RULES] 手动段。在手动改动记忆文件后使用。可选 namespace。",
		parameters: {
			namespace: {
				type: "string",
				description: "命名空间"
			}
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					namespace: { type: "string", required: true },
					index_lines: { type: "integer", required: true },
					over_limit: { type: "boolean", required: true },
					facts: { type: "array", items: { type: "string" }, required: true },
					sops: { type: "array", items: { type: "string" }, required: true }
				}
			},
			render: (_args, value) => [{
				type: "text",
				text: `索引已重建[${value.namespace}]（${value.index_lines} 行${value.over_limit ? "，⚠️ 超过限制建议精简" : ""}）：\nL2: ${value.facts.join("、") || "（空）"}\nL3: ${value.sops.join("、") || "（空）"}`
			}]
		},
		execute(args) {
			const ns = resolveNamespace(cfg, args.namespace);
			const root = nsRoot(cfg.memoryDir, ns);
			ensureNamespaceLayout(root);
			const r = syncIndex(root, cfg.maxIndexLines);
			return { namespace: ns, index_lines: r.index_lines, over_limit: r.over_limit, facts: factSections(root).filter((f) => !isArchived(root, "fact", f)), sops: sopNames(root).filter((s) => !isArchived(root, "sop", s)) };
		},
		presentCall() {
			return { card: "generic", title: "重建记忆索引", kind: "execute" };
		}
	});

	const statsTool = defineTool({
		name: "memory_stats",
		description: "查看记忆库统计：各命名空间条目数、pending 数、归档数、总大小。可选 namespace。",
		parameters: {
			namespace: {
				type: "string",
				description: "命名空间"
			}
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					namespace: { type: "string", required: true },
					stats: {
						type: "object",
						additionalProperties: false,
						properties: {
							facts: { type: "integer", required: true },
							sops: { type: "integer", required: true },
							pending: { type: "integer", required: true },
							archived: { type: "integer", required: true },
							size_bytes: { type: "integer", required: true },
							updatedAt: { type: "string", required: true }
						},
						required: true
					}
				}
			},
			render: (_args, value) => [{
				type: "text",
				text: `统计[${value.namespace}]：L2=${value.stats.facts} L3=${value.stats.sops} pending=${value.stats.pending} archived=${value.stats.archived} size=${value.stats.size_bytes}B`
			}]
		},
		execute(args) {
			const ns = resolveNamespace(cfg, args.namespace);
			const root = nsRoot(cfg.memoryDir, ns);
			ensureNamespaceLayout(root);
			return { namespace: ns, stats: computeNamespaceStats(root) };
		},
		presentCall() {
			return { card: "generic", title: "查看记忆统计", kind: "read" };
		}
	});

	const maintainTool = defineTool({
		name: "memory_maintain",
		description: "执行记忆库维护：去重（精确 + 内容级近重复，Jaccard 阈值 0.85，重复项归档保留 citation）、压缩 L1 索引（按衰减热度保留活跃条目）、生成统计、产出内容高度重叠的合并候选（需人工/模型确认）。可选 namespace。",
		parameters: {
			namespace: {
				type: "string",
				description: "命名空间"
			}
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					namespace: { type: "string", required: true },
					report: {
						type: "object",
						additionalProperties: true,
						properties: {
							runAt: { type: "string" },
							dedupe: { type: "object", additionalProperties: true },
							compress: { type: "object", additionalProperties: true },
							stats: { type: "object", additionalProperties: true },
							mergeCandidates: { type: "array", items: { type: "object", additionalProperties: true } }
						},
						required: true
					}
				}
			},
			render: (_args, value) => [{
				type: "text",
				text: `维护完成[${value.namespace}]：去重移除 ${value.report.dedupe?.removed?.length || 0} 条，索引保留 L2=${value.report.compress?.facts_kept || 0}/${value.report.compress?.total_facts || 0} L3=${value.report.compress?.sops_kept || 0}/${value.report.compress?.total_sops || 0}${(value.report.compress?.facts_hidden || value.report.compress?.sops_hidden) ? `（隐藏 L2=${value.report.compress?.facts_hidden || 0}、L3=${value.report.compress?.sops_hidden || 0}，可用 memory_list 查看）` : ""}，合并候选 ${value.report.mergeCandidates?.length || 0} 组`
			}]
		},
		execute(args) {
			const ns = resolveNamespace(cfg, args.namespace);
			const root = nsRoot(cfg.memoryDir, ns);
			ensureNamespaceLayout(root);
			const report = runMaintain(root, cfg.maxIndexLines);
			return { namespace: ns, report };
		},
		presentCall() {
			return { card: "generic", title: "执行记忆维护", kind: "execute" };
		}
	});

	const pendingTool = defineTool({
		name: "memory_pending",
		description: "列出自动蒸馏候选（pending/）：同工具先失败后成功的重试序列自动生成（典型坑点信号），尚未进入正式记忆。用 memory_accept 确认入记忆，或忽略。可选 namespace。",
		parameters: {
			namespace: {
				type: "string",
				description: "命名空间"
			}
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					namespace: { type: "string", required: true },
					pending: {
						type: "array",
						items: {
							type: "object",
							additionalProperties: false,
							properties: {
								name: { type: "string", required: true },
								content: { type: "string", required: true }
							}
						},
						required: true
					}
				}
			},
			render: (_args, value) => [{
				type: "text",
				text: `Pending[${value.namespace}]：\n` + (value.pending.map((p) => `- ${p.name}: ${(p.content.split("\n").slice(-1)[0] || "").slice(0, 120)}`).join("\n") || "（空）")
			}]
		},
		execute(args) {
			const ns = resolveNamespace(cfg, args.namespace);
			const root = nsRoot(cfg.memoryDir, ns);
			ensureNamespaceLayout(root);
			const pending = pendingNames(root).map((f) => ({ name: f, content: readPending(root, f) || "" }));
			return { namespace: ns, pending };
		},
		presentCall() {
			return { card: "generic", title: "查看记忆候选", kind: "read" };
		}
	});

	const acceptTool = defineTool({
		name: "memory_accept",
		description: "接受一条 pending 候选，写入正式记忆（fact/sop）。需要 topic 与 entry_type；evidence 必填或从 pending 中继承。可选 namespace。",
		parameters: {
			name: {
				type: "string",
				required: true,
				description: "pending 文件名（memory_pending 返回的 name）"
			},
			topic: {
				type: "string",
				description: "记忆主题（缺省时需从 pending 推断/由用户提供）"
			},
			entry_type: {
				type: "string",
				enum: ["fact", "sop"],
				description: "fact 或 sop（缺省时需从 pending 推断/由用户提供）"
			},
			evidence: {
				type: "string",
				description: "验证证据（若 pending 无证据则必填）"
			},
			related: {
				type: "array",
				items: { type: "string" },
				description: "关联的其他记忆条目名（可选）"
			},
			namespace: {
				type: "string",
				description: "命名空间"
			}
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					accepted: { type: "boolean", required: true },
					topic: { type: "string", required: true },
					entry_type: { type: "string", required: true },
					namespace: { type: "string", required: true }
				}
			},
			render: (_args, value) => [{
				type: "text",
				text: value.accepted ? `✅ 已接受 pending → 记忆「${value.topic}」（${value.entry_type}）[${value.namespace}]` : `未接受：${value.reason || "未知原因"}`
			}]
		},
		async execute(args) {
			const ns = resolveNamespace(cfg, args.namespace);
			const root = nsRoot(cfg.memoryDir, ns);
			ensureNamespaceLayout(root);
			const name = String(args.name).trim();
			if (!isSafeMemName(name)) throw new Error("memory_accept: 非法 pending 文件名");
			const text = readPending(root, name);
			if (!text) throw new Error(`memory_accept: pending 不存在: ${name}`);
			const parsed = parsePending(text);
			const topic = String(args.topic || "").trim() || "";
			const entryType = args.entry_type === "fact" ? "fact" : args.entry_type === "sop" ? "sop" : "";
			const evidence = String(args.evidence || "").trim() || "";
			if (!topic) throw new Error("memory_accept: 需要 topic（pending 未包含可推断主题）");
			if (!entryType) throw new Error("memory_accept: 需要 entry_type=fact|sop（pending 未包含可推断类型）");
			if (!evidence) throw new Error("memory_accept: 需要 evidence（行动验证公理：无行动，不记忆）");
			const content = text.replace(/^# Pending Memory Candidate\r?\n[\s\S]*?\r?\n\r?\n/, "").trim();
			if (!content) throw new Error("memory_accept: pending 内容为空，无法接受");
			writeMemory(root, {
				topic,
				entryType,
				content,
				evidence,
				sourceSession: parsed.sourceSession || null,
				sourceSeqs: parsed.sourceSeqs || [],
				namespace: ns,
				related: Array.isArray(args.related) ? args.related : [],
				maxIndexLines: cfg.maxIndexLines,
			});
			// 接受成功后删除 pending（先归档副本到 archive/，再移除原文件）
			try {
				const p = join(root, PENDING_DIR, name);
				if (existsSync(p)) {
					copyFileSync(p, join(root, ARCHIVE_DIR, name));
					rmSync(p, { force: true });
				}
			} catch { /* 清理失败不阻断 */ }
			return { accepted: true, topic, entry_type: entryType, namespace: ns };
		},
		presentCall(args) {
			return { card: "generic", title: `接受记忆候选 ${args.name}`, kind: "execute" };
		}
	});

	const updateTool = defineTool({
		name: "memory_update",
		description: "更新已有记忆。supersede=true 时先把旧版本快照到 .history/ 再覆盖（保留历史）；false 则直接覆盖但仍记录 updatedAt。可选 related 替换关联链接。可选 namespace。",
		parameters: {
			topic: {
				type: "string",
				required: true,
				description: "记忆主题"
			},
			entry_type: {
				type: "string",
				enum: ["fact", "sop"],
				required: true,
				description: "fact 或 sop"
			},
			content: {
				type: "string",
				required: true,
				description: "新的记忆内容"
			},
			evidence: {
				type: "string",
				description: "本次更新的验证证据（建议提供）"
			},
			related: {
				type: "array",
				items: { type: "string" },
				description: "关联的其他记忆条目名（提供时替换现有关联）"
			},
			supersede: {
				type: "boolean",
				description: "是否保留旧版本快照（默认 true）"
			},
			namespace: {
				type: "string",
				description: "命名空间"
			}
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					topic: { type: "string", required: true },
					entry_type: { type: "string", required: true },
					action: { type: "string", required: true },
					namespace: { type: "string", required: true },
					history: { type: "string" }
				}
			},
			render: (_args, value) => [{
				type: "text",
				text: `✅ 已${value.action}「${value.topic}」[${value.namespace}]${value.history ? `，旧版本保留在 ${value.history}` : ""}`
			}]
		},
		async execute(args) {
			const ns = resolveNamespace(cfg, args.namespace);
			const root = nsRoot(cfg.memoryDir, ns);
			ensureNamespaceLayout(root);
			const topic = String(args.topic).trim();
			const type = args.entry_type === "fact" ? "fact" : "sop";
			const content = String(args.content).trim();
			if (!topic || !content) throw new Error("memory_update: topic 与 content 必填");
			const supersede = args.supersede !== false;
			const key = type === "fact" ? topic : slugify(topic);
			let historyPath = "";
			if (supersede) {
				const ts = Date.now();
				if (type === "fact") {
					const old = readFact(root, topic);
					if (old !== null) {
						historyPath = join(HISTORY_DIR, `fact-${slugify(topic)}-${ts}.md`);
						writeFileSync(join(root, historyPath), `# ${topic}\n\n${old}\n`, "utf8");
					}
				} else {
					const old = readSop(root, key);
					if (old !== null) {
						historyPath = join(HISTORY_DIR, `sop-${key}-${ts}.md`);
						writeFileSync(join(root, historyPath), old, "utf8");
					}
				}
			}
			const evidence = String(args.evidence || "").trim() || getEntryMeta(root, type, key)?.evidence || "";
			const r = writeMemory(root, {
				topic,
				entryType: type,
				content,
				evidence: evidence || "memory_update（历史更新）",
				sourceSession: getEntryMeta(root, type, key)?.sourceSession || null,
				sourceSeqs: getEntryMeta(root, type, key)?.sourceSeqs || [],
				namespace: ns,
				related: Array.isArray(args.related) ? args.related : (getEntryMeta(root, type, key)?.related || []),
				maxIndexLines: cfg.maxIndexLines,
			});
			return { topic, entry_type: type, action: supersede ? "superseded" : "updated", namespace: ns, history: historyPath || undefined };
		},
		presentCall(args) {
			return { card: "generic", title: `更新记忆 ${args.topic}`, kind: "execute" };
		}
	});

	const archiveTool = defineTool({
		name: "memory_archive",
		description: "归档一条记忆：从 L1 索引隐藏，但文件与历史保留（不物理删除）。可选 namespace。",
		parameters: {
			topic: {
				type: "string",
				required: true,
				description: "记忆主题"
			},
			entry_type: {
				type: "string",
				enum: ["fact", "sop"],
				required: true,
				description: "fact 或 sop"
			},
			namespace: {
				type: "string",
				description: "命名空间"
			}
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					topic: { type: "string", required: true },
					entry_type: { type: "string", required: true },
					namespace: { type: "string", required: true },
					archived: { type: "boolean", required: true }
				}
			},
			render: (_args, value) => [{
				type: "text",
				text: value.archived ? `📦 已归档「${value.topic}」[${value.namespace}]（可用 memory_rollback 恢复，或 memory_search 检索到）` : `未找到「${value.topic}」`
			}]
		},
		async execute(args) {
			const ns = resolveNamespace(cfg, args.namespace);
			const root = nsRoot(cfg.memoryDir, ns);
			ensureNamespaceLayout(root);
			const topic = String(args.topic).trim();
			const type = args.entry_type === "fact" ? "fact" : "sop";
			const key = type === "fact" ? topic : slugify(topic);
			const exists = type === "fact" ? readFact(root, key) !== null : readSop(root, key) !== null;
			if (!exists) return { topic, entry_type: type, namespace: ns, archived: false };
			setEntryMeta(root, type, key, { archived: true, archivedAt: new Date().toISOString() });
			syncIndex(root, cfg.maxIndexLines);
			return { topic, entry_type: type, namespace: ns, archived: true };
		},
		presentCall(args) {
			return { card: "generic", title: `归档记忆 ${args.topic}`, kind: "execute" };
		}
	});

	const rollbackTool = defineTool({
		name: "memory_rollback",
		description: "回滚一条记忆到 .history/ 中最近一次快照（supersede 时自动保留）。可选 namespace。",
		parameters: {
			topic: {
				type: "string",
				required: true,
				description: "记忆主题"
			},
			entry_type: {
				type: "string",
				enum: ["fact", "sop"],
				required: true,
				description: "fact 或 sop"
			},
			namespace: {
				type: "string",
				description: "命名空间"
			}
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					topic: { type: "string", required: true },
					entry_type: { type: "string", required: true },
					namespace: { type: "string", required: true },
					restored: { type: "boolean", required: true },
					source: { type: "string" }
				}
			},
			render: (_args, value) => [{
				type: "text",
				text: value.restored ? `♻️ 已回滚「${value.topic}」[${value.namespace}] ← ${value.source}` : `未找到可回滚的历史「${value.topic}」`
			}]
		},
		async execute(args) {
			const ns = resolveNamespace(cfg, args.namespace);
			const root = nsRoot(cfg.memoryDir, ns);
			ensureNamespaceLayout(root);
			const topic = String(args.topic).trim();
			const type = args.entry_type === "fact" ? "fact" : "sop";
			const key = type === "fact" ? topic : slugify(topic);
			const prefix = type === "fact" ? `fact-${slugify(topic)}-` : `sop-${slugify(topic)}-`;
			let files = [];
			try {
				files = readdirSync(join(root, HISTORY_DIR))
					.filter((f) => f.startsWith(prefix) && f.endsWith(".md"))
					.sort();
			} catch { files = []; }
			if (!files.length) return { topic, entry_type: type, namespace: ns, restored: false };
			const latest = files[files.length - 1];
			const src = join(root, HISTORY_DIR, latest);
			const content = readFileSync(src, "utf8");
			if (type === "fact") {
				const clean = content.replace(/^# .+\n\n/, "").trim();
				upsertFact(root, topic, clean);
				setEntryMeta(root, "fact", topic, { archived: false, restoredFrom: latest });
			} else {
				writeFileSync(join(root, "sops", `${key}.md`), content, "utf8");
				setEntryMeta(root, "sop", key, { archived: false, restoredFrom: latest });
			}
			syncIndex(root, cfg.maxIndexLines);
			return { topic, entry_type: type, namespace: ns, restored: true, source: latest };
		},
		presentCall(args) {
			return { card: "generic", title: `回滚记忆 ${args.topic}`, kind: "execute" };
		}
	});

	const expandTool = defineTool({
		name: "memory_expand",
		description: "展开一条记忆的溯源：通过 sourceSession/sourceSeqs 从 DSH session log 读取原始事件。可选 namespace。",
		parameters: {
			topic: {
				type: "string",
				required: true,
				description: "记忆主题"
			},
			entry_type: {
				type: "string",
				enum: ["fact", "sop"],
				required: true,
				description: "fact 或 sop"
			},
			namespace: {
				type: "string",
				description: "命名空间"
			}
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					topic: { type: "string", required: true },
					entry_type: { type: "string", required: true },
					available: { type: "boolean", required: true },
					message: { type: "string" },
					sourceSession: { type: "string" },
					sourceSeqs: { type: "array", items: { type: "integer" } },
					events: {
						type: "array",
						items: {
							type: "object",
							additionalProperties: true,
							properties: {
								seq: { type: "integer" },
								type: { type: "string" },
								time: { type: "integer" },
								text: { type: "string" }
							}
						}
					}
				}
			},
			render: (_args, value) => [{
				type: "text",
				text: value.available
					? `📎 溯源「${value.topic}」[${value.entry_type}] session=${value.sourceSession} seqs=${JSON.stringify(value.sourceSeqs)}\n${value.events.map((e) => `#${e.seq} [${e.type}] ${e.text || ""}`).join("\n") || "（无事件）"}`
					: `溯源不可用：${value.message || "无 sourceSession/sourceSeqs"}`
			}]
		},
		async execute(args) {
			const ns = resolveNamespace(cfg, args.namespace);
			const root = nsRoot(cfg.memoryDir, ns);
			ensureNamespaceLayout(root);
			const topic = String(args.topic).trim();
			const type = args.entry_type === "fact" ? "fact" : "sop";
			const key = type === "fact" ? topic : slugify(topic);
			const meta = getEntryMeta(root, type, key);
			if (!meta?.sourceSession || !meta.sourceSeqs?.length) {
				return { topic, entry_type: type, available: false, message: "该记忆没有 sourceSession/sourceSeqs 溯源信息", sourceSession: meta?.sourceSession || "", sourceSeqs: meta?.sourceSeqs || [] };
			}
			const sq = ctx.get("sessionQuery");
			if (!sq || typeof sq.readSession !== "function") {
				return { topic, entry_type: type, available: false, message: "sessionQuery 服务不可用", sourceSession: meta.sourceSession || "", sourceSeqs: meta.sourceSeqs };
			}
			try {
				const snap = await sq.readSession(meta.sourceSession);
				const seqSet = new Set(meta.sourceSeqs.map(Number));
				const events = snap.events
					.filter((e) => seqSet.has(Number(e.seq)))
					.map((e) => ({
						seq: Number(e.seq),
						type: String(e.type || ""),
						time: Number(e.time || 0),
						text: typeof e.text === "string" ? e.text : JSON.stringify(e).slice(0, 2000),
					}));
				return { topic, entry_type: type, available: true, sourceSession: meta.sourceSession || "", sourceSeqs: meta.sourceSeqs, events };
			} catch (error) {
				return { topic, entry_type: type, available: false, message: `展开失败: ${error?.message || error}`, sourceSession: meta.sourceSession || "", sourceSeqs: meta.sourceSeqs };
			}
		},
		presentCall(args) {
			return { card: "generic", title: `展开溯源 ${args.topic}`, kind: "read" };
		}
	});

	const searchTool = defineTool({
		name: "memory_search",
		description: "全文检索记忆库（BM25，无模型）：覆盖 L2 facts、L3 sops、归档条目。L1 索引被裁剪/隐藏的条目也能找回。支持跨命名空间（all_namespaces=true）。可选 namespace。",
		parameters: {
			query: {
				type: "string",
				required: true,
				description: "检索关键词（中英文均可，中文按 bigram 切分）"
			},
			namespace: {
				type: "string",
				description: "命名空间（默认取 workspace/git 分支或配置 defaultNamespace）"
			},
			all_namespaces: {
				type: "boolean",
				description: "跨全部命名空间检索（默认 false）"
			},
			include_archived: {
				type: "boolean",
				description: "是否包含归档条目（默认 true）"
			},
			limit: {
				type: "integer",
				description: "返回条数上限（默认 8）"
			}
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					query: { type: "string", required: true },
					namespaces_searched: { type: "array", items: { type: "string" }, required: true },
					results: {
						type: "array",
						required: true,
						items: {
							type: "object",
							additionalProperties: false,
							properties: {
								namespace: { type: "string", required: true },
								kind: { type: "string", required: true },
								name: { type: "string", required: true },
								archived: { type: "boolean", required: true },
								score: { type: "number", required: true },
								snippet: { type: "string", required: true }
							}
						}
					}
				}
			},
			render: (_args, value) => [{
				type: "text",
				text: value.results.length === 0
					? `检索「${value.query}」无结果（范围: ${value.namespaces_searched.join(", ")}）`
					: `检索「${value.query}」（范围: ${value.namespaces_searched.join(", ")}）：\n` + value.results.map((r, i) =>
						`${i + 1}. [${r.namespace}] ${r.kind}:${r.name}${r.archived ? "（已归档）" : ""} score=${r.score}\n   ${r.snippet}`).join("\n")
			}]
		},
		execute(args) {
			const query = String(args.query ?? "").trim();
			if (!query) throw new Error("memory_search: query 必填");
			const includeArchived = args.include_archived !== false;
			const limit = Math.max(1, Math.min(50, Number(args.limit) || 8));
			let namespaces;
			if (args.all_namespaces) {
				namespaces = listNamespaces(cfg.memoryDir);
			} else {
				namespaces = [resolveNamespace(cfg, args.namespace)];
			}
			const results = searchNamespaces(cfg.memoryDir, namespaces, query, { limit, includeArchived });
			return { query, namespaces_searched: namespaces, results };
		},
		presentCall(args) {
			return { card: "generic", title: `检索记忆 ${args.query}`, kind: "read" };
		}
	});

	const promoteTool = defineTool({
		name: "memory_promote",
		description: "把一条命名空间内的记忆提升到另一命名空间（默认提升到全局 default）：复制内容与溯源到目标空间，源条目默认归档保留。用于把项目局部经验升格为跨项目通用经验。",
		parameters: {
			topic: {
				type: "string",
				required: true,
				description: "记忆主题"
			},
			entry_type: {
				type: "string",
				enum: ["fact", "sop"],
				required: true,
				description: "fact 或 sop"
			},
			from_namespace: {
				type: "string",
				description: "来源命名空间（默认当前命名空间）"
			},
			to_namespace: {
				type: "string",
				description: "目标命名空间（默认 default，即全局）"
			},
			archive_source: {
				type: "boolean",
				description: "是否归档源条目（默认 true，保留 citation 可回溯）"
			}
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					promoted: { type: "boolean", required: true },
					topic: { type: "string", required: true },
					entry_type: { type: "string", required: true },
					from: { type: "string", required: true },
					to: { type: "string", required: true },
					source_archived: { type: "boolean" }
				}
			},
			render: (_args, value) => [{
				type: "text",
				text: value.promoted
					? `✅ 已提升「${value.topic}」（${value.entry_type}）[${value.from}] → [${value.to}]${value.source_archived ? "，源条目已归档" : ""}`
					: `未找到可提升的「${value.topic}」[${value.from}]`
			}]
		},
		async execute(args) {
			const topic = String(args.topic).trim();
			const type = args.entry_type === "fact" ? "fact" : "sop";
			const fromNs = resolveNamespace(cfg, args.from_namespace);
			const toNs = safeNs(args.to_namespace || "default");
			if (fromNs === toNs) throw new Error("memory_promote: 来源与目标命名空间相同");
			const fromRoot = nsRoot(cfg.memoryDir, fromNs);
			const toRoot = nsRoot(cfg.memoryDir, toNs);
			ensureNamespaceLayout(toRoot);
			const key = type === "fact" ? topic : slugify(topic);
			const content = type === "fact" ? readFact(fromRoot, key) : readSop(fromRoot, key);
			if (content === null) return { promoted: false, topic, entry_type: type, from: fromNs, to: toNs };
			const meta = getEntryMeta(fromRoot, type, key) || {};
			writeMemory(toRoot, {
				topic,
				entryType: type,
				content,
				evidence: meta.evidence || `promoted from namespace:${fromNs}`,
				sourceSession: meta.sourceSession || null,
				sourceSeqs: meta.sourceSeqs || [],
				namespace: toNs,
				related: Array.isArray(meta.related) ? meta.related : [],
				maxIndexLines: cfg.maxIndexLines,
			});
			const archiveSource = args.archive_source !== false;
			if (archiveSource) {
				setEntryMeta(fromRoot, type, key, { archived: true, promotedTo: `${toNs}:${topic}`, archivedAt: new Date().toISOString() });
				syncIndex(fromRoot, cfg.maxIndexLines);
			}
			return { promoted: true, topic, entry_type: type, from: fromNs, to: toNs, source_archived: archiveSource };
		},
		presentCall(args) {
			return { card: "generic", title: `提升记忆 ${args.topic}`, kind: "execute" };
		}
	});

	return [readTool, listTool, writeTool, indexTool, statsTool, maintainTool, pendingTool, acceptTool, updateTool, archiveTool, rollbackTool, expandTool, searchTool, promoteTool];
}

function formatRelated(related) {
	if (!Array.isArray(related) || related.length === 0) return "";
	const parts = related.map((r) => `  · ${r.name}（${r.state === "active" ? "活跃" : r.state === "archived" ? "已归档" : "未找到"}）`);
	return `\n\n关联记忆:\n${parts.join("\n")}`;
}
