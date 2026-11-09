# 组件来源与许可

本工作台的前端视图大量改编自 Component Hunt 收录的 **EasyUI** 组件，以及少量成熟的图渲染与动画库。本文件登记每一项的上游地址、版本、许可证与在本仓库中的改编范围，供维护者核对来源。

## Component Hunt 收录口径

Component Hunt 是社区策展目录，不是全量组件库。EasyUI 在其中以一个 **land** 的形式被收录：<https://componenthunt.dev/lands/easyui>，该页标注 EasyUI 为 MIT / Open Source / Free，并写明组件源码通过 EasyUI registry 提供。

逐条核实存在的 EasyUI 独立条目：

| Component Hunt 条目 | 页面 |
| --- | --- |
| Advanced Data Table | <https://componenthunt.dev/easyui/advanced-data-table> |
| Animated Tabs | <https://componenthunt.dev/easyui/animated-tabs> |
| DrawCheckbox | <https://componenthunt.dev/easyui/draw-checkbox> |
| StretchSwitch | <https://componenthunt.dev/easyui/stretch-switch> |
| Avatar Stack | <https://componenthunt.dev/easyui/avatar-stack> |

其余 EasyUI 组件在 Component Hunt 没有独立页面，仅属于上述 land。下表中的「Component Hunt」一栏据此区分「独立条目」与「同属 EasyUI land」。

## 改编自 EasyUI 的组件

上游仓库：<https://github.com/Surajmaurya1/easyui>（MIT，Copyright (c) 2026 Suraj Maurya）。许可全文随子包发布于 `licenses/easyui.txt`，仓库副本见 `client/vendor/easyui/LICENSE`。

| 本仓库文件 | 上游文件 | Component Hunt | 许可证 | 改编范围 |
| --- | --- | --- | --- | --- |
| `client/vendor/easyui/AdvancedDataTable.tsx` | `src/components/ui/AdvancedDataTable.tsx` | 独立条目 | MIT | 随包发布的 MIT 上游源码，改编点：样式类名换成 DSH token，另新增三个可选 prop：`searchPlaceholder: null`（隐藏组件自带搜索框）、`hidePagination`（去掉内部分页器与内部切片）、`contentProps`（空态与错误态接口，见下文）。上游交互逻辑（全局搜索、三态排序、行展开、行选择与半选、分面筛选、列显隐、分页、表格/卡片双视图与 640px 自动切换）保持原样。 |
| `client/vendor/easyui/DonutChart.tsx` | `src/components/ui/DonutChart.tsx` | 同属 EasyUI land | MIT | 随包发布的 MIT 上游源码，改编点：样式类名换成 DSH token，另新增一个可选 prop `emptyLabel`（无数据文案，`null` 则不渲染）。上游行为保持原样（`semi` 半环仪表变体、图例 hover/focus 高亮与中心读数联动、click 隐藏分段且环不塌陷）。 |
| `client/vendor/easyui/Disclosure.tsx` | `src/components/ui/SmoothAccordion.tsx` | 独立条目 | MIT | 改编自 EasyUI 的 Smooth Accordion：上游是多条目手风琴、内部自持 `openIds`、标题下带 subtitle；本仓库改为**单项受控**折叠 —— `open` 归调用方，`title` 可传节点，新增 `count` 徽标。保留上游 trigger 机制：真 `<button>` + `aria-expanded`、弹簧旋转 chevron、`AnimatePresence` 高度过渡、`prefers-reduced-motion` 下瞬时完成。面板容器常驻 DOM（`aria-controls` 永远有目标），关闭时 children 被卸载，收起后不留可焦点控件。样式换成 DSH token。 |
| `client/vendor/easyui/ScrollProgressNav.tsx` | `src/components/ui/ScrollProgressNav.tsx` | 同属 EasyUI land | MIT | 随包发布的 MIT 上游源码，改编点：样式类名换成 DSH token。上游行为保持原样（滚动进度线、超阈值浮动胶囊、共享布局药丸在段落间滑动、active 段落高亮、平滑滚动与窄屏折叠菜单）。 |
| `client/vendor/easyui/AnimatedTabs.tsx` | `src/components/ui/AnimatedTabs.tsx` | 独立条目 | MIT | 仅替换样式类名。共享布局药丸指示器与内容交叉淡入保持原样。 |
| `client/vendor/easyui/chart-primitives.tsx` | `src/lib/chart-primitives.tsx` | 同属 EasyUI land | MIT | 仅替换样式类名。色板、坐标轴步长、ResizeObserver 宽度钩子、外部点击消隐、弹簧跟随浮层等共享基座保持原样。 |
| `client/vendor/easyui/motion-tokens.ts` | `src/lib/motion-tokens.ts` | 同属 EasyUI land | MIT | 原文照抄，仅替换文件头注释。 |
| `client/vendor/easyui/utils.ts` | `src/lib/utils.ts` | 同属 EasyUI land | MIT | `cn` 由 clsx + tailwind-merge 改为直接拼接类名（本插件不引入 Tailwind 构建），其余导出函数保持原样。 |
| `client/vendor/graph/easyui/DependencyTrace.tsx` | `src/components/ui/DependencyDataTrace.tsx` 上游原文 | 同属 EasyUI land | MIT | 上游原文，未作修改，仅作为图谱交互语义的来源。 |

