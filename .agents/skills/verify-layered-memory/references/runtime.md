# 本机运行命令

## 环境与构建

Windows 命令入口为 Git Bash `E:/Git/bin/bash.exe`。下面的运行命令在 WSL 的 `bash` 中执行，Windows 调用形式为：

```bash
MSYS_NO_PATHCONV=1 wsl.exe -d Ubuntu-24.04-Hermes -u openclaw --exec bash -lc '<WSL命令>'
```

项目构建：

```bash
cd /mnt/d/AI_Projects/dsh-layered-memory
npm run build
```

本次实际运行位置：

```bash
export DSH_HOME=/home/openclaw/.dsh-memory-repair-20261022
export DSH_MEMORY_VERIFY_DIR=/mnt/d/AI_Projects/dsh-memory-repair-20261022/e2e
export DSH_MEMORY_VERIFY_PORT=3082
node /mnt/d/AI_Projects/dsh-layered-memory/.agents/skills/verify-layered-memory/scripts/setup.mjs
```

后续运行替换为新的 `DSH_HOME` 与 `DSH_MEMORY_VERIFY_DIR`；`setup.mjs` 会建立 workspace、memory、sessions、logs 和两个 profile，并保存不含密钥的 `environment.json`。

## Web 启动

```bash
cd "$DSH_MEMORY_VERIFY_DIR/workspace"
nohup env DSH_HOME="$DSH_HOME" DSH_TELEMETRY_DISABLED=1 \
  /usr/local/bin/node --expose-internals \
  /home/openclaw/apps/deepseek-harness/node_modules/@deepseek-ai/dsh/lib/bin.js \
  --profile memory-repair-web --host 127.0.0.1 --port "$DSH_MEMORY_VERIFY_PORT" --no-open \
  > "$DSH_MEMORY_VERIFY_DIR/logs/web.log" 2>&1 < /dev/null &
echo $! > "$DSH_MEMORY_VERIFY_DIR/web.pid"
```

浏览器使用此 Web 启动生成的本机登录链接完成授权，再访问本次地址。登录链接留在本地；交付证据选取插件日志与页面状态。

## Doctor

```bash
cat "$DSH_MEMORY_VERIFY_DIR/environment.json"
cat "$DSH_MEMORY_VERIFY_DIR/web.pid"
ss -ltnp '( sport = :3082 )'
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3082/
rg '^\[dsh-layered-memory\]' "$DSH_MEMORY_VERIFY_DIR/logs/web.log"
readlink -f "$DSH_HOME/profiles/memory-repair-web/node_modules/@dsh-external/dsh-layered-memory"
readlink -f "$DSH_HOME/profiles/memory-repair-web/node_modules/@dsh-external/dsh-layered-memory-status"
```

本次目标版本与源码位置应出现在插件加载行。`memory-repair-web` 和 `memory-repair-sdk` 的 `cordis.patch.yml` 应指向本次独立 memory/session/workspace。

本机已安装宿主另含 `dsh-client-modules` 的配置重载事件修复。原问题出现在 `npm run build` 热更新后再关闭状态组件：宿主模块图没有及时移除该组件。修复使热更新后的配置重载正常发出 `app-boot/config-reload`。本次补丁保存在 `/mnt/d/AI_Projects/dsh-memory-repair-20261022/host-patch/dsh-client-modules-config-reload.diff`。更换宿主版本后按状态 UI 流程重新执行“保持页面打开→构建→独立关闭→重新启用”，以实际宿主模块图和页面结果确认。

## 日常宿主正式包安装

最终日常正式包为：

```text
/mnt/d/AI_Projects/dsh-memory-repair-20261022/dsh-external-dsh-layered-memory-0.10.0-preview.4.tgz
```

日常 `http://127.0.0.1:3081` 先通过官方插件管理器的 `/api/pluginManager/removeBundle`、`/api/pluginManager/installBundle` 安装 preview.3，随后官方热装 preview.4。安装输入沿用当前宿主公布的接口字段，保存安装和 bundle list 回执。preview.3 的移除/安装均为 `application=applied`、`warnings=[]`，enabled/installed 均为 true；preview.4 热装同样 applied、warnings=[]。

日常日志 `/home/openclaw/.dsh/logs/wsl-service-console.log` 分别确认 preview.3 加载于 `2026-10-22T06:54:21.701Z`、preview.4 加载于 `2026-10-22T07:01:20.169Z`。preview.4 热装期间 PID `33081` 不变。Chrome 原会话可正常回复，并可查看已整理状态和历史失败的具体原因。

本次部署证据位于任务目录的 `daily-preview3-install.json`、`daily-preview3-bundle.json`、`daily-preview4-install.json`、`daily-preview4-bundle.json`、`daily-preview4-loaded.txt`、`deployment.md` 和 `host-patch/daily-after-restart.json`。日常宿主使用 `0.2.1-rc.2 / 332895e`，包含前述配置重载事件补丁；其重启沿用该机器原有启动链。

preview.3 的后端 E2E 和组件启停记录保持原样。preview.4 额外变更仅为 CSS，其内容宽度、空闲零占位和 1707/900/480px 响应式结果见 `layout-preview4.json` 及同名前缀截图。最终页面为 `daily-final-preview4.png`，已恢复 1707px 视口并返回原会话。

## SDK 驱动

```bash
node /mnt/d/AI_Projects/dsh-layered-memory/.agents/skills/verify-layered-memory/scripts/sdk-run.mjs \
  "$DSH_MEMORY_VERIFY_DIR/frequency.scenario.json"
```

驱动器使用实际 DSH SDK profile 的 `initialize`、`session/prompt`、`session/wait`、`shutdown`。场景中的 `output` 指定输出前缀。需要观察后台核对的步骤设置 `maintenance:true`，完成通知会保存子会话身份及终止原因。

新一轮场景继续使用相同 JSON 形状，替换专用会话 ID、patch 和数据路径。`patch` 指向场景自己的 layered-memory 配置，正常频率配置为 6 条新证据、30 分钟冷却；按功能文件选择要触发的回合。

## 只读结果核验

```bash
rg '^\[dsh-layered-memory\]' "$DSH_MEMORY_VERIFY_DIR/logs/"*.stderr.log
cat "$DSH_MEMORY_VERIFY_DIR/logs/frequency.steps.json"
cat "$DSH_MEMORY_VERIFY_DIR/logs/frequency.summary.json"
cat "$DSH_MEMORY_VERIFY_DIR/memory/frequency-e2e/turn-review-state.json"
cat "$DSH_MEMORY_VERIFY_DIR/memory/frequency-e2e/maintenance-runs.json"
```

检查实际 facts/SOP 正文和来源事件。失败场景记录异常原因、真实部分变更与待处理证据；UI 展示结果引用同一 run ID。

## 精确清理

读取 `web.pid` 后核对 `/proc/<PID>/cmdline` 与当前 profile；向该 PID 发送 `kill -TERM <PID>`。SDK 进程由驱动器发 `shutdown` 退出。确认本次 Web 监听消失，再移除独立 home 中的 `.credentials.yaml` 与 `.env`。保留本次日志、场景配置、记忆正文与会话供复查。
