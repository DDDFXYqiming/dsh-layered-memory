#!/usr/bin/env node
// 热度排序隔离 e2e：临时 memoryDir + 真实 apply() 装配，按 docs/heat-ranking-contract.md 的验收节逐条断言。
// 运行：node scripts/e2e-heat.mjs
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { apply } from "../src/index.js";
import { buildPromptIndex, indexChars } from "../src/l1index.js";
import { readEntries, readMeta, loadAccess } from "../src/store.js";
import { entryId, pickColdSet, rankEntries, scoreEntries } from "../src/heat.js";
import { buildTools } from "../src/tools.js";

// ---------------------------------------------------------------------------
// mock ctx：覆盖 apply() 装配实际用到的服务面。
// storage.domain.open 返回 Promise，table(name) 提供 get/put/update。
// ---------------------------------------------------------------------------
function createMockCtx() {
	const services = new Map();
	const tools = new Map();
	const variables = new Map();
	const handlers = new Map();
	const effects = [];
	const systemPrompt = {
		variable(name, callback) {
			variables.set(name, callback);
			return () => variables.delete(name);
		},
		context() { return () => {}; },
		assemble: async () => ({ sections: [], contexts: [], variables: {}, tools: [] }),
	};
	const ctx = {
		provide(name, value) { services.set(name, value); return () => services.delete(name); },
		logger: { info() {}, warn() {}, error() {}, debug() {} },
		get(name) {
			if (name === "systemPrompt") return systemPrompt;
			if (name === "workspaces") return undefined;
			if (name === "agents") return { get: () => undefined };
			if (name === "sessionQuery") return null;
			return services.get(name);
		},
		on(event, handler) {
			if (!handlers.has(event)) handlers.set(event, []);
			handlers.get(event).push(handler);
			return () => {
				const list = handlers.get(event) || [];
				const at = list.indexOf(handler);
				if (at >= 0) list.splice(at, 1);
			};
		},
		async emit(event, ...args) {
			for (const handler of [...(handlers.get(event) || [])]) await handler(...args);
		},
		skills: { register() { return () => {}; } },
		tools: {
			register(def) {
				tools.set(def.name, def);
				return () => { if (tools.get(def.name) === def) tools.delete(def.name); };
			},
			restrict() { return () => {}; },
			guard() { return () => {}; },
		},
		effect(factory) {
			const dispose = factory();
			if (typeof dispose === "function") effects.push(dispose);
			return dispose || (() => {});
		},
		storage: {
			domain: {
				open() {
					return Promise.resolve({
						async table() {
							return {
								async get() { return undefined; },
								async put() {},
								async update() {},
							};
						},
						async close() {},
					});
				},
			},
		},
	};
	return {
		ctx,
		tools,
		async promptVariable(name, context) {
			const callback = variables.get(name);
			if (!callback) throw new Error("提示变量未注册：" + name);
			return await callback(context);
		},
		async emit(event, ...args) { return await ctx.emit(event, ...args); },
		async dispose() {
			for (const dispose of effects.reverse()) {
				try { await dispose(); } catch { /* 清理失败不掩盖断言结果 */ }
			}
			effects.length = 0;
		},
	};
}

function createEnv(config = {}) {
	const memoryDir = mkdtempSync(join(tmpdir(), "dsh-memory-heat-e2e-"));
	const mock = createMockCtx();
	const originalInfo = console.info;
	console.info = () => {};
	try {
		apply(mock.ctx, { memoryDir, progressive: false, autoNamespace: false, defaultNamespace: "proj", ...config });
	} finally {
		console.info = originalInfo;
	}
	const namespace = config.defaultNamespace ?? "proj";
	const root = !namespace || namespace === "default" ? memoryDir : join(memoryDir, namespace);
	let callSeq = 0;
	const env = {
		memoryDir,
		root,
		mock,
		ctx: mock.ctx,
		agent(id = "e2e-session") {
			return { session: { id, header: { cwd: process.cwd() } }, ctx: { tools: { register: () => () => {} } } };
		},
		tool(name) {
			const def = mock.tools.get(name);
			if (!def) throw new Error("工具未注册：" + name);
			return def;
		},
		async call(name, args = {}, agent = env.agent()) {
			return await env.tool(name).execute(args, { agent, callId: "call-" + (++callSeq), signal: undefined });
		},
		async prompt(agent) { return await mock.promptVariable("layered_memory_index", { agent }); },
		async emit(event, ...args) { return await mock.emit(event, ...args); },
		async dispose() {
			await mock.dispose();
			rmSync(memoryDir, { recursive: true, force: true });
		},
	};
	return env;
}

