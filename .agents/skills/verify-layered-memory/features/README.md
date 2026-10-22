# Layered memory 功能地图

当前验收目标是已安装 DSH 中的记忆插件与生成的状态组件。所有流程从 [运行命令](../references/runtime.md) 建立的独立环境开始。

## 基线

- WSL：`Ubuntu-24.04-Hermes`，用户 `openclaw`。
- DSH：`/home/openclaw/apps/deepseek-harness/node_modules/@deepseek-ai/dsh/lib/bin.js`。
- Web：`http://127.0.0.1:3082`，profile `memory-repair-web`。
- SDK：profile `memory-repair-sdk`，JSON-RPC 驱动真实会话。
- 模型：本机已配置的 `opencode-go / deepseek-v4.1-flash`。
- 数据：本次运行目录下的 `memory/`、`sessions/`、`workspace/`。
- 插件：当前项目与 `lib/status` 分别链接到隔离 profile 的两个正式包名。

## 流程

| 功能 | 操作流程 | 可见结果与持久化证据 |
| --- | --- | --- |
| 收尾核对 | [主动核对](turn-review.md) | 维护分支实际读写，主会话任务完成，日志和记忆正文对应 |
| 频率控制 | [主动核对](turn-review.md) | 新证据跨回合积累、重复去重、冷却期间保留待办 |
| 失败与恢复 | [主动核对](turn-review.md) | 失败工具被正确识别；失败维护保留未处理证据并释放认领 |
| 输入区状态 | [状态 UI](status-ui.md) | 一行状态、可展开详情、真实变更条数和失败原因 |
| 会话及组件生命周期 | [状态 UI](status-ui.md) | 会话切换内容正确，组件开关及导航正常 |
| 底栏宽度与响应式 | [状态 UI](status-ui.md) | 状态随内容取宽，空闲为零占位，窄窗单行省略且保留完整详情 |

## 证据约定

SDK 每个场景保存 `<output>.jsonl`、`<output>.stderr.log`、`<output>.steps.json` 和 `<output>.summary.json`。场景使用明确的专用命名空间。每个写入结果与实际记忆正文、`maintenance-runs.json`、`turn-review-state.json` 交叉对应。

UI 证据包含页面地址、会话身份、可访问树与截图。保存运行中、完成后和用户展开后的状态；页面切换与组件开关分别记录前后结果。

## 2026-10-22 运行记录

后端、source-link 与组件启停在 `0.10.0-preview.3` 完成验收；最终日常正式包为 `0.10.0-preview.4`，额外变更仅为底栏 CSS，另完成真实页面布局验收。证据根目录为 `D:/AI_Projects/dsh-memory-repair-20261022/e2e`，WSL 路径为 `/mnt/d/AI_Projects/dsh-memory-repair-20261022/e2e`。后端汇总为 `backend-verification.json`。

