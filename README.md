简体中文 | [English](README.en.md)

# dsh-layered-memory

DeepSeek Harness 的跨会话记忆插件。环境事实和任务经验保存在 Markdown 文件中，当前项目与全局目录进入上下文，正文按需检索和读取。

## 安装

```bash
dsh plugin --profile web add github:DDDFXYqiming/dsh-layered-memory
```

桌面端使用它随附的 `dsh` 命令，把 profile 改为 `desktop`。本地开发可链接本仓库。运行源码位于 `src/`，`lib/index.js` 只转发导出。

## 使用

让 Agent 加载 `memory` 技能，或调用 `memory_activate({mode:"common"})`。日常读写只加载常用工具；历史、归档、候选与维护使用 `mode:"manage"`。只读任务可以请求 `access:"read"`，子代理默认只读。

0.8.0 统一使用 `entry = {namespace, kind, key}` 定位条目。直接复用 list、search 或 write 返回的 entry；显示标题与文件名不再混用，同名 fact 和 SOP 可以分别读取。

```js
// 新建已经验证的事实
memory_write({
  namespace: "my-project",
  kind: "fact",
  topic: "预览启动命令",
  content: "项目预览通过 pnpm dev 启动。",
  evidence: "已在当前项目执行，服务启动成功并能打开页面。"
})

// 使用上一步返回的 entry
memory_read({entry, full: true})
memory_update({entry, content: "更新后的实测结论", evidence: "本次验证结果"})
memory_history({entry})
memory_rollback({entry, snapshot_id: "从 history 返回值选择"})
```

`memory_write` 只创建新条目，`memory_update` 只更新已有条目。更新、归档和恢复都保留当前版本。原来使用 `entry_type`、裸 `topic/name` 定位的工具调用应切换到新协议；已有 Markdown 记忆继续读取。

## 工具

| 工作 | 工具 | 行为 |
| --- | --- | --- |
| 查找 | `memory_search`、`memory_list` | 返回可直接复用的 entry；默认检索当前空间与 global 的活跃条目 |
| 阅读 | `memory_read` | 返回范围、总行数、revision、complete 和 next_line；支持归档全文 |
| 写入 | `memory_write`、`memory_update` | 新增与更新分开；新证据可指定 evidence_call_ids，宿主补充实际来源 |
| 来源 | `memory_expand` | 展开普通调用或 PTC 子调用的真实事件 |
| 历史 | `memory_history`、`memory_rollback` | 按 snapshot_id 恢复；恢复前保存当前版本 |
| 归档 | `memory_archive` | 隐藏活跃入口并保留全文；unarchive 恢复可见性 |
| 跨空间 | `memory_promote`、`memory_namespace` | 提升为全局经验，列空间或显式迁移；迁移保留来源 |
| 候选 | `memory_pending`、`memory_accept`、`memory_discard` | 阅读、提交精炼正文与证据，或明确放弃候选 |
| 状态 | `memory_stats`、`memory_index`、`memory_maintain` | 查看实际空间、存储分项和维护状态；重建目录与程序维护 |

搜索归档时传 `include_archived:true`，读取直接使用返回的 entry。全文规则、目录和管理原则通过 `memory_read` 的 `kind:"rules"|"index"|"policy"` 读取。

## 项目与全局记忆

固定空间由 `defaultNamespace` 指定。自动空间使用工作区的稳定身份或规范化根路径，不再依赖目录名和分支；同名不同路径的项目保持隔离。同一个项目默认跨分支共享记忆。

`default` 是全局空间。项目的 L1 和默认搜索同时提供全局入口。`memory_promote` 可将可复用经验提升到全局空间。

旧版自动空间不会被猜测归属于某个新项目；使用 `memory_namespace` 显式迁移，并保留来源目录。

## 配置

在当前 profile 的 `cordis.patch.yml` 中覆盖已有 bundle id。

```yaml
- id: dsh-layered-memory
  config:
    memoryDir: ''
    defaultNamespace: ''
    autoNamespace: true
    progressive: true
    l1MaxChars: 12288
    globalL1MaxChars: 2048
    memoryAccess: write
    subagentMemoryAccess: read
    autoPending: false
    maintainEveryTurns: 20
    reflectionEnabled: true
    reflectionMode: notify
```

L1 按字符预算生成项目与全局视图；磁盘索引保留完整目录。手写规则也受注入预算限制，完整内容始终可以用工具读取。实际内容经宿主变量传递，`{{模板括号}}` 保持原文。

维护阈值、模型选择和执行预算见 [自动维护](docs/automatic-maintenance.zh.md)。

## 文件与更新

默认根目录是 `~/.dsh/memory/`。每个空间包含 `facts.md`、`sops/`、`index.txt`、`memory-meta.json`、`.history/` 以及维护状态。`default` 直接使用根目录，其他空间使用子目录。文件可直接备份，历史按条目身份保存。

拉取源码后，需要确认宿主真正重载了模块。配置热更新不等于源码热更新。开发环境可为 `hmr` 的 `root` 明确指定本仓库的真实路径；启动日志会记录已加载版本和路径。操作步骤见 [开发与端到端验收](docs/development.md)。

- [设计与数据流程](docs/design.md)
- [自动维护与模型预算](docs/automatic-maintenance.zh.md)
- [开发与端到端验收](docs/development.md)
- [更新记录](CHANGELOG.md)

MIT License