// 写入一条 fact 夹具。
async function writeFact(env, topic, content, extra = {}) {
	return await env.call("memory_write", { kind: "fact", topic, content, evidence: "e2e 热度校验", ...extra });
}

// 从提示视图里提取 fact 条目顺序：完整视图是 [L2] a | b，截断视图是逐行 [fact] a。
function promptFactOrder(prompt) {
	const l2 = prompt.split("\n").find(line => line.startsWith("[L2] "));
	if (l2) return l2.slice(5).split(" | ").filter(Boolean);
	return prompt.split("\n")
		.filter(line => line.startsWith("[fact] ") && !line.includes("已省略"))
		.map(line => line.slice(7).trim());
}

// ---------------------------------------------------------------------------
// 断言与输出
// ---------------------------------------------------------------------------
function createCase(id, title) {
	const failures = [];
	const notes = [];
	return {
		id,
		title,
		check(label, ok, actual, expected) {
			if (!ok) failures.push({ label, actual, expected });
			return Boolean(ok);
		},
		note(key, value) { notes.push(key + "=" + value); },
		failures,
		notes,
	};
}

function textOf(value) {
	if (typeof value === "string") return value;
	if (value === undefined) return "undefined";
	try { return JSON.stringify(value); } catch { return String(value); }
}
function brief(value, limit = 200) {
	const text = textOf(value);
	return text.length > limit ? text.slice(0, limit) + "…" : text;
}
function firstDiff(actual, expected) {
	let at = 0;
	while (at < actual.length && at < expected.length && actual[at] === expected[at]) at++;
	return "首个差异@" + at + " 实际…" + actual.slice(Math.max(0, at - 10), at + 30) + "… 期望…" + expected.slice(Math.max(0, at - 10), at + 30) + "…";
}

// ---------------------------------------------------------------------------
// 用例 1：全量底座
// ---------------------------------------------------------------------------
async function case1(c) {
	const env = createEnv({ defaultNamespace: "", globalL1MaxChars: 512 });
	try {
		const agent = env.agent("case1-session");
		const total = 26;
		const keys = [];
		for (let i = 1; i <= total; i++) {
			const key = "底座事实-" + String(i).padStart(2, "0") + "-用于验证全量条目不因提示预算而消失";
			keys.push(key);
			await env.call("memory_write", { kind: "fact", topic: key, content: "第 " + i + " 条：底座校验令牌，正文用于全量校验。", evidence: "e2e 底座校验" }, agent);
		}
		await env.call("memory_write", { kind: "sop", topic: "底座经验", content: "底座经验：全量目录永远保留。", evidence: "e2e 底座校验" }, agent);

		const indexText = readFileSync(join(env.root, "index.txt"), "utf8");
		const l2Line = indexText.split("\n").find(line => line.startsWith("[L2]"));
		const indexKeys = l2Line ? l2Line.replace(/^\[L2\]\s*/, "").split(" | ").filter(Boolean) : [];
		c.note("index_chars", indexChars(indexText));
		c.note("index_fact", indexKeys.length + "/" + total);
		c.check("index.txt 含全部事实", keys.every(key => indexText.includes(key)) && indexKeys.length === total, indexKeys.length + " 条", total + " 条");
		c.check("index.txt 保持写入顺序", JSON.stringify(indexKeys) === JSON.stringify(keys), "顺序=" + brief(indexKeys, 80), "顺序=" + brief(keys, 80));

		const listed = await env.call("memory_list", {}, agent);
		const listKeys = listed.entries.filter(item => item.entry.kind === "fact").map(item => item.entry.key);
		c.check("memory_list 返回全部事实", listKeys.length === total && keys.every(key => listKeys.includes(key)), listKeys.length + " 条", total + " 条");

		const search = await env.call("memory_search", { query: "底座校验令牌", limit: 50 }, agent);
		const searchKeys = search.results.filter(item => item.entry.kind === "fact").map(item => item.entry.key);
		c.check("memory_search 返回全部事实", searchKeys.length === total && keys.every(key => searchKeys.includes(key)), searchKeys.length + " 条", total + " 条");

		const prompt = await env.prompt(agent);
		const kept = keys.filter(key => prompt.includes(key)).length;
		c.note("提示视图字符", prompt.length);
		c.note("提示视图保留", kept + "/" + total);
		c.check("小预算提示视图确实截断", kept > 0 && kept < total, "保留 " + kept + " 条", "0 < 保留 < " + total);
		c.check("存在截断提示", /较早的 \d+ 条已省略|本视图受 \d+ 字符预算限制/.test(prompt), "有截断提示", "有截断提示");
	} finally {
		await env.dispose();
	}
}

