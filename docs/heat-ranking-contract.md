# 热度排序契约（v0.11 设计稿）

目标：**热度决定“优先推荐谁”，永远不决定“谁还存在、谁还能被找到”。**

## 硬约束（不得违反）

1. `index.txt` 磁盘索引永远保存全部活跃条目，顺序仍按 facts.md / sops 文件名，不因热度改写。
2. `memory_search` / `memory_list` 永远查全量，不读热度、不截断。
3. 热度不触发自动归档；低热度只影响提示词视图的排序与“探索位”。
4. 纯 Markdown + JSON，不引入数据库/嵌入/外部服务。

## 新模块 src/heat.js（Lead 实现）

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
                                              //    条目里按 hash(sessionSeed|id) 轮转挑 ceil(total*ratio) 条（≤max）
export function recallEntries(entries, query, opts) // BM25，=> [{entry:{kind,key}, score, title}]
```

score = 衰减访问分（store.entryHeat）+ min(relatedCap, 入链数×relatedBonus) + newbieBonus。
访问分只在真实 `memory_read` 时累加：
- 同会话同条目只计一次（access 记录 `lastSession`）；
- 维护工作进程（`io.isMaintenance(agent)`）读取不计；
- `memory_search` 命中不计；
- index/rules/policy 读取不计。

## store.js 变更（Lead 实现）

`bumpAccess(root, key, { halfLifeDays, sessionId })`：`sessionId` 与记录里的 `lastSession` 相同时直接返回，不重复计分。

## l1index.js 变更（Lead 实现）

```js
buildPromptIndex(indexText, maxChars, namespace, options = {})
buildCombinedPromptIndex(memoryDir, namespace, {
  projectMaxChars, globalMaxChars,
  forNamespace?: (ns) => ({ rank?: Map<id,number>, cold?: Set<id>, recall?: { lines: string[], budget?: number } })
})
```

- `rank` 存在时：fact/sop 两层按 rank 升序输出（预算够也排序，热的在前）；rank 里没有的 id 视为 -Infinity（新条目置顶）。
- 截断时：先按 rank 顺序填充，同时为 `cold` 集合里未被选中的条目保留最多 `COLD_EXPLORE_RATIO` 的层预算作为探索位；冷条目追加在热条目之后输出。省略提示保持现有文案风格（`（较早的 N 条已省略；memory_list 可列举全部）`）。
- `recall.lines` 非空时，在规则之后、条目之前插入一段：
  `召回（与本次请求相关）：[fact] a | [sop] b`，预算 `min(recall.budget ?? 600, cap*0.12)`，超了截断并加 `…`；与条目层重复的只保留召回段。
- 无 options 时行为与现在完全一致（向后兼容）。

## apply.js 变更（teammate: wiring）

- 新增 Config：`heatNewEntryDays`(7)、`heatNewEntryBonus`(1.5)、`heatRelatedBonus`(0.25)、`heatRelatedCap`(0.5)、`l1ColdExploreRatio`(0.12)、`recallLimit`(8)。
- 每会话热度快照：`Map<sessionId, Map<id, rankIndex>>`。首次为该会话装配提示时用当前热度算 rank 并缓存；之后同一会话沿用缓存顺序（新出现条目 rank=-Infinity），会话结束/代理销毁时清理（上限 200 个会话）。**不要**因一次 memory_read 改变当前会话提示顺序。
- 当前用户请求：在 `agent/pre-step`（调用 next 之前）记录最新 user 文本到 Map<agent, string>；prompt 变量回调读取它作为召回 query。
- `systemPrompt.variable("layered_memory_index")` 里传入 `forNamespace`：读 entries → scoreEntries → 取/建会话 rank 快照 → pickColdSet → recallEntries(query) → lines。
- `buildTools` 增加 `isMaintenance` 回调，主调用传 `maintenance?.owns(agent)`；maintenanceTools 传 `() => true`。

## tools.js 变更（teammate: wiring）

`memory_read` 的 `bumpAccess` 调用增加 `sessionId: exec.agent?.session.id`，并在 `io.isMaintenance?.(exec.agent)` 为真时跳过计分。

## 验收（teammate: e2e）

隔离临时 memoryDir + 真实 apply() 装配，至少覆盖：
1. 全量底座：小预算截断后 index.txt / memory_list / memory_search 仍含全部活跃条目。
2. 排序：高热度条目在提示视图靠前；预算够时所有条目仍出现。
3. 截断保护：冷条目有探索位，不会永久隐身（不同 sessionSeed 轮换）。
4. 计分：同会话重复 read 只 +1；维护读不计；search 不计。
5. related 小额加分且封顶；新条目有新手保护。
6. 会话快照：同会话内猛读其它条目后再次装配，顺序不变；新会话变。
7. 召回：低热度但正文匹配当前请求的条目出现在“召回”段。
8. 规则段仍最先且完整（预算内）。
9. 无 options 时 buildPromptIndex 输出与旧行为一致。
日志逐条打印 `PASS/FAIL` 与关键数值，失败退出码非 0。
