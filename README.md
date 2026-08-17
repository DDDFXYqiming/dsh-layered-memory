# dsh-layered-memory

**DeepSeek Harness（DSH）跨会话长期记忆插件** —— 命名空间隔离 + L1 索引注入（存在性编码）+ L2 环境事实 + L3 任务经验 + 自动蒸馏候选 + 溯源/归档/回滚 + 自动维护 + 渐进式工具暴露。

## 能力

| 组件 | 说明 |
|---|---|
| `memory:index` 注入 | 通过 `ctx.systemPrompt.context` 把 L1 索引注入每轮模型上下文（实时读文件，改动即生效） |
| `memory`（运行时 skill） | 触发语义：何时读、何时写、何时同步索引 |
| `memory_activate` | 渐进式暴露兜底：skill 加载后工具未自动出现时调用一次 |
| `memory_list` | 列出全部记忆（L2 facts + L3 sops + pending + 索引行数） |
| `memory_read` | 读取指定记忆（index / fact 主题 / sop 文件名），返回溯源 meta |
| `memory_write` | 写入记忆（fact/sop，**evidence 必填** = 行动验证公理） |
| `memory_index` | 重建 L1 索引自动段（保留 [RULES] 手动段） |
| `memory_pending` | 查看自动蒸馏候选 |
| `memory_accept` | 接受 pending 候选入正式记忆 |
| `memory_update` | 更新记忆（supersede 保留历史快照） |
| `memory_archive` | 归档记忆（从 L1 索引与 `memory_read` 隐藏，文件保留在 archive/，可用 `memory_rollback` 恢复） |
| `memory_rollback` | 回滚到 `.history/` 中最近快照 |
| `memory_expand` | 通过 `sessionQuery` 展开 sourceSession/sourceSeqs 原始事件 |
| `memory_stats` | 统计 L2/L3/pending/archived/大小 |
| `memory_maintain` | 去重、压缩索引、统计、合并候选 |

## 设计

| 机制 | 说明 |
|---|---|
| L1 索引注入 | `ctx.systemPrompt.context` 每轮实时注入 L1（读文件，改动即时生效，无需重载） |
| 写入工具 | `memory_write`（模型/用户主动，evidence 强制） |
| 渐进式暴露 | 全局只挂 `memory_activate`，skill 加载成功后按 Agent 挂载 12 个记忆工具；`progressive: false` 回退全局注册 |
| 自动蒸馏 | turn/end 把成功工具调用写入 `pending/` 候选区，`memory_accept` 确认后入正式记忆 |
| 溯源/审计 | `memory-meta.json` 记录 `sourceSession` / `sourceSeqs` / `createdAt` / `updatedAt` / `evidence` |
| 冲突/过期 | `memory_update`(supersede) / `memory_archive` / `memory_rollback`，旧版本保留在 `.history/` / `archive/` |
| 命名空间 | `<memoryDir>/<namespace>/...`，`default` 兼容旧根目录；默认取 workspace/git 分支 |
| 自动维护 | `maintainEveryTurns`（默认 20）触发去重/压缩/统计/合并候选 |
| L1 索引 | `index.txt`（≤30 个逻辑行；每条 L2/L3 指针单独一行；`<!-- AUTO -->` 自动段 + `[RULES]` 手动段） |
| L2 事实库 | `facts.md`（`## SECTION` upsert） |
| L3 经验库 | `sops/*.md`（slug 文件名） |
| 热度统计 | `file_access_stats.json`（轻量） + `memory_stats.json`（聚合统计） |
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
    autoPending: true          # turn/end 自动生成 pending 候选
    maintainEveryTurns: 20     # 每 N 轮自动维护
```

`memory_maintain` 只有在完整 L1 索引超过 `maxIndexLines` 时才会按访问热度裁剪；未进入 L1 的记忆不会被删除，并会保留“还有 N 条，请调用 `memory_list` 查看”的提示。维护过程会清理自动段周围的多余空行。

## 存储布局

```
<home>/.dsh/memory/
├── memory_management_sop.md   L0 元规则
├── index.txt                  L1 索引（≤30 行）
├── facts.md                   L2 环境事实
├── sops/*.md                  L3 任务经验
├── pending/*.md               自动蒸馏候选区
├── archive/                   归档/历史保留
├── .history/                  supersede/rollback 历史快照
├── memory-meta.json           溯源/审计元数据
├── memory_stats.json          聚合统计
├── maintenance-report.json    最近一次维护报告
└── file_access_stats.json     读取热度
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

## 相关

- 底层接缝：`ctx.systemPrompt.context` / `ctx.skills.register` / `ctx.tools.register` / `session/event` 事件 + `ctx.sessionQuery`
- 授权：MIT
