import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { readEntries, readEntry, rewriteFile, hashText } from "./store.js";

export const REVIEW_STATE_FILE = "review-state.json";
export const REVIEW_CHANGE_THRESHOLD = 20;
export const REVIEW_CANDIDATE_LIMIT = 8;
const keyOf = entry => JSON.stringify([entry.kind, entry.key]);
const refOf = entry => ({ kind: entry.kind, key: entry.key });
const now = () => new Date().toISOString();
const fingerprint = entry => hashText(JSON.stringify([entry.title, entry.content.replace(/\s+/g, " ").trim()]));
const emptyState = () => ({ version: 1, pressure: null, completedPressure: [], conflicts: [], ordinaryChanges: {}, baseline: {}, overLimit: false, aboveTarget: false, targetChars: null, indexChars: null, stallRounds: 0, exhausted: false });
// 平均一个条目名在索引里约占的字符数（含分隔符），用于把「还差多少字符」换算成「还要动多少条」。
export const CHARS_PER_ENTRY = 35;
// 候选上限按缺口放大：缺口越大，一轮该看的条目越多，避免小步挪动永远追不上。
export function candidateLimitFor(gapChars) {
	const gap = Number(gapChars) || 0;
	return Math.min(24, Math.max(REVIEW_CANDIDATE_LIMIT, Math.ceil(gap / CHARS_PER_ENTRY)));
}

export function readReviewState(root) {
	try { return JSON.parse(readFileSync(join(root, REVIEW_STATE_FILE), "utf8")); }
	catch (error) { if (error.code === "ENOENT") return emptyState(); throw error; }
}
function update(root, change) {
	let result;
	rewriteFile(join(root, REVIEW_STATE_FILE), text => {
		const state = text === null ? emptyState() : JSON.parse(text);
		const previous = JSON.stringify(state);
		result = change(state);
		if (JSON.stringify(state) === previous) return null;
		state.updatedAt = now();
		return JSON.stringify(state, null, 2);
	});
	return result;
}
function itemFor(entry) {
	return { entry: refOf(entry), revision: entry.revision, status: "pending" };
}
function rememberWaiting(state, item, reviewed) {
	let conflict = state.conflicts.find(job => keyOf(job.items[0].entry) === keyOf(item.entry));
	if (!conflict) {
		conflict = { id: randomUUID(), kind: "evidence_conflict", createdAt: now(), evidence: [], reviewed: [], items: [] };
		state.conflicts.push(conflict);
	}
	if (!conflict.status || conflict.status === "complete") {
		conflict.status = "waiting_evidence"; conflict.reason = item.reason;
		conflict.items = [{ ...item }];
		delete conflict.completedAt;
	}
	for (const result of reviewed) {
		if (!conflict.reviewed.some(previous => previous.revision === result.revision && previous.status === result.status && previous.reason === result.reason)) conflict.reviewed.push(result);
	}
	return conflict.id;
}
function settle(state, entries) {
	for (const job of [state.pressure, ...state.conflicts].filter(Boolean)) {
		if (job.status === "complete" || job.items === null) continue;
		const pending = job.items.some(item => item.status === "pending");
		if (job === state.pressure && !pending) {
			for (const item of job.items.filter(item => item.status === "waiting_evidence")) {
				item.waitingReviewId = rememberWaiting(state, item, job.reviewed.filter(result => keyOf(result.entry) === keyOf(item.entry)));
			}
		}
		job.status = pending ? "pending" : job === state.pressure ? "complete"
			: job.items.some(item => item.status === "waiting_evidence") ? "waiting_evidence" : "complete";
		if (job.status === "complete") {
			job.completedAt = now();
			if (job === state.pressure) {
				state.ordinaryChanges = {};
				state.baseline = Object.fromEntries(entries.filter(entry => !entry.meta.archived).map(entry => [keyOf(entry), fingerprint(entry)]));
			}
		}
	}
}
function refresh(state, entries) {
	const active = new Map(entries.filter(entry => !entry.meta.archived).map(entry => [keyOf(entry), entry]));
	for (const job of [state.pressure, ...state.conflicts].filter(Boolean)) {
		if (job.status === "complete") continue;
		for (const item of job.items || []) {
			if (!["pending", "waiting_evidence"].includes(item.status)) continue;
			const entry = active.get(keyOf(item.entry));
			if (!entry) {
				item.status = "inactive"; item.reason = "条目已归档或消失，无需继续审阅"; item.resolvedAt = now();
			} else if (item.revision !== entry.revision) {
				item.revision = entry.revision; item.status = "pending";
			}
		}
	}
	settle(state, entries);
}
function summary(state, workIds) {
	const jobs = [state.pressure, ...state.conflicts].filter(job => job && (!workIds || workIds.includes(job.id)));
	const pressure = jobs.find(job => job.kind === "index_pressure");
	return {
		ready: jobs.some(job => job.status === "pending"),
		waiting: jobs.filter(job => job.status !== "complete").reduce((n, job) => n + (job.items || []).filter(item => item.status === "waiting_evidence").length, 0),
		ordinaryChanges: Object.keys(state.ordinaryChanges).length,
		// 水位线信息：目标字符、当前字符与缺口，提示词与候选数都据此决定规模。
		aboveTarget: state.aboveTarget === true,
		// 已到可压缩极限：缺口还在，但连续两轮几乎压不动，需要人工决定是否接受或重组条目结构。
		exhausted: state.exhausted === true,
		stallRounds: state.stallRounds ?? 0,
		targetChars: state.targetChars ?? null,
		indexChars: state.indexChars ?? null,
		gapChars: state.targetChars == null || state.indexChars == null ? null : Math.max(0, state.indexChars - state.targetChars),
		pressure: pressure ? { id: pressure.id, status: pressure.status, selectionNeeded: pressure.items === null,
			startChars: pressure.startChars ?? null, targetChars: pressure.targetChars ?? null, gapChars: pressure.gapChars ?? null } : null,
		conflicts: jobs.filter(job => job.kind === "evidence_conflict" && job.status !== "complete").map(job => ({ id: job.id, status: job.status, entry: job.items[0].entry })),
		revision: hashText(JSON.stringify(jobs)),
	};
}

