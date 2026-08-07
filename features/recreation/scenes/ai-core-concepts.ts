import type { RecreationBox, RecreationMark, RecreationScene, RecreationStroke, RecreationText, RecreationTextStyle } from "../recreation-types";

const text = (id: string, order: number, x: number, y: number, width: number, value: string, style: RecreationTextStyle = {}): RecreationText => ({ id, kind: "text", order, x, y, width, text: value, style });
const stroke = (id: string, order: number, path: string, style: Omit<RecreationStroke, "id" | "kind" | "order" | "animated" | "path"> = {}): RecreationStroke => ({ id, kind: "stroke", order, path, ...style });
const box = (id: string, order: number, x: number, y: number, width: number, height: number, style: Omit<RecreationBox, "id" | "kind" | "order" | "animated" | "x" | "y" | "width" | "height"> = {}): RecreationBox => ({ id, kind: "box", order, x, y, width, height, ...style });
const mark = (id: string, order: number, targetId: string, match: string, color = "#c92d37"): RecreationMark => ({ id, kind: "mark", order, targetId, match, mark: "underline", color, width: 1.8, offset: -4, padding: 1, wobble: 1.2 });
const staticStroke = (id: string, path: string, style: Omit<RecreationStroke, "id" | "kind" | "order" | "animated" | "path"> = {}): RecreationStroke => ({ id, kind: "stroke", animated: false, path, ...style });
const staticBox = (id: string, x: number, y: number, width: number, height: number, style: Omit<RecreationBox, "id" | "kind" | "order" | "animated" | "x" | "y" | "width" | "height"> = {}): RecreationBox => ({ id, kind: "box", animated: false, x, y, width, height, ...style });

const ink = "#161616";
const blue = "#174da8";
const green = "#268456";
const red = "#c92d37";
const purple = "#7b3cad";
const orange = "#ef6b22";
const line = "rgba(27,27,27,.62)";

