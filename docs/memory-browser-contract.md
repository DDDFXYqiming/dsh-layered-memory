# 记忆管理页 · 前后端接口契约

本文描述记忆管理页与服务端之间的数据通道、索引占用组件的行为和页面要求。文中每条约束都对应仓库里的实现。

## 落地位置

- 管理页做进 status 子包 @dsh-external/dsh-layered-memory-status：
  - 客户端 client/browser.js，样式 client/browser.css
  - 图谱视图独立成模块 client/graph-view.js，样式 client/graph-view.css
  - 客户端运行时入口 client/ui-runtime-entry.js，第三方组件源码 client/vendor/
  - 服务端通道 src/status.js、src/status-contract.js，存储操作 src/store-service.js
  - 索引切分与统计 src/l1index.js
- 构建：node scripts/build.mjs，把服务端通道、client/status.js、client/browser.js、client/graph-view.js、客户端运行时包与样式组装进 lib/status/
- 当前规则条目接口适用于 0.11.0 起的版本

## 客户端运行时

视图工厂从构建产物拿到同一个 `runtime` 对象，宿主注入的模块与第三方运行时都从这里走：

- `createMemoryBrowserClient(require, styles, runtime)`：第三个参数是运行时，缺省时视图退回自身的降级实现
- `createMemoryGraphView(require, runtime)`：图谱视图工厂，由构建装配到 `runtime.graphView`
- runtime 的字段：
  - `React`、`ui`：宿主注入的 React 与 @deepseek-ai/dsh-client-ui-primitives，与产物内不重复打包
  - `motion`、`AnimatePresence`、`useReducedMotion` 等：动画运行时
  - `d3`：图谱用的图渲染库，在构建时装载于模块工厂内的局部作用域
  - `components`：数据表、图表、滚动进度、页签等视图组件
  - `reducedMotion()`：是否处于降低动效偏好
  - `graphView`、`styles`：图谱视图组件与它的样式文本

第三方组件的来源、许可证与改编范围见 docs/component-sources.md；图谱链路见 docs/graph-components.md。

## 服务端 → 前端数据通道

- 主包提供服务 layeredMemoryStore（src/store-service.js）
- status 子包 src/status.js 的 inject 含 layeredMemoryStore，typert.register 的 invocations 含 STORE_REMOTE.descriptors
- 前端经 remote.layeredMemoryStatus 调用下面 12 个方法，与 status 现有 invocations 同一通道

## 方法签名

全部 async，参数与返回都是 JSON 可序列化。
entry 标识统一为 { namespace: string, kind: "rule"|"fact"|"sop", key: string }。

1. listNamespaces() → Array<{ namespace: string, workspace: string|null }>
   - 当前空间排最前，default 其次，其余按名字排序

2. namespaceStats({ namespace }) → { namespace, indexChars, budgetChars, headChars, rulesChars, factsChars, sopsChars, rulesLines, ruleCount, factCount, sopCount }
   - namespace 必填
   - 统计对象是该命名空间的 index.txt，也就是注入提示词的那份 L1 索引。磁盘索引保留完整活跃目录与规则正文投影，ruleCount来自活跃规则条目，统计只读不写
   - 字段含义：
     - namespace：命名空间名
     - indexChars：index.txt 归一化后的字符数（换行统一为 \n，去掉尾部空白）
     - budgetChars：该命名空间的注入预算字符数
     - headChars：头部说明段字符数
     - rulesChars：规则段字符数
     - factsChars：[L2] 事实目录整行字符数
     - sopsChars：[L3] 经验目录整行字符数
     - rulesLines：规则段行数
     - ruleCount：活跃规则条目数
     - factCount：事实目录里列出的条目数
     - sopCount：经验目录里列出的条目数
   - 预算口径：命名空间是 default 时取 cfg.globalL1MaxChars，其余取 cfg.l1MaxChars，与注入预算一致。src/apply.js 的 schema 里 l1MaxChars 默认取 L1_MAX_CHARS_DEFAULT（src/l1index.js 里是 12288），globalL1MaxChars 默认 2048
   - 四段划分：src/l1index.js 的 sections() 按 AUTO_BEGIN、AUTO_END 标记切出头部说明段与规则段；AUTO 段里的 [L2]、[L3] 目录行各算一段
   - 解析容错：缺字段或类型不符按 0 处理（src/status-contract.js 的 parseNamespaceStats），旧服务端数据不会让面板报错

