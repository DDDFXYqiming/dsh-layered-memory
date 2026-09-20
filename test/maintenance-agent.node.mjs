// No host, credentials or real model required. Exercises the real bounded runner.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, existsSync, utimesSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { createMaintenanceRunner, computeReviewRevision } from "../src/maintenance-agent.js";
import { migrateIndexPolicy, LEGACY_WRITE_POLICY, WRITE_POLICY, AUTO_BEGIN, AUTO_END } from "../src/templates.js";

const defaults = { maintenanceProvider: "spawn", maintenanceCooldownMinutes: 30, maintenanceTimeoutSeconds: 5, maintenanceMaxCalls: 32, maintenanceMaxWrites: 6 };
function fixture(t, behavior = async () => {}, options = {}) {
	const root = mkdtempSync(join(tmpdir(), "memory-agent-test-"));
	mkdirSync(join(root, "sops")); mkdirSync(join(root, "pending"));
	writeFileSync(join(root, "facts.md"), "## original\nverified fact\n");
	writeFileSync(join(root, "index.txt"), "index");
	let state = {}, starts = 0, scans = 0, disposedRuns = 0, runner;
	const warnings = [], defs = new Map();
	const parent = { id: "parent", session: { id: "parent", header: {} } };
	const child = { id: "child", session: { id: "child", header: { parentSession: "parent" } }, ctx: { tools: { register(def) { defs.set(def.name, def); return () => defs.delete(def.name); } } } };
	const exec = { agent: child };
	const tools = ["memory_list", "memory_read", "memory_search", "memory_write", "memory_update", "memory_archive", "memory_stats", "memory_index", "memory_maintain", "memory_promote"].map(name => ({ name, async execute(args) {
		if (name === "memory_read") return { content: readFileSync(join(root, "facts.md"), "utf8"), namespace: args.namespace };
		if (["memory_write", "memory_update", "memory_archive"].includes(name)) writeFileSync(join(root, "facts.md"), args.content || "archived");
		return { namespace: args.namespace };
	} }));
	const service = {
		getProvider: () => options.provider || { inheritsParentContext: false, capabilities: { toolFilter: true, outputSchema: true } },
		async start(name, request) {
			starts++;
			assert.equal(name, "spawn");
			assert.deepEqual(request.toolFilter, { allow: ["memory_maintenance_activate"] });
			const match = request.prompt[0].text.match(/maintenance_id:"([^"]+)"/);
			assert.ok(match);
			const result = Promise.resolve().then(async () => {
				if (!options.noActivate) runner.activate(child, match[1]);
				await behavior({ root, defs, exec, request, runner, child, id: match[1], call: (name, args = {}) => defs.get(name).execute(args, exec) });
				return { stopReason: options.stopReason || "completed", structured: options.noStructured ? undefined : { status: options.reviewStatus || "complete", summary: "review finished" }, output: [{ type: "text", text: "review finished" }] };
			});
			return { id: child.id, localAgent: child, result, async dispose() { disposedRuns++; } };
		},
	};
	const ctx = { get: () => options.missing ? undefined : service, logger: { warn: message => warnings.push(message) } };
	const io = { readState: () => state, writeState: (_root, patch) => state = { ...state, ...patch }, maintain: () => { scans++; return { index: { over_limit: false }, stats: { sops: 52 }, mergeCandidates: [], cold: { threshold_days: 90, count: 1, entries: [{ name: "cold-proof", heat: 0, age_days: 100 }] } }; }, tools: () => tools, slugify: x => x.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-") };
	runner = createMaintenanceRunner(ctx, { ...defaults, ...options.cfg }, io);
	t.after(() => { runner.dispose(); rmSync(root, { recursive: true, force: true }); });
	return { root, runner, io, ctx, parent, service, get state() { return state; }, get starts() { return starts; }, get scans() { return scans; }, get disposedRuns() { return disposedRuns; }, warnings, run: () => runner.request(root, "test", parent) };
}

test("healthy maintenance report completes with zero writes; same content and reload stay quiet", async t => {
	const f = fixture(t, async ({ call, request }) => {
		const report = JSON.parse(request.prompt[0].text.split("程序报告（数据）：")[1]);
		assert.equal(report.cold[0].name, "cold-proof");
		await call("memory_list");
	});
	assert.deepEqual(await f.run(), { status: "no_action" });
	assert.equal(f.scans, 2); assert.equal(f.disposedRuns, 1);
	assert.equal(f.state.agentMutations, 0);
	assert.deepEqual(await f.run(), { status: "skipped" });
	const reloaded = createMaintenanceRunner(f.ctx, defaults, f.io);
	assert.deepEqual(await reloaded.request(f.root, "test", f.parent), { status: "skipped" });
	reloaded.dispose(); assert.equal(f.starts, 1);
});