// ---------------------------------------------------------------------------
// 用例 9：无 options 时 buildPromptIndex 输出与旧行为一致（黄金串）
// ---------------------------------------------------------------------------
function goldenIndexText() {
	const facts = Array.from({ length: 20 }, (_, i) => "fact-" + String(i + 1).padStart(2, "0") + "-alpha");
	const sops = Array.from({ length: 8 }, (_, i) => "sops/sop-" + String(i + 1).padStart(2, "0") + "-beta.md");
	return [
		"# Memory Index",
		"环境事实在 facts.md，任务经验在 sops/；正文按需读取。",
		"<!-- AUTO-BEGIN -->",
		"[L2] " + facts.join(" | "),
		"[L3] " + sops.join(" | "),
		"<!-- AUTO-END -->",
		"## 规则",
		"- 规则甲必须最先出现",
		"- 规则乙不可省略",
		"- 规则丙保持原样",
	].join("\n");
}
// 黄金串由改动前的 buildPromptIndex 逐字节生成，用于锁定无 options 的旧行为。
const OLD_BEHAVIOR_GOLDEN = [
	[450, "记忆 [default]：fact 20 条，sop 8 条。\n## 规则\n- 规则甲必须最先出现\n- 规则乙不可省略\n- 规则丙保持原样\n[fact] （较早的 13 条已省略；memory_list 可列举全部）\n[fact] fact-14-alpha\n[fact] fact-15-alpha\n[fact] fact-16-alpha\n[fact] fact-17-alpha\n[fact] fact-18-alpha\n[fact] fact-19-alpha\n[fact] fact-20-alpha\n[sop] （较早的 7 条已省略；memory_list 可列举全部）\n[sop] sop-08-beta\n本视图受 450 字符预算限制：省略已写进对应层；完整索引与规则用 memory_read 读取；memory_list / memory_search 返回可读 entry。"],
	[350, "记忆 [default]：fact 20 条，sop 8 条。\n## 规则\n- 规则甲必须最先出现\n- 规则乙不可省略\n- 规则丙保持原样\n[fact] （较早的 17 条已省略；memory_list 可列举全部）\n[fact] fact-18-alpha\n[fact] fact-19-alpha\n[fact] fact-20-alpha\n[sop] （较早的 8 条已省略；memory_list 可列举全部）\n本视图受 350 字符预算限制：省略已写进对应层；完整索引与规则用 memory_read 读取；memory_list / memory_search 返回可读 entry。"],
	[260, "记忆 [default]：fact 20 条，sop 8 条。\n## 规则\n- 规则甲必须最先出现\n- 规则乙不可省略\n- 规则丙保持原样\n[fact] （较早的 20 条已省略；memory_list 可列举全部）\n[sop] （较早的 8 条已省略；m\n本视图受 260 字符预算限制：省略已写进对应层；完整索引与规则用 memory_read 读取；memory_list / memory_search 返回可读 entry。"],
	[180, "记忆 [default]：fact 20 条，sop 8 条。\n（规则过长，省略 4 行；完整索引与规则用 m\n[fac\n[s\n本视图受 180 字符预算限制：省略已写进对应层；完整索引与规则用 memory_read 读取；memory_list / memory_search 返回可读 entry。"],
];

