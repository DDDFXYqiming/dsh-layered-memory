简体中文 | [English](README.en.md)

# dsh-layered-memory

**DeepSeek Harness（DSH）跨会话长期记忆插件** —— 命名空间隔离 + L1 索引注入（存在性编码）+ L2 环境事实 + L3 任务经验 + BM25 全文检索 + 内容级近重复去重 + 跨命名空间提升 + 重试序列蒸馏 + 溯源/归档/回滚 + 自动维护 + 渐进式工具暴露。

## 能力

| 组件 | 说明 |
|---|---|
| `memory:index` 注入 | 通过 `ctx.systemPrompt.context` 把 L1 索引注入每轮模型上下文（实时读文件，改动即生效） |
| `memory`（运行时 skill） | 触发语义：何时读、何时写、何时同步索引 |
| `memory_activate` | 渐进式暴露兜底：skill 加载后工具未自动出现时调用一次 |
| `memory_list` | 列出全部记忆（L2 facts + L3 sops + pending + 索引行数） |
| `memory_read` | 读取指定记忆（index / fact 主题 / sop 文件名），返回溯源 meta 与 related 关联指针 |
| `memory_search` | **BM25 全文检索**（含已归档条目；`all_namespaces` 跨库）——L1 被裁剪的条目也能找回 |
| `memory_write` | 写入记忆（fact/sop，**evidence 必填** = 行动验证公理；可选 `related` 关联链接） |
| `memory_index` | 重建 L1 索引自动段（保留 [RULES] 手动段） |
| `memory_pending` | 查看重试序列蒸馏候选（同工具先失败后成功） |
| `memory_accept` | 接受 pending 候选入正式记忆 |
| `memory_update` | 更新记忆（supersede 保留历史快照；支持 related） |
| `memory_archive` | 归档记忆（从 L1 索引与 `memory_read` 隐藏，文件保留在 archive/，可用 `memory_rollback` 恢复或 `memory_search` 检索到） |
| `memory_rollback` | 回滚到 `.history/` 中最近快照 |
| `memory_expand` | 通过 `sessionQuery` 展开 sourceSession/sourceSeqs 原始事件 |
| `memory_stats` | 统计 L2/L3/pending/archived/大小 |
| `memory_maintain` | 内容级去重、压缩索引、统计、合并候选 |
| `memory_promote` | 跨命名空间提升（项目局部经验 → 全局 default） |

## 设计

| 机制 | 说明 |
|---|---|
| L1 索引注入 | `ctx.systemPrompt.context` 每轮实时注入 L1（读文件，改动即时生效，无需重载） |
| 写入工具 | `memory_write`（模型/用户主动，evidence 强制） |
| 渐进式暴露 | 全局只挂 `memory_activate`，skill 加载成功后按 Agent 挂载 14 个记忆工具；`progressive: false` 回退全局注册 |
| 自动蒸馏 | [v0.5] 只捕获「同工具先失败后成功」的重试序列（含错误/结果尾部摘要）写入 `pending/`；普通成功调用不再产生垃圾候选 |
| 反思注入 | [v0.5] 废除固定周期提醒；pending≥5 / SOP≥40 / 索引超限时注入带具体内容的整理请求（10 轮冷却） |
| 内容相似度 | [v0.5] ASCII 词 + 单数字 + CJK bigram 分词集合 Jaccard：去重（≥0.85 近重复归档）与合并候选（≥0.45 报告）；过短内容（<12 词元）只走精确 hash，防误判 |
| 溯源/审计 | `memory-meta.json` 记录 `sourceSession` / `sourceSeqs` / `createdAt` / `updatedAt` / `evidence` / `related` |
| 冲突/过期 | `memory_update`(supersede) / `memory_archive` / `memory_rollback`，旧版本保留在 `.history/` / `archive/` |
| 命名空间 | `<memoryDir>/<namespace>/...`，`default` 兼容旧根目录；默认取 workspace/git 分支 |
| 自动维护 | `maintainEveryTurns`（默认 20）触发去重/压缩/统计/合并候选；[v0.5] 计数持久化到 `turn-state.json`，跨会话累计（headless 一次性会话也能触发） |
| 写入即压缩 | [v0.5] 写入检测到 L1 超限时立即按热度压缩（告警只在压缩后仍超限时出现一次） |
| L1 索引 | `index.txt`（≤30 个逻辑行；每条 L2/L3 指针单独一行；`<!-- AUTO -->` 自动段 + `[RULES]` 手动段） |
| L2 事实库 | `facts.md`（`## SECTION` upsert） |
| L3 经验库 | `sops/*.md`（slug 文件名；保留名 README/LICENSE/index 不计入条目） |
| 热度统计 | [v0.5] `file_access_stats.json` 记录 `{count, lastAt}`，热度按 **14 天半衰**衰减；只有真实读取计数（写入不再计入）+ 7 天内新条目 recency 加分 |
| L0 元规则 | `memory_management_sop.md`（行动验证/禁易变/最小指针/不删改） |

