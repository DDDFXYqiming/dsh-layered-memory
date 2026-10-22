---
name: verify-layered-memory
description: 在本机 WSL 的真实 DSH Web 与 SDK 宿主中验收 layered-memory，包括主动收尾核对、证据去重与冷却、失败保留、输入区状态和原生子会话详情。
---

# Layered memory 实际宿主验收

用于修改记忆核对、维护记录、工具激活或输入区状态组件后的验收。运行链路为本机已安装的 DSH、已配置的真实模型、插件源码与生成的状态子包，以及独立的记忆库、会话库和工作目录。

先读 [功能地图](features/README.md)，再选相应流程。一次运行共用独立 Web/SDK 配置；SDK 串行驱动，浏览器负责页面交互。2026-10-22 的后端和组件启停证据为 preview.3；最终日常部署和紧凑布局证据为 preview.4。

## Launch

1. 在项目根目录执行 `npm run build`，生成 `lib/status`。
2. 按 [运行命令](references/runtime.md) 创建独立的 `DSH_HOME` 与证据目录，执行 `scripts/setup.mjs`。脚本从已安装宿主取得依赖，从本机既有配置取得模型路由和私有凭据，建立 `memory-repair-web`、`memory-repair-sdk` 两个 profile。
3. 启动 Web，记录 `web.pid` 与 `logs/web.log`。本次已验证端口为 `3082`；首页可访问且日志显示当前插件版本后进入页面。

准备交付的包另通过日常宿主的官方插件管理器完成安装验收。源码链接和正式 tgz 安装分别记录；本次日常目标为 `3081`，步骤见 [运行命令](references/runtime.md)。

## Doctor

读取本次 `environment.json`；核对 PID 命令行的独立 `DSH_HOME`、profile、端口与工作目录。查看两份 profile 中的插件链接及 memory/session 配置。以插件加载日志和页面实际结果确认运行目标。

完整命令及登录方式见 [运行命令](references/runtime.md)。

## Drive

- [主动核对](features/turn-review.md)：真实 SDK RPC 驱动用户回合，观察维护子代理、写入结果、证据状态与冷却。
- [状态 UI](features/status-ui.md)：真实 Web 页面观察单行状态、详情、会话切换和组件开关，再核对按内容取宽、空闲零占位及宽窄视口的省略行为。

SDK 使用随技能保存的 `scripts/sdk-run.mjs`。场景 JSON 指定 `id`、`cwd`、`patch`、`output`、`stateFile` 和 `steps`；每一步的 `prompt` 是本次验证动作，`maintenance:true` 表示等待真实维护子代理结束。驱动器保存 JSON-RPC、stderr、每步状态和最终摘要，退出时通过 `shutdown` 释放专用 SDK。

## Evidence

保留启动配置、模型路由、会话 ID、真实维护记录和证据状态。UI 同时保存可访问树和截图；出现失败时对应到该次维护记录的原因与子会话。

本次实际结果及证据索引见 [功能地图](features/README.md)。记录所驱动入口；SDK、Web、安装三个入口分别说明观察结果。

## Cleanup

由本次 `web.pid` 确认 Web 进程身份后，对该具体 PID 发 `SIGTERM`。SDK 驱动器自行关闭其子进程。保留证据目录、独立记忆库和会话库；结束后移除独立 `DSH_HOME` 内复制的私有凭据及代理环境文件。每轮重新验收使用新的运行目录与 `DSH_HOME`。
