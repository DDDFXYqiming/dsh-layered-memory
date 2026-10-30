# 开发与端到端验收

`lib/index.js` 转发 `src/index.js`，源码即交付物。修改后先构建并检查语法与发布文件。

```bash
npm run build
npm pack --dry-run
```

发布包包含源码、模板和文档。构建脚本 `scripts/build.mjs` 会生成自包含的记忆状态子包 `lib/status/`，并物化主包专用的 bundled 依赖目录，`npm pack` 的 `prepack` 执行同一构建。状态组件使用独立裸包名 `@dsh-external/dsh-layered-memory-status`，供宿主客户端发现器解析。`scripts/build.mjs` 把 `src/status.js`、`src/status-contract.js`、`client/status.js`、`client/browser.js` 和 `client/status.css`、`client/browser.css` 一起打进 `lib/status/`：`lib/status/index.js` 是宿主侧入口，`lib/status/status-contract.js` 是契约，`lib/status/client.js` 同时包含状态面板与记忆管理页两套客户端。包版本从 `package.json` 读取，实际宿主的启动日志记录版本、路径、记忆根和运行模式。

## 载入真实宿主

从 GitHub 新装时同时传入主包和状态子包两条直接依赖 spec，或将本地仓库与 `lib/status` 分别链接到目标 profile，也可通过宿主的 `pluginManager/removeBundle` 与 `pluginManager/installBundle` 接口热装打包生成的 `.tgz`。使用 Desktop 随附的 CLI 管理 desktop profile，避免系统上另一份 CLI 的版本与模块解析差异。

配置热更新和源码热更新是两条路径。对链接开发仓库可设置以下源码监视根。

```yaml
- id: hmr
  config:
    root:
      - /path/to/dsh-layered-memory
```

路径使用仓库真实位置。确认宿主出现模块重载记录和正确插件版本，再开始验收。重载会重新安装作用域工具，已有会话可再次加载 `memory` 技能或调用 `memory_activate`。

DSH 的客户端模块声明缓存在服务进程中。安装或修复状态子包后，若组件显示已启用而网页的前端模块清单仍缺少它，应等运行中的任务结束后重启 DSH，再刷新网页。验收时同时打开有维护记录和无维护记录的会话：后者也应显示可点击的“记忆待命”，并能查看空记录面板。

状态入口与浮层的样式参照官方 `ui-chat` 的 `StatsPills.module.css` 和 `stat-dialog.module.css`，颜色、圆角与阴影使用宿主主题变量。按钮、分段切换及定位使用宿主共享的 `@deepseek-ai/dsh-client-ui-primitives`，通过 Web 模块表复用，不打包另一份 React 或控件库。

展示验收须实际打开浮层并查看截图。分别检查宽、窄视口与明暗主题，调整窗口后浮层应继续位于入口上方，保持约 8px 间隔与至少 12px 水平边距；同时检查关闭、重新打开、Escape、点击外部及会话切换后的定位。与官方 Token 用量浮层对比字体、圆角、背景及阴影，并覆盖空记录、已有记录与维护历史。

## 样式

状态面板样式在 `client/status.css`，记忆管理页样式在 `client/browser.css`。管理页里 `.lm-usage-*` 是索引占用样式。

## 验收环境

维护调度与会话复用在真实旧长会话的完整副本中验收，复制会话日志、关联子会话、附件对象和记忆数据，并配置独立的 profile、存储域与 `memoryDir`。普通条目操作可使用该环境中的专用空间。并发和多工作区场景使用同一安装随附的 headless 或 SDK 入口，复用相同真实模型和插件源码。

```bash
dsh --profile memory-e2e --from-default-profile headless --dump-config
# 配置好专用 profile 后，后续场景直接运行该 profile。
dsh --profile memory-e2e --patch ./memory-e2e.patch.yml --json - < scenario.txt
```

验收 profile 需在自己的 bundles 中启用此插件与状态子包。overlay 指定专用记忆目录，避免把合成样本混入日常知识库。

## 核心流程

1. 新会话激活常用工具，按需升级管理工具，只读子代理保持只读。
2. 同标题 fact 与 SOP 各自创建并通过 entry 读取，含标点的 SOP 从搜索返回值直接更新。
3. `foo` 与 `foo-bar` 各有多个版本，按 `snapshot_id` 恢复正确条目，恢复前的版本仍可再恢复。
4. 归档、包含归档检索、归档全文读取、取消归档，正文与 meta 状态一致。
5. 含 `{{模板括号}}` 的条目进入 L1，下一轮能够继续执行。
6. 长文按 `next_line` 读取无遗漏，尾页不是完整读取，`full: true` 是完整读取，越界明确失败。
7. 项目经验提升后在另一项目的 global 视图可发现，两个同名不同路径项目隔离。
8. PTC 验证与写入后展开来源，定位真实子调用的结果事件。
9. 两个实际宿主并发修改同一空间，正文、元数据、历史与索引均保留所有已完成操作。
10. 候选接受与丢弃、损坏 meta、历史快照写入失败、旧库迁移分别观察真实返回与磁盘结果。
11. `notify` 和 `auto` 模式分别观察可行动事项、真实子会话、完整读取资格、预算、usage 与结束状态。
12. 恢复日常配置，读取现有条目，确认已载入的版本与实际行为。