3. listEntries({ namespace, kind?, query?, includeArchived? }) → Array<{ entry, title, archived, updatedAt, chars }>
   - kind 省略 = 全部；接受 rule、fact 或 sop
   - query 省略 = 不过滤；大小写不敏感子串，匹配标题与正文
   - includeArchived 为 false 时过滤掉已归档条目
   - 按 updatedAt 降序；没有日期的排在后面，同组按标题排序
   - 上限 500 条
   - 每行还带展示用扩展字段：heat（热度分）、accessCount（访问次数）、lastAt（最近访问时间）、related（关联条目 {kind,key}[]）、relatedCount、summary（正文首行摘要，≤90 字符）、rank（注入排名，null 表示未排名）、injectionStatus（archived / rule / cold / hot）

4. readEntry({ entry }) → { entry, title, content, revision, archived, evidence, sourceSession, createdAt, updatedAt }
   - evidence 是字符串，空串表示没有证据
   - sourceSession、createdAt、updatedAt 可为 null
   - 详情页展示用扩展字段：heat、accessCount、lastAt、related（{kind,key}[]）、sourceSeqs

5. createEntry({ namespace, kind, topic, content, evidence }) → { entry, revision }
   - 走 writeMemory 的 create 模式，写入后重建索引

6. updateEntry({ entry, content, evidence?, ifRevision? }) → { revision }
   - ifRevision 提供且与当前 revision 不一致时报错，错误消息含 revision_conflict
   - evidence 省略 = 沿用原来源

7. setArchived({ entry, archived: boolean }) → { ok: true }
   - 归档前先存一份历史快照，快照路径记在 meta.archivedFrom
   - 归档后重建索引

8. entryHistory({ entry }) → Array<{ snapshotId, createdAt, revision, chars, summary, preview, change }>
   - change 是 { contentDelta: number|null, evidenceChanged: boolean, initial: boolean }
   - contentDelta 是与上一版快照的字符数差；initial 为 true 表示这是初始版本
   - summary 取正文第一行的前 60 字符，preview 取正文前 2000 字符
   - 按时间降序，上限 50

9. rollbackEntry({ entry, snapshotId }) → { revision }
   - 用指定快照恢复条目内容并重建索引
   - 快照不属于该条目时报错

### 只读视图接口（10-12）

这三个方法只读不写，返回对象整体透传给前端，字段缺失时前端按 0 或空值兜底。

10. getInjectionState({ namespace }) → { namespace, combinedText, sections, budgetChars, indexChars, targetChars, triggerChars, coldCount, rankedCount, omittedCount, includedCount, items }
    - items 是当前命名空间全部活跃条目，每项 { kind, key, title, chars, heat, rank, status, relatedCount }
    - status 表示真实注入结果：rule（规则常驻）、included（已进入提示词）、cold（冷探索命中注入）、omitted（预算裁剪未进提示词）
    - combinedText 是合并后真正注入的提示词原文，供注入透视视图逐字展示

11. getDiskMetrics({ namespace }) → { namespace, rules, facts, sops, archived, pending, size_bytes, content_bytes, history_bytes, pending_bytes, metadata_bytes, updatedAt, ...索引统计字段 }
    - 字节口径来自 src/store.js 的 computeNamespaceStats，供维护驾驶舱画存储构成条
    - 索引统计字段与 namespaceStats 同口径（indexChars、budgetChars、ruleCount 等）

12. getMaintenanceReport({ namespace }) → { actionable, dedupe, mergeCandidates, cold, review, graph }
    - graph 是关系图谱视图的数据：nodes 每项 { id, kind, key, title, heat, chars, degree }
    - edges 每项 { source, target, type, similarity? }，type 为 related（meta.related 显式关联）或 similar（近重复/合并候选）
    - 报告本体来自命名空间下的 maintenance-report.json，文件缺失时返回空结构

### 维护工作区接口（13-16）

13. getMaintenanceWorkspace({ namespace }) → { namespace, scannedAt, counts: { active, archived, checked, candidates, cold }, candidates: Array<{ id, kind, reason, score, sharedTokens, left: { entry, title, revision, chars }, right: { entry, title, revision, chars } }>, cold: { items: Array<{ entry, title, revision, heat, ageDays, ageBasis, reason }>, total, criteria: { thresholdDays, maxHeat, ageBasis, excludes, heatBasis } } }
    - 一次调用给出当前空间的完整候选与长期低热清单，两者来自同一次扫描快照
    - 候选覆盖完全重复、近重复与同类内容重合（rule/fact/sop 之间），每对都给出真实入选原因与共有 token 数；不为凑数放宽阈值
    - 冷条目与后台长期低热扫描同源同阈值（≥ thresholdDays 天、热度 ≤ maxHeat、排除规则与归档），年龄基准为 ageBasis（创建时间），全量按热度排序，不受列表分页或探索池影响
    - 只读：不触发自动维护、不改索引、不发起模型请求、不记访问热度