async function case9(c) {
	const indexText = goldenIndexText();
	const full = buildPromptIndex(indexText, 2000);
	c.check("预算充足时原样返回", full === indexText, full === indexText ? "逐字节一致" : firstDiff(full, indexText), "逐字节一致");
	for (const [cap, expected] of OLD_BEHAVIOR_GOLDEN) {
		const actual = buildPromptIndex(indexText, cap);
		c.check("cap=" + cap + " 与旧行为逐字节一致", actual === expected, actual === expected ? "逐字节一致" : firstDiff(actual, expected), "旧行为 len=" + expected.length);
	}
	c.note("golden_caps", OLD_BEHAVIOR_GOLDEN.map(([cap]) => cap).join("/"));
}

// ---------------------------------------------------------------------------
// 用例 2：排序，高热度靠前，预算够时全部出现
// ---------------------------------------------------------------------------
async function case2(c) {
	const env = createEnv({ defaultNamespace: "", globalL1MaxChars: 4096, heatNewEntryBonus: 0 });
	try {
		const facts = ["热度-01", "热度-02", "热度-03", "热度-04", "热度-05", "热度-06"];
		for (const key of facts) await writeFact(env, key, key + " 的正文");
		for (let i = 1; i <= 5; i++) await env.call("memory_read", { entry: { namespace: "default", kind: "fact", key: "热度-03" } }, env.agent("排序热读-3-" + i));
		for (let i = 1; i <= 2; i++) await env.call("memory_read", { entry: { namespace: "default", kind: "fact", key: "热度-02" } }, env.agent("排序热读-2-" + i));
		const prompt = await env.prompt(env.agent("排序会话"));
		const order = promptFactOrder(prompt);
		c.note("rank 顺序", order.join(" > "));
		c.check("高热度条目排在最前", order[0] === "热度-03" && order[1] === "热度-02", "前二=" + order.slice(0, 2).join(" > "), "前二=热度-03 > 热度-02");
		c.check("预算够时全部条目仍出现", facts.every(key => order.includes(key)) && order.length === facts.length, order.length + " 条", facts.length + " 条");
	} finally {
		await env.dispose();
	}
}