## 主动维护验收

收尾调度的主验收使用已有多轮旧会话的隔离副本，保留真实记忆、待办及自动配置，连续完成实际工程任务。重复读取时积累保持不变，至少三个有效回合均在32条窗口中保留代表证据，已显式保存的来源从积累剔除。结合真实 `admission` 日志与派发记录跨过30分钟共享窗口，确认同回合只派发一次，普通问答在窗口到期后仍需新证据。失败的工具调用不计入有效证据，`memory_review` 拒绝引用失败调用；维护超时或延期时保留待处理证据并释放认领。核对写入引用父会话验证事件，主会话回合数对应真实用户请求数。分别验证新增和更新条目按宿主回执成功结案，以及维护自身写入后普通变更台账保持原值。

`notify` 场景保持索引压力待办存在，核对无关记忆写入后的待办身份保持稳定，并确认主会话没有自动执行请求。生产 `reflectionMode: auto` 验收按作业归属与实际检查点观察分批续跑、同空间共享冷却及资源释放。补充的条目整理覆盖可使用专用记忆空间，准备超过注入预算、词面相似度不足以触发扫描的目录，观察存量维护会话是否浏览目录、完整读取候选并保存处置理由。降低写入预算观察未完成进度，原来源会话有新工作且共享冷却到期后继续；审完仍超限的空间应保持已完成。

连续多轮验证使用同一个旧长会话副本，观察真实维护记录及两个固定 worker 的 session ID。任务通过正式 Web UI 发起，覆盖自动派发、显式整理、停止、再次恢复及重启；按本次 run 的事件边界核对完成工具、PTC 外层回执、usage 与资源释放。热应用后读取 `memory_stats.runtime`，核对版本、加载时间、路径和模式。隔离 profile 使用独立 memory、sessions 与存储域，收尾停止专用进程并检查端口。

复用压力阶段可临时将隔离 profile 的冷却调至 1 分钟，保留证据门槛并重复执行真实任务。报告分别记录默认 30 分钟阶段与压力阶段的参数、运行 ID、worker ID 和时间，结束后恢复 30 分钟并重启确认持久化状态。

## Web 状态组件验收

在宿主页面验证主包包含“分层记忆”与“记忆状态”两个可独立启停的组件。点击紧凑状态行打开插件详情浮层，查看当前阶段、两个固定会话、只读历史和运行记录；真实运行时验证停止与再次恢复。覆盖零变更完成、等待证据、延期及实际错误。状态区按内容占宽，尚无记录时保留可点击的待命入口；宽窄视口下浮层均可用，主会话的正常回答和历史阅读位置保持稳定。切换会话核对归属，关闭组件后确认槽位移除且核心记忆工具继续可用。

插件入口、依赖声明和清理遵循[官方插件教程](https://deepseek-harness.github.io/deepseek-harness/develop/basic/)、[服务与依赖](https://deepseek-harness.github.io/deepseek-harness/develop/framework/service)及[打包指南](https://deepseek-harness.github.io/deepseek-harness/develop/basic/publish)。发布验收安装预构建 tarball，检查 bundle 与状态子包版本一致，并使用官方原版宿主确认公开 API 的实际调用。

## Web 记忆管理页验收

改过 `client/` 后必须重建状态子包，否则页面加载的仍是旧产物。

```bash
node scripts/build.mjs
```

构建后刷新宿主页面，从侧栏打开“记忆”页。

页内逐项实测：

- 命名空间切换后列表、详情与索引占用一起刷新。
- 搜索按标题或正文过滤，清空后恢复全量。
- 类型过滤在“全部”“事实”“经验”之间切换。
- “显示已归档”开关打开后归档条目进入列表。
- 详情编辑保存后正文更新；用过期版本保存时报冲突，并提示重新加载。
- 新建条目填写命名空间、类型、标题、正文与证据后创建成功。
- 历史快照可预览正文，回滚需要二次确认。
- 索引占用常态只显示一行总览：已用百分比、分段细条、已用与预算字符数、展开箭头。点击展开后显示四段明细与各自字符数。悬停某段出气泡，说明该段含义、条数与占已用比例，其余段与图例项联动淡化。

索引占用的预算口径按命名空间核对：`default` 空间用 `globalL1MaxChars`，项目空间用 `l1MaxChars`。

界面文案随宿主语言变化。语言在宿主设置里改，改 profile 的 locale 配置不生效。切一次语言后确认侧栏入口名称与“记忆”页文案变为当前语言，条目类型显示为“事实”“经验”或 Fact、Skill，索引占用的图例标签同步变化。

## 保存证据

记录操作结果、宿主输出、session id、工具调用 id 和对应磁盘文件。解析已经产生的真实会话日志可执行以下命令。

```bash
npm run e2e:report -- /absolute/path/session.v4.jsonl.zstd
```

命令在原文件旁生成 `.memory-e2e.json`，列出该会话的 memory 调用、结果、错误和结束状态。预期失败场景需要结合其具体错误与旧内容是否保留判断，不能仅用错误总数判定通过。

## 发布

更新 `package.json`、`CHANGELOG.md` 和工具说明，执行 `npm run build` 生成最新状态子包，完成真实宿主验收并保存报告，再提交发布。源码语法和包内容检查在 CI 执行。
