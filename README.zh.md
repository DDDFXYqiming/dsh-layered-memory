---
description: "DeepSeek Harness 的跨会话记忆。项目与全局索引常驻上下文，条目带结构标识与证据，旧版本可以恢复。"
kind: "package-bundle"
---

# @dsh-external/dsh-layered-memory

[English](README.md) | 中文

## 概述

分层记忆把事实和操作经验从一次会话带到下一次。事实放在 `facts.md` 的二级标题下，操作流程放在 `sops/*.md`。会话开始时，agent 拿到一份项目索引和一份全局索引，正文等用到时再读。每个条目用 `{namespace, kind, key}` 定位，显示标题和身份是两件事。写入之前先把当前版本存下来，所以历史可以查，也可以回滚。

## 目录

- [安装](#安装)
- [使用](#使用)
- [配置](#配置)
- [理解实现](#理解实现)
- [进一步探索](#进一步探索)
- [模型体验](#模型体验)
- [已知限制与暂缓工作](#已知限制与暂缓工作)

## 安装

```bash
dsh plugin --profile web add   github:DDDFXYqiming/dsh-layered-memory   "github:DDDFXYqiming/dsh-layered-memory#path:/lib/status"
```

两条 spec 都要装，因为 bundle 贡献两个组件（记忆插件本体与输入区的状态服务）。pnpm 默认阻止传递依赖里的 git 子包（blockExoticSubdeps），所以状态包必须作为直接依赖声明，否则新装只会有第一个组件。

桌面端用它随附的 `dsh` 命令，把 profile 换成 `desktop`。本地开发先执行 `npm run build`，再直接链接这个仓库与 `lib/status`，并让 profile 指向它们。`lib/index.js` 只转发导出，实际源码在 `src/`。

## 使用

加载 `memory` skill，或者调用 `memory_activate({mode:"common"})` 打开工具。管理操作用 `mode:"manage"`。只读会话可以传 `access:"read"`，子 agent 默认就是只读。

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
memory_history({entry})
memory_rollback({entry, snapshot_id: "填一个返回的快照 id"})
```

`memory_write` 负责新建，`memory_update` 负责改动已有条目。更新、归档和恢复都会先写一份当前版本，之前的状态因此还能找回来。

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

主包随附可独立启停的“记忆状态”组件。Web 输入区底部的一行状态按当前会话显示正在核对、真实变更条数或上次未完成原因，点击可打开对应的原生子会话。

## 配置

```yaml
- id: dsh-layered-memory
  config:
    defaultNamespace: ''
    autoNamespace: true
    progressive: true
    l1MaxChars: 12288
    globalL1MaxChars: 2048
    memoryAccess: write
    subagentMemoryAccess: read
    autoPending: false
    turnReviewEnabled: true
    turnReviewMinEvidence: 6
    turnReviewCooldownMinutes: 30
    reflectionMode: notify
```

自动命名空间来自工作区身份或者规范化后的根路径。两个同名项目放在不同路径下仍然是两个空间，同一个仓库的不同分支共用项目记忆。已有的命名空间要显式迁移，迁移后保留原目录。

`default` 是全局空间，项目索引和默认搜索都把它算进来。字符预算同时管索引条目和手写规则，完整文件仍然可以通过工具读到。宿主用变量传递记忆文本，内容按数据处理，`{{模板括号}}` 会原样保留。

任务收尾核对默认开启，按会话积累去重后的新证据，达到数量与回合门槛且满足冷却间隔后在内部子会话中核对相关记忆，明确的文件改动或失败后成功可提前满足回合条件。存量自动维护由 `reflectionMode: auto` 启用，在原生 fresh-context subagent 上按已保存进度分批整理，并对工具、写入、时间和模型输出设限。细节见[维护指南](docs/automatic-maintenance.zh.md)。

## 理解实现

<details>
<summary>存储、身份与上下文组装</summary>

事实靠它在 `facts.md` 里的二级标题定位，操作流程靠 `sops/` 里的路径定位。显示标题和条目 key 是两个值，所以同一个标题可以既是事实又是流程，可以在一个空间里，也可以跨两个空间。

L1 索引在磁盘上保存完整的活跃目录。组装上下文时，项目索引和全局索引各有自己的字符预算。预算不够时条目会被折叠，描述截短，但每个折叠的条目都留了一条能读回正文的路径。

宿主通过 `systemPrompt.variable` 把记忆文本交出去，prompt 里引用的是固定变量，正文不会被当成模板再解析一遍。宿主比较内容快照，只有快照变了才追加。L0 和运行期 skill 共用同一份核心规则模板。

</details>

## 进一步探索

- [设计说明](docs/design.md) 讲存储、身份和上下文组装的具体做法。
- [开发与端到端验收](docs/development.md) 讲怎么构建和验证改动。
- [自动维护](docs/automatic-maintenance.zh.md) 讲可选的模型维护流程。
- [更新日志](CHANGELOG.md) 记录已经发布的行为变化。

## 模型体验

### 系统提示词里的记忆索引

#### 模型看到什么

系统提示词里带一份项目索引和一份全局索引，加上当前命名空间的手写规则。索引每行给出条目名和一句简短描述，正文留在磁盘上，等模型调用读取工具。

#### Token 影响

索引部分是会话内的固定开销，项目索引受 `l1MaxChars` 限制，全局索引受 `globalL1MaxChars` 限制。读取按需增加 token，返回的是行范围，长条目可以分几次读完。`progressive: true` 让索引行保持短小，把细节留给读取。

#### KV cache 影响

索引位于稳定前缀里，快照没变就能复用服务端的缓存。一旦写入改变了索引，这个前缀就换了内容，它后面的缓存 token 随之失效。

## 已知限制与暂缓工作

- **折叠会藏起细节**，项目索引或全局索引超出字符预算时，条目被折叠、描述被截短。完整正文还能通过 `memory_read` 拿到，但只看索引的 agent 看到的东西比文件里少。
- **维护要花模型调用**，内部收尾核对与 `reflectionMode: auto` 都会启动子代理并消耗模型调用。`autoPending: true` 将失败后恢复的调用序列记入候选区。预算按单次维护运行计算，不按整个会话累计。
- **命名空间靠路径识别**，自动命名空间来自工作区身份或者规范化根路径。项目挪到别的路径就会变成另一个空间，除非显式迁移。
- **工具按会话生效**，加载 `memory` 技能、调用 `memory_activate` 或进入维护子会话时挂载相应工具。目录索引随上下文提供，正文通过工具读取。
- **索引超预算会被改写**，超出上限时引擎重写索引文件并标记 `over_limit`，条目列表可能被重新编排。写入方看到的条目数量不能当成文件里真实条目的数量。

### 开发者备注

无。
