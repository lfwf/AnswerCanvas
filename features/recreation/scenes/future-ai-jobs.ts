import type { RecreationBox, RecreationMark, RecreationScene, RecreationStroke, RecreationText, RecreationTextStyle } from "../recreation-types";

const text = (id: string, order: number, x: number, y: number, width: number, value: string, style: RecreationTextStyle = {}): RecreationText => ({ id, kind: "text", order, x, y, width, text: value, style });
const stroke = (id: string, order: number, path: string, style: Omit<RecreationStroke, "id" | "kind" | "order" | "animated" | "path"> = {}): RecreationStroke => ({ id, kind: "stroke", order, path, ...style });
const box = (id: string, order: number, x: number, y: number, width: number, height: number, style: Omit<RecreationBox, "id" | "kind" | "order" | "animated" | "x" | "y" | "width" | "height"> = {}): RecreationBox => ({ id, kind: "box", order, x, y, width, height, ...style });
const mark = (id: string, order: number, targetId: string, match: string, color = "#d52d22"): RecreationMark => ({ id, kind: "mark", order, targetId, match, mark: "underline", color, width: 2.2, offset: -4, padding: 1, wobble: 1.5 });
const staticStroke = (id: string, path: string, style: Omit<RecreationStroke, "id" | "kind" | "order" | "animated" | "path"> = {}): RecreationStroke => ({ id, kind: "stroke", animated: false, path, ...style });

const ink = "#151515";
const blue = "#18479b";
const red = "#d52d22";
const green = "#2d7c42";
const orange = "#d99508";
const gray = "rgba(30,30,30,.58)";