// ---------------------------------------------------------------------------
// 用例 3：冷条目探索位，不同 sessionSeed 轮换
// ---------------------------------------------------------------------------
async function case3(c) {
	const env = createEnv({ defaultNamespace: "", globalL1MaxChars: 900, heatNewEntryBonus: 0 });
	try {
		const total = 40;
		const keys = [];
		for (let i = 1; i <= total; i++) {
			const key = "冷条目-" + String(i).padStart(2, "0") + "-用于探索位轮换验证的较长名称";
			keys.push(key);
			await writeFact(env, key, "第 " + i + " 条冷条目正文。");
		}
		// 按 apply 的同款规则算出当前排序的最冷端，作为探索位候选池（最冷 24 条）。
		const entries = readEntries(env.root);
		const scores = scoreEntries(entries, { access: loadAccess(env.root), meta: readMeta(env.root), heat: {}, newEntryBonus: 0 });
		const ranks = rankEntries(entries, scores);
		const orderedIds = entries.filter(entry => !entry.meta?.archived).map(entry => entryId(entry.kind, entry.key))
			.sort((a, b) => (ranks.get(a) ?? -Infinity) - (ranks.get(b) ?? -Infinity));
		const coldPool = new Set(orderedIds.slice(-24).map(id => id.slice(id.indexOf(":") + 1)));
		const sessions = ["探索会话-A", "探索会话-B", "探索会话-C"];
		const shownSets = [];
		const deepShown = new Set();
		for (const sessionId of sessions) {
			const prompt = await env.prompt(env.agent(sessionId));
			const order = promptFactOrder(prompt);
			const shown = new Set(order);
			// prompt 未经 inbox，回合序号为 0；与 apply 完全一致的种子：sessionId|epoch|namespace。
			const expectedCold = [...pickColdSet(orderedIds, { sessionSeed: sessionId + "|0|default" })];
			const shownCold = expectedCold.filter(id => shown.has(id.slice(id.indexOf(":") + 1)));
			// 序号 24 以后的最冷条目不可能靠热条目预算进入视图，出现即证明探索位生效。
			for (const id of shownCold) if (orderedIds.indexOf(id) >= 24) deepShown.add(id.slice(id.indexOf(":") + 1));
			shownSets.push(shownCold.map(id => id.slice(id.indexOf(":") + 1)));
			c.note(sessionId + " 显示", order.length + "/" + total + "，冷命中 " + shownCold.length + "/" + expectedCold.length);
			c.check(sessionId + " 冷探索位被显示", shownCold.length > 0, "命中 " + shownCold.length + " 条", ">0");
			c.check(sessionId + " 提示视图确实截断", order.length < total, order.length + " 条", "<" + total + " 条");
		}
		c.note("深冷救回", deepShown.size + " 条");
		c.check("最冷端条目确实靠探索位进入视图", deepShown.size > 0, deepShown.size + " 条", ">0");
		const signatures = shownSets.map(set => [...set].sort().join(","));
		const distinct = new Set(signatures).size;
		c.note("不同会话冷集合", signatures.map(text => brief(text, 90)).join(" ｜ "));
		c.check("不同 sessionSeed 轮换不同冷条目", distinct >= 2, distinct + " 种", "≥2 种");

		const turnAgent = env.agent("探索长会话");
		const turnColdSets = [];
		for (const epoch of [0, 1, 2]) {
			if (epoch > 0) {
				await env.emit("agent/inbox/inserted", { agent: turnAgent, message: { source: { kind: "user" }, content: [{ type: "text", text: "第 " + epoch + " 回合" }] } });
			}
			const order = promptFactOrder(await env.prompt(turnAgent));
			const expectedCold = [...pickColdSet(orderedIds, { sessionSeed: "探索长会话|" + epoch + "|default" })];
			const shownCold = expectedCold.map(id => id.slice(id.indexOf(":") + 1)).filter(key => order.includes(key));
			turnColdSets.push(shownCold);
			c.note("长会话 epoch=" + epoch, shownCold.map(key => brief(key, 50)).join(","));
			c.check("长会话 epoch=" + epoch + " 冷集合来自探索池", shownCold.length > 0 && shownCold.every(key => coldPool.has(key)), shownCold.length + " 条", ">0 且全部来自探索池");
		}
		const turnDistinct = new Set(turnColdSets.map(set => [...set].sort().join(","))).size;
		c.check("同一 sessionId 连续用户回合冷集合轮换", turnDistinct >= 2, turnDistinct + " 种", "≥2 种");
	} finally {
		await env.dispose();
	}
}

// ---------------------------------------------------------------------------
// 用例 4：计分（同会话只 +1，维护读与 search 不计）
// ---------------------------------------------------------------------------
async function case4(c) {
	const env = createEnv({ defaultNamespace: "" });
	try {
		const key = "计分目标";
		await writeFact(env, key, "计分目标正文，包含检索词 计分检索。");
		const entry = { namespace: "default", kind: "fact", key };
		const count = () => loadAccess(env.root)["fact:" + key]?.count ?? 0;
		await env.call("memory_read", { entry }, env.agent("计分-会话-A"));
		const first = count();
		await env.call("memory_read", { entry }, env.agent("计分-会话-A"));
		const sameSession = count();
		await env.call("memory_read", { entry }, env.agent("计分-会话-B"));
		const otherSession = count();
		await env.call("memory_search", { query: "计分检索" }, env.agent("计分-会话-C"));
		const afterSearch = count();
		await env.call("memory_read", { entry: { namespace: "default", kind: "index", key: "index" } }, env.agent("计分-会话-D"));
		const afterIndex = count();
		const maintenanceTools = buildTools(env.mock.ctx, { memoryDir: env.memoryDir, defaultNamespace: "", autoNamespace: false, heatHalfLifeDays: 14, l1MaxChars: 12288 }, { isMaintenance: () => true });
		const maintenanceRead = maintenanceTools.find(def => def.name === "memory_read");
		await maintenanceRead.execute({ entry }, { agent: env.agent("维护-worker"), callId: "call-maint" });
		const afterMaintenance = count();
		c.note("count 序列", first + "→" + sameSession + "→" + otherSession + "→" + afterSearch + "→" + afterIndex + "→" + afterMaintenance);
		c.check("同会话重复 read 只 +1", first === 1 && sameSession === 1, "首次=" + first + " 重复=" + sameSession, "1/1");
		c.check("不同会话 read 累加", otherSession === 2, otherSession, 2);
		c.check("memory_search 不计分", afterSearch === 2, afterSearch, 2);
		c.check("index 读取不计分", afterIndex === 2, afterIndex, 2);
		c.check("维护读不计分", afterMaintenance === 2, afterMaintenance, 2);
	} finally {
		await env.dispose();
	}
}

