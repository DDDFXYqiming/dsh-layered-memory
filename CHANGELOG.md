# Changelog

All notable changes to `dsh-layered-memory` are documented here.

## [Unreleased]

### Fixed
- `memory_update` 在新旧条目均无证据时不再以占位串 `memory_update（历史更新）` 伪造 evidence 落库；与 `memory_write`/`memory_accept` 一致硬性要求证据，缺失即抛错。
- **新条目"写完即隐身"修复**：`memory_write` 写入后立即 bump 热度；`memory_maintain` 压缩排序加入 recency 保护（7 天内创建、无访问热度的条目获得加分），新写入的 fact/sop 不再被压缩立刻裁出 L1。
- **非 SOP 文件混入 L3 修复**：`sopNames()` 过滤保留名（README/LICENSE/index，大小写不敏感），安装/文档文件不再计入 L3 统计、索引与合并候选。
- 补齐 `memory-meta.json` 的 `createdAt`：首建记录、更新保留原创建时间（此前仅写 `updatedAt`，recency 无据可查）。
- 新增回归测试：README/LICENSE 过滤、recency 保护（陈旧条目被裁时新鲜条目保留）。
- 文档：README/SKILL 补充 recency 保护、写入即热、保留名过滤说明。
- 修复 `memory_maintain` 因尾部空行、错误行数预算而过度裁剪 L1 索引的问题。
- L1 指针改为逐条逻辑行；索引未超限时完整保留，超限时两层至少各保留一个指针并显示隐藏数量。
- 增加 `memory_maintain` 的完整索引、空行、超限裁剪和底层记忆可读性回归测试。

### Changed
- `maintain.js` 近重复检测的注释与内部变量命名精确化：实际为词元集合 Jaccard（忽略词频与顺序），非 shingle Jaccard；零逻辑变更。
- **持久化全部改为原子写**（`atomic-write.js`：同目录临时文件 + rename 覆盖，21 处写点）：宿主崩溃/强杀不再留下写一半的 `memory-meta.json` / `index.txt` / `facts.md` / `file_access_stats.json` / `turn-state.json` / 归档与历史快照。
- **L1 注入面防护**：system prompt 注入前对索引做 ≤8KB 熔断 + 控制字符剥离，并包在 `<memory_index source="user-writable">` sentinel 内；`memory_write` 拒绝含换行/控制字符的 topic（防 section 解析错位与提示词注入载体）。
- 移除死代码 `ensureIndexRule`（零引用）；README/SKILL 的 `memory_stats.json` 更正为实际写出的 `maintenance-report.json`；合并重复的 `[Unreleased]` 节。
- 新增回归测试 ×3：原子写无残留临时文件、topic 控制字符拒绝、L1 sentinel/熔断注入。

## [0.5.2] - 2026-08-21

### Fixed
- **`memory_pending` 列表摘要失效**：渲染逻辑取"候选内容最后一行"的前 120 字符，而末行通常是空行 → 列表看起来只有文件名。新增 `pendingSummary`：按优先级提取 `kind=`、`错误尾部`、`成功结果尾部`、"本回合有 N 个…"统计行或首个非空正文行（带 `[kind]` 前缀，上限 160 字符）。`pendingSummary` 已导出供测试引用。
- **`memory_read` 的 related 指针显示 `undefined（未找到）`**：`resolveRelated` 是死代码（只定义未调用），`meta.related` 原样字符串数组被 render 当对象读。修复：execute 时生成 `meta.related_states`（`[{name,state}]`，state∈active/archived/missing），`meta.related` 保持历史字符串数组契约不变（既有测试断言语义保留）；`formatRelated` 兼容两种形态。
- **L3 读取出现重复一级标题**：写入模板自动加 `# 标题`，若 content 首行自带同名标题则文件有两行标题。新增 `stripLeadingTitle`：循环删除与 topic/slug 同名的首部标题行（含紧随空行），正文其他一级标题不动。
- **pnpm 11 预检拦截 `pnpm test`**：`verify-deps-before-run` 的 `.npmrc` kebab 写法对 pnpm 11 无效，run 前依赖检查尝试解析 peer 链中的私有包 `@deepseek-ai/dsh-type-meta`（registry 404）。修复：`pnpm-workspace.yaml` 顶层声明 `verifyDepsBeforeRun: false`（实测生效）；README 记录兜底 `./node_modules/.bin/vitest run`。

### Added
- Regression 测试 ×3：related_states 解析（含归档后状态翻转）、L3 重复标题 strip、pendingSummary 提取优先级。

### Verification
- `pnpm test` 27/27 green（10 + 17；含新增 3 例）；`dsh --profile headless` 隔离 CLI 全量自测（selftest-cli 命名空间，10 个工具闭环 write/read/search/list/update/archive/rollback/expand/index/stats/maintain/pending）RESULT: PASS。

## [0.5.1] - 2026-08-21

### Fixed
- **memory_write 输出被 output schema 拒绝**：压缩路径返回 `index.facts_hidden` / `index.sops_hidden` 未在 schema 声明（`additionalProperties: false`），宿主工具运行器报 `value.index.facts_hidden is not a declared property`。
- **memory_update 输出 lossless JSON 违规**：`history: historyPath || undefined` 在无历史快照时产生显式 `undefined` 键，被 JSON 序列化丢弃后判为不可无损往返。