| 场景 | 实际结果 | 证据 |
| --- | --- | --- |
| smoke | 真实模型激活工具并读取当前版本和专用空间 | `logs/smoke.summary.json` |
| frequency | 7 个用户回合对应 7 个主回合，1 个 fork。pending 为 2→2→4，核对后 pending=0、seen=6；冷却内又积累 6 条，仍只有 1 次派发 | `logs/frequency.steps.json`、`logs/frequency.summary.json` |
| 更新及新建结案 | frequency 分支 reviewed，5 次工具调用、2 次变更：既有端口 3000 改为 8456，并新建构建/预览 fact；两条都返回 changed | `memory/frequency-e2e/maintenance-runs.json` |
| creation | 主模型在原任务中先保存 fact，内部核对完整读回后为 unchanged，0 次维护写入 | `logs/creation.summary.json`、`memory/creation-e2e/maintenance-runs.json` |
| failed-evidence | 第一回合 6 次 native read 失败，pending=0、seen=0，记录 read 失败；下一回合引用真实失败 call ID 的 memory_review 被拒绝 | `logs/failed-evidence.steps.json`、`logs/failed-evidence.jsonl` |
| review-timeout | 真实维护在 10 秒超时，deferred；pending 8→9、seen=0、claim=null，派发时间已保存；下一回合仍为 1 个 fork | `logs/review-timeout.steps.json`、`memory/review-timeout-e2e/maintenance-runs.json` |
| Web 运行与完成 | 真实 Web 分支 reviewed，实际变更 2 条；状态 running→changed，单行高 20px，历史位置前后保持一致；点击状态进入原生子会话 | 上级目录 `ui-running.png`、`ui-completed-history.png`、`ui-history-before.json`、`ui-history-after.json` |
| 构建后关闭组件 | 独立实例重启后再次构建，再从插件页关闭 Memory status。插件页为 2 total / 1 running / 1 off；主会话 slot=0、unavailable=false；核心 memory_stats 仍返回 preview.3 和 2 条记忆 | 上级目录 `ui-toggle-disabled.json`、`ui-component-disabled.png`、`host-patch/3082-status-disabled-hostgraph.json` |
| 重新启用组件 | 插件页恢复 2 total / 2 running；主会话 slot=1、changed=2；宿主模块图只包含 1 个状态组件 | 上级目录 `ui-toggle-enabled.json`、`host-patch/3082-status-enabled-hostgraph.json` |
| 会话隔离 | 新建真人会话正常回复，状态 seat=1、idle、文本为空；切回原 Web 会话自然恢复 seat=1、changed、Organized 2 memory entries | 上级目录 `ui-new-session.json`、`ui-returned-session.json` |
| 历史失败详情 | 日常 3081 中打开此前失败的会话，状态 title 同时显示已整理 3 条、上次核对未完成、完整读取校验的具体原因和子会话入口 | 上级目录 `ui-historical-failure.png`、`ui-historical-failure.json` |
| 正式包安装 | 日常 3081 经官方 removeBundle/installBundle 安装 tgz，两项回执 application=applied、warnings=[]；bundle list 为 preview.3、enabled=true、installed=true，实际重新加载日志确认版本 | 上级目录 `daily-preview3-install.json`、`daily-preview3-bundle.json`、`deployment.md`、`host-patch/daily-after-restart.json` |
| 日常页面运行 | 刷新原会话后可以正常回复，记忆状态显示已整理 1 条；历史失败会话的结果与具体原因可见，随后返回原会话 | 上级目录 `daily-final.png`、`ui-historical-failure.json` |
| preview.4 正式热装 | 官方安装 applied、warnings=[]，实际加载于 2026-10-22T07:01:20.169Z，日常 PID 33081 保持不变 | 上级目录 `daily-preview4-install.json`、`daily-preview4-bundle.json`、`daily-preview4-loaded.txt` |
| preview.4 内容宽度 | 1707px 视口：seat 从 300px 缩到 116.02px，与按钮等宽；dock 从 746px 缩到 562.02px，仍高 27px。900px 视口仍为单行，seat 116.02px | 上级目录 `layout-preview4.json`、`layout-preview4-default.png`、`layout-preview4-900.png` |
| preview.4 窄窗 | 480px 视口：普通 seat 72.5px，长失败状态 105.01px，单行省略；dock 高 27px，页面无横向溢出，完整 title 和点击详情保留 | 上级目录 `layout-preview4-480.png`、`layout-preview4-failure-480.png`、`layout-preview4.json` |
| preview.4 空闲与返回 | 打开实际维护子会话后，空闲 seat 的 display=none、width=0、height=0，dock 仍高 27px；恢复 1707px 视口并返回原会话后显示 changed 1 | 上级目录 `layout-preview4.json`、`daily-final-preview4.png` |

失败证据场景第二回合为取得 call ID 查询过日志，产生 23 条成功的外部工具证据；失败读取的排除结论对应其第一回合。后续按流程从实际 RPC 事件提取 call ID，再明确传入下一步。

本次 `review-timeout` 由技能内的 `scripts/sdk-run.mjs` 实际驱动，所有 SDK 场景正常退出。隔离 Web 最终 PID `32992` 已通过 `SIGTERM` 正常退出，端口 `3082` 已释放；独立 home 内复制的 `.credentials.yaml` 和 `.env` 已移除，profiles 和全部证据保留。清理回执为 `cleanup.json`。

本机宿主的 `dsh-client-modules` 已修复构建热更新后漏发 `app-boot/config-reload` 的问题。补丁为上级目录 `host-patch/dsh-client-modules-config-reload.diff`。本次关闭/开启的宿主模块图分别为 69/70 项，状态组件分别不存在/恰好 1 项。

隔离 source-link 与日常正式 tgz 安装分别完成验收。preview.3 包及其 `2026-10-22T06:54:21.701Z` 加载记录保留为后端和启停阶段证据；最终安装包为上级目录 `dsh-external-dsh-layered-memory-0.10.0-preview.4.tgz`。历史失败详情保留原 run 的真实失败原因，当前后端的写入成功由本次 frequency/Web 新 run 证明，preview.4 额外显示行为由布局记录证明。
