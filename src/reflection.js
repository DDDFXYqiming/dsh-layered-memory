// [0.6.6] 命名空间级反思调度状态。
//
// 动因（2026-09-19 专项审查，审计基线 3729dfe）：0.6.2/0.6.3 修通了此前被宿主重入
// 守卫挡住的提醒投递，但反思判定只看「存量阈值」，既不读取维护结果，也没有
// 「这批内容已经检查过」的状态。于是健康记忆库（46 条互不重复的 SOP）一旦越过
// reflectSopsThreshold，就会在每个新会话、每次重载、每个并行会话里反复要求模型去做
// 一次根本没有待办的维护。
//
// 本模块把判断依据从「库里有多少条记忆」换成「这份内容是否已经检查过、结论是什么」：
// - revision：命名空间内容的稳定指纹。**只含内容面**，不含时间戳/热度/轮次/报告时刻
//   这类自写自增字段——否则每检查一次就把自己标脏，重新变成自激循环。
// - outcome：一次维护的终态。no_action 是**有效终态**，不是下一轮重试的理由。
// - notifiedRevision：已经通知过的版本。同一版本只通知一次，跨会话、跨重载保持。
//
// 自动周期维护（events.js）与手动 memory_maintain（maintain.js）共用这一份状态，
// 所以模型手动跑完维护同样能消警。

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { casRewrite, hashText, META_FILE, PENDING_DIR } from "./store.js";

export const REFLECTION_STATE_FILE = "reflection-state.json";

/** 一次维护的终态。 */
export const REFLECTION_OUTCOME = {
	/** 检查完成，没有任何需要处理的待办（健康存量的正常终态）。 */
	NO_ACTION: "no_action",
	/** 存在需要人工/模型确认的候选（合并候选、索引超预算）。 */
	NEEDS_REVIEW: "needs_review",
	/** 本次维护实际处理了内容（去重归档等），且处理后没有遗留待办。 */
	DONE: "done",
	/** 维护执行失败，允许按冷却窗口重试。 */
	FAILED: "failed",
};

/** 已落定、无需再次提醒的终态。needs_review 不在其中——它靠 notifiedRevision 去重。 */
export const SETTLED_OUTCOMES = new Set([REFLECTION_OUTCOME.NO_ACTION, REFLECTION_OUTCOME.DONE]);

/** stat 指纹：size + 毫秒级 mtime。取整避免浮点抖动。 */
function stampOf(path) {
	try {
		const s = statSync(path);
		return `${s.size}:${Math.round(s.mtimeMs)}`;
	} catch {
		return "-";
	}
}

function listMarkdown(dir) {
	try {
		return readdirSync(dir).filter((f) => f.endsWith(".md")).sort();
	} catch {
		return [];
	}
}

/**
 * 命名空间内容指纹。包含 facts.md、index.txt、memory-meta.json、sops/*.md、pending/*.md
 * 的存在性与体积/修改时刻；**排除** turn-state.json、file_access_stats.json、
 * maintenance-report.json、reflection-state.json（这些是每轮自写字段，纳入即自激）。
 */
export function computeContentRevision(root) {
	const parts = [
		`facts.md=${stampOf(join(root, "facts.md"))}`,
		`index.txt=${stampOf(join(root, "index.txt"))}`,
		`meta=${stampOf(join(root, META_FILE))}`,
	];
	for (const f of listMarkdown(join(root, "sops"))) parts.push(`sops/${f}=${stampOf(join(root, "sops", f))}`);
	for (const f of listMarkdown(join(root, PENDING_DIR))) parts.push(`pending/${f}=${stampOf(join(root, PENDING_DIR, f))}`);
	return hashText(parts.join("\n"));
}

export function readReflectionState(root) {
	try {
		const raw = JSON.parse(readFileSync(join(root, REFLECTION_STATE_FILE), "utf8"));
		return raw && typeof raw === "object" ? raw : {};
	} catch {
		return {};
	}
}

/** 读改写（CAS，多宿主进程共享同一命名空间时不会互相覆盖）；内容无变化则不重写。 */
export function writeReflectionState(root, patch) {
	let out = null;
	casRewrite(join(root, REFLECTION_STATE_FILE), (text) => {
		let cur = null;
		try { cur = text === null ? null : JSON.parse(text); } catch { cur = null; }
		if (!cur || typeof cur !== "object") cur = {};
		out = { ...cur, ...patch, updatedAt: new Date().toISOString() };
		const next = JSON.stringify(out, null, 2);
		return next === text ? null : next;
	});
	return out;
}

/**
 * 反思判据信号。读取顺序有意优化：meta 只读一次，再按归档状态过滤 SOP 名单，
 * 避免此前「每个 SOP 一次 isArchived → 每次重读整份 memory-meta.json」的 O(n) 全量解析。
 * 注意：[0.6.6] 起阈值 0 表示**关闭该判据**（此前 0 恒满足，形同恒真）。
 */