// ---------------------------------------------------------------------------
// 用例 5：related 小额加分且封顶；新条目新手保护
// ---------------------------------------------------------------------------
async function case5(c) {
	const env = createEnv({ defaultNamespace: "", heatNewEntryBonus: 0 });
	try {
		await writeFact(env, "单链目标", "单链目标正文");
		await writeFact(env, "多链目标", "多链目标正文");
		const related = key => ({ namespace: "default", kind: "fact", key });
		await writeFact(env, "引用条目甲", "引用单链目标", { related: [related("单链目标")] });
		await writeFact(env, "引用条目乙", "引用多链目标", { related: [related("多链目标")] });
		await writeFact(env, "引用条目丙", "引用多链目标", { related: [related("多链目标")] });
		await writeFact(env, "引用条目丁", "引用多链目标", { related: [related("多链目标")] });
		const scores = scoreEntries(readEntries(env.root), { access: loadAccess(env.root), meta: readMeta(env.root), heat: {}, newEntryBonus: 0 });
		const single = scores.get("fact:单链目标").related;
		const multi = scores.get("fact:多链目标").related;
		c.note("related", "单链=" + single + " 多链=" + multi);
		c.check("单条 related 得小额加分", Math.abs(single - 0.25) < 1e-9, single, 0.25);
		c.check("related 加分封顶", Math.abs(multi - 0.5) < 1e-9, multi, 0.5);
	} finally {
		await env.dispose();
	}
	const freshEnv = createEnv({ defaultNamespace: "" });
	try {
		await writeFact(freshEnv, "新条目", "新条目正文");
		await writeFact(freshEnv, "旧条目", "旧条目正文");
		const metaPath = join(freshEnv.root, "memory-meta.json");
		const meta = JSON.parse(readFileSync(metaPath, "utf8"));
		meta.facts["旧条目"].createdAt = new Date(Date.now() - 30 * 86400000).toISOString();
		writeFileSync(metaPath, JSON.stringify(meta, null, 2));
		const scores = scoreEntries(readEntries(freshEnv.root), { access: loadAccess(freshEnv.root), meta: readMeta(freshEnv.root), heat: {} });
		const fresh = scores.get("fact:新条目");
		const old = scores.get("fact:旧条目");
		c.note("newbie", "新=" + fresh.newbie.toFixed(3) + " 旧=" + old.newbie.toFixed(3) + " 分=" + fresh.score.toFixed(3) + "/" + old.score.toFixed(3));
		c.check("新条目有新手保护", fresh.newbie > 1.4 && old.newbie === 0, "新=" + fresh.newbie.toFixed(3) + " 旧=" + old.newbie.toFixed(3), "新>1.4 旧=0");
		c.check("新条目总分高于旧条目", fresh.score > old.score, fresh.score.toFixed(3) + " > " + old.score.toFixed(3), "新>旧");
	} finally {
		await freshEnv.dispose();
	}
}