上游注册表条目名与文件清单见 <https://easyui.site/registry.json>。

## 新增的可选调用方接口

下列接口是本仓库在改编 EasyUI 组件时**新增**的（上游没有），全部可选：**不给即维持上游行为**。它们只补齐组件无法知道的部分——例如调用方自己拥有服务端查询、分页或文案时。

### DataTable / DataTableContent

表格由 `DataTable` 与 `DataTableContent` 直接组合，不使用带工具条的便利包装器，因此组件自带的搜索框与分页器都不参与。

| Prop | 类型 | 作用 |
| --- | --- | --- |
| `searchPlaceholder` | `string \| null` | `DataTableToolbar` 的 prop：传 `null` 时不渲染组件自带的搜索框（调用方自己拥有搜索语义时使用） |
| `hidePagination` | `boolean` | `DataTable` 的 prop：传 `true` 时不渲染组件内部分页器，并一次性渲染全部已加载行（调用方在服务端分页时使用） |
| `contentProps` | `DataTableContentProps` | 空态与错误态的内容接口，见下 |

```ts
export interface DataTableContentProps {
	className?: string;
	emptyTitle?: string;
	emptyDescription?: string | null;   // null 或空串 → 不渲染说明段落
	emptyActionLabel?: string | null;   // null → 不渲染空态动作按钮
	onClearFilters?: () => void;        // 给了就调调用方；未给才退回组件内部 clearFilters
	errorTitle?: string | null;         // null → 不渲染错误标题
	errorDetail?: string | null;        // undefined → 用 error 原文；null → 完全不显示详情
	errorDetailLabel?: string;          // 展开技术详情的按钮文案，默认 "Details"
}
```

要点：

- 上游自带的 "Clear filters" 只清组件内部的客户端筛选，对服务端查询无效。给了 `onClearFilters` 后，空态动作按钮与筛选栏的 Reset 都改为调用父级回调；未给时仍是上游行为。
- 错误态不再重复「一句失败标题 + 一句失败说明」：标题由 `errorTitle` 给短文案，原始错误串作为 `errorDetail` 默认折叠在原生 `<details>` 内（键盘可用）。

### Disclosure

```ts
{
  title?: React.ReactNode;                 // 默认 trigger 的内容；用 renderHeader 时可省
  open?: boolean;                          // 受控，默认关闭
  onOpenChange?: (open: boolean) => void;  // 切换时回抛下一个状态
  children?: React.ReactNode;              // 面板内容，关闭时卸载
  id?: string;                             // 面板容器 id，aria-controls 指向它
  count?: number;                          // 默认 trigger 上的计数徽标
  className?: string;                      // 根元素
  renderHeader?: (state: DisclosureHeaderState) => React.ReactNode;
  rootRef?: React.Ref<HTMLDivElement>;     // 根元素 ref
  bodyClassName?: string;                  // 展开体区域
}

interface DisclosureHeaderState {
  open: boolean;       // 受控状态
  toggle: () => void;  // 请求下一个状态
  contentId: string;   // 面板容器 id
}
```

组件不持有展开状态：`open` 归调用方，触发器只回抛下一个状态。面板容器常驻 DOM，`children` 在收起时卸载，因此收起后不留可焦点控件；触发器是真按钮，Enter / Space 原生可用。展开状态归属各视图，条目身份变化时由调用方重置。

`renderHeader` 供需要在同一行里放自己控件的调用方（图谱工具栏卡片把搜索、适屏与显示选项排在同一 header 行）：给了它就**完全替代**默认 trigger 按钮，调用方自己写 `aria-expanded` / `aria-controls`（用拿到的 `open` 与 `contentId`）并自己处理外点关闭与 Esc；计数徽标只出现在默认 trigger 上。

给了 `bodyClassName` 即把展开体区域完全交给调用方：组件不再自带内距、字号、限高与滚动，body 上只剩 `:where()` 承载的动画裁切（零特异性，调用方可无条件改写）。`rootRef` 把根元素交给调用方测量或做外点判定。

## 宿主公开 primitives 的适配

工作台的浮层不引入第三方组件，直接适配宿主 `@deepseek-ai/dsh-client-ui-primitives` 已公开的能力：定位、视口碰撞处理与外点关闭都由宿主负责，适配层只负责组合与主题。

### ToolbarPopover

工具栏用的浮层入口，暴露为 `runtime.components.ToolbarPopover`。

