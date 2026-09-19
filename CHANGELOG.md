# Changelog

All notable changes to `dsh-layered-memory` are documented here.

## [0.6.6] - 2026-09-19

修复（反思提醒：从「存量阈值」改为「内容版本 + 维护终态」，2026-09-19 专项审查闭环）

背景：0.6.2/0.6.3 修通了此前被宿主重入守卫挡住的提醒投递，却没有同时修「什么时候不该再提醒」。判定只看 `pending` / 活跃 SOP / 索引字符的存量阈值，既不消费维护结果，也没有「这批内容已经检查过」的状态。于是健康记忆库（数十条互不重复的 SOP）一旦越过 `reflectSopsThreshold`，就会在新会话、重载与并行会话里反复把维护请求塞进当前任务。本次按专项审查（基线 `3729dfe`）的 12 项探针落地修复。

- **新增命名空间级反思状态 `src/reflection.js`**（落盘 `reflection-state.json`）：`revision`（内容指纹）+ `outcome`（`no_action` / `needs_review` / `done` / `failed`）+ `notifiedRevision`。指纹只取 `facts.md`、`index.txt`、`memory-meta.json`、`sops/*.md`、`pending/*.md` 的体积与 mtime，**排除** `turn-state.json`、访问热度、报告时间戳这类自写字段（否则每检查一次就把自己标脏，重新自激）。`no_action` 是有效终态：同一 revision 已有终态结论时静默，已通知过同一 revision 也静默。
- **维护结果回写**：`runMaintain()` 收尾调用 `recordMaintainOutcome()`，自动周期维护与手动 `memory_maintain` 共用同一份消警依据；失败单独记 `failed`（允许冷却后重试），不会被误判成「已检查过」。
- **冷却前置 + 廉价短路**：先判开关与冷却，再读状态、再做内容扫描。此前每轮 `turn/end` 都要遍历 SOP 并逐条 `isArchived`（每条重读整份 `memory-meta.json`，几十条 SOP 的一轮判定就是几十次全量解析），冷却期内也一样。
- **投递前二次复核**：排队中的提醒在真正投递前重读状态——插件已 dispose、该版本已被维护终结、或已通知过同一版本时直接丢弃，修掉「维护先跑完、旧提醒后送达」。
- **定时任务纳入生命周期**：`setTimeout` / `setImmediate` 句柄统一登记，插件清理时取消。此前卸载后已排队的提醒与周期维护仍会执行。
- **新增 `reflectionEnabled` 总开关**（默认 `true`）：关闭后只停「主动向会话投递整理请求」，不影响 L1 注入、检索、读取、主动写入与手动维护。此前没有真开关——`maintainEveryTurns=0` 只关周期维护，`autoPending=false` 只关自动候选分支，`reflectSopsThreshold=0` 反而是恒真。
- **阈值 0 语义修正**：`reflectSopsThreshold: 0` / `reflectPendingThreshold: 0` 现在是「关闭该判据」，不再恒满足。
- **提醒文本显式标注来源**：加「（插件自动提醒，非用户消息；与当前任务无关时可忽略）」，并对「没有重叠项就无需处理」给出终态说明。标注是辅助，确定性抑制由状态机负责——不改 `role`，宿主 `Agent.inject` 的契约就是 `UserMessage`。
- **`readMeta` 读取缓存**：键为 `size:mtime:ino`，写入方显式失效。`memory-meta.json` 达数百 KB 时，热路径不再逐条全量 `JSON.parse`。
- 回归：`test/v066.test.mjs`（11 例）覆盖审查 R1/R3/R4/R6/R7/R8/R9/R10/R12 场景与新增开关、缓存、指纹稳定性。全量 73/73 绿。

## [0.6.5] - 2026-09-18

修复（0.6.4 归档横幅的检索副作用）

- 0.6.4 把归档横幅写进正文后，`memory_search` 的 160 字符摘录会以横幅开头——实测 `c-drive-cleanup-20260917` 的摘录前 60 字符全是"已归档…历史快照…"，真正的内容只剩约 100 字符；同时索引里还多了"已归档/历史快照"这类与内容无关的 token，会污染 BM25 命中。现在检索侧统一先 `stripArchiveBanner()`（索引文本与摘录都剥），归档状态继续由返回值里的 `archived` 字段表达。横幅仍保留在文件正文里，供直接读文件/read 的人看到。

## [0.6.4] - 2026-09-18

修复（归档可见性 + 元数据补登记，来自第二轮记忆库语义体检）

