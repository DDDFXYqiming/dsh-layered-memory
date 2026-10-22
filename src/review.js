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
const emptyState = () => ({ version: 1, pressure: null, completedPressure: [], conflicts: [], ordinaryChanges: {}, baseline: {}, overLimit: false });

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
		pressure: pressure ? { id: pressure.id, status: pressure.status, selectionNeeded: pressure.items === null } : null,
		conflicts: jobs.filter(job => job.kind === "evidence_conflict" && job.status !== "complete").map(job => ({ id: job.id, status: job.status, entry: job.items[0].entry })),
		revision: hashText(JSON.stringify(jobs)),
	};
}

export function syncReview(root, { overLimit, entries = readEntries(root), origin }) {
	return update(root, state => {
		refresh(state, entries);
		state.overLimit = overLimit;
		if (overLimit && (!state.pressure || state.pressure.status === "complete" && Object.keys(state.ordinaryChanges).length >= REVIEW_CHANGE_THRESHOLD)) {
			if (state.pressure) state.completedPressure.push(state.pressure);
			state.pressure = { id: randomUUID(), kind: "index_pressure", status: "pending", createdAt: now(), items: null, reviewed: [], ...(origin?.memoryChanges.length ? { ownerSession: origin.parentSession, trigger: origin.trigger } : {}) };
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
		return summary(state).ready || state.overLimit && state.pressure?.status === "complete" && Object.keys(state.ordinaryChanges).length >= REVIEW_CHANGE_THRESHOLD;
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
	return { ...summary(state, workIds), jobs, candidateLimit: REVIEW_CANDIDATE_LIMIT,
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
