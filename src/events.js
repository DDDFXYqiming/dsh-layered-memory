// 事件接线：自动蒸馏（重试序列捕获）、周期维护（持久计数）、阈值反思注入。
// [v0.5 变更]
// - autoPending 不再为普通成功调用生成垃圾候选，只捕获「同工具先失败后成功」的重试序列；
// - 每 10 轮固定提醒废除，改为阈值触发（pending 过多 / SOP 过多 / 索引超限）+ 冷却；
// - turn 计数持久化到命名空间（跨会话累计），headless 一次性会话也能触发周期维护。

import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { bumpTurnCounter, nsRoot, resolveNamespace, setEntryMeta, getEntryMeta, slugify } from "./store.js";
import { computeContentRevision, readReflectionState, writeReflectionState, collectReflectionSignals, decideReflection, isSettledRevision, reflectionBuckets } from "./reflection.js";
import { runMaintain } from "./maintain.js";
import { writePending } from "./memory-ops.js";
import { createMaintenanceRunner } from "./maintenance-agent.js";

/** 从工具结果对象里尽力抽取文本尾部（结构未知，防御式）。 */
function resultTail(result, max = 200) {
	try {
		let text = "";
		if (typeof result?.text === "string") text = result.text;
		else if (Array.isArray(result?.content)) {
			text = result.content
				.map((c) => (typeof c?.text === "string" ? c.text : ""))
				.filter(Boolean)
				.join("\n");
		} else if (result?.error) text = String(result.error);
		else text = JSON.stringify(result ?? {});
		text = text.replace(/\s+/g, " ").trim();
		return text.length > max ? text.slice(0, max) + "…" : text;
	} catch {
		return "";
	}
}

// ⚠ 键混用是有意假设，勿当 bug 顺手改：tools/result 以 exec.agent.id 写入
// retryTrackers/capturedSequences，turn/end 以 session.id 读取，agent/disposed 以
// agent.id 清理——依赖 DSH 主会话 agent.id === session.id（2026-08-17 起蒸馏持续
// 产出实证，2026-09-04 review 复核）。若宿主未来解耦两种 id，此处不报错但蒸馏会
// 静默停摆（不再有 pending），届时应让序列携带 session 引用、turn/end 按其归并，
// 而不是只换 key 类型。子代理内重试序列是否成对蒸馏属未验证路径（依赖其是否触发
// 自身 session 的 turn/end）。
/** [0.6.6] 反思提醒文本：显式标注来源，并对「没有重叠项就无需处理」给出终态说明。 */
function buildReflectionText(buckets, signals, cfg) {
	const parts = [];
	if (buckets.includes("pending")) parts.push("pending 候选已累积 " + signals.pending + " 条（阈值 " + cfg.reflectPendingThreshold + "）：有价值的用 memory_accept 落库，其余忽略");
	if (buckets.includes("sops")) parts.push("L3 SOP 活跃 " + signals.sops + " 条（阈值 " + cfg.reflectSopsThreshold + "）：如确有内容重叠可用 memory_maintain 看合并候选；没有重叠项时无需处理，同一内容不再重复提醒");
	if (buckets.includes("index")) parts.push("L1 索引 " + signals.indexChars + " 字符超预算 " + cfg.l1MaxChars + "：请 memory_maintain 看合并候选/冷条目，并精简 [RULES]");
	return "[记忆整理请求]（插件自动提醒，非用户消息；与当前任务无关时可忽略）" + parts.join("；") + "。（行动验证公理照旧：只沉淀有证据的内容）";
}
/**
 * @param ctx cordis context
 * @param cfg 生效配置
 * @param io { resolveRoot, onSkillResult } 依赖回调
 */
