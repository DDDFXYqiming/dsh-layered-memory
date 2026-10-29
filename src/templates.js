export const AUTO_BEGIN = "<!-- AUTO-BEGIN -->";
export const AUTO_END = "<!-- AUTO-END -->";

export const WRITE_POLICY = "把记忆当作留给后续任务的工作笔记：需要时查阅，发现旧结论过时就修正，有值得接续的新信息再补充。已有条目用 memory_update，新的条目用 memory_write；完成任务不要求新增记忆。";
export const LEGACY_WRITE_POLICY = "任务完成且【行动验证成功】时主动 memory_write 沉淀（无需等用户提醒；无验证信息则不写）";

export const L0_TEMPLATE = `# 记忆管理

记忆分为环境事实 fact 和任务经验 sop。只保存经过行动验证、未来可复用的信息，证据随版本保存。

- 已知条目用返回的 entry 读取；关键词检索用 memory_search；浏览目录用 memory_list。
- entry = {namespace, kind, key}，直接复用工具返回值。显示标题可以含标点，不要自行把标题转换成文件名。
- ${WRITE_POLICY}
- 更新、归档和恢复前保留历史；通过 memory_history 选择 snapshot_id，再用 memory_rollback 恢复。
- 工具标明 complete 才表示该次返回含全文。长文按 next_line 继续，或 full:true 读取。
- 搜索默认查当前项目与 global 的活跃条目；历史经验用 include_archived:true 检索，再按返回的 entry 读取。
- L1 只提供目录和规则摘录：条目按使用热度排序，并附当前请求的召回段；热度只影响推荐顺序，不改变条目是否存在。完整目录、规则和正文通过工具按需取回；相似度只提供复核线索。
- 凭据值、临时状态、未经验证的猜测和普通日志不属于长期记忆；凭据只保存配置位置或引用。
- 候选经整理并附证据后接受；无价值候选显式丢弃；零修改是正常维护结果。
`;

export const INDEX_TEMPLATE = `# Memory Index
环境事实在 facts.md，任务经验在 sops/；正文按需读取。
${WRITE_POLICY}
基础记忆读写工具可直接使用；管理操作调用 memory_activate({mode:"manage"})。
${AUTO_BEGIN}
[L2] （暂无事实）
[L3] （暂无经验）
${AUTO_END}
[RULES]
`;

export const FACTS_TEMPLATE = `# Facts
按 ## SECTION 保存已验证的环境事实。
`;

export function migrateIndexPolicy(text) {
	const auto = text.indexOf(AUTO_BEGIN);
	const rules = text.indexOf("[RULES]");
	const end = auto >= 0 ? auto : rules >= 0 ? rules : text.length;
	return text.slice(0, end).replace(LEGACY_WRITE_POLICY, WRITE_POLICY) + text.slice(end);
}
