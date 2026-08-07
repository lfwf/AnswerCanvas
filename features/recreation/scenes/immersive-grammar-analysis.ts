import type { RecreationAnnotation, RecreationBox, RecreationMark, RecreationScene, RecreationStroke, RecreationText, RecreationTextStyle, RecreationViewEffect } from "../recreation-types";

const text = (id: string, order: number, x: number, y: number, width: number, value: string, style: RecreationTextStyle = {}): RecreationText => ({ id, kind: "text", order, x, y, width, text: value, style });
const stroke = (id: string, order: number, path: string, style: Omit<RecreationStroke, "id" | "kind" | "order" | "animated" | "path"> = {}): RecreationStroke => ({ id, kind: "stroke", order, path, ...style });
const box = (id: string, order: number, x: number, y: number, width: number, height: number, style: Omit<RecreationBox, "id" | "kind" | "order" | "animated" | "x" | "y" | "width" | "height"> = {}): RecreationBox => ({ id, kind: "box", order, x, y, width, height, ...style });
const mark = (id: string, order: number, targetId: string, match: string, color: string, occurrence = 1): RecreationMark => ({ id, kind: "mark", order, targetId, match, occurrence, mark: "underline", color, width: 2.1, offset: -4, padding: 1, wobble: 1.4 });
const annotation = (id: string, order: number, targetId: string, match: string, label: string, color: string, options: Partial<Omit<RecreationAnnotation, "id" | "kind" | "order" | "targetId" | "match" | "label" | "color">> = {}): RecreationAnnotation => ({ id, kind: "annotation", order, targetId, match, label, color, ...options });
const focus = (id: string, order: number, phase: string, targetIds: string[], elementOpacity: Record<string, number> = {}, dimOpacity = 0.035, durationMs = 600): RecreationViewEffect => ({ id, kind: "view", order, mode: "focus", phase, targetIds, elementOpacity, dimOpacity, durationMs });
const restore = (id: string, order: number, phase: string, durationMs = 760): RecreationViewEffect => ({ id, kind: "view", order, mode: "restore", phase, durationMs });
const staticStroke = (id: string, path: string, style: Omit<RecreationStroke, "id" | "kind" | "order" | "animated" | "path"> = {}): RecreationStroke => ({ id, kind: "stroke", animated: false, path, ...style });

const ink = "#171717";
const blue = "#2553a4";
const red = "#c93632";
const green = "#2c7a49";
const softBlue = "#5077b5";

const titleOpacity = { "page-title": 0.14, "page-subtitle": 0.18, "subtitle-mark": 0.12, "full-title": 0.32 };
const clause1Pos = ["c1-conj", "c1-subject", "c1-be", "c1-adj", "c1-time"];
const clause2Pos = ["c2-subject", "c2-adv", "c2-verb", "c2-place"];
const clause3Pos = ["c3-conj", "c3-subject", "c3-verb", "c3-inf", "c3-object", "c3-time"];
const faded = (ids: string[], value: number) => Object.fromEntries(ids.map((id) => [id, value]));

