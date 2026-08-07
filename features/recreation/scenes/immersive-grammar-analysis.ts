import type { RecreationAnnotation, RecreationBox, RecreationMark, RecreationScene, RecreationStroke, RecreationText, RecreationTextStyle, RecreationViewEffect } from "../recreation-types";

const text = (id: string, order: number, x: number, y: number, width: number, value: string, style: RecreationTextStyle = {}): RecreationText => ({ id, kind: "text", order, x, y, width, text: value, style });
const stroke = (id: string, order: number, path: string, style: Omit<RecreationStroke, "id" | "kind" | "order" | "animated" | "path"> = {}): RecreationStroke => ({ id, kind: "stroke", order, path, ...style });
const box = (id: string, order: number, x: number, y: number, width: number, height: number, style: Omit<RecreationBox, "id" | "kind" | "order" | "animated" | "x" | "y" | "width" | "height"> = {}): RecreationBox => ({ id, kind: "box", order, x, y, width, height, ...style });
const mark = (id: string, order: number, targetId: string, match: string, color: string, occurrence = 1): RecreationMark => ({ id, kind: "mark", order, targetId, match, occurrence, mark: "underline", color, width: 2.1, offset: -4, padding: 1, wobble: 1.4 });
const annotation = (id: string, order: number, targetId: string, match: string, label: string, color: string, options: Partial<Omit<RecreationAnnotation, "id" | "kind" | "order" | "targetId" | "match" | "label" | "color">> = {}): RecreationAnnotation => ({ id, kind: "annotation", order, targetId, match, label, color, ...options });
const view = (id: string, order: number, mode: "focus" | "restore", targetIds: string[] = [], dimOpacity = 0.08, durationMs = 520): RecreationViewEffect => ({ id, kind: "view", order, mode, targetIds, dimOpacity, durationMs });
const staticStroke = (id: string, path: string, style: Omit<RecreationStroke, "id" | "kind" | "order" | "animated" | "path"> = {}): RecreationStroke => ({ id, kind: "stroke", animated: false, path, ...style });

const ink = "#171717";
const blue = "#2553a4";
const red = "#c93632";
const green = "#2c7a49";
const softBlue = "#5077b5";

const clauseOverviewIds = ["full-sentence", "clause-1-mark", "clause-1-label", "clause-2-mark", "clause-2-label", "clause-3-mark", "clause-3-label"];
const clause1Ids = ["full-sentence", "clause-1-mark", "clause-1-label", "c1-conj", "c1-subject", "c1-be", "c1-adj", "c1-time"];
const clause2Ids = ["full-sentence", "clause-2-mark", "clause-2-label", "c2-subject", "c2-adv", "c2-verb", "c2-place"];
const clause3Ids = ["full-sentence", "clause-3-mark", "clause-3-label", "c3-conj", "c3-subject", "c3-verb", "c3-inf", "c3-object", "c3-time"];
const synthesisIds = ["full-sentence", "structure-title", "structure-box", "structure-formula", "translation-title", "translation-text", "translation-mark"];
const summaryIds = ["key-title", "key-box", "key-text", "tip-title", "tip-box", "tip-text"];

