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
- [Memory Management Page](#memory-management-page)
- [Interface Language](#interface-language)
- [Configuration](#configuration)
- [Understand the implementation](#understand-the-implementation)
- [Further Exploration](#further-exploration)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)

## Install

```bash
dsh plugin --profile web add   github:DDDFXYqiming/dsh-layered-memory   "github:DDDFXYqiming/dsh-layered-memory#path:/lib/status"
```

Both specifiers are required because the bundle contributes two components (the memory plugin and its input-area status service). pnpm blocks exotic subdependencies, so a nested dependency cannot install the status package; declare it as a direct dependency instead.

Desktop runs the same install through its bundled `dsh` command with the `desktop` profile. For local development, run `npm run build`, link the repository and `lib/status`, and point the profile at them. `lib/index.js` only re-exports the source modules in `src/`.

## Use

The basic `memory_search/list/read/write/update` tools are available in each session. Load the `memory` skill or call `memory_activate({mode:"common"})` to add status and conflict tools; management operations use `mode:"manage"`. User configuration controls access through `memoryAccess` and `subagentMemoryAccess`, with child agents read-only by default. `memory_activate` does not change permissions.

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
memory_activate({mode: "manage"})
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
| Inspect and maintain | memory_stats, memory_index, memory_maintain, memory_review |

Search covers active entries in the current and global spaces. Pass `include_archived:true` to reach archived content, then read the returned entry. A read reports its line range, total lines, revision, completeness and the next line offset. Global rules and complete indexes remain readable through the `rules`, `index` and `policy` entry kinds.

The bundle includes an independent Memory status component that can be toggled on the plugins page. A compact line below the Web composer shows current maintenance activity, changed entry counts or incomplete-run reasons. Sessions without maintenance records show a clickable “Memory ready” entry. The detail panel provides run records, read-only worker history and a stop control for active maintenance.

Browsing and editing entries happens on a separate page. See [Memory Management Page](#memory-management-page).

## Memory Management Page

The Web sidebar carries a “Memory” entry that opens a standalone memory management page. The page reads and writes the storage layer through the remote methods of the status subpackage.

The toolbar across the top holds the namespace picker, a search box over titles and content, entry type filter tabs (All / Fact / Skill) and a switch for showing archived entries. The list on the left shows each entry with its title, type and update time; the detail pane on the right shows the selected entry.

Content and evidence are readable and editable in place. The content area renders Markdown and switches between preview and edit, and evidence is a single input. Saving calls `updateEntry` with the `ifRevision` value read earlier, so an entry changed by another session reports a conflict and offers a reload. A “New entry” button next to the page title asks for namespace, type, title, content and evidence.

Archiving removes an entry from the active directory and the index; restoring puts it back. The “Show archived” switch brings archived entries back into the list. Every change stores the previous version first, so the History section lists earlier versions with their time, revision, character count and a change summary. “Preview” expands the stored body, and “Roll back to this version” asks for confirmation before it replaces the current content.

Below the toolbar sits a one-line “Index used” summary: the percentage used on the left, a segmented bar in the middle, and the used and budget character counts on the right. Clicking it expands the breakdown into four sections, header, rules, facts directory and skills directory, each with its own character count. Hovering a section opens a tooltip that says whether it is the index header, the L0 red-line rules, the `facts.md` directory or the `sops/` directory. The facts and skills sections also report an entry count and their share of the used characters, and the remaining sections dim while the pointer stays there.

Usage numbers are per namespace. The `default` namespace is measured against `globalL1MaxChars` and every other namespace against `l1MaxChars`, which matches the budget used when the index is injected into the prompt.

## Interface Language

Interface text follows the host language setting. The dictionaries cover zh, en, ja, es, fr, de, ru and pt. The sidebar entry label, the buttons and hints on the page, and the memory status line in the composer all use the current language.

Entry types are shown per language: Fact and Skill in the English interface, 事实 and 经验 in the Chinese one. The underlying data keys stay `fact` and `sop`, so tool arguments, storage paths and interface fields are unchanged.

## Configuration

```yaml
- id: dsh-layered-memory
  config:
    defaultNamespace: ''
    autoNamespace: true
    progressive: true
    l1MaxChars: 12288
    globalL1MaxChars: 2048
    indexTargetRatio: 0.9
    memoryAccess: write
    subagentMemoryAccess: read
    autoPending: false
    turnReviewEnabled: true
    turnReviewMinEvidence: 6
    turnReviewReasoningEffort: ''
    maintenanceMaxTokens: 16384
    maintenanceMaxCalls: 64
    maintenanceMaxWrites: 6
    maintenanceTimeoutSeconds: 300
    maintenanceCooldownMinutes: 30
    reflectionMode: notify
```

Automatic namespaces use persistent workspace identity or canonical root paths. Two projects that share a name but sit on different paths stay separate, and branches of one repository share the project memory. Existing namespaces migrate explicitly and keep their source directory.

The `default` namespace is global. Project indexes and default searches include it. Character budgets cover index entries and manual rules together, while full files stay available through the tools. Host variables carry memory text as data, so literal `{{template brackets}}` survive.

The main agent reads and updates notes during its task. Background review checks relevant notes for omissions, contradictions and duplication; zero changes are a normal outcome. End-of-turn review is enabled by default and batches six deduplicated, unprocessed pieces of successful evidence. One normally completed user turn can supply the batch, and the current turn must add new evidence. Each parent conversation has at most two fixed maintenance sessions: both review and batch maintenance follow the current conversation model by default; set both `maintenanceLlmProvider` and `maintenanceModel` to pin batch maintenance to a specific model. Set `turnReviewReasoningEffort` to choose a separate review effort; leave it empty to inherit the parent's. Optional batch maintenance runs under `reflectionMode: auto`. Both paths share the default 30-minute namespace cooldown through `maintenanceCooldownMinutes`, and maintenance writes do not count as new user work. Index pressure work targets a watermark instead of the hard cap: the target character count is `l1MaxChars` × `indexTargetRatio` (default 0.9). Candidates grow with the gap, a round that stays above the watermark and changed real entries schedules the next one, and merging same-topic entries is the primary space saver while archiving invalid entries is secondary; raising `l1MaxChars` is not a way to avoid consolidation.

Successful writes are recorded immediately. Completion validates the entries before ending the worker; a rejected submission returns the affected entry and a correction the worker can make in the same run. Checkpoints and completion remain available after the work-call budget is spent. A timeout or cancellation ends the run while keeping its saved progress. When new evidence arrives and the cooldown passes, an unfinished review can resume without rebuilding the initial evidence threshold. The fixed session receives the previous result, remaining work and saved entries whose versions are still current.

The defaults allow 64 work calls, 6 writes and 300 seconds per run, with up to 16384 output tokens per model response. An explicit value in an existing profile overrides these defaults after an upgrade. Reads of the same revision accumulate across pages; edits check the target entry's revision, so changes to unrelated entries do not cancel the run. Requires DSH 0.2.1-rc.2 or a newer compatible version. See the [maintenance guide](docs/automatic-maintenance.zh.md).

## Understand the implementation

<details>
<summary>Storage, identity and context assembly</summary>

Facts are addressed by their second-level heading inside `facts.md`. Procedures are addressed by path inside `sops/`. A display title and an entry key are separate values, so the same title can exist as a fact and as a procedure, in one space or in two.

The L1 index holds the full active directory on disk in write order; heat never rewrites it. Context assembly gives the project index and the global index separate character budgets: rules come first, and the entry layer keeps at least a quarter. Entries are injected in usage-heat order (real `memory_read` calls score; the same entry scores once per session; maintenance reads and search hits do not score; `related` adds a small capped bonus; new entries get short-lived protection). When the budget fits, every entry appears in heat order; when it does not, hot entries are kept and low-heat entries get turn-rotated exploration slots, with the omission count stated in the view. The order is fixed within one user turn and refreshed on the next user message, so long sessions keep absorbing new heat without mid-turn churn. A recall section built from the current user request (plain BM25) surfaces low-heat but relevant memories without relying on luck. Heat only affects recommendation order: it never changes whether an entry exists and never triggers automatic archiving.

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

Fixed per session for the indexes, bounded by `l1MaxChars` for the project index and `globalL1MaxChars` for the global one. Over budget it keeps the hottest entries first, gives low-heat entries turn-rotated exploration slots, and states the omission count explicitly in the view instead of dropping entries silently; nothing is deleted or archived because of heat. Reads add tokens on demand and return line ranges, so a large entry can be consumed in pieces. `progressive: true` keeps index lines short and defers detail to reads.

#### KV cache effect

The indexes sit in a stable prefix, so an unchanged snapshot reuses the provider cache. A write that changes the index replaces that prefix and invalidates the cached tokens after it.

## Known Limitations and Deferred Work

- **Index folding hides detail**, when the project or global index exceeds its character budget, entries are folded and descriptions are trimmed. The full body stays available through `memory_read`, but an agent that reads only the index sees less than the file contains.
- **Maintenance spends model calls**, internal end-of-turn reviews and `reflectionMode: auto` runs invoke subagents that consume tokens. `autoPending: true` records retry candidates on disk for later review. Budget limits apply per maintenance run rather than per session.
- **Namespace identity is path based**, automatic namespaces derive from workspace identity or canonical root path. Moving a project to another path creates a different namespace until it is migrated explicitly.
- **Tool access is per session**, basic memory tools are available in each session and the memory skill or `memory_activate` adds optional tools. Historical activation restores the tool mode only; permissions remain user-configured. The directory index is provided in context, while entry bodies are read through tools.
- **Usage numbers are per namespace**, the line on the memory page measures the `index.txt` of the selected namespace only and never combines the `default` and project spaces. Prompt injection budgets the two spaces separately, and the usage line shows one at a time.
- **Budget overflow only affects the prompt view**, the on-disk `index.txt` always holds the full active directory and heat never reorders it, and the character counts in the usage view are the real length of that file. Going over budget neither deletes nor archives entries; it only trims the view injected into the prompt. An `over_limit` flag means the injection budget is short, not that entries were lost.

### Dev Note

None.
