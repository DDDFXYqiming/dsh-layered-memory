import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineTool } from "@deepseek-ai/dsh-tools";
import Schema from "@deepseek-ai/schemastery";
import { ensureNamespaceLayout, nsRoot, resolveNamespace, defaultMemDir, backfillMeta, HEAT_HALF_LIFE_DAYS, RECENCY_WINDOW_MS } from "./store.js";
import { NEAR_DUPE_THRESHOLD, MERGE_CANDIDATE_THRESHOLD, MIN_TOKENS_FOR_FUZZY, COLD_REVIEW_DAYS } from "./maintain.js";
import { L1_MAX_CHARS_DEFAULT, buildCombinedPromptIndex } from "./l1index.js";
import { buildTools } from "./tools.js";
import { wireEvents } from "./events.js";
import { createTurnReviewer } from "./turn-review.js";
import { createActivitySource } from "./activity.js";
import { readActivation } from "./activation-history.js";
import { SKILL_NAME, SKILL_DESCRIPTION, SKILL_WHEN_TO_USE, SKILL_CONTENT } from "./skill-content.js";

const inject = ["skills", "tools", "agents", "agentPresets", "systemPrompt", "sessionQuery", "sessions", "sessionPersistence", "storage", "storageDomain"];
const accessSchema = () => Schema.union([Schema.const("read"), Schema.const("write")]);
export const Config = Schema.object({
	memoryDir: Schema.string().default(""),
	progressive: Schema.boolean().default(true),
	memoryAccess: accessSchema().default("write"),
	subagentMemoryAccess: accessSchema().default("read"),
	defaultNamespace: Schema.string().default(""),
	autoNamespace: Schema.boolean().default(true),
	autoPending: Schema.boolean().default(false),
	turnReviewEnabled: Schema.boolean().default(true),
	turnReviewMinEvidence: Schema.natural().min(1).max(32).default(6),
	reflectionEnabled: Schema.boolean().default(true),
	reflectionMode: Schema.union([Schema.const("auto"), Schema.const("notify")]).default("notify"),
	maintenanceLlmProvider: Schema.string().default(""),
	maintenanceModel: Schema.string().default(""),
	maintenanceReasoningEffort: Schema.string().default(""),
	turnReviewReasoningEffort: Schema.string().default(""),
	maintenanceMaxTokens: Schema.natural().min(1).default(16384),
	maintenanceCooldownMinutes: Schema.natural().min(1).default(30),
	maintenanceTimeoutSeconds: Schema.natural().min(10).default(300),
	maintenanceMaxCalls: Schema.natural().min(1).default(64),
	maintenanceMaxWrites: Schema.natural().min(1).default(6),
	maintainEveryTurns: Schema.natural().default(20),
	reflectPendingThreshold: Schema.natural().default(5),
	reflectSopsThreshold: Schema.natural().default(40),
	l1MaxChars: Schema.number().min(1024).default(L1_MAX_CHARS_DEFAULT),
	globalL1MaxChars: Schema.natural().min(512).default(2048),
	// 索引整理的目标水位线比例：目标字符 = l1MaxChars × 本值，默认 0.9。
	// 预算是硬上限、不靠抬高它回避整理；水位线给新记忆留出继续写入的空间。
	indexTargetRatio: Schema.number().min(0.5).max(1).default(0.9),
	reflectCooldownTurns: Schema.natural().default(10),
	nearDupeThreshold: Schema.number().min(0).max(1).default(NEAR_DUPE_THRESHOLD),
	mergeCandidateThreshold: Schema.number().min(0).max(1).default(MERGE_CANDIDATE_THRESHOLD),
	minTokensForFuzzy: Schema.number().min(1).default(MIN_TOKENS_FOR_FUZZY),
	heatHalfLifeDays: Schema.number().min(1).default(HEAT_HALF_LIFE_DAYS),
	recencyWindowDays: Schema.number().min(1).default(RECENCY_WINDOW_MS / 86400000),
	coldReviewDays: Schema.number().min(1).default(COLD_REVIEW_DAYS),
});

const READ_TOOLS = new Set(["memory_read", "memory_list", "memory_search", "memory_stats", "memory_pending", "memory_expand", "memory_history"]);
const CORE_TOOLS = new Set(["memory_read", "memory_list", "memory_search", "memory_write", "memory_update"]);
const COMMON_TOOLS = new Set(["memory_read", "memory_list", "memory_search", "memory_stats", "memory_write", "memory_update", "memory_review"]);
const skillGesture = message => message?.source?.kind === "user" && message.content.some(block => block.type === "text" && /(^|\s)\/memory(?=\s|$)/.test(block.text));