export function syncReview(root, { overLimit, aboveTarget = overLimit, targetChars = null, indexChars = null, entries = readEntries(root), origin }) {
	return update(root, state => {
		refresh(state, entries);
		state.overLimit = overLimit;
		state.aboveTarget = aboveTarget === true;
		state.targetChars = targetChars ?? null;
		state.indexChars = indexChars ?? null;
		const gapChars = targetChars == null || indexChars == null ? null : Math.max(0, indexChars - targetChars);
		const progressed = state.pressure?.items?.some(item => item.status === "changed") === true;
		// 停滞保护：剩下的条目若已不可合并、也不该归档，续派只会无限空转。
		// 用「上一轮起点与本轮实际字符」判断收益：收益不足 3%（且不足 40 字符）记一次停滞，连续两次就停止续派。
		const lastJob = state.pressure?.status === "complete" ? state.pressure : state.completedPressure.at(-1);
		const lastStart = Number(lastJob?.startChars);
		const gain = Number.isFinite(lastStart) && indexChars != null ? lastStart - indexChars : null;
		// 阈值按缺口算而不是按总量：缺口 1200 时一轮至少该省 60 字符（约两条），省不到就算没进展。
		const stallFloor = Math.max(40, Math.floor((gapChars ?? 0) * 0.05));
		// 收益为负说明期间又写了新条目，属正常增长，重置计数。
		if (gain == null || gain <= 0) state.stallRounds = 0;
		else state.stallRounds = gain < stallFloor ? (state.stallRounds ?? 0) + 1 : 0;
		state.exhausted = (state.stallRounds ?? 0) >= 2;
		// 收敛判据：作业目标是压到水位线以下，不是「不超过上限」。上一轮真的改动过条目说明还能继续收敛，直接续派；
		// 整轮零改动才回落到日常变更门槛，避免空转烧 token。停滞到极限后不再续派。
		if (aboveTarget && !state.exhausted && (!state.pressure || state.pressure.status === "complete" && (progressed || Object.keys(state.ordinaryChanges).length >= REVIEW_CHANGE_THRESHOLD))) {
			if (state.pressure) state.completedPressure.push(state.pressure);
			state.pressure = { id: randomUUID(), kind: "index_pressure", status: "pending", createdAt: now(), items: null, reviewed: [],
				startChars: indexChars ?? null, targetChars: targetChars ?? null, gapChars,
				...(origin?.memoryChanges.length ? { ownerSession: origin.parentSession, trigger: origin.trigger } : {}) };
		} else if (state.pressure && state.pressure.status !== "complete" && state.pressure.items === null) {
			// 还没选题的待办：每轮扫描把起点与缺口刷新到最新，避免用过期缺口决定候选规模。
			state.pressure.startChars = indexChars ?? null;
			state.pressure.targetChars = targetChars ?? null;
			state.pressure.gapChars = gapChars;
		}
		if (origin) {
			const changed = new Set(origin.memoryChanges.map(item => keyOf(item.entry)));
			for (const job of [state.pressure, ...state.conflicts].filter(job => job?.status === "pending")) {
				if (origin.reviewRequests.includes(job.id) || job.items?.some(item => changed.has(keyOf(item.entry)))) {
					job.ownerSession = origin.parentSession;
					job.trigger = origin.trigger;
				}
			}
		}
		return summary(state);
	});
}
export function hasReviewWork(root) {
	return update(root, state => {
		refresh(state, readEntries(root));
		const progressed = state.pressure?.items?.some(item => item.status === "changed") === true;
		return summary(state).ready || state.aboveTarget === true && state.pressure?.status === "complete"
			&& (progressed || Object.keys(state.ordinaryChanges).length >= REVIEW_CHANGE_THRESHOLD);
	});
}
export function recordOrdinaryChange(root, { entry, revision }) {
	return update(root, state => {
		const current = readEntry(root, entry.kind, entry.key);
		if (!current || current.meta.archived || current.revision !== revision || state.pressure?.status !== "complete") return summary(state);
		const key = keyOf(entry);
		if (state.baseline[key] !== fingerprint(current)) state.ordinaryChanges[key] = revision;
		return summary(state);
	});
}

