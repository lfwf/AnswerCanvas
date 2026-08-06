import type { RecreationBox, RecreationScene, RecreationStroke, RecreationText, RecreationTextStyle } from "./recreation-types";

const text = (id: string, order: number, x: number, y: number, width: number, value: string, style: RecreationTextStyle = {}): RecreationText => ({ id, kind: "text", order, x, y, width, text: value, style });
const stroke = (id: string, order: number, path: string, style: Omit<RecreationStroke, "id" | "kind" | "order" | "path"> = {}): RecreationStroke => ({ id, kind: "stroke", order, path, ...style });
const box = (id: string, order: number, x: number, y: number, width: number, height: number, style: Omit<RecreationBox, "id" | "kind" | "order" | "x" | "y" | "width" | "height"> = {}): RecreationBox => ({ id, kind: "box", order, x, y, width, height, ...style });

const blue = "#284d9a";
const green = "#23845e";
const red = "#c62727";
const ink = "#171717";
const ruled = "rgba(70, 102, 136, 0.16)";

export const currentRecreationScene: RecreationScene = {
  id: "photo-1-skill-agent-notes",
  sourceName: "Photo 1.jpg",
  width: 908,
  height: 1280,
  elements: [
    box("page-frame", 1, 14, 14, 880, 1248, { stroke: "rgba(20,20,20,.55)", strokeWidth: 1.2 }),
    stroke("header-rule-1", 2, "M 24 103 L 884 103", { color: ink, width: 1.2 }),
    stroke("header-rule-2", 3, "M 24 119 L 884 119", { color: ink, width: 1.2 }),
    stroke("table-top", 4, "M 14 137 L 894 137", { color: ink, width: 1.4 }),
    stroke("table-divider", 5, "M 220 137 L 220 1112", { color: ink, width: 1.2 }),
    stroke("summary-rule", 6, "M 14 1112 L 894 1112", { color: ink, width: 1.2 }),
    text("date", 7, 42, 43, 360, "日期： 2025.05.20", { fontSize: 20 }),
    text("course", 8, 42, 78, 360, "课程主题： 人工智能基础", { fontSize: 20 }),
    text("topic", 9, 468, 43, 390, "主题： 什么是 skill 和 agent", { fontSize: 20 }),
    text("page-number", 10, 468, 78, 300, "页码： 1 / 1", { fontSize: 20 }),
    text("cue-heading", 11, 28, 146, 180, "线索栏 (Cue)", { color: blue, fontSize: 20, fontWeight: 500 }),
    text("notes-heading", 12, 248, 146, 300, "笔记栏 (Notes)", { color: blue, fontSize: 20, fontWeight: 500 }),

    text("cue-skill", 20, 40, 207, 164, "★ 什么是 skill？\n- skill 的核心特征\n  是什么？\n- 举例说明", { fontSize: 18, lineHeight: 29 }),
    text("skill-title", 21, 242, 181, 560, "一、什么是 skill", { color: blue, fontSize: 21, fontWeight: 500 }),
    text("skill-definition", 22, 270, 217, 590, "skill（技能）是指智能体能够完成的一个具体、可复用的能力单元，\n通常用于实现某个特定的子任务或功能。", { fontSize: 17, lineHeight: 28 }),
    text("skill-core", 23, 242, 292, 250, "• 核心特征：", { color: blue, fontSize: 18, fontWeight: 500 }),
    text("skill-points", 24, 270, 329, 330, "① 聚焦：完成特定任务或操作；\n② 通常是原子化或相对独立的；\n③ 可被调用、组合和复用；\n④ 关注“怎么做”。", { fontSize: 17, lineHeight: 29 }),
    box("skill-example-box", 25, 615, 306, 248, 160, { stroke: blue, strokeWidth: 1.4, dash: "7 5", radius: 5 }),
    text("skill-example", 26, 632, 318, 212, "例：\n• 搜索信息（搜索 skill）\n• 计算数学表达式（计算 skill）\n• 读取文件（文件读取 skill）\n• 发送邮件（发送邮件 skill）", { fontSize: 15, lineHeight: 25 }),

    text("cue-agent", 30, 40, 514, 164, "★ 什么是 agent？\n- agent 的核心特征\n  是什么？\n- 举例说明", { fontSize: 18, lineHeight: 29 }),
    text("agent-title", 31, 242, 492, 560, "二、什么是 agent", { color: blue, fontSize: 21, fontWeight: 500 }),
    text("agent-definition", 32, 270, 528, 590, "agent（智能体）是一个能够感知环境、进行决策并采取行动以\n达成目标的实体（可以是软件程序或机器人等）。", { fontSize: 17, lineHeight: 28 }),
    text("agent-core", 33, 242, 606, 250, "• 核心特征：", { color: blue, fontSize: 18, fontWeight: 500 }),
    text("agent-points", 34, 270, 643, 350, "① 具有自主性：能够自主规划和决策；\n② 能感知环境并与环境交互；\n③ 有目标导向：为了达成目标而行动；\n④ 可以拥有并调用多个 skill 来完成任务；\n⑤ 关注“做什么”和“为什么做”。", { fontSize: 16, lineHeight: 27 }),
    box("agent-diagram-box", 35, 635, 581, 235, 211, { stroke: green, strokeWidth: 1.6, radius: 6 }),
    text("agent-diagram-label", 36, 650, 596, 205, "环境\n\n感知（输入）        反馈（结果）\n\nAgent（智能体）\n\n决策/规划\n\n行动", { color: ink, fontSize: 15, lineHeight: 25, textAlign: "center" }),
    stroke("agent-arrow-1", 37, "M 752 636 L 752 665", { color: green, width: 1.4 }),
    stroke("agent-arrow-2", 38, "M 752 719 L 752 752", { color: green, width: 1.4 }),

    text("cue-relation", 42, 40, 815, 164, "★ skill 和 agent\n   的关系？\n- 它们有什么区别\n  和联系？", { fontSize: 18, lineHeight: 29 }),
    text("relation-title", 43, 242, 812, 560, "三、skill 和 agent 的关系", { color: blue, fontSize: 20, fontWeight: 500 }),
    text("relation-difference", 44, 242, 845, 150, "• 区别：", { color: blue, fontSize: 17, fontWeight: 500 }),
    stroke("comparison-top", 45, "M 250 872 L 866 872", { color: blue, width: 1.2 }),
    stroke("comparison-mid-1", 46, "M 250 900 L 866 900", { color: "#a55f78", width: 1 }),
    stroke("comparison-mid-2", 47, "M 250 928 L 866 928", { color: "#a55f78", width: 1 }),
    stroke("comparison-mid-3", 48, "M 250 956 L 866 956", { color: "#a55f78", width: 1 }),
    stroke("comparison-mid-4", 49, "M 250 984 L 866 984", { color: "#a55f78", width: 1 }),
    stroke("comparison-bottom", 50, "M 250 1012 L 866 1012", { color: blue, width: 1.2 }),
    stroke("comparison-col-1", 51, "M 334 850 L 334 1012", { color: "#a55f78", width: 1 }),
    stroke("comparison-col-2", 52, "M 565 850 L 565 1012", { color: "#a55f78", width: 1 }),
    text("comparison", 53, 252, 851, 610, "             skill（技能）                 agent（智能体）\n性质       能力/工具/函数                  实体/系统\n粒度       较小、聚焦于单一任务             较大、面向整体目标\n关注点     怎么做（How）                    做什么、为什么做（What & Why）\n是否自主   通常不自主，需要被调用           自主决策和行动\n示例       搜索 skill、计算 skill            智能助手、自动驾驶系统", { fontSize: 13.5, lineHeight: 27 }),
    text("relation-summary", 54, 242, 1021, 610, "• 联系：\n  agent 通过感知环境，进行规划和决策，调用和组合不同的 skill\n  来完成复杂任务，最终实现目标。", { fontSize: 16, lineHeight: 26 }),

    text("summary-title", 60, 28, 1126, 240, "总结 (Summary)", { color: blue, fontSize: 19, fontWeight: 500 }),
    text("summary", 61, 30, 1162, 590, "➢ skill 是“能力单元”，关注具体的“怎么做”；\n➢ agent 是“决策执行者”，关注整体的“做什么”和“为什么做”；\n  并通过使用多个 skill 来达成目标。", { fontSize: 16, lineHeight: 27 }),
    text("summary-diagram-title", 62, 748, 1126, 140, "调用和组合", { color: green, fontSize: 15, fontWeight: 500, textAlign: "center" }),
    text("summary-agent", 63, 770, 1160, 100, "♙\nagent", { color: blue, fontSize: 18, lineHeight: 30, textAlign: "center" }),
    box("summary-skill-1", 64, 824, 1160, 64, 30, { stroke: green, strokeWidth: 1, radius: 4 }),
    box("summary-skill-2", 65, 824, 1201, 64, 30, { stroke: green, strokeWidth: 1, radius: 4 }),
    box("summary-skill-n", 66, 824, 1242, 64, 30, { stroke: green, strokeWidth: 1, radius: 4 }),
    text("summary-skill-labels", 67, 831, 1164, 50, "skill 1\nskill 2\nskill n", { color: green, fontSize: 13, lineHeight: 41, textAlign: "center" }),
    stroke("summary-arrow-1", 68, "M 784 1174 L 824 1174", { color: ink, width: 1.5 }),
    stroke("summary-arrow-2", 69, "M 784 1215 L 824 1215", { color: ink, width: 1.5 }),
    stroke("summary-arrow-3", 70, "M 784 1254 L 824 1254", { color: ink, width: 1.5 }),
  ],
};
