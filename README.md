---
description: "Cross-session memory for DeepSeek Harness. Project and global indexes stay in context, entries carry structured identity and evidence, and earlier versions can be restored."
kind: "package-bundle"
---

# @dsh-external/dsh-layered-memory

English | [中文](README.zh.md)

## Summary

Layered memory carries facts and operating procedures across sessions in a workspace. Facts live under second-level headings in `facts.md`, procedures in `sops/*.md`. The agent receives a compact project index and a global index at session start, then reads the relevant body on demand. Every entry is identified by `{namespace, kind, key}`, so a display title never doubles as an identity. Updates keep the previous version before writing, which makes history review and rollback available through tools.

## Table of Contents

- [Install](#install)
- [Use](#use)
- [Configuration](#configuration)
- [Understand the implementation](#understand-the-implementation)
- [Further Exploration](#further-exploration)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)

## Install

```bash
dsh plugin --profile web add github:DDDFXYqiming/dsh-layered-memory
```

Desktop runs the same install through its bundled `dsh` command with the `desktop` profile. For local development, link the repository and point the profile at it. `lib/index.js` only re-exports the source modules in `src/`.

## Use

Load the `memory` skill, or call `memory_activate({mode:"common"})` to enable the tools. Management operations use `mode:"manage"`. A read-only session can pass `access:"read"`, and child agents default to read-only access.

Entries are addressed by the `entry` object returned from search, list or create. Reuse that object instead of rebuilding it from a title.

```js
memory_write({
  namespace: "my-project",
  kind: "fact",
  topic: "Preview command",
  content: "Run pnpm dev to start the preview.",
  evidence: "The command started successfully and the page loaded."
})
// Reuse the returned entry for later calls.
memory_read({entry, full: true})
memory_update({entry, content: "A revised finding", evidence: "New verification"})
memory_history({entry})
memory_rollback({entry, snapshot_id: "Choose a returned snapshot id"})
```

`memory_write` creates entries. `memory_update` changes an existing one. Update, archive and restore write the current version first, so the earlier state stays reachable.

| Task | Tools |
| --- | --- |
| Find and read | memory_search, memory_list, memory_read |
| Create and update | memory_write, memory_update |
| Inspect evidence | memory_expand |
| Restore history | memory_history, memory_rollback |
| Archive and restore visibility | memory_archive |
| Share and migrate | memory_promote, memory_namespace |
| Process candidates | memory_pending, memory_accept, memory_discard |
| Inspect and maintain | memory_stats, memory_index, memory_maintain |

Search covers active entries in the current and global spaces. Pass `include_archived:true` to reach archived content, then read the returned entry. A read reports its line range, total lines, revision, completeness and the next line offset. Global rules and complete indexes remain readable through the `rules`, `index` and `policy` entry kinds.

## Configuration

```yaml
- id: dsh-layered-memory
  config:
    defaultNamespace: ''
    autoNamespace: true
    progressive: true
    l1MaxChars: 12288
    globalL1MaxChars: 2048
    memoryAccess: write
    subagentMemoryAccess: read
    autoPending: false
    reflectionMode: notify
```

Automatic namespaces use persistent workspace identity or canonical root paths. Two projects that share a name but sit on different paths stay separate, and branches of one repository share the project memory. Existing namespaces migrate explicitly and keep their source directory.

The `default` namespace is global. Project indexes and default searches include it. Character budgets cover index entries and manual rules together, while full files stay available through the tools. Host variables carry memory text as data, so literal `{{template brackets}}` survive.

Automatic model maintenance is optional. It runs on native fresh-context subagents with explicit limits on tools, writes, time and model output. When maintenance finds nothing actionable, it finishes without spending a model call. See the [maintenance guide](docs/automatic-maintenance.zh.md).

## Understand the implementation

<details>
<summary>Storage, identity and context assembly</summary>

Facts are addressed by their second-level heading inside `facts.md`. Procedures are addressed by path inside `sops/`. A display title and an entry key are separate values, so the same title can exist as a fact and as a procedure, in one space or in two.

The L1 index holds the full active directory on disk. Context assembly gives the project index and the global index separate character budgets. When a budget is exceeded, entries are folded with their descriptions trimmed, and each folded entry keeps a readable path back to the full body.

The host exposes memory text through a `systemPrompt.variable`. The prompt references that fixed variable instead of re-parsing content as a template. The host compares content snapshots and appends only when the snapshot changed. L0 and runtime skills share one core rule template.

</details>

## Further Exploration

- [Design notes](docs/design.md) cover storage, identity and context assembly in more depth.
- [Development and end-to-end acceptance](docs/development.md) covers building and validating changes.
- [Automatic maintenance](docs/automatic-maintenance.zh.md) covers optional model-driven upkeep.
- [Changelog](CHANGELOG.md) records released behavior.

## Model Experience

### Memory index in the system prompt

#### What the model sees

The model receives a project index and a global index inside the system prompt, plus the manual rules that belong to the active namespace. Each index line names an entry and a short description. Bodies stay on disk until the model calls a read tool.

#### Token effect

Fixed per session for the indexes, bounded by `l1MaxChars` for the project index and `globalL1MaxChars` for the global one. Reads add tokens on demand and return line ranges, so a large entry can be consumed in pieces. `progressive: true` keeps index lines short and defers detail to reads.

#### KV cache effect

The indexes sit in a stable prefix, so an unchanged snapshot reuses the provider cache. A write that changes the index replaces that prefix and invalidates the cached tokens after it.

## Known Limitations and Deferred Work

- **Index folding hides detail** — when the project or global index exceeds its character budget, entries are folded and descriptions are trimmed. The full body stays available through `memory_read`, but an agent that reads only the index sees less than the file contains.
- **Maintenance spends model calls** — `reflectionMode` other than `notify` and `autoPending: true` can start fresh-context subagents. Each run costs tokens, and the budget limits are per run rather than per session.
- **Namespace identity is path based** — automatic namespaces derive from workspace identity or canonical root path. Moving a project to another path creates a different namespace until it is migrated explicitly.
- **Tool access is per session** — the memory tools exist only after `memory_activate`. A session that never activates memory cannot see or write entries.

### Dev Note

None.