export const immersiveGrammarAnalysisScene: RecreationScene = {
  id: "immersive-grammar-analysis",
  title: "长句语法沉浸式分析",
  description: "像老师在黑板上逐层讲解：先拆从句关系，再讲词性、结构、翻译与重点；前一阶段内容按需要保留、淡化或隐藏，最后恢复完整笔记。",
  prompt: "帮我像老师上课一样沉浸式分析这句话：Although I was tired after work, I still went to the library because I needed to finish my report before Friday. 原句只写一次，后续直接在原句上讲解，并根据当前重点保留或淡化前面的内容。",
  sourceName: "Long Sentence Analysis.png",
  createdAt: "2026-08-07",
  width: 1536,
  height: 1580,
  paper: { background: "#f8f6ef", pattern: "ruled", patternColor: "rgba(77,106,137,.18)", spacing: 46, patternOffset: 104, patternThickness: 1 },
  elements: [
    staticStroke("left-margin", "M 108 0 L 108 1580", { color: "rgba(202,87,74,.28)", width: 1.2, handDrawn: false }),
    staticStroke("top-rule", "M 40 104 L 1490 104", { color: "rgba(77,106,137,.18)", width: 1, handDrawn: false }),

    text("page-title", 10, 310, 22, 900, "Long Sentence Analysis", { fontSize: 48, lineHeight: 58, textAlign: "center", characterJitter: .55 }),
    text("page-subtitle", 11, 525, 78, 480, "长句语法分析", { fontSize: 34, lineHeight: 44, textAlign: "center", characterJitter: .5 }),
    mark("subtitle-mark", 12, "page-subtitle", "长句语法分析", red),

    text("full-title", 20, 120, 145, 620, "1. Full Sentence（完整句子）", { color: blue, fontSize: 25, lineHeight: 36 }),
    text("full-sentence", 21, 145, 220, 1250, "Although I was tired after work, I still went to the library\nbecause I needed to finish my report before Friday.", { fontSize: 34, lineHeight: 92, characterJitter: .42 }),
    focus("focus-overview", 22, "split-clauses", ["full-sentence"], titleOpacity, .08, 560),

    mark("clause-1-mark", 30, "full-sentence", "Although I was tired after work", red),
    annotation("clause-1-label", 31, "full-sentence", "Although I was tired after work", "让步状语从句 · concessive clause", red, { position: "below", fontSize: 16, width: 300, gap: 16, offsetY: 1 }),
    mark("clause-2-mark", 32, "full-sentence", "I still went to the library", blue),
    annotation("clause-2-label", 33, "full-sentence", "I still went to the library", "主句 · main clause", blue, { position: "below", fontSize: 16, width: 190, gap: 16, offsetY: 1 }),
    mark("clause-3-mark", 34, "full-sentence", "because I needed to finish my report before Friday", green),
    annotation("clause-3-label", 35, "full-sentence", "because I needed to finish my report before Friday", "原因状语从句 · reason clause", green, { position: "below", fontSize: 16, width: 270, gap: 16, offsetY: 1 }),

    focus("focus-clause-1", 40, "pos-clause-1", ["full-sentence", "clause-1-mark"], {
      ...titleOpacity,
      "clause-1-label": .64,
      "clause-2-mark": .28,
      "clause-2-label": .08,
      "clause-3-mark": .28,
      "clause-3-label": .08,
    }, .03, 620),
    annotation("c1-conj", 41, "full-sentence", "Although", "conj. 连词", red, { position: "above", fontSize: 14, width: 92, gap: 20, offsetX: -4 }),
    annotation("c1-subject", 42, "full-sentence", "I", "pron. 主语", red, { occurrence: 1, position: "above", fontSize: 14, width: 90, gap: 20, offsetX: 2 }),
    annotation("c1-be", 43, "full-sentence", "was", "be v. 系动词", red, { position: "above", fontSize: 14, width: 110, gap: 20 }),
    annotation("c1-adj", 44, "full-sentence", "tired", "adj. 形容词", red, { position: "above", fontSize: 14, width: 105, gap: 20 }),
    annotation("c1-time", 45, "full-sentence", "after work", "time phrase 时间状语", red, { position: "above", fontSize: 14, width: 165, gap: 20, offsetX: 14 }),

    focus("focus-clause-2", 50, "pos-clause-2", ["full-sentence", "clause-2-mark"], {
      ...titleOpacity,
      ...faded(clause1Pos, .08),
      "clause-1-mark": .2,
      "clause-1-label": .035,
      "clause-2-label": .64,
      "clause-3-mark": .28,
      "clause-3-label": .08,
    }, .025, 620),
    annotation("c2-subject", 51, "full-sentence", "I", "pron. 主语", blue, { occurrence: 2, position: "above", fontSize: 14, width: 90, gap: 20 }),
    annotation("c2-adv", 52, "full-sentence", "still", "adv. 副词", blue, { position: "above", fontSize: 14, width: 88, gap: 20 }),
    annotation("c2-verb", 53, "full-sentence", "went", "v. (past)", blue, { position: "above", fontSize: 14, width: 82, gap: 20 }),
    annotation("c2-place", 54, "full-sentence", "to the library", "place phrase 地点状语", blue, { position: "above", fontSize: 14, width: 170, gap: 20, offsetX: 10 }),

    focus("focus-clause-3", 60, "pos-clause-3", ["full-sentence", "clause-3-mark"], {
      ...titleOpacity,
      ...faded(clause1Pos, .045),
      ...faded(clause2Pos, .07),
      "clause-1-mark": .14,
      "clause-1-label": .025,
      "clause-2-mark": .2,
      "clause-2-label": .035,
      "clause-3-label": .64,
    }, .02, 620),
    annotation("c3-conj", 61, "full-sentence", "because", "conj. 连词", green, { position: "above", fontSize: 14, width: 92, gap: 20 }),
    annotation("c3-subject", 62, "full-sentence", "I", "pron. 主语", green, { occurrence: 3, position: "above", fontSize: 14, width: 88, gap: 20 }),
    annotation("c3-verb", 63, "full-sentence", "needed", "v. (past)", green, { position: "above", fontSize: 14, width: 88, gap: 20 }),
    annotation("c3-inf", 64, "full-sentence", "to finish", "infinitive 不定式", green, { position: "above", fontSize: 14, width: 128, gap: 20 }),
    annotation("c3-object", 65, "full-sentence", "my report", "object 宾语", green, { position: "above", fontSize: 14, width: 110, gap: 20 }),
    annotation("c3-time", 66, "full-sentence", "before Friday", "time phrase 时间状语", green, { position: "above", fontSize: 14, width: 166, gap: 20, offsetX: 16 }),

    focus("focus-structure", 70, "sentence-structure", [], {
      ...titleOpacity,
      "full-sentence": .72,
      "clause-1-mark": .12,
      "clause-2-mark": .12,
      "clause-3-mark": .12,
      "clause-1-label": .02,
      "clause-2-label": .02,
      "clause-3-label": .02,
      ...faded(clause1Pos, .015),
      ...faded(clause2Pos, .015),
      ...faded(clause3Pos, .015),
    }, .015, 680),
    text("structure-title", 71, 120, 520, 520, "2. Sentence structure（句子结构）", { color: blue, fontSize: 25, lineHeight: 38 }),
    box("structure-box", 72, 140, 582, 1050, 106, { stroke: red, strokeWidth: 1.8, radius: 8, roughness: .8, fill: "rgba(255,255,255,.2)" }),
    text("structure-formula", 73, 170, 611, 990, "[Although + clause] , [main clause] + [because + clause]", { fontSize: 30, lineHeight: 46, textAlign: "center" }),

    focus("focus-translation", 74, "translation", [], {
      ...titleOpacity,
      "full-sentence": .42,
      "structure-title": .38,
      "structure-box": .3,
      "structure-formula": .62,
      "clause-1-mark": .08,
      "clause-2-mark": .08,
      "clause-3-mark": .08,
      ...faded(clause1Pos, .01),
      ...faded(clause2Pos, .01),
      ...faded(clause3Pos, .01),
    }, .012, 620),
    text("translation-title", 75, 120, 745, 420, "3. Translation（翻译）", { color: blue, fontSize: 25, lineHeight: 38 }),
    text("translation-text", 76, 145, 812, 1230, "虽然我下班后很累，但我还是去了图书馆，因为我需要在周五之前完成报告。", { fontSize: 27, lineHeight: 50 }),
    mark("translation-mark", 77, "translation-text", "但我还是去了图书馆", red),

    focus("focus-summary", 80, "summary", [], {
      ...titleOpacity,
      "full-sentence": .24,
      "structure-title": .22,
      "structure-box": .18,
      "structure-formula": .3,
      "translation-title": .42,
      "translation-text": .72,
      "translation-mark": .5,
      "clause-1-mark": .05,
      "clause-2-mark": .05,
      "clause-3-mark": .05,
      ...faded(clause1Pos, .008),
      ...faded(clause2Pos, .008),
      ...faded(clause3Pos, .008),
    }, .008, 660),
    text("key-title", 81, 120, 935, 440, "4. Key points（重点归纳）", { color: blue, fontSize: 25, lineHeight: 38 }),
    box("key-box", 82, 130, 990, 720, 270, { stroke: green, strokeWidth: 1.7, radius: 22, roughness: .85, fill: "rgba(248,255,248,.25)" }),
    text("key-text", 83, 165, 1028, 650, "① although 引导让步\n② because 引导原因\n③ still 表示“仍然、还是”\n④ need to do = 需要做某事\n⑤ before Friday 表示截止时间", { fontSize: 24, lineHeight: 45 }),
    text("tip-title", 84, 900, 935, 390, "5. My tip（学习笔记）", { color: blue, fontSize: 25, lineHeight: 38 }),
    box("tip-box", 85, 890, 990, 500, 270, { stroke: softBlue, strokeWidth: 1.7, radius: 28, roughness: 1, fill: "rgba(247,250,255,.25)" }),
    text("tip-text", 86, 930, 1030, 420, "☆ 先找主句，再看从句。\n☆ 遇到 although / because，\n   先判断逻辑关系。\n☆ 分层理解，比重复抄句子更有效。", { fontSize: 23, lineHeight: 46 }),

    text("final-note", 88, 120, 1370, 1230, "学习路径：完整句子 → 从句关系 → 词性角色 → 结构公式 → 翻译与归纳", { color: ink, fontSize: 28, lineHeight: 44, textAlign: "center" }),
    stroke("final-arrow", 89, "M 320 1450 C 520 1480 1010 1480 1210 1450", { color: blue, width: 1.7, roughness: 1, bowing: 1.2 }),
    restore("restore-final", 90, "final-board", 820),
  ],
};
