// v0.6.2 回归：turn/end 反思 inject 必须延迟到下一宏任务（宿主 append 重入守卫）
import { test, expect } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { apply } from "../lib/index.js";

test("turn/end reflection inject is deferred out of the append publish window and still delivered", async () => {
	const memDir = mkdtempSync(join(tmpdir(), "dsh-memory-v062-"));
	const eventHandlers = {};
	const agents = new Map();
	const ctx = {
		get(service) {
			if (service === "systemPrompt") return { context: () => () => {} };
			if (service === "agents") return { get: (id) => agents.get(id) ?? null };
			return undefined;
		},
		on(event, handler) { eventHandlers[event] = handler; return () => {}; },
		skills: { register: () => () => {} },
		tools: { register: () => () => {}, restrict: () => () => {} },
		logger: { info() {}, warn() {} },
		effect(factory) { const d = factory(); if (typeof d === "function") effects.push(d); },
	};
	const effects = [];
	const disposer = apply(ctx, {
		memoryDir: memDir,
		progressive: false,
		autoNamespace: false,
		defaultNamespace: "test",
		autoPending: true,
	});
	try {
		// 5 条 pending 候选 = reflectPendingThreshold 默认值，触发 overPending
		mkdirSync(join(memDir, "test", "pending"), { recursive: true });
		for (let i = 0; i < 5; i++) writeFileSync(join(memDir, "test", "pending", `p${i}.md`), "# candidate\n");
		let publishWindow = true;
		const delivered = [];
		agents.set("sess-v062", {
			id: "sess-v062",
			inject(payload) {
				if (publishWindow) throw new Error("session append cannot reenter while another append is being published");
				delivered.push(payload);
			},
		});
		eventHandlers["session/event"]({ id: "sess-v062" }, { type: "turn/end", seq: 1 });
		// 关键断言①：观察者同步阶段绝不调用 inject（0.6.1 在此直接撞守卫）
		expect(delivered.length).toBe(0);
		publishWindow = false;
		await new Promise((r) => setTimeout(r, 10));
		// 关键断言②：下一宏任务正常送达
		expect(delivered.length).toBe(1);
		expect(String(delivered[0].content[0].text)).toContain("[记忆整理请求]");
		expect(String(delivered[0].content[0].text)).toContain("pending 候选已累积 5 条");
		expect(delivered[0].source).toEqual({ kind: "plugin:layered-memory" });
		// 关键断言③：冷却期内下一 turn 不再重复调度（reflectionState 同步更新）
		eventHandlers["session/event"]({ id: "sess-v062" }, { type: "turn/end", seq: 2 });
		await new Promise((r) => setTimeout(r, 10));
		expect(delivered.length).toBe(1);
	} finally {
		if (typeof disposer === "function") disposer();
		for (const f of effects) f();
		rmSync(memDir, { recursive: true, force: true });
	}
});