```ts
{
  title: React.ReactNode;                 // 触发器内容
  open?: boolean;                         // 受控，默认关闭
  onOpenChange?: (open: boolean) => void; // 打开/关闭回抛
  children?: React.ReactNode;             // 面板内容
  id?: string;                            // 面板 id，aria-controls 指向它
  count?: number;                         // 触发器里的数量徽标
  className?: string;                     // 行内根元素（包住触发器）
  panelClassName?: string;                // portal 面板表面的类
  align?: "start" | "center" | "end";     // 默认 "end"
  side?: "bottom" | "top";                // 默认 "bottom"
  ariaLabel?: string;                     // 面板无障碍名，默认取触发器文本
}
```

构成：

- 面板由适配器自己挂到 `document.body`（宿主 `MenuSurface` 只把自己的内容渲染在放置处、只把背景层 portal 出去），因此面板不依赖任何祖先选择器、不被祖先容器的 `overflow` 裁切；`className` 与 `panelClassName` 分开。
- 面板固定在视口坐标系（`position: fixed`）：宿主锚点钩子返回的是视口坐标（`top` / `left`），而宿主 surface 自身是 `position: relative`，所以测量态与定位完成态都由适配器显式固定，避免面板掉进文档流并给页面加出纵向滚动条。
- 位置由宿主的 `useAnchoredPosition` 计算（锚点相对定位、视口碰撞翻转与夹紧，并跟随滚动、Visual Viewport 平移与浏览器缩放）。
- 外点关闭用宿主的 `useDismissOnOutsidePointer`；Esc 关闭并把焦点交还触发器。
- 面板只在打开时挂载，关闭后不残留空表面；首次定位完成前保持隐藏，避免错位闪烁。
- 表面与宿主菜单同族：半透明填充与背景模糊来自宿主 `MenuSurface` 的材质层（`--dsw-menu-surface-fill` 与 `--dsw-menu-backdrop-filter`），发丝描边与投影用宿主 elevation 令牌（`--dsw-elevation-prominent`，描边色重绑 `--dsw-alias-border-l1`），圆角取宿主 `--dsw-radius-lg`。明暗两套都由这些令牌自适应。
- 层级：面板落在宿主的 submenu 层（`z-index: 101`）——高于锚定列表与提示层（100）及应用外壳，低于宿主模态遮罩（1000）。
- 触发器是真按钮，带 `aria-expanded` / `aria-haspopup` / `aria-controls`；面板是 `role="dialog"`，默认 `aria-labelledby` 指向触发器。
- 每次打开在定位完成后把焦点移进面板容器（容器 `tabIndex="-1"`，不聚焦面板内的输入框，触屏不会因此弹出软键盘），于是 Tab 接着走面板内容而不是穿过背后的页面；面板重新定位时不抢焦点。
- Esc 关闭弹层并把焦点交还触发器；点外部关闭不移动焦点，用户刚点到的新控件不会被夺回。
- 面板限宽 320px；内容区按宿主的可滚动菜单取视口适配高度（距上下边缘至少 12px），超出时内部滚动；触发器触控命中区在窄屏为 44px。

## 图渲染与动画运行时

| 依赖 | 版本 | 许可证 | 用途 | 分发方式 |
| --- | --- | --- | --- | --- |
| framer-motion | 13.5.1 | MIT | 表格行展开、药丸指示器、图表弧线与浮层动效 | 随客户端包静态打包；许可全文见 `licenses/framer-motion.txt` |
| lucide-react | 1.31.0 | ISC | 表格与导航图标 | 同上；许可全文见 `licenses/lucide-react.txt` |
| d3 | 7.9.2 | ISC | 图谱的力导向布局、缩放平移与适屏 | 以 vendored UMD 形式随客户端包静态打包；许可全文见 `licenses/d3.txt` |
| esbuild | 0.28.2 | MIT | 构建期把 TSX 组件与运行时打成单文件 | 仅构建期使用，不进入产物 |

以上均为项目的普通依赖，声明在 `devDependencies`，产物内为静态打包，运行期不解析任何 npm 包，也不在运行期从网络加载资源。

## 打包与许可随包发布

构建脚本 `scripts/build.mjs` 会把上述许可文本与一份 `NOTICE` 清单写入状态子包（`lib/status/licenses/` 与 `lib/status/NOTICE`），状态子包的 `files` 字段已包含 `licenses` 与 `NOTICE`。

客户端包内的第三方代码只包含两个来源：随包发布的 vendored 源码与构建期打包的依赖。宿主提供的 `react`、`react-dom` 与 `@deepseek-ai/*` 模块在打包时保持 external，经宿主注入的 `require` 解析，产物内不含第二份 React。

图谱链路的细节（d3 的本地作用域加载方式、Dependency Trace 的移植范围与未移植部分）另见 `docs/graph-components.md`。
