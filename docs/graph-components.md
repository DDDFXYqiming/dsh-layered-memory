# 关系图谱的组件来源与集成契约

面向维护「记忆工作台 → 关系图谱」这一视图的开发者：本文说明图谱用到了哪些第三方组件、来源与许可证是什么、宿主怎么接线、以及哪些行为由本仓库自己实现。

## 1. 组件来源

| 组件 | 版本 | 许可证 | 来源 | 用途 |
| --- | --- | --- | --- | --- |
| d3（全量 UMD 构建） | 7.9.2 | ISC | <https://github.com/d3/d3>，npm `d3@7.9.2` 的 `dist/d3.min.js` | 力导向布局、缩放平移、碰撞、贝塞尔路径、缓动 |
| EasyUI · Dependency Trace | 上游仓库 main 分支 | MIT | <https://github.com/Surajmaurya1/easyui> 的 `src/components/ui/DependencyTrace.tsx>；上游页面 <https://easyui.site/components/dependency-trace> | hover 邻居高亮、点击钉住、贝塞尔边等交互语义的来源 |

vendored 文件：

```
client/vendor/graph/d3.min.js          d3@7.9.2 dist/d3.min.js 原文 + 一行 ISC 头部注释
client/vendor/graph/d3.LICENSE.txt     npm 包内 LICENSE 原文（ISC 全文）
client/vendor/graph/d3.package.json    npm 包内 package.json 原文（版本与依赖证据）
client/vendor/graph/easyui/DependencyTrace.tsx   上游原文，未改
client/vendor/graph/easyui/LICENSE               上游仓库 LICENSE 原文（MIT 全文）
```

### 1.1 与 Component Hunt 的关系

Component Hunt 收录的是 **EasyUI 这个 land**：<https://componenthunt.dev/lands/easyui>（页面标注 MIT / Open Source，Public Components 8）。Dependency Trace 属于该 land，但没有在 Component Hunt 单独设页（`/easyui/dependency-trace` 返回 404），因此本文不把它写成「Component Hunt 收录的 Dependency Trace 条目」。

Component Hunt 站内没有提供「图谱渲染 + 缩放平移 + 标签避让」的组件：站内 `graph` / `network` / `diagram` / `zoom` 命中的都是图表、图片缩放或文件树类条目。**图谱的布局、视口与碰撞全部来自 d3**，不是自绘的轮子。

### 1.2 从 Dependency Trace 移植了什么

移植的是交互判定，不复制渲染层：

- `activeId = hoveredNodeId || selectedNodeId`，悬停优先于选中；
- 一跳邻居集合：与 `activeId` 相连的节点及其边高亮，其余节点与边淡出（透明度 0.18 / 0.1）；
- 二次点击同一个节点取消选中；
- 贝塞尔边公式：`M x1 y1 Q midX (midY - 15) x2 y2`。

没有移植的部分（有意为之）：固定 `viewBox 400×280`、径向默认布局、标签截断 7 字、无限循环的脉冲光环。前三项与本视图的真实数据规模（数百节点）和可读性目标冲突；脉冲光环违反「不做无限动效」与 `prefers-reduced-motion` 要求，本实现改为静态高亮环 + 一次性过渡。

## 2. 集成契约

### 2.1 工厂签名

```js
// 宿主统一走 UI runtime（scripts/build.mjs 负责拼接）
const runtime = createMemoryUiRuntime(require);
runtime.graphView = createMemoryGraphView(require, runtime);

// 也支持独立调试用法
const GraphView = createMemoryGraphView(React, ui, { d3, styles });
```

`createMemoryGraphView(require, runtime)` 内部取用：

