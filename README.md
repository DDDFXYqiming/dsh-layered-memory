简体中文 | [English](README.en.md)

# dsh-layered-memory

给 DeepSeek Harness（DSH）装一层跨会话的长期记忆。

会话一结束，上下文就清空了。这个插件把值得留下的信息写成文件放在磁盘上，之后的会话再按需取回。记忆分三层。L1 是索引，每轮对话都带进模型上下文，只列有哪些条目。L2 放环境事实，路径、配置、实测参数这类。L3 放任务经验，某个流程的前置条件、坑点和稳定步骤。

## 能力

**索引常驻上下文。** L1 索引实时注入每一轮，写完记忆立刻生效，不需要重启宿主。

**工具按需挂载。** 14 个工具在 progressive 模式下先不出现，Agent 调用一次 `memory_activate` 之后才进入它的工具列表。

| 工具 | 用途 |
|---|---|
| `memory_list` | 列出全部记忆（L2 facts + L3 sops + pending + L1 字符数/预算） |
| `memory_read` | 读取指定记忆（index / fact 主题 / sop 文件名），返回溯源 meta 与 related 关联指针 |
| `memory_search` | BM25 全文检索（含已归档条目；`all_namespaces` 跨库） |
| `memory_write` | 写入记忆（fact/sop，evidence 必填；撞名自动快照旧版本；拒密钥明文） |
| `memory_index` | 重建 L1 索引自动段（保留 [RULES] 手动段） |
| `memory_pending` | 查看重试序列蒸馏候选（同工具先失败后成功） |
| `memory_accept` | 接受 pending 候选入正式记忆 |
| `memory_update` | 更新记忆（supersede 保留历史快照） |
| `memory_archive` | 归档记忆（从 L1 与 `memory_read` 隐藏，文件原地不搬，检索仍可命中） |
| `memory_rollback` | 回滚到 `.history/` 中最近快照 |
| `memory_expand` | 展开 sourceSession/sourceSeqs 对应的原始事件 |
| `memory_stats` | 统计 L2/L3/pending/archived 与占用 |
| `memory_maintain` | 去重、索引核对、统计、合并候选、冷条目复核 |
| `memory_promote` | 跨命名空间提升（项目局部经验升为全局） |

## 安装

```powershell
# 从 GitHub 安装，自带 cordis.patch.yml，贡献 id: dsh-layered-memory
dsh plugin --profile web add github:DDDFXYqiming/dsh-layered-memory

# 本地开发时也可以直接指向仓库目录
dsh plugin --profile web add <本目录>
```

## 配置

```yaml
# profile cordis.patch.yml 里的裸条目，覆盖 bundle 行，不要重复 insert
- id: dsh-layered-memory
  config:
    memoryDir: ''              # 默认 <home>/.dsh/memory
    l1MaxChars: 12288         # L1 索引的字符预算，超预算只告警，不隐藏条目
    progressive: true
    defaultNamespace: ''       # 固定默认命名空间，留空则由 autoNamespace 决定
    autoNamespace: true        # 默认取 workspace 目录名加 git 分支名，家目录归 default
    autoPending: false         # 默认关闭：候选绝大多数是工具用法噪声，长期无人消费
    maintainEveryTurns: 20     # 每 N 轮自动维护一次，计数跨会话累计
    reflectionEnabled: true    # 反思提醒总开关，false 只停主动投递
    reflectPendingThreshold: 5 # 仅 autoPending 开启时生效，0 表示关闭该判据
    reflectSopsThreshold: 40   # 活跃 L3 SOP 达到该值时报整理提醒，0 表示关闭该判据
    reflectCooldownTurns: 10   # 两次反思注入之间的最小轮数
    nearDupeThreshold: 0.85    # 近重复去重的词元集合 Jaccard 阈值
    mergeCandidateThreshold: 0.45 # 合并候选报告阈值
    minTokensForFuzzy: 12      # 低于该词元数的内容只走精确 hash 去重
    heatHalfLifeDays: 14       # 访问热度半衰期（天）
    recencyWindowDays: 7       # 新条目无访问时的 recency 保护窗口（天）
    coldReviewDays: 90         # 冷条目复核窗口，默认 90 天
    namespaceCacheTtlMs: 60000 # autoNamespace 的 git 分支探测缓存 TTL（毫秒）
```

## 存储布局

```
<home>/.dsh/memory/
├── <namespace>/                非 default 命名空间
│   ├── memory_management_sop.md
│   ├── index.txt
│   ├── facts.md
│   ├── sops/*.md
│   ├── pending/*.md
│   ├── archive/ / .history/
│   ├── memory-meta.json
│   ├── maintenance-report.json
│   ├── turn-state.json
│   ├── file_access_stats.json
│   └── reflection-state.json
└── namespace 为 default 时，以上内容兼容地放在此根目录
```

## 相关

- [设计与调度原理](docs/design.md)
- [开发与测试](docs/development.md)
- [完整更新历史](CHANGELOG.md)
- 采用 MIT 授权
