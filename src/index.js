// 公共入口：插件名、依赖声明、Config schema、apply。
import Schema from "@deepseek-ai/schemastery";
import { apply, inject } from "./apply.js";

const name = "layered-memory";

/** Schemastery 配置 schema（官方 config 约定：加载期校验 + 默认值填充）。 */
export const Config = Schema.object({
	memoryDir: Schema.string().default(""),
	maxIndexLines: Schema.number().default(30),
	// [spec-audit 2026-08-14] 纯 boolean：非法配置在加载期响亮失败（config.md §Fail loudly）
	progressive: Schema.boolean().default(true),
	// v0.3 命名空间
	defaultNamespace: Schema.string().default(""),
	autoNamespace: Schema.boolean().default(true),
	// v0.3 自动蒸馏（v0.5 起只捕获「先失败后成功」的重试序列）
	autoPending: Schema.boolean().default(true),
	// v0.4 自动维护（v0.5 起计数持久化，跨会话累计触发）
	maintainEveryTurns: Schema.number().default(20),
	// v0.5 反思注入阈值：pending 候选数达到该值时提示宿主整理
	reflectPendingThreshold: Schema.number().default(5),
	// v0.5 反思注入阈值：L3 SOP 条数达到该值时提示宿主整合
	reflectSopsThreshold: Schema.number().default(40),
});

export { apply, inject, name };
