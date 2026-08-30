[简体中文](README.md) | English

# dsh-layered-memory

**DeepSeek Harness (DSH) cross-session long-term memory plugin** — namespace isolation + L1 index injection + L2 environment facts + L3 task experience + BM25 full-text search + content-level near-duplicate dedupe + cross-namespace promotion + retry-sequence distillation + provenance / archive / rollback + auto-maintenance + progressive tool exposure.

## Capabilities

`memory:index` injection — `ctx.systemPrompt.context` injects the L1 index into every model turn in real time; changes are live.

runtime skill `memory` — when to read / write / sync the index (content in `SKILL.md`).

Tools (mounted per Agent via `memory_activate` in progressive mode, 14 total):

| Tool | Purpose |
|---|---|
| `memory_list` | List all memory (L2 facts + L3 sops + pending + index line count) |
| `memory_read` | Read a memory entry (index / fact topic / sop filename); returns provenance meta and `related` links |
| `memory_search` | **BM25 full-text search** (includes archived; `all_namespaces` cross-search) — even L1-hidden entries are findable |
| `memory_write` | Write a memory (fact/sop, **evidence required** = action-verified axiom; optional `related` links) |
| `memory_index` | Rebuild the L1 index auto-segment (preserves the `[RULES]` manual segment) |
| `memory_pending` | List auto-distilled candidates (fail-then-retry sequences) |
| `memory_accept` | Promote a pending candidate into a real memory entry |
| `memory_update` | Update a memory (supersede keeps a history snapshot; supports `related`) |
| `memory_archive` | Archive a memory (hidden from L1 and `memory_read`, file kept in `archive/`; recoverable via `memory_rollback` or `memory_search`) |
| `memory_rollback` | Roll back to the most recent `.history/` snapshot |
| `memory_expand` | Use `sessionQuery` to expand the sourceSession / sourceSeqs original events |
| `memory_stats` | Stats: L2 / L3 / pending / archived / total size |
| `memory_maintain` | Content-level dedupe, compress index, stats, merge candidates |
| `memory_promote` | Cross-namespace promotion (project-local experience → global `default`) |

## Install

```powershell
# GitHub install (recommended; bundles cordis.patch.yml, contribution id: dsh-layered-memory)
dsh plugin --profile web add github:DDDFXYqiming/dsh-layered-memory

# Local dev — install from the repo dir directly
dsh plugin --profile web add <repo dir>
```

## Configuration

```yaml
# profile cordis.patch.yml — override bundle entries directly (don't duplicate insert!)
- id: dsh-layered-memory
  config:
    memoryDir: ''              # default <home>/.dsh/memory
    maxIndexLines: 30
    progressive: true
    defaultNamespace: ''       # fixed default namespace; empty = autoNamespace wins
    autoNamespace: true        # default = workspace dir name + git branch
    autoPending: true          # turn/end captures fail-then-retry sequences as pending candidates
    maintainEveryTurns: 20     # auto-maintain every N turns (counter persisted, accumulates across sessions)
    reflectPendingThreshold: 5 # inject consolidation request when pending count >= threshold
    reflectSopsThreshold: 40   # inject consolidation request when L3 SOP count >= threshold
```

**When `memory_maintain` trims L1**: only when the full index exceeds `maxIndexLines`; greedy fit with real line counting (including empty-layer placeholder lines), ranked by decayed heat (14-day half-life + 7-day recency bonus for new entries). **Trimming never deletes memory** — use `memory_search` to retrieve what fell out of L1. `memory_write` triggers the same compression immediately on over-limit, so the warning fires at most once.

## Storage layout

```
<home>/.dsh/memory/
├── <namespace>/                non-default namespace (explicit config recommended)
│   ├── memory_management_sop.md
│   ├── index.txt
│   ├── facts.md
│   ├── sops/*.md
│   ├── pending/*.md
│   ├── archive/ / .history/
│   ├── memory-meta.json
│   ├── maintenance-report.json
│   ├── turn-state.json
│   └── file_access_stats.json
└── (when namespace=default, the same content is laid out under the root for back-compat)
```

## Core axioms

1. **Action verified**: No Execution, No Memory — `memory_write` requires `evidence`; only verified info gets written
2. **Immutable**: verified facts may be compressed / migrated / superseded / archived but never physically discarded
3. **No volatile state**: timestamps / PIDs / temp paths / one-shot IDs are not stored
4. **Minimal pointers**: L1 holds only existence; details in L2 / L3

## Consistency boundary

No automatic contradiction detection. Consistency relies on three layers: pre-write dedupe — same-topic evolution goes through `memory_update` (supersede, old snapshot kept in `.history/`) → `memory_maintain` surfaces high-similarity merge candidates → entries carry `updatedAt` and evidence, so cross-entry conflicts are resolved by timeline at read time.

## Develop & test

```bash
pnpm install
pnpm build        # node --check lib/index.js
pnpm test         # vitest
pnpm test:smoke   # dsh --profile headless --dump-config
```

> Unit tests import `@deepseek-ai/dsh-tools` / `@deepseek-ai/schemastery` (DSH-internal packages). If you have a DSH environment installed locally, you can junction / symlink `node_modules/@deepseek-ai` from there; `.npmrc` sets `auto-install-peers=false` to keep pnpm from chasing private peers.

## Related

- Underlying seams: `ctx.systemPrompt.context` / `ctx.skills.register` / `ctx.tools.register` / `session/event` events + `ctx.sessionQuery`
- Full version history: [CHANGELOG.md](./CHANGELOG.md)
- License: MIT
