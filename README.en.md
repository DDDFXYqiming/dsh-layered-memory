[简体中文](README.md) | English

# dsh-layered-memory

**A cross-session long-term memory plugin for DeepSeek Harness (DSH)** — namespace isolation + L1 index injection (existence encoding) + L2 environment facts + L3 task experience + automatic distillation candidates + provenance/archive/rollback + automatic maintenance + progressive tool exposure.

## Capabilities

| Component | Description |
|---|---|
| `memory:index` injection | Injects the L1 index into the model context on every turn via `ctx.systemPrompt.context` (reads the file in real time; changes take effect immediately) |
| `memory` (runtime skill) | Semantic triggers: when to read, when to write, when to sync the index |
| `memory_activate` | Progressive-exposure fallback: call once when tools do not appear automatically after the skill is loaded |
| `memory_list` | List all memories (L2 facts + L3 sops + pending + index line count) |
| `memory_read` | Read a specific memory (index / fact section / sop filename), returning provenance meta |
| `memory_write` | Write a memory (fact/sop; **evidence is required** = the action-verification axiom) |
| `memory_index` | Rebuild the automatic section of the L1 index (preserving the manual `[RULES]` section) |
| `memory_pending` | View automatic distillation candidates |
| `memory_accept` | Accept pending candidates into formal memory |
| `memory_update` | Update a memory (supersede keeps a historical snapshot) |
| `memory_archive` | Archive a memory (hidden from the L1 index and `memory_read`; the file is kept in archive/ and can be restored with `memory_rollback`) |
| `memory_rollback` | Roll back to the most recent snapshot in `.history/` |
| `memory_expand` | Expand sourceSession/sourceSeqs raw events via `sessionQuery` |
| `memory_stats` | Statistics for L2/L3/pending/archived/size |
| `memory_maintain` | Deduplication, index compaction, statistics, candidate merging |

## Design

| Mechanism | Description |
|---|---|
| L1 index injection | `ctx.systemPrompt.context` injects the L1 index in real time every turn (reads the file; changes take effect immediately, no reload needed) |
| Write tool | `memory_write` (initiated by model/user; evidence is enforced) |
| Progressive exposure | Only `memory_activate` is registered globally; after the skill loads successfully, the 12 memory tools are mounted per Agent; `progressive: false` falls back to global registration |
| Automatic distillation | On turn/end, successful tool calls are written to the `pending/` candidate area; once confirmed via `memory_accept`, they enter formal memory |
| Provenance/audit | `memory-meta.json` records `sourceSession` / `sourceSeqs` / `createdAt` / `updatedAt` / `evidence` |
| Conflict/staleness | `memory_update` (supersede) / `memory_archive` / `memory_rollback`; old versions are kept in `.history/` / `archive/` |
| Namespaces | `<memoryDir>/<namespace>/...`; `default` stays compatible with the legacy root directory; defaults to the workspace/git branch |
| Automatic maintenance | `maintainEveryTurns` (default 20) triggers deduplication/compaction/statistics/candidate merging; compaction sorts by access heat and gives a recency boost to entries created within 7 days |
| L1 index | `index.txt` (≤30 logical lines; each L2/L3 pointer on its own line; `<!-- AUTO -->` automatic section + `[RULES]` manual section) |
| L2 fact store | `facts.md` (`## SECTION` upsert) |
| L3 experience store | `sops/*.md` (slug filenames; reserved names README/LICENSE/index are not counted as entries) |
| Heat statistics | `file_access_stats.json` (bumped on every `memory_read`; `memory_write` makes an entry hot immediately, +1) + `memory_stats.json` (aggregated statistics) |
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
    autoPending: true          # automatically generate pending candidates on turn/end
    maintainEveryTurns: 20     # automatic maintenance every N turns
```

`memory_maintain` only trims the full L1 index when it exceeds `maxIndexLines`: entries are sorted by access heat, and **new entries created within 7 days with no access heat receive a recency boost** (together with the write-is-hot behavior of `memory_write`, new memories won't be immediately squeezed out of L1 by compaction). Memories that do not make it into L1 are not deleted; a hint such as "N more entries remain — call `memory_list` to view them" is kept. The maintenance process also cleans up extra blank lines around the automatic section.

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
