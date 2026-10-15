# 自动记忆维护

默认 `reflectionMode: notify`。程序扫描将可行动事项交给当前会话；`auto` 使用独立的 DSH 子代理。没有可行动事项时记录 no_action，不启动模型任务。

## 配置

```yaml
- id: dsh-layered-memory
  config:
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

程序维护按 `maintainEveryTurns` 累计轮次，每个命名空间独立节流。反思还受 `reflectCooldownTurns` 与内容revision约束。相同内容已有结论时不重复通知。

扫描将同名冲突、跨条目一致/近重复候选和待处理pending归入actionable；冷条目仅提供复核线索。磁盘索引长于注入预算本身不要求模型为了凑数删减知识。

`autoPending:false` 为默认值。启用后，同一工具先失败后成功的序列进入候选；正式记忆仍需提交精炼正文和验证证据。候选可以显式丢弃，结果留在管理历史中。

## 子任务权限与完整读取

DSH 0.2.1-alpha.3 使用 `startActivation` 创建保留身份的本机子会话，结果以 `caller` 方式交回维护器；发布前按该身份安装工具过滤，超时释放对应 activation。旧版宿主继续使用 `start` 接口。

auto维护使用宿主原生fresh-context子代理，通过专用激活入口获取绑定当前空间的有限工具。普通子代理默认read访问；维护任务的写入权限由专门的调用数、写入数和时间预算约束。

修改已有条目前必须完整读取同一revision。类型、空间和key共同构成身份；读取另一种类型或尾页都不会取得完整读取资格。归档还需给出明确的替代条目。

程序只自动合并同名同内容段，跨条目相似度供模型或人工核对。模型可以得出零修改结论；有待办却未处理完时记录deferred，中断或执行失败记录failed。

## 结果与成本

`memory_stats` 提供当前空间及最近维护状态。`reflection-state.json` 记录最近一次状态，`maintenance-runs.json` 保存最近50次的原因、状态、会话、模型路由、调用数、修改数及可取得的usage。

查看完整的provider子会话可以确认实际工具、读取范围和修改结果。usage来自宿主记录，缺失时保留未知值；不根据调用次数估算费用。

## 真实验收

在实际桌面宿主中使用专用记忆库，先验证notify的可行动事项，再以少量重复候选启用auto。观察真实子会话是否启动、完整读取后才修改、预算是否执行、主会话是否继续工作，以及相同revision是否重复触发。结束后恢复日常配置并保留本次会话与维护历史。
