# Changelog

All notable changes to `dsh-layered-memory` are documented here.

## [0.6.0] - 2026-09-16

一句话：把「自动治理」重新喂回语义与守恒——L1 不再隐藏任何条目，覆盖写不再丢历史，公理由代码兜底。

### Fixed
- **`memory_write` 静默覆盖且不留历史（数据丢失级）**：所有覆盖写（write/update/accept/promote 复用）统一在写入前把旧版本快照到 `.history/`，返回体新增 `history` 与 `advisories`。此前只有显式 `memory_update` 会快照，而模型默认用 write。实测：本会话 3 次 write 若撞名即无痕覆盖。
- **同名 section 折叠**：`upsertFact` 此前只替换第一个同名段，第二个永久隐身且互相覆盖 meta；现在多余段先各自落 `.history/` 快照再折叠为一条（`action: "merged"`）。同时拒绝 fact 正文里的 `"## "` 行——它是幽灵 section 的来源（运行时实测 10+ 条）。
- **L1「写完即隐身」**：`maxIndexLines` 行数预算 + 热度裁剪整体废除。AUTO 段改为每层一行、`" | "` 全量列出活跃条目，预算单位换成字符数（与注入熔断 `l1MaxChars` 同源，默认 8192→12288）。旧机制实测把 88/104 条事实与 49/59 个 SOP 挤成不可见，而 `entryHeat` 的 recency 加分（=1）在有真实访问计数的老条目前必然排不进去，所以 CHANGELOG 声称的"写完即隐身已修"从未成立。
- **前缀抖动**：索引内容未变化时不再重写 `index.txt`（此前每次维护都按热度重排 → system prompt 前缀变化，打碎缓存）。
- **`agent/disposed` 丢缓冲**：dispose 前先把已捕获未消费的重试序列落 `pending/`（此前直接 delete，候选静默蒸发）。
- **`memory_promote` 证据旁路**：源条目无证据时不再用 `"promoted from namespace:X"` 占位串过关，改为新增 `evidence` 参数 + 缺失即拒绝。
- **脏命名空间**：`detectNamespace()` 在用户主目录下工作不再产出以用户名命名的空间（运行时实测残留 `39795/`、时间戳目录、`selftest*`、`headless`）。
- **文档-代码漂移**：CHANGELOG 声称的"写入后立即 bump 热度"与实现（写≠读）矛盾，随热度退出 L1 决策一并消解；README 的 `memory_stats.json`/裁剪段落同步为实际行为。

### Added
- **写入侧硬约束（公理落地为代码）**：疑似密钥明文（sk-/AKIA/GitHub token/PEM/Bearer/长 base64，纯 hex 哈希不误伤）直接拒写；topic 控制字符校验补正（`` 转义写错会让 `f` 字符误判）。
- **L0 判据回显**：`memory_write` 返回体附 `advisories`（topic 超长/含日期或 commit/撞名提示走 update/L1 超预算），把方法论放到决策点，借鉴 GA 的"写入动作同屏注入 L0"。
- **溯源自动补全**：`memory_write` 成功后由 `turn/end` 回写 `sourceSession`/`sourceSeqs`。实测此前 142 条记忆里 141 条 `sourceSeqs` 为空，`memory_expand` 形同虚设。
- **冷条目复核**：`memory_maintain` 新增 `cold` 段（创建 >90 天且衰减热度 <0.5），让热度遥测有真实消费者；只报告不动数据。
- **L0 模板新增「L1 词数 ROI 判据」**：存在性指针 vs 行为规则、反直觉触发词判定、改名优于加描述、禁值存储（源自 GA `memory_cleanup_sop.md` 的策展方法论）。
- 回归测试 `test/v06.test.mjs` 9 例（快照、正文 `##` 拒绝、密钥拒写、promote 证据、dup 折叠、索引幂等不重写、autoPending 默认关、dispose 落盘、溯源回写）；旧压缩用例改写为"超预算仍全量列出"契约。39/39 绿。

### Changed
- `autoPending` 默认 `true → false`。实测 6 天累积 108 条候选、archive 仅 7 文件（消费≈0），抽样内容全是工具用法噪声（TS 引号解析错、未知工具名、未读先写）。沉淀主路径回到主动 `memory_write`；`memory_pending`/`memory_accept` 保留给人工登记。
- 配置项 `maxIndexLines` 移除（无 profile 使用），L1 预算统一为 `l1MaxChars`。`memory_index`/`memory_list`/`memory_maintain` 返回体相应改为 `index_chars`/`rewritten`/`facts_listed` 等。
- 反思注入的 `overPending` 项仅在 `autoPending` 开启时生效；`overIndex` 改为字符预算判定。

### Breaking
- 配置项 `maxIndexLines` 删除；`memory_maintain` 报告的 `compress` 段改为 `index` + `cold`。L1 语义变化：不再存在"被裁剪的条目"，因此 `memory_search` 的"找回隐藏条目"用途自然消失（检索本身不变）。

### Not borrowed from GA（明确取舍）
- L4 原始会话归档（其 `compress_session.py` Phase4 连 too-small 原文件一起删，属不可逆丢数据；DSH 用 session log + `memory_expand` 更安全）；OS 级 12h 计划任务（本机红线）；无锁并发写与"只能 patch 禁 overwrite"的纯提示词纪律（已被 CAS/原子写/快照取代）；单命名空间大杂烩。

## [Unreleased]

### Fixed
- 跨进程更新丢失防护（CAS 读改写，三段关窗）：`facts.md` 与 `memory-meta.json` 的读改写改为「tmp 暂存 → rename 前一刻复核基座（校验与 rename 间不再夹耗时操作，窗口压至微秒级）→ rename 后回读兜底」，EPERM 退避每轮 sleep 后同样复核基座；被并发覆盖则重读重算（新基座已含胜者内容，单调收敛），持续冲突超 3s 预算响亮抛错，无锁无死锁。实测：40 进程错峰写 3×40/40 全收敛；全员同毫秒的极限争抢下残余 1-3 条丢失为无锁方案数学下限（双宿主间隔写不受影响）。`index.txt`（可随时重建）与热度/turn 计数（可容忍漂移）维持直写。
- 原子写 rename 瞬态重试：Windows 上 rename 覆盖瞬间被其他进程并发读/替换持有时抛 EPERM/EACCES/EBUSY（实测 40 进程争抢可复现），`atomicWriteFileSync` 对 rename 增加 ≤15 次递增退避+随机抖动（极端争抢约 0.6s 封顶），非瞬态错误码原样抛出。
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
- `events.js` 注释钉死自动蒸馏的键假设（主会话 `agent.id === session.id`），记录宿主解耦两种 id 时的正确修法方向与子代理路径的未验证状态。
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