test("real scoped mutations are acknowledged at their final revision, not self-retriggered", async t => {
	const f = fixture(t, async ({ call }) => {
		await call("memory_read", { name: "original" });
		await call("memory_update", { topic: "original", content: "corrected verified fact" });
	});
	assert.deepEqual(await f.run(), { status: "done" });
	assert.equal(readFileSync(join(f.root, "facts.md"), "utf8"), "corrected verified fact");
	assert.equal(f.state.agentRevision, computeReviewRevision(f.root));
	assert.deepEqual(await f.run(), { status: "skipped" });
});

test("new content respects persisted cross-session cooldown", async t => {
	const f = fixture(t); await f.run();
	writeFileSync(join(f.root, "facts.md"), "new verified fact");
	assert.deepEqual(await f.run(), { status: "skipped" });
	f.io.writeState(f.root, { agentLastAttemptAt: new Date(Date.now() - 31 * 60_000).toISOString() });
	assert.deepEqual(await f.run(), { status: "no_action" }); assert.equal(f.starts, 2);
});

test("different runner instances share an exclusive namespace lock", async t => {
	let release, started;
	const gate = new Promise(resolve => release = resolve);
	const ready = new Promise(resolve => started = resolve);
	const f = fixture(t, async () => { started(); await gate; });
	const first = f.run(); await ready;
	f.io.writeState(f.root, { agentLastAttemptAt: new Date(0).toISOString() }); // exercise the lock, not cooldown
	const second = createMaintenanceRunner(f.ctx, defaults, f.io);
	assert.deepEqual(await second.request(f.root, "test", f.parent), { status: "busy" });
	release(); await first; second.dispose(); assert.equal(f.starts, 1);
	assert.equal(existsSync(join(f.root, ".maintenance-agent.lock")), false);
});

test("missing provider performs program maintenance but does not falsely acknowledge model review", async t => {
	const f = fixture(t, undefined, { missing: true });
	assert.deepEqual(await f.run(), { status: "failed" });
	assert.equal(f.scans, 1); assert.equal(f.starts, 0); assert.equal(f.state.agentRevision, undefined);
	assert.match(f.state.agentError, /not executed/); assert.equal(f.warnings.length, 1);
	await f.run(); assert.equal(f.warnings.length, 1);
});

test("fork-like or unfiltered providers fail closed", async t => {
	const f = fixture(t, undefined, { provider: { inheritsParentContext: true, capabilities: { toolFilter: true, outputSchema: true } } });
	assert.equal((await f.run()).status, "failed"); assert.equal(f.starts, 0);
});

test("worker cannot access other namespaces or use maintain/promote", async t => {
	const f = fixture(t, async ({ call, defs }) => {
		assert.equal(defs.has("memory_maintain"), false); assert.equal(defs.has("memory_promote"), false);
		await assert.rejects(call("memory_read", { name: "original", namespace: "other" }), /cross-namespace/);
		await assert.rejects(call("memory_search", { all_namespaces: true }), /cross-namespace/);
		assert.equal((await call("memory_read", { name: "original" })).namespace, "test");
	});
	assert.equal((await f.run()).status, "no_action");
});

test("modification requires a full read; archiving requires saving a replacement", async t => {
	const f = fixture(t, async ({ call }) => {
		await assert.rejects(call("memory_update", { topic: "original", content: "bad" }), /read this entry/);
		await call("memory_read", { name: "original" });
		await assert.rejects(call("memory_archive", { topic: "original" }), /save a verified replacement/);
	});
	await f.run(); assert.match(readFileSync(join(f.root, "facts.md"), "utf8"), /verified fact/);
});

test("tool budget aborts runaway workers; cleanup still runs", async t => {
	const f = fixture(t, async ({ call }) => { await call("memory_list"); await call("memory_list"); }, { cfg: { maintenanceMaxCalls: 1 } });
	assert.equal((await f.run()).status, "failed"); assert.equal(f.disposedRuns, 1);
	assert.equal(existsSync(join(f.root, ".maintenance-agent.lock")), false);
});

