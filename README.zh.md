---
description: "DeepSeek Harness 的跨会话记忆。项目与全局索引常驻上下文，条目带结构标识与证据，旧版本可以恢复。"
kind: "package-bundle"
---

# @dsh-external/dsh-layered-memory

[English](README.md) | 中文

## 概述

分层记忆把事实和操作经验从一次会话带到下一次。事实放在 `facts.md` 的二级标题下，操作流程放在 `sops/*.md`；条目用 `{namespace, kind, key}` 定位，带证据，写入前先存旧版本，历史可查也可回滚。

## 目录

- [安装](#安装)
- [使用](#使用)
- [记忆管理页](#记忆管理页)
- [配置](#配置)
- [进一步探索](#进一步探索)
- [已知限制与暂缓工作](#已知限制与暂缓工作)

## 安装

```bash
dsh plugin --profile web add   github:DDDFXYqiming/dsh-layered-memory   "github:DDDFXYqiming/dsh-layered-memory#path:/lib/status"
```

两条 spec 都要装，因为 bundle 贡献两个组件（记忆插件本体与输入区的状态服务）。pnpm 默认阻止传递依赖里的 git 子包（blockExoticSubdeps），状态包必须作为直接依赖声明，否则新装只会有第一个组件。

桌面端用它随附的 `dsh` 命令，把 profile 换成 `desktop`。本地开发先执行 `npm run build`，再直接链接这个仓库与 `lib/status`，并让 profile 指向它们。

## 使用

基础工具 `memory_search/list/read/write/update` 随会话提供。加载 `memory` skill 或调用 `memory_activate({mode:"common"})` 补充状态与冲突登记工具，管理操作用 `mode:"manage"`。读写权限由用户配置 `memoryAccess` 和 `subagentMemoryAccess` 决定，子 agent 默认只读。

条目用 search、list 或 create 返回的 `entry` 对象定位，不要拿标题重新拼一个身份出来。

```js
memory_write({
  namespace: "my-project",
  kind: "fact",
  topic: "预览命令",
  content: "跑 pnpm dev 就能起预览。",
  evidence: "命令正常启动，页面加载成功。"
})
// 后续调用复用返回的 entry。
memory_read({entry, full: true})
memory_update({entry, content: "修正后的事实", evidence: "新的验证过程"})
memory_activate({mode: "manage"})
memory_history({entry})
memory_rollback({entry, snapshot_id: "填一个返回的快照 id"})
```

| 要做的事 | 工具 |
| --- | --- |
| 查找与阅读 | memory_search、memory_list、memory_read |
| 新建与更新 | memory_write、memory_update |
| 查看证据 | memory_expand |
| 恢复历史 | memory_history、memory_rollback |
| 归档与恢复可见性 | memory_archive |
| 共享与迁移 | memory_promote、memory_namespace |
| 处理候选 | memory_pending、memory_accept、memory_discard |
| 状态与维护 | memory_stats、memory_index、memory_maintain、memory_review |

搜索默认只看当前空间和全局空间的活跃条目。要翻归档内容就传 `include_archived:true`，再用返回的 entry 去读。读取结果会给出行范围、总行数、revision、是否完整以及下一行位置。全局规则和完整索引通过 `rules`、`index`、`policy` 三种 entry 读取。

## 记忆管理页

Web 界面左侧栏有一个“记忆”入口，点进去是独立页面：左边是条目列表，右边是详情。可以搜索、按类型过滤、查看已归档条目，也能直接改正文与证据、归档与恢复、看历史快照并回滚。界面文案跟随宿主语言设置，条目类型按语言显示为“事实/经验”或 Fact/Skill。数据通道与页面规则见[记忆管理页接口契约](docs/memory-browser-contract.md)。

![记忆管理页](docs/images/memory-page.png)

工具行下面那行“索引占用”给出 L1 索引的已用比例和已用/预算字符数，展开后是说明、规则、事实目录、经验目录四段，悬停某一段会说明它的含义与占比。

![索引占用的四段构成](docs/images/memory-usage.png)

主包另有一个可独立启停的“记忆状态”组件，Web 输入区底部那行显示当前会话的核对进度、真实变更条数或上次未完成的原因，点开可以看运行记录与只读历史。

![记忆状态](docs/images/memory-status.png)

## 配置

```yaml
- id: dsh-layered-memory
  config:
    defaultNamespace: ''
    autoNamespace: true
    progressive: true
    l1MaxChars: 12288
    globalL1MaxChars: 2048
    indexTargetRatio: 0.9
    memoryAccess: write
    subagentMemoryAccess: read
    autoPending: false
    turnReviewEnabled: true
    turnReviewMinEvidence: 6
    turnReviewReasoningEffort: ''
    maintenanceMaxTokens: 16384
    maintenanceMaxCalls: 64
    maintenanceMaxWrites: 6
    maintenanceTimeoutSeconds: 300
    maintenanceCooldownMinutes: 30
    reflectionMode: notify
```

自动命名空间来自工作区身份或规范化后的根路径，同一仓库的不同分支共用项目记忆，已有的命名空间要显式迁移。`default` 是全局空间，项目索引和默认搜索都把它算进来。字符预算同时管索引条目和手写规则，完整文件仍然可以通过工具读到。

主模型在任务中照常查阅和更新笔记，后台照看本轮相关笔记的遗漏、矛盾和重复。收尾核对默认开启，存量整理由 `reflectionMode: auto` 启用，索引压力作业以水位线为目标（目标字符 = `l1MaxChars` × `indexTargetRatio`）。调度、额度与检查点的细节见[自动维护](docs/automatic-maintenance.zh.md)。

## 进一步探索

- [设计说明](docs/design.md) 讲存储、身份、上下文组装和索引占用的口径。
- [开发与端到端验收](docs/development.md) 讲怎么构建、载入真实宿主并验收改动。
- [自动维护](docs/automatic-maintenance.zh.md) 讲收尾核对、存量整理和索引压力作业的调度细节。
- [记忆管理页接口契约](docs/memory-browser-contract.md) 讲记忆页与状态服务之间的数据通道、索引占用组件和页面要求。
- [热度排序契约](docs/heat-ranking-contract.md) 讲热度计分、排序快照与探索位的硬约束。
- [更新日志](CHANGELOG.md) 记录已经发布的行为变化。

## 已知限制与暂缓工作

- **折叠会藏起细节**，索引超出字符预算时条目被折叠、描述被截短。完整正文还能通过 `memory_read` 拿到。
- **索引是会话内的固定开销**，项目索引受 `l1MaxChars` 限制，全局索引受 `globalL1MaxChars` 限制，超预算时先保热度高的条目。索引在稳定前缀里，写入改动索引会让它后面的缓存 token 失效，细节见[设计说明](docs/design.md)。
- **维护要花模型调用**，内部收尾核对与 `reflectionMode: auto` 都会启动子代理并消耗模型调用，预算按单次维护运行计算。
- **命名空间靠路径识别**，项目挪到别的路径就会变成另一个空间，除非显式迁移。
- **工具按会话生效**，基础记忆工具随会话提供，补充工具通过 `memory` 技能或 `memory_activate` 按需挂载，历史激活只恢复工具模式。
- **占用数据按命名空间给出**，占用行只统计当前命名空间，`default` 空间和项目空间不合并显示。
- **索引超预算只影响提示词视图**，磁盘上的 `index.txt` 始终是完整的活跃目录，超预算不会删除或归档条目，只裁剪注入提示词的那份视图。

### 开发者备注

无。
