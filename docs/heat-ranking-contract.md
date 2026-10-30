# 热度排序契约（0.10.0-preview.19 起已实现）

目标：**热度决定“优先推荐谁”，永远不决定“谁还存在、谁还能被找到”。**

热度排序自 0.10.0-preview.19 落地，0.10.0-preview.20 起排序快照按用户回合刷新。下文描述当前实现。

## 硬约束（不得违反）

1. `index.txt` 磁盘索引永远保存全部活跃条目，顺序仍按 facts.md / sops 文件名，不因热度改写。
2. `memory_search` / `memory_list` 永远查全量，不读热度、不截断。
3. 热度不触发自动归档；低热度只影响提示词视图的排序与“探索位”。
4. 纯 Markdown + JSON，不引入数据库/嵌入/外部服务。

## src/heat.js

导出常量与函数：

```js
export const NEW_ENTRY_DAYS_DEFAULT = 7;
export const NEW_ENTRY_BONUS_DEFAULT = 1.5;
export const RELATED_BONUS_DEFAULT = 0.25;
export const RELATED_BONUS_CAP_DEFAULT = 0.5;
export const COLD_EXPLORE_RATIO_DEFAULT = 0.12;
export const COLD_EXPLORE_MAX = 24;

export function entryId(kind, key)            // => "fact:xxx" / "sop:xxx"
export function relatedIncoming(entries)      // => Map<id, 入链数>
export function newbieBonus(meta, opts)       // 线性衰减：0 天=bonus，days 天=0
export function scoreEntries(entries, opts)   // => Map<id, {score, base, related, newbie, createdAt, lastAt}>
export function rankEntries(entries, scores)  // => Map<id, 序号>；score 降序，同分新条目优先，再按稳定序
export function pickColdSet(orderedIds, opts) // => Set<id>；从热窗口（前 COLD_POOL_START=24 条）之外的全部
                                              //    条目里按 hash(sessionSeed|id) 轮转挑 max(1, ceil(total*ratio)) 条（≤max）
export function recallEntries(entries, query, opts) // BM25，=> [{entry:{kind,key}, score, title}]
```

score = 衰减访问分（store.entryHeat）+ min(relatedCap, 入链数×relatedBonus) + newbieBonus。
访问分只在真实 `memory_read` 时累加：
- 同会话同条目只计一次（access 记录 `lastSession`）；
- 维护工作进程（`io.isMaintenance(agent)`）读取不计；
- `memory_search` 命中不计；
- index/rules/policy 读取不计。

## src/store.js

`bumpAccess(root, key, { halfLifeDays, sessionId })`：`sessionId` 与记录里的 `lastSession` 相同时直接返回，不重复计分。

## src/l1index.js

```js
buildPromptIndex(indexText, maxChars, namespace, options = {})
buildCombinedPromptIndex(memoryDir, namespace, {
  projectMaxChars, globalMaxChars,
  forNamespace?: (ns) => ({ rank?: Map<id,number>, cold?: Set<id>, recall?: { lines: string[], budget?: number } })
})
```

项目索引的默认预算取配置项 `l1MaxChars`（默认 12288），全局索引的默认预算取配置项 `globalL1MaxChars`（默认 2048）。

- `rank` 存在时：fact/sop 两层按 rank 升序输出（预算够也排序，热的在前）；rank 里没有的 id 视为 -Infinity（新条目置顶）。
- 截断时：先按 rank 顺序填充，同时为 `cold` 集合里未被选中的条目保留最多 `COLD_EXPLORE_RATIO` 的层预算作为探索位；冷条目追加在热条目之后输出。省略提示保持现有文案风格（`（较早的 N 条已省略；memory_list 可列举全部）`）。
- `recall.lines` 非空时，在规则之后、条目之前插入一段：
  `召回（与本次请求相关）：[fact] a | [sop] b`，预算 `min(recall.budget ?? 600, cap*0.12)`，超了截断并加 `…`；与条目层重复的只保留召回段。
- 不传 options 时输出与旧实现逐字节一致（向后兼容）。

## src/apply.js

- Config 中的热度与召回项：`heatNewEntryDays`(7)、`heatNewEntryBonus`(1.5)、`heatRelatedBonus`(0.25)、`heatRelatedCap`(0.5)、`l1ColdExploreRatio`(0.12)、`recallLimit`(8)。
- 每回合热度快照：`Map<sessionId, Map<namespace, Map<id, rankIndex>>>`。每个用户回合首次装配时用当前热度算 rank 并缓存；同一回合后续装配沿用缓存顺序（新出现条目 rank=-Infinity），下一条 user 消息清空该会话缓存并递增回合序号。`agent/pre-step` 只更新召回 query，不重复开启回合；会话结束时清理（上限 200 个会话）。一次 memory_read 不改变当前回合的提示词顺序。
- 当前用户请求：在 `agent/pre-step`（调用 next 之前）记录最新 user 文本到 Map<agent, string>；prompt 变量回调读取它作为召回 query。
- `systemPrompt.variable("layered_memory_index")` 注册时传入 `forNamespace`：读 entries → scoreEntries → 取/建会话 rank 快照 → pickColdSet → recallEntries(query) → lines。
- `buildTools` 传入 `isMaintenance` 回调：主调用传 `maintenance?.owns(agent)`，maintenanceTools 传 `() => true`。

## src/tools.js

`memory_read` 的 `bumpAccess` 调用传入 `sessionId: exec.agent?.session.id`，并在 `io.isMaintenance?.(exec.agent)` 为真时跳过计分。

## 验收

隔离临时 memoryDir + 真实 apply() 装配，覆盖以下 9 项：
1. 全量底座：小预算截断后 index.txt / memory_list / memory_search 仍含全部活跃条目。
2. 排序：高热度条目在提示视图靠前；预算够时所有条目仍出现。
3. 截断保护：冷条目有探索位，不会永久隐身（不同 sessionSeed 轮换）。
4. 计分：同会话重复 read 只 +1；维护读不计；search 不计。
5. related 小额加分且封顶；新条目有新手保护。
6. 用户回合快照：同一回合反复装配顺序不变；下一用户回合在同一个长会话里按新热度刷新，冷探索种子随回合轮换。
7. 召回：低热度但正文匹配当前请求的条目出现在“召回”段。
8. 规则段仍最先且完整（预算内）。
9. 无 options 时 buildPromptIndex 输出与旧行为一致。

脚本 `scripts/e2e-heat.mjs` 逐条打印 `PASS/FAIL` 与关键数值，末尾打印 `SUMMARY 通过数/已实现数`，失败退出码非 0。可执行 `npm run e2e:heat` 跑完 9 项，运行前需装好仓库开发依赖。
