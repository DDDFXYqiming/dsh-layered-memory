简体中文 | [English](README.en.md)

# dsh-layered-memory

**DeepSeek Harness（DSH）跨会话长期记忆插件** —— 命名空间隔离 + L1 索引注入 + L2 环境事实 + L3 任务经验 + BM25 全文检索 + 内容级近重复去重 + 跨命名空间提升 + 重试序列蒸馏 + 溯源/归档/回滚 + 自动维护 + 渐进式工具暴露。

## 能力

`memory:index` 注入 —— `ctx.systemPrompt.context` 把 L1 索引实时注入每轮模型上下文，改动即时生效。

runtime skill `memory` —— 触发语义：何时读、何时写、何时同步索引（内容见 `SKILL.md`）。

工具（progressive 模式下经 `memory_activate` 挂载，14 个）：

| 工具 | 用途 |
|---|---|
| `memory_list` | 列出全部记忆（L2 facts + L3 sops + pending + 索引行数） |
| `memory_read` | 读取指定记忆（index / fact 主题 / sop 文件名），返回溯源 meta 与 related 关联指针 |
| `memory_search` | **BM25 全文检索**（含已归档条目；`all_namespaces` 跨库）——L1 被裁剪的条目也能找回 |
| `memory_write` | 写入记忆（fact/sop，**evidence 必填** = 行动验证公理；可选 `related` 关联链接） |
| `memory_index` | 重建 L1 索引自动段（保留 [RULES] 手动段） |
| `memory_pending` | 查看重试序列蒸馏候选（同工具先失败后成功） |
| `memory_accept` | 接受 pending 候选入正式记忆 |
| `memory_update` | 更新记忆（supersede 保留历史快照；支持 related） |
| `memory_archive` | 归档记忆（L1 隐藏，文件保留在 archive/，可用 `memory_rollback` 恢复或 `memory_search` 检索到） |
| `memory_rollback` | 回滚到 `.history/` 中最近快照 |
| `memory_expand` | 通过 `sessionQuery` 展开 sourceSession/sourceSeqs 原始事件 |
| `memory_stats` | 统计 L2/L3/pending/archived/大小 |
| `memory_maintain` | 内容级去重、压缩索引、统计、合并候选 |
| `memory_promote` | 跨命名空间提升（项目局部经验 → 全局 default） |

## 安装

```powershell
# 从 GitHub 安装（推荐，自带 cordis.patch.yml，贡献 id: dsh-layered-memory）
dsh plugin --profile web add github:DDDFXYqiming/dsh-layered-memory

# 本地开发时也可直接使用仓库目录
dsh plugin --profile web add <本目录>
```

## 配置

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

**`memory_maintain` 何时裁剪 L1**：只在完整索引超过 `maxIndexLines` 时触发；贪心装入、每步按真实行数核算（含空层占位行），按衰减热度排序（14 天半衰 + 7 天内新建条目 recency 加分），被裁剪的记忆**不会丢失**——可直接 `memory_search` 找回。`memory_write` 检测到超限也会立即触发同款压缩，告警只在压缩后仍超限时出现一次。

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
pnpm test         # vitest（pnpm 11 可直接运行，见下）
pnpm test:smoke   # dsh --profile headless --dump-config
```

> 单元测试会 import `@deepseek-ai/dsh-tools` / `@deepseek-ai/schemastery`（DSH 内置包）。本机若有已安装的 DSH 环境，可将 `node_modules/@deepseek-ai` 等以 junction/链接方式指过去；`.npmrc` 已写 `auto-install-peers=false` 防 pnpm 解析私有 peer。
>
> **预检环境坑（实测踩过）**：pnpm 11 的 `run` 前置依赖检查会尝试解析 peer 链中的 DSH 私有包（如 `@deepseek-ai/dsh-type-meta`，不在 npm registry）→ `pnpm test` 报 `ERR_PNPM_FETCH_404`。修复：`pnpm-workspace.yaml` 顶层声明 `verifyDepsBeforeRun: false`（pnpm 11 认可的位置；`.npmrc` 的 kebab 写法对 pnpm 11 无效）。仓库已配好，`pnpm test` 直接可用；若仍被拦截，兜底走 `./node_modules/.bin/vitest run`。

## 相关

- 底层接缝：`ctx.systemPrompt.context` / `ctx.skills.register` / `ctx.tools.register` / `session/event` 事件 + `ctx.sessionQuery`
- 完整更新历史：[CHANGELOG.md](./CHANGELOG.md)
- 授权：MIT
