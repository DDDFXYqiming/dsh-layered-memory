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
- L1 index.txt：AUTO 段由插件全量重建（每层一行、" | " 打包所有活跃条目名），预算是字符数（l1MaxChars）而非行数——被隐藏的条目等于永久隐身，因此存在性不裁剪。超预算时合并/归档条目或精简 [RULES]，不要指望系统替你藏。
- L2 facts.md：环境特异性事实（路径/凭证引用/配置/实测参数）。按 ## SECTION 组织；正文禁止出现 "## " 行（会被解析成新 section）。
- L3 sops/*.md：特定任务经验（关键前置 + 典型坑 + 稳定步骤），尽可能短。
- pending/*.md：自动蒸馏候选区（默认关闭，需 autoPending:true 才产），未确认不进入正式记忆。
- 通用常识 / 易变状态 / 日志记录：严禁存储。

## L1 词数 ROI 判据（写索引/名字前自查）
ROI = (不放这个词的犯错概率 × 代价) / 每轮词数成本。
- 该留：**反直觉触发词**——用户说出这个词时，不提示就想不到要查哪条记忆（如「坐标空间坑(屏幕绝对vs窗口本地)」）。
- 该删：名字翻译（名字自解释时括号是废词）、内容描述、实现细节、不提醒也想得到的通用能力。
- 改名常常优于加描述：条目名自解释就不用在 L1 加注。
- 禁值存储：L1/topic 不放 IP、端口、凭证、commit 号、日期——这些属于 L2 正文或干脆不存。

## 写入决策树
"这条信息该放哪层？"
- 环境特异性事实（路径/配置/凭证引用/实测参数）→ L2 facts.md
- 复杂任务经验（坑点/前置条件/稳定步骤，多次重试才成功且未来可用）→ L3 sop
- 通用操作规律（跨任务红线）→ L1 [RULES]（一句压缩）
- 其余（常识/易变/未验证）→ 不存
`;

export const INDEX_TEMPLATE = `# [Memory Index - L1]
分层记忆: L0规则(memory_management_sop.md) | L1索引(this) | L2事实(facts.md) | L3技能(sops/)
需要细节时用 memory_read / memory_list 取 L2/L3；新增经验用 memory_write（须带证据）
任务完成且【行动验证成功】时主动 memory_write 沉淀（无需等用户提醒；无验证信息则不写）
记忆工具不在列表里时先调用 memory_activate 激活（L1 常驻但工具是渐进暴露的）
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
