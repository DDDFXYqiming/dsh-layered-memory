export const entryKey = entry => JSON.stringify([entry.namespace, entry.kind, entry.key]);
const sourceKey = source => JSON.stringify([source.sourceSession, source.seq]);

export function createMaintenanceProgress(namespace, revisionOf) {
	const reads = new Map(), coverage = new Map(), changes = new Map(), results = new Map();
	function checkEntry(entry) {
		if (entry.namespace !== namespace || !["fact", "sop", "pending"].includes(entry.kind)) throw new Error(`MEMORY_ENTRY_SCOPE ${JSON.stringify(entry)}: 请使用本次空间的精确条目。`);
	}
	function read(value) {
		if (!value.entry || !["fact", "sop", "pending"].includes(value.entry.kind) || value.not_found) return false;
		const key = entryKey(value.entry);
		if (value.revision !== revisionOf(value.entry)) return false;
		let page = coverage.get(key);
		if (!page || page.revision !== value.revision) {
			page = { revision: value.revision, ranges: [] };
			coverage.set(key, page);
		}
		page.ranges.push([value.from_line, value.to_line]);
		page.ranges.sort((a, b) => a[0] - b[0]);
		const merged = [];
		for (const range of page.ranges) {
			const previous = merged.at(-1);
			if (previous && range[0] <= previous[1] + 1) previous[1] = Math.max(previous[1], range[1]);
			else merged.push([...range]);
		}
		page.ranges = merged;
		if (value.complete || merged[0]?.[0] === 1 && merged[0][1] >= value.total_lines) reads.set(key, value.revision);
		return reads.get(key) === value.revision;
	}
	function changed(entry, before, after, tool, sources = []) {
		if (before === after) return null;
		const key = entryKey(entry);
		if (!changes.has(key)) changes.set(key, []);
		changes.get(key).push({ before, after, tool });
		if (after !== null) reads.set(key, after);
		const previous = results.get(key);
		const result = { entry, status: "changed", reason: `${tool} 已保存`, revision: changes.get(key)[0].before ?? after, currentRevision: after,
			sources: [...new Map([...(previous?.sources || []), ...sources].map(source => [sourceKey(source), source])).values()] };
		results.set(key, result);
		return result;
	}
	function normalize(result) {
		const { entry } = result;
		checkEntry(entry);
		const key = entryKey(entry), current = revisionOf(entry), writes = changes.get(key) || [];
		const waiting = result.status === "waiting_evidence";
		if (current === null && (!writes.length || waiting)) throw new Error(`MEMORY_ENTRY_MISSING ${JSON.stringify(entry)}: 条目已不存在，请从结案列表移除。`);
		if (writes.length && writes.at(-1).after !== current && reads.get(key) !== current) {
			throw new Error(`MEMORY_ENTRY_CHANGED ${JSON.stringify(entry)}: 保存后正文又发生变化，请 memory_read({entry,full:true}) 后再决定保留或等待证据。`);
		}
		if (!waiting && !writes.length && reads.get(key) !== current) {
			throw new Error(`MEMORY_READ_REQUIRED ${JSON.stringify(entry)}: 本次尚未完整读取当前版本。请 memory_read({entry,full:true})，或说明缺口并标记 waiting_evidence；本轮仍可继续。`);
		}
		if (waiting && !result.reason?.trim()) throw new Error(`MEMORY_REASON_REQUIRED ${JSON.stringify(entry)}: 请说明还缺少什么证据。`);
		return { entry, status: waiting ? "waiting_evidence" : writes.length ? "changed" : "retained",
			reason: result.reason?.trim() || (writes.length ? `${writes.at(-1).tool} 已保存` : "已完整读取当前正文，保留原内容"),
			revision: writes[0]?.before ?? current, currentRevision: current, sources: results.get(key)?.sources || [] };
	}
	function accept(entries) {
		for (const result of entries) results.set(entryKey(result.entry), result);
	}
	return { reads, changes, results, read, changed, normalize, accept, checkEntry };
}
