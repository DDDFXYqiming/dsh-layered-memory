[简体中文](README.md) | English

# dsh-layered-memory

Cross-session memory for DeepSeek Harness (DSH).

A DSH session loses its context the moment it ends. Come back to the same project tomorrow and you explain the environment again, and rediscover how you worked around that error last time. This plugin writes that kind of information to files on disk and pulls it back when a later session needs it.

Memory has three layers: an index, environment facts, and task experience. The L1 / L2 / L3 labels in the tool list below refer to those three.

## What it looks like in use

Once installed, you just tell the agent.

> The build command for this project is ```pnpm build && pnpm test~~, and the tests take about forty seconds. Remember that.

It writes the line into the memory store. Open a fresh session the next day and say "run the tests for me", and the command is already known.

It works the other way too. If you forget the flags a service needs, ask the agent to look them up in memory instead of scrolling back through old chats.

## Install

```powershell
dsh plugin --profile web add github:DDDFXYqiming/dsh-layered-memory
```

The plugin creates its directories and template files under `<home>/.dsh/memory`.

## Usage

The agent decides when to read and write memory. The plugin registers one `memory` skill and 14 tools. Under progressive mode those tools stay hidden until the agent calls `memory_activate` once.

| Tool | Purpose |
|---|---|
| `memory_list` | List all memory (L2 facts + L3 sops + pending + L1 chars/budget) |
| `memory_read` | Read one entry (index / fact topic / sop filename) with provenance meta and `related` links; oversized entries return an outline plus head/tail excerpts, with `full` and `from_line`/`to_line` for the rest |
| `memory_search` | BM25 full-text search over facts, sops and archived entries |
| `memory_write` | Write a memory (fact/sop, evidence required, name collision snapshots the old version; evidence is quoted line by line and suspected secrets in it are redacted; plain-text secrets in the body are refused) |
| `memory_index` | Rebuild the L1 index auto-segment, keeping the `[RULES]` manual segment |
| `memory_pending` | List distilled candidates (fail-then-retry sequences) |
| `memory_accept` | Promote a pending candidate into a real entry |
| `memory_update` | Update an entry, keeping a history snapshot (body and provenance meta snapshotted together); new measurements can pass `sourceSession`/`sourceSeqs`, wording-only edits inherit the original source |
| `memory_archive` | Archive an entry (hidden from L1 and `memory_read`, file stays in place, still searchable, current version snapshotted first); `unarchive: true` restores visibility |
| `memory_rollback` | Roll back to the most recent `.history/` snapshot (body and provenance meta restored together) |
| `memory_expand` | Expand the original events behind sourceSession / sourceSeqs |
| `memory_stats` | Counts for L2 / L3 / pending / archived and total size |
| `memory_maintain` | Merge same-name duplicate sections, exact/near-duplicate candidates, index audit, stats, merge candidates, cold-entry review |
| `memory_promote` | Promote project-local experience to the global namespace |

## Configuration

```yaml
# a bare entry in the profile cordis.patch.yml, overriding the bundle row; do not duplicate the insert
- id: dsh-layered-memory
  config:
    memoryDir: ''              # defaults to <home>/.dsh/memory
    l1MaxChars: 12288         # character budget for the L1 index; over budget folds entries into category entries while rules stay intact
    progressive: true
    defaultNamespace: ''       # fixed namespace; empty lets autoNamespace decide
    autoNamespace: true        # session workspace dir name plus git branch (exec.agent.session.header.cwd); home falls back to default
    autoPending: false         # off by default, candidates are mostly tool-usage noise
    maintainEveryTurns: 20     # run auto-maintenance every N turns, counted across sessions
    reflectionEnabled: true    # master switch for reflection notices
    reflectPendingThreshold: 5 # only with autoPending on; 0 disables this rule
    reflectSopsThreshold: 40   # notice when active L3 sops reach this count; 0 disables the rule
    reflectCooldownTurns: 10   # minimum turns between two reflection notices
    nearDupeThreshold: 0.85    # token-set Jaccard threshold for near-duplicate candidates (reported only, never auto-archived)
    mergeCandidateThreshold: 0.45 # merge-candidate report threshold
    minTokensForFuzzy: 12      # shorter content only uses exact content comparison (case and inner whitespace preserved)
    heatHalfLifeDays: 14       # access-heat half-life in days
    recencyWindowDays: 7       # recency protection window for fresh entries
    coldReviewDays: 90         # cold-entry review window in days
    namespaceCacheTtlMs: 60000 # TTL for the autoNamespace git probe cache, in ms
```

## Storage

Memory is a pile of markdown files, with no database behind it. The default location is `<home>/.dsh/memory`.

```
<home>/.dsh/memory/
├── <namespace>/                non-default namespace
│   ├── memory_management_sop.md
│   ├── index.txt
│   ├── facts.md
│   ├── sops/*.md
│   ├── pending/*.md
│   ├── archive/ / .history/
│   ├── memory-meta.json
│   ├── maintenance-report.json
│   ├── turn-state.json
│   ├── file_access_stats.json
│   └── reflection-state.json
└── with namespace default, the same files live at this root
```

You can back it up, commit it, or edit it by hand. The body refuses text that looks like a plaintext secret; suspected secrets in evidence and related links are redacted on write.

## More

- [Design and scheduling](docs/design.md) (Chinese)
- [Development and testing](docs/development.md) (Chinese)
- [Changelog](CHANGELOG.md)

## License

MIT