14. getMaintenanceReview({ namespace, entries: Array<{ namespace, kind, key }> }) → { namespace, items: Array<详情 DTO> }
    - 一次最多两条，返回沿用 readEntry 的详情字段（正文、来源、当前 revision），供同页对比审阅
    - 只读审阅，不增加访问热度

15. mergeMaintenanceEntries({ namespace, left, right, keep: "left"|"right", ifLeftRevision, ifRightRevision, content, evidence? }) → { ok, namespace, kept: { entry, title, revision }, archived: { entry, revision }|null, related: [], partial, error? }
    - 人工确认后的一次写操作：保留 keep 指向那条的**身份与标题**（本期不支持重命名，标题只读），正文与依据使用用户编辑后的内容；另一条被归档并指向保留项，原文件不删除
    - 服务端校验：两条不同、**同命名空间**（跨空间直接拒绝）、同类型、均为活跃、**两侧 revision 必填**且一致；规则 100 字与证据等既有校验照常执行
    - 在既有写锁内一次完成；冲突不覆盖，部分完成时以 partial 与 error 如实返回，不伪报成功
    - 客户端请求若带 title 会被直接拒绝（本期不支持重命名）
    - **两种 partial 形态，前端须分别处理且不得盲目重试**：
      - `archived: null`：正文已保存，但**归档结果未确认**（可能已部分生效）→ 提示用户刷新后重新审阅并**重新选择仍活跃的候选**再建立新草稿；草稿保留供查看/复制，不自动重开旧对比对，禁止再次提交或更换保留目标
      - `archived` 有值且错误标记为 `archive_applied_index_failed`：归档**已生效**，仅索引刷新失败 → 清草稿、关对比并提示真实状态；「重新检查」只刷新本页状态，不会修复索引

16. archiveEntry({ entry, ifRevision }) → { ok: true, namespace, entry, revision }
    - 单条人工归档，带 revision 校验（**revision 必填**）且必须与条目同命名空间，复用既有归档入口，不引入批量自动归档策略
    - **归档已生效但索引刷新失败时抛错**，错误消息以稳定标记 `archive_applied_index_failed` 开头（该类错误原样透出，不会被套上会误导的失败前缀）⇒ 前端据此刷新状态即可，**不要再归档一次**

## 错误约定

- 远程方法抛错消息是中文，格式为“动作名失败：原因”，例如“读取索引占用失败：…”、“回滚记忆失败：…”
- revision 冲突的消息带 revision_conflict 字样，前端据此切到冲突提示
- namespaceStats 的返回解析是容错的，其余方法的返回按契约严格校验字段

## 索引占用组件

实现位置 client/browser.js 的 IndexUsage，样式在 client/browser.css 的 .lm-usage-*。

### 常态

- 只有一行总览：标签、已用百分比、分段细条、已用与预算字符数、展开箭头
- 百分比 = round(indexChars ÷ budgetChars × 100)，超过 100 时百分比取错误色
- 字符数用紧凑写法：9003 → 9.0K，12288 → 12.3K，120000 → 120K
- 细条按四段字符数在已用总量中的占比分配宽度，四段宽度之和等于已用百分比
- indexChars 或 budgetChars 为 0、取数失败时不渲染这一块

### 展开

- 点击整行切换展开与收起，收起状态用 aria-expanded 与 aria-controls 标记
- 明细是四段图例：说明、规则、事实目录、经验目录，每项一个颜色方块、名称、字符数
- 超过预算时在明细下方给出提示：已超注入预算，较早条目不会进入提示词

### 悬停

- 悬停某个图例项时用官方 Tooltip 出气泡，side 为 bottom，delayMs 120
- 气泡内容三段，用 · 连接：该段含义、条目数、占已用的百分比
- 说明段与规则段没有条目数；事实目录段与经验目录段给条数，取 factCount 与 sopCount
- 悬停时其余分段与图例项淡化：细条分段 opacity .28，图例项 opacity .4

### 图例筛选

