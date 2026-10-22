# 自动记忆维护

默认 `reflectionMode: notify`，待办保存在状态台账中，可通过 `memory_stats` 和 `memory_maintain` 查询。`reflectionMode: auto` 使用独立的 DSH 子代理，按保存的进度分批整理。任务收尾核对与存量维护共用空间级派发窗口，结果保存在内部记录中。

## 任务收尾检查

`turnReviewEnabled: true` 默认启用任务收尾核对。插件在真实用户任务完成后积累成功工具证据的指纹与来源引用，根据宿主 `message.isError` 和进程退出码排除失败调用。默认至少需要 6 条未处理的新证据，并覆盖 3 个有新证据的用户回合。证据窗口最多保存 32 条，保留最近三个有效回合各至少一条，供长任务继续积累。

重复返回内容会去重，主任务通过 `evidence_call_ids` 或当前会话 `sourceSeqs` 成功保存的证据会从待核对集合剔除。只有当前回合带来新证据、门槛和冷却均满足时，才启动原生 `fork` 子会话继承任务上下文。分支先完整读取相关条目，再判断是否更新或保存新知识。完整结束后消费该批证据，失败、超时或延期时保留待处理证据，实际派发仍计入冷却。

分支使用 `delivery: caller`，结果交回插件并记录在 `maintenance-runs.json`，主会话保留用户任务的回答。无变化记录为 `unchanged`。纯闲聊、插件发起的轮次、仅查询记忆状态及只读访问保持原样。

执行记录按父会话与完成事件去重，同一用户回合最多派发一次自动维护。事实来源指向父会话的验证事件，核对者身份单独记录。收尾核对沿用维护调用、写入、输出和超时预算，使用父会话的模型路由。每次实际核对会消耗模型调用，`turnReviewEnabled: false` 可关闭。

收尾核对与批整理统一读取当前空间 `maintenance-runs.json` 中最近一次真实派发时间，默认间隔至少 30 分钟。冷却期间继续积累证据，插件重装和会话切换沿用同一份台账。

## 配置

```yaml
- id: dsh-layered-memory
  config:
    turnReviewEnabled: true
    turnReviewMinEvidence: 6
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

LLM 提供方与模型应选择已配置且可用的组合，并成对设置。留空时沿用父会话模型。`maintenanceProvider` 是执行子代理的提供方，与 `maintenanceLlmProvider` 分别表示两种职责。`maintenanceMaxTokens` 限制模型输出，不能等同于整次输入与输出的总计费上限。

`maintenanceCooldownMinutes` 统一控制两条自动维护路径。已有配置中的 `turnReviewCooldownMinutes` 改为该项。

## 何时检查

程序扫描按 `maintainEveryTurns` 与 `reflectCooldownTurns` 节流。首次索引超出注入预算时创建语义审阅作业，保存来源会话与触发事件；扫描已有待办保持原归属。模型先浏览完整标题目录、选择少量相关候选，再读取正文判断。确定的重复、同名冲突和 pending 也会形成待办。冷条目仅提供复核线索。

模型读过后认为应保留的条目可以结案，索引仍超限也可以结束本轮。完成后累计日常任务新增或实质修改的不同条目，达到 20 条时安排下一轮。收尾核对与批整理自身的写入均不计入该累计。

主模型通过 `memory_review({entry,reason,evidence_call_ids})` 登记明确的新旧证据冲突。宿主从当前会话的成功调用保存脱敏证据片段及精确事件引用，维护代理据此复核。待办可越过普通扫描轮次门槛，自动执行仍受 `maintenanceCooldownMinutes` 限制。

`autoPending: false` 为默认值。启用后，同一工具先失败后成功的序列进入候选，正式记忆仍需提交精炼正文和验证证据。候选可以显式丢弃，结果留在管理历史中。

## 子任务权限与完整读取

DSH 0.2.1-alpha.3 使用 `startActivation` 创建保留身份的子会话，结果以 `caller` 方式交回维护器，发布前按该身份安装工具过滤，超时释放对应 activation。旧版宿主继续使用 `start` 接口。

`auto` 维护使用宿主原生 fresh-context 子代理，通过专用激活入口获取绑定当前空间的有限工具。普通子代理默认 `read` 访问，维护任务的写入权限由专门的调用数、写入数和时间预算约束。

修改已有条目前必须完整读取同一 revision。类型、空间和 key 共同构成身份，读取另一种类型或尾页都不会取得完整读取资格。归档还需给出明确的替代条目。新建条目可直接通过 `memory_write` 创建，结案版本统一由宿主根据真实读写记录推导。

维护代理先保存选中的候选，再通过内部检查点记录逐条结果。完成的更新或新建须有实际写入，保留条目须已完整读取并说明理由。预算耗尽时保留原作业的剩余进度；来源会话有新的有效工作、已有检查点推进且共享冷却到期后再续跑。零进度超时和证据不足的事项等待新证据或显式维护请求。相似度用于选择线索，合并时保留来源和适用条件。

`memory_maintain({namespace, review:true})` 可显式认领存量待办并启动语义审阅。手动请求可以越过自动冷却，仍遵守空间忙锁、调用、写入与时间预算；实际派发也会刷新后续自动维护窗口。旧版留下的无归属待办可通过该入口继续处理。

## 状态组件

“记忆状态”组件作为独立子包 `@dsh-external/dsh-layered-memory-status` 随主包交付，可在插件管理页独立启停，挂载在宿主的 `conversation.composer.dock` 槽位。后端通过会话限定的只读快照与增量流传递运行阶段、真实变更条目数和子会话标识，前端复用宿主主题与原生子会话导航。

运行时显示轻微活动动效，完成且有变更时保留一行结果，无变化时收起运行提示并保留最近的有变更结果。计数按实际变更条目标识去重。上次核对未完成时显示标记，悬浮提示包含具体原因，点击可打开对应子会话。组件按实际内容占宽，空闲时收起零占位，窄窗口内单行省略长文并保留完整悬浮提示与详情入口。会话切换与历史浏览时自动释放旧订阅并执行状态缓存淘汰。

## 结果与成本

`turn-review-state.json` 按父会话与命名空间保存有界证据窗口、已处理指纹和派发认领，工具返回正文保留在原会话中。派发时间统一保存在 `maintenance-runs.json` 中。

`memory_stats` 提供当前空间、最近维护状态与审阅台账。`review-state.json` 保存语义审阅作业的来源会话、触发事件、条目版本、结果理由及日常变更累计；`reflection-state.json` 保存程序扫描状态及待办身份变化，无关记忆改写保持同一待办的变更标识；`maintenance-runs.json` 保存最近 50 次执行的父会话、回合身份、模型路由、调用数、修改数及可取得的 usage。

查看完整的 provider 子会话可以确认实际工具、读取范围和修改结果。usage 来自宿主记录，缺失时保留未知值，不根据调用次数估算费用。原生子会话菜单的累计 token 可能包含继承的父会话历史；单次维护的消耗以本次运行记录中的 usage 为准。

## 真实验收

在日常实例选择一段已有多轮历史的旧会话，保留真实记忆库、待办和自动维护配置，连续完成实际工程任务。按父会话、用户回合和 purpose 对照真实维护台账，观察派发、完整读取、修改、检查点及资源释放。

覆盖至少三个带新证据的用户回合及真实 30 分钟冷却边界。核对两条路径共享派发时间、同一回合去重、已保存证据消费，以及维护自身写入的归属。遇到模型错误或部分完成超时，单列结果并观察后续恢复。结束后恢复临时模型选择，归档本次产物，保留会话和维护台账。