### Changed
- **全量瘦身：删除全部输出校验声明（净删 236 行）**。14 个工具的 output schema 塌缩为宿主编译器允许的最小开放形态 `{ type: "object", additionalProperties: true }`——校验层从此只保证结果可传输，不再约束内容；任何字段漂移都不可能拒绝写入。render 展示层与 `pruneUndefined` 出口消毒保留（递归剥离显式 `undefined` 键，从根上消除 lossless JSON 违规这一类问题）。
- 死码 `similarity.shingles`（零引用）一并删除；schema 一致性回归测试替换为无损 JSON 往返回归（覆盖 memory_write 压缩路径与 memory_update 无历史快照路径）。

## [0.5.0] - 2026-08-21

### Added
- **`memory_search`（BM25 全文检索）**：覆盖 L2 facts / L3 sops / 归档条目，`all_namespaces` 跨库检索——L1 被裁剪的隐藏条目从此可主动找回。分词为 ASCII 词 + 单数字 + CJK bigram（无模型）。
- **内容级近重复去重**：分词集合 Jaccard ≥0.85 判近重复（同事实微编辑版本）自动归档并保留 citation；过短内容（<12 词元）只走精确 hash，防误判。
- **内容级合并候选**：`memory_maintain` 的合并候选改为内容 Jaccard ≥0.45 报告（旧版按文件名分词配对，实测全部误报）；名称重叠仅作提示字段。
- **`memory_promote`**：跨命名空间提升记忆（项目局部经验 → 全局 default），源条目归档保留可回溯。
- **记忆链接（related）**：`memory_write`/`memory_update`/`memory_accept` 支持关联条目，`memory_read` 回显关联指针与状态。
- **写入即压缩**：`memory_write` 检测到 L1 超限立即按热度压缩（贪心装入、逐步真实行数核算，含空层占位行）；告警只在压缩后仍超限时出现一次。
- **热度衰减**：访问计数按 14 天半衰衰减（`{count, lastAt}` v2 格式，旧版纯数字自动迁移）；写入不再计入热度（写≠读）；新建 7 天 recency 保护保留。
- **阈值反思注入**：废除每 10 轮固定提醒；pending≥`reflectPendingThreshold`(5) / SOP≥`reflectSopsThreshold`(40) / 索引超限时注入带具体内容的整理请求（10 轮冷却）。
- **turn 计数持久化**：`turn-state.json` 跨会话累计，headless 一次性会话也能触发周期维护。

### Changed
- **auto-pending 重做**：只捕获「同工具先失败后成功」的重试序列（含错误/结果尾部摘要）写入 pending；普通成功调用不再产生垃圾候选。
- **源码化**：单文件 65.7KB `lib/index.js` 拆分为 `src/` 11 个模块（templates/similarity/store/l1index/memory-ops/maintain/search/tools/events/apply/skill-content），`lib/index.js` 变为薄出口；修复文件头 v0.3 与 package.json 0.4.0 的版本漂移。
- **移除 SKILL.md**：dsh 插件不是 skill；runtime skill 内容内联至 `src/skill-content.js`。
- 测试从 10 个扩展到 23 个（新增相似度/近重复/合并候选/检索/写入即压缩/关联/promote/重试序列/热度衰减覆盖）。

### Fixed
- 压缩预算核算修复：空层占位行（`[L3] （空）`）此前不计入预算，导致压缩结果可能仍超限 1 行（v0.4 遗留）。

## [0.4.0] - 2026-08-16

### Added
- `memory_stats` 工具：统计 L2/L3/pending/archived/大小。
- `memory_maintain` 工具：去重、压缩 L1 索引、生成统计、产出可合并 SOP 候选。
- 自动维护：`maintainEveryTurns` 配置（默认 20），turn/end 低频率触发 `runMaintain`。
- 测试与 CI：vitest 单元测试 + GitHub Actions（build/test/headless smoke）。
- `dsh-plugin` 关键词与发布工程化基础。

### Changed
- 命名空间隔离：存储布局支持 `<memoryDir>/<namespace>/...`，`default` 兼容旧根目录。
- 溯源/审计：`memory-meta.json` 记录 `sourceSession` / `sourceSeqs` / `createdAt` / `updatedAt` / `evidence`。
- 自动蒸馏：turn/end 将成功工具调用写入 `pending/` 候选区，`memory_accept` 确认后入正式记忆。
- 冲突/过期：`memory_update`（supersede）、`memory_archive`、`memory_rollback`，旧版本保留在 `.history/` / `archive/`。
- `memory_expand`：通过 `ctx.sessionQuery` 展开原始 session 事件。

### Fixed
- `memory_archive` 后 `memory_read` 不再返回已归档内容：归档记忆只保留在 `archive/` / meta 中，可通过 `memory_rollback` 恢复，但常规 `memory_read` 返回 `not_found`。

## [0.1.0] - 2026-08-14

### Added
- 初始版本：L1 索引注入 + L2 facts + L3 sops + 行动验证写入。
