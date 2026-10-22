import { defineTool, ToolArgsError, validateJsonSchemaValue, valueSchemaSpecToJsonSchema } from "@deepseek-ai/dsh-tools";

export const MAINTENANCE_COMPLETE = "memory_maintenance_complete";

export function installMaintenanceCompletion(agentCtx, agent, parameters, beforeComplete) {
	const schema = valueSchemaSpecToJsonSchema({ type: "object", additionalProperties: false, properties: parameters });
	const staged = new Map();
	let pending, captured;
	const commit = value => { captured = { ...value, receiptFrom: agent.session.seq }; };
	agentCtx.tools.register(defineTool({
		name: MAINTENANCE_COMPLETE,
		description: "提交本次维护的结构化结果并正常结束本轮。所有条目核对与待办保存完成后调用一次。",
		parameters,
		output: { schema: { type: "object", properties: { recorded: { type: "boolean", required: true } }, additionalProperties: false }, render: () => [{ type: "text", text: "本次维护结果已提交。" }] },
		async execute(args, exec) {
			const violations = validateJsonSchemaValue(schema, args);
			if (violations.length) throw new ToolArgsError(violations);
			await beforeComplete(args, exec);
			staged.set(exec, { value: args, rootCallId: exec.rootCallId });
			exec.concludeTurn();
			return { recorded: true };
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
