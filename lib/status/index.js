import { Service } from "@deepseek-ai/cordis";
import { bindTypertRemote } from "@deepseek-ai/dsh-typert-protocol";
import { STATUS_PACKAGE, STATUS_SERVICE, STATUS_REMOTE } from "./status-contract.js";

export const name = "layered-memory-status";
export const inject = ["layeredMemoryActivity", "typert"];

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
}

export function apply(ctx) {
	ctx.typert.register({ package: STATUS_PACKAGE, face: "host", schemas: [], model: { services: [], events: [], objects: [] }, invocations: STATUS_REMOTE.descriptors });
	ctx.plugin(MemoryStatus);
}
