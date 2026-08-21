// 事件接线：自动蒸馏（重试序列捕获）、周期维护（持久计数）、阈值反思注入。
// [v0.5 变更]
// - autoPending 不再为普通成功调用生成垃圾候选，只捕获「同工具先失败后成功」的重试序列；
// - 每 10 轮固定提醒废除，改为阈值触发（pending 过多 / SOP 过多 / 索引超限）+ 冷却；
// - turn 计数持久化到命名空间（跨会话累计），headless 一次性会话也能触发周期维护。

import { join } from "node:path";
import { bumpTurnCounter, pendingNames, sopNames, isArchived } from "./store.js";
import { readIndex } from "./l1index.js";
import { runMaintain } from "./maintain.js";
import { writePending } from "./memory-ops.js";

const REFLECTION_COOLDOWN_TURNS = 10;

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

/**
 * @param ctx cordis context
 * @param cfg 生效配置
 * @param io { resolveRoot, onSkillResult } 依赖回调
 */
export function wireEvents(ctx, cfg, io) {
	const retryTrackers = new Map(); // agentId -> Map(tool -> { fails, lastErrorTail })
	const capturedSequences = new Map(); // agentId -> [{ tool, fails, errorTail, successTail }]
	const reflectionState = new Map(); // sessionId -> { lastReflectionTurn }
	const disposers = [];

	disposers.push(ctx.on("tools/result", (exec, result) => {
		try {
			io.onSkillResult?.(exec, result);
		} catch { /* 激活失败不影响蒸馏 */ }
		if (!cfg.autoPending || !exec?.agent?.id) return undefined;
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

	disposers.push(ctx.on("session/event", (session, event) => {
		if (!event || event.type !== "turn/end") return undefined;
		const sessionId = String(session?.id ?? "");
		try {
			const root = io.resolveRoot();
			const totalTurns = bumpTurnCounter(root);

			// ── 自动蒸馏：只有重试序列才写候选 ──
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

			// ── 周期维护（持久全局计数）──
			if (cfg.maintainEveryTurns > 0 && totalTurns > 0 && totalTurns % cfg.maintainEveryTurns === 0) {
				runMaintain(root, cfg.maxIndexLines);
			}

			// ── 阈值反思注入（带冷却，替代旧的每 10 轮固定提醒）──
			if (sessionId) {
				const pendingCount = pendingNames(root).length;
				const sopCount = sopNames(root).filter((s) => !isArchived(root, "sop", s)).length;
				const indexLines = readIndex(root).split("\n").length;
				const overPending = pendingCount >= cfg.reflectPendingThreshold;
				const overSops = sopCount >= cfg.reflectSopsThreshold;
				const overIndex = indexLines > cfg.maxIndexLines;
				const state = reflectionState.get(sessionId) ?? { lastReflectionTurn: -Infinity };
				const cooled = totalTurns - state.lastReflectionTurn >= REFLECTION_COOLDOWN_TURNS;
				if ((overPending || overSops || overIndex) && cooled) {
					const agentsService = ctx.get("agents");
					const agent = agentsService?.get?.(sessionId);
					if (agent && typeof agent.inject === "function") {
						const parts = [];
						if (overPending) parts.push(`pending 候选已累积 ${pendingCount} 条（阈值 ${cfg.reflectPendingThreshold}），请 memory_pending 逐条审阅：有价值的用 memory_accept 落库，其余忽略`);
						if (overSops) parts.push(`L3 SOP 已达 ${sopCount} 条（阈值 ${cfg.reflectSopsThreshold}），请考虑用 memory_maintain 查看合并候选并整合相近条目`);
						if (overIndex) parts.push(`L1 索引超过 ${cfg.maxIndexLines} 行，建议 memory_maintain 压缩或精简 [RULES]`);
						agent.inject({
							content: [{ type: "text", text: `[记忆整理请求] ${parts.join("；")}。（行动验证公理照旧：只沉淀有证据的内容）` }],
							source: { kind: "plugin", plugin: "memory" },
						});
						reflectionState.set(sessionId, { lastReflectionTurn: totalTurns });
					}
				}
			}
		} catch { /* 事件处理失败不影响主流程 */ }
		return undefined;
	}));

	disposers.push(ctx.on("agent/disposed", ({ agent }) => {
		if (!agent) return undefined;
		const id = String(agent.id);
		retryTrackers.delete(id);
		capturedSequences.delete(id);
		reflectionState.delete(id);
		return undefined;
	}));

	return () => {
		for (const fn of disposers.reverse()) {
			try { fn(); } catch { /* 忽略 */ }
		}
	};
}