// ---------------------------------------------------------------------------
// 用例 6：用户回合快照，同回合顺序不变、下一用户回合刷新
// ---------------------------------------------------------------------------
async function case6(c) {
	const env = createEnv({ defaultNamespace: "", globalL1MaxChars: 4096, heatNewEntryBonus: 0 });
	try {
		const keys = ["快照-01", "快照-02", "快照-03", "快照-04", "快照-05"];
		for (const key of keys) await writeFact(env, key, key + " 正文");
		const agentA = env.agent("快照会话-A");
		const before = promptFactOrder(await env.prompt(agentA));
		for (let i = 1; i <= 5; i++) await env.call("memory_read", { entry: { namespace: "default", kind: "fact", key: "快照-03" } }, agentA);
		for (let i = 1; i <= 5; i++) await env.call("memory_read", { entry: { namespace: "default", kind: "fact", key: "快照-03" } }, env.agent("快照加热-" + i));
		const after = promptFactOrder(await env.prompt(agentA));
		const messages = [{ source: { kind: "user" }, content: [{ type: "text", text: "当前回合的新查询" }] }];
		await env.emit("agent/pre-step", { agent: agentA, messages }, async () => ({ kind: "allow" }));
		const afterPreStep = promptFactOrder(await env.prompt(agentA));
		await env.emit("agent/inbox/inserted", { agent: agentA, message: { source: { kind: "user" }, content: [{ type: "text", text: "下一回合" }] } });
		const nextTurn = promptFactOrder(await env.prompt(agentA));
		c.note("A 首次", before.join(" > "));
		c.note("A 同回合", after.join(" > "));
		c.note("A pre-step", afterPreStep.join(" > "));
		c.note("A 下一回合", nextTurn.join(" > "));
		c.check("同一用户回合反复装配顺序不变", JSON.stringify(after) === JSON.stringify(before), after.join(" > "), before.join(" > "));
		c.check("pre-step 不开启新回合", JSON.stringify(afterPreStep) === JSON.stringify(before), afterPreStep.join(" > "), before.join(" > "));
		c.check("下一用户回合同会话按新热度刷新", nextTurn[0] === "快照-03" && before[0] !== "快照-03" && JSON.stringify(nextTurn) !== JSON.stringify(before), "下一回合首位=" + nextTurn[0], "快照-03");
	} finally {
		await env.dispose();
	}
}

// ---------------------------------------------------------------------------
// 用例 7：召回段
// ---------------------------------------------------------------------------
async function case7(c) {
	const env = createEnv({ defaultNamespace: "", globalL1MaxChars: 4096, heatNewEntryBonus: 0 });
	try {
		for (let i = 1; i <= 6; i++) await writeFact(env, "无关条目-" + i, "无关条目 " + i + " 的普通正文");
		await writeFact(env, "部署端口约定", "生产环境网关端口是 5432，走内网访问。");
		const agent = env.agent("召回会话");
		const messages = [{ source: { kind: "user" }, content: [{ type: "text", text: "生产环境网关端口是多少？" }] }];
		await env.emit("agent/pre-step", { agent, messages }, async () => ({ kind: "allow" }));
		const prompt = await env.prompt(agent);
		const recallLine = prompt.split("\n").find(line => line.startsWith("召回（与本次请求相关）："));
		c.note("召回行", recallLine ? brief(recallLine, 120) : "（无）");
		c.check("召回段存在", Boolean(recallLine), recallLine ? "有" : "无", "有");
		c.check("召回包含低热度匹配条目", Boolean(recallLine && recallLine.includes("[fact] 部署端口约定")), recallLine ? "包含" : "不包含", "包含 [fact] 部署端口约定");
		c.check("召回段不含无关条目", Boolean(recallLine && !recallLine.includes("无关条目")), "无关条目数=" + (recallLine ? (recallLine.match(/无关条目/g) || []).length : 0), 0);
		const l2 = prompt.split("\n").find(line => line.startsWith("[L2] ")) || "";
		c.check("召回条目在条目层去重", !l2.includes("部署端口约定"), l2.includes("部署端口约定") ? "条目层仍有" : "已去重", "已去重");
	} finally {
		await env.dispose();
	}
}

