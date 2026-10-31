# 记忆管理页 · 前后端接口契约

本文描述记忆管理页与服务端之间的数据通道、索引占用组件的行为和页面要求。文中每条约束都对应仓库里的实现。

## 落地位置

- 源 clone：/mnt/c/Users/39795/Desktop/AI_project/dsh-layered-memory，改代码在这里
- 运行副本 /home/dsh/src/dsh-layered-memory 的同步由 Lead 统一处理
- 管理页做进 status 子包 @dsh-external/dsh-layered-memory-status：
  - 客户端 client/browser.js，样式 client/browser.css
  - 服务端通道 src/status.js、src/status-contract.js，存储操作 src/store-service.js
  - 索引切分与统计 src/l1index.js
- 构建：node scripts/build.mjs，把 src/status.js、src/status-contract.js、client/status.js、client/browser.js、client/status.css、client/browser.css 组装进 lib/status/
- 当前规则条目接口适用于 0.11.0 起的版本

## 服务端 → 前端数据通道

- 主包提供服务 layeredMemoryStore（src/store-service.js）
- status 子包 src/status.js 的 inject 含 layeredMemoryStore，typert.register 的 invocations 含 STORE_REMOTE.descriptors
- 前端经 remote.layeredMemoryStatus 调用下面 9 个方法，与 status 现有 invocations 同一通道

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

4. readEntry({ entry }) → { entry, title, content, revision, archived, evidence, sourceSession, createdAt, updatedAt }
   - evidence 是字符串，空串表示没有证据
   - sourceSession、createdAt、updatedAt 可为 null

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

### 配色

- 四段配色在 client/browser.css 里按 lm-usage-color-head、lm-usage-color-rules、lm-usage-color-facts、lm-usage-color-sops 定义

## 术语与本地化

- 数据键不翻译：kind 只有 fact 与 sop，接口层传的都是这两个值
- 界面按语言显示：中文“事实”“经验”，英文 Fact/Skill，其余语言按各自词典
- 取值走 client/browser.js 的 kindText，即 t("kind." + kind)；未知 kind 原样显示
- 图例标签 usage.label.head、usage.label.rules、usage.label.facts、usage.label.sops 同样本地化，中文依次是说明、规则、事实目录、经验目录
- 词典：client/browser.js 注册 layered-memory，每种语言 73 键；client/status.js 注册 layered-memory-status，每种语言 53 键。语言覆盖 zh、en、ja、es、fr、de、ru、pt
- 侧栏入口名称取 scope.locale.translate(locale, "title")，随界面语言变化
- 页面内文案通过注册 locale 词典后由 t(key) 取值
- 时间显示用 document.documentElement.lang 对应的区域格式

## 页面要求（前端）

### 入口

- slots.inject("main") 注册页面，key 为 layered-memory
- slots.inject("sidebar.panellist") 注册侧栏入口，id 为 layered-memory，order 20，图标是书本形 SVG
- 页面头部是 h1 标题和“新建条目”按钮

### 工具栏

一行四组，从左到右：

- 命名空间下拉
- 搜索框，type 为 search，有输入时出现清空按钮
- 类型过滤：全部、事实、经验，文案走本地化词典
- 显示已归档开关

索引占用组件在工具栏下方、条目列表上方。

### 列表

- 每行给出标题、类型徽标、归档标记、更新时间
- 类型徽标显示本地化名，不显示 fact 或 sop
- 已归档行加 is-archived 样式置灰
- 选中行高亮，切换选中会清掉提示与冲突状态

### 详情

- 标题与归档徽标；操作区是“归档/恢复”和“保存”，内容或证据有改动时保存才可用
- 只读字段三项：namespace、kind、key。其中 kind 显示本地化名，另两项显示原值
- 内容区在预览与编辑之间切换：预览渲染 Markdown，点击预览区切到编辑，编辑框失焦切回预览
- 证据是单行输入框
- 历史快照列表每条给出时间、revision 前 12 位、字符数、内容变化摘要，带预览与“回滚到此版本”按钮，回滚需要二次确认
- 保存走 updateEntry，带 ifRevision；冲突时显示提示并给“重新加载”
- 归档、回滚、创建成功后都刷新列表、详情与历史，占用数据随列表版本一起刷新

### 新建弹层

- 字段：namespace（下拉）、kind（下拉，选项文案本地化）、topic、content、evidence
- 打开时 namespace 取当前选择，kind 取当前过滤值，没有则取 fact
- namespace、topic、content、evidence 都要填，缺一项时报必填提示
- 提交后关闭弹层，选中新建的条目并刷新列表

### 视觉

- 沿用 @deepseek-ai/dsh-client-ui-primitives 的 Button、Input、Menu、MenuItemButton、Switch、Tooltip
- 颜色与间距取 --dsw-alias-* 等官方变量
- 代码注释与文案用中文，中文引号用全角“”