- **归档正文会误导读者**：`memory_archive` 只把条目从 L1 索引隐藏，正文照旧留在 `facts.md` / `sops/*.md`。归档只改标志位，正文原样留在文件里，人工读文件或 `memory_search` 命中的读者会把历史快照当成现行事实。现在归档时在正文首部写一行自解释横幅（`> [已归档 YYYY-MM-DD] 历史快照：已不在 L1 索引中…`）；fact 走 `upsertFact` 保留 section 结构，SOP 横幅插在 `#` 标题行之后。任何再次写入（write / update / accept / rollback）都会先 `stripArchiveBanner`，取消归档不会残留过期标记。
- **条目缺 meta 记录**：`facts.md` 的 `##` section 与 `sops/*.md` 中可能存在 `memory-meta.json` 完全没有记录的条目（旧版本迁移、examples 种子、跨机导入）——这部分条目没有 updatedAt 与证据追踪，冷条目复核只能报 `age_days=null`。新增 `backfillMeta()`：只补「存在性 + 文件 mtime」并标 `backfilled: true`，**不把正文里的证据行抄进 `evidence`**（那会把别处的验证冒充成本次验证，违反行动验证公理）。插件加载期自动补登记并 log 条数；`memory_index` 也会顺带补并在返回值里报告 `backfilled` 列表。幂等，无缺失时不写文件。

## [0.6.3] - 2026-09-18

修复（Agent Teams 多会话交互 + 反思注入 payload 形状）
- 背景：开启官方 `dsh-experimental-agent-team-profile` / `-web-profile` 后，同一进程内会并发存在 N 个 teammate 会话（`session.header.parentSession` 非空），它们各自发 `turn/end`。增量审查实测确认下列后果。
- **轮次计数被 teammate 灌水**：`bumpTurnCounter` 是无类别过滤的全局持久计数，`maintainEveryTurns=20` 的语义被稀释为「全进程 20 次 turn/end」，N 个 teammate 时提前约 N 倍触发，且触发者可能是 teammate。现只对交互（无 parentSession）会话 +1；headless 一次性会话与无 header 的旧调用形状仍计入（原语义保留）。
- **反思注入不分会话类别**：`agents.get(sessionId)` 对 teammate 会话同样命中（宿主强制 `agent.id === session.id`），一旦注入可用，每个 teammate 首轮都会收到「请去改共享记忆」的提示，诱导只读型 teammate 写共享记忆库。现与计数同源，只对交互会话注入。
- **注入 payload 不合宿主 `UserMessage` 形状**：宿主 `Agent.inject` 只做 `inbox.splice`、完全不校验形状，此前缺 `id`/`role` 的字面量不会抛错，而是把一条畸形 user 消息直接落进会话历史。现补 `id`（`randomUUID`）+ `role: "user"`。不用 `dsh-llm` 的 `createUserMessage`——它在本仓仅 devDependency，运行时 import 会引入未声明依赖。
- **周期维护在 append 同步发布窗口内执行**：`runMaintain` 实测一次约 1.26s（去重 O(n²) + 重写 index.txt + 写报告），此前直接跑在观察器同步段，拖长该窗口并与其它观察器的重入守卫相邻。现移到 `setImmediate`，并加 10 分钟最短间隔节流，避免多会话密集 turn/end 时同一阈值被重复排队。
- **静默失败补诊断**：反思判定通过但 `agent` 缺失 / `inject` 不可调用时此前无任何输出（这正是「修复已装但宿主未重启 → 功能看起来死了」难以自证的原因）。现补一次性 `warnOnce("reflect-skip", ...)`，打印 pending/sops/index/autoPending/cooldown 全部判据值。
- 回归：`test/v063.test.mjs`（teammate 不计数不注入 + 交互会话计数并注入 + payload 带 id/role；无 header 旧形状仍算交互）。全量 58/58 绿。

## [0.6.2] - 2026-09-18

修复（反思注入撞宿主重入守卫）
- turn/end 观察器在宿主 `Session.append` 发布窗口内同步调用 `agent.inject`，必抛 `session append cannot reenter while another append is being published`。该失败自 0.1.6 宿主起就存在（0.6.0 被整段空 catch 静默吞掉，反思提醒实际从未送达；0.6.1 按审查项 N7 拆防护后转为响亮 warnOnce，即用户可见的告警堆栈）。
- 修法：inject 延迟到下一宏任务（`setTimeout 0`）让本次发布先收口；期间 agent 若被 dispose 仍由 warnOnce 接住；`reflectionState` 冷却标记保持同步更新，不重复调度。回归 `test/v062.test.mjs`（同步阶段零调用 + 下一宏任务送达 + 冷却不重发，56/56 全绿）。

