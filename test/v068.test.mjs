// v0.6.8 测试：L1 注入视图的结构化预算。
// 覆盖：未超预算原样透传；超预算时规则段完整保留；条目按分类入口折叠并显式标注；
// 头部+规则段本身超预算的极端情况下仍不截断规则。
import { test, expect, afterEach } from "vitest";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { apply } from "../lib/index.js";
import { buildPromptIndex, entryGroupKey, INDEX_TRUNCATION_NOTE } from "../src/l1index.js";
import { AUTO_BEGIN, AUTO_END } from "../src/templates.js";

let memDir;
let disposer;
let promptText;

afterEach(() => {
	try { disposer?.(); } catch { /* 忽略 */ }
	disposer = null;
	if (memDir) { try { rmSync(memDir, { recursive: true, force: true }); } catch { /* 忽略 */ } }
	memDir = null;
});

function makeIndex({ facts = [], sops = [], rules = "- 规则一" } = {}) {
	return [
		"# [Memory Index - L1]",
		"分层记忆: L0规则 | L1索引 | L2事实 | L3技能",
		AUTO_BEGIN,
		facts.length ? `[L2] ${facts.join(" | ")}` : "[L2] （空）",
		sops.length ? `[L3] ${sops.map((s) => `sops/${s}.md`).join(" | ")}` : "[L3] （空）",
		AUTO_END,
		"[RULES]",
		rules,
	].join("\n");
}

test("fitting index is returned unchanged", () => {
	const idx = makeIndex({ facts: ["a-fact", "b-fact"], sops: ["x-sop"], rules: "- 保持简洁" });
	expect(buildPromptIndex(idx, 12288)).toBe(idx);
});

test("entryGroupKey derives stable ASCII and CJK keys", () => {
	expect(entryGroupKey("dsh-layered-memory")).toBe("dsh");
	expect(entryGroupKey("qwen3.8-27b")).toBe("qwen3");
	expect(entryGroupKey("记忆库重整终态")).toBe("记忆");
	expect(entryGroupKey("pi")).toBeNull();
});

test("over-budget index keeps the complete rules section and marks the folding", () => {
	const rules = "- 禁止把任何 API key 写入环境变量\n- Windows .ps1 一律 UTF-8 with BOM";
	const facts = Array.from({ length: 200 }, (_, i) => `dshtool-entry-name-${i}`);
	const idx = makeIndex({ facts, rules });
	const out = buildPromptIndex(idx, 2000);
	expect(out).toContain("[RULES]");
	expect(out).toContain("- 禁止把任何 API key 写入环境变量");
	expect(out).toContain("- Windows .ps1 一律 UTF-8 with BOM");
	expect(out).toContain(INDEX_TRUNCATION_NOTE);
	expect(out).toContain("memory_list");
	expect(out.length).toBeLessThanOrEqual(2000);
});

test("folded entries are summarised as category entries with counts", () => {
	// L2：超预算后逐条保留一部分，其余按分组入口聚合
	const facts = Array.from({ length: 200 }, (_, i) => `dshtool-entry-name-${i}`);
	const bigFacts = buildPromptIndex(makeIndex({ facts, rules: "- 规则一" }), 1500);
	expect(bigFacts).toMatch(/dshtool\(\d+\)/);
	expect(bigFacts.length).toBeLessThanOrEqual(1500);
	// L3：sops/ 前缀与 .md 后缀不参与分组键，入口应回到条目本身的词
	const sops = Array.from({ length: 40 }, (_, i) => `qwen-local-note-${i}`);
	const bigSops = buildPromptIndex(makeIndex({ sops, rules: "- 规则一" }), 800);
	expect(bigSops).toMatch(/qwen\(\d+\)/);
	expect(bigSops.length).toBeLessThanOrEqual(800);
});

test("when head plus rules alone exceed the budget, entries collapse but rules survive", () => {
	const rules = `- ${"很长的红线规则".repeat(60)}`;
	const idx = makeIndex({ facts: ["dshtool-alpha", "dshtool-beta", "qwen-local"], rules });
	const out = buildPromptIndex(idx, 500);
	expect(out).toContain(rules);
	expect(out).toContain("入口：");
	expect(out).not.toContain("dshtool-alpha");
});

function setupWithPrompt(l1MaxChars) {
	memDir = mkdtempSync(join(tmpdir(), "dsh-memory-v068-"));
	promptText = null;
	const ctx = {
		get(service) {
			if (service === "systemPrompt") {
				return { context: ({ text }) => { promptText = text; return () => {}; } };
			}
			if (service === "agents") return { get: () => null };
			if (service === "sessionQuery") return null;
			return undefined;
		},
		on() { return () => {}; },
		skills: { register: () => () => {} },
		tools: { register: () => () => {}, restrict: () => () => {} },
		logger: { info() {}, warn() {} },
		effect(factory) { const d = factory(); if (typeof d === "function") d(); },
	};
	disposer = apply(ctx, {
		memoryDir: memDir,
		progressive: false,
		autoNamespace: false,
		defaultNamespace: "test",
		l1MaxChars,
	});
}

test("injected prompt view keeps rules intact and points at the full index", () => {
	setupWithPrompt(2048);
	const rules = "- 红线一：不写入密钥\n- 红线二：脚本用 UTF-8 BOM";
	const idx = makeIndex({
		facts: Array.from({ length: 150 }, (_, i) => `dshtool-entry-name-${i}`),
		rules,
	});
	writeFileSync(join(memDir, "test", "index.txt"), idx, "utf8");
	expect(typeof promptText).toBe("function");
	const injected = promptText();
	expect(injected).toContain("<memory_index");
	expect(injected).toContain("- 红线一：不写入密钥");
	expect(injected).toContain("- 红线二：脚本用 UTF-8 BOM");
	expect(injected).toContain("memory_list");
	const inner = injected.replace(/^<memory_index[^>]*>\n/, "").replace(/\n<\/memory_index>$/, "");
	expect(inner.length).toBeLessThanOrEqual(2048);
});

test("injected prompt view is byte-identical to index.txt while it fits", () => {
	setupWithPrompt(12288);
	const idx = makeIndex({ facts: ["small-fact"], sops: ["small-sop"], rules: "- 小规则" });
	writeFileSync(join(memDir, "test", "index.txt"), idx, "utf8");
	const injected = promptText();
	expect(injected).toBe(`<memory_index source="user-writable">\n${idx.trim()}\n</memory_index>`);
});
