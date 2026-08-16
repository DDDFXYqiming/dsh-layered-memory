# dsh-plugin-dev-sop

DSH 官方插件开发规范要点（2026-08-13 全量阅读官方教程 + 实战验证）。

## 关键前置
- 官方教程: docs 站 develop/basic（第一个插件/工具/配置/打包）四篇 + reference/cookbook/adding-a-tool
- 插件 = 导出 `name` + `inject` + `apply(ctx)` 的模块；inject 声明依赖服务（tools/skills/systemPrompt/agents/credentials）

## 规范要点
1. **bundle 交付**：package.json 声明 `dsh.bundle.patch: "./cordis.patch.yml"`，包内 cordis.patch.yml 用 `- insert: - id: <id> name: '<包名>'`；安装用 `dsh plugin --profile web add <路径>`（进 profile bundles）
2. **Config schema**：导出 Schemastery `Config`（`Schema.object`），Cordis 加载期校验 + 默认值填充；默认值写进 schema，用户零配置可用
3. **工具**：`defineTool` → parameters（schema 校验 args）/ output.schema（ValueSchemaSpec，execute 返回规范值）/ output.render（转模型内容）/ presentCall（card 渲染意图）
4. **skill**：`ctx.skills.register({name, description, whenToUse, source:'runtime', content})`；加载后按 Agent 挂载工具（渐进暴露）
5. **渐进暴露**：全局只挂轻量 activation 工具；`ctx.on('tools/result')` 检测 skill 调用成功（exec.name==='skill' && arguments.name===<skill名>）→ `agent.ctx.tools.register` 全量工具 + `agent.ctx.tools.restrict({deny:[activation]})` 隐藏激活工具
6. **注入**：`ctx.systemPrompt.context({name, order, text: ()=>string})` 动态上下文每轮求值（记忆注入用）；section 拼 system prompt（order: -100 identity / 0 persona / 100-199 工具）
7. **配置覆盖**：bundle 行在用户 profile 层用**裸条目**覆盖（`- id: <id>` + config），**严禁重复 insert**（duplicate loader entry id 启动崩溃！）
8. **依赖**：peerDependencies 声明 @deepseek-ai/dsh-* 包；本地开发用 link 全局（版本必须对齐，registry rc 版本可能更旧！）

## 典型坑
- insert 同 id = 崩溃（duplicate loader entry id），覆盖必须裸条目
- pnpm link 的虚拟 store 路径随目录移动失效 → 删 node_modules 重装
- 宿主进程启动清空 DSH_* 环境变量 → 用 homedir() 兜底路径
- lib/index.js 改动必须重启宿主才生效（node 不热加载）；scripts/*.py 子进程每次重读，即时生效