// ---------------------------------------------------------------------------
// 用例 8：规则段最先且完整
// ---------------------------------------------------------------------------
async function case8(c) {
	const env = createEnv({ defaultNamespace: "", globalL1MaxChars: 640, heatNewEntryBonus: 0 });
	try {
		const keys = [];
		for (let i = 1; i <= 30; i++) {
			const key = "规则预算-" + String(i).padStart(2, "0") + "-用于验证规则段完整";
			keys.push(key);
			await writeFact(env, key, "第 " + i + " 条正文");
		}
		const indexPath = join(env.root, "index.txt");
		const original = readFileSync(indexPath, "utf8");
		const rules = ["[RULES]", "- 红线甲：规则段必须最先", "- 红线乙：规则段必须完整", "- 红线丙：预算内不截断"].join("\n");
		writeFileSync(indexPath, original.replace("[RULES]", rules));
		const prompt = await env.prompt(env.agent("规则会话"));
		const lines = prompt.split("\n");
		const rulePositions = rules.split("\n").map(line => lines.indexOf(line));
		const firstFact = lines.findIndex(line => line.startsWith("[fact] "));
		const allRules = rulePositions.slice(1).every(position => position >= 0);
		const order = promptFactOrder(prompt);
		c.note("prompt 字符", prompt.length);
		c.note("规则位置", rulePositions.join(","));
		c.note("首个条目位置", firstFact);
		c.check("规则段完整保留", allRules, allRules ? "3/3 行" : "缺行", "3/3 行");
		c.check("规则段在条目之前", allRules && rulePositions.slice(1).every(position => position < firstFact), "规则=" + rulePositions.slice(1).join(",") + " 首条目=" + firstFact, "规则位置 < 首条目位置");
		c.check("预算确实触发截断", order.length > 0 && order.length < keys.length, order.length + "/" + keys.length, ">0 且 <" + keys.length);
	} finally {
		await env.dispose();
	}
}

// ---------------------------------------------------------------------------
// 用例注册表：九项验收全部实现。
// ---------------------------------------------------------------------------
const CASES = [
	{ id: 1, title: "全量底座：小预算截断后 index.txt / memory_list / memory_search 仍含全部活跃条目", ready: true, run: case1 },
	{ id: 2, title: "排序：高热度条目在提示视图靠前；预算够时所有条目仍出现", ready: true, run: case2 },
	{ id: 3, title: "截断保护：冷条目有探索位，不会永久隐身（不同 sessionSeed 轮换）", ready: true, run: case3 },
	{ id: 4, title: "计分：同会话重复 read 只 +1；维护读不计；search 不计", ready: true, run: case4 },
	{ id: 5, title: "related 小额加分且封顶；新条目有新手保护", ready: true, run: case5 },
	{ id: 6, title: "用户回合快照：同回合反复装配顺序不变；下一用户回合同会话按新热度刷新", ready: true, run: case6 },
	{ id: 7, title: "召回：低热度但正文匹配当前请求的条目出现在召回段", ready: true, run: case7 },
	{ id: 8, title: "规则段仍最先且完整（预算内）", ready: true, run: case8 },
	{ id: 9, title: "无 options 时 buildPromptIndex 输出与旧行为一致", ready: true, run: case9 },
];

let passed = 0;
let implemented = 0;
for (const item of CASES) {
	if (!item.ready) {
		console.log("SKIP " + item.id + " " + item.title + "（待实现：等待 lead 通知）");
		continue;
	}
	implemented++;
	const c = createCase(item.id, item.title);
	try {
		await item.run(c);
	} catch (error) {
		c.check("用例未抛异常", false, error?.stack || String(error), "无异常");
	}
	const extra = c.notes.length ? " " + c.notes.join(" ") : "";
	if (c.failures.length) {
		const first = c.failures[0];
		console.log("FAIL " + item.id + " " + item.title + " 实际=" + brief(first.actual) + " 期望=" + brief(first.expected) + extra);
		for (const failure of c.failures) {
			console.log("  详情 " + failure.label + ": 实际=" + brief(failure.actual) + " 期望=" + brief(failure.expected));
		}
	} else {
		passed++;
		console.log(("PASS " + item.id + " " + item.title + extra).trimEnd());
	}
}
const pending = CASES.length - implemented;
console.log("SUMMARY " + passed + "/" + implemented + (pending ? "（已实现 " + implemented + " 项，待补 " + pending + " 项）" : ""));
if (passed !== implemented) process.exitCode = 1;