- 展开后的图例“规则 / 事实目录 / 经验目录”三项可点击，点击后把条目列表的类型过滤切到对应类型，行为与工具栏的类型过滤按钮一致
- 图例段与条目类型的对应：规则 → rule，事实目录 → fact，经验目录 → sop
- 工具栏顶部的“全部”回到全部类型；当前不过滤（全部）时不点亮任何图例项
- 当前过滤类型对应的图例项高亮：带 is-active 类，同时 aria-pressed 为 true
- “说明”段是索引头部，不是条目类型，保持不可点击，也不参与高亮
- 本次不新增本地化文案键，词典键数不变

### 配色

- 四段配色在 client/browser.css 里按 lm-usage-color-head、lm-usage-color-rules、lm-usage-color-facts、lm-usage-color-sops 定义

## 术语与本地化

- 数据键不翻译：kind 取值有 rule、fact、sop 三种，接口层传的就是这三个值
- 界面按语言显示：中文“规则”“事实”“经验”，英文 Rule/Fact/Skill，其余语言按各自词典
- 取值走 client/browser.js 的 kindText，即 t("kind." + kind)；未知 kind 原样显示
- 图例标签 usage.label.head、usage.label.rules、usage.label.facts、usage.label.sops 同样本地化，中文依次是说明、规则、事实目录、经验目录
- 词典：client/browser.js 注册 layered-memory，每种语言 90 键；client/status.js 注册 layered-memory-status，每种语言 53 键。语言覆盖 zh、en、ja、es、fr、de、ru、pt
- 侧栏入口名称取 scope.locale.translate(locale, "title")，随界面语言变化
- 页面内文案通过注册 locale 词典后由 t(key) 取值
- 时间显示用 document.documentElement.lang 对应的区域格式

## 页面要求（前端）

### 入口

- slots.inject("main") 注册页面，key 为 layered-memory
- slots.inject("sidebar.panellist") 注册侧栏入口，id 为 layered-memory，order 20，图标是书本形 SVG

### 公共头部（四个视图共用）

- 头部是 lm-browser-header-sticky，固定在页面顶部，不随视图切换而消失
- 第一行：h1 标题、命名空间 SelectMenu、“新建条目”按钮
- 第二行：BounceNav 弹性导航条，四个页签为条目表格、注入透视、关系图谱、维护驾驶舱，选中页签由药丸指示器跟随
- 第三行：索引占用组件 IndexUsage，四个视图共用同一份 namespaceStats 数据，图例点击可切换条目类型过滤
- 头部与索引占用组件位于内容区之外，切换视图不会重建它们

### 四个工作台视图

- 条目表格（entries）：工具栏 + 数据表 + 右侧详情。默认列只留标题、类型与更新时间；标题、热度、字符数、更新时间可排序，行可展开显示摘要、关联条目与证据片段
- 注入透视（injection）：逐条取舍名单 ＋ 实际注入提示词原文，数据来自 getInjectionState。名单每行只留标题与必要类型，「打开条目」集中在当前选中项的预览头部；召回词与来源预算收进高级设置折叠区
- 关系图谱（graph）：力导向布局，节点位置由图渲染库计算；滚轮以指针为中心缩放、拖拽平移，缩放按钮与适屏走同一套变换；初次渲染与容器尺寸变化后自动适屏，边界计算含标签占位；默认只显示焦点节点、其一跳邻居与少量重要节点的标签，其余标签让位；悬停高亮相邻连线并淡化其余网络，点击固定选中并在信息卡展示类型、字符数与关联数；工具栏是一张可展开卡片，显示选项是卡片内与 header 同宽连续的展开区；数据来自 getMaintenanceReport 的 graph
- 维护驾驶舱（cockpit）：上半是维护工作区 —— 当前空间的完整候选清单（每对带入选原因与共有 token 数）、同页对比审阅，人工确认后合并保留项或单条归档；下半是长期低热清单（与后台长期低热扫描同口径同阈值、年龄基准为创建时间、全量按热度排序），可逐条审阅归档。合并保留所选条目的身份与标题（本期不支持重命名），正文与依据可编辑；数据来自 getMaintenanceWorkspace、getMaintenanceReview、mergeMaintenanceEntries、archiveEntry，与 getDiskMetrics、getMaintenanceReport 并存

### 条目表格的空态与错误态

搜索与类型过滤都由服务端承担，组件自带的客户端筛选与分页不参与：

