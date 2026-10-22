import { L0_TEMPLATE } from "./templates.js";

export const SKILL_NAME = "memory";
export const SKILL_DESCRIPTION = "跨会话记忆：按项目与全局检索已验证事实和经验，用稳定条目标识读取、更新、追溯证据和恢复历史。";
export const SKILL_WHEN_TO_USE = "任务涉及既有环境、历史经验或已验证的新知识；需要检索、纠正、迁移或整理长期记忆。";
export const SKILL_CONTENT = `${L0_TEMPLATE}

## 激活

加载本技能后提供常用工具；尚未出现时调用 memory_activate({mode:"common"})。
历史、归档、候选、迁移和维护按需调用 memory_activate({mode:"manage"})。
只读工作使用 access:"read"；子代理默认只读。工具调用成功后以返回的 entry 为准。

## 常用操作

- memory_search({query})：检索当前项目与global活跃条目。all_namespaces:true 扩大范围，include_archived:true 包含历史归档。
- memory_list({namespace?})：目录及结构化entry。
- memory_read({entry,full?,from_line?,to_line?,max_chars?,if_revision?})：返回正文、证据、revision和complete；用next_line继续。
- memory_write({namespace?,kind:"fact"|"sop",topic,content,evidence,evidence_call_ids?})：只创建新条目，返回entry。
- memory_update({entry,content,evidence?,evidence_call_ids?,related?})：只更新已有条目，自动保留当前版本；保留原显示标题。
- memory_expand({entry})：展开该版本的源事件；有后续页时按返回指针继续。
- memory_review({entry,reason,evidence_call_ids})：已发现明确冲突而暂时无法完成更新时登记复核；提供本会话真实验证调用，维护任务会收到对应证据片段。

新实测证据填写实际验证调用的 evidence_call_ids；来源的session和seq由宿主记录。只调整措辞且没有新证据时沿用原来源。related使用entry数组。

## 管理操作

- memory_history({entry}) 列出历史；memory_rollback({entry,snapshot_id}) 恢复指定版本，恢复前保存当前版本。
- memory_archive({entry,unarchive?,replacement?}) 归档或恢复可见性；读取归档直接使用entry。
- memory_promote({entry,to_namespace?,archive_source?}) 跨空间复制，default是全局空间；源归档与目标均保留历史。
- memory_pending 查看候选；memory_accept 提交精炼后的content和evidence；memory_discard 放弃候选。
- memory_stats 查看空间、版本、磁盘分项与最近维护状态；memory_index 重建目录；memory_maintain 执行程序维护并返回actionable清单。
- memory_namespace 列出空间或执行显式迁移；迁移保留原空间。

完整索引：entry={namespace,kind:"index",key:"index"}。
完整规则：entry={namespace,kind:"rules",key:"rules"}。
管理原则：entry={namespace,kind:"policy",key:"policy"}。

## 维护

相关用户任务完成后，内部fork分支保留任务上下文核对记忆，结果仅交回插件并保存在维护记录中。notify模式将待办保存在可查询状态中；auto模式使用独立子代理按保存的进度分批处理索引压力及明确冲突，受调用/写入/时间预算限制。相似度候选需阅读原文确认，归档前指出替代条目。只读到尾页不算读完全文；修改前读取同一revision完整内容。没有待办时结束，不为达到条目数目标而合并。
`;
