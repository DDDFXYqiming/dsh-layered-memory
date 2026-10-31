# 设计与数据流程

## 存储和身份

rule 位于 `rules.md` 的管理段，fact 位于 `facts.md` 的二级标题段，SOP 位于 `sops/*.md`。显示标题与条目定位分开，所有工具交换 `{namespace, kind, key}`。同名不同类型、带标点的标题和不同空间都有独立身份。

全局空间为 `default`。项目空间使用宿主归一化工作区或规范化路径的持久映射，分支共享项目知识。旧的 basename 空间通过显式迁移关联，迁移保留来源。

## 上下文

L1 在磁盘上保存全量活跃目录。动态上下文将项目和 global 分配独立字符预算，折叠条目和规则视图时保留完整内容的读取入口。

宿主 `systemPrompt.variable` 提供文本，context 只引用固定变量，正文不会被再次当模板解析。宿主比较内容快照，相同内容不重复追加。L0 和 runtime skill 使用同一份核心规则模板。

## 索引占用的来源与口径

服务端从磁盘上的 `index.txt` 统计占用，不另存一份计数。`src/l1index.js` 导出 `sections(text)` 与 `indexStats(root, budgetChars)`。

`sections(text)` 按 `<!-- AUTO-BEGIN -->` 与 `<!-- AUTO-END -->` 标记把索引切成三段：标记之前是头部说明，中间是自动目录段，标记之后是规则段。

`indexStats` 在自动目录段里取以 `[L2]` 开头的一行和以 `[L3]` 开头的一行，连同头部说明和规则段，给出四段字符数。

- `headChars`：头部说明的长度。
- `rulesChars`：规则段的长度，含 `[RULES]` 标记行。
- `factsChars`：`[L2]` 事实目录行的整行长度。
- `sopsChars`：`[L3]` 经验目录行的整行长度。

`indexChars` 是 `index.txt` 全文长度，换行统一为 `\n` 后去掉尾部空白。四段之和与 `indexChars` 有差，差值来自 `AUTO` 标记行与换行。`rulesLines` 是规则段行数，`ruleCount`、`factCount` 与 `sopCount` 分别是活跃规则、事实与经验条目数。

预算按命名空间取，与注入预算一致。`src/store-service.js` 的 `namespaceStats({ namespace })` 对 `default` 空间取 `cfg.globalL1MaxChars`，其余命名空间取 `cfg.l1MaxChars`，缺省分别是 2048 与 12288。注入侧 `src/l1index.js` 的 `buildCombinedPromptIndex` 对 `default` 空间用 `globalMaxChars`，对项目空间用 `projectMaxChars`，取值同为这两个配置项。

磁盘上的 `index.txt` 始终是完整的活跃目录，占用视图只统计，不裁剪它。裁剪只发生在注入到提示词的那份视图：超出预算时规则段先取额度，其余额度分给条目，条目按热度排序取用，冷条目另留固定比例的探索额度，仍不足的较早条目被省略，视图尾部写明省略。

远程方法在 `src/status-contract.js` 用 `parseNamespaceStats` 解析，注册为 `storeDescriptor("namespaceStats", parseNamespaceStats, parseNamespaceInput)`；`src/status.js` 代理同名方法。返回字段为 `namespace`、`indexChars`、`budgetChars`、`headChars`、`rulesChars`、`factsChars`、`sopsChars`、`rulesLines`、`ruleCount`、`factCount`、`sopCount`，缺字段或类型不符按 0 处理。

## 修改与恢复

同一命名空间的正文、meta、索引和历史修改使用同一个写入口和互斥协议。锁只在文件提交期间持有，不跨模型思考。跨空间操作按稳定顺序获得锁。

历史明确记录条目身份、快照 id、正文、元数据和生成时间。更新、归档、恢复前保存当前版本，历史失败直接中止修改。恢复按快照 id 进行，避免前缀或文件名字典序推断。

读取错误直接报告，元数据存在但不可解析时不会被当空库写回。只读工具不执行初始化或迁移。管理入口可修复遗留元数据和归档状态，并记录迁移结果。

## 规则迁移与投影

规则、事实和经验共用条目身份、写入、历史与维护流程。规则正文由 `rules.md` 持有，索引的 `[RULES]` 段是活跃规则的完整正文投影，仍计入同一个 L1 字符预算。规则不进入事实或经验的标题目录，也不参与热度召回。

空间初始化时，若尚无 `rules.md`，从旧索引按顶层列表逐条迁入规则并保留续行与前言；没有列表的旧段整体保留。迁移沿用已有来源信息，缺失来源时保持缺失。迁移后以规则正文为准生成索引。单条使用 `kind:"rule"`，整层兼容视图使用 `kind:"rules"`。

## 来源

新证据关联真实调用 id、session 和 seq，旧式 `code-dispatch`、新式 `ptc-dispatch` 和普通 `tool/result` 均可追溯。工具调用的失败状态根据宿主 `message.isError` 与进程退出码判定，失败调用不进入有效证据。证据版本与正文版本一起保存。纯措辞更新可以沿用原来源，提供新验证证据则更新整个来源组。

`memory_expand` 使用宿主 `sessionQuery` 的事件窗口和文本提取接口。记录的是验证事件，不能把一个会话里所有工具结果都等同于当前条目的证据。`memory_review` 从当前会话的成功验证调用提取脱敏证据片段，登记待复核的新旧事实冲突。

