# 自动记忆维护

默认 `reflectionMode: notify`，发现待办时向当前会话发送可执行的后续消息。`reflectionMode: auto` 使用独立的 DSH 子代理，按保存的进度分批整理。主模型收尾检查与独立维护分别配置。

## 任务收尾检查

`turnReviewEnabled: true` 默认启用主模型收尾检查。宿主的 `agent/turn-stopping` 钩子在本轮结束前检查成功的工具记录：本轮查阅过记忆或取得工具返回时，向仍持有任务上下文的主模型投递一次检查。模型核对相关旧事实与本轮证据，已有条目先完整读取，再更新原条目；新信息先检索再保存。

检查消息保存在官方会话事件中，同一轮恢复或插件热重载后仍能识别已经检查过。普通子代理和只读访问保持原有权限。无新信息时可以直接结束；每次检查可能增加模型调用。

## 配置

```yaml
- id: dsh-layered-memory
  config:
    turnReviewEnabled: true
    reflectionEnabled: true
    reflectionMode: auto
    maintenanceProvider: spawn
    maintenanceLlmProvider: ''
    maintenanceModel: ''
    maintenanceReasoningEffort: ''
    maintenanceMaxTokens: 4096
    maintenanceCooldownMinutes: 30
    maintenanceMaxCalls: 32
    maintenanceMaxWrites: 6
    maintenanceTimeoutSeconds: 300
```

LLM提供方与模型应选择本机已配置且可用的组合，并成对设置。留空时沿用父会话模型。`maintenanceProvider` 是执行子代理的提供方，与 `maintenanceLlmProvider` 分别表示两种职责。`maintenanceMaxTokens` 限制模型输出，不能等同于整次输入与输出的总计费上限。

## 何时检查

程序扫描按 `maintainEveryTurns` 与 `reflectCooldownTurns` 节流。首次索引超出注入预算时创建语义审阅作业，模型先浏览完整标题目录、选择少量相关候选，再读取正文判断。确定的重复、同名冲突和 pending 也会形成待办。冷条目仅提供复核线索。

模型读过后认为应保留的条目可以结案，索引仍超限也可以结束本轮。完成后累计日常任务新增或实质修改的不同条目，达到 20 条时安排下一轮；维护自身的写入不计入该累计。

主模型通过 `memory_review({entry,reason,evidence_call_ids})` 登记明确的新旧证据冲突。宿主从本会话的成功调用保存脱敏证据片段及精确事件引用，维护代理据此复核。待办可越过普通扫描轮次门槛，自动执行仍受 `maintenanceCooldownMinutes` 限制。

`autoPending:false` 为默认值。启用后，同一工具先失败后成功的序列进入候选；正式记忆仍需提交精炼正文和验证证据。候选可以显式丢弃，结果留在管理历史中。

## 子任务权限与完整读取

DSH 0.2.1-alpha.3 使用 `startActivation` 创建保留身份的本机子会话，结果以 `caller` 方式交回维护器；发布前按该身份安装工具过滤，超时释放对应 activation。旧版宿主继续使用 `start` 接口。

auto维护使用宿主原生fresh-context子代理，通过专用激活入口获取绑定当前空间的有限工具。普通子代理默认read访问；维护任务的写入权限由专门的调用数、写入数和时间预算约束。

修改已有条目前必须完整读取同一revision。类型、空间和key共同构成身份；读取另一种类型或尾页都不会取得完整读取资格。归档还需给出明确的替代条目。

维护代理先保存选中的候选，再通过内部检查点记录逐条结果。完成的更新或合并须有实际变更；保留条目须已完整读取并说明理由。预算耗尽时保留未处理进度，冷却后继续。证据不足的事项等待该条目版本或新证据变化。相似度用于选择线索，合并时保留来源和适用条件。

## 结果与成本

`memory_stats` 提供当前空间、最近维护状态与审阅台账。`review-state.json` 保存语义审阅进度、条目版本、结果理由及日常变更累计；`reflection-state.json` 保存程序扫描与通知状态。`maintenance-runs.json` 保存最近50次执行的会话、模型路由、调用数、修改数及可取得的usage。

查看完整的provider子会话可以确认实际工具、读取范围和修改结果。usage来自宿主记录，缺失时保留未知值；不根据调用次数估算费用。

## 真实验收

在实际桌面宿主中使用专用记忆库，先验证notify的可行动事项，再以少量重复候选启用auto。观察真实子会话是否启动、完整读取后才修改、预算是否执行、主会话是否继续工作，以及相同revision是否重复触发。结束后恢复日常配置并保留本次会话与维护历史。
