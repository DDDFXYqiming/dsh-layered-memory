# 主动收尾核对与证据状态

用户完成真实工作后，插件积累可验证的新证据，在门槛和冷却允许时启动内部记忆核对。分支通过实际记忆工具读写，结果存入维护记录；主会话正常交付用户任务。

## Sub-features

- `TR-01`：实际模型激活记忆工具并读取当前运行信息。
- `TR-02`：证据按指纹积累，重复读取去重；6 条新证据跨 3 个有效回合，或存在真实成果，且冷却满足时派发核对。
- `TR-03`：修改已有条目前完整读取，新建条目可直接保存并以 changed 结果完成。
- `TR-04`：失败的普通工具结果进入失败状态，冲突登记只能引用成功证据。
- `TR-05`：核对失败或 deferred 保留 pending，记录派发冷却并释放 claim；成功完成再消费证据。

## How to get to it (user POV)

- Web 会话中完成包含配置读取、文件变更等实际工作的用户回合，等待输入区出现记忆核对状态。
- SDK 的 `session/prompt` 发送同样的工作请求，用 `session/wait` 和子代理完成通知观察同一后端路径。

## Driving it with DSH SDK and Web

Preconditions: 已按 [运行命令](../references/runtime.md) 建立独立环境。每个场景独立命名空间、会话 ID 和 patch。默认频率为 6 条证据、30 分钟冷却。真实模型使用已配置的 `opencode-go / deepseek-v4.1-flash`。

- **Smoke**：运行 `scripts/sdk-run.mjs <run>/smoke.scenario.json`。让实际模型激活 common 工具并调用 `memory_stats`。在 RPC、stderr 与最终输出核对当前版本和专用空间。
- **积累与去重**：运行 `<run>/frequency.scenario.json`。按顺序读取 `a.json+b.json`，重复相同读取，再读取 `c.json+d.json`、`e.json+f.json`。前两个不同读取回合积累 4 条，重复读取回合增加 0 条；第三个新证据回合达到 6 条并派发一次维护。观察每步 `.steps.json` 中 pending、seen、claim 与子代理计数。
- **实际更新**：frequency 空间预置旧预览端口为 3000，工作区配置实际为 8456。分支应完整读取旧条目后修正；`maintenance-runs.json`、实际 fact 正文、父会话来源与结构化完成相互对应。
- **冷却**：同一场景随即再次读取、完成文件变更和发送简短确认。查看 pending 是否继续积累，维护派发计数是否保持不变；对照 `lastDispatchedAt`。
- **新建**：运行 `<run>/creation.scenario.json`。实际模型读取六个配置并写出工作报告，由内部收尾分支将可复用环境约定保存到空空间。查看新记忆正文、真实变更条数及维护完成状态。
- **失败证据**：在专用场景中用 native `read` 读取不存在的文件。由 RPC 日志提取该次 `tool/result` 的 `message.source.callId`，并确认同一消息的 `message.isError=true`。下一回合显式引用这一实际 call ID 调用 `memory_review`。应返回“本会话未找到成功的证据调用”，且前一失败回合不产生成功 pending 或维护子代理。
- **维护超时**：在专用场景 patch 中缩短维护超时，驱动一个达到派发条件的真实用户任务。等待该维护分支终止，对照实际维护记录与证据状态；failed/deferred 的 fingerprints 应保留在 pending，`claim` 清空，`lastDispatchedAt` 保留实际派发时间。
- **Web 关联**：打开同一后端目标的用户会话，按 [状态 UI](status-ui.md) 查看 run 对应的输入区提示和子会话详情。

## Gotchas

- `tool/result` 的错误标志位于 `message.isError`；PTC 子调用事件使用其自身的 `isError`。
- `bash` 的非零进程退出码和宿主工具本身的错误是两种数据；失败证据场景使用已观察到 `message.isError=true` 的实际事件。
- native call ID 从 SDK 的实际事件中提取，再交给后续操作。普通模型上下文可能看不到此前的 native call ID。
- 维护完成通知、最后一次写入与后台状态更新可能相继到达；驱动器在等待任务后继续等待维护子代理，保存最终状态。
- 历史 run 的部分写入和失败原因应同时记录。此前失败记录不会因代码升级而改写成成功。
