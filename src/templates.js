// L0/L1/L2 模板与索引标记常量。文本内容被索引重建逻辑按锚点匹配，
// 修改措辞前先检查 lib 侧的锚点字符串。

export const AUTO_BEGIN = "<!-- AUTO-BEGIN -->";
export const AUTO_END = "<!-- AUTO-END -->";

export const L0_TEMPLATE = `# Memory Management SOP (L0)
## 核心公理
1. 行动验证原则：任何写入 L1/L2/L3 的信息必须源自【成功的工具调用结果】（实测/验证/确认）。严禁模型固有知识、推理猜测、未验证假设。口号：无行动，不记忆。
2. 神圣不可删改性：已验证的事实可以压缩文字、迁移层级，但严禁丢弃。supersede/archive 必须保留历史。
3. 禁止易变状态：时间戳、PID、临时 Session ID、一次性路径等高频变化数据不存。
4. 最小充分指针：上层只留能定位下层的短标识，多一词即冗余。

## 分层
- L1 index.txt：≤30 行。两层「场景关键词→记忆定位」映射 + RULES（红线规则/高频犯错点）。只写存在性，禁写 How-to 细节。
- L2 facts.md：环境特异性事实（路径/凭证引用/配置/实测参数）。按 ## SECTION 组织。
- L3 sops/*.md：特定任务经验（关键前置 + 典型坑 + 稳定步骤），尽可能短。
- pending/*.md：自动蒸馏候选区，未确认不进入正式记忆。
- 通用常识 / 易变状态 / 日志记录：严禁存储。

## 写入决策树
"这条信息该放哪层？"
- 环境特异性事实（路径/配置/凭证引用/实测参数）→ L2 facts.md
- 复杂任务经验（坑点/前置条件/稳定步骤，多次重试才成功且未来可用）→ L3 sop
- 通用操作规律（跨任务红线）→ L1 [RULES]（一句压缩）
- 其余（常识/易变/未验证）→ 不存
`;

export const INDEX_TEMPLATE = `# [Memory Index - L1]
分层记忆: L0规则(memory_management_sop.md) | L1索引(this) | L2事实(facts.md) | L3技能(sops/) | 候选(pending/)
需要细节时用 memory_read / memory_list 取 L2/L3；新增经验用 memory_write（须带证据）
任务完成且【行动验证成功】时主动 memory_write 沉淀（无需等用户提醒；无验证信息则不写）
<!-- AUTO-BEGIN -->
[L2] （facts.md 的条目将在此列出）
[L3] （sops/ 的文件将在此列出）
<!-- AUTO-END -->
[RULES]
（红线规则：不提醒就会犯的错。词级维护，禁 overwrite）
`;

export const FACTS_TEMPLATE = `# [Facts - L2]
按 ## SECTION 组织环境特异性事实。只写行动验证过的内容。
`;
