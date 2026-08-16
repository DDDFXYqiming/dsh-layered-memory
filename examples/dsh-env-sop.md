# dsh-env-sop

本机（Windows 11 / AMD）DSH 环境差异清单（2026-08-13 实测）。

## 关键前置
- DSH 全局安装: `C:\Users\<user>\.bun\install\global\node_modules\@deepseek-ai\`
- Web profile: `C:\Users\<user>\.dsh\profiles\web\`（package.json 管理 bundles + link 依赖；cordis.patch.yml 用户层）
- 凭证库: `C:\Users\<user>\.dsh\.credentials.yaml`（DEEPSEEK_API_KEY / VISION_API_KEY）
- 已装自定义插件: dsh-vision-skill（识图 8 工具）+ dsh-layered-memory（记忆 v0.4，命名空间/自动蒸馏/自动维护）
- MCP: anysearch（streamable-http 直连，凭据在 profile patch 的 Authorization 头）

## 环境事实
- 宿主重启: `C:\Users\<user>\.dsh\vision-patch\restart-dsh-host.ps1`（12 秒延迟，动态找 PID，轮询 3080）
- 框架补丁: dsh-host-apiproxy/lib/index.js 2 处 + dsh-llm-deepseek/lib/index.js 2 处（vision-skill patch 标记）
- 视觉模型: MiniMax-M3 @ https://api.minimaxi.com/v1/chat/completions（thinking disabled）
- 插件开发目录: `<Agent_Extensions>\dsh-plugins\{dsh-vision-skill,dsh-layered-memory}`（发布仓库同目录，GitHub: DDDFXYqiming/Agent_Extensions）
- 重启任务名曾用: dsh-vision-patch-restart（脚本自己清理）

## 典型坑
- 覆盖 bundle 配置用裸条目，禁重复 insert（duplicate loader entry id）
- pnpm link 版本必须对齐全局（registry rc 更旧）
- 改 lib/index.js 需重启；改 scripts/*.py 即时生效
