// v0.6.4 回归：① 归档横幅（归档只隐藏 L1，正文留在文件里 → 首部写自解释横幅，
// 再次写入时剥离）；② memory-meta 补登记（facts/sops 里存在但 meta 无记录的条目，
// 只补存在性 + mtime，不得把正文证据抄进 evidence）。
import { test, expect } from "vitest";
import { mkdtempSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
	ensureNamespaceLayout, upsertFact, readFact, readSop, setEntryMeta, getEntryMeta,
	archiveEntryBody, stripArchiveBanner, withArchiveBanner, hasArchiveBanner,
	backfillMeta, readMeta, factSections, sopNames,
} from "../src/store.js";
import { writeMemory } from "../src/memory-ops.js";

const mk = () => {
	const root = mkdtempSync(join(tmpdir(), "dsh-memory-v064-"));
	ensureNamespaceLayout(root);
	return root;
};

test("memory_archive 在正文首部写横幅：fact 与 sop 都写，且重复归档幂等", () => {
	const root = mk();
	upsertFact(root, "fact-alpha", "正文第一行\n\n> 证据: e1");
	expect(archiveEntryBody(root, "fact", "fact-alpha")).toBe(true);
	const body = readFact(root, "fact-alpha");
	expect(body.startsWith("> [已归档")).toBe(true);
	expect(body).toContain("正文第一行");
	expect(body).toContain("> 证据: e1");
	// 幂等：已带横幅时不重复追加
	expect(archiveEntryBody(root, "fact", "fact-alpha")).toBe(false);
	expect(readFact(root, "fact-alpha").split("> [已归档").length - 1).toBe(1);

	writeFileSync(join(root, "sops", "my-sop.md"), "# my-sop\n\n步骤一\n\n> 证据: e\n");
	expect(archiveEntryBody(root, "sop", "my-sop")).toBe(true);
	const sop = readSop(root, "my-sop");
	expect(sop.startsWith("# my-sop\n\n> [已归档")).toBe(true);
	expect(sop).toContain("步骤一");
	expect(archiveEntryBody(root, "sop", "my-sop")).toBe(false);
});

test("stripArchiveBanner / withArchiveBanner 语义，且 writeMemory 会剥离旧横幅", () => {
	const root = mk();
	const banner = withArchiveBanner("新正文");
	expect(hasArchiveBanner(banner)).toBe(true);
	expect(stripArchiveBanner(banner)).toBe("新正文");
	expect(hasArchiveBanner(stripArchiveBanner(banner))).toBe(false);
	// 无横幅时原样返回，不做任何删改
	expect(stripArchiveBanner("普通正文")).toBe("普通正文");

	upsertFact(root, "fact-beta", "旧正文\n\n> 证据: e0");
	archiveEntryBody(root, "fact", "fact-beta");
	expect(hasArchiveBanner(readFact(root, "fact-beta"))).toBe(true);
	// 用带横幅的内容重新写入（模拟取消归档/回滚），落盘后不得残留横幅
	writeMemory(root, { topic: "fact-beta", entryType: "fact", content: readFact(root, "fact-beta"), evidence: "e2" });
	const after = readFact(root, "fact-beta");
	expect(hasArchiveBanner(after)).toBe(false);
	expect(after).toContain("旧正文");
	expect(after).toContain("> 证据: e2");
});

test("backfillMeta 补登记孤儿条目：只补存在性 + mtime，不抄正文证据，且幂等", () => {
	const root = mk();
	// 直接落一段 facts.md section（模拟旧版本迁移 / examples 种子 / 跨机导入）
	writeFileSync(join(root, "facts.md"), readFileSync(join(root, "facts.md"), "utf8") + "## orphan-fact\n正文\n\n> 证据: 别处的验证\n\n", "utf8");
	writeFileSync(join(root, "sops", "orphan-sop.md"), "# orphan-sop\n\n正文\n\n> 证据: 别处的验证\n", "utf8");
	expect(factSections(root)).toContain("orphan-fact");
	expect(sopNames(root)).toContain("orphan-sop");

	const added = backfillMeta(root, { namespace: "test" });
	expect(added.sort()).toEqual(["fact:orphan-fact", "sop:orphan-sop"]);
	const meta = readMeta(root);
	const f = meta.facts["orphan-fact"];
	expect(f.backfilled).toBe(true);
	expect(f.namespace).toBe("test");
	expect(f.evidence).toBe("");                       // 不抄正文证据
	expect(Number.isFinite(Date.parse(f.updatedAt))).toBe(true);
	const s = meta.sops["orphan-sop"];
	expect(s.backfilled).toBe(true);
	expect(s.evidence).toBe("");
	// 已有 isArchived 判据仍读得到（补登记不得把归档状态写反）
	expect(getEntryMeta(root, "sop", "orphan-sop").archived).toBe(false);

	// 幂等：第二次无缺失、不写文件
	const before = readFileSync(join(root, "memory-meta.json"), "utf8");
	expect(backfillMeta(root, { namespace: "test" })).toEqual([]);
	expect(readFileSync(join(root, "memory-meta.json"), "utf8")).toBe(before);

	// 已归档条目的补登记不改变 archived 语义（此处 orphan-fact 归档后 meta 已存在，不再补）
	setEntryMeta(root, "fact", "orphan-fact", { archived: true });
	expect(backfillMeta(root)).toEqual([]);
	expect(getEntryMeta(root, "fact", "orphan-fact").archived).toBe(true);
	expect(existsSync(join(root, "facts.md"))).toBe(true);
});
