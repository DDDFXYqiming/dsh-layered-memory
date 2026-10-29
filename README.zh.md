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

基础工具 `memory_search/list/read/write/update` 随会话提供。加载 `memory` skill 或调用 `memory_activate({mode:"common"})` 补充状态与冲突登记工具，管理操作用 `mode:"manage"`。读写权限由用户配置 `memoryAccess` 和 `subagentMemoryAccess` 决定，子 agent 默认只读；`memory_activate` 不改变权限。

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

主包随附可独立启停的“记忆状态”组件。Web 输入区底部的一行状态按当前会话显示正在核对、真实变更条数或上次未完成原因。没有维护记录时显示“记忆待命”，点击同样可以打开详情。浮层可查看固定维护会话的只读历史、运行记录，或停止正在执行的维护。

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

自动命名空间来自工作区身份或者规范化后的根路径。两个同名项目放在不同路径下仍然是两个空间，同一个仓库的不同分支共用项目记忆。已有的命名空间要显式迁移，迁移后保留原目录。

`default` 是全局空间，项目索引和默认搜索都把它算进来。字符预算同时管索引条目和手写规则，完整文件仍然可以通过工具读到。宿主用变量传递记忆文本，内容按数据处理，`{{模板括号}}` 会原样保留。

主模型在任务中照常查阅和更新笔记，后台照看本轮相关笔记的遗漏、矛盾和重复，零变更是正常结果。任务收尾核对默认开启，积累 6 条去重后未处理的成功证据作为一个批次；单个正常完成的用户回合也可满足，当前回合仍须有新证据。每个父对话最多两个固定维护会话：核对沿用当前父模型，存量整理默认也沿用当前对话模型；需要钉到指定模型时，再用 `maintenanceLlmProvider` 与 `maintenanceModel` 成对指定。`turnReviewReasoningEffort` 可单独指定核对思考档，留空则沿用父会话。存量自动维护由 `reflectionMode: auto` 启用。两条路径通过 `maintenanceCooldownMinutes` 共用默认 30 分钟的空间级冷却，维护自己的写入不算新用户工作。索引压力作业以水位线为目标：目标字符 = `l1MaxChars` × `indexTargetRatio`（默认 0.9），候选数按缺口放大，未达标且有改动就连续续派，直到压回水位线或整轮零改动；优先合并同主题条目，归档失效条目为次要手段，调高 `l1MaxChars` 不是回避整理的办法。

成功写入立即记账保存。完成工具先校验条目，再结束维护代理；提交有误时返回具体条目和修正方式，代理可在本轮继续处理。工作调用额度用完后仍可保存检查点和提交完成结果。超时或取消会结束本轮并保留已保存进度；有新证据且冷却到期后，未完成核对可以继续，无需重新凑满首次派发门槛。固定会话会收到前次结果、剩余工作及版本仍有效的已保存条目。

默认每轮最多 64 次工作调用、6 次写入和 300 秒，每次模型响应最多输出 16384 tokens。存量 profile 中显式填写的数值会继续覆盖升级后的默认值。同一版本的分页读取会累计，修改时只检查目标条目的版本，无关条目的变化不会中止整轮维护。需要 DSH 0.2.1-rc.2 或更新的兼容版本，细节见[维护指南](docs/automatic-maintenance.zh.md)。

## 理解实现

<details>
<summary>存储、身份与上下文组装</summary>

事实靠它在 `facts.md` 里的二级标题定位，操作流程靠 `sops/` 里的路径定位。显示标题和条目 key 是两个值，所以同一个标题可以既是事实又是流程，可以在一个空间里，也可以跨两个空间。

L1 索引在磁盘上保存完整的活跃目录，顺序与写入顺序一致，不受热度改写。组装上下文时，项目索引和全局索引各有自己的字符预算：规则层优先，条目层至少保留四分之一空间。条目层按使用热度排序注入（真实 `memory_read` 计分，同会话同条目只计一次，维护读与搜索命中不计，`related` 有小额封顶加分，新条目有短期新手保护）：预算够时全部条目按热度顺序出现；装不下时优先保留热度高的条目，并为热度低的条目留出按会话轮换的探索位，省略数量写进视图。会话内的排序快照固定，新会话才采用最新热度。视图里还有一段按当前用户请求召回的条目（BM25 纯文本），让低热度但相关的记忆不靠碰运气被发现。热度只影响推荐顺序，不改变条目是否存在，也不触发自动归档。

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

索引部分是会话内的固定开销，项目索引受 `l1MaxChars` 限制，全局索引受 `globalL1MaxChars` 限制。超出预算时优先保留热度高的条目，低热度条目走会话轮换探索位，省略数量在视图里显式标注，不会静默丢弃，也不会因此删除或归档条目。读取按需增加 token，返回的是行范围，长条目可以分几次读完。`progressive: true` 让索引行保持短小，把细节留给读取。

#### KV cache 影响

索引位于稳定前缀里，快照没变就能复用服务端的缓存。一旦写入改变了索引，这个前缀就换了内容，它后面的缓存 token 随之失效。

## 已知限制与暂缓工作

- **折叠会藏起细节**，项目索引或全局索引超出字符预算时，条目被折叠、描述被截短。完整正文还能通过 `memory_read` 拿到，但只看索引的 agent 看到的东西比文件里少。
- **维护要花模型调用**，内部收尾核对与 `reflectionMode: auto` 都会启动子代理并消耗模型调用。`autoPending: true` 将失败后恢复的调用序列记入候选区。预算按单次维护运行计算，不按整个会话累计。
- **命名空间靠路径识别**，自动命名空间来自工作区身份或者规范化根路径。项目挪到别的路径就会变成另一个空间，除非显式迁移。
- **工具按会话生效**，基础记忆工具随会话提供，补充工具通过 `memory` 技能或 `memory_activate` 按需挂载。历史激活只恢复工具模式，读写权限仍来自用户配置。目录索引随上下文提供，正文通过工具读取。
- **索引超预算只影响提示词视图**，磁盘上的 `index.txt` 仍是完整活跃目录，顺序不因热度改变；写入返回的 `over_limit` 只说明注入预算不够，不代表条目被删除或归档。

### 开发者备注

无。
