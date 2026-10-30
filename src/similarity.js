// 无模型红线：本文件不引入任何模型依赖，检索与相似度必须是纯 JS 计算。

/** 只用于检索/相似度评分，**不用于"是否同一内容"的归档判定**。 */
export function normalizeText(text) {
	return String(text ?? "").toLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * 自动去重判定专用，与 normalizeText（检索用）分离：不折叠大小写、不合并正文空白——
 * 路径、命令、参数里的大小写与空格都是语义（/srv/App 与 /srv/app 是两个目录）。
 */
export function exactNormalize(text) {
	return String(text ?? "")
		.replace(/\r\n?/g, "\n")
		.split("\n")
		.map((line) => line.replace(/[ \t]+$/, ""))
		.join("\n")
		.replace(/\n+$/, "");
}

export function tokenize(text) {
	const s = normalizeText(text);
	const tokens = [];
	for (const m of s.matchAll(/[a-z0-9_+\-./]{2,}|\d/g)) {
		const token = m[0];
		tokens.push(token);
		if (/[._+/-]/.test(token)) {
			for (const part of token.split(/[._+/-]+/)) {
				if (part.length >= 2) tokens.push(part);
			}
		}
	}
	for (const m of s.matchAll(/[\u4e00-\u9fff]{2,}/g)) {
		const run = m[0];
		for (let i = 0; i + 2 <= run.length; i++) tokens.push(run.slice(i, i + 2));
	}
	return tokens;
}

/** 空集对空集定义为 1（等价于完全一致）。 */
export function jaccard(a, b) {
	if (a.size === 0 && b.size === 0) return 1;
	if (a.size === 0 || b.size === 0) return 0;
	let inter = 0;
	for (const g of a) if (b.has(g)) inter++;
	const union = a.size + b.size - inter;
	return union === 0 ? 0 : inter / union;
}

export class BM25Index {
	constructor({ k1 = 1.2, b = 0.75 } = {}) {
		this.k1 = k1;
		this.b = b;
		this.docs = new Map();
		this.docLen = new Map();
		this.df = new Map();
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
