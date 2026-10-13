[简体中文](README.md) | English

# dsh-layered-memory

Cross-session memory for DeepSeek Harness. Facts and operating procedures live in Markdown files. The agent sees a compact project and global index, then retrieves the relevant content on demand.

## Install

```bash
dsh plugin --profile web add github:DDDFXYqiming/dsh-layered-memory
```

For Desktop, use its bundled `dsh` command with the `desktop` profile. Development installs can link this repository. `lib/index.js` forwards to the source modules.

## Use

Load the `memory` skill or call `memory_activate({mode:"common"})`. Management operations use `mode:"manage"`. Read-only work can request `access:"read"`; child agents default to read-only access.

Version 0.8 identifies entries with `{namespace, kind, key}`. Reuse the `entry` returned by search, list or create. A display title is not a filename, and a fact and SOP may share a title without sharing an identity.

```js
memory_write({
  namespace: "my-project",
  kind: "fact",
  topic: "Preview command",
  content: "Run pnpm dev to start the preview.",
  evidence: "The command started successfully and the page loaded."
})
// Reuse the returned entry.
memory_read({entry, full: true})
memory_update({entry, content: "A revised finding", evidence: "New verification"})
memory_history({entry})
memory_rollback({entry, snapshot_id: "Choose a returned snapshot id"})
```

`memory_write` creates new entries; `memory_update` changes existing entries. Update, archive and restore preserve the current version first. Tool consumers using the old `entry_type` or bare `name/topic` addressing should adopt `entry`. Existing Markdown data remains readable.

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

Search defaults to active entries in the current and global spaces. Set `include_archived:true` to find archived content, then read the returned entry. Reads expose line ranges, total lines, revision, complete and next_line. Global rules and complete indexes remain accessible through the `rules`, `index` and `policy` entry kinds.

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

Automatic namespaces use persistent workspace identity or canonical root paths. Identically named projects on different paths stay separate; branches share their project memory. Existing namespaces migrate explicitly and retain their source directory.

The `default` namespace is global. Project indexes and default searches include it. Character budgets cover both index entries and manual rules; full files remain available through the tools. Host variables carry memory as data, preserving literal `{{template brackets}}`.

Automatic model maintenance is optional. It uses native fresh-context subagents with explicit tool, write, time and model-output limits. Maintenance with no actionable findings finishes without a model task. See the [maintenance guide](docs/automatic-maintenance.zh.md).

## Development

`pnpm build` checks source syntax. Validate changes in the installed DSH desktop application and its bundled CLI using real sessions, tools, persisted logs and a dedicated memory directory. See [development and end-to-end acceptance](docs/development.md).

A source pull does not imply a live module reload. Configure the host HMR source root or reload the module, then check the plugin version/path in the startup log and its actual behavior.

[Design](docs/design.md) · [Changelog](CHANGELOG.md) · [MIT License](LICENSE)