export function enqueueReview(root, { entry, reason, evidence = [], revision }) {
	if (!["fact", "sop"].includes(entry.kind) || !reason?.trim()) throw new Error("审阅需要精确 fact/sop entry 和原因");
	for (const source of evidence) {
		if (!source.text?.trim() || !source.sourceSession || !source.sourceSeqs?.length) throw new Error("审阅证据需要正文及精确来源会话与事件序号");
	}
	return update(root, state => {
		const current = readEntry(root, entry.kind, entry.key);
		if (!current || current.meta.archived) return { queued: false, reason: "inactive_entry" };
		if (revision && revision !== current.revision) throw new Error("审阅条目已变化，请读取当前版本");
		let job = state.conflicts.find(item => keyOf(item.items[0].entry) === keyOf(entry));
		if (!job) {
			job = { id: randomUUID(), kind: "evidence_conflict", createdAt: now(), evidence: [], reviewed: [], items: [itemFor(current)] };
			state.conflicts.push(job);
		}
		const previousEvidence = hashText(JSON.stringify(job.evidence));
		for (const source of evidence) {
			if (!job.evidence.some(item => JSON.stringify(item) === JSON.stringify(source))) job.evidence.push(source);
		}
		const item = job.items[0];
		const changed = !job.status || previousEvidence !== hashText(JSON.stringify(job.evidence)) || item.revision !== current.revision;
		if (changed) {
			item.revision = current.revision; item.status = job.evidence.length ? "pending" : "waiting_evidence";
			item.reason = reason; job.reason = reason; job.status = item.status;
			for (const candidate of state.pressure?.status === "complete" ? [] : state.pressure?.items || []) {
				if (candidate.status === "waiting_evidence" && keyOf(candidate.entry) === keyOf(entry) && previousEvidence !== hashText(JSON.stringify(job.evidence))) candidate.status = "pending";
			}
		}
		settle(state, readEntries(root));
		return { queued: true, changed, id: job.id, status: job.status, entry, revision: current.revision };
	});
}

