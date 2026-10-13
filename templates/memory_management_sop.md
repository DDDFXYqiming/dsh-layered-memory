# 记忆管理

记忆分为环境事实 fact 和任务经验 sop。只保存经过行动验证、未来可复用的信息，证据随版本保存。

- 已知条目用返回的 entry 读取；关键词检索用 memory_search；浏览目录用 memory_list。
- entry = {namespace, kind, key}，直接复用工具返回值。显示标题可以含标点，不要自行把标题转换成文件名。
- 仅在获得已验证、未来可复用的新信息或已有记忆确需纠正时写入；先检索已有条目，已有条目用 memory_update，只有新信息才用 memory_write。
- 更新、归档和恢复前保留历史；通过 memory_history 选择 snapshot_id，再用 memory_rollback 恢复。
- 工具标明 complete 才表示该次返回含全文。长文按 next_line 继续，或 full:true 读取。
- 搜索默认查当前项目与 global 的活跃条目；历史经验用 include_archived:true 检索，再按返回的 entry 读取。
- L1 只提供存在性目录和规则摘录。完整目录、规则和正文通过工具按需取回；相似度只提供复核线索。
- 凭据值、临时状态、未经验证的猜测和普通日志不属于长期记忆；凭据只保存配置位置或引用。
- 候选经整理并附证据后接受；无价值候选显式丢弃；零修改是正常维护结果。
