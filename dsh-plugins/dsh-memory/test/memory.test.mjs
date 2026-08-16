import { test, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, readFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { apply } from "../lib/index.js";

let memDir;
let disposer;
let tools;

function setup() {
	memDir = mkdtempSync(join(tmpdir(), "dsh-memory-test-"));
	const registered = [];
	const ctx = {
		get(service) {
			if (service === "systemPrompt") {
				return { context: () => () => {} };
			}
			if (service === "agents") return null;
			if (service === "sessionQuery") return null;
			return undefined;
		},
		on() { return () => {}; },
		skills: { register: () => () => {} },
		tools: {
			register(def) { registered.push(def); return () => {}; },
			restrict() { return () => {}; },
		},
	};
	disposer = apply(ctx, {
		memoryDir: memDir,
		progressive: false,
		autoNamespace: false,
		defaultNamespace: "test",
		maxIndexLines: 30,
	});
	tools = registered;
}

function tool(name) {
	const def = tools.find((t) => t.name === name);
	if (!def) throw new Error(`tool not found: ${name}`);
	return def;
}

beforeEach(() => {
	setup();
});

afterEach(() => {
	if (typeof disposer === "function") disposer();
	if (memDir) rmSync(memDir, { recursive: true, force: true });
});

test("memory_write creates a fact and memory_read returns it", async () => {
	const w = await tool("memory_write").execute({
		topic: "test-fact",
		entry_type: "fact",
		content: "CLI 测试事实",
		evidence: "unit test",
		namespace: "test",
	});
	expect(w.action).toBe("created");
	expect(existsSync(join(memDir, "facts.md"))).toBe(true);

	const r = await tool("memory_read").execute({
		name: "test-fact",
		namespace: "test",
	});
	expect(r.not_found).not.toBe(true);
	expect(r.content).toContain("CLI 测试事实");
});

test("memory_archive hides archived fact from memory_read", async () => {
	await tool("memory_write").execute({
		topic: "archive-me",
		entry_type: "fact",
		content: "这条应该归档后不可读",
		evidence: "unit test",
		namespace: "test",
	});
	const before = await tool("memory_read").execute({ name: "archive-me", namespace: "test" });
	expect(before.not_found).not.toBe(true);

	const ar = await tool("memory_archive").execute({ topic: "archive-me", entry_type: "fact", namespace: "test" });
	expect(ar.archived).toBe(true);

	const after = await tool("memory_read").execute({ name: "archive-me", namespace: "test" });
	expect(after.not_found).toBe(true);
	expect(after.content).toBe("");

	const list = await tool("memory_list").execute({ namespace: "test" });
	expect(list.facts).not.toContain("archive-me");
});

test("memory_index rebuilds L1 auto segment", async () => {
	await tool("memory_write").execute({
		topic: "index-fact",
		entry_type: "fact",
		content: "索引测试",
		evidence: "unit test",
		namespace: "test",
	});
	const idx = await tool("memory_index").execute({ namespace: "test" });
	expect(idx.facts).toContain("index-fact");
	expect(readFileSync(join(memDir, "test", "index.txt"), "utf8")).toContain("index-fact");
});

test("memory_maintain dedupes identical SOP files", async () => {
	// create two identical SOPs directly
	const sopsDir = join(memDir, "test", "sops");
	await import("node:fs").then((fs) => fs.mkdirSync(sopsDir, { recursive: true }));
	const content = "# dup\n\nsame content\n";
	await import("node:fs").then((fs) => {
		fs.writeFileSync(join(sopsDir, "dup-a.md"), content, "utf8");
		fs.writeFileSync(join(sopsDir, "dup-b.md"), content, "utf8");
	});
	const report = await tool("memory_maintain").execute({ namespace: "test" });
	expect(report.report.dedupe.removed.length).toBeGreaterThanOrEqual(1);
	expect(existsSync(join(memDir, "test", "archive"))).toBe(true);
});
