// v0.5 新特性测试：内容相似度、近重复去重、memory_search、写入即压缩、
// 关联链接、promote、重试序列蒸馏（auto-pending 重做）、热度衰减。
import { test, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, readFileSync, writeFileSync, existsSync, rmSync, mkdirSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { apply } from "../lib/index.js";
import { tokenize, jaccard, BM25Index } from "../src/similarity.js";
import { entryHeat } from "../src/store.js";

let memDir;
let disposer;
let tools;
let eventHandlers;

function setup({ maxIndexLines = 30, autoPending = true } = {}) {
	memDir = mkdtempSync(join(tmpdir(), "dsh-memory-v05-test-"));
	const registered = [];
	eventHandlers = {};
	const agentsService = {
		get(id) {
			return injected.get(id) ?? null;
		},
	};
	const injected = new Map();
	const ctx = {
		get(service) {
			if (service === "systemPrompt") return { context: () => () => {} };
			if (service === "agents") return agentsService;
			if (service === "sessionQuery") return null;
			return undefined;
		},
		on(event, handler) {
			eventHandlers[event] = handler;
			return () => {};
		},
		skills: { register: () => () => {} },
		tools: {
			register(def) { registered.push(def); return () => {}; },
			restrict() { return () => {}; },
		},
		logger: { info() {}, warn() {} },
	};
	disposer = apply(ctx, {
		memoryDir: memDir,
		progressive: false,
		autoNamespace: false,
		defaultNamespace: "test",
		maxIndexLines,
		autoPending,
	});
	tools = registered;
	return { injected };
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

// ── similarity 原语 ──

test("similarity: jaccard detects reworded duplicates and rejects unrelated text", () => {
	const a = new Set(tokenize("DSH 插件安装后需要重启宿主才能生效，插件加载发生在启动阶段"));
	const b = new Set(tokenize("DSH 插件安装之后要重启宿主才会生效，插件在启动阶段被加载"));
	const c = new Set(tokenize("PowerShell 的执行策略限制脚本运行，需要 Set-ExecutionPolicy"));
	expect(jaccard(a, b)).toBeGreaterThan(0.4);
	expect(jaccard(a, c)).toBeLessThan(0.2);
});

test("similarity: BM25 ranks matching doc above others", () => {
	const idx = new BM25Index();
	idx.addDoc("gpu", "任务管理器显示 GPU 利用率 66% 温度 86°C");
	idx.addDoc("git", "git push 到 GitHub 需要网络代理配置");
	idx.addDoc("empty", "完全无关的内容");
	const hits = idx.search("GPU 利用率", 3);
	expect(hits[0]?.id).toBe("gpu");
	expect(hits.length).toBeGreaterThanOrEqual(1);
});

test("similarity: tokenize extracts ascii words and cjk bigrams", () => {
	const tokens = tokenize("重启宿主 restart host");
	expect(tokens).toContain("restart");
	expect(tokens).toContain("host");
	expect(tokens).toContain("重启");
	expect(tokens).toContain("宿主");
});

// ── 近重复去重与合并候选 ──

test("memory_maintain archives reworded near-duplicate SOPs (content-level)", async () => {
	const sopsDir = join(memDir, "test", "sops");
	mkdirSync(sopsDir, { recursive: true });
	// 近重复 = 同一记忆的微编辑副本（≥0.85 Jaccard）→ 自动归档；
	// 重度改写不在此列（走合并候选报告，见下方测试）。
	const body = "DSH 插件安装后需要重启宿主才能生效。插件加载发生在宿主启动阶段，热更新不可用。安装命令是 dsh plugin --profile web add。";
	writeFileSync(join(sopsDir, "install-a.md"), `# install-a\n\n${body}\n`, "utf8");
	writeFileSync(join(sopsDir, "install-b.md"), `# install-b\n\n${body.replace("热更新不可用", "热更新不支持")}\n`, "utf8");

	const report = await tool("memory_maintain").execute({ namespace: "test" });
	expect(report.report.dedupe.removed.length).toBeGreaterThanOrEqual(1);
	expect(report.report.dedupe.removed[0]).toMatch(/duplicate of install-a/);
});

test("merge candidates are content-based: unrelated names no longer pair up", async () => {
	const sopsDir = join(memDir, "test", "sops");
	mkdirSync(sopsDir, { recursive: true });
	// 名称高度相似但内容完全无关 —— v0.4 会误报，v0.5 不应配对
	writeFileSync(join(sopsDir, "anysearch-dsh-plugin-install.md"), "# a\n\nAnySearch MCP 插件的安装与凭据配置方法。\n", "utf8");
	writeFileSync(join(sopsDir, "dsh-bundle-plugin-install.md"), "# b\n\nCordis bundle 打包交付与 cordis.patch.yml 的写法规范。\n", "utf8");

	const report = await tool("memory_maintain").execute({ namespace: "test" });
	expect(report.report.mergeCandidates).toHaveLength(0);
});

test("merge candidates report genuinely overlapping content pairs", async () => {
	const sopsDir = join(memDir, "test", "sops");
	mkdirSync(sopsDir, { recursive: true });
	const body = "安装 dsh 插件使用 dsh plugin --profile web add 命令；Windows 下 schannel 报错时改用本地路径安装；安装完成后需要重启宿主。";
	writeFileSync(join(sopsDir, "plugin-install-guide.md"), `# guide\n\n${body}\n`, "utf8");
	writeFileSync(join(sopsDir, "plugin-install-notes.md"), `# notes\n\n${body}\n补充：pnpm 安装失败时检查镜像源。\n`, "utf8");

	const report = await tool("memory_maintain").execute({ namespace: "test" });
	expect(report.report.mergeCandidates.length).toBe(1);
	expect(report.report.mergeCandidates[0].similarity).toBeGreaterThan(0.45);
});

// ── memory_search ──

test("memory_search finds entries including L1-hidden and archived ones", async () => {
	await tool("memory_write").execute({
		topic: "quantum-flux-config",
		entry_type: "fact",
		content: "量子通量校准参数存放在 C:\\etc\\flux.yaml",
		evidence: "unit test",
		namespace: "test",
	});
	// 制造一个归档条目
	await tool("memory_write").execute({
		topic: "archived-flux-note",
		entry_type: "sop",
		content: "关于量子通量的历史排查经验：先查 flux.yaml 再查环境变量",
		evidence: "unit test",
		namespace: "test",
	});
	await tool("memory_archive").execute({ topic: "archived-flux-note", entry_type: "sop", namespace: "test" });

	const r = await tool("memory_search").execute({ query: "量子通量", namespace: "test" });
	const names = r.results.map((x) => x.name);
	expect(names).toContain("quantum-flux-config");
	expect(names).toContain("archived-flux-note");
	expect(r.results[0].score).toBeGreaterThan(0);
});

test("memory_search respects include_archived=false", async () => {
	await tool("memory_write").execute({
		topic: "hidden-gem",
		entry_type: "fact",
		content: "稀有的独角兽配置片段 unicorn",
		evidence: "unit test",
		namespace: "test",
	});
	await tool("memory_archive").execute({ topic: "hidden-gem", entry_type: "fact", namespace: "test" });

	const r = await tool("memory_search").execute({ query: "unicorn 独角兽", namespace: "test", include_archived: false });
	expect(r.results.map((x) => x.name)).not.toContain("hidden-gem");
});

// ── 写入即压缩 ──

test("memory_write auto-compresses oversized index without manual maintain", async () => {
	if (typeof disposer === "function") disposer();
	if (memDir) rmSync(memDir, { recursive: true, force: true });
	setup({ maxIndexLines: 12 });

	for (let i = 1; i <= 6; i++) {
		const w = await tool("memory_write").execute({
			topic: `bulk-fact-${i}`,
			entry_type: "fact",
			content: `批量事实 ${i}`,
			evidence: "unit test",
			namespace: "test",
		});
		if (i === 6) {
			// 最后一次写入应已自动压缩（或索引本就未超限），且不再出现未压缩的 over_limit
			expect(w.index.compressed || !w.index.over_limit).toBe(true);
		}
		// 回归：output.schema 声明 additionalProperties:false，execute 返回的
		// index 键必须全部在 schema 中声明，否则宿主校验会拒绝整个工具结果
		// （v0.5.1 前压缩路径塞入 facts_hidden/sops_hidden 触发过该 bug）。
		const declared = Object.keys(tool("memory_write").output.schema.properties.index.properties);
		for (const key of Object.keys(w.index)) {
			expect(declared).toContain(key);
		}
	}
	const index = readFileSync(join(memDir, "test", "index.txt"), "utf8");
	const lineCount = index.replace(/\n+$/, "").split("\n").length;
	expect(lineCount).toBeLessThanOrEqual(12);
	// 隐藏条目仍可读
	const hidden = await tool("memory_read").execute({ name: "bulk-fact-1", namespace: "test" });
	expect(hidden.not_found).not.toBe(true);
});

// ── related 关联链接 ──

test("memory_write stores related links and memory_read surfaces them", async () => {
	await tool("memory_write").execute({
		topic: "base-entry",
		entry_type: "fact",
		content: "基础条目",
		evidence: "unit test",
		namespace: "test",
	});
	await tool("memory_write").execute({
		topic: "linked-entry",
		entry_type: "sop",
		content: "带关联的条目",
		evidence: "unit test",
		namespace: "test",
		related: ["base-entry"],
	});
	const r = await tool("memory_read").execute({ name: "linked-entry", namespace: "test" });
	expect(r.meta.related).toEqual(["base-entry"]);
});

// ── memory_promote ──

test("memory_promote copies to target namespace and archives source", async () => {
	await tool("memory_write").execute({
		topic: "local-wisdom",
		entry_type: "sop",
		content: "项目局部经验：部署前先跑冒烟测试",
		evidence: "unit test",
		namespace: "test",
	});
	const p = await tool("memory_promote").execute({
		topic: "local-wisdom",
		entry_type: "sop",
		from_namespace: "test",
		to_namespace: "default",
	});
	expect(p.promoted).toBe(true);

	// 目标空间可读
	const r = await tool("memory_read").execute({ name: "local-wisdom", namespace: "default" });
	expect(r.not_found).not.toBe(true);
	expect(r.content).toContain("冒烟测试");
	// 源条目已归档
	const src = await tool("memory_read").execute({ name: "local-wisdom", namespace: "test" });
	expect(src.not_found).toBe(true);
});

// ── auto-pending 重做：只捕获重试序列 ──

test("auto-pending ignores plain successes but captures fail-then-retry sequences", async () => {
	const execBase = { agent: { id: "agent-x" } };
	// 普通成功调用：不应产生 pending
	eventHandlers["tools/result"](
		{ ...execBase, name: "read" },
		{ isError: false, text: "file content" },
	);
	eventHandlers["tools/result"](
		{ ...execBase, name: "grep" },
		{ isError: false, text: "matches" },
	);
	eventHandlers["session/event"]({ id: "agent-x" }, { type: "turn/end", seq: 1 });
	let pendings = readdirSync(join(memDir, "test", "pending")).filter((f) => f.endsWith(".md"));
	expect(pendings).toHaveLength(0);

	// 失败两次后成功：应产生一条含重试序列的候选
	eventHandlers["tools/result"](
		{ ...execBase, name: "bash" },
		{ isError: true, text: "EPERM: operation not permitted" },
	);
	eventHandlers["tools/result"](
		{ ...execBase, name: "bash" },
		{ isError: true, text: "EPERM: operation not permitted (again)" },
	);
	eventHandlers["tools/result"](
		{ ...execBase, name: "bash" },
		{ isError: false, text: "succeeded with workaround" },
	);
	eventHandlers["session/event"]({ id: "agent-x" }, { type: "turn/end", seq: 2 });

	pendings = readdirSync(join(memDir, "test", "pending")).filter((f) => f.endsWith(".md"));
	expect(pendings).toHaveLength(1);
	const content = readFileSync(join(memDir, "test", "pending", pendings[0]), "utf8");
	expect(content).toContain("bash");
	expect(content).toContain("EPERM");
	expect(content).toContain("succeeded with workaround");
});

// ── 热度衰减 ──

test("entryHeat decays access counts with 14-day half-life", () => {
	const meta = { facts: {}, sops: {} };
	const now = Date.now();
	const freshAccess = { "sop:hot": { count: 8, lastAt: new Date(now).toISOString() } };
	const oldAccess = { "sop:cold": { count: 8, lastAt: new Date(now - 28 * 86400000).toISOString() } };
	const hot = entryHeat(freshAccess, meta, "sop", "hot");
	const cold = entryHeat(oldAccess, meta, "sop", "cold");
	expect(hot).toBeCloseTo(8, 1);
	expect(cold).toBeCloseTo(2, 1); // 28 天 = 两个半衰期 → 8/4
});