| 来源 | 内容 | 缺失时 |
| --- | --- | --- |
| `require("react")` | React | 必需 |
| `runtime.ui` 或 `require("@deepseek-ai/dsh-client-ui-primitives")` | Button / Input / Switch | 退化为原生 `button` / `input` / `checkbox` |
| `runtime.d3`（d3 模块对象，构建侧局部作用域捕获、不写全局） | d3 命名空间 | 回退读 `globalThis.d3`；仍取不到时渲染「图谱组件加载失败 + 刷新页面」错误态，不抛异常 |
| `runtime.reducedMotion()` | 是否减少动效 | 回落到 `matchMedia("(prefers-reduced-motion: reduce)")` |
| `runtime.styles` 或 bundle 作用域常量 `GRAPH_VIEW_CSS` | 图谱样式表 | 无样式注入，图谱仍可用 |

### 2.2 默认层级（工具栏与选中面板）

图谱默认只摊开必要控件，低频项按需展开：

| 位置 | 默认可见 | 展开后 |
| --- | --- | --- |
| 工具栏卡片 · header 行 | 搜索（可收缩）、适屏、一个「显示选项」入口 | — |
| 工具栏卡片 · 展开区 | — | 类型强调、关系类型、仅看有边节点、重置视图、节点/边计数 |
| 画布右下角 | 放大、缩小 | — |
| 选中面板 | 标题、类型徽标、打开条目 | 「关联 N」邻居列表、「定位」身份三元组 |
| 悬停提示 | 完整标题、类型、关联数量 | — |

- 工具栏是**一张可展开的卡片**，不是两张卡：header 行（搜索 + 适屏 + 「显示选项」入口）常驻，展开区接在同一张卡的下缘、同宽、同水平内距、内部滚动；卡片宽度固定，限高在 stage 内。
- `toolbarRef` 只挂 header 行——适屏预留（`computeFitArea`）与 ResizeObserver 只看它，因此**展开不会触发 refit、也不会推动画布**；卡片根另有独立 ref 供外点关闭使用。
- 外点关闭用宿主 `useDismissOnOutsidePointer`（卡片根同时作为“内部”判定，卡片内的点击不会误关，且不夺焦）；Esc 关闭并把焦点交回「显示选项」触发器。入口标签带生效条件摘要（如「显示选项 · 规则」）。
- 类型仍是父级受控（`kind` / `onKindChange`），语义是**强调**而非筛选数据；选中面板与悬停提示不再默认摊开身份三元组、热度分值与重复的关联数。
- 换一个节点或换命名空间时，各折叠区回到默认闭合。

选中详情里的「关联 / 定位」用共享组件 `runtime.components.Disclosure`（改编自 EasyUI Smooth Accordion，MIT）：完全受控的 `open` + `onOpenChange`，`title` 可传节点，`count` 在标题右侧显示徽标，`id` 指向面板容器（`aria-controls`）。

**表面与层级**：本模块的三种表面统一到宿主的 elevation 体系，描边由 elevation token 的 hairline 提供，不再另画 border：

| 表面 | elevation | 圆角 | 说明 |
| --- | --- | --- | --- |
| 工具栏卡片（header + 展开区同一张） | `--dsw-elevation-panel` | `--dsw-radius-md` | 常驻，最轻 |
| 悬停提示 / 选中详情 | `--dsw-elevation-soft` | `--dsw-radius-md` / `--dsw-radius-lg` | 临时浮层，清楚但克制 |

工具栏卡片只用一套 surface：header 行与展开区在同一个元素里，展开区不再是独立浮层，因此没有「两张卡比层级」的问题。

工具栏用共享 `runtime.components.Disclosure` 的 `renderHeader` 槽：组件不渲染自己的 trigger，只渲染我们给的 header 节点（header 按钮自己写 `aria-expanded` / `aria-controls`），展开体用 `bodyClassName` 交给我们控制内距、限高与卡内滚动，根元素用 `rootRef` 与 `className` 承接卡片表面与外点关闭。共享组件缺席时退回本地同形状的兜底折叠（含 `renderHeader` 槽），同样不自带第二套 surface。

### 2.3 组件 props

```js
h(runtime.graphView, { controls, namespace, onJumpEntry, t, locale })
```

