import { defineTool, ToolArgsError, validateJsonSchemaValue, valueSchemaSpecToJsonSchema } from "@deepseek-ai/dsh-tools";

export const MAINTENANCE_COMPLETE = "memory_maintenance_complete";

export function installMaintenanceCompletion(agentCtx, agent, parameters, beforeComplete) {
	const schema = valueSchemaSpecToJsonSchema({ type: "object", additionalProperties: false, properties: parameters });
	const staged = new Map();
	let pending, captured;
	const commit = value => { captured = { ...value, receiptFrom: agent.session.seq }; };
	agentCtx.tools.register(defineTool({
		name: MAINTENANCE_COMPLETE,
		description: "结束本次维护。写入已由程序保存记账，只需提交总结；可补充保留、待证据或剩余条目。校验失败时本轮继续，可根据错误修正后重交。",
		parameters,
		output: { schema: { type: "object", properties: { recorded: { type: "boolean", required: true } }, additionalProperties: true }, render: (_args, value) => [{ type: "text", text: JSON.stringify(value) }] },
		async execute(args, exec) {
			const violations = validateJsonSchemaValue(schema, args);
			if (violations.length) throw new ToolArgsError(violations);
			const value = await beforeComplete(args, exec);
			staged.set(exec, { value, rootCallId: exec.rootCallId });
			exec.concludeTurn();
			return { recorded: true, ...value };
		},
	}));
	agentCtx.tools.guard(() => captured || pending || staged.size ? "本次维护结果正在提交或已经完成" : undefined);
	agentCtx.on("tools/result", (exec, result) => {
		if (exec.name === MAINTENANCE_COMPLETE) {
			const value = staged.get(exec);
			staged.delete(exec);
			if (!value || result.isError) return;
			if (exec.parent) pending = { ...value, parent: exec.parent };
			else commit(value);
			return;
		}
		if (pending?.parent !== exec.token) return;
		const value = pending;
		pending = undefined;
		if (!result.isError) commit(value);
	});
	return { captured: () => captured };
}
