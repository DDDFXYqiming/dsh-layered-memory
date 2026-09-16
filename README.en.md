[简体中文](README.md) | English

# dsh-layered-memory

**Cross-session long-term memory plugin for DeepSeek Harness (DSH).** A session's context is gone once the session ends, so this plugin writes what is worth keeping to files on disk and hands it back on demand in later sessions. Features cover namespace isolation, L1 index injection, L2 environment facts, L3 task experience, BM25 full-text search, content-level near-duplicate dedupe, cross-namespace promotion, retry-sequence distillation, provenance / archive / rollback, auto-maintenance, and progressive tool exposure.

## Capabilities

`memory:index` injection. `ctx.systemPrompt.context` injects the L1 index into every model turn in real time, and changes are live.

Runtime skill `memory`. This skill spells out the timing rules for reading memory, writing memory, and syncing the index. Content is inlined in `src/skill-content.js` (runtime skill, no separate SKILL.md file).

There are 14 tools in total. In progressive mode they are mounted via `memory_activate`, meaning an Agent calls `memory_activate` once on demand and the tools then join its tool list.

| Tool | Purpose |
|---|---|
| `memory_list` | List all memory (L2 facts + L3 sops + pending + L1 chars/budget) |
| `memory_read` | Read a memory entry (index / fact topic / sop filename); returns provenance meta and `related` links |
| `memory_search` | **BM25 full-text search** (includes archived; `all_namespaces` cross-search) |
| `memory_write` | Write a memory (fact/sop, **evidence required** = action-verified axiom; overwriting a name auto-snapshots the old version; refuses secret-looking text and `## ` lines inside facts; returns L0 advisories) |
| `memory_index` | Rebuild the L1 index auto-segment (preserves the `[RULES]` manual segment) |
| `memory_pending` | List auto-distilled candidates (fail-then-retry sequences) |
| `memory_accept` | Promote a pending candidate into a real memory entry |
| `memory_update` | Update a memory (supersede keeps a history snapshot; supports `related`) |
| `memory_archive` | Archive a memory (a meta flag: hidden from L1 and `memory_read`, **file stays in place**, still hit by `memory_search`, restorable via `memory_rollback`) |
| `memory_rollback` | Roll back to the most recent `.history/` snapshot |
| `memory_expand` | Use `sessionQuery` to expand the sourceSession / sourceSeqs original events |
| `memory_stats` | Stats for L2 / L3 / pending / archived / total size |
| `memory_maintain` | Content-level dedupe, L1 index audit (full list, no trimming), stats, merge candidates, cold-entry review (>90 days with no access) |
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
    l1MaxChars: 12288          # the single L1 budget (chars, also the injection fuse); over budget only warns, never hides
    progressive: true
    defaultNamespace: ''       # fixed default namespace; empty = autoNamespace wins
    autoNamespace: true        # default = workspace dir name + git branch (home dir falls back to default)
    autoPending: false         # [v0.6] off by default: candidates were mostly tool-usage noise and went unconsumed (108 in 6 days)
    maintainEveryTurns: 20     # auto-maintain every N turns (counter persisted, accumulates across sessions)
    reflectPendingThreshold: 5 # only when autoPending is on: inject consolidation request at this pending count
    reflectSopsThreshold: 40   # inject consolidation request when L3 SOP count >= threshold
```

**L1 existence first (no trimming since v0.6).** The AUTO section lists every active entry name, one line per layer joined by `" | "`. The budget unit is characters (`l1MaxChars`), not lines: the old line budget allowed "compliant lines, runaway tokens", and one-entry-per-line meant 30 lines could only hold 16 entries, silently hiding the rest — which is permanent invisibility, since the model never searches for what it does not know exists. Over budget only warns (tool return + maintenance report); merge/archive entries or trim `[RULES]`. The index file is not rewritten when its content is unchanged, keeping the system-prompt prefix cache stable. Decayed heat (14-day half-life) now feeds the **cold-entry review** list in `memory_maintain` instead of hiding entries.

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

1. **Action verified (No Execution, No Memory).** `memory_write` requires `evidence`; only verified info gets written
2. **Immutable.** Verified facts may be compressed / migrated / superseded / archived but never physically discarded
3. **No volatile state.** Timestamps / PIDs / temp paths / one-shot IDs are not stored
4. **Minimal pointers.** L1 holds only existence; details live in L2 / L3

## Consistency boundary

No automatic contradiction detection. Consistency rests on three process layers. Pre-write dedupe comes first, so same-topic evolution goes through `memory_update` (supersede keeps the old snapshot in `.history/`). `memory_maintain` then surfaces merge candidates for highly similar entries. Entries also carry `updatedAt` and evidence, so cross-entry conflicts are resolved by timeline at read time.

## Develop & test

```bash
pnpm install
pnpm build        # node --check lib/index.js
pnpm test         # vitest
pnpm test:smoke   # dsh --profile headless --dump-config
```

> Unit tests import `@deepseek-ai/dsh-tools` / `@deepseek-ai/schemastery` (DSH-internal packages). If you have a DSH environment installed locally, you can junction / symlink `node_modules/@deepseek-ai` from there; `.npmrc` sets `auto-install-peers=false` to keep pnpm from chasing private peers.

## Related

- Underlying host integration points are `ctx.systemPrompt.context` / `ctx.skills.register` / `ctx.tools.register` / `session/event` events + `ctx.sessionQuery`
- Full version history in [CHANGELOG.md](./CHANGELOG.md)
- Released under the MIT license