| prop | 说明 |
| --- | --- |
| `controls.getMaintenanceReport({ namespace })` | 数据来源，返回 `{ graph: { nodes, edges } }` |
| `namespace` | 当前命名空间；为空时提示先选命名空间 |
| `onJumpEntry({ namespace, kind, key })` | 「打开条目」按钮回调，携带完整身份 |
| `locale` | `"zh"`（默认）/ `"en"`，只影响图谱自身文案 |
| `kind` | 可选。外部共享的类型过滤（`"rule"` / `"fact"` / `"sop"` / `""`）。有值时按类型强调：匹配节点正常显示，不匹配的节点淡出但仍留在图上（位置与视口不变，不产生跳动）；不传此 prop 时由图谱自身的类型 chip 控制，行为与不传完全一致 |
| `onKindChange` | 可选。类型过滤变更回调，图谱内 chip 被点击时回传下一个类型值。传了 `kind` 就应同时传它；只传 `kind` 不传回调时，图谱内 chip 置为只读，过滤统一由外部控制 |

图谱自身的文案内置在 `client/graph-view.js`（中英两套），不依赖工作台 locale 字典，因此不需要改动字典注册。

### 2.4 数据字段

| 字段 | 用途 |
| --- | --- |
| `node.id` | 节点标识（`kind:key`），与 `edge.source` / `edge.target` 对应 |
| `node.kind` | 分类配色：rule / fact / sop |
| `node.key` / `node.title` | 标签与详情展示 |
| `node.heat` | 节点半径与详情热度 |
| `node.degree` | 节点半径、标签优先级与详情关联数 |
| `node.namespace` | 跳转身份优先取节点自身命名空间 |
| `edge.type` | `related`（显式关联，实线）/ `similar`（相似关系，虚线） |
| `edge.similarity` | 相似边的相似度展示 |

边只画两端都存在的连接；不存在的连接由后端剔除，不在前端补造节点。

**计数口径**：类型 chip 上的数字是当前命名空间的**库存数**（不受搜索与「仅看有边节点」影响，与条目表的类型徽标口径一致）；节点计数是「当前画出的 / 总数」，边计数同理。类型过滤只做明暗强调，不改变这些数字。

### 2.5 构建接线（scripts/build.mjs）

d3 以**局部 CommonJS 作用域捕获**的方式交给组件，不写全局：

```js
// factory 体内、client/graph-view.js 之前
const __DSH_LMD_D3__ = (function () {
	var exports = {};
	var module = { exports: exports };
	/* client/vendor/graph/d3.min.js 全文 */
	return module.exports;
})();
const runtime = createMemoryUiRuntime(require, { d3: __DSH_LMD_D3__ });
runtime.styles = GRAPH_VIEW_CSS;
runtime.graphView = createMemoryGraphView(require, runtime);
const memoryBrowserClient = createMemoryBrowserClient(require, styles, runtime);
```

- d3 的 UMD 头命中 `typeof exports === 'object' && typeof module !== 'undefined'` 分支，走 `factory(exports)`，因此**不会**执行 `global.d3 = global.d3 || {}`，产物里没有 `globalThis.d3` 赋值；
- 组件侧优先读 `runtime.d3`，取不到才回退读 `globalThis.d3`（兼容直接以 classic script 引入 d3 的场景）；
- 其余拼接：factory 体内插入 `const GRAPH_VIEW_CSS = <JSON.stringify(css)>;`；`client/graph-view.js` 用现有 `stripExports` 去掉 `export ` 前缀后拼在 `client/browser.js` 之前；
- `react` / `react-dom` / `@deepseek-ai/*` 保持 external，产物里不会出现第二份 React；
- d3 的 ISC 全文随发布产物分发：构建时把 `client/vendor/graph/d3.LICENSE.txt` 复制到状态子包的 `licenses/d3.txt`。

`package.json` 不需要为图谱新增依赖：d3 以 vendored 形式随包分发。

## 3. 本仓库自己实现的部分

