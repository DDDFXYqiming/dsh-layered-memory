import { WRITE_POLICY } from "./templates.js";

// runtime skill「memory」的内容（版本以 package.json 为准）。
// 注：dsh 插件不是 skill，本文件只是 ctx.skills.register 的运行时内容源，
// 不使用 Agent Skills 标准的 SKILL.md 文件。

export const SKILL_NAME = "memory";

export const SKILL_DESCRIPTION = "跨会话长期记忆：读写经验 SOP 与环境事实；全文检索；管理 pending 候选、溯源、归档/回滚、统计与维护。当任务涉及本机环境、工具配置、以前踩过的坑，或任务完成发现值得沉淀的验证经验时使用。";

export const SKILL_WHEN_TO_USE = "新任务开始时需要历史经验/环境事实；获得经过验证、有未来复用价值的信息增量或已有记忆需纠正（写入）；记忆索引需要同步；pending 候选需要确认；需要全文检索或跨命名空间提升记忆";

export const SKILL_CONTENT = `# 记忆管理（DSH 版）

跨会话长期记忆：命名空间隔离 + L1 索引注入（每轮可见）+ L2 环境事实 + L3 任务经验 + 重试序列蒸馏候选 + 溯源/归档/回滚 + 自动维护 + BM25 全文检索。

## 触发时机

### 读取（什么时候查记忆）
- **新任务开始时**：若任务涉及本机环境、工具配置、特定技术栈、以前做过的类似事 → 先 \`memory_list\` 看有什么，再 \`memory_read\` 取相关条目
- **遇到困难/踩坑时**：\`memory_search\` 全文检索（含已归档条目），比按文件名猜准得多
- **模型提示词中的记忆索引（memory:index）**：每轮可见的 L1 存在性索引——看到相关触发词就应主动 \`memory_read\`/\`memory_list\` 取细节

### 写入（什么时候沉淀记忆）
${WRITE_POLICY}

**可以写的**（必须带 evidence 证据）：
- 环境特异性事实：路径、配置、实测参数、工具行为（→ \`entry_type: fact\`）
- 复杂任务经验：多次重试才成功的坑点、隐藏前置条件、稳定步骤（→ \`entry_type: sop\`）
- 通用红线规律（→ 也可通过 memory_write sop 或直接建议维护 [RULES]）

**禁止写的**（写了就是污染）：
- ❌ 没有验证证据的信息（无行动，不记忆）
- ❌ 模型固有知识、推理猜测、未验证假设
- ❌ 易变状态：时间戳、PID、临时路径、一次性 ID
- ❌ 通用常识、日志记录、推理过程细节

### 候选确认（自动蒸馏，默认关闭）
- 需 \`autoPending: true\` 才会把「同工具先失败后成功」的重试序列写入 \`pending/\`。默认关闭的实测理由：候选绝大多数是工具用法噪声（TS 引号错、未知工具名），6 天累积 108 条无人消费。
- 沉淀经验的主路径因此是主动 \`memory_write\`（带证据）；\`memory_pending\`/\`memory_accept\` 仍可用于人工登记的候选。

### 维护与检索
- 可启用 \`reflectionMode: auto\`，由独立 DSH 子任务完成有限范围整理；不要求主会话先整理全库。条目数量只触发检查，不是必须压低的目标；零修改是有效结论。
- \`memory_maintain\`：内容级近重复去重（词元集合 Jaccard 阈值可配，默认 0.85）、L1 索引核对（**全量列出，不裁剪**）、统计、合并候选（默认 0.45）、冷条目复核（默认 >90 天零访问）——阈值均可在 Config 调整
- 也可配置 \`maintainEveryTurns\` 自动触发（计数持久化，跨会话累计）
- \`memory_search\`：BM25 全文检索（含归档）；\`all_namespaces=true\` 跨库检索
- \`memory_promote\`：把项目局部经验提升为全局（default）记忆
- \`memory_stats\` 查看统计
- 热度：访问计数按半衰衰减（heatHalfLifeDays 可配，默认 14 天），现在只服务于「冷条目复核」报告；不再决定谁出现在 L1（被裁出 L1 = 永久隐身，该机制已废除）

## 存储布局

\`\`\`
<home>/.dsh/memory/
├── <namespace>/                非 default 命名空间（当前 profile 通常显式配置）
│   ├── memory_management_sop.md   L0 元规则
│   ├── index.txt                  L1 索引
│   ├── facts.md                   L2 环境事实
│   ├── sops/*.md                  L3 任务经验
│   ├── pending/ / archive/ / .history/
│   ├── memory-meta.json
│   ├── maintenance-report.json
│   ├── turn-state.json
│   └── file_access_stats.json
└── （namespace=default 时兼容旧根目录布局）
\`\`\`

## 工具

| 工具 | 用途 |
|---|---|
| \`memory_list\` | 列出全部记忆（facts + sops + pending + L1 字符数/预算） |
| \`memory_read\` | 读取指定记忆（index / fact 主题 / sop 文件名），含溯源 meta 与关联指针 |
| \`memory_search\` | BM25 全文检索（含归档；可跨库检索） |
| \`memory_activate\` | 渐进式暴露兜底：skill 加载后工具未自动出现时调用一次 |
| \`memory_write\` | 写入记忆（fact/sop，**evidence 必填**；覆盖同名自动快照 .history/；疑似密钥明文与 fact 正文的 "## " 行直接拒绝；返回体附 L0 判据） |
| \`memory_index\` | 重建 L1 索引自动段（顺带补登记缺失的 memory-meta 记录） |
| \`memory_pending\` | 查看重试序列蒸馏候选 |
| \`memory_accept\` | 接受 pending 候选入正式记忆 |
| \`memory_update\` | 更新记忆（supersede 保留历史） |
| \`memory_archive\` | 归档记忆（L1 隐藏、正文保留并在首部写归档横幅，取消归档时自动剥离） |
| \`memory_rollback\` | 回滚到最近历史快照 |
| \`memory_expand\` | 展开 sourceSession/sourceSeqs 原始事件 |
| \`memory_stats\` | 查看统计 |
| \`memory_maintain\` | 去重/索引核对/统计/合并候选/冷条目复核 |
| \`memory_promote\` | 跨命名空间提升记忆 |

## 原则

1. **行动验证**：No Execution, No Memory. 只写成功验证过的信息。
2. **最小充分**：内容尽可能短；只记"遗忘会导致高成本重试"的信息。
3. **不删改验证事实**：可以压缩、迁移、supersede、archive，严禁物理丢弃。
4. **主动写入优先**：沉淀靠 \`memory_write\`（带证据）；自动蒸馏候选默认关闭，开启后也只进候选区，正式记忆必须经确认。
5. **存在性不可丢**：L1 全量列出活跃条目，超预算由人合并/归档解决，系统不替你藏。
`;