- 搜索框由页面工具栏提供，表格组件的内置搜索框不渲染。
- 服务端分页由「加载更多」推进，表格组件的内部分页器不渲染，已加载行一次性呈现。
- 空态只给一句短标题与一个图标，不带解释性小字；动作（如清空查询）回调到父级，由父级清空服务端查询，而不是只清组件内部的客户端筛选。
- 错误态只给一句短标题；原始错误信息作为技术详情默认折叠，按需展开。
- 无数据与失败是两种状态：当前条件下没有条目走空态，请求失败走错误态。

这几项由数据表组件的可选内容接口提供，参数与默认值见 docs/component-sources.md 的「新增的可选调用方接口」。

### 阅读层级与渐进展开

默认阅读直接看到正文，次要信息收起：

- 详情页正文之后是若干折叠区（来源与依据、关联、历史等），各自默认关闭；标题可带数量徽标。
- 折叠由共享的 `Disclosure` 组件承担，展开状态**归各视图自己持有**，组件不另存一份。条目身份变化时由视图重置。
- 收起时折叠内容被卸载；同时面板容器按 `open` 同步 `aria-hidden` 与 `inert`，所以**退出动画期间**旧内容既不可 Tab 也不可交互，收起后页面上不留可焦点控件；触发器是真按钮，键盘与触控都可直接操作。
- 列表的搜索、类型筛选与结果数留在工具栏，列表本身不再带组件自带的搜索框与分页器：分页由服务端窗口加「加载更多」推进，组件侧的 `hidePagination` 会同时去掉分页器与内部切片。

工具栏里的高级项走浮层而不是折叠块，入口与工具栏同排、不独占一行：注入页的「高级设置」与图谱的「显示选项」都用共享的 `ToolbarPopover`，面板由宿主挂到页面根并按锚点定位，因此不会被页面滚动容器裁切；关闭后不留空表面。

### 工具栏

默认只保留阅读相关的一行：

- 搜索框，type 为 search，有输入时出现清空按钮
- 类型过滤：全部、规则、事实、经验，文案走本地化词典
- 一项简短结果数

命名空间切换与「显示已归档」等低频条件收进可点的筛选/更多入口，不摊在正文上方；命名空间切换仍保留在该入口内。详情页的「更多」用宿主 Menu，菜单以 portal 渲染脱离滚动区裁切，并带 `aria-haspopup` / `aria-expanded`。

索引占用组件在工具栏下方、条目列表上方。

### 列表

- 每行给出标题、类型徽标与更新时间
- 类型徽标显示本地化名，不显示 fact 或 sop
- 已归档行加 is-archived 样式置灰
- 选中行高亮，切换选中会清掉提示与冲突状态

### 详情

- 标题、类型小徽标与两个入口：「编辑」与「更多」。「更多」用宿主 Menu，放归档/恢复、复制引用等低频动作，写入进行中时相应动作禁用
- 正文紧随其后，阅读态直接看到 Markdown 正文；不常驻保存按钮，点正文也不会进入编辑
- 身份三元组（namespace / kind / key）、热度与访问次数、来源会话等不默认铺开，需要时在「更多」或按需展开的细节里取
- 进入编辑后显示正文编辑器与修改依据字段，此时才出现保存/取消；保存走 updateEntry，带 ifRevision；冲突时显示提示并给“重新加载”，取消按脏稿确认并恢复 baseline，不写服务器
- 规则条目在编辑态显示 100 字符计量条，超限时禁用保存
- 来源与依据、关联、历史三个折叠区放在正文之后，默认关闭；历史每条给出时间与内容变化摘要，带“对比/预览”与“回滚到此版本”，回滚需要二次确认
- 预览按钮展开的行级 Diff 以 snap.preview || snap.content 为旧文本，与当前正文逐行比对
- 归档、回滚、创建成功后都刷新列表、详情与历史，占用数据随列表版本一起刷新

### 新建弹层

- 字段：namespace（随当前空间预填）、kind（短名 + 色标）、topic、content、evidence
- namespace、topic、content、evidence 都要填，缺一项时报必填提示
- 提交后关闭弹层，选中新建的条目并刷新列表

### 视觉

- 沿用 @deepseek-ai/dsh-client-ui-primitives 的 Button、Input、Menu、MenuItemButton、Switch、Tooltip
- 颜色与间距取 --dsw-alias-* 等官方变量
- 数据表与折叠区等视图组件改编自 Component Hunt 收录的 EasyUI 组件，来源与许可见 docs/component-sources.md
- 代码注释与文案用中文，中文引号用全角“”