## 检索与维护

一次扫描解析规则、事实并收集 SOP 文档。BM25 处理检索，成对内容比较一次计算后分别产生一致、近重复及合并候选。相似度本身不决定归档。

程序维护仅自动合并同名同内容段，其他问题归入 `actionable` 清单。fact 冲突、跨条目重复和待确认候选共享同一状态判断，冷条目仅提供复核线索。

主模型在任务中自然查阅和更新笔记。每个正常主回合结束后先检查空间并尝试存量批整理，再检查父会话证据并尝试任务收尾核对。批整理已派发的回合继续积累核对证据。两条路径共用空间级运行锁和默认 30 分钟冷却。收尾核对按父会话与命名空间积累成功工具证据的指纹并去重，剔除已绑定来源写入记忆的调用；默认积累 6 条未处理证据作为一个批次，单个已完成用户回合也可满足。当前回合带来新证据且共享冷却到期后，将有界摘要及精确父来源交给固定核对会话。派发冷却与证据消费分离，完整结束后消费该批证据，失败、超时或延期时保留待处理证据。

`notify` 模式将可行动事项保存在状态台账中供工具查询；`auto` 模式在每个正常主回合扫描空间，将可行动事项或索引压力交给当前父会话的固定整理会话。压力超过目标水位的 1.02 倍时启动作业，默认约为预算的 91.8%，启动后持续整理到目标水位 90% 以下。作业按空间认领，相同 workIds 或 pendingNames 的批整理可由其他会话继续，检查点仅记录处理进度。

批整理失败、超时、延期或零进展后持久保存有限指数退避，30 分钟起、最长 6 小时；用户停止只结束本次运行，保存 30 分钟的有限等待。空间内容版本变化或实际进展会清除连续退避，共享派发冷却继续保留。新的作业身份沿用空间重试状态。整理模型可成对显式配置 provider 与 model，缺省沿用当前父会话模型；核对模型每次从父会话解析。模型工作与文件提交分离。修改已有条目前必须完整读取同一版本（包含类型、空间、条目 key 和 revision，读取尾页不算完整读取），新建条目可直接创建，结案版本由实际读写记录推导。

`maintenance-workers` 使用公开存储域按父会话保存两个槽位，身份不随 namespace、cwd 或 memoryDir 改变。首次通过公开 `agents.create` 建立独立上下文，以后 `agents.resume` 恢复原 ID；setup 为本次运行安装模型选择、请求输出上限和工具作用域。完成工具调用公开 `concludeTurn`，执行器等待成功权威回执、正常 turn end、idle 和持久化后结案。PTC 的内部完成还需等待外层调用成功。每次释放 Agent handle，保留会话与审阅进度，读取资格、预算和 usage 按本次 run 单独计算。需要正文的证据通过公开 sessionQuery 按白名单事件补读，跨会话接续仍按真实 `sourceSession` 和 seq 建立来源访问范围；turn_review 的证据与接续继续限定在原父会话。历史压缩保留 session ID。

## 工具与状态组件

基础 `memory_search/list/read/write/update` 随会话提供。`common` 补充状态与冲突登记，`manage` 补充历史、归档、候选和迁移。`memory_activate` 和历史激活只选择工具模式，不保存模型自设权限。读写权限仅来自用户配置 `memoryAccess`、`subagentMemoryAccess`，子代理默认 `read`。自动维护使用专用激活入口，沿用配置中的调用、写入和时间预算。

核心插件通过 `layeredMemoryActivity` 服务发布当前运行阶段与维护结果，通过父会话限定的 worker facade 提供固定槽位、分页历史和停止操作。独立的状态子包通过 `typert` 读取这些能力，在 `conversation.composer.dock` 单行展示进度、真实变更数及未完成原因。点击展开插件浮层，主对话位置保持稳定；历史只投影维护回复、工具和实际错误。活动快照的 `reflection` 数组按空间投影 `reflection-state.json` 中的 `nextEligibleAt`、`retryCount`、`retryReason`，详情运行记录页显示最早重试时间、连续退避次数和原因。运行记录仍按父会话过滤，空间重试状态则在同空间会话间共享；打开详情通过既有 `getSnapshot` 刷新持久状态。已有原生 catalog 历史保留，新维护执行不再按次数新增菜单项。

## 界面本地化

客户端文案集中在词典里，注册到宿主的 locale 服务。`client/browser.js` 用 `scope.locale.register("layered-memory", dictionaries)` 注册记忆管理页词典，`client/status.js` 用 `scope.locale.register("layered-memory-status", dictionaries)` 注册状态面板词典。

词典覆盖 zh、en、ja、es、fr、de、ru、pt 八种语言，状态详情的重试时间、次数与原因沿用同一套本地化入口。

侧栏入口名称按当前语言取。`client/browser.js` 注册 `sidebar.panellist` 槽位时把 `label` 写成 `scope.locale.translate(locale, "title")`。槽位注册带 `locale` 字段，组件内用 `t(key)` 取当前语言的文案。

条目类型在界面按语言显示，数据键不变。数据层使用 `rule`、`fact` 与 `sop`，界面文案取 `kind.rule`、`kind.fact` 与 `kind.sop`，中文为“规则”“事实”“经验”，英文为 Rule、Fact、Skill。索引占用的图例标签同样本地化，取 `usage.label.head`、`usage.label.rules`、`usage.label.facts`、`usage.label.sops`。
