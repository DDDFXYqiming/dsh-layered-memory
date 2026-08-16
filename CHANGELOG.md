# Changelog

All notable changes to `dsh-layered-memory` are documented here.

## [0.4.0] - 2026-08-16

### Added
- `memory_stats` 工具：统计 L2/L3/pending/archived/大小。
- `memory_maintain` 工具：去重、压缩 L1 索引、生成统计、产出可合并 SOP 候选。
- 自动维护：`maintainEveryTurns` 配置（默认 20），turn/end 低频率触发 `runMaintain`。
- 测试与 CI：vitest 单元测试 + GitHub Actions（build/test/headless smoke）。
- `dsh-plugin` 关键词与发布工程化基础。

### Changed
- 命名空间隔离：存储布局支持 `<memoryDir>/<namespace>/...`，`default` 兼容旧根目录。
- 溯源/审计：`memory-meta.json` 记录 `sourceSession` / `sourceSeqs` / `createdAt` / `updatedAt` / `evidence`。
- 自动蒸馏：turn/end 将成功工具调用写入 `pending/` 候选区，`memory_accept` 确认后入正式记忆。
- 冲突/过期：`memory_update`（supersede）、`memory_archive`、`memory_rollback`，旧版本保留在 `.history/` / `archive/`。
- `memory_expand`：通过 `ctx.sessionQuery` 展开原始 session 事件。

### Fixed
- `memory_archive` 后 `memory_read` 不再返回已归档内容：归档记忆只保留在 `archive/` / meta 中，可通过 `memory_rollback` 恢复，但常规 `memory_read` 返回 `not_found`。

## [0.1.0] - 2026-08-14

### Added
- 初始版本：L1 索引注入 + L2 facts + L3 sops + 行动验证写入。
