# dsh-plugin-test-sop

# dsh-plugin-test-sop

DSH 插件改动后的自测流程（无需重启 GUI 宿主）。

## 关键前置
- `dsh --profile headless "<任务>"` 存在：一次性任务模式，跑完打印结果退出（C:\Users\<user>\.dsh\profiles\headless，dsh-base + dsh-headless + dsh-layered-memory）
- headless 无 GUI/HTTP，适合验证插件逻辑、注入、工具链路

## 稳定步骤（改插件后按序执行）
1. 语法检查: `node --check lib/index.js` / `python -m py_compile scripts/*.py`
2. mock 测试（不依赖宿主）: 已有 test-memory.mjs / test-exposure.mjs 可直接跑，改插件后必须回归
3. **CLI 自测（替代重启 GUI）**: `dsh --profile headless "调用 skill 加载 <插件skill名>，然后调用 <工具> 验证..."`，观察输出确认逻辑正确
4. 涉及 UI/宿主进程行为的改动才需要重启 web 宿主（12 秒延迟脚本 restart-dsh-host.ps1）

## 典型坑
- lib/index.js 改动只影响新启动的宿主/headless 进程，**已运行的 web 宿主不热加载**（不是 bug）
- headless 是独立 profile，新装的插件要 `dsh plugin --profile headless add <路径>` 才可用
- headless 会话无 GUI 历史，测注入/渐进暴露正好是"全新会话"场景

## 证据
- 2026-08-14 实测: dsh-layered-memory 改 v0.2 后，headless 一跑即验证 skill 加载 + memory_list + memory_read 全链路，全程未重启 web 宿主

> 证据: 本会话实测 dsh --profile headless 完成任务并输出记忆列表/读取内容（CLI 输出可见）；mock 测试 test-memory.mjs 15/15、test-remind.mjs 6/6
