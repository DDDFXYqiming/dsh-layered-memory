# 输入区记忆状态与详情

输入区以轻量单行显示内部记忆核对进度和真实变更结果。用户可以查看具体原因并进入宿主原生子会话；会话切换和组件启停应按当前会话更新。

## Sub-features

- `UI-01`：真实维护运行中显示活动状态，完成后显示按条目标识去重的变更条数。
- `UI-02`：状态更新保持单行占位，用户浏览历史时滚动位置稳定。
- `UI-03`：点击状态进入本轮记忆核对的原生子会话。
- `UI-04`：失败或 deferred 展开后能看到该次运行的具体原因与实际变更。
- `UI-05`：切换父会话时显示该会话的运行记录，返回后结果仍正确。
- `UI-06`：从 Plugins 单独关闭或启用 Memory status，核心记忆工具继续可用。
- `UI-07`：状态栏按内容取宽，空闲时零占位；窄窗保持单行省略，完整提示与详情操作保留。

## How to get to it (user POV)

- 在本次 Web 地址新建 workspace 会话，按 [主动核对](turn-review.md) 完成三轮不同配置读取，在输入区查看状态。
- 点击输入区已完成状态的按钮，进入“本轮记忆核对”子会话。
- 进入 Plugins → View Layered memory → Enable component Memory status，切换状态组件。

## Driving it with the browser tool

Preconditions: 独立 Web 已启动并完成本机授权；当前页面是本次 `3082` 实例；已存在一个成功变更的父会话和一个失败或 deferred 场景。操作以浏览器工具的当前页面快照为依据。

- **触发运行**：新建 workspace 会话，三轮分别读取 `a.json+b.json`、`c.json+d.json`、`e.json+f.json`。真实分支启动后查看输入区状态，保存运行中截图及页面身份。
- **完成状态**：等待真实分支结束。状态应从 running 变为 changed，显示 `Organized 2 memory entries`。将 UI 结果与该 run 的 `maintenance-runs.json` 对应。
- **历史滚动**：核对过程中滚到消息历史顶部，记录滚动容器的 `scrollTop`、`scrollHeight`、`clientHeight`，完成后读取同一容器。保存完成时仍在原历史位置的截图及前后数据；preview.3 实际观察为 `0 / 1100 / 659` 前后不变，状态高 `20px`。preview.4 另核对底栏仍保持单行高 `27px`。
- **详情导航**：点击可访问名称为 `Organized 2 memory entries · Open memory review session` 的状态按钮。应打开“本轮记忆核对”，其中实际读写与父会话维护记录一致。
- **失败原因**：打开对应失败或 deferred 运行的状态详情。核对可见原因与该 run 的 summary，同时保留实际变更计数。本次在日常 3081 的已有失败会话中观察到 title 为“记忆已整理3条·上次核对未完成·审阅结果缺少该版本的完整正文读取·查看记忆核对子会话”，与历史记录一致。
- **会话切换**：新建独立真人会话并完成一条简单消息，再返回原会话。保存各自状态与页面身份，确保 run、计数和子会话导航对应当前父会话。本次新会话正常回复，状态 seat=1、idle、文本为空；返回后自然恢复 seat=1、changed 和 2 条结果。
- **构建后关闭组件**：页面保持打开，在项目根目录运行 `npm run build`，等待宿主完成热更新。随后 Plugins → View Layered memory → Enable component Memory status 关闭。输入区状态组件应被移除，核心插件保持 Running。通过真实会话调用 `memory_stats`，核对版本与已有条目。本次实际结果为插件页 2 total / 1 running / 1 off、slot=0、unavailable=false；核心返回 preview.3 和 2 条记忆。
- **重新启用**：重新打开 Memory status。返回原父会话，保存已恢复的状态与导航结果，检查浏览器和宿主日志。本次实际结果为 2 total / 2 running、slot=1、changed=2；宿主模块图中状态组件恰好 1 项。
- **内容宽度**：在 1707px 视口读取状态 seat、按钮和整个 dock 的实际宽度。seat 应随按钮内容取宽；preview.4 实测 seat 与按钮均为 `116.02px`，dock 为 `562.02px`，高 `27px`。900px 视口下仍为单行，seat 为 `116.02px`。
- **窄窗省略**：改为 480px 视口，分别查看普通完成状态和已有长失败状态。preview.4 实测 seat 为 `72.5px` / `105.01px`，单行省略，dock 高 `27px`，页面无横向溢出；完整 title 与点击详情仍可用。
- **空闲零占位**：点击实际已有维护子会话，观察空闲输入区。preview.4 实测 seat 为 `display:none`、宽高均 `0`，dock 仍高 `27px`。随后恢复 1707px 视口并返回原会话，确认完成状态正常恢复；本次最终为 changed 1。

## Gotchas

- 一个 run 可能多次改写同一条记忆；UI 数量对应真实变化的不同条目，具体次数由 run 的 mutations 另外记录。
- 旧版失败记录保留其真实状态。当前版本的成功验收使用本次新 run 证明。
- 本次失败详情使用日常实例的已有真实失败历史；超时和证据保留由隔离 SDK 场景对应的真实 run 证明。
- 后端和组件启停使用 preview.3 的实际证据；preview.4 仅增加 CSS，显示验收分别覆盖 1707、900、480px、长失败文本和空闲状态。
- 状态组件开关和核心插件开关是两个入口；分别记录被操作组件的名称与宿主显示状态。
- 当前本机宿主包含 `dsh-client-modules` 的配置重载事件修复。构建热更新后需要正常发布 `app-boot/config-reload`，才能在独立关闭组件时移除对应浏览器模块。补丁及宿主模块图证据见功能地图。
- 导航后的页面是原生子会话；返回父会话后继续核对输入区结果。
- 本轮 UI 实测进度和最终证据列在 [功能地图](README.md)。
