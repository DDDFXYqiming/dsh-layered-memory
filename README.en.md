[简体中文](README.md) | English

# dsh-layered-memory

**A three-tier cross-session long-term memory extension for DeepSeek Harness (DSH).**

Standard coding agents lose their entire context the moment a session closes. Returning to the same repository requires developers to re-explain runtime parameters, build commands, and past debugging workarounds. `dsh-layered-memory` implements a transparent, dependency-free long-term memory engine backed entirely by on-disk Markdown and JSON files—featuring branch-aware namespaces, BM25 indexing, rollback snapshots, and automated memory hygiene.

---

## Architectural Design: The Three Tiers

```
┌────────────────────────────────────────────────────────┐
│  Tier 1: Index (L1)                                    │
│  Compact index dictionary + persistent [RULES] blocks   │
├────────────────────────────────────────────────────────┤
│  Tier 2: Facts (L2)                                    │
│  Deterministic environment constants, ports & flags    │
├────────────────────────────────────────────────────────┤
│  Tier 3: Experience / SOPs (L3)                        │
│  Task procedures, troubleshooting steps, and evidence  │
└────────────────────────────────────────────────────────┘
```

* **L1 Compact Index**: A lightweight table of contents loaded into active context with token budget auto-folding to prevent context bloat.
* **L2 Environment Facts**: Explicit technical specifications, container parameters, and project quirks.
* **L3 Task SOPs**: Step-by-step troubleshooting solutions and workflows, tagged with provenance metadata referencing historical turns.

---

## Technical Highlights

* **Zero External Database Dependencies**: All memories reside as plain Markdown and JSON files in `~/.dsh/memory/`. No vector stores or embedding services required; everything is human-editable, diffable, and easily tracked under Git.
* **Fast BM25 Keyword Retrieval**: Includes an on-device BM25 ranking algorithm that searches across facts, SOP documents, and archived entries in milliseconds.
* **Dynamic Workspace & Git Branch Namespaces**: Infers isolated memory namespaces automatically based on current working directory and checked-out branch, keeping experiments and projects segregated.
* **Progressive Disclosure**: By default, only lightweight discovery endpoints are exposed. The full suite of 14 granular tools is revealed only when the agent explicitly activates memory management.
* **Secret Redaction & Security Guards**: Blocks plain-text secrets (API keys, credentials, private keys) from being saved into memory. Redacts sensitive patterns in supporting evidence before writing.
* **Immutable Snapshotting & Rollback**: Edits and updates automatically generate timestamped snapshots in `.history/`, allowing instant rollbacks at any time.

---

## Tool Matrix

| Category | Tool | Function |
| :--- | :--- | :--- |
| **Search & Discovery** | `memory_list` | Inspect active entries across all tiers, pending queues, and budgets |
| | `memory_read` | Fetch entries with support for outline excerpts and line slicing |
| | `memory_search` | BM25 full-text search across active facts, SOPs, and archives |
| **Authoring & Revisions**| `memory_write` | Save new facts or SOPs with mandatory evidence and secret filtering |
| | `memory_update` | Modify entries with automatic `.history/` snapshotting |
| | `memory_rollback` | Revert entries to the most recent historical snapshot |
| **Lifecycle** | `memory_archive` | Hide obsolete entries from active L1 without deleting searchable files |
| | `memory_pending` | Review candidates automatically distilled from retry sequences |
| | `memory_accept` | Promote a pending candidate into an official SOP entry |
| | `memory_promote` | Elevate repository-specific lessons into the global namespace |
| **Hygiene & Auditing** | `memory_index` | Rebuild L1 indexes while protecting manual rule segments |
| | `memory_maintain` | Merge duplicates, evaluate near-collision entries, and prune cold data |
| | `memory_stats` | Report entry counts, size footprints, and namespace distribution |

---

## Installation & Setup

```bash
# Install via DSH Plugin Manager
dsh plugin --profile web add github:DDDFXYqiming/dsh-layered-memory
```

For local development:
```bash
git clone https://github.com/DDDFXYqiming/dsh-layered-memory.git
cd dsh-layered-memory
npm install && npm run build
dsh plugin --profile web add .
```

---

## Configuration

Adjust memory policies in your profile's `cordis.patch.yml`:

```yaml
- id: dsh-layered-memory
  config:
    memoryDir: ''              # Memory root directory (defaults to ~/.dsh/memory)
    l1MaxChars: 12288         # Character budget ceiling for L1 index
    progressive: true          # Enable progressive tool disclosure
    autoNamespace: true        # Automatic namespace isolation per directory and branch
    autoPending: false         # Distill candidates from failed command loops
    maintainEveryTurns: 20     # Run automated maintenance sweep every N turns
    nearDupeThreshold: 0.85    # Jaccard similarity threshold for duplicate warnings
    heatHalfLifeDays: 14       # Access frequency half-life (in days)
    recencyWindowDays: 7       # Protected grace period for newly created items
```

---

## License

This project is open-sourced under the [MIT License](LICENSE).
