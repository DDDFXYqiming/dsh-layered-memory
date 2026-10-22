# 开发与端到端验收

`lib/index.js` 转发 `src/index.js`，源码即交付物。修改后先检查语法与发布文件。

```bash
npm run build
npm pack --dry-run
```

发布包包含源码、模板和文档。包版本从 package.json 读取，实际宿主的启动日志记录版本、路径、记忆根和运行模式。

## 载入真实宿主

在已安装的 DeepSeek Harness 中链接此仓库。使用 Desktop 随附的 CLI 管理 desktop profile，避免系统上另一份 CLI 的版本与模块解析差异。

配置热更新和源码热更新是两条路径。对链接开发仓库可设置以下源码监视根。

```yaml
- id: hmr
  config:
    root:
      - D:/AI_Projects/dsh-layered-memory
```

路径使用仓库真实位置。确认宿主出现模块重载记录和正确插件版本，再开始验收。重载会重新安装作用域工具，原会话可再次加载 memory 或调用 memory_activate。

## 验收环境

在实际桌面应用的新会话中执行常用流程；边界样本写入专用 memoryDir。并发和多工作区场景使用同一安装随附的 headless CLI，复用相同真实模型和插件源码。

```bash
dsh --profile memory-e2e --from-default-profile headless --dump-config
# 配置好专用 profile 后，后续场景直接运行该 profile。
dsh --profile memory-e2e --patch ./memory-e2e.patch.yml --json - < scenario.txt
```

验收 profile 需在自己的 bundles 中启用此插件。overlay 指定专用记忆目录，避免把合成样本混入日常知识库。

## 核心流程

1. 新会话激活常用工具；按需升级管理工具；只读子代理保持只读。
2. 同标题 fact/SOP 各自创建并通过 entry 读取；含标点的 SOP 从搜索返回值直接更新。
3. foo 与 foo-bar 各有多个版本，按 snapshot_id 恢复正确条目；恢复前的版本仍可再恢复。
4. 归档、包含归档检索、归档全文读取、取消归档；正文与 meta 状态一致。
5. 含 `{{模板括号}}` 的条目进入 L1，下一轮能够继续执行。
6. 长文按 next_line 读取无遗漏；尾页不是完整读取，full:true 是完整读取；越界明确失败。
7. 项目经验提升后在另一项目的 global 视图可发现；两个同名不同路径项目隔离。
8. PTC 验证与写入后展开来源，定位真实子调用的结果事件。
9. 两个实际宿主并发修改同一空间，正文、元数据、历史与索引均保留所有已完成操作。
10. 候选接受/丢弃、损坏 meta、历史快照写入失败、旧库迁移分别观察真实返回与磁盘结果。
11. notify 和 auto 模式分别观察可行动事项、真实子会话、完整读取资格、预算、usage 与结束状态。
12. 恢复日常配置，读取现有条目，确认已载入的版本与实际行为。

## 主动维护验收

收尾场景使用真实根会话：预置一条旧事实，再要求模型读取实际配置确认事实。检查任务完成后产生一次原生 fork 核对，其写入引用父会话验证事件；根会话中的回合数对应真实用户请求数，插件消息数为零。继续读取相同配置、写入无关新事实、查询维护状态并闲聊，确认没有额外根回合或收尾汇报。只读访问保持原记忆。

notify 场景保持索引压力待办存在，核对无关记忆写入后的待办身份保持稳定，并确认主会话没有自动执行请求。分批整理使用独立记忆空间和 `reflectionMode: auto`。预置超过注入预算、词面相似度不足以触发旧扫描的目录，观察原生维护子代理是否浏览目录、完整读取候选并保存处置理由。降低写入预算观察未完成进度，下一次符合冷却条件的根会话结束后继续；审完仍超限的空间应保持已完成。

需要连续多轮及子代理完成边界时，使用官方 SDK profile，经 stdio JSON-RPC 依次调用 `initialize`、`session/prompt`、`session/wait`，并观察 `subagent.started` 与 `subagent.finished`。场景结束以 `shutdown` 释放专用进程。热应用后重新读取 `memory_stats.runtime`，核对版本、加载时间、路径和模式。

## 保存证据

记录桌面操作结果、宿主输出、session id、工具调用 id 和对应磁盘文件。解析已经产生的真实会话日志：

```bash
npm run e2e:report -- /absolute/path/session.v4.jsonl.zstd
```

命令在原文件旁生成 `.memory-e2e.json`，列出本会话的 memory 调用、结果、错误和结束状态。预期失败场景需要结合其具体错误与旧内容是否保留判断，不能仅用错误总数判定通过。

## 发布

更新 package.json、CHANGELOG 和工具说明；完成真实宿主验收并保存报告，再提交发布。源码语法和包内容检查在 CI 执行；真实模型验收结果随发布记录保存。
