# Changelog

All notable changes to `dsh-layered-memory` are documented here.

## [Unreleased]

### Fixed
- **新条目"写完即隐身"修复**：`memory_write` 写入后立即 bump 热度；`memory_maintain` 压缩排序加入 recency 保护（7 天内创建、无访问热度的条目获得加分），新写入的 fact/sop 不再被压缩立刻裁出 L1。
- **非 SOP 文件混入 L3 修复**：`sopNames()` 过滤保留名（README/LICENSE/index，大小写不敏感），安装/文档文件不再计入 L3 统计、索引与合并候选。
- 补齐 `memory-meta.json` 的 `createdAt`：首建记录、更新保留原创建时间（此前仅写 `updatedAt`，recency 无据可查）。
- 新增回归测试：README/LICENSE 过滤、recency 保护（陈旧条目被裁时新鲜条目保留）。
- 文档：README/SKILL 补充 recency 保护、写入即热、保留名过滤说明。

### Fixed
- 修复 `memory_maintain` 因尾部空行、错误行数预算而过度裁剪 L1 索引的问题。
- L1 指针改为逐条逻辑行；索引未超限时完整保留，超限时两层至少各保留一个指针并显示隐藏数量。
- 增加 `memory_maintain` 的完整索引、空行、超限裁剪和底层记忆可读性回归测试。

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
