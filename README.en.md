[简体中文](README.md) | English

# dsh-layered-memory

**A cross-session long-term memory plugin for DeepSeek Harness (DSH)** — namespace isolation + L1 index injection (existence encoding) + L2 environment facts + L3 task experience + BM25 full-text search + content-level near-duplicate deduplication + cross-namespace promotion + retry-sequence distillation + provenance/archive/rollback + automatic maintenance + progressive tool exposure.

## Capabilities

| Component | Description |
|---|---|
| `memory:index` injection | Injects the L1 index into the model context on every turn via `ctx.systemPrompt.context` (reads the file in real time; changes take effect immediately) |
| `memory` (runtime skill) | Semantic triggers: when to read, when to write, when to sync the index |
| `memory_activate` | Progressive-exposure fallback: call once when tools do not appear automatically after the skill is loaded |
| `memory_list` | List all memories (L2 facts + L3 sops + pending + index line count) |
| `memory_read` | Read a specific memory (index / fact section / sop filename), returning provenance meta and `related` association pointers |
| `memory_search` | **BM25 full-text search** (includes archived entries; `all_namespaces` for cross-store) — recovers entries that have been trimmed out of L1 |
| `memory_write` | Write a memory (fact/sop; **evidence is required** = the action-verification axiom; optional `related` association links) |
| `memory_index` | Rebuild the automatic section of the L1 index (preserving the manual `[RULES]` section) |
| `memory_pending` | View retry-sequence distillation candidates (same tool fails first, then succeeds) |
| `memory_accept` | Accept pending candidates into formal memory |
| `memory_update` | Update a memory (supersede keeps a historical snapshot; supports `related`) |
| `memory_archive` | Archive a memory (hidden from the L1 index and `memory_read`; the file is kept in archive/ and can be restored with `memory_rollback` or found via `memory_search`) |
| `memory_rollback` | Roll back to the most recent snapshot in `.history/` |
| `memory_expand` | Expand sourceSession/sourceSeqs raw events via `sessionQuery` |
| `memory_stats` | Statistics for L2/L3/pending/archived/size |
| `memory_maintain` | Content-level deduplication, index compaction, statistics, merge candidates |
| `memory_promote` | Cross-namespace promotion (project-local experience → global `default`) |

## Design

| Mechanism | Description |
|---|---|
| L1 index injection | `ctx.systemPrompt.context` injects the L1 index in real time every turn (reads the file; changes take effect immediately, no reload needed) |
| Write tool | `memory_write` (initiated by model/user; evidence is enforced) |
| Progressive exposure | Only `memory_activate` is registered globally; after the skill loads successfully, the 14 memory tools are mounted per Agent; `progressive: false` falls back to global registration |
| Automatic distillation | [v0.5] Only captures "same tool fails first, then succeeds" retry sequences (including error/result tail summaries) into `pending/`; ordinary successful calls no longer produce junk candidates |
| Reflection injection | [v0.5] Abolishes fixed-period reminders; when pending ≥ 5 / SOP ≥ 40 / index exceeds its limit, a housekeeping request with concrete content is injected (10-turn cooldown) |
| Content similarity | [v0.5] Set Jaccard over ASCII words + single digits + CJK bigrams: deduplication (≥0.85 near-duplicates archived) and merge candidates (≥0.45 reported); overly short content (<12 tokens) only uses exact-hash matching to prevent false positives |
| Provenance/audit | `memory-meta.json` records `sourceSession` / `sourceSeqs` / `createdAt` / `updatedAt` / `evidence` / `related` |
| Conflict/staleness | `memory_update` (supersede) / `memory_archive` / `memory_rollback`; old versions are kept in `.history/` / `archive/` |
| Namespaces | `<memoryDir>/<namespace>/...`; `default` stays compatible with the legacy root directory; defaults to the workspace/git branch |
| Automatic maintenance | `maintainEveryTurns` (default 20) triggers deduplication/compaction/statistics/merge candidates; [v0.5] the counter is persisted to `turn-state.json` and accumulates across sessions (even headless one-shot sessions can trigger it) |
| Compact on write | [v0.5] When a write detects that L1 exceeds its limit, compaction by decayed heat runs immediately (the warning appears only once if the index is still over budget after compaction) |
| L1 index | `index.txt` (≤30 logical lines; each L2/L3 pointer on its own line; `<!-- AUTO -->` automatic section + `[RULES]` manual section) |
| L2 fact store | `facts.md` (`## SECTION` upsert) |
| L3 experience store | `sops/*.md` (slug filenames; reserved names README/LICENSE/index are not counted as entries) |
| Heat statistics | [v0.5] `file_access_stats.json` records `{count, lastAt}`; heat decays with a **14-day half-life**; only real read counts are counted (writes no longer count) + a recency boost for entries created within 7 days |
| L0 meta-rules | `memory_management_sop.md` (action verification / no volatile data / minimal sufficient pointers / no deletion or modification) |