export const futureAiJobsScene: RecreationScene = {
  id: "future-ai-jobs",
  title: "未来3年，最需要 AI 能力的岗位",
  description: "四象限手写信息图：高需求岗位、原因、最值钱的 AI 能力与岗位价值判断。",
  prompt: "未来3年，哪些岗位最需要 AI 能力？为什么？普通人应该重点培养哪些 AI 能力？",
  sourceName: "未来3年最需要AI能力的岗位.png",
  createdAt: "2026-08-07",
  width: 1122,
  height: 1402,
  paper: { background: "#fbfaf6", pattern: "dots", patternColor: "rgba(70,70,62,.045)", spacing: 18 },
  elements: [
    staticStroke("mid-vertical-top", "M 622 196 L 622 772", { color: gray, width: 1.35, roughness: .45, bowing: .25 }),
    staticStroke("mid-horizontal", "M 25 778 L 1096 778", { color: gray, width: 1.35, roughness: .45, bowing: .25 }),
    staticStroke("mid-vertical-bottom", "M 489 790 L 489 1377", { color: gray, width: 1.25, roughness: .45, bowing: .25 }),

    text("page-title", 10, 165, 24, 820, "未来3年，最需要AI能力的岗位", { fontSize: 49, lineHeight: 60, fontWeight: 500, textAlign: "center", characterJitter: .65 }),
    mark("page-title-underline", 11, "page-title", "未来3年，最需要AI能力的岗位"),
    text("core-judgement", 12, 62, 121, 1000, "核心判断：越依赖信息处理、内容生成、流程协作的岗位，越需要AI。", { fontSize: 27, lineHeight: 38, characterJitter: .45 }),
    mark("core-info-underline", 13, "core-judgement", "信息处理"),
    mark("core-content-underline", 14, "core-judgement", "内容生成"),

    box("s1-number-box", 20, 30, 191, 48, 48, { stroke: blue, strokeWidth: 2, radius: 7, roughness: 1.1 }),
    text("s1-number", 21, 30, 194, 48, "1", { color: blue, fontSize: 34, textAlign: "center", fontWeight: 600 }),
    text("s1-title", 22, 91, 195, 500, "最需要AI能力的岗位（6类）", { color: blue, fontSize: 31, fontWeight: 550 }),

    box("job1-screen", 23, 54, 264, 62, 43, { stroke: ink, strokeWidth: 1.7, radius: 4, fill: "rgba(255,255,255,.25)", roughness: 1.05 }),
    stroke("job1-code", 24, "M 68 285 L 74 279 M 68 285 L 74 291 M 102 279 L 96 285 L 102 291 M 86 277 L 82 293", { color: green, width: 1.8 }),
    stroke("job1-base", 25, "M 46 315 L 123 315 M 54 309 L 116 309", { color: ink, width: 1.7 }),
    text("job1", 26, 145, 270, 445, "1. 软件开发/测试 —— 代码生成、调试、\n   文档、自动化测试", { fontSize: 22, lineHeight: 34 }),

    box("job2-board", 30, 58, 341, 51, 67, { stroke: ink, strokeWidth: 1.5, radius: 3, fill: "rgba(255,244,223,.3)", roughness: 1 }),
    stroke("job2-clip", 31, "M 73 340 Q 83 331 93 340 L 93 347 L 73 347 Z", { color: orange, width: 2 }),
    stroke("job2-list", 32, "M 68 360 L 73 365 L 80 355 M 86 360 L 102 360 M 68 378 L 73 383 L 80 373 M 86 378 L 102 378 M 68 396 L 73 401 L 80 391 M 86 396 L 102 396", { color: blue, width: 1.45 }),
    text("job2", 33, 145, 347, 445, "2. 产品经理/运营 —— 写方案、做分析、\n   拆需求、复盘优化", { fontSize: 22, lineHeight: 34 }),

    stroke("job3-axis", 37, "M 50 483 L 50 444 M 50 483 L 95 483", { color: ink, width: 1.4 }),
    box("job3-bar-1", 38, 57, 461, 8, 17, { stroke: blue, fill: "rgba(27,76,158,.15)", strokeWidth: 1.3, radius: 1 }),
    box("job3-bar-2", 39, 70, 452, 8, 26, { stroke: blue, fill: "rgba(27,76,158,.15)", strokeWidth: 1.3, radius: 1 }),
    box("job3-bar-3", 40, 83, 440, 8, 38, { stroke: blue, fill: "rgba(27,76,158,.15)", strokeWidth: 1.3, radius: 1 }),
    box("job3-pie", 41, 99, 442, 35, 35, { stroke: ink, fill: "rgba(255,255,255,.2)", strokeWidth: 1.3, radius: 18 }),
    stroke("job3-pie-lines", 42, "M 116 459 L 116 442 M 116 459 L 131 469 M 116 459 L 99 459", { color: green, width: 1.4 }),
    text("job3", 43, 145, 440, 445, "3. 数据分析/财务 —— 清洗数据、做报表、\n   预测、发现异常", { fontSize: 22, lineHeight: 34 }),

    box("job4-palette", 47, 52, 518, 64, 50, { stroke: ink, strokeWidth: 1.4, radius: 24, roughness: 1.15 }),
    box("job4-dot1", 48, 62, 532, 9, 9, { stroke: red, fill: "rgba(213,45,34,.2)", strokeWidth: 1, radius: 5 }),
    box("job4-dot2", 49, 80, 523, 9, 9, { stroke: orange, fill: "rgba(217,149,8,.2)", strokeWidth: 1, radius: 5 }),
    box("job4-dot3", 50, 63, 550, 9, 9, { stroke: blue, fill: "rgba(24,71,155,.18)", strokeWidth: 1, radius: 5 }),
    stroke("job4-brush", 51, "M 95 558 L 129 514 M 89 563 Q 98 570 105 559", { color: ink, width: 2 }),
    text("job4", 52, 145, 520, 445, "4. 设计/内容创作 —— 文案、海报、\n   视频脚本、素材生成", { fontSize: 22, lineHeight: 34 }),

    stroke("job5-headband", 56, "M 52 625 Q 52 590 84 590 Q 116 590 116 625", { color: ink, width: 2 }),
    box("job5-ear-left", 57, 47, 616, 14, 31, { stroke: blue, fill: "rgba(24,71,155,.14)", strokeWidth: 1.6, radius: 7 }),
    box("job5-ear-right", 58, 109, 616, 14, 31, { stroke: blue, fill: "rgba(24,71,155,.14)", strokeWidth: 1.6, radius: 7 }),
    stroke("job5-mic", 59, "M 115 644 Q 106 660 93 657 L 84 657", { color: ink, width: 1.5 }),
    text("job5", 60, 145, 597, 445, "5. 销售/客服/HR —— 话术生成、客户分类、\n   简历筛选、知识库问答", { fontSize: 22, lineHeight: 34 }),

    stroke("job6-factory", 64, "M 52 731 L 52 680 L 63 690 L 75 680 L 86 690 L 98 680 L 98 731 Z M 61 711 L 68 711 L 68 720 L 61 720 M 77 711 L 84 711 L 84 720 L 77 720", { color: ink, width: 1.6 }),
    stroke("job6-smoke", 65, "M 58 680 L 58 659 L 66 659 L 66 685", { color: blue, width: 1.5 }),
    box("job6-truck-body", 66, 99, 704, 35, 22, { stroke: orange, fill: "rgba(217,149,8,.13)", strokeWidth: 1.5, radius: 2 }),
    box("job6-truck-cab", 67, 126, 711, 18, 15, { stroke: orange, fill: "rgba(217,149,8,.13)", strokeWidth: 1.5, radius: 2 }),
    box("job6-wheel1", 68, 106, 722, 9, 9, { stroke: ink, strokeWidth: 1.2, radius: 5 }),
    box("job6-wheel2", 69, 131, 722, 9, 9, { stroke: ink, strokeWidth: 1.2, radius: 5 }),
    text("job6", 70, 145, 674, 445, "6. 制造/供应链/流程岗位 —— 流程自动化、\n   异常排查、排产协同、知识沉淀", { fontSize: 22, lineHeight: 34 }),

    box("s2-number-box", 100, 643, 191, 48, 48, { stroke: blue, strokeWidth: 2, radius: 7, roughness: 1.1 }),
    text("s2-number", 101, 643, 194, 48, "2", { color: blue, fontSize: 34, textAlign: "center", fontWeight: 600 }),
    text("s2-title", 102, 704, 195, 380, "为什么是这些岗位", { color: blue, fontSize: 31, fontWeight: 550 }),
    text("s2-points", 103, 655, 273, 410, "• 信息量大\n• 重复任务多\n• 需要快速产出\n• 依赖跨部门协作", { fontSize: 25, lineHeight: 55 }),

    stroke("funnel-top", 110, "M 643 543 Q 697 527 752 543", { color: blue, width: 2 }),
    stroke("funnel-left", 111, "M 643 543 L 675 680", { color: blue, width: 2 }),
    stroke("funnel-right", 112, "M 752 543 L 721 680", { color: blue, width: 2 }),
    stroke("funnel-bottom", 113, "M 675 680 Q 698 690 721 680", { color: blue, width: 2 }),
    text("funnel-label", 114, 653, 568, 90, "信息\n输入", { fontSize: 23, lineHeight: 39, textAlign: "center" }),
    stroke("flow-arrow-a", 115, "M 758 615 L 791 615 M 791 615 L 781 607 M 791 615 L 781 623", { color: ink, width: 1.8 }),
    box("ai-process", 116, 801, 557, 74, 117, { stroke: green, strokeWidth: 1.8, radius: 15, roughness: 1.1 }),
    text("ai-process-label", 117, 801, 578, 74, "AI\n处理", { fontSize: 23, lineHeight: 40, textAlign: "center" }),
    stroke("flow-arrow-b", 118, "M 882 615 L 909 615 M 909 615 L 899 607 M 909 615 L 899 623", { color: ink, width: 1.8 }),
    box("human-judge", 119, 919, 557, 74, 117, { stroke: orange, strokeWidth: 1.8, radius: 15, roughness: 1.1 }),
    text("human-judge-label", 120, 919, 578, 74, "人\n判断", { fontSize: 23, lineHeight: 40, textAlign: "center" }),
    stroke("flow-arrow-c", 121, "M 1000 615 L 1025 615 M 1025 615 L 1015 607 M 1025 615 L 1015 623", { color: ink, width: 1.8 }),
    box("output-result", 122, 1034, 557, 70, 117, { stroke: blue, strokeWidth: 1.8, radius: 15, roughness: 1.1 }),
    text("output-result-label", 123, 1034, 578, 70, "输出\n结果", { fontSize: 23, lineHeight: 40, textAlign: "center" }),

    box("s3-number-box", 150, 30, 797, 48, 48, { stroke: blue, strokeWidth: 2, radius: 7, roughness: 1.1 }),
    text("s3-number", 151, 30, 800, 48, "3", { color: blue, fontSize: 34, textAlign: "center", fontWeight: 600 }),
    text("s3-title", 152, 92, 802, 380, "岗位里最值钱的AI能力", { color: blue, fontSize: 31, fontWeight: 550 }),

    stroke("cap1-bubble", 153, "M 55 887 Q 55 866 80 866 Q 105 866 105 887 Q 105 908 82 909 L 68 924 L 70 908 Q 55 904 55 887 Z", { color: blue, width: 1.8 }),
    text("cap1-icon", 154, 68, 875, 28, "?", { color: blue, fontSize: 27, textAlign: "center", fontWeight: 600 }),
    text("cap1", 155, 145, 875, 315, "1. 会提问（Prompt）", { fontSize: 25 }),
    mark("cap1-mark", 156, "cap1", "Prompt"),

    stroke("cap2-wrench", 160, "M 58 982 L 94 946 M 55 954 Q 66 963 74 952 M 86 943 Q 99 951 91 962", { color: ink, width: 2.3 }),
    stroke("cap2-driver", 161, "M 76 973 L 106 943 M 101 939 L 112 950", { color: blue, width: 2.1 }),
    text("cap2", 162, 145, 950, 315, "2. 会用AI工具", { fontSize: 25 }),
    mark("cap2-mark", 163, "cap2", "AI工具"),

    box("cap3-board", 167, 60, 1023, 50, 65, { stroke: ink, strokeWidth: 1.5, radius: 4, roughness: 1 }),
    stroke("cap3-clip", 168, "M 74 1023 Q 84 1013 94 1023 L 94 1030 L 74 1030 Z", { color: blue, width: 1.5 }),
    stroke("cap3-check", 169, "M 70 1057 L 80 1067 L 99 1045", { color: green, width: 2.3 }),
    text("cap3", 170, 145, 1030, 315, "3. 会验证结果", { fontSize: 25 }),
    mark("cap3-mark", 171, "cap3", "验证结果"),

    box("cap4-node-a", 175, 50, 1115, 21, 21, { stroke: green, fill: "rgba(45,124,66,.14)", strokeWidth: 1.3, radius: 3 }),
    box("cap4-node-b", 176, 91, 1100, 21, 21, { stroke: orange, fill: "rgba(217,149,8,.15)", strokeWidth: 1.3, radius: 3 }),
    box("cap4-node-c", 177, 91, 1141, 21, 21, { stroke: blue, fill: "rgba(24,71,155,.14)", strokeWidth: 1.3, radius: 3 }),
    stroke("cap4-links", 178, "M 71 1125 L 91 1110 M 71 1125 L 91 1151", { color: ink, width: 1.6 }),
    text("cap4", 179, 145, 1112, 315, "4. 会整合工作流", { fontSize: 25 }),
    mark("cap4-mark", 180, "cap4", "工作流"),

    stroke("cap5-axis", 184, "M 50 1297 L 50 1245 M 50 1297 L 116 1297", { color: ink, width: 1.5 }),
    box("cap5-bar1", 185, 60, 1280, 10, 17, { stroke: red, fill: "rgba(213,45,34,.16)", strokeWidth: 1.2, radius: 1 }),
    box("cap5-bar2", 186, 78, 1265, 10, 32, { stroke: orange, fill: "rgba(217,149,8,.17)", strokeWidth: 1.2, radius: 1 }),
    box("cap5-bar3", 187, 96, 1248, 10, 49, { stroke: red, fill: "rgba(213,45,34,.16)", strokeWidth: 1.2, radius: 1 }),
    stroke("cap5-up", 188, "M 54 1265 L 78 1247 L 96 1220 M 96 1220 L 88 1225 M 96 1220 L 95 1230", { color: red, width: 2 }),
    text("cap5", 189, 145, 1220, 315, "5. 会把AI变成效率", { fontSize: 25 }),
    mark("cap5-mark", 190, "cap5", "效率"),

    box("s4-number-box", 200, 521, 797, 48, 48, { stroke: blue, strokeWidth: 2, radius: 7, roughness: 1.1 }),
    text("s4-number", 201, 521, 800, 48, "4", { color: blue, fontSize: 34, textAlign: "center", fontWeight: 600 }),
    text("s4-title", 202, 582, 802, 220, "结论", { color: blue, fontSize: 31, fontWeight: 550 }),
    box("conclusion-box", 203, 529, 845, 493, 180, { stroke: "#edb20d", strokeWidth: 2.5, radius: 15, roughness: 1.4, bowing: 1.1 }),
    text("conclusion", 204, 555, 870, 445, "未来3年，不是只有AI岗位需要AI；\n而是大多数白领岗位，都会被\n“会不会用AI”拉开差距。", { fontSize: 27, lineHeight: 48, textAlign: "center" }),
    mark("conclusion-whitecollar", 205, "conclusion", "大多数白领岗位"),
    mark("conclusion-useai", 206, "conclusion", "会不会用AI"),

    stroke("matrix-y", 210, "M 572 1298 L 572 1048 M 572 1048 L 564 1061 M 572 1048 L 580 1061", { color: ink, width: 1.8 }),
    stroke("matrix-x", 211, "M 572 1298 L 895 1298 M 895 1298 L 882 1290 M 895 1298 L 882 1306", { color: ink, width: 1.8 }),
    stroke("matrix-v", 212, "M 733 1054 L 733 1298", { color: ink, width: 1.3, dash: "8 7" }),
    stroke("matrix-h", 213, "M 572 1175 L 888 1175", { color: ink, width: 1.3, dash: "8 7" }),
    text("matrix-y-label", 214, 507, 1100, 65, "岗位\n价值", { fontSize: 23, lineHeight: 33, textAlign: "center" }),
    text("matrix-y-high", 215, 530, 1040, 36, "高", { color: red, fontSize: 22, textAlign: "center" }),
    text("matrix-y-low", 216, 530, 1276, 36, "低", { fontSize: 22, textAlign: "center" }),
    text("matrix-x-label", 217, 650, 1310, 180, "AI使用能力", { fontSize: 23, textAlign: "center" }),
    text("matrix-x-low", 218, 555, 1314, 50, "低", { fontSize: 22, textAlign: "center" }),
    text("matrix-x-high", 219, 864, 1314, 50, "高", { color: red, fontSize: 22, textAlign: "center" }),
    text("matrix-tl", 220, 606, 1072, 115, "专业强\n不会用AI\n（价值一般）", { fontSize: 19, lineHeight: 31, textAlign: "center", color: blue }),
    text("matrix-tr", 221, 762, 1072, 115, "专业强\n会用AI\n（高价值）", { fontSize: 19, lineHeight: 31, textAlign: "center", color: red }),
    text("matrix-bl", 222, 606, 1194, 115, "专业弱\n不会用AI\n（低价值）", { fontSize: 19, lineHeight: 31, textAlign: "center", color: blue }),
    text("matrix-br", 223, 762, 1194, 115, "专业弱\n会用AI\n（提升中）", { fontSize: 19, lineHeight: 31, textAlign: "center", color: orange }),
    text("matrix-star", 224, 858, 1087, 40, "★", { color: red, fontSize: 34, textAlign: "center" }),
    text("formula", 225, 914, 1082, 188, "高价值岗位\n=\n专业能力\n×\nAI能力", { fontSize: 23, lineHeight: 40, textAlign: "center" }),
    mark("formula-ai-mark", 226, "formula", "AI能力"),
  ],
};
