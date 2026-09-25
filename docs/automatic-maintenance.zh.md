# 自动记忆整理（测试版）

## 启用

在现有 layered-memory 插件配置项中加入下面三行。

```yaml
reflectionEnabled: true
reflectionMode: auto
maintenanceProvider: spawn
```

本版默认仍为 `reflectionMode: notify`，保持已有安装兼容。`auto` 才会用独立 DSH 子任务执行语义整理，不再向主会话注入整理请求。`notify` 可作为回退；`reflectionEnabled: false` 关闭模型参与，原有周期程序维护和手动维护仍可使用。

宿主必须提供 `ctx.subagents.getProvider()` 和 `start()`，并加载指定 provider。默认 `spawn` 必须为不继承父会话上下文、支持 `toolFilter` 和 `outputSchema` 的 provider。未满足时只运行程序维护，在日志和 `reflection-state.json.agentError` 中明确报告未执行模型复核，不冒充成功，也不退回主会话催促。无需为该插件单独填写模型 API key；路由由 DSH provider 决定。

## 行为

保留 SOP/pending/索引阈值和周期检查。达到检查条件且内容发生变化（或有上次未完成工作）、满足冷却后，先运行现有程序维护，再派发有限范围的独立整理任务。数量只触发检查，不是必须压低的指标；没有值得调整的内容时允许零写入并正常结束。每次最多提供六组合并候选、六组近重复候选和四个冷条目作为线索，模型仍须读取完整原文再判断，截断读取不算读完整。程序只自动合并同名同内容的重复段；跨条目内容一致与相似度候选一律只出候选，交由本子任务或人工语义确认后才合并、归档。

子任务通过专用激活入口获得绑定当前命名空间的记忆工具。跨命名空间检索、提升记忆、再次调用维护均不可用；不授予终端、网络或继续派生子代理的全局工具。覆盖已有内容前要求完整读取（截断读取不算完整；写全新条目自由），归档要求具体的替代条目关系（替代条目已写入且在其 related 中关联源条目，或显式传 replacement）；替代内容是否完整由模型判断，不能把这个检查当作语义无损证明。正常写操作复用原有工具及其证据检查；子任务的 memory_update 强制保留快照。

默认限制如下。命名空间级冷却 30 分钟；单次 32 次记忆工具调用、6 次写操作；超时 300 秒。配置分别为 `maintenanceCooldownMinutes`、`maintenanceMaxCalls`、`maintenanceMaxWrites`、`maintenanceTimeoutSeconds`。激活调用不计入 32 次。超时通过宿主取消信号执行，完成后始终释放子任务。冷却到期本身不会启动定时任务，仍需之后的交互会话 turn/end 触发检查。

命名空间文件锁防止多个宿主正常情况下重复派发；仅自动回收确定属于同机已退出进程的锁。内容检查忽略时间戳、访问热度和溯源补登记；自身写入结束后记录最终内容版本。发现其他会话改变记忆时停止使用旧内容，不把未检查的新版本登记为已完成。提交一轮多文件写（快照、正文、元数据、索引）时持命名空间写锁并在锁内重新读取，写锁只在提交期持有，与模型思考、子任务执行互不重叠。

## 查看结果

命名空间的 `reflection-state.json` 增加 `agentStatus`、`agentRevision`、`agentLastAttemptAt`、`agentLastFinishedAt`、`agentSession`、`agentCalls`、`agentMutations`、`agentSummary`、`agentError`。`done`/`no_action` 表示本次正常结束；`deferred` 表示仍有待处理事项，冷却后允许继续；`failed` 表示未完成复核。成功判定依赖模型结构化结果与宿主完成状态，不将被中断、无结果或未激活工具的运行标成成功。不要手工对齐 revision 来消警。

写入提示统一为“已验证、有未来复用价值、有信息增量才写”。旧 `index.txt` 中的标准催写句在读取时精确迁移；下次索引同步持久化，只替换头部已知句子，保留其他内容和 `[RULES]`。

## 验收

运行 `pnpm test`，或独立运行 `node --test test/maintenance-agent.node.mjs`。独立测试模拟宿主和存储工具，接线测试使用真实插件工具与临时存储、模拟 DSH 子代理服务；均不调用真实模型。还需在 Windows DSH 中确认 provider 可用、实际子会话工具过滤生效、模型完成整理、主任务继续执行，以及同内容不重复触发。先备份真实记忆库再试，修改前后均可比对快照和状态文件。其他插件自行注册的子会话局部工具不受全局工具过滤约束，需在本机检查实际工具列表。

宿主接口依据 deepseek-ai/deepseek-harness 的 `ddefc45f`，`packages/subagent/subagent/src/index.ts`、`types.ts` 和 `packages/core/tools/src/index.ts`。
