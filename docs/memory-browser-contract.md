# 记忆管理页 · 前后端接口契约（Lead 定稿，双方严格遵守）

## 落地位置
- 仓库：/home/dsh/src/dsh-layered-memory（安装副本，直接在此开发；Lead 最后同步回源 clone 提交）
- 管理页做进 status 子包 @dsh-external/dsh-layered-memory-status（复用现有 client bundle + typert 通道，安装链路不变）
- 构建：node scripts/build.mjs（会把 src/status.js、status-contract.js、client/* 组装进 lib/status/）

## 服务端 → 前端数据通道
主包新增服务 `layeredMemoryStore`（src/store-service.js，apply.js 里 ctx.provide）。
status 子包 src/status.js 的 inject 数组追加 "layeredMemoryStore"，typert.register 的 invocations 追加 STORE_REMOTE.descriptors。
前端通过现有 typert remote 调用下列方法（与 status 现有 invocations 同一通道、同一调用方式）。

## 方法签名（全部 async，参数/返回均为 JSON 可序列化）
entry 标识一律 { namespace: string, kind: "fact"|"sop", key: string }。

1. listNamespaces() → Array<{ namespace: string, workspace: string|null }>
   当前空间排最前，default 其次，其余按名字排序。

2. listEntries({ namespace, kind?, query?, includeArchived? }) → Array<{
     entry, title: string, archived: boolean, updatedAt: string|null, chars: number
   }>
   - kind 省略 = 全部；query 省略 = 不过滤（大小写不敏感子串，匹配 title+正文）
   - 按 updatedAt 降序（无日期的排后，按 title 排序）
   - 上限 500 条

3. readEntry({ entry }) → { entry, title, content, revision, archived,
     evidence: string, sourceSession: string|null, createdAt: string|null, updatedAt: string|null }

4. createEntry({ namespace, kind, topic, content, evidence }) → { entry, revision }
   复用现有 memory_write 路径（含证据与索引重建）。

5. updateEntry({ entry, content, evidence?, ifRevision? }) → { revision }
   复用现有 memory_update 路径；ifRevision 提供且不匹配时报错 { code: "revision_conflict" }。
   evidence 省略 = 纯措辞更新（沿用原来源）。

6. setArchived({ entry, archived: boolean }) → { ok: true }
   归档/取消归档，复用现有 memory_archive 路径（先存历史快照）。

7. entryHistory({ entry }) → Array<{ snapshotId: string, createdAt: string, revision: string, chars: number }>
   按时间降序，上限 50。

8. rollbackEntry({ entry, snapshotId }) → { revision }
   复用现有 memory_rollback 路径。

## 错误约定
远程方法抛错消息为中文人类可读；revision 冲突消息含 "revision_conflict" 字样。

## 页面要求（前端）
- slots.inject("sidebar.panellist") 注册“记忆”入口（icon 用记忆/书本类，order 参考官方 schedule=10，我们用 20）
- slots.inject("main") 注册页面 key "layered-memory"
- 布局：顶部工具行（namespace 下拉 + 搜索框 + kind 过滤 tabs：全部/fact/sop + 是否显示已归档开关）
  左侧条目列表（标题 + kind 徽标 + 归档置灰），右侧详情：
  标题、命名空间/kind/key 只读信息、内容 textarea（等宽）、证据输入、保存按钮、
  归档/恢复按钮、历史快照列表（每条带“回滚到此版本”按钮，二次确认）
- 新建条目按钮（弹层或内联表单：namespace、kind、topic、content、evidence）
- 保存用 updateEntry 带 ifRevision 防冲突；冲突时提示并给出“重新加载”
- 全部写操作后刷新列表与详情 revision
- 视觉：沿用官方 --dsw-alias-* CSS 变量与 @deepseek-ai/dsh-client-ui-primitives 组件，
  排版参照官方 schedule 管理页（pageHeading h1 20px/500、filterTab 圆角 14px、搜索框 36px 高 12px 圆角等）
- 文案中文，代码注释中文，引号用全角双引号

