import { Service } from "@deepseek-ai/cordis";
import { bindTypertRemote } from "@deepseek-ai/dsh-typert-protocol";
import { STATUS_PACKAGE, STATUS_SERVICE, STATUS_REMOTE, STORE_REMOTE } from "./status-contract.js";

export const name = "layered-memory-status";
export const inject = ["layeredMemoryActivity", "layeredMemoryWorkers", "layeredMemoryStore", "typert"];

function historyRows(events) {
	const rows = [];
	for (const event of events) {
		const at = new Date(event.time).toISOString();
		const add = (kind, text) => { if (text) rows.push({ id: event.seq + ":" + kind, kind, text, at }); };
		if (event.type === "assistant/message") {
			for (const kind of ["text", "reasoning"]) add(kind === "text" ? "assistant" : "reasoning", event.data.message.content.filter(block => block.type === kind).map(block => block.text).join("\n"));
		} else if (event.type === "tool/call") {
			add("tool", event.data.name + "\n" + event.data.arguments);
		} else if (event.type === "tool/result") {
			add("result", event.data.error?.reason || event.data.message.content.filter(block => block.type === "text").map(block => block.text).join("\n"));
		} else if (event.type === "turn/end") {
			const reason = event.data.reason;
			if (reason.kind === "error") add("notice", reason.error.message);
			else if (reason.kind === "aborted" && reason.reason.kind === "hook") add("notice", reason.reason.reason);
		}
	}
	return rows;
}

class MemoryStatus extends Service {
	constructor(ctx) {
		super(ctx, STATUS_SERVICE);
		this.typertRemote = bindTypertRemote(this, STATUS_SERVICE);
		this.lifetime = new AbortController();
		ctx.effect(() => () => this.lifetime.abort(), "memory-status: streams");
	}
	getSnapshot(sessionId, signal) {
		return this.ctx.layeredMemoryActivity.getSnapshot(sessionId, AbortSignal.any([signal, this.lifetime.signal]));
	}
	watch(sessionId, signal) {
		return this.ctx.layeredMemoryActivity.watch(sessionId, AbortSignal.any([signal, this.lifetime.signal]));
	}
	async listWorkers(sessionId, signal) {
		AbortSignal.any([signal, this.lifetime.signal]).throwIfAborted();
		return this.ctx.layeredMemoryWorkers.list(sessionId);
	}
	async readWorker(sessionId, workerId, offset, limit, signal) {
		const abort = AbortSignal.any([signal, this.lifetime.signal]);
		abort.throwIfAborted();
		const page = await this.ctx.layeredMemoryWorkers.read(sessionId, workerId, { offset, limit });
		abort.throwIfAborted();
		return { workerId: page.id, purpose: page.purpose, rows: historyRows(page.events), offset: page.offset, nextOffset: page.nextOffset, hasMore: page.hasMore, hasPrevious: page.hasPrevious, totalEvents: page.totalEvents, minOffset: page.minOffset };
	}
	async stopWorker(sessionId, workerId, signal) {
		AbortSignal.any([signal, this.lifetime.signal]).throwIfAborted();
		return this.ctx.layeredMemoryWorkers.stop(sessionId, workerId);
	}
	async callStore(method, args, signal) {
		const abort = AbortSignal.any([signal, this.lifetime.signal]);
		abort.throwIfAborted();
		const value = await this.ctx.layeredMemoryStore[method](...args);
		abort.throwIfAborted();
		return value;
	}
	async listNamespaces(signal) { return this.callStore("listNamespaces", [], signal); }
	async listEntries(args, signal) { return this.callStore("listEntries", [args], signal); }
	async readEntry(args, signal) { return this.callStore("readEntry", [args], signal); }
	async createEntry(args, signal) { return this.callStore("createEntry", [args], signal); }
	async updateEntry(args, signal) { return this.callStore("updateEntry", [args], signal); }
	async setArchived(args, signal) { return this.callStore("setArchived", [args], signal); }
	async entryHistory(args, signal) { return this.callStore("entryHistory", [args], signal); }
	async rollbackEntry(args, signal) { return this.callStore("rollbackEntry", [args], signal); }
}

export function apply(ctx) {
	ctx.typert.register({ package: STATUS_PACKAGE, face: "host", schemas: [], model: { services: [], events: [], objects: [] }, invocations: [...STATUS_REMOTE.descriptors, ...STORE_REMOTE.descriptors] });
	ctx.plugin(MemoryStatus);
}
