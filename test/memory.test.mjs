import { test, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, readFileSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { apply } from "../lib/index.js";

let memDir;
let disposer;
let tools;
let effects = [];

function setup({ l1MaxChars = 12288 } = {}) {
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
		effect(factory) {
			const d = factory();
			if (typeof d === "function") effects.push(d);
		},
	};
	effects = [];
	disposer = apply(ctx, {
		memoryDir: memDir,
		progressive: false,
		autoNamespace: false,
		defaultNamespace: "test",
		l1MaxChars,
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
	for (const f of effects || []) f();
	if (memDir) rmSync(memDir, { recursive: true, force: true });
});

test("apply initializes only the selected namespace", () => {
	expect(existsSync(join(memDir, "facts.md"))).toBe(false);
	expect(existsSync(join(memDir, "test", "facts.md"))).toBe(true);
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
	expect(existsSync(join(memDir, "test", "facts.md"))).toBe(true);

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

test("memory_maintain keeps a complete fitting index and normalizes blank padding", async () => {
	for (let i = 1; i <= 3; i++) {
		await tool("memory_write").execute({
			topic: `fact-${i}`,
			entry_type: "fact",
			content: `fact ${i}`,
			evidence: "unit test",
			namespace: "test",
		});
		await tool("memory_write").execute({
			topic: `sop-${i}`,
			entry_type: "sop",
			content: `sop ${i}`,
			evidence: "unit test",
			namespace: "test",
		});
	}
	const indexPath = join(memDir, "test", "index.txt");
	const padded = readFileSync(indexPath, "utf8").replace("<!-- AUTO-END -->", "<!-- AUTO-END -->\n\n\n\n");
	writeFileSync(indexPath, padded, "utf8");

	const report = await tool("memory_maintain").execute({ namespace: "test" });
	const index = readFileSync(indexPath, "utf8");
	expect(report.report.index.facts_listed).toBe(3);
	expect(report.report.index.sops_listed).toBe(3);
	expect(index).toContain("[L2] fact-1 | fact-2 | fact-3");
	expect(index).toContain("[L3] sops/sop-1.md | sops/sop-2.md | sops/sop-3.md");
	expect(index).not.toMatch(/\n{3,}/);

	// A full index rebuild followed by maintenance must remain a no-op while it fits.
	await tool("memory_index").execute({ namespace: "test" });
	const second = await tool("memory_maintain").execute({ namespace: "test" });
	expect(second.report.index.facts_listed).toBe(3);
	expect(second.report.index.sops_listed).toBe(3);
	// 幂等：索引内容未变时不得重写文件（前缀稳定，避免打碎 system prompt 缓存）。
	expect(second.report.index.rewritten).toBe(false);
});

test("oversized L1 budget still lists every entry and only flags over_limit", async () => {
	// [v0.6] 存在性优先：预算再小也不隐藏条目——被裁出 L1 等于永久隐身。
	if (typeof disposer === "function") disposer();
	if (memDir) rmSync(memDir, { recursive: true, force: true });
	setup({ l1MaxChars: 1024 });

	for (let i = 1; i <= 12; i++) {
		await tool("memory_write").execute({
			topic: `bulk-fact-with-a-longish-name-${i}`,
			entry_type: "fact",
			content: `fact ${i}`,
			evidence: "unit test",
			namespace: "test",
		});
		await tool("memory_write").execute({
			topic: `bulk-sop-with-a-longish-name-${i}`,
			entry_type: "sop",
			content: `sop ${i}`,
			evidence: "unit test",
			namespace: "test",
		});
	}

	const report = await tool("memory_maintain").execute({ namespace: "test" });
	const index = readFileSync(join(memDir, "test", "index.txt"), "utf8");
	expect(report.report.index.over_limit).toBe(true);
	expect(report.report.index.facts_listed).toBe(12);
	expect(report.report.index.sops_listed).toBe(12);
	expect(index).toContain("bulk-fact-with-a-longish-name-1");
	expect(index).toContain("bulk-fact-with-a-longish-name-12");
	expect(index).toContain("bulk-sop-with-a-longish-name-12.md");
	expect(index).not.toContain("memory_list 查看");

	const listed = await tool("memory_list").execute({ namespace: "test" });
	expect(listed.facts).toHaveLength(12);
	expect(listed.sops).toHaveLength(12);
});

test("empty layer renders a placeholder while the other layer lists all entries", async () => {
	if (typeof disposer === "function") disposer();
	if (memDir) rmSync(memDir, { recursive: true, force: true });
	setup({ l1MaxChars: 1024 });
	await tool("memory_write").execute({
		topic: "only-fact",
		entry_type: "fact",
		content: "single layer",
		evidence: "unit test",
		namespace: "test",
	});

	const report = await tool("memory_maintain").execute({ namespace: "test" });
	const index = readFileSync(join(memDir, "test", "index.txt"), "utf8");
	expect(report.report.index.facts_listed).toBe(1);
	expect(report.report.index.sops_listed).toBe(0);
	expect(index).toContain("[L2] only-fact");
	expect(index).toContain("[L3] （空）");
});

test("sopNames excludes reserved non-SOP files (README/LICENSE) from L3", async () => {
	const fs = await import("node:fs");
	const sopsDir = join(memDir, "test", "sops");
	fs.mkdirSync(sopsDir, { recursive: true });
	fs.writeFileSync(join(sopsDir, "README.md"), "# plugin readme copy\n", "utf8");
	fs.writeFileSync(join(sopsDir, "LICENSE.md"), "MIT\n", "utf8");
	await tool("memory_write").execute({
		topic: "real-sop",
		entry_type: "sop",
		content: "真实经验",
		evidence: "unit test",
		namespace: "test",
	});

	const report = await tool("memory_maintain").execute({ namespace: "test" });
	const index = readFileSync(join(memDir, "test", "index.txt"), "utf8");
	expect(report.report.index.sops_listed).toBe(1);
	expect(report.report.index.facts_listed).toBe(0);
	expect(index).toContain("real-sop");
	expect(index).not.toContain("README");
	expect(index).not.toContain("LICENSE");
});

test("L1 lists entries with zero access heat (no recency lottery)", async () => {
	// [v0.6] 旧行为：热度决定谁进 L1，新写入条目 heat=1 排不进前 N → 写完即隐身。
	// 现在 AUTO 段无条件全量列出，热度只服务于冷条目复核。
	if (typeof disposer === "function") disposer();
	if (memDir) rmSync(memDir, { recursive: true, force: true });
	setup({ l1MaxChars: 12288 });

	const fs = await import("node:fs");
	const sopsDir = join(memDir, "test", "sops");
	fs.mkdirSync(sopsDir, { recursive: true });
	fs.writeFileSync(join(sopsDir, "old-a.md"), "# old-a\n\nstale\n", "utf8");
	fs.writeFileSync(join(sopsDir, "new-a.md"), "# new-a\n\nfresh\n", "utf8");
	const oldTs = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
	const nowTs = new Date().toISOString();
	fs.writeFileSync(
		join(memDir, "test", "memory-meta.json"),
		JSON.stringify({
			facts: {},
			sops: {
				"old-a": { createdAt: oldTs, updatedAt: oldTs },
				"new-a": { createdAt: nowTs, updatedAt: nowTs },
			},
		}, null, 2),
		"utf8"
	);

	await tool("memory_index").execute({ namespace: "test" });
	const index = readFileSync(join(memDir, "test", "index.txt"), "utf8");
	expect(index).toContain("new-a");
	expect(index).toContain("old-a");
});
