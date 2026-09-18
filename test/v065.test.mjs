// v0.6.5 回归：归档横幅不得污染检索面——摘录要以真实内容开头（横幅占 160 字符预算约 60 字符），
// 索引文本里也不该出现"已归档/历史快照"这类与内容无关的 token。
import { test, expect } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ensureNamespaceLayout, upsertFact, setEntryMeta, archiveEntryBody, readFact } from "../src/store.js";
import { searchNamespaces } from "../src/search.js";

test("检索摘录剥掉归档横幅，正文内容优先；archived 字段仍为 true", () => {
	const memDir = mkdtempSync(join(tmpdir(), "dsh-memory-v065-"));
	const ns = "probe";
	const root = join(memDir, ns);
	ensureNamespaceLayout(root);
	upsertFact(root, "cleanup-probe", "本次实际回收：C 盘可用 385.24 GB 到 409.56 GB（+24.32 GB），vhdx 与 pagefile 需要机制命令。\n\n> 证据: e1");
	setEntryMeta(root, "fact", "cleanup-probe", { archived: true });
	expect(archiveEntryBody(root, "fact", "cleanup-probe")).toBe(true);
	expect(readFact(root, "cleanup-probe").startsWith("> [已归档")).toBe(true);

	const hits = searchNamespaces(memDir, [ns], "回收 C 盘 vhdx pagefile", { limit: 3, includeArchived: true });
	expect(hits.length).toBeGreaterThan(0);
	const hit = hits.find((h) => h.name === "cleanup-probe");
	expect(hit).toBeTruthy();
	expect(hit.archived).toBe(true);
	expect(hit.snippet).not.toContain("[已归档");
	expect(hit.snippet).not.toContain("历史快照");
	expect(hit.snippet).toContain("385.24");
	expect(hit.snippet.length).toBeLessThanOrEqual(160);

	// 不带横幅的条目行为不变
	upsertFact(root, "plain-probe", "普通条目正文没有横幅。\n\n> 证据: e2");
	const hits2 = searchNamespaces(memDir, [ns], "普通条目正文", { limit: 3 });
	expect(hits2.find((h) => h.name === "plain-probe").snippet).toContain("普通条目正文");
});