## [0.6.1] - 2026-09-18

一句话：官方规范审查（report-20260918-layered-memory）4 MAJOR + 14 MINOR 全量闭环——输出契约恢复类型化投影、注入面校验缺口收口、热路径去同步 spawn、静默失败全部点名。

### Fixed
- **M1 `memory_maintain` 在老库上整包失败（已知 bug 清除）**：`createdAt` 缺失/非法时 `age_days` 为 Infinity（`Math.round` 后仍非有限），宿主判结果「not lossless JSON」整包拒收。根因消毒为 null（`heat` 同法），出口包装 `pruneUndefined` 升级为「undefined 键剥离 + 非有限数→null」，从类上根治。
- **M4 `memory_rollback` fact 路径幽灵 section 注入**：此前唯一绕过 topic 控制字符校验的 `## ` 写入口——`"x\n## evil"` 经 slugify 可命中同前缀历史快照并注入 facts.md、随 syncIndex 进入每轮 L1 系统上下文。现复用写入侧单源 `assertSafeTopic`（rollback/archive/expand/promote/accept 全部收口），并对回滚快照正文的 `"## "` 行做纵深拒绝。
- N1 `casRewrite` 竞争分支 `rmSync` 未导入：ReferenceError 被空 catch 吞掉且永久泄漏 `.facts.md.tmp-*`。补导入、catch 点名错误类型、新增竞争清理回归（阴性对照验证）。
- N7 `turn/end` 约 70 行大空 catch 拆分为解析/溯源/蒸馏/维护/反思五段各自防护 + `warnOnce` 一次性 console.warn；`agent.inject` 单独 try/catch 防已 dispose 的 agent，失败不再连带跳过 reflectionState 更新。
- N12 `writePending` 落盘前对重试序列错误/结果尾部过 `detectSecret`（与 accept 侧同一函数），命中整段替换为 `[redacted:<pattern>]`——凭证不再先进盘后被拦。
- N13 `snapshotEntry` 失败不再静默返回 `""`：返回 `{ path, error }`，`writeMemory` 把「快照失败，旧版本未保留：<原因>」汇入 advisories 首条（覆盖写仍继续，拒写才会丢新数据；strict 抛错配置未引入，见下）。
- N11 重试序列候选接受为 fact 的死路组合：accept 路径把候选正文 `"## "` 行自动降级 `"### "`（仅接受路径；正式写入侧硬约束不变）。
- N4 `maintainEveryTurns`/`reflectPendingThreshold`/`reflectSopsThreshold`/`reflectCooldownTurns` 提为 `Schema.natural()`（非负整数），-1/2.5 等无效值在插件加载期响亮失败。
- N10 CHANGELOG 陈旧 `[Unreleased]` 节整体并入 0.6.0（矛盾表述按现行行为修订），该节删除。

### Added
- **M2 输出契约（PTC 可编程性）**：14 个 `memory_*` 工具 output.schema 从裸开放对象恢复为「稳定字段声明（properties + required）+ `additionalProperties: true` 保持开放」——声明字段获得类型投影，新增字段不再因漂移拒收；`normalizeMeta`/expand 的 `sourceSeqs` 归一 number[] 兜底老库垃圾值。
- M3 性能：`detectNamespace` 进程内 memoize（key=cwd，TTL 新配置 `namespaceCacheTtlMs` 默认 60s、0 关闭），autoNamespace 默认路径不再每轮 prompt 装配/每次工具执行同步 spawn git；命名空间布局 ensure 移出逐轮求值路径（每个 root 一次；工具写路径仍显式 ensure）。
- N5 `coldReviewDays` 入 Config 并穿透 maintainOpts；`L1_MAX_CHARS_DEFAULT` 导出常量单源（N6，原 12288 字面量散落 4 处）。
- N8 `memory_expand` 遵守 `exec.signal`（readSession 前后各查 aborted）。
- I7 5 个同步 execute 统一 async；I9 read/list/search/stats/pending 声明 `isConcurrencySafe`。
- I4 `memory_activate` 重复激活返回 `{activated:true, already:true, tools:[…14]}` 可判定规范值（此前与失败同形），schema 补 `already` 声明。
- 回归测试 `test/v061.test.mjs` 16 例（M1-M4、M2 契约含宿主 validateJsonSchemaValue 实测、M3 缓存零 spawn、N4/N6/N11/N12/N13、I4）。39→55 全绿。

