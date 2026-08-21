// 纯 JS 文本相似度与检索引擎（无模型红线）：
// - tokenize/jaccard：近重复检测与合并候选（ASCII 词 + 单数字 + CJK bigram）
// - BM25Index：memory_search 的全文检索排序（Okapi BM25，k1/b 经典取值）
//
// 分词策略：ASCII 词元（≥2 位）+ 单个数字（端口/版本等区分性重要）+ CJK bigram。
// 中文没有空格边界，bigram 是无模型条件下最稳的召回单元。

/** 规范化文本：小写、压缩空白。 */
export function normalizeText(text) {
	return String(text ?? "").toLowerCase().replace(/\s+/g, " ").trim();
}

/** 混合分词：ASCII 词 + 单个数字 + CJK bigram。用于 BM25 检索与 Jaccard。 */
export function tokenize(text) {
	const s = normalizeText(text);
	const tokens = [];
	for (const m of s.matchAll(/[a-z0-9_+\-./]{2,}|\d/g)) tokens.push(m[0]);
	for (const m of s.matchAll(/[\u4e00-\u9fff]{2,}/g)) {
		const run = m[0];
		for (let i = 0; i + 2 <= run.length; i++) tokens.push(run.slice(i, i + 2));
	}
	return tokens;
}

/** Jaccard 相似度 = |A∩B| / |A∪B|，空集对空集定义为 1（等价于完全一致）。 */
export function jaccard(a, b) {
	if (a.size === 0 && b.size === 0) return 1;
	if (a.size === 0 || b.size === 0) return 0;
	let inter = 0;
	for (const g of a) if (b.has(g)) inter++;
	const union = a.size + b.size - inter;
	return union === 0 ? 0 : inter / union;
}

/**
 * Okapi BM25 全文检索索引。
 * addDoc(id, text) 后 search(query, limit) 返回 [{ id, score }]（按分数降序）。
 */
export class BM25Index {
	constructor({ k1 = 1.2, b = 0.75 } = {}) {
		this.k1 = k1;
		this.b = b;
		this.docs = new Map(); // id -> Map(term -> tf)
		this.docLen = new Map(); // id -> length
		this.df = new Map(); // term -> doc frequency
		this.totalLen = 0;
	}

	addDoc(id, text) {
		this.removeDoc(id);
		const tokens = tokenize(text);
		const tf = new Map();
		for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
		this.docs.set(id, tf);
		this.docLen.set(id, tokens.length);
		this.totalLen += tokens.length;
		for (const t of tf.keys()) this.df.set(t, (this.df.get(t) ?? 0) + 1);
	}

	removeDoc(id) {
		const tf = this.docs.get(id);
		if (!tf) return;
		for (const t of tf.keys()) {
			const n = (this.df.get(t) ?? 1) - 1;
			if (n <= 0) this.df.delete(t);
			else this.df.set(t, n);
		}
		this.totalLen -= this.docLen.get(id) ?? 0;
		this.docs.delete(id);
		this.docLen.delete(id);
	}

	get size() {
		return this.docs.size;
	}

	/** 查询词元：与文档同一套分词。 */
	search(query, limit = 8) {
		const N = this.docs.size;
		if (N === 0) return [];
		const avgLen = this.totalLen / N || 1;
		const qTokens = tokenize(query);
		if (qTokens.length === 0) return [];
		const scores = new Map();
		for (const t of qTokens) {
			const df = this.df.get(t) ?? 0;
			if (df === 0) continue;
			const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
			for (const [id, tf] of this.docs) {
				const f = tf.get(t);
				if (!f) continue;
				const len = this.docLen.get(id) ?? 0;
				const denom = f + this.k1 * (1 - this.b + this.b * (len / avgLen));
				const score = idf * ((f * (this.k1 + 1)) / denom);
				scores.set(id, (scores.get(id) ?? 0) + score);
			}
		}
		return [...scores.entries()]
			.map(([id, score]) => ({ id, score }))
			.sort((a, b) => b.score - a.score)
			.slice(0, Math.max(1, limit));
	}
}