export const immersiveGrammarAnalysisScene: RecreationScene = {
  id: "immersive-grammar-analysis",
  title: "长句语法沉浸式分析",
  description: "先写完整原句，再直接在原句上逐层标注从句、词性与结构；分析阶段自动淡出无关内容，最后恢复完整笔记。",
  prompt: "帮我沉浸式分析这句话的语法：Although I was tired after work, I still went to the library because I needed to finish my report before Friday. 不要重复抄句子，直接在原句上逐层分析。",
  sourceName: "Long Sentence Analysis.png",
  createdAt: "2026-08-07",
  width: 1536,
  height: 1450,
  paper: { background: "#f8f6ef", pattern: "ruled", patternColor: "rgba(77,106,137,.18)", spacing: 40, patternOffset: 98, patternThickness: 1 },
  elements: [
    staticStroke("left-margin", "M 108 0 L 108 1450", { color: "rgba(202,87,74,.28)", width: 1.2, handDrawn: false }),
    staticStroke("top-rule", "M 40 98 L 1490 98", { color: "rgba(77,106,137,.18)", width: 1, handDrawn: false }),

    text("page-title", 10, 310, 20, 900, "Long Sentence Analysis", { fontSize: 48, lineHeight: 58, textAlign: "center", characterJitter: .55 }),
    text("page-subtitle", 11, 525, 72, 480, "长句语法分析", { fontSize: 34, lineHeight: 44, textAlign: "center", characterJitter: .5 }),
    mark("subtitle-mark", 12, "page-subtitle", "长句语法分析", red),

    text("full-title", 20, 120, 125, 620, "1. Full Sentence（完整句子）", { color: blue, fontSize: 25, lineHeight: 36 }),
    text("full-sentence", 21, 145, 190, 1250, "Although I was tired after work, I still went to the library\nbecause I needed to finish my report before Friday.", { fontSize: 34, lineHeight: 62, characterJitter: .42 }),
    view("focus-overview", 22, "focus", clauseOverviewIds, .06, 600),

    mark("clause-1-mark", 30, "full-sentence", "Although I was tired after work", red),
    annotation("clause-1-label", 31, "full-sentence", "Although I was tired after work", "让步状语从句 · concessive clause", red, { position: "below", fontSize: 16, width: 300, offsetY: 3 }),
    mark("clause-2-mark", 32, "full-sentence", "I still went to the library", blue),
    annotation("clause-2-label", 33, "full-sentence", "I still went to the library", "主句 · main clause", blue, { position: "below", fontSize: 16, width: 190, offsetY: 3 }),
    mark("clause-3-mark", 34, "full-sentence", "because I needed to finish my report before Friday", green),
    annotation("clause-3-label", 35, "full-sentence", "because I needed to finish my report before Friday", "原因状语从句 · reason clause", green, { position: "below", fontSize: 16, width: 260, offsetY: 3 }),

    view("focus-clause-1", 40, "focus", clause1Ids, .045, 520),
    annotation("c1-conj", 41, "full-sentence", "Although", "conj. 连词", red, { position: "above", fontSize: 14, width: 92, offsetX: -4, offsetY: -8 }),
    annotation("c1-subject", 42, "full-sentence", "I", "pron. 主语", red, { occurrence: 1, position: "above", fontSize: 14, width: 90, offsetX: 2, offsetY: -8 }),
    annotation("c1-be", 43, "full-sentence", "was", "be v. 系动词", red, { position: "above", fontSize: 14, width: 110, offsetY: -8 }),
    annotation("c1-adj", 44, "full-sentence", "tired", "adj. 形容词", red, { position: "above", fontSize: 14, width: 105, offsetY: -8 }),
    annotation("c1-time", 45, "full-sentence", "after work", "time phrase 时间状语", red, { position: "above", fontSize: 14, width: 165, offsetX: 14, offsetY: -8 }),

    view("focus-clause-2", 50, "focus", clause2Ids, .045, 520),
    annotation("c2-subject", 51, "full-sentence", "I", "pron. 主语", blue, { occurrence: 2, position: "above", fontSize: 14, width: 90, offsetY: -8 }),
    annotation("c2-adv", 52, "full-sentence", "still", "adv. 副词", blue, { position: "above", fontSize: 14, width: 88, offsetY: -8 }),
    annotation("c2-verb", 53, "full-sentence", "went", "v. (past)", blue, { position: "above", fontSize: 14, width: 82, offsetY: -8 }),
    annotation("c2-place", 54, "full-sentence", "to the library", "place phrase 地点状语", blue, { position: "above", fontSize: 14, width: 170, offsetX: 10, offsetY: -8 }),

    view("focus-clause-3", 60, "focus", clause3Ids, .045, 520),
    annotation("c3-conj", 61, "full-sentence", "because", "conj. 连词", green, { position: "above", fontSize: 14, width: 92, offsetY: -8 }),
    annotation("c3-subject", 62, "full-sentence", "I", "pron. 主语", green, { occurrence: 3, position: "above", fontSize: 14, width: 88, offsetY: -8 }),
    annotation("c3-verb", 63, "full-sentence", "needed", "v. (past)", green, { position: "above", fontSize: 14, width: 88, offsetY: -8 }),
    annotation("c3-inf", 64, "full-sentence", "to finish", "infinitive 不定式", green, { position: "above", fontSize: 14, width: 128, offsetY: -8 }),
    annotation("c3-object", 65, "full-sentence", "my report", "object 宾语", green, { position: "above", fontSize: 14, width: 110, offsetY: -8 }),
    annotation("c3-time", 66, "full-sentence", "before Friday", "time phrase 时间状语", green, { position: "above", fontSize: 14, width: 166, offsetX: 16, offsetY: -8 }),

    view("focus-synthesis", 70, "focus", synthesisIds, .055, 620),
    text("structure-title", 71, 120, 430, 520, "2. Sentence structure（句子结构）", { color: blue, fontSize: 25, lineHeight: 36 }),
    box("structure-box", 72, 140, 485, 1050, 92, { stroke: red, strokeWidth: 1.8, radius: 8, roughness: .8, fill: "rgba(255,255,255,.2)" }),
    text("structure-formula", 73, 170, 507, 990, "[Although + clause] , [main clause] + [because + clause]", { fontSize: 30, lineHeight: 42, textAlign: "center" }),
    text("translation-title", 74, 120, 615, 420, "3. Translation（翻译）", { color: blue, fontSize: 25, lineHeight: 36 }),
    text("translation-text", 75, 145, 670, 1230, "虽然我下班后很累，但我还是去了图书馆，因为我需要在周五之前完成报告。", { fontSize: 27, lineHeight: 42 }),
    mark("translation-mark", 76, "translation-text", "但我还是去了图书馆", red),

    view("focus-summary", 80, "focus", summaryIds, .05, 600),
    text("key-title", 81, 120, 785, 440, "4. Key points（重点归纳）", { color: blue, fontSize: 25, lineHeight: 36 }),
    box("key-box", 82, 130, 835, 720, 250, { stroke: green, strokeWidth: 1.7, radius: 22, roughness: .85, fill: "rgba(248,255,248,.25)" }),
    text("key-text", 83, 165, 872, 650, "① although 引导让步\n② because 引导原因\n③ still 表示“仍然、还是”\n④ need to do = 需要做某事\n⑤ before Friday 表示截止时间", { fontSize: 24, lineHeight: 42 }),
    text("tip-title", 84, 900, 785, 390, "5. My tip（学习笔记）", { color: blue, fontSize: 25, lineHeight: 36 }),
    box("tip-box", 85, 890, 835, 500, 250, { stroke: softBlue, strokeWidth: 1.7, radius: 28, roughness: 1, fill: "rgba(247,250,255,.25)" }),
    text("tip-text", 86, 930, 874, 420, "☆ 先找主句，再看从句。\n☆ 遇到 although / because，\n   先判断逻辑关系。\n☆ 分层理解，比重复抄句子更有效。", { fontSize: 23, lineHeight: 43 }),

    text("final-note", 88, 120, 1155, 1230, "学习路径：完整句子 → 从句关系 → 词性角色 → 结构公式 → 翻译与归纳", { color: ink, fontSize: 28, lineHeight: 42, textAlign: "center" }),
    stroke("final-arrow", 89, "M 320 1225 C 520 1255 1010 1255 1210 1225", { color: blue, width: 1.7, roughness: 1, bowing: 1.2 }),
    view("restore-final", 90, "restore", [], .08, 760),
  ],
};