### Changed
- N14 按官方 framework/service 语义修 inject 矛盾：`sessionQuery` 移出 inject（可选依赖=使用点 ctx.get + 「服务不可用」规范值降级）；`agents`/`systemPrompt` 保留必需并删除永不可达的 `Boolean(agents)`/`if (sysPrompt)` 死分支；旧「未 inject 时 ctx.get 恒 undefined」注释基于旧版 cordis（4.0.2 源码注释明确 get 无 inject 要求），已更正。
- N2 删除零 import 的 `@deepseek-ai/dsh-system-prompt` peer（运行期 ctx 服务不需要包级依赖，缩小私有 peer 解析面）；N3 files 补 `CHANGELOG.md`（README 链接不再成安装产物死链，pack 19→20 文件）。
- I5 反思注入归因 `source.plugin` 由 skill 名 `memory` 改为插件名 `layered-memory`。
- I6 `memory_maintain` 工具描述从生效配置动态拼接阈值，并修正 v0.6 已废除的「按热度压缩 L1」陈旧表述。
- N9 README（中英）配置样例补全 6 个缺项字段并登记本轮新字段；I1/I2/I3 陈旧版本注释与 skill 存储布局重复行修正。

### 审查发现处置豁免记录（判据不适用 / 策略取舍）
- N5 展示常量：冷条目 limit=10、合并候选 slice(0,20)、search 钳位 1..50 非「不同部署可能不同值」的调优参数，按报告允许注明保留。
- N8 豁免面：其余工具为毫秒级同步文件操作（同 tick 原子完成，取消无从更快）与 `runMaintain` 长同步循环（JS 不可抢占），维持不检查 signal。
- N13 strict 配置（快照失败抛错拒写）未引入：拒写会同时丢新数据，响亮 advisory 是现取舍。
- I8 tsc --noEmit 不适用（纯 JS 仓库，无 tsconfig；语法=node --check、行为=vitest 双门禁）；引入 checkJs 属工具链大改，超出修复轮范围。
- I9 timeoutMs（maintain 大库协作预算）为非规范要求项，本轮未引入。
- I10 报告基线漂移说明：本轮全部修复基于 main c789dfe（审查基线 4d0ffd0 的 CI 后代，src/lib/test/docs 零差异）。

### Verification
- `npm test`（pnpm build + vitest）55/55 绿；`node --check` 全部 src/*.js + lib/index.js 通过；`npm pack --dry-run` 20 文件含 CHANGELOG.md；M1/N1/M4 关键回归做过去除修复的阴性对照。

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
- L4 原始会话归档（其 `compress_session.py` Phase4 连 too-small 原文件一起删，属不可逆丢数据；DSH 用 session log + `memory_expand` 更安全）；OS 级 12h 计划任务（未采纳）；无锁并发写与"只能 patch 禁 overwrite"的纯提示词纪律（已被 CAS/原子写/快照取代）；单命名空间大杂烩。

### 并入自陈旧 [Unreleased]（N10：0.5.2→0.6.0 期间已交付，0.6.1 审查修复轮折叠；原节整体删除）
- 跨进程更新丢失防护（CAS 读改写三段关窗：tmp 暂存 → rename 前一刻复核基座 → rename 后回读兜底；EPERM 退避每轮再复核；持续冲突超 3s 预算响亮抛错绝不静默丢。实测 40 进程错峰写 3×40/40 收敛）。`index.txt` 与热度/turn 计数维持直写（可随时重建 / 可容忍漂移）。
- 持久化全部改为原子写（`atomic-write.js` 同目录 tmp + rename，21 处写点）；Windows rename 瞬态 EPERM/EACCES/EBUSY ≤15 次递增退避 + 抖动重试。
- `memory_update` 不再以占位串 `memory_update（历史更新）` 伪造 evidence 落库（与 write/accept 一致硬性要求证据）。
- `sopNames()` 保留名过滤（README/LICENSE/index 不计入 L3 统计、索引与合并候选）；`memory-meta.json` 首建补 `createdAt`、更新保留原创建时间。
- L1 注入面防护：注入前控制字符剥离 + 长度熔断（与 `l1MaxChars` 同源，默认 12288——旧节「≤8KB」表述按现行修订）+ `<memory_index source="user-writable">` sentinel；含换行/控制字符的 topic 拒写。
- 移除死代码 `ensureIndexRule`；README/SKILL 的 `memory_stats.json` 更正为实际写出的 `maintenance-report.json`；`events.js` 键混用假设注释钉死。
- 该节中与 v0.6 现行行为矛盾的「写入后立即 bump 热度」「超限时两层至少各保留一个指针并显示隐藏数量」等条目（旧压缩机制）不予保留——热度只服务冷条目复核、L1 全量列出不裁剪。

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
