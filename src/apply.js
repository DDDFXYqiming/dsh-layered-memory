// 插件入口接线：配置、L1 注入、runtime skill、工具注册（渐进暴露）、事件。

import { homedir } from "node:os";
import { join } from "node:path";
import { defineTool } from "@deepseek-ai/dsh-tools";
import { ensureNamespaceLayout, nsRoot, resolveNamespace, defaultMemDir } from "./store.js";
import { readIndex } from "./l1index.js";
import { buildTools } from "./tools.js";
import { wireEvents } from "./events.js";
import { SKILL_NAME, SKILL_DESCRIPTION, SKILL_WHEN_TO_USE, SKILL_CONTENT } from "./skill-content.js";

// [spec-audit 2026-08-14 修订] systemPrompt/agents 必须声明 inject：
// 实测 cordis ctx.get() 只查插件隔离层已登记的服务，未 inject 时 ctx.get 恒返回 undefined。
const inject = ["skills", "tools", "agents", "systemPrompt", "sessionQuery"];

function apply(ctx, config = {}) {
	const cfg = {
		memoryDir: config.memoryDir || defaultMemDir(),
		maxIndexLines: config.maxIndexLines ?? 30,
		progressive: config.progressive !== false,
		defaultNamespace: config.defaultNamespace || "",
		autoNamespace: config.autoNamespace !== false,
		autoPending: config.autoPending !== false,
		maintainEveryTurns: config.maintainEveryTurns ?? 20,
		// [v0.5] 反思注入阈值：pending 数 / SOP 数 / 索引超限任一触发，带冷却
		reflectPendingThreshold: config.reflectPendingThreshold ?? 5,
		reflectSopsThreshold: config.reflectSopsThreshold ?? 40,
	};

	const disposers = [];
	const agentStates = new Map();

	const resolveRoot = () => {
		const ns = resolveNamespace(cfg);
		const root = nsRoot(cfg.memoryDir, ns);
		ensureNamespaceLayout(root);
		return root;
	};

	// 只初始化当前实际命名空间；不要把未使用的 memoryDir 根目录伪装成第二个 namespace。
	ensureNamespaceLayout(nsRoot(cfg.memoryDir, resolveNamespace(cfg)));

	// ── 记忆注入（L1 存在性索引每轮可见）──
	const sysPrompt = ctx.get("systemPrompt");
	if (sysPrompt) {
		disposers.push(sysPrompt.context({
			name: "memory:index",
			order: 10,
			text: () => {
				try {
					const idx = readIndex(resolveRoot());
					return idx.trim() ? idx : "";
				} catch {
					return "";
				}
			}
		}));
	}

	// ── 运行时 skill（内容内联于 src/skill-content.js；插件非 skill，不用 SKILL.md 文件）──
	let activate = () => ({ activated: false, tools: [] });
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
		if (agentStates.has(agent)) return { activated: false, tools: [] };
		const ds = [];
		try {
			for (const def of allTools) ds.push(agent.ctx.tools.register(def));
			try {
				const hide = agent.ctx.tools.restrict({ deny: ["memory_activate"] });
				if (hide) ds.push(hide);
			} catch { /* restrict 不可用时保留激活工具 */ }
			agentStates.set(agent, ds);
			return { activated: true, tools: allTools.map((d) => d.name) };
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

	ctx.logger?.info?.(`[dsh-layered-memory] v0.5 ready; memoryDir=${cfg.memoryDir}; maxIndexLines=${cfg.maxIndexLines}`);

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
						tools: { type: "array", items: { type: "string" }, required: true }
					}
				},
				render: (_args, value) => [{ type: "text", text: `记忆工具已激活: ${value.tools.join(", ")}` }]
			},
			execute: (_args, exec) => {
				if (!exec.agent) throw new Error("memory_activate: 需要 Agent 会话");
				return Promise.resolve(activate(exec.agent));
			},
			presentCall: () => ({ card: "generic", title: "激活记忆工具", kind: "execute" })
		});
	}

	return () => {
		for (const agent of [...agentStates.keys()]) detach(agent);
		disposeAll(disposers);
	};
}

export { apply, inject };