function workView(state, entries, namespace, workIds) {
	const attach = item => ({ ...item, entry: { namespace, ...item.entry } });
	const jobs = [state.pressure, ...state.conflicts].filter(job => job && job.status !== "complete" && (!workIds || workIds.includes(job.id))).map(job => ({
		...job, items: job.items?.map(attach) ?? null, reviewed: job.reviewed.map(attach),
	}));
	const view = summary(state, workIds);
	// 候选规模由缺口决定：缺口越大，一轮能动的条目越多，才追得上水位线。
	return { ...view, jobs, candidateLimit: candidateLimitFor(view.gapChars ?? 0),
		catalog: jobs.some(job => job.kind === "index_pressure" && job.items === null) ? entries.filter(entry => !entry.meta.archived).map(entry => ({ entry: { namespace, ...refOf(entry) }, title: entry.title, revision: entry.revision })) : [],
	};
}

export function reviewWork(root, namespace, workIds) {
	return update(root, state => {
		const entries = readEntries(root);
		refresh(state, entries);
		return workView(state, entries, namespace, workIds);
	});
}

export function claimReviewWork(root, namespace, { parentSession, trigger, activity, runs }) {
	return update(root, state => {
		const entries = readEntries(root);
		refresh(state, entries);
		const manual = trigger.kind === "manual";
		const selected = [];
		for (const job of [state.pressure, ...state.conflicts].filter(job => job?.status === "pending")) {
			if (manual) {
				job.ownerSession = parentSession;
				job.trigger = trigger;
			}
			if (job.ownerSession !== parentSession) continue;
			const fresh = JSON.stringify(job.trigger) === JSON.stringify(trigger);
			const previous = runs.findLast(run => run.workIds?.includes(job.id));
			const unattempted = !previous || JSON.stringify(previous.workTriggers[job.id]) !== JSON.stringify(job.trigger);
			const continuing = activity?.hasNewEvidence && (unattempted || previous.progressedWorkIds.includes(job.id));
			if (manual || fresh || continuing) selected.push(job.id);
		}
		return workView(state, entries, namespace, selected);
	});
}

export function checkpointReview(root, { candidates, selectionReason, entries: results = [] }, work) {
	return update(root, state => {
		const currentEntries = readEntries(root);
		const pressure = state.pressure;
		if (candidates !== undefined) {
			if (!pressure || pressure.id !== work.pressure?.id || pressure.items !== null) throw new Error("本次没有待选候选的索引审阅");
			if (!selectionReason?.trim() || candidates.length > REVIEW_CANDIDATE_LIMIT || new Set(candidates.map(keyOf)).size !== candidates.length || !candidates.length && work.catalog.length) throw new Error("请说明选题理由并选取少量具体候选");
			pressure.items = candidates.map(entry => {
				const found = work.catalog.find(item => keyOf(item.entry) === keyOf(entry));
				if (!found) throw new Error("候选不在本次完整标题目录中");
				return { entry: refOf(entry), revision: found.revision, status: "pending" };
			});
			pressure.selectionReason = selectionReason;
		}
		for (const result of results) {
			if (result.status === "waiting_evidence" && ["fact", "sop"].includes(result.entry.kind) && ![pressure, ...state.conflicts].some(job => job?.status !== "complete" && job?.items?.some(item => keyOf(item.entry) === keyOf(result.entry)))) {
				rememberWaiting(state, { entry: refOf(result.entry), revision: result.currentRevision, status: "waiting_evidence", reason: result.reason },
					[{ ...result, entry: refOf(result.entry), reviewedAt: now() }]);
			}
			for (const job of [pressure, ...state.conflicts].filter(Boolean)) {
				if (job.status === "complete") continue;
				const assigned = work.jobs.find(item => item.id === job.id);
				if (!assigned || JSON.stringify(assigned.evidence) !== JSON.stringify(job.evidence)) continue;
				const item = job.items?.find(item => keyOf(item.entry) === keyOf(result.entry));
				if (!item || item.status !== "pending") continue;
				Object.assign(item, { revision: result.currentRevision, status: result.status, reason: result.reason });
				job.reviewed.push({ ...result, entry: refOf(result.entry), reviewedAt: now() });
			}
		}
		settle(state, currentEntries);
		return summary(state);
	});
}
