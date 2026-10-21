import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineTool } from "@deepseek-ai/dsh-tools";
import Schema from "@deepseek-ai/schemastery";
import { ensureNamespaceLayout, nsRoot, resolveNamespace, defaultMemDir, backfillMeta, HEAT_HALF_LIFE_DAYS, RECENCY_WINDOW_MS } from "./store.js";
import { NEAR_DUPE_THRESHOLD, MERGE_CANDIDATE_THRESHOLD, MIN_TOKENS_FOR_FUZZY, COLD_REVIEW_DAYS } from "./maintain.js";
import { L1_MAX_CHARS_DEFAULT, buildCombinedPromptIndex } from "./l1index.js";
import { buildTools } from "./tools.js";
import { wireEvents } from "./events.js";
import { wireTurnReview } from "./turn-review.js";
import { readActivation } from "./activation-history.js";
import { SKILL_NAME, SKILL_DESCRIPTION, SKILL_WHEN_TO_USE, SKILL_CONTENT } from "./skill-content.js";

const inject = ["skills", "tools", "agents", "systemPrompt"];
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
	reflectionEnabled: Schema.boolean().default(true),
	reflectionMode: Schema.union([Schema.const("auto"), Schema.const("notify")]).default("notify"),
	maintenanceProvider: Schema.string().default("spawn"),
	maintenanceLlmProvider: Schema.string().default(""),
	maintenanceModel: Schema.string().default(""),
	maintenanceReasoningEffort: Schema.string().default(""),
	maintenanceMaxTokens: Schema.natural().min(1).default(4096),
	maintenanceCooldownMinutes: Schema.natural().min(1).default(30),
	maintenanceTimeoutSeconds: Schema.natural().min(10).default(300),
	maintenanceMaxCalls: Schema.natural().min(1).default(32),
	maintenanceMaxWrites: Schema.natural().min(1).default(6),
	maintainEveryTurns: Schema.natural().default(20),
	reflectPendingThreshold: Schema.natural().default(5),
	reflectSopsThreshold: Schema.natural().default(40),
	l1MaxChars: Schema.number().min(1024).default(L1_MAX_CHARS_DEFAULT),
	globalL1MaxChars: Schema.natural().min(512).default(2048),
	reflectCooldownTurns: Schema.natural().default(10),
	nearDupeThreshold: Schema.number().min(0).max(1).default(NEAR_DUPE_THRESHOLD),
	mergeCandidateThreshold: Schema.number().min(0).max(1).default(MERGE_CANDIDATE_THRESHOLD),
	minTokensForFuzzy: Schema.number().min(1).default(MIN_TOKENS_FOR_FUZZY),
	heatHalfLifeDays: Schema.number().min(1).default(HEAT_HALF_LIFE_DAYS),
	recencyWindowDays: Schema.number().min(1).default(RECENCY_WINDOW_MS / 86400000),
	coldReviewDays: Schema.number().min(1).default(COLD_REVIEW_DAYS),
});

const READ_TOOLS = new Set(["memory_read", "memory_list", "memory_search", "memory_stats", "memory_pending", "memory_expand", "memory_history"]);
const COMMON_TOOLS = new Set(["memory_read", "memory_list", "memory_search", "memory_stats", "memory_write", "memory_update", "memory_review"]);
const skillGesture = message => message?.source?.kind === "user" && message.content.some(block => block.type === "text" && /(^|\s)\/memory(?=\s|$)/.test(block.text));