以下没有第三方对应实现，属于本视图的本地代码（`client/graph-view.js`）：

- **标签避让**：画布上的标签用短标题（最多 14 字，完整标题在 tooltip 与详情面板里给），候选只有「当前焦点 + 一跳邻居里前几个 + 按 degree/heat 排名靠前的少量节点」；每个候选在 8 个方位里挑一个不压其它标签的位置。**重点节点（连接度与热度最高的几个）与当前焦点保底显示**——放不下时也会画出来，宁可轻微重叠也不整体隐藏；文字带描边底色，压到节点仍可读。文本宽度用 canvas `measureText` 实测。
- **标签只与标签判重叠**：不再要求标签避开节点圆。密集布局下这条会把所有候选方位否掉，结果一个标签都出不来。
- **可视区适配**：容器尺寸只从当前可见的 stage 现读（布局、fit、宽高比修正共用同一来源）；fit 时把顶部工具栏高度排除在可用区域之外，包围盒同时包含节点半径与标签矩形。容器比例变化超过 8%（侧栏开合、宽窄屏切换）时按新比例重排布局——同一 seed 结果稳定，再重新适屏；弹层开合、悬停、选中不触发适屏，用户手动 pan/zoom 不会被无关状态重置。
- **画布利用率与字号分开**：布局形状由中心力按当前可视区宽高比分配（宽屏时纵向约束更强，布局自然摊成宽形），不用事后仿射拉伸（那会把节点压扁、挤成一团）；碰撞仍由 d3 forceCollide 保证。标签的世界字号按缩放比放大，保证屏上不小于基准字号，缩放变小也不会让文字看不清。
- **状态呈现**：四种状态用宿主 primitives 的既有图标作标记——读取中 `IconLoadingOutlineRegular`、筛空 `IconSearchOutlineRegular`、失败 `IconWarningOutlineRegular`、没有条目 `IconArchiveOutlineRegular`，本模块只负责排版、颜色与读取中图标的旋转（`prefers-reduced-motion` 下不转）。每个状态配一个短标签；失败态给真实的重试或刷新按钮，技术错误信息收在「详情」展开里（手机可达，不在页面上铺开）；空态与筛空态给「清除筛选」动作，不伪装成加载中或一切正常。画布上没有常驻的操作教程行——平移、缩放、选中这些操作由光标形态（grab / grabbing / pointer）、按钮的 tooltip 与 aria、节点的 hover/focus 提示和选中面板来表达。
- **两类过滤的分工**：搜索与「仅看有边节点」会真正移除节点并重新适屏；类型过滤只做明暗强调（不匹配的节点淡出、其标签隐藏），因此共享同一类型状态时不会出现画面跳动。
- **宽高比修正**：力导向布局结果接近方形，按可视区宽高比做一次保面积仿射拉伸（系数上限 1.45），让宽屏里节点占比更高、fit 后的缩放比更大、文字更可读。
- **布局稳定性**：`simulation.randomSource(d3.randomLcg(seed))`，种子由命名空间与排序后的节点 id 派生，同一份图每次进入位置一致；布局一次性同步跑完 320 tick 后停止，不做常驻漂移。
- **拖拽与点击区分**：节点用 `d3.drag` 拖动，拖动结束后位置保留；d3-drag 会抑制拖动后的 click，空白拖动平移同样不会误清选中。
- **动效克制**：入场为一次性淡入 + 半径增长（按节点排名错峰），高亮淡出用 CSS 过渡；`prefers-reduced-motion: reduce` 时全部改为即时状态。

## 4. 已知边界

- 节点数量上千时，力导向同步收敛的耗时与内存需要重新评估；当前实现面向数百节点。
- 标签避让是贪心放置，不是最优解；重点节点与焦点节点保底显示，其余节点放不下时不显示。
- 详情面板为覆盖式浮层（窄屏改为底部抽屉），不参与图谱尺寸计算，因此不会压缩画布。