function apply(ctx, config = {}) {
	const cfg = Config(Object.fromEntries(Object.entries(config).filter(([, value]) => value !== "")));
	if (!cfg.memoryDir) cfg.memoryDir = defaultMemDir();
	const version = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")).version;
	const runtimeInfo = { version, loadedAt: new Date().toISOString(), source: fileURLToPath(import.meta.url), memoryDir: cfg.memoryDir, mode: cfg.reflectionMode, turnReviewEnabled: cfg.turnReviewEnabled, turnReviewDelivery: "plugin", turnReviewMinEvidence: cfg.turnReviewMinEvidence, maintenanceCooldownMinutes: cfg.maintenanceCooldownMinutes, maintenanceWorkerLimit: 2 };
	cfg.runtimeInfo = runtimeInfo;
	if (Boolean(cfg.maintenanceLlmProvider) !== Boolean(cfg.maintenanceModel)) throw new Error("maintenanceLlmProvider and maintenanceModel must be set together");
	cfg.heat = { halfLifeDays: cfg.heatHalfLifeDays, recencyWindowMs: cfg.recencyWindowDays * 86400000 };
	cfg.maintainOpts = { nearDupeThreshold: cfg.nearDupeThreshold, mergeCandidateThreshold: cfg.mergeCandidateThreshold, minTokensForFuzzy: cfg.minTokensForFuzzy, heat: cfg.heat, coldReviewDays: cfg.coldReviewDays, indexTargetRatio: cfg.indexTargetRatio };
	const workspaceRoots = new Map();
	cfg.workspaceRootFor = cwd => workspaceRoots.get(cwd) || cwd;
	const activity = createActivitySource(ctx, cfg);
	ctx.provide("layeredMemoryActivity", activity);
	async function prepareWorkspace(agent) {
		const cwd = agent.session.header.cwd;
		if (!cfg.autoNamespace || cfg.defaultNamespace || !cwd || workspaceRoots.has(cwd)) return;
		const workspace = await ctx.get("workspaces")?.resolveByPath(cwd);
		workspaceRoots.set(cwd, workspace?.path || cwd);
	}
	const disposers = [() => activity.dispose()];
	const states = new Map();
	const ensured = new Set();
	let maintenance;
	function resolveRoot(cwd) {
		const namespace = resolveNamespace(cfg, undefined, cwd);
		const root = nsRoot(cfg.memoryDir, namespace);
		if (!ensured.has(root)) {
			ensureNamespaceLayout(root, { namespace, ...(!cfg.defaultNamespace && cfg.autoNamespace && namespace !== "default" ? { workspace: cfg.workspaceRootFor(cwd || process.cwd()) } : {}) });
			backfillMeta(root, { namespace });
			ensured.add(root);
		}
		return root;
	}
	function scopeFor(agent) {
		const job = maintenance?.scopeFor(agent);
		if (job) return { root: job.root, namespace: job.namespace };
		const cwd = agent?.session.header.cwd;
		return { root: resolveRoot(cwd), namespace: resolveNamespace(cfg, undefined, cwd) };
	}
	resolveRoot();
	const systemPrompt = ctx.get("systemPrompt");
	disposers.push(systemPrompt.variable("layered_memory_index", context => {
		const { namespace } = scopeFor(context.agent);
		const { text } = buildCombinedPromptIndex(cfg.memoryDir, namespace, { projectMaxChars: cfg.l1MaxChars, globalMaxChars: cfg.globalL1MaxChars });
		return text ? `<memory_index source="user-writable">\n${text.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")}\n</memory_index>` : "";
	}));
	disposers.push(systemPrompt.context({ name: "memory:index", order: 10, text: "{{layered_memory_index}}" }));
	disposers.push(ctx.skills.register({ name: SKILL_NAME, description: SKILL_DESCRIPTION, whenToUse: SKILL_WHEN_TO_USE, source: "runtime", content: SKILL_CONTENT }));
	// 只有真正的委派子会话（header.origin === "subagent"）才受 subagentMemoryAccess 约束。
	// 会话分叉（session.fork）是普通会话的副本：它带 parentSession 表示血缘，但仍是独立运行的根 Agent。
	const isSubagentSession = agent => agent?.session.header.origin === "subagent";
	const allowedAccess = agent => cfg.memoryAccess === "read" || (isSubagentSession(agent) && cfg.subagentMemoryAccess === "read") ? "read" : "write";
	const allTools = buildTools(ctx, cfg, {
		requestMaintenance: (namespace, exec, report) => maintenance.request(nsRoot(cfg.memoryDir, namespace), namespace, exec.agent, {
			purpose: "batch", trigger: { kind: "manual", callId: exec.callId }, report,
		}),
	}).map(def => READ_TOOLS.has(def.name) ? def : {
		...def,
		execute(args, exec) {
			if (allowedAccess(exec.agent) !== "write") throw new Error(`${def.name}: this agent has read-only memory access`);
			return def.execute(args, exec);
		},
	});
	function detach(agent) {
		const state = states.get(agent);
		if (!state) return;
		for (const dispose of [...state.disposers.values()].reverse()) dispose();
		states.delete(agent);
	}
	function activate(agent, mode = "common") {
		if (maintenance?.owns(agent)) throw new Error("maintenance workers receive memory tools from their active job");
		const access = allowedAccess(agent);
		let state = states.get(agent);
		if (!state) { state = { disposers: new Map() }; states.set(agent, state); }
		const selected = allTools.filter(def => cfg.progressive && !CORE_TOOLS.has(def.name) && (mode === "manage" || COMMON_TOOLS.has(def.name)) && (access === "write" || READ_TOOLS.has(def.name)));
		const already = selected.every(def => state.disposers.has(def.name));
		for (const def of selected) if (!state.disposers.has(def.name)) state.disposers.set(def.name, agent.ctx.tools.register(def));
		const tools = allTools.filter(def => (!cfg.progressive || CORE_TOOLS.has(def.name) || state.disposers.has(def.name)) && (access === "write" || READ_TOOLS.has(def.name))).map(def => def.name);
		return { activated: true, already, tools, access, mode };
	}
	const reviewTurn = createTurnReviewer(ctx, cfg, {
		scope: scopeFor,
		canWrite: agent => allowedAccess(agent) === "write" && !maintenance.owns(agent),
		review: (agent, activity) => maintenance.request(resolveRoot(agent.session.header.cwd), resolveNamespace(cfg, undefined, agent.session.header.cwd), agent, {
			purpose: "turn_review", trigger: { kind: "automatic", turn: activity.turn, endSeq: activity.endSeq }, activity,
		}),
	});
	disposers.push(wireEvents(ctx, cfg, {
		resolveRoot, reviewTurn,
		onActivity: record => activity.publish(record),
		canWrite: agent => allowedAccess(agent) === "write",
		onMaintenanceRunner(runner) { maintenance = runner; ctx.provide("layeredMemoryWorkers", runner.workers); },
		maintenanceTools(namespace) {
			return buildTools(ctx, { ...cfg, defaultNamespace: namespace, autoNamespace: false }, {
				resolveReviewEvidence: (args, exec) => maintenance.scopeFor(exec.agent).evidence.resolveReview(args.evidence_call_ids, exec.signal),
			});
		},
		onSkillResult(exec, result) {
			if (!result.isError && exec.name === "skill" && exec.arguments.name === "memory" && exec.agent && !maintenance.owns(exec.agent)) activate(exec.agent);
		},
	}));
	const restored = new WeakSet();
	disposers.push(ctx.on("system-prompt/assemble", async (_assembly, context, next) => {
		const agent = context.agent;
		const query = ctx.get("sessionQuery");
		if (agent && cfg.progressive && query && !maintenance.owns(agent) && !restored.has(agent)) {
			restored.add(agent);
			const prior = await readActivation(query, agent.session.id);
			if (prior && !states.has(agent) && !maintenance.owns(agent)) {
				activate(agent, prior.mode);
				return systemPrompt.assemble(context);
			}
		}
		return next();
	}));
	disposers.push(ctx.on("agent/created", async ({ agent }) => { await prepareWorkspace(agent); }));
	disposers.push(ctx.on("agent/inbox/inserted", ({ agent, message }) => { if (skillGesture(message) && !maintenance.owns(agent)) activate(agent); }));
	disposers.push(ctx.on("agent/pre-step", async ({ agent, messages }, next) => {
		await prepareWorkspace(agent);
		const decision = await next();
		if (decision.kind !== "reject" && messages.some(skillGesture) && !maintenance.owns(agent)) activate(agent);
		return decision;
	}));
	disposers.push(ctx.on("agent/disposed", ({ agent }) => detach(agent)));
	ctx.tools.register(defineTool({
		name: "memory_activate",
		description: "基础记忆查阅和写入工具已可直接使用。common 补充统计与复核工具；manage 增加候选、归档、历史、溯源、迁移与维护工具。读写权限由用户配置决定。",
		parameters: { mode: { type: "string", enum: ["common", "manage"] } },
		output: { schema: { type: "object", additionalProperties: true, properties: { activated: { type: "boolean", required: true }, already: { type: "boolean", required: true }, tools: { type: "array", items: { type: "string" }, required: true } } }, render: (_args, value) => [{ type: "text", text: `${value.access}/${value.mode}: ${value.tools.join(", ")}` }] },
		execute: async (args, exec) => {
			if (!exec.agent) throw new Error("memory_activate requires an agent session");
			await prepareWorkspace(exec.agent);
			return activate(exec.agent, args.mode || "common");
		},
		presentCall: () => ({ card: "generic", title: "激活记忆工具", kind: "execute" }),
	}));
	for (const def of allTools) if (!cfg.progressive || CORE_TOOLS.has(def.name)) ctx.tools.register(def);
	console.info(`[dsh-layered-memory] v${version} loaded=${runtimeInfo.loadedAt} source=${runtimeInfo.source} memoryDir=${cfg.memoryDir} mode=${cfg.reflectionMode} autoPending=${cfg.autoPending} access=${cfg.memoryAccess}/${cfg.subagentMemoryAccess}`);
	ctx.effect(() => () => {
		for (const agent of states.keys()) detach(agent);
		for (const dispose of disposers.reverse()) dispose();
	}, "layered-memory: teardown");
}
export { apply, inject };