## 安装

```powershell
# 从 GitHub 安装（推荐，自带 cordis.patch.yml，贡献 id: dsh-layered-memory）
dsh plugin --profile web add github:DDDFXYqiming/dsh-layered-memory

# 本地开发时也可直接使用仓库目录
dsh plugin --profile web add <本目录>
```

### 配置（可选，覆盖默认）

```yaml
# profile cordis.patch.yml —— 裸条目覆盖 bundle 行（勿重复 insert！）
- id: dsh-layered-memory
  config:
    memoryDir: ''              # 默认 <home>/.dsh/memory
    maxIndexLines: 30
    progressive: true
    defaultNamespace: ''       # 固定默认命名空间；留空则 autoNamespace 生效
    autoNamespace: true        # 默认取 workspace 目录名 + git 分支名
    autoPending: true          # turn/end 捕获「先失败后成功」重试序列为 pending 候选
    maintainEveryTurns: 20     # 每 N 轮自动维护（计数持久化，跨会话累计）
    reflectPendingThreshold: 5 # pending 达到该值时注入整理请求
    reflectSopsThreshold: 40   # L3 SOP 达到该值时注入整合请求
```

`memory_maintain` 只有在完整 L1 索引超过 `maxIndexLines` 时才会裁剪：按衰减热度排序（访问计数 14 天半衰；**7 天内创建且无访问热度的新条目获得 recency 加分**），贪心装入直到预算用尽，**每步按真实行数核算**（含空层占位行）；未进入 L1 的记忆不会被删除，并会保留"还有 N 条"的提示——现在可以直接 `memory_search` 找回它们。维护过程会清理自动段周围的多余空行。`memory_write` 检测到超限时也会立即触发同款压缩，无需等维护。

## 存储布局

```
<home>/.dsh/memory/
├── <namespace>/                非 default 命名空间（推荐显式配置）
│   ├── memory_management_sop.md
│   ├── index.txt
│   ├── facts.md
│   ├── sops/*.md
│   ├── pending/*.md
│   ├── archive/ / .history/
│   ├── memory-meta.json
│   ├── memory_stats.json
│   ├── maintenance-report.json
│   ├── turn-state.json
│   └── file_access_stats.json
└── （namespace=default 时，以上内容兼容地放在此根目录）
```

## 核心公理

1. **行动验证**：No Execution, No Memory —— `memory_write` 的 evidence 必填，只写成功验证过的信息
2. **神圣不可删改**：已验证事实可压缩/迁移/supersede/archive，但严禁物理丢弃
3. **禁易变状态**：时间戳/PID/临时路径不存
4. **最小充分指针**：L1 只写存在性，细节在 L2/L3 按需取

## 开发与测试

```bash
pnpm install
pnpm build        # node --check lib/index.js
pnpm test         # vitest
pnpm test:smoke   # dsh --profile headless --dump-config
```

> 注意：单元测试会 import `@deepseek-ai/dsh-tools` / `@deepseek-ai/schemastery`（DSH 内置包，非公开 npm）。本机如有已安装的 DSH 环境（如 `~/.dsh/profiles/<profile>/node_modules`），可将 `node_modules/@deepseek-ai` 等以 junction/链接方式指过去（`auto-install-peers=false` 已写入 `.npmrc` 防止 pnpm 尝试解析私有 peer 而失败）。

## 相关

- 底层接缝：`ctx.systemPrompt.context` / `ctx.skills.register` / `ctx.tools.register` / `session/event` 事件 + `ctx.sessionQuery`
- 授权：MIT