function apply(ctx, config = {}) {
	const cfg = Config(Object.fromEntries(Object.entries(config).filter(([, value]) => value !== "")));
	if (!cfg.memoryDir) cfg.memoryDir = defaultMemDir();
	const version = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")).version;
	const runtimeInfo = { version, loadedAt: new Date().toISOString(), source: fileURLToPath(import.meta.url), memoryDir: cfg.memoryDir, mode: cfg.reflectionMode, turnReviewEnabled: cfg.turnReviewEnabled };
	cfg.runtimeInfo = runtimeInfo;
	if (Boolean(cfg.maintenanceLlmProvider) !== Boolean(cfg.maintenanceModel)) throw new Error("maintenanceLlmProvider and maintenanceModel must be set together");
	cfg.heat = { halfLifeDays: cfg.heatHalfLifeDays, recencyWindowMs: cfg.recencyWindowDays * 86400000 };
	cfg.maintainOpts = { nearDupeThreshold: cfg.nearDupeThreshold, mergeCandidateThreshold: cfg.mergeCandidateThreshold, minTokensForFuzzy: cfg.minTokensForFuzzy, heat: cfg.heat, coldReviewDays: cfg.coldReviewDays };
	const workspaceRoots = new Map();
	cfg.workspaceRootFor = cwd => workspaceRoots.get(cwd) || cwd;
	async function prepareWorkspace(agent) {
		const cwd = agent.session.header.cwd;
		if (!cfg.autoNamespace || cfg.defaultNamespace || !cwd || workspaceRoots.has(cwd)) return;
		const workspace = await ctx.get("workspaces")?.resolveByPath(cwd);
		workspaceRoots.set(cwd, workspace?.path || cwd);
	}
	const disposers = [];
	const states = new Map();
	const ensured = new Set();
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
	resolveRoot();
	const systemPrompt = ctx.get("systemPrompt");
	disposers.push(systemPrompt.variable("layered_memory_index", context => {
		const cwd = context.agent?.session.header.cwd;
		resolveRoot(cwd);
		const namespace = resolveNamespace(cfg, undefined, cwd);
		const { text } = buildCombinedPromptIndex(cfg.memoryDir, namespace, { projectMaxChars: cfg.l1MaxChars, globalMaxChars: cfg.globalL1MaxChars });
		return text ? `<memory_index source="user-writable">\n${text.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")}\n</memory_index>` : "";
	}));
	disposers.push(systemPrompt.context({ name: "memory:index", order: 10, text: "{{layered_memory_index}}" }));
	disposers.push(ctx.skills.register({ name: SKILL_NAME, description: SKILL_DESCRIPTION, whenToUse: SKILL_WHEN_TO_USE, source: "runtime", content: SKILL_CONTENT }));
	let maintenance;
	// 只有真正的委派子会话（header.origin === "subagent"）才受 subagentMemoryAccess 约束。
	// 会话分叉（session.fork）是普通会话的副本：它带 parentSession 表示血缘，但仍是独立运行的根 Agent。
	const isSubagentSession = agent => agent?.session.header.origin === "subagent";
	const allowedAccess = agent => cfg.memoryAccess === "read" || (isSubagentSession(agent) && cfg.subagentMemoryAccess === "read") ? "read" : "write";
	const allTools = buildTools(ctx, cfg).map(def => READ_TOOLS.has(def.name) ? def : {
		...def,
		execute(args, exec) {
			if (allowedAccess(exec.agent) !== "write" || states.get(exec.agent)?.access === "read") throw new Error(`${def.name}: this agent has read-only memory access`);
			return def.execute(args, exec);
		},
	});
	function detach(agent) {
		const state = states.get(agent);
		if (!state) return;
		for (const dispose of [...state.disposers.values()].reverse()) dispose();
		states.delete(agent);
	}
	function activate(agent, mode = "common", access = states.get(agent)?.access || allowedAccess(agent)) {
		if (maintenance?.owns(agent)) throw new Error("maintenance agents use memory_maintenance_activate");
		if (access === "write" && allowedAccess(agent) !== "write") throw new Error("memory_activate: this agent has read-only memory access");
		let state = states.get(agent);
		if (!state) { state = { disposers: new Map(), access }; states.set(agent, state); }
		// An explicit read activation also removes previously granted mutation tools.
		if (access === "read") {
			for (const [name, dispose] of state.disposers) if (!READ_TOOLS.has(name)) { dispose(); state.disposers.delete(name); }
		}
		state.access = access;
		const selected = allTools.filter(def => (mode === "manage" || COMMON_TOOLS.has(def.name)) && (access === "write" || READ_TOOLS.has(def.name)));
		const already = selected.every(def => state.disposers.has(def.name));
		for (const def of selected) if (!state.disposers.has(def.name)) state.disposers.set(def.name, agent.ctx.tools.register(def));
		return { activated: true, already, tools: [...state.disposers.keys()], access, mode };
	}
	disposers.push(wireEvents(ctx, cfg, {
		resolveRoot,
		canWrite: agent => allowedAccess(agent) === "write" && states.get(agent)?.access !== "read",
		onMaintenanceRunner(runner) { maintenance = runner; },
		maintenanceTools(namespace) { return buildTools(ctx, { ...cfg, defaultNamespace: namespace, autoNamespace: false }); },
		onSkillResult(exec, result) {
			if (!result.isError && exec.name === "skill" && exec.arguments.name === "memory" && exec.agent && !maintenance.owns(exec.agent)) activate(exec.agent);
		},
	}));
	disposers.push(wireTurnReview(ctx, cfg, {
		canWrite: agent => allowedAccess(agent) === "write" && states.get(agent)?.access !== "read" && !maintenance.owns(agent),
		activate: agent => activate(agent),
	}));
	const restored = new WeakSet();
	disposers.push(ctx.on("system-prompt/assemble", async (_assembly, context, next) => {
		const agent = context.agent;
		const query = ctx.get("sessionQuery");
		if (agent && cfg.progressive && query && !restored.has(agent)) {
			restored.add(agent);
			const prior = await readActivation(query, agent.session.id);
			if (prior && !states.has(agent) && !maintenance.owns(agent)) {
				activate(agent, prior.mode, allowedAccess(agent) === "read" ? "read" : prior.access || "write");
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
		description: "激活当前会话的记忆工具。common 为查阅和写入，manage 增加候选、归档、历史、溯源、迁移与维护工具。access=read 仅查阅；子代理默认只读。",
		parameters: { mode: { type: "string", enum: ["common", "manage"] }, access: { type: "string", enum: ["read", "write"] } },
		output: { schema: { type: "object", additionalProperties: true, properties: { activated: { type: "boolean", required: true }, already: { type: "boolean", required: true }, tools: { type: "array", items: { type: "string" }, required: true } } }, render: (_args, value) => [{ type: "text", text: `${value.access}/${value.mode}: ${value.tools.join(", ")}` }] },
		execute: async (args, exec) => {
			if (!exec.agent) throw new Error("memory_activate requires an agent session");
			await prepareWorkspace(exec.agent);
			return activate(exec.agent, args.mode || "common", args.access || states.get(exec.agent)?.access || allowedAccess(exec.agent));
		},
		presentCall: () => ({ card: "generic", title: "激活记忆工具", kind: "execute" }),
	}));
	if (cfg.reflectionMode === "auto") ctx.tools.register(defineTool({
		name: "memory_maintenance_activate",
		description: "独立维护子任务使用派发的 maintenance_id 激活受限工具。",
		parameters: { maintenance_id: { type: "string", required: true } },
		output: { schema: { type: "object", additionalProperties: true, properties: { activated: { type: "boolean", required: true }, already: { type: "boolean", required: true }, tools: { type: "array", items: { type: "string" }, required: true } } }, render: (_args, value) => [{ type: "text", text: JSON.stringify(value) }] },
		execute: async (args, exec) => maintenance.activate(exec.agent, args.maintenance_id),
	}));
	if (!cfg.progressive) for (const def of allTools) ctx.tools.register(def);
	console.info(`[dsh-layered-memory] v${version} loaded=${runtimeInfo.loadedAt} source=${runtimeInfo.source} memoryDir=${cfg.memoryDir} mode=${cfg.reflectionMode} autoPending=${cfg.autoPending} access=${cfg.memoryAccess}/${cfg.subagentMemoryAccess}`);
	ctx.effect(() => () => {
		for (const agent of states.keys()) detach(agent);
		for (const dispose of disposers.reverse()) dispose();
	}, "layered-memory: teardown");
}
export { apply, inject };