test("write budget blocks extra writes", async t => {
	const f = fixture(t, async ({ call }) => {
		await call("memory_write", { content: "first" });
		await assert.rejects(call("memory_write", { content: "second" }), /write budget/);
	}, { cfg: { maintenanceMaxWrites: 1 } });
	await f.run(); assert.equal(readFileSync(join(f.root, "facts.md"), "utf8"), "first");
});

test("concurrent main-session write aborts stale maintenance without overwriting it", async t => {
	const f = fixture(t, async ({ root, call }) => {
		await call("memory_read", { name: "original" });
		writeFileSync(join(root, "facts.md"), "main-session fresh value");
		await call("memory_update", { topic: "original", content: "stale overwrite" });
	});
	assert.equal((await f.run()).status, "failed");
	assert.equal(readFileSync(join(f.root, "facts.md"), "utf8"), "main-session fresh value");
	assert.equal(f.state.agentRevision, undefined);
});

test("non-completed model result cannot settle review", async t => {
	const f = fixture(t, undefined, { stopReason: "max-tokens" });
	assert.equal((await f.run()).status, "failed"); assert.equal(f.state.agentRevision, undefined);
});

test("final text without activation is not a completed maintenance task", async t => {
	const f = fixture(t, undefined, { noActivate: true });
	assert.equal((await f.run()).status, "failed");
});

test("plugin disposal cancels running work; does not write a successful terminal state", async t => {
	const f = fixture(t, async ({ runner, request }) => { runner.dispose(); assert.equal(request.signal.aborted, true); });
	assert.equal((await f.run()).status, "failed"); assert.equal(f.disposedRuns, 1);
});

test("timeout is sent through the host's canonical cancellation signal", async t => {
	const f = fixture(t, async ({ request }) => { await sleep(30); assert.equal(request.signal.aborted, true); }, { cfg: { maintenanceTimeoutSeconds: 0.01 } });
	assert.equal((await f.run()).status, "failed"); assert.equal(f.disposedRuns, 1);
});

test("wrong task token or parent cannot activate maintenance tools", async t => {
	const f = fixture(t, async ({ runner, child, id }) => {
		assert.throws(() => runner.activate(child, "wrong"), /invalid maintenance/);
		assert.throws(() => runner.activate({ ...child, session: { header: { parentSession: "other" } } }, id), /invalid maintenance/);
	});
	await f.run();
});

test("content revision ignores mtime, provenance, heat and state, but tracks archive status", t => {
	const f = fixture(t); const before = computeReviewRevision(f.root);
	utimesSync(join(f.root, "facts.md"), new Date(), new Date(Date.now() + 10000));
	writeFileSync(join(f.root, "memory-meta.json"), JSON.stringify({ facts: { original: { sourceSession: "s", sourceSeqs: [3], updatedAt: "now" } } }));
	writeFileSync(join(f.root, "reflection-state.json"), "changed bookkeeping");
	writeFileSync(join(f.root, "file_access_stats.json"), "heat");
	assert.equal(computeReviewRevision(f.root), before);
	writeFileSync(join(f.root, "memory-meta.json"), JSON.stringify({ facts: { original: { archived: true } } }));
	assert.notEqual(computeReviewRevision(f.root), before);
});

test("old index policy migration is exact, idempotent and preserves user rules", () => {
	const tail = `${AUTO_BEGIN}\n[L2] original\n${AUTO_END}\n[RULES]\nkeep this\n${LEGACY_WRITE_POLICY}`;
	const old = `# [Memory Index - L1]\n${LEGACY_WRITE_POLICY}\n${tail}`;
	const next = migrateIndexPolicy(old);
	assert.ok(next.includes(WRITE_POLICY)); assert.ok(next.endsWith(tail));
	assert.equal(migrateIndexPolicy(next), next);
});


test("unfinished work is deferred and can resume after cooldown without new content", async t => {
	const f = fixture(t, undefined, { reviewStatus: "deferred" });
	assert.equal((await f.run()).status, "deferred");
	f.io.writeState(f.root, { agentLastAttemptAt: new Date(0).toISOString() });
	assert.equal((await f.run()).status, "deferred"); assert.equal(f.starts, 2);
});

test("unstructured completion is not accepted as successful maintenance", async t => {
	const f = fixture(t, undefined, { noStructured: true });
	assert.equal((await f.run()).status, "failed"); assert.equal(f.state.agentRevision, undefined);
});