export const aiCoreConceptsScene: RecreationScene = {
  id: "ai-core-concepts",
  title: "关于 AI 的核心概念与发展",
  description: "双栏课堂笔记：AI 定义、组成、类型、应用领域与发展趋势。",
  sourceName: "AI 核心概念与发展.png",
  createdAt: "2026-08-07",
  width: 1055,
  height: 1466,
  paper: { background: "#fbfaf5", pattern: "dots", patternColor: "rgba(55,61,57,.12)", spacing: 15 },
  elements: [
    staticBox("page-frame", 28, 127, 997, 1285, { stroke: line, strokeWidth: 1.3, roughness: .48, bowing: .3 }),
    staticStroke("header-line-left-1", "M 96 66 L 485 66", { color: line, width: 1 }),
    staticStroke("header-line-left-2", "M 126 106 L 485 106", { color: line, width: 1 }),
    staticStroke("header-line-right-1", "M 626 67 L 974 67", { color: line, width: 1 }),
    staticStroke("header-line-right-2", "M 626 106 L 974 106", { color: line, width: 1 }),
    staticStroke("table-heading-bottom", "M 28 176 L 1025 176", { color: line, width: 1.25 }),
    staticStroke("table-divider", "M 237 127 L 237 1185", { color: line, width: 1.2 }),
    staticStroke("summary-divider", "M 28 1185 L 1025 1185", { color: line, width: 1.2 }),

    text("date", 10, 50, 42, 360, "日期： 2025.05.20", { fontSize: 20, characterJitter: .5 }),
    text("course", 11, 50, 82, 390, "课程主题： 人工智能基础", { fontSize: 20, characterJitter: .5 }),
    text("topic", 12, 566, 42, 410, "主题： 关于 AI 的核心概念与发展", { fontSize: 20, characterJitter: .5 }),
    text("page-number", 13, 566, 82, 300, "页码： 1 / 1", { fontSize: 20, characterJitter: .5 }),
    text("cue-heading", 20, 68, 139, 160, "线索栏 (Cue)", { color: blue, fontSize: 21, fontWeight: 500 }),
    text("notes-heading", 21, 282, 139, 260, "笔记栏 (Notes)", { color: blue, fontSize: 21, fontWeight: 500 }),

    text("cue-ai", 30, 48, 224, 165, "★ AI 是什么？\n- 如何定义？\n- 有什么特点？", { fontSize: 18, lineHeight: 35 }),
    text("ai-title", 31, 263, 194, 390, "一、什么是 AI", { color: blue, fontSize: 21, fontWeight: 500 }),
    text("ai-definition", 32, 282, 232, 520, "AI（人工智能）是让机器模拟人类智能的技术，使其能够感知环境、\n学习知识、推理决策并完成任务。", { fontSize: 17, lineHeight: 31 }),
    mark("ai-definition-underline", 33, "ai-definition", "AI（人工智能）"),
    mark("ai-task-underline", 34, "ai-definition", "推理决策并完成任务"),
    text("ai-core-title", 35, 265, 306, 180, "• 核心特点：", { color: blue, fontSize: 18, fontWeight: 500 }),
    text("ai-core-points", 36, 267, 346, 520, "① 感知：获取和理解信息；    ② 学习：从数据中改进；\n③ 推理：分析并做出判断；    ④ 行动：执行任务并反馈。", { fontSize: 16.5, lineHeight: 34 }),
    mark("ai-reasoning-underline", 37, "ai-core-points", "推理：分析并做出判断"),
    mark("ai-action-underline", 38, "ai-core-points", "行动：执行任务并反馈"),

    stroke("brain-profile", 40, "M 816 294 C 797 300 793 315 796 329 C 786 336 788 348 799 352 L 799 376 M 799 376 L 820 376 L 820 393", { color: blue, width: 1.7, roughness: 1.25 }),
    text("brain-ai", 41, 805, 318, 55, "AI", { color: purple, fontSize: 23, textAlign: "center", characterJitter: .25 }),
    stroke("brain-ray-perception", 42, "M 840 316 L 900 259", { color: green, width: 1.2, dash: "5 5" }),
    stroke("brain-ray-learning", 43, "M 842 330 L 921 306", { color: blue, width: 1.2, dash: "5 5" }),
    stroke("brain-ray-reasoning", 44, "M 842 347 L 919 363", { color: purple, width: 1.2, dash: "5 5" }),
    stroke("brain-ray-action", 45, "M 837 360 L 900 414", { color: orange, width: 1.2, dash: "5 5" }),
    text("brain-perception", 46, 900, 245, 110, "感知", { color: green, fontSize: 16 }),
    text("brain-learning", 47, 919, 294, 90, "学习", { color: blue, fontSize: 16 }),
    text("brain-reasoning", 48, 917, 348, 92, "推理", { color: purple, fontSize: 16 }),
    text("brain-action", 49, 919, 400, 90, "行动", { color: orange, fontSize: 16 }),

    text("cue-components", 60, 48, 442, 165, "★ AI 的组成要素\n- 需要哪些关键\n  要素？", { fontSize: 18, lineHeight: 35 }),
    text("components-title", 61, 263, 445, 390, "二、AI 的组成要素", { color: blue, fontSize: 21, fontWeight: 500 }),
    box("flow-data", 62, 286, 482, 68, 36, { stroke: green, strokeWidth: 1.3, radius: 3 }),
    text("flow-data-label", 63, 286, 490, 68, "数据", { fontSize: 16, textAlign: "center", characterJitter: .25 }),
    stroke("flow-arrow-1", 64, "M 364 500 L 405 500", { color: ink, width: 1.2 }),
    box("flow-algorithm", 65, 423, 482, 68, 36, { stroke: green, strokeWidth: 1.3, radius: 3 }),
    text("flow-algorithm-label", 66, 423, 490, 68, "算法", { fontSize: 16, textAlign: "center", characterJitter: .25 }),
    stroke("flow-arrow-2", 67, "M 501 500 L 542 500", { color: ink, width: 1.2 }),
    box("flow-compute", 68, 560, 482, 68, 36, { stroke: green, strokeWidth: 1.3, radius: 3 }),
    text("flow-compute-label", 69, 560, 490, 68, "算力", { fontSize: 16, textAlign: "center", characterJitter: .25 }),
    stroke("flow-arrow-3", 70, "M 638 500 L 679 500", { color: ink, width: 1.2 }),
    box("flow-model", 71, 697, 482, 68, 36, { stroke: green, strokeWidth: 1.3, radius: 3 }),
    text("flow-model-label", 72, 697, 490, 68, "模型", { fontSize: 16, textAlign: "center", characterJitter: .25 }),
    stroke("flow-arrow-4", 73, "M 775 500 L 816 500", { color: ink, width: 1.2 }),
    box("flow-application", 74, 834, 482, 68, 36, { stroke: green, strokeWidth: 1.3, radius: 3 }),
    text("flow-application-label", 75, 834, 490, 68, "应用", { fontSize: 16, textAlign: "center", characterJitter: .25 }),
    text("flow-notes", 76, 276, 527, 646, "高质量数据          解决问题的方法          训练与推理的计算资源          从数据中学到的知识          落地到实际场景", { fontSize: 13, textAlign: "center", characterJitter: .28 }),

    text("cue-types", 90, 48, 616, 165, "★ AI 的主要类型\n- 有哪些类型？\n- 例子？", { fontSize: 18, lineHeight: 35 }),
    text("types-title", 91, 263, 616, 390, "三、AI 的主要类型", { color: blue, fontSize: 21, fontWeight: 500 }),
    text("types-points", 92, 266, 657, 580, "• 弱人工智能（ANI）：专注于特定任务，如语音识别、图像分类。\n• 通用人工智能（AGI）：具备人类水平的通用智能（尚未实现）。\n• 超级人工智能（ASI）：在各方面超越人类智能（未来设想）。", { fontSize: 16, lineHeight: 36 }),
    stroke("pyramid-left", 93, "M 789 759 L 856 631", { color: blue, width: 1.5 }),
    stroke("pyramid-right", 94, "M 856 631 L 925 759", { color: blue, width: 1.5 }),
    stroke("pyramid-base", 95, "M 789 759 L 925 759", { color: blue, width: 1.5 }),
    stroke("pyramid-level-1", 96, "M 812 715 L 902 715", { color: purple, width: 1.2 }),
    stroke("pyramid-level-2", 97, "M 833 672 L 879 672", { color: red, width: 1.2 }),
    text("pyramid-asi", 98, 920, 632, 115, "ASI\n（未来设想）", { fontSize: 13, lineHeight: 19 }),
    text("pyramid-agi", 99, 920, 679, 115, "AGI\n（尚未实现）", { fontSize: 13, lineHeight: 19 }),
    text("pyramid-ani", 100, 920, 729, 115, "ANI\n（当前阶段）", { fontSize: 13, lineHeight: 19 }),

    text("cue-applications", 120, 48, 797, 165, "★ AI 的应用领域\n- 用在哪些地方？\n- 举例说明？", { fontSize: 18, lineHeight: 35 }),
    text("applications-title", 121, 263, 800, 390, "四、AI 的应用领域", { color: blue, fontSize: 21, fontWeight: 500 }),
    stroke("icon-manufacturing", 122, "M 292 847 L 292 884 L 326 884 M 292 856 L 317 856 M 302 847 L 302 834 L 312 834 L 312 847 M 317 856 L 331 866 L 331 884", { color: blue, width: 1.7 }),
    text("app-manufacturing", 123, 263, 891, 122, "制造业\n智能检测、预测维护", { fontSize: 13.5, lineHeight: 23, textAlign: "center" }),
    box("icon-health", 124, 435, 844, 35, 40, { stroke: blue, strokeWidth: 1.5, radius: 4 }),
    stroke("icon-health-cross-v", 125, "M 452 851 L 452 877", { color: blue, width: 1.5 }),
    stroke("icon-health-cross-h", 126, "M 443 864 L 461 864", { color: blue, width: 1.5 }),
    text("app-health", 127, 405, 891, 122, "医疗健康\n影像诊断、辅助研发", { fontSize: 13.5, lineHeight: 23, textAlign: "center" }),
    stroke("icon-car", 128, "M 581 864 C 587 850 613 850 622 864 L 628 866 L 628 880 L 578 880 L 578 869 Z M 588 880 C 588 888 598 888 598 880 M 612 880 C 612 888 622 888 622 880", { color: blue, width: 1.6 }),
    text("app-driving", 129, 548, 891, 122, "自动驾驶\n感知、决策、控制", { fontSize: 13.5, lineHeight: 23, textAlign: "center" }),
    stroke("icon-cart", 130, "M 729 844 L 738 844 L 744 871 L 775 871 L 783 851 L 742 851 M 750 881 L 750 883 M 771 881 L 771 883", { color: blue, width: 1.7 }),
    text("app-commerce", 131, 692, 891, 122, "电商/推荐\n个性化推荐、搜索", { fontSize: 13.5, lineHeight: 23, textAlign: "center" }),
    stroke("icon-chat", 132, "M 891 849 C 891 840 899 836 911 836 L 925 836 C 936 836 942 842 942 851 L 942 862 C 942 871 935 877 924 877 L 914 877 L 904 886 L 905 877 C 896 875 891 869 891 861 Z", { color: blue, width: 1.5 }),
    text("app-daily", 133, 864, 891, 122, "日常生活\n语音助手、翻译等", { fontSize: 13.5, lineHeight: 23, textAlign: "center" }),

    text("cue-trends", 150, 48, 989, 165, "★ AI 的发展趋势\n- 未来会怎样？\n- 需要注意什么？", { fontSize: 18, lineHeight: 35 }),
    text("trends-title", 151, 263, 988, 390, "五、AI 的发展趋势", { color: blue, fontSize: 21, fontWeight: 500 }),
    text("trends-points", 152, 266, 1028, 555, "• 大模型驱动：从专用模型走向通用能力更强的大模型。\n• 多模态融合：文字、图像、语音、视频等信息综合理解。\n• AI + 行业：与各行业深度结合，提升效率与创新。\n• 发展责任：关注隐私、偏见、可解释性与伦理问题。", { fontSize: 16, lineHeight: 33 }),
    mark("trend-model-underline", 153, "trends-points", "通用能力更强的大模型"),
    mark("trend-privacy-underline", 154, "trends-points", "隐私、偏见、可解释性与伦理问题"),
    stroke("balance-top", 155, "M 807 1025 L 939 1015", { color: ink, width: 1.7 }),
    stroke("balance-pole", 156, "M 875 1018 L 875 1127", { color: ink, width: 1.7 }),
    stroke("balance-base", 157, "M 842 1127 L 910 1127 M 852 1118 L 899 1118", { color: ink, width: 1.7 }),
    stroke("balance-left-rope", 158, "M 817 1024 L 791 1083 M 817 1024 L 844 1083", { color: green, width: 1.2 }),
    stroke("balance-left-pan", 159, "M 786 1083 Q 817 1111 848 1083", { color: green, width: 1.5 }),
    stroke("balance-right-rope", 160, "M 930 1016 L 907 1070 M 930 1016 L 953 1070", { color: orange, width: 1.2 }),
    stroke("balance-right-pan", 161, "M 901 1070 Q 930 1100 959 1070", { color: orange, width: 1.5 }),
    text("balance-left-label", 162, 790, 1061, 60, "创新\n效率", { color: green, fontSize: 17, lineHeight: 22, textAlign: "center" }),
    text("balance-right-label", 163, 902, 1048, 60, "安全\n伦理", { color: orange, fontSize: 17, lineHeight: 22, textAlign: "center" }),

    text("summary-title", 180, 48, 1203, 250, "总结 (Summary)", { color: blue, fontSize: 20, fontWeight: 500 }),
    text("summary-points", 181, 62, 1248, 560, "➢ AI 是让机器具备感知、学习、推理和行动能力的技术。\n➢ AI 由数据、算法、算力、模型和应用组成。\n➢ 目前以弱 AI 为主，广泛应用于各行各业。\n➢ 未来发展需平衡创新与安全，推动 AI 造福人类。", { fontSize: 16, lineHeight: 34 }),
    box("mind-ai", 182, 708, 1281, 102, 68, { stroke: blue, strokeWidth: 1.6, radius: 25 }),
    text("mind-ai-label", 183, 708, 1294, 102, "AI", { color: blue, fontSize: 31, textAlign: "center", characterJitter: .3 }),
    stroke("mind-ray-what", 184, "M 708 1300 L 644 1264 L 612 1264", { color: green, width: 1.4 }),
    stroke("mind-ray-components", 185, "M 708 1321 L 644 1321 L 610 1338", { color: blue, width: 1.4 }),
    stroke("mind-ray-types", 186, "M 722 1348 L 687 1391 L 650 1391", { color: purple, width: 1.4 }),
    stroke("mind-ray-apps", 187, "M 810 1300 L 862 1262 L 931 1262", { color: orange, width: 1.4 }),
    stroke("mind-ray-trends", 188, "M 810 1329 L 872 1362 L 940 1362", { color: red, width: 1.4 }),
    text("mind-what", 189, 585, 1248, 85, "是什么", { color: green, fontSize: 16, textAlign: "center" }),
    text("mind-components", 190, 568, 1310, 95, "组成要素", { color: blue, fontSize: 16, textAlign: "center" }),
    text("mind-types", 191, 602, 1377, 90, "主要类型", { color: purple, fontSize: 16, textAlign: "center" }),
    text("mind-apps", 192, 916, 1248, 90, "应用领域", { color: orange, fontSize: 16, textAlign: "center" }),
    text("mind-trends", 193, 925, 1348, 90, "发展趋势", { color: red, fontSize: 16, textAlign: "center" }),
  ],
};
