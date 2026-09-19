简体中文 | [English](README.en.md)

# dsh-layered-memory

**DeepSeek Harness（DSH）的跨会话长期记忆插件。** 会话结束后上下文会被清空，这个插件把值得留下的信息写成文件放在磁盘上，之后的会话再按需取回。功能覆盖命名空间隔离、L1 索引注入、L2 环境事实、L3 任务经验、BM25 全文检索、内容级近重复去重、跨命名空间提升、重试序列蒸馏、溯源、归档与回滚、自动维护，以及渐进式工具暴露。

## 能力

`memory:index` 注入。`ctx.systemPrompt.context` 把 L1 索引实时注入每轮模型上下文，改动即时生效。

runtime skill `memory`。这份 skill 约定了读记忆、写记忆和同步索引的时机，内容内联在 `src/skill-content.js`（runtime skill，无独立 SKILL.md 文件）。

工具共 14 个，progressive 模式下经 `memory_activate` 挂载，也就是 Agent 按需调用一次 `memory_activate`，这批工具才进入它的工具列表。

| 工具 | 用途 |
|---|---|
| `memory_list` | 列出全部记忆（L2 facts + L3 sops + pending + L1 字符数/预算） |
| `memory_read` | 读取指定记忆（index / fact 主题 / sop 文件名），返回溯源 meta 与 related 关联指针 |
| `memory_search` | **BM25 全文检索**（含已归档条目；`all_namespaces` 跨库） |
| `memory_write` | 写入记忆（fact/sop，**evidence 必填** = 行动验证公理；撞名自动快照旧版本；拒密钥明文、拒 fact 正文 `## ` 行；返回 L0 判据） |
| `memory_index` | 重建 L1 索引自动段（保留 [RULES] 手动段） |
| `memory_pending` | 查看重试序列蒸馏候选（同工具先失败后成功） |
| `memory_accept` | 接受 pending 候选入正式记忆 |
| `memory_update` | 更新记忆（supersede 保留历史快照；支持 related） |
| `memory_archive` | 归档记忆（meta 标志位：从 L1 与 `memory_read` 隐藏，**文件原地不搬**，`memory_search` 仍可命中，`memory_rollback` 可恢复） |
| `memory_rollback` | 回滚到 `.history/` 中最近快照 |
| `memory_expand` | 通过 `sessionQuery` 展开 sourceSession/sourceSeqs 原始事件 |
| `memory_stats` | 统计 L2/L3/pending/archived/大小 |
| `memory_maintain` | 内容级去重、L1 索引核对（全量不裁剪）、统计、合并候选、冷条目复核（>90 天零访问） |
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
    l1MaxChars: 12288         # L1 唯一预算（字符数，含注入熔断）；超预算只告警，不隐藏条目
    progressive: true
    defaultNamespace: ''       # 固定默认命名空间；留空则 autoNamespace 生效
    autoNamespace: true        # 默认取 workspace 目录名 + git 分支名（家目录归 default）
    autoPending: false         # [v0.6] 默认关闭：候选绝大多数是工具用法噪声，长期无人消费
    maintainEveryTurns: 20     # 每 N 轮自动维护（计数持久化，跨会话累计）
    reflectionEnabled: true    # [0.6.6] 反思提醒总开关；false 只停主动投递，不影响 L1/检索/读写/手动维护
    reflectPendingThreshold: 5 # 仅 autoPending 开启时生效：pending 达到该值时注入整理请求；0 = 关闭该判据
    reflectSopsThreshold: 40   # 活跃 L3 SOP 达到该值时注入整理请求；0 = 关闭该判据
    reflectCooldownTurns: 10   # 两次反思注入的最小轮数间隔（冷却）
    nearDupeThreshold: 0.85    # 近重复去重的词元集合 Jaccard 阈值（0..1）
    mergeCandidateThreshold: 0.45 # 合并候选报告阈值（0..1）
    minTokensForFuzzy: 12      # 低于该词元数的内容只走精确 hash 去重（防误判）
    heatHalfLifeDays: 14       # 访问热度半衰期（天）
    recencyWindowDays: 7       # 新条目无访问时的 recency 保护窗口（天）
    coldReviewDays: 90         # 冷条目复核窗口：创建超过 N 天且热度趋零才入报告
    namespaceCacheTtlMs: 60000 # autoNamespace 的 git 分支探测进程内缓存 TTL（毫秒，0 关闭）
```

**L1 存在性优先（v0.6 起不再裁剪）。** AUTO 段每层一行、以 `" | "` 全量列出活跃条目名；预算单位是字符数（`l1MaxChars`）而不是行数——旧的行数预算会让"行数合规而 token 失控"，而一行一条目会让 30 行只装得下 16 条、把其余条目挤成永久隐身（模型不会去搜它不知道存在的东西）。超预算时只在返回值与维护报告里告警，请合并/归档条目或精简 `[RULES]`。索引内容未变化时不重写文件，避免打碎 system prompt 前缀缓存。访问热度（14 天半衰）现在只服务于 `memory_maintain` 的**冷条目复核**报告。

**[0.6.6] 同一内容版本只提醒一次。** 维护跑完（自动周期维护或手动 `memory_maintain` 都一样）会把「这批内容已经检查过、结论是什么」写进命名空间根目录的 `reflection-state.json`。健康存量拿到 `no_action` 终态后，同一内容不再被反复催——新会话、并行会话、热重载都不会重启喊话；只有内容真的变了（新增或改写条目、索引超预算、出现合并候选）才重新评估。判断依据从「库里有多少条记忆」换成「这份内容检查过没有」，因为一个健康的库完全可以有几十条互不重复的 SOP。指纹只跟内容走，轮次计数与访问热度不计入。

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

1. **行动验证（No Execution, No Memory）。** `memory_write` 的 evidence 必填，只写成功验证过的信息
2. **神圣不可删改。** 已验证事实可压缩/迁移/supersede/archive，但严禁物理丢弃
3. **禁易变状态。** 时间戳/PID/临时路径不存
4. **最小充分指针。** L1 只写存在性，细节在 L2/L3 按需取

## 一致性边界

系统不做自动矛盾检测。一致性靠三层流程保障。写入前先查重，同主题演进走 `memory_update`，supersede 会把旧版快照放进 `.history/`。`memory_maintain` 对高相似条目产出合并候选。条目自带 `updatedAt` 和 evidence，跨条目矛盾在读取时按时间线裁决。

## 开发与测试

```bash
pnpm install
pnpm build        # 对全部 src/*.js 与 lib/index.js 做 node --check（语法门禁，源码即交付物）
pnpm test         # vitest 全量回归
pnpm test:smoke   # dsh --profile headless --dump-config
```

## 相关

- 底层依赖的宿主接缝有 `ctx.systemPrompt.context` / `ctx.skills.register` / `ctx.tools.register` / `session/event` 事件 + `ctx.sessionQuery`
- 完整更新历史见 [CHANGELOG.md](./CHANGELOG.md)
- 采用 MIT 授权