export function collectReflectionSignals(root) {
	const meta = readMetaSafe(root);
	const sopsMeta = meta?.sops && typeof meta.sops === "object" ? meta.sops : {};
	const archived = new Set(Object.keys(sopsMeta).filter((k) => sopsMeta[k]?.archived));
	const sops = listSopNames(root, meta);
	const pending = listMarkdown(join(root, PENDING_DIR)).length;
	const indexChars = indexCharsOf(root);
	return { sops: sops.filter((s) => !archived.has(s)).length, pending, indexChars };
}

// 以下两个薄包装避免本模块 import store 的具体实现细节过多（store 已有同名导出，
// 这里只是把「一次读 meta」的口径固定在反思路径上）。
function readMetaSafe(root) {
	try {
		return JSON.parse(readFileSync(join(root, META_FILE), "utf8"));
	} catch {
		return { facts: {}, sops: {} };
	}
}

function listSopNames(root, meta) {
	const reserved = new Set(["readme", "license", "index"]);
	return listMarkdown(join(root, "sops"))
		.map((f) => f.replace(/\.md$/, ""))
		.filter((n) => !reserved.has(n.toLowerCase()));
}

function indexCharsOf(root) {
	try {
		return readFileSync(join(root, "index.txt"), "utf8").replace(/\r\n?/g, "\n").replace(/\n+$/, "").length;
	} catch {
		return 0;
	}
}

/** 触发原因（bucket）列表。任一条目未命中即返回空数组。 */
export function reflectionBuckets(signals, cfg = {}) {
	const buckets = [];
	const pendingThreshold = Number(cfg.reflectPendingThreshold) || 0;
	if (cfg.autoPending && pendingThreshold > 0 && signals.pending >= pendingThreshold) buckets.push("pending");
	const sopsThreshold = Number(cfg.reflectSopsThreshold) || 0;
	// [0.6.6] 阈值 0 = 关闭该判据（旧语义 0 恒真，是个误配陷阱）。
	if (sopsThreshold > 0 && signals.sops >= sopsThreshold) buckets.push("sops");
	if (Number(signals.indexChars) > Number(cfg.l1MaxChars)) buckets.push("index");
	return buckets;
}

/**
 * 纯函数决策。返回 { notify, reason, buckets }：
 * - disabled / cooldown / no-signal：不通知；
 * - settled：同一内容版本已有终态结论（no_action/done）→ 静默，这是本轮修复的核心；
 * - already-notified：同一内容版本已通知过一次 → 静默；
 * - triggered：通知。
 */
export function decideReflection({ enabled, cooled, state, revision, signals, cfg }) {
	if (!enabled) return { notify: false, reason: "disabled", buckets: [] };
	if (!cooled) return { notify: false, reason: "cooldown", buckets: [] };
	const buckets = reflectionBuckets(signals, cfg);
	if (!buckets.length) return { notify: false, reason: "no-signal", buckets };
	if (state?.revision === revision && SETTLED_OUTCOMES.has(state?.outcome)) {
		return { notify: false, reason: "settled", buckets };
	}
	if (state?.notifiedRevision === revision) {
		return { notify: false, reason: "already-notified", buckets };
	}
	return { notify: true, reason: "triggered", buckets };
}

/** 同一内容版本是否已有终态结论（events 热路径的廉价短路，避免收集信号）。 */
export function isSettledRevision(state, revision) {
	return state?.revision === revision && SETTLED_OUTCOMES.has(state?.outcome);
}

/**
 * 维护结果回写。runMaintain 收尾调用（自动与手动两条入口共用）。
 * 记录这批内容**已经检查过**，以及检查结论，供下一次反思判定消费。
 */
export function recordMaintainOutcome(root, report) {
	const revision = computeContentRevision(root);
	const mergeCandidates = Array.isArray(report?.mergeCandidates) ? report.mergeCandidates.length : 0;
	const removed = Array.isArray(report?.dedupe?.removed) ? report.dedupe.removed.length : 0;
	const merged = Array.isArray(report?.dedupe?.merged) ? report.dedupe.merged.length : 0;
	const overLimit = Boolean(report?.index?.over_limit);
	let outcome = REFLECTION_OUTCOME.NO_ACTION;
	if (mergeCandidates > 0 || overLimit) outcome = REFLECTION_OUTCOME.NEEDS_REVIEW;
	else if (removed > 0 || merged > 0) outcome = REFLECTION_OUTCOME.DONE;
	return writeReflectionState(root, {
		revision,
		outcome,
		lastScanAt: new Date().toISOString(),
		lastReportAt: typeof report?.runAt === "string" ? report.runAt : null,
		lastCounts: {
			sops: Number(report?.stats?.sops ?? 0),
			pending: Number(report?.stats?.pending ?? 0),
			indexChars: Number(report?.index?.index_chars_actual ?? report?.index?.index_chars ?? 0),
		},
		mergeCandidates,
		overLimit,
	});
}

/** 维护失败时记录 failed（允许后续冷却窗口重试），不让失败被误判为「已检查过」。 */
export function recordMaintainFailure(root, error) {
	try {
		return writeReflectionState(root, {
			outcome: REFLECTION_OUTCOME.FAILED,
			lastErrorAt: new Date().toISOString(),
			lastError: String(error?.message || error || "unknown").slice(0, 200),
		});
	} catch {
		return null;
	}
}
