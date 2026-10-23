import { L0_TEMPLATE } from "./templates.js";

export const SKILL_NAME = "memory";
export const SKILL_DESCRIPTION = "跨会话记忆：按项目与全局检索已验证事实和经验，用稳定条目标识读取、更新、追溯证据和恢复历史。";
export const SKILL_WHEN_TO_USE = "任务涉及既有环境、历史经验或已验证的新知识；需要检索、纠正、迁移或整理长期记忆。";
export const SKILL_CONTENT = `${L0_TEMPLATE}

## 工具

基础检索、读写工具随会话提供；memory_activate({mode:"common"}) 补充状态与冲突登记。
历史、归档、候选、迁移和维护按需调用 memory_activate({mode:"manage"})。
读写权限由用户配置 memoryAccess/subagentMemoryAccess 决定，子代理默认只读。工具调用后复用返回的 entry。

## 常用操作

- memory_search({query})：检索当前项目与global活跃条目。all_namespaces:true 扩大范围，include_archived:true 包含历史归档。
- memory_list({namespace?})：目录及结构化entry。
- memory_read({entry,full?,from_line?,to_line?,max_chars?,if_revision?})：返回正文、证据、revision和complete；用next_line继续。
- memory_write({namespace?,kind:"fact"|"sop",topic,content,evidence,evidence_call_ids?})：只创建新条目，返回entry。
- memory_update({entry,content,evidence?,evidence_call_ids?,related?})：只更新已有条目，自动保留当前版本；保留原显示标题。
- memory_expand({entry})：展开该版本的源事件；有后续页时按返回指针继续。
- memory_review({entry,reason,evidence_call_ids?})：先实际验证冲突，再直接传entry和reason登记复核；插件自动绑定本轮尚未保存的成功证据，返回sources精确引用。已有调用id时可显式选择。

保存新实测时填写evidence说明；已有精确引用时可提供evidence_call_ids。memory_review通常省略该字段，由插件解析当前回合的验证结果。来源的session和seq由插件记录。只调整措辞且没有新证据时沿用原来源。related使用entry数组。

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

主模型在任务中照常查阅和更新笔记。任务结束后，固定核对会话依据本轮证据照看相关笔记的遗漏、矛盾和重复，零变更是正常结果。notify模式将待办保存在可查询状态中；auto模式用固定整理会话分批处理存量待办。修改前完整读取同一revision，归档前确认替代条目，结果与来源交回插件保存。
`;
