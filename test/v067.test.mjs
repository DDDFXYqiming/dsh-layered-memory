// Real plugin wiring + real memory tools/storage; only the DSH subagent service is simulated.
import { test, expect } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { apply } from "../lib/index.js";
import { readReflectionState } from "../src/reflection.js";
import { LEGACY_WRITE_POLICY, WRITE_POLICY, AUTO_BEGIN, AUTO_END } from "../src/templates.js";

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(predicate) {
	for (let i = 0; i < 200; i++) { if (predicate()) return; await sleep(10); }
	throw new Error("maintenance test timed out");
}
function setup(behavior = async () => {}, extra = {}) {
	const memoryDir = mkdtempSync(join(tmpdir(), "dsh-v067-"));
	const root = join(memoryDir, "test");
	mkdirSync(join(root, "sops"), { recursive: true });
	writeFileSync(join(root, "facts.md"), "# Facts\n## known\nverified original value\n");
	writeFileSync(join(root, "sops", "distinct.md"), "# distinct\nunique verified instructions");
	const handlers = new Map(), globals = new Map(), scoped = new Map(), effects = [];
	const parent = { id: "main", session: { id: "main", header: {} }, inject() { injected++; } };
	const child = { id: "worker", session: { id: "worker", header: { parentSession: "main" } }, ctx: { tools: { register(def) { scoped.set(def.name, def); return () => scoped.delete(def.name); }, restrict() { return () => {}; } } } };
	const agents = new Map([[parent.id, parent], [child.id, child]]);
	let starts = 0, injected = 0, prompt;
	const emit = (event, ...args) => { for (const f of handlers.get(event) || []) f(...args); };
	const subagents = {
		getProvider: () => ({ inheritsParentContext: false, capabilities: { toolFilter: true, outputSchema: true } }),
		async start(name, request) {
			starts++; expect(name).toBe("spawn");
			expect(request.toolFilter).toEqual({ allow: ["memory_maintenance_activate"] });
			const id = request.prompt[0].text.match(/maintenance_id:"([^"]+)"/)[1];
			const result = Promise.resolve().then(async () => {
				const activation = globals.get("memory_maintenance_activate");
				await activation.execute({ maintenance_id: id }, { agent: child });
				const call = async (name, args = {}) => {
					const result = await scoped.get(name).execute(args, { agent: child, signal: request.signal });
					emit("tools/result", { name, arguments: args, agent: child }, { isError: false });
					return result;
				};
				await behavior({ call, globals, child, scoped, root });
				emit("session/event", child.session, { type: "turn/end", seq: 22 });
				return { stopReason: "completed", structured: { status: "complete", summary: "checked" }, output: [{ type: "text", text: "checked" }] };
			});
			return { id: child.id, localAgent: child, result, async dispose() { emit("agent/disposed", { agent: child }); } };
		},
	};
	const ctx = {
		get(name) { return name === "agents" ? { get: id => agents.get(id) } : name === "systemPrompt" ? { context(def) { prompt = def; return () => {}; } } : name === "subagents" ? subagents : undefined; },
		on(event, fn) { const list = handlers.get(event) || []; list.push(fn); handlers.set(event, list); return () => {}; },
		tools: { register(def) { globals.set(def.name, def); return () => globals.delete(def.name); }, restrict() { return () => {}; } },
		skills: { register() { return () => {}; } },
		logger: { info() {}, warn() {} },
		effect(factory) { effects.push(factory()); },
	};
	apply(ctx, { memoryDir, defaultNamespace: "test", autoNamespace: false, reflectionMode: "auto", maintainEveryTurns: 0, reflectSopsThreshold: 1, reflectCooldownTurns: 0, ...extra });
	return {
		root, globals, get prompt() { return prompt; }, get starts() { return starts; }, get injected() { return injected; },
		turn() { emit("session/event", parent.session, { type: "turn/end", seq: 1 }); },
		state() { return readReflectionState(root); },
		cleanup() { for (const f of effects) f?.(); rmSync(memoryDir, { recursive: true, force: true }); },
	};
}

for (const progressive of [true, false]) {
	test(`auto maintenance uses real scoped memory tools and no parent injection (progressive=${progressive})`, async () => {
		const f = setup(async ({ call, globals, child, scoped }) => {
			expect(scoped.has("memory_maintain")).toBe(false);
			expect(scoped.has("memory_promote")).toBe(false);
			await expect(call("memory_read", { name: "known", namespace: "elsewhere" })).rejects.toThrow("cross-namespace");
			await call("memory_read", { name: "known" });
			await call("memory_update", { topic: "known", entry_type: "fact", content: "verified original value; compressed wording", evidence: "original fixture verification", supersede: false });
			if (globals.has("memory_activate")) {
				expect(() => globals.get("memory_activate").execute({}, { agent: child })).toThrow("maintenance_id required");
			}
		}, { progressive });
		try {
			f.turn(); await until(() => ["done", "failed"].includes(f.state().agentStatus));
			expect(f.state().agentError).toBe(null);
			expect(f.state().agentStatus).toBe("done");
			expect(readFileSync(join(f.root, "facts.md"), "utf8")).toContain("compressed wording");
			expect(readdirSync(join(f.root, ".history")).length).toBeGreaterThan(0);
			expect(f.injected).toBe(0); expect(f.starts).toBe(1);
			f.turn(); await sleep(30); expect(f.starts).toBe(1);
		} finally { f.cleanup(); }
	});
}

test("auto mode accepts healthy zero-write completion, not another reminder", async () => {
	const f = setup(async ({ call }) => { await call("memory_list"); });
	try {
		f.turn(); await until(() => ["no_action", "failed"].includes(f.state().agentStatus));
		expect(f.state().agentStatus).toBe("no_action"); expect(f.state().agentMutations).toBe(0);
		expect(f.injected).toBe(0);
	} finally { f.cleanup(); }
});

test("old index header is migrated on prompt read and persisted on automatic sync", async () => {
	const f = setup();
	try {
		const tail = `${AUTO_BEGIN}\n[L2] known\n${AUTO_END}\n[RULES]\ncustom-rule\n`;
		writeFileSync(join(f.root, "index.txt"), `# [Memory Index - L1]\n${LEGACY_WRITE_POLICY}\n${tail}`);
		expect(f.prompt.text()).toContain(WRITE_POLICY);
		f.turn(); await until(() => ["no_action", "failed"].includes(f.state().agentStatus));
		expect(f.state().agentStatus).toBe("no_action");
		const saved = readFileSync(join(f.root, "index.txt"), "utf8");
		expect(saved).toContain(WRITE_POLICY); expect(saved).toContain("custom-rule");
		expect(saved).not.toContain(LEGACY_WRITE_POLICY);
	} finally { f.cleanup(); }
});
