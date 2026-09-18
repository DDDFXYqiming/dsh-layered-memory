// 插件入口接线：配置、L1 注入、runtime skill、工具注册（渐进暴露）、事件。

import { homedir } from "node:os";
import { join } from "node:path";
import { defineTool } from "@deepseek-ai/dsh-tools";
import Schema from "@deepseek-ai/schemastery";
import { ensureNamespaceLayout, nsRoot, resolveNamespace, defaultMemDir, HEAT_HALF_LIFE_DAYS, RECENCY_WINDOW_MS, NAMESPACE_CACHE_TTL_MS_DEFAULT } from "./store.js";
import { NEAR_DUPE_THRESHOLD, MERGE_CANDIDATE_THRESHOLD, MIN_TOKENS_FOR_FUZZY, COLD_REVIEW_DAYS } from "./maintain.js";
import { readIndex } from "./l1index.js";
import { buildTools } from "./tools.js";
import { wireEvents } from "./events.js";
import { SKILL_NAME, SKILL_DESCRIPTION, SKILL_WHEN_TO_USE, SKILL_CONTENT } from "./skill-content.js";

// [spec-audit 2026-08-14 修订] systemPrompt/agents 必须声明 inject：
// 实测 cordis ctx.get() 只查插件隔离层已登记的服务，未 inject 时 ctx.get 恒返回 undefined。
const inject = ["skills", "tools", "agents", "systemPrompt", "sessionQuery"];

/** Schemastery 配置 schema（官方 config 约定：加载期校验 + 默认值填充）。可调常量的默认值取自各自归属模块的导出常量，保持单一来源。 */
export const Config = Schema.object({
	memoryDir: Schema.string().default(""),
	// [spec-audit 2026-08-14] 纯 boolean：非法配置在加载期响亮失败（config.md §Fail loudly）
	progressive: Schema.boolean().default(true),
	// v0.3 命名空间
	defaultNamespace: Schema.string().default(""),
	autoNamespace: Schema.boolean().default(true),
	// v0.3 自动蒸馏（v0.5 起只捕获「先失败后成功」的重试序列）
	// [v0.6] 默认关闭：实测 6 天累积 108 条候选、消费≈0，且内容多为工具用法噪声（TS 引号错、
	// 未知工具名等），对未来任务零复用价值。需要时显式开启，或直接用 memory_write 主动沉淀。
	autoPending: Schema.boolean().default(false),
	// v0.4 自动维护（v0.5 起计数持久化，跨会话累计触发）
	maintainEveryTurns: Schema.number().default(20),
	// v0.5 反思注入阈值：pending 候选数达到该值时提示宿主整理
	reflectPendingThreshold: Schema.number().default(5),
	// v0.5 反思注入阈值：L3 SOP 条数达到该值时提示宿主整合
	reflectSopsThreshold: Schema.number().default(40),
	// [spec-fix 2026-09] 原散落的启发式/容量阈值提为配置
	// [v0.6] L1 唯一预算：字符数（旧 maxIndexLines 行数预算废弃——行数合规而 token 失控，
	// 且一行一条目导致 30 行只能装 16 条、把 88 条事实挤成"永久隐身"）。
	l1MaxChars: Schema.number().min(1024).default(12288),
	reflectCooldownTurns: Schema.number().min(0).default(10),
	nearDupeThreshold: Schema.number().min(0).max(1).default(NEAR_DUPE_THRESHOLD),
	mergeCandidateThreshold: Schema.number().min(0).max(1).default(MERGE_CANDIDATE_THRESHOLD),
	minTokensForFuzzy: Schema.number().min(1).default(MIN_TOKENS_FOR_FUZZY),
	heatHalfLifeDays: Schema.number().min(1).default(HEAT_HALF_LIFE_DAYS),
	recencyWindowDays: Schema.number().min(1).default(RECENCY_WINDOW_MS / (24 * 60 * 60 * 1000)),
	// [0.6.1 M3] autoNamespace 的 git 分支探测进程内缓存 TTL（0 = 关闭缓存）。默认路径在
	// 每轮 prompt 装配与每次工具执行上，无缓存时逐轮同步 spawn git 阻塞事件循环。
	namespaceCacheTtlMs: Schema.natural().default(NAMESPACE_CACHE_TTL_MS_DEFAULT),
	// [0.6.1 N5] 冷条目复核窗口（天）入 Config；limit/候选条数/检索钳位为展示常量保留。
	coldReviewDays: Schema.number().min(1).default(COLD_REVIEW_DAYS),
});