## Installation

```powershell
# Install from GitHub (recommended; ships with cordis.patch.yml; contribution id: dsh-layered-memory)
dsh plugin --profile web add github:DDDFXYqiming/dsh-layered-memory

# For local development you can also point directly at the repository directory
dsh plugin --profile web add <this directory>
```

### Configuration (optional, overrides defaults)

```yaml
# profile cordis.patch.yml —— bare entries override bundle lines (do not insert duplicates!)
- id: dsh-layered-memory
  config:
    memoryDir: ''              # default <home>/.dsh/memory
    maxIndexLines: 30
    progressive: true
    defaultNamespace: ''       # pin the default namespace; leave empty to let autoNamespace take effect
    autoNamespace: true        # defaults to the workspace directory name + git branch name
    autoPending: true          # capture "fails first, then succeeds" retry sequences as pending candidates on turn/end
    maintainEveryTurns: 20     # automatic maintenance every N turns (counter persisted, accumulates across sessions)
    reflectPendingThreshold: 5 # inject a housekeeping request when pending reaches this value
    reflectSopsThreshold: 40   # inject a consolidation request when L3 SOPs reach this value
```

`memory_maintain` only trims the full L1 index when it exceeds `maxIndexLines`: entries are sorted by decayed heat (access counts with a 14-day half-life; **new entries created within 7 days with no access heat receive a recency boost**), greedily packed until the budget is exhausted, with **real line counts accounted at every step** (including blank-layer placeholder lines). Memories that do not make it into L1 are not deleted; a hint such as "N more entries remain" is kept — you can now recover them directly with `memory_search`. The maintenance process also cleans up extra blank lines around the automatic section. When `memory_write` detects an over-limit index, it triggers the same compaction immediately without waiting for maintenance.

## Storage Layout

```
<home>/.dsh/memory/
├── <namespace>/                non-default namespaces (explicit configuration recommended)
│   ├── memory_management_sop.md
│   ├── index.txt
│   ├── facts.md
│   ├── sops/*.md
│   ├── pending/*.md
│   ├── archive/ / .history/
│   ├── memory-meta.json
│   ├── memory_stats.json
│   ├── maintenance-report.json
│   ├── turn-state.json
│   └── file_access_stats.json
└── (when namespace=default, the above lives compatibly in this root directory)
```

## Core Axioms

1. **Action verification**: No Execution, No Memory — evidence is required for `memory_write`; only record information that has been verified successfully
2. **Sacred and immutable**: verified facts may be compacted/migrated/superseded/archived, but must never be physically discarded
3. **No volatile state**: timestamps/PIDs/temporary paths are never stored
4. **Minimal sufficient pointers**: L1 records only existence; details are fetched from L2/L3 on demand

## Development & Testing

```bash
pnpm install
pnpm build        # node --check lib/index.js
pnpm test         # vitest
pnpm test:smoke   # dsh --profile headless --dump-config
```

> Note: the unit tests import `@deepseek-ai/dsh-tools` / `@deepseek-ai/schemastery` (packages bundled with DSH, not published to npm). If a local DSH installation exists (e.g. `~/.dsh/profiles/<profile>/node_modules`), you can point `node_modules/@deepseek-ai` and similar at it via a junction/link (`auto-install-peers=false` has been written into `.npmrc` to keep pnpm from failing while trying to resolve the private peers).

## See Also

- Underlying seams: `ctx.systemPrompt.context` / `ctx.skills.register` / `ctx.tools.register` / `session/event` events + `ctx.sessionQuery`
- License: MIT