export function wireEvents(ctx, cfg, io) {
	const maintenance = createMaintenanceRunner(ctx, cfg, {
		readState: readReflectionState, writeState: writeReflectionState, slugify,
		maintain: root => runMaintain(root, cfg.l1MaxChars, cfg.maintainOpts),
		tools: namespace => io.maintenanceTools(namespace),
	});
	io.onMaintenanceRunner?.(maintenance);
	const retryTrackers = new Map(); // agentId -> Map(tool -> { fails, lastErrorTail })
	const capturedSequences = new Map(); // agentId -> [{ tool, fails, errorTail, successTail }]
	const reflectionState = new Map(); // sessionId -> { lastReflectionTurn }
	const writeProvenance = new Map(); // agentId -> [{ kind, key }]，turn/end 时补 sourceSession/sourceSeqs
	// [0.6.8] 本回合工具结果事件的 seq。此前溯源只写 turn/end 自身的 seq，memory_expand
	// 展开后只能看到「回合结束」这个空壳事件，复核不到证明该条目的工具结果。
	const toolResultSeqs = new Map(); // sessionId -> number[]
	const turnEndWarned = new Set(); // [0.6.1 N7] 已提醒过的 turn/end 故障类别（同类只 console.warn 一次）
	const disposers = [];
	// [0.6.3] 维护节流与一次性诊断状态
	const MAINTAIN_MIN_INTERVAL_MS = 10 * 60 * 1000;
	let lastMaintainAt = 0;
let reflectDiagDone = false;
// [0.6.6] 排队中的宏任务与清理标志：此前 setTimeout/setImmediate 的 handle 都没保存，
// 插件卸载后已排队的提醒与维护仍会执行（审查 R6/R12）。
let disposed = false;
const timers = new Set();
const scheduleTimeout = (fn) => {
	const h = setTimeout(() => { timers.delete(h); fn(); }, 0);
	timers.add(h);
	return h;
};
const scheduleImmediate = (fn) => {
	const h = setImmediate(() => { timers.delete(h); fn(); });
	timers.add(h);
	return h;
};

	disposers.push(ctx.on("tools/result", (exec, result) => {
		try {
			io.onSkillResult?.(exec, result);
		} catch { /* 激活失败不影响蒸馏 */ }
		// [v0.6] 溯源自动补全：memory_write 成功后记下条目，turn/end 用真实 session/seq 回写 meta。
		// 此前 142 条记忆里 141 条 sourceSeqs 为空，memory_expand 形同虚设。
		if (exec?.name === "memory_write" && !result?.isError && exec?.agent?.id) {
			const a = exec.arguments || {};
			const topic = String(a.topic || "").trim();
			if (topic) {
				const kind = a.entry_type === "sop" ? "sop" : "fact";
				const key = kind === "sop" ? slugify(topic) : topic;
				const list = writeProvenance.get(String(exec.agent.id)) ?? [];
				list.push({ kind, key, namespace: maintenance.namespaceFor(exec.agent) ?? (String(a.namespace || "") || null) });
				writeProvenance.set(String(exec.agent.id), list);
			}
		}
		if (!cfg.autoPending || !exec?.agent?.id || maintenance.owns(exec.agent)) return undefined;
		const id = String(exec.agent.id);
		const toolName = exec.name || "unknown";
		if (result?.isError) {
			const m = retryTrackers.get(id) ?? new Map();
			const rec = m.get(toolName) ?? { fails: 0, lastErrorTail: "" };
			rec.fails += 1;
			rec.lastErrorTail = resultTail(result);
			m.set(toolName, rec);
			retryTrackers.set(id, m);
		} else {
			const m = retryTrackers.get(id);
			if (m?.has(toolName)) {
				const rec = m.get(toolName);
				const seqs = capturedSequences.get(id) ?? [];
				seqs.push({
					tool: toolName,
					fails: rec.fails,
					errorTail: rec.lastErrorTail,
					successTail: resultTail(result),
				});
				capturedSequences.set(id, seqs);
				m.delete(toolName);
			}
		}
		return undefined;
	}));

	// [0.6.1 N7] 此前整段 turn/end 由一个约 70 行的空 catch 兜底：任何代码级错误（0.6.0 的
	// rmSync ReferenceError 即教训）都会无痕消失。现按关键段拆分防护：每段独立 try/catch +
	// warnOnce（同类只 warn 一次的 console.warn，不再静默）；agent.inject 按 cookbook 单独
	// 包 try/catch（防范已 dispose 的 agent），inject 失败不再连带跳过 reflectionState 更新。
	const warnOnce = (key, step, err) => {
		if (turnEndWarned.has(key)) return;
		turnEndWarned.add(key);
		const msg = `[dsh-layered-memory] turn/end \"${step}\" 失败（同类仅提醒一次）: ${err?.stack || err}`;
		if (typeof ctx.logger?.warn === "function") {
			try { ctx.logger.warn(msg); } catch { /* logger 故障降级 console */ }
		}
		try { console.warn(msg); } catch { /* console 不可用（非常规宿主）时放弃提醒 */ }
	};
	
	// [0.6.8] 收集本回合的工具结果事件 seq，供 turn/end 写入 sourceSeqs。
	// 只保留最近 400 条，避免长会话无界增长。
	disposers.push(ctx.on("session/event", (session, event) => {
		if (!event || event.type !== "tool/result" || typeof event.seq !== "number") return undefined;
		const id = String(session?.id ?? "");
		if (!id) return undefined;
		const arr = toolResultSeqs.get(id) ?? [];
		arr.push(event.seq);
		if (arr.length > 400) arr.splice(0, arr.length - 400);
		toolResultSeqs.set(id, arr);
		return undefined;
	}));

	disposers.push(ctx.on("session/event", (session, event) => {
		if (!event || event.type !== "turn/end") return undefined;
		const sessionId = String(session?.id ?? "");
		// [0.6.3] 交互会话判据：Agent Teams 开启后同一进程会并发存在 N 个 teammate 会话，
		// 它们各自发 turn/end。轮次计数与反思注入只认交互（无 parentSession）会话，否则
		// maintainEveryTurns 被 teammate 轮次按 N 倍稀释，且「去改共享记忆」的提示会发给
		// 只读型 teammate。headless 一次性会话无 parent，仍计入（原语义保留）。
		const isInteractive = session?.header?.parentSession === undefined;
		let root;
		let totalTurns = 0;
		try {
			root = io.resolveRoot();
			totalTurns = isInteractive ? bumpTurnCounter(root) : 0;
		} catch (err) {
			warnOnce("resolve", "命名空间解析/turn 计数", err);
			return undefined;
		}
	
		// ── 溯源回写：把本次会话 id 与本回合的工具结果 seq 补进刚写入条目的 meta ──
		try {
			const turnToolSeqs = toolResultSeqs.get(sessionId);
			toolResultSeqs.delete(sessionId);
			const writes = writeProvenance.get(sessionId);
			if (Array.isArray(writes) && writes.length) {
				// [0.6.8] 优先写本回合的工具结果事件（含证明该条目的实测输出）；
				// 宿主未提供 tool/result 事件时退回 turn/end 自身 seq（原行为）。
				const seqs = Array.isArray(turnToolSeqs) && turnToolSeqs.length
					? [...turnToolSeqs]
					: (typeof event?.seq === "number" ? [event.seq] : []);
				for (const w of writes) {
					try {
						const wRoot = w.namespace ? nsRoot(cfg.memoryDir, resolveNamespace(cfg, w.namespace)) : root;
						const prev = getEntryMeta(wRoot, w.kind, w.key);
						if (!prev) continue;
						const patch = {};
						if (!prev.sourceSession) patch.sourceSession = sessionId;
						if (!Array.isArray(prev.sourceSeqs) || prev.sourceSeqs.length === 0) patch.sourceSeqs = seqs;
						if (Object.keys(patch).length) setEntryMeta(wRoot, w.kind, w.key, patch);
					} catch { /* 单条溯源补全失败跳过该条，其余照常（段级异常另有 warnOnce） */ }
				}
				writeProvenance.delete(sessionId);
			}
		} catch (err) {
			warnOnce("provenance", "溯源回写", err);
		}
	
		// ── 自动蒸馏：只有重试序列才写候选 ──
		try {
			if (cfg.autoPending && sessionId) {
				const seqs = capturedSequences.get(sessionId);
				if (Array.isArray(seqs) && seqs.length > 0) {
					writePending(root, {
						sourceSession: sessionId,
						sourceSeqs: typeof event?.seq === "number" ? [event.seq] : [],
						retries: seqs,
						reason: `本回合出现 ${seqs.length} 个「先失败后成功」的重试序列（${seqs.map((s) => s.tool).join(", ")}），可能值得沉淀为 SOP。请用 memory_accept 确认后入正式记忆，或直接忽略。`,
					});
					capturedSequences.delete(sessionId);
				}
			}
		} catch (err) {
			warnOnce("distill", "自动蒸馏落盘", err);
		}
	
		// ── 周期维护（持久全局计数）──
try {
	if ((cfg.reflectionMode === "notify" || !cfg.reflectionEnabled) && isInteractive && cfg.maintainEveryTurns > 0 && totalTurns > 0 && totalTurns % cfg.maintainEveryTurns === 0) {
		// [0.6.3] runMaintain 实测一次约 1.26s（去重 O(n²) + 重写 index.txt + 写报告）。
		// 此前它在宿主 Session.append 的同步发布窗口内执行，会拖长该窗口并与其它观察器的
		// 重入守卫相邻；移到宏任务让本次发布先收口。再加最短间隔节流，避免多会话密集
		// turn/end 时同一阈值被重复排队。
		// [0.6.6] 句柄统一登记，插件清理时取消（此前排队中的维护会跨 dispose 继续执行，审查 R12）。
		const nowMs = Date.now();
		if (nowMs - lastMaintainAt >= MAINTAIN_MIN_INTERVAL_MS) {
			lastMaintainAt = nowMs;
			const mRoot = root;
			scheduleImmediate(() => {
				try { runMaintain(mRoot, cfg.l1MaxChars, cfg.maintainOpts); }
				catch (err) { warnOnce("maintain-async", "周期维护（延迟执行）", err); }
			});
		}
	}
} catch (err) {
	warnOnce("maintain", "周期维护", err);
}

// ── 阈值反思注入（[0.6.6] 冷却前置 + 命名空间级消警 + 投递前复核）──
// [0.6.6] 三处语义修正（专项审查 F1/F4/F6）：
// 1) 先做廉价资格判断（开关 / 冷却），再做内容扫描。此前每轮 turn/end 都要遍历 SOP
//    并逐条 isArchived（每条重读整份 memory-meta.json），冷却期内也一样（R10：46 条
//    SOP 的一次冷却回合实测 46 次全量解析）。
// 2) 判定依据从「存量阈值」改为「内容版本 + 维护终态」：同一 revision 已有
//    no_action/done 结论时静默，已通知过同一 revision 也静默。新会话、并行会话、
//    重载都不会重新喊话（R1/R3/R4/R5/R9/R11）；阈值 0 现在是「关闭该判据」而不是恒真（R8）。
// 3) 投递前二次复核（disposed / 版本是否已被维护解决 / 是否已通知），排队中的过期
//    提醒不再送达（R6/R7）。
try {
	if (isInteractive && sessionId && cfg.reflectionEnabled && cfg.reflectionMode !== "notify") {
		const prev = reflectionState.get(sessionId) ?? { lastReflectionTurn: -Infinity };
		const periodic = cfg.maintainEveryTurns > 0 && totalTurns % cfg.maintainEveryTurns === 0;
		if (periodic || totalTurns - prev.lastReflectionTurn >= cfg.reflectCooldownTurns) {
			reflectionState.set(sessionId, { lastReflectionTurn: totalTurns });
			if (periodic || readReflectionState(root).agentStatus === "deferred" || reflectionBuckets(collectReflectionSignals(root), cfg).length) {
				const namespace = resolveNamespace(cfg); // freeze namespace with this root
				scheduleImmediate(() => {
					if (disposed) return;
					const parent = ctx.get("agents")?.get?.(sessionId);
					void maintenance.request(root, namespace, parent).catch(err => warnOnce("maintenance-agent", "独立记忆维护", err));
				});
			}
		}
	} else if (isInteractive && sessionId && cfg.reflectionEnabled) {
		const prevReflection = reflectionState.get(sessionId) ?? { lastReflectionTurn: -Infinity };
		const cooled = totalTurns - prevReflection.lastReflectionTurn >= cfg.reflectCooldownTurns;
		if (cooled) {
			// 冷却已满足：本会话在本窗口内只评估一次，避免逐轮重复求值。
			reflectionState.set(sessionId, { lastReflectionTurn: totalTurns });
			const persisted = readReflectionState(root);
			const revision = computeContentRevision(root);
			if (!isSettledRevision(persisted, revision)) {
				const signals = collectReflectionSignals(root);
				const decision = decideReflection({ enabled: true, cooled, state: persisted, revision, signals, cfg });
				if (decision.notify) {
					const agentsService = ctx.get("agents");
					const agent = agentsService?.get?.(sessionId);
					if (!agent || typeof agent.inject !== "function") {
						if (!reflectDiagDone) {
							reflectDiagDone = true;
							warnOnce("reflect-skip", "阈值反思判定通过但无法注入", new Error("agent=" + (agent ? "found" : "missing") + " injectFn=" + typeof agent?.inject + " buckets=" + decision.buckets.join(",") + " sops=" + signals.sops + " pending=" + signals.pending + " index=" + signals.indexChars + "/" + cfg.l1MaxChars + " autoPending=" + cfg.autoPending + " cooldown=" + cfg.reflectCooldownTurns));
						}
					} else {
						// [0.6.1 I5] source.plugin 用插件导出名 layered-memory（src/index.js），与 skill 名区分。
						// [0.6.3] 宿主 inject 只做 inbox.splice、不校验形状，故手搓等价 UserMessage 形状。
						// [0.6.6] 文本显式标注「插件自动提醒，非用户消息」：来源标签不是调度约束，
						// 标注只是辅助，确定性抑制由上面的状态机负责。
						const reflectionPayload = {
							id: randomUUID(),
							role: "user",
							content: [{ type: "text", text: buildReflectionText(decision.buckets, signals, cfg) }],
							source: { kind: "plugin", plugin: "layered-memory" },
						};
						const targetSession = sessionId;
						scheduleTimeout(() => {
							if (disposed) return;
							try {
								const fresh = readReflectionState(root);
								const freshRevision = computeContentRevision(root);
								if (fresh?.notifiedRevision === freshRevision) return;
								if (isSettledRevision(fresh, freshRevision)) return;
								const liveAgent = ctx.get("agents")?.get?.(targetSession);
								if (!liveAgent || typeof liveAgent.inject !== "function") return;
								liveAgent.inject(reflectionPayload);
								writeReflectionState(root, {
									notifiedRevision: freshRevision,
									notifiedAt: new Date().toISOString(),
									notifiedSession: targetSession,
									notifiedBuckets: decision.buckets,
								});
							} catch (err) {
								warnOnce("inject", "反思注入（agent 可能已 dispose）", err);
							}
						});
					}
				}
			}
		}
	}
} catch (err) {
	warnOnce("reflect", "阈值反思判定", err);
}
		return undefined;
	}));
		disposers.push(ctx.on("agent/disposed", ({ agent }) => {
		if (!agent) return undefined;
		const id = String(agent.id);
		// [v0.6] 先落盘再清账：此前直接 delete 会丢掉已捕获但未等到 turn/end 的重试序列。
		if (cfg.autoPending) {
			const seqs = capturedSequences.get(id);
			if (Array.isArray(seqs) && seqs.length > 0) {
				try {
					writePending(io.resolveRoot(), {
						sourceSession: id,
						sourceSeqs: [],
						retries: seqs,
						reason: `会话 dispose 前捕获 ${seqs.length} 个「先失败后成功」的重试序列（${seqs.map((s) => s.tool).join(", ")}），未等到 turn/end，先落候选。`,
					});
				} catch { /* 清理失败不阻断 dispose */ }
			}
		}
		retryTrackers.delete(id);
		capturedSequences.delete(id);
		reflectionState.delete(id);
		writeProvenance.delete(id);
		toolResultSeqs.delete(id);
		return undefined;
	}));

	return () => {
		// [0.6.6] 先取消排队中的宏任务，再注销事件订阅：缺这一步时，插件卸载后
		// 已排队的提醒与周期维护仍会执行（审查 R6/R12）。
		disposed = true;
		maintenance.dispose();
		for (const h of timers) {
			try { clearTimeout(h); } catch { /* 忽略 */ }
			try { clearImmediate(h); } catch { /* 忽略 */ }
		}
		timers.clear();
		for (const fn of disposers.reverse()) {
			try { fn(); } catch { /* 忽略 */ }
		}
	};
}