function apply(ctx, config = {}) {
	// 默认值唯一来源 = Config schema；profile 层的空串按未提供处理。
	const provided = {};
	for (const [key, value] of Object.entries(config)) {
		if (value !== "") provided[key] = value;
	}
	const cfg = Config(provided);
	if (!cfg.memoryDir) cfg.memoryDir = defaultMemDir();
	cfg.heat = {
		halfLifeDays: cfg.heatHalfLifeDays,
		recencyWindowMs: cfg.recencyWindowDays * 24 * 60 * 60 * 1000,
	};
	cfg.maintainOpts = {
		nearDupeThreshold: cfg.nearDupeThreshold,
		mergeCandidateThreshold: cfg.mergeCandidateThreshold,
		minTokensForFuzzy: cfg.minTokensForFuzzy,
		heat: cfg.heat,
		coldReviewDays: cfg.coldReviewDays,
	};

	const disposers = [];
	const agentStates = new Map();
	// [0.6.1 M3] 每个 root 只做一次布局 ensure：L1 注入的 text() 热路径与 turn/end
	// 不再每轮重复 5×mkdirSync + 种子 existsSync；各工具 execute 仍显式 ensure，
	// 懒创建新命名空间不受影响。
	const ensuredRoots = new Set();

	const resolveRoot = () => {
		const ns = resolveNamespace(cfg);
		const root = nsRoot(cfg.memoryDir, ns);
		if (!ensuredRoots.has(root)) {
			try {
				ensureNamespaceLayout(root);
				ensuredRoots.add(root);
			} catch { /* ensure 失败（只读目录等）不缓存，下次求值重试；注入面另有 text() 兜底 */ }
		}
		return root;
	};

	// 只初始化当前实际命名空间；不要把未使用的 memoryDir 根目录伪装成第二个 namespace。
	// 加载期 ensure 失败仍响亮抛出（配置错误 fail loud）。
	const initialRoot = nsRoot(cfg.memoryDir, resolveNamespace(cfg));
	ensureNamespaceLayout(initialRoot);
	ensuredRoots.add(initialRoot);

	// ── 记忆注入（L1 存在性索引每轮可见）──
	// [v0.5.3] 注入面防护：index.txt 由 memory_write 的 topic/content 拼接而成，
	// 属用户可写数据。注入 system prompt 前做长度熔断 + 控制字符剥离，
	// 并用 sentinel 标记为不可信段，防止 topic 里的指令字串污染系统上下文。
	const L1_MAX_CHARS = cfg.l1MaxChars;
	function sanitizeIndexForPrompt(idx) {
		let s = String(idx ?? "").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "");
		if (s.length > L1_MAX_CHARS) s = s.slice(0, L1_MAX_CHARS) + "\n[memory:index 已截断]";
		const trimmed = s.trim();
		if (!trimmed) return "";
		return `<memory_index source="user-writable">\n${trimmed}\n</memory_index>`;
	}
	const sysPrompt = ctx.get("systemPrompt");
	if (sysPrompt) {
		disposers.push(sysPrompt.context({
			name: "memory:index",
			order: 10,
			text: () => {
				try {
					return sanitizeIndexForPrompt(readIndex(resolveRoot()));
				} catch {
					return "";
				}
			}
		}));
	}

	// ── 运行时 skill（内容内联于 src/skill-content.js；插件非 skill，不用 SKILL.md 文件）──
	let activate = () => ({ activated: false, already: false, tools: [] });
	const skillDisposer = ctx.skills.register({
		name: SKILL_NAME,
		description: SKILL_DESCRIPTION,
		whenToUse: SKILL_WHEN_TO_USE,
		source: "runtime",
		content: SKILL_CONTENT,
	});
	if (typeof skillDisposer === "function") disposers.push(skillDisposer);

	// ── 工具注册（渐进暴露：progressive 时经 memory_activate 激活）──
	const allTools = buildTools(ctx, cfg);

	const disposeAll = (fns) => {
		for (const fn of [...fns].reverse()) {
			try { fn(); } catch { /* 忽略 */ }
		}
	};
	activate = (agent) => {
		// [0.6.1 I4] 重复激活给出可判定的规范值：此前 {activated:false, tools:[]} 与
		// 「未激活」同形，PTC 消费方无法区分「早已激活」；现用 already 标记幂等命中。
		if (agentStates.has(agent)) return { activated: true, already: true, tools: allTools.map((d) => d.name) };
		const ds = [];
		try {
			for (const def of allTools) ds.push(agent.ctx.tools.register(def));
			try {
				const hide = agent.ctx.tools.restrict({ deny: ["memory_activate"] });
				if (hide) ds.push(hide);
			} catch { /* restrict 不可用时保留激活工具 */ }
			agentStates.set(agent, ds);
			return { activated: true, already: false, tools: allTools.map((d) => d.name) };
		} catch (error) {
			disposeAll(ds);
			throw error;
		}
	};
	const detach = (agent) => {
		const ds = agentStates.get(agent);
		if (ds) {
			disposeAll(ds);
			agentStates.delete(agent);
		}
	};

	disposers.push(wireEvents(ctx, cfg, {
		resolveRoot,
		onSkillResult(exec, result) {
			// 激活 memory skill 的既有逻辑
			if (!result?.isError
				&& exec?.name === "skill"
				&& exec?.agent
				&& exec?.arguments
				&& exec.arguments.name === "memory") {
				activate(exec.agent);
			}
		},
	}));

	const agents = ctx.get("agents");
	const progressive = cfg.progressive && Boolean(agents);
	if (progressive) {
		ctx.tools.register(defineActivateTool());
		disposers.push(ctx.on("agent/disposed", ({ agent }) => detach(agent)));
	} else {
		for (const def of allTools) ctx.tools.register(def);
	}

	ctx.logger?.info?.(`[dsh-layered-memory] v0.6 ready; memoryDir=${cfg.memoryDir}; l1MaxChars=${cfg.l1MaxChars}; autoPending=${cfg.autoPending}`);

	function defineActivateTool() {
		return defineTool({
			name: "memory_activate",
			description: "加载 memory skill 后，为当前 Agent 激活记忆工具（memory_read / memory_list / memory_write / memory_search / memory_index / memory_stats / memory_maintain / memory_pending / memory_accept / memory_update / memory_archive / memory_rollback / memory_expand / memory_promote）。skill 加载成功后通常会自动激活；仅当工具未出现时调用一次。",
			parameters: {},
			output: {
				schema: {
					type: "object",
					additionalProperties: false,
					properties: {
						activated: { type: "boolean", required: true },
						already: { type: "boolean", required: true },
						tools: { type: "array", items: { type: "string" }, required: true }
					}
				},
				render: (_args, value) => [{ type: "text", text: value.already ? `记忆工具早已激活（无需重复调用）: ${value.tools.join(", ")}` : `记忆工具已激活: ${value.tools.join(", ")}` }]
			},
			execute: (_args, exec) => {
				if (!exec.agent) throw new Error("memory_activate: 需要 Agent 会话");
				return Promise.resolve(activate(exec.agent));
			},
			presentCall: () => ({ card: "generic", title: "激活记忆工具", kind: "execute" })
		});
	}

	ctx.effect(() => () => {
		for (const agent of [...agentStates.keys()]) detach(agent);
		disposeAll(disposers);
	}, "layered-memory: teardown");
}

export { apply, inject };
