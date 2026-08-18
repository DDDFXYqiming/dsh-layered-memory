---
name: memory
description: 跨会话长期记忆：读写经验 SOP 与环境事实；管理 pending 候选、溯源、归档/回滚、统计与维护。当任务涉及本机环境、工具配置、以前踩过的坑，或任务完成发现值得沉淀的验证经验时使用。
---

# 记忆管理（DSH 版）

跨会话长期记忆：命名空间隔离 + L1 索引注入（每轮可见）+ L2 环境事实 + L3 任务经验 + 自动蒸馏候选 + 溯源/归档/回滚 + 自动维护。

## 触发时机

### 读取（什么时候查记忆）
- **新任务开始时**：若任务涉及本机环境、工具配置、特定技术栈、以前做过的类似事 → 先 `memory_list` 看有什么，再 `memory_read` 取相关条目
- **遇到困难/踩坑时**：`memory_read` 查是否有相关 SOP（关键词匹配 sops/ 文件名或 facts section）
- **模型提示词中的记忆索引（memory:index）**：每轮可见的 L1 存在性索引——看到相关触发词就应主动 `memory_read`/`memory_list` 取细节

### 写入（什么时候沉淀记忆）
任务完成（或阶段完成）且存在**行动验证成功**的信息时，调用 `memory_write`：

**可以写的**（必须带 evidence 证据）：
- 环境特异性事实：路径、配置、实测参数、工具行为（→ `entry_type: fact`）
- 复杂任务经验：多次重试才成功的坑点、隐藏前置条件、稳定步骤（→ `entry_type: sop`）
- 通用红线规律（→ 也可通过 memory_write sop 或直接建议维护 [RULES]）

**禁止写的**（写了就是污染）：
- ❌ 没有验证证据的信息（无行动，不记忆）
- ❌ 模型固有知识、推理猜测、未验证假设
- ❌ 易变状态：时间戳、PID、临时路径、一次性 ID
- ❌ 通用常识、日志记录、推理过程细节

### 候选确认（自动蒸馏）
- turn/end 会自动把成功工具调用写入 `pending/` 候选区
- 用 `memory_pending` 查看，`memory_accept` 确认入正式记忆；不需要的直接忽略

### 维护
- 可手动运行 `memory_maintain`：去重、压缩 L1 索引、统计、合并候选
- 也可配置 `maintainEveryTurns` 自动触发
- `memory_stats` 查看统计

## 存储布局

```
<home>/.dsh/memory/
├── <namespace>/                非 default 命名空间（当前 profile 通常显式配置）
│   ├── memory_management_sop.md   L0 元规则
│   ├── index.txt                  L1 索引
│   ├── facts.md                   L2 环境事实
│   ├── sops/*.md                  L3 任务经验
│   ├── pending/ / archive/ / .history/
│   ├── memory-meta.json / memory_stats.json
│   ├── maintenance-report.json
│   └── file_access_stats.json
└── （namespace=default 时兼容旧根目录布局）
```

## 工具

| 工具 | 用途 |
|---|---|
| `memory_list` | 列出全部记忆（facts + sops + pending + 索引行数） |
| `memory_read` | 读取指定记忆（index / fact 主题 / sop 文件名），含溯源 meta |
| `memory_activate` | 渐进式暴露兜底：skill 加载后工具未自动出现时调用一次 |
| `memory_write` | 写入记忆（fact/sop，**evidence 必填**） |
| `memory_index` | 重建 L1 索引自动段 |
| `memory_pending` | 查看自动蒸馏候选 |
| `memory_accept` | 接受 pending 候选入正式记忆 |
| `memory_update` | 更新记忆（supersede 保留历史） |
| `memory_archive` | 归档记忆（L1 隐藏，文件保留） |
| `memory_rollback` | 回滚到最近历史快照 |
| `memory_expand` | 展开 sourceSession/sourceSeqs 原始事件 |
| `memory_stats` | 查看统计 |
| `memory_maintain` | 去重/压缩/统计/合并候选 |

## 原则

1. **行动验证**：No Execution, No Memory. 只写成功验证过的信息。
2. **最小充分**：内容尽可能短；只记"遗忘会导致高成本重试"的信息。
3. **不删改验证事实**：可以压缩、迁移、supersede、archive，严禁物理丢弃。
4. **主动写入 + 候选确认**：自动蒸馏只进 pending，正式记忆必须经确认。
