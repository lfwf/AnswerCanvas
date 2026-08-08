import type { RecreationBox, RecreationMark, RecreationPageTurn, RecreationScene, RecreationStroke, RecreationText, RecreationTextStyle, RecreationViewEffect } from "../recreation-types";

const ink = "#171717";
const blue = "#1754a7";
const green = "#168447";
const orange = "#e96813";
const red = "#d64535";
const purple = "#7d49b5";
const gray = "#65625d";
const yellowHi = "rgba(246,207,76,.40)";
const blueHi = "rgba(78,145,225,.28)";
const greenHi = "rgba(70,177,118,.27)";
const orangeHi = "rgba(239,123,35,.25)";

const text = (pageId: string, id: string, order: number, x: number, y: number, width: number, value: string, style: RecreationTextStyle = {}): RecreationText => ({ id, kind: "text", pageId, order, x, y, width, text: value, style });
const stroke = (pageId: string, id: string, order: number, path: string, style: Omit<RecreationStroke, "id" | "kind" | "order" | "animated" | "pageId" | "path"> = {}): RecreationStroke => ({ id, kind: "stroke", pageId, order, path, ...style, ...(style.handDrawn === false ? {} : { roughness: Math.max(style.roughness ?? 0, 1.45), bowing: Math.max(style.bowing ?? 0, 1.1) }) });
const box = (pageId: string, id: string, order: number, x: number, y: number, width: number, height: number, style: Omit<RecreationBox, "id" | "kind" | "order" | "animated" | "pageId" | "x" | "y" | "width" | "height"> = {}): RecreationBox => ({ id, kind: "box", pageId, order, x, y, width, height, ...style, ...(style.handDrawn === false ? {} : { roughness: Math.max(style.roughness ?? 0, 1.45), bowing: Math.max(style.bowing ?? 0, 1.05) }) });
const highlight = (pageId: string, id: string, order: number, targetId: string, match: string, color: string): RecreationMark => ({ id, kind: "mark", pageId, order, targetId, match, mark: "highlight", color, opacity: .94, padding: 2, wobble: 1.2 });
const hold = (pageId: string, id: string, order: number, durationMs = 1100): RecreationViewEffect => ({ id, kind: "view", pageId, order, mode: "restore", durationMs });
const turn = (id: string, order: number, pageId: string): RecreationPageTurn => ({ id, kind: "page", order, pageId, durationMs: 820, transition: "flip" });

function pageTitle(pageId: string, order: number, number: string, title: string, color = blue) {
  return [
    box(pageId, `${pageId}-no-box`, order, 62, 62, 82, 82, { stroke: color, strokeWidth: 3, radius: 22, fill: "rgba(255,255,255,.28)" }),
    text(pageId, `${pageId}-no`, order + 1, 62, 72, 82, number, { color, fontSize: 50, lineHeight: 58, fontWeight: 700, textAlign: "center" }),
    text(pageId, `${pageId}-title`, order + 2, 170, 70, 650, title, { color, fontSize: 50, lineHeight: 62, fontWeight: 700 }),
    stroke(pageId, `${pageId}-title-line`, order + 3, "M 172 142 Q 390 132 610 143", { color, width: 3.2 }),
  ];
}

function arrow(pageId: string, id: string, order: number, x1: number, y1: number, x2: number, y2: number, color = blue) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const hx = x2 - 18 * Math.cos(angle);
  const hy = y2 - 18 * Math.sin(angle);
  const leftX = hx + 10 * Math.cos(angle + Math.PI / 2);
  const leftY = hy + 10 * Math.sin(angle + Math.PI / 2);
  const rightX = hx + 10 * Math.cos(angle - Math.PI / 2);
  const rightY = hy + 10 * Math.sin(angle - Math.PI / 2);
  return stroke(pageId, id, order, `M ${x1} ${y1} Q ${(x1 + x2) / 2} ${(y1 + y2) / 2 - 4} ${x2} ${y2} M ${leftX} ${leftY} L ${x2} ${y2} L ${rightX} ${rightY}`, { color, width: 3 });
}

function check(pageId: string, id: string, order: number, x: number, y: number) {
  return [
    box(pageId, `${id}-box`, order, x, y, 46, 46, { stroke: green, strokeWidth: 2.8, radius: 5 }),
    stroke(pageId, `${id}-tick`, order + 1, `M ${x + 9} ${y + 24} L ${x + 20} ${y + 35} L ${x + 38} ${y + 11}`, { color: green, width: 4 }),
  ];
}

export const llmReceivesSentenceScene: RecreationScene = {
  id: "llm-receives-sentence",
  title: "AI 收到一句话以后发生了什么？",
  description: "竖屏分页手写视频：把一句输入如何经过 Token、向量、上下文理解、逐步预测、连续生成和输出整理拆成 7 个可视化步骤。",
  prompt: "把“AI 收到一句话以后发生了什么”做成适合小红书竖屏录制的手写视频。每个步骤单独一页，先写关键文字，再画结构和关系，最后补重点高亮；不要把整页密集笔记一次铺满。",
  sourceName: "AI 收到一句话以后发生了什么.png",
  createdAt: "2026-08-08",
  snapshotRevision: "2026-08-08.1",
  width: 900,
  height: 1600,
  paper: { background: "#f7f1e5", pattern: "plain", patternColor: "rgba(102,83,55,.055)", spacing: 38 },
  pages: [
    { id: "cover", title: "封面" },
    { id: "input", title: "1 接收输入" },
    { id: "token", title: "2 切分成 Token" },
    { id: "embedding", title: "3 变成向量" },
    { id: "attention", title: "4 理解上下文" },
    { id: "predict", title: "5 预测下一个 Token" },
    { id: "generate", title: "6 连续生成回答" },
    { id: "check", title: "7 输出前检查" },
    { id: "summary", title: "核心原理" },
  ],
  elements: [
    text("cover", "cover-title", 10, 80, 270, 740, "AI 收到一句话以后\n发生了什么？", { color: ink, fontSize: 68, lineHeight: 92, fontWeight: 700, textAlign: "center" }),
    stroke("cover", "cover-underline", 11, "M 170 495 Q 450 475 735 496", { color: blue, width: 4 }),
    text("cover", "cover-sub", 12, 160, 555, 580, "从一句输入，到一段回答", { color: blue, fontSize: 40, lineHeight: 54, textAlign: "center" }),
    box("cover", "cover-bubble", 13, 105, 720, 690, 145, { stroke: blue, strokeWidth: 3, radius: 34, fill: "rgba(255,255,255,.24)" }),
    text("cover", "cover-prompt", 14, 150, 758, 600, "帮我写一个周末深圳一日游计划", { color: ink, fontSize: 39, lineHeight: 56, textAlign: "center" }),
    text("cover", "cover-flow", 15, 90, 990, 720, "文本 → Token → 向量 → Attention\n→ 预测 → 生成 → 检查", { color: blue, fontSize: 38, lineHeight: 72, textAlign: "center" }),
    highlight("cover", "cover-hi", 16, "cover-flow", "预测", yellowHi),
    text("cover", "cover-note", 17, 130, 1220, 640, "模型不是先想好整段答案，\n而是一步一步往后生成。", { color: red, fontSize: 38, lineHeight: 68, fontWeight: 650, textAlign: "center" }),
    hold("cover", "cover-hold", 18),
    turn("turn-input", 19, "input"),

    ...pageTitle("input", 100, "1", "接收输入"),
    text("input", "input-copy", 104, 85, 230, 730, "你输入一句话，\nAI 首先收到的只是——文本。", { fontSize: 42, lineHeight: 82 }),
    highlight("input", "input-hi-text", 105, "input-copy", "文本", yellowHi),
    box("input", "input-bubble", 106, 105, 535, 690, 180, { stroke: blue, strokeWidth: 3, radius: 38, fill: "rgba(23,84,167,.025)" }),
    text("input", "input-prompt", 107, 145, 580, 610, "帮我写一个周末深圳一日游计划", { fontSize: 39, lineHeight: 58, textAlign: "center" }),
    arrow("input", "input-arrow", 108, 450, 770, 450, 950, blue),
    box("input", "input-text-box", 109, 270, 980, 360, 145, { stroke: blue, strokeWidth: 3, radius: 24, fill: "rgba(78,145,225,.08)" }),
    text("input", "input-text-label", 110, 300, 1018, 300, "TEXT / 文本", { color: blue, fontSize: 48, lineHeight: 58, fontWeight: 700, textAlign: "center" }),
    text("input", "input-bottom", 111, 130, 1220, 640, "第一步没有“理解”，\n只是先把你的输入接进来。", { color: gray, fontSize: 36, lineHeight: 64, textAlign: "center" }),
    hold("input", "input-hold", 112),
    turn("turn-token", 113, "token"),

    ...pageTitle("token", 200, "2", "切分成 Token"),
    text("token", "token-copy", 204, 85, 220, 730, "一句话不会整句直接处理，\n而是先拆成模型更容易计算的小单元。", { fontSize: 39, lineHeight: 72 }),
    box("token", "token-source", 205, 95, 445, 710, 120, { stroke: blue, strokeWidth: 2.8, radius: 28 }),
    text("token", "token-source-text", 206, 125, 475, 650, "帮我写一个周末深圳一日游计划", { fontSize: 36, lineHeight: 52, textAlign: "center" }),
    arrow("token", "token-down", 207, 450, 590, 450, 690, blue),
    box("token", "tok-1", 208, 60, 735, 120, 90, { stroke: blue, strokeWidth: 2.6, radius: 14 }),
    text("token", "tok-1-t", 209, 68, 756, 104, "帮我", { fontSize: 34, lineHeight: 45, textAlign: "center" }),
    box("token", "tok-2", 210, 195, 735, 88, 90, { stroke: blue, strokeWidth: 2.6, radius: 14 }),
    text("token", "tok-2-t", 211, 202, 756, 74, "写", { fontSize: 34, lineHeight: 45, textAlign: "center" }),
    box("token", "tok-3", 212, 298, 735, 110, 90, { stroke: blue, strokeWidth: 2.6, radius: 14 }),
    text("token", "tok-3-t", 213, 306, 756, 94, "一个", { fontSize: 34, lineHeight: 45, textAlign: "center" }),
    box("token", "tok-4", 214, 423, 735, 110, 90, { stroke: blue, strokeWidth: 2.6, radius: 14 }),
    text("token", "tok-4-t", 215, 431, 756, 94, "周末", { fontSize: 34, lineHeight: 45, textAlign: "center" }),
    box("token", "tok-5", 216, 548, 735, 110, 90, { stroke: blue, strokeWidth: 2.6, radius: 14 }),
    text("token", "tok-5-t", 217, 556, 756, 94, "深圳", { fontSize: 34, lineHeight: 45, textAlign: "center" }),
    box("token", "tok-6", 218, 673, 735, 150, 90, { stroke: blue, strokeWidth: 2.6, radius: 14 }),
    text("token", "tok-6-t", 219, 681, 756, 134, "一日游", { fontSize: 34, lineHeight: 45, textAlign: "center" }),
    text("token", "token-note", 220, 105, 930, 690, "Token 不一定等于一个字，\n也不一定等于一个词。", { color: blue, fontSize: 42, lineHeight: 76, textAlign: "center" }),
    highlight("token", "token-hi", 221, "token-note", "Token", blueHi),
    text("token", "token-bottom", 222, 135, 1195, 630, "你看到的是一句话，\n模型看到的是一串 Token。", { color: ink, fontSize: 38, lineHeight: 68, fontWeight: 650, textAlign: "center" }),
    hold("token", "token-hold", 223),
    turn("turn-embedding", 224, "embedding"),

    ...pageTitle("embedding", 300, "3", "变成向量（Embedding）", green),
    text("embedding", "embed-copy", 304, 85, 220, 730, "每个 Token 会被换成一串数字，\n这些数字用来表示它的语义位置。", { fontSize: 39, lineHeight: 72 }),
    box("embedding", "embed-token-a", 305, 95, 520, 180, 100, { stroke: green, strokeWidth: 2.8, radius: 16 }),
    text("embedding", "embed-token-a-t", 306, 110, 545, 150, "深圳", { color: green, fontSize: 40, lineHeight: 50, fontWeight: 650, textAlign: "center" }),
    arrow("embedding", "embed-arrow-a", 307, 285, 570, 410, 570, green),
    box("embedding", "embed-vector-a", 308, 430, 475, 330, 190, { stroke: green, strokeWidth: 2.8, radius: 18, fill: "rgba(22,132,71,.035)" }),
    text("embedding", "embed-vector-a-t", 309, 455, 505, 280, "0.67\n-0.23\n0.14\n…", { color: ink, fontSize: 32, lineHeight: 38, textAlign: "center" }),
    box("embedding", "embed-token-b", 310, 95, 760, 180, 100, { stroke: green, strokeWidth: 2.8, radius: 16 }),
    text("embedding", "embed-token-b-t", 311, 110, 785, 150, "计划", { color: green, fontSize: 40, lineHeight: 50, fontWeight: 650, textAlign: "center" }),
    arrow("embedding", "embed-arrow-b", 312, 285, 810, 410, 810, green),
    box("embedding", "embed-vector-b", 313, 430, 715, 330, 190, { stroke: green, strokeWidth: 2.8, radius: 18, fill: "rgba(22,132,71,.035)" }),
    text("embedding", "embed-vector-b-t", 314, 455, 745, 280, "0.42\n0.11\n0.68\n…", { color: ink, fontSize: 32, lineHeight: 38, textAlign: "center" }),
    text("embedding", "embed-man", 315, 110, 1035, 680, "人看文字，模型看向量。", { color: green, fontSize: 48, lineHeight: 60, fontWeight: 700, textAlign: "center" }),
    highlight("embedding", "embed-hi", 316, "embed-man", "模型看向量", greenHi),
    text("embedding", "embed-bottom", 317, 150, 1190, 600, "到这里，文字已经变成了\n模型可以计算的表示。", { color: gray, fontSize: 36, lineHeight: 64, textAlign: "center" }),
    hold("embedding", "embedding-hold", 318),
    turn("turn-attention", 319, "attention"),

    ...pageTitle("attention", 400, "4", "理解上下文（Attention）"),
    text("attention", "attn-copy", 404, 85, 215, 730, "模型会看每个词和其他词之间的关系，\n判断当前真正重要的上下文。", { fontSize: 39, lineHeight: 72 }),
    box("attention", "attn-center", 405, 350, 650, 200, 110, { stroke: blue, strokeWidth: 3, radius: 22, fill: "rgba(78,145,225,.08)" }),
    text("attention", "attn-center-t", 406, 370, 678, 160, "计划", { color: blue, fontSize: 42, lineHeight: 52, fontWeight: 700, textAlign: "center" }),
    box("attention", "attn-top", 407, 360, 455, 180, 92, { stroke: blue, strokeWidth: 2.6, radius: 18 }),
    text("attention", "attn-top-t", 408, 375, 476, 150, "写", { fontSize: 34, lineHeight: 46, textAlign: "center" }),
    box("attention", "attn-left", 409, 95, 650, 180, 92, { stroke: blue, strokeWidth: 2.6, radius: 18 }),
    text("attention", "attn-left-t", 410, 110, 671, 150, "周末", { fontSize: 34, lineHeight: 46, textAlign: "center" }),
    box("attention", "attn-right", 411, 625, 650, 180, 92, { stroke: blue, strokeWidth: 2.6, radius: 18 }),
    text("attention", "attn-right-t", 412, 640, 671, 150, "深圳", { fontSize: 34, lineHeight: 46, textAlign: "center" }),
    box("attention", "attn-bottom", 413, 360, 845, 180, 92, { stroke: blue, strokeWidth: 2.6, radius: 18 }),
    text("attention", "attn-bottom-t", 414, 375, 866, 150, "一日游", { fontSize: 34, lineHeight: 46, textAlign: "center" }),
    arrow("attention", "attn-a1", 415, 450, 555, 450, 640, blue),
    arrow("attention", "attn-a2", 416, 285, 695, 340, 695, blue),
    arrow("attention", "attn-a3", 417, 615, 695, 560, 695, blue),
    arrow("attention", "attn-a4", 418, 450, 835, 450, 770, blue),
    text("attention", "attn-key", 419, 170, 1030, 560, "重点：写计划\n周末 · 深圳 · 一日游", { color: blue, fontSize: 40, lineHeight: 70, textAlign: "center" }),
    text("attention", "attn-bottom-copy", 420, 130, 1215, 640, "不是逐字死记，\n而是在看“关系”。", { color: red, fontSize: 40, lineHeight: 70, fontWeight: 650, textAlign: "center" }),
    highlight("attention", "attn-hi", 421, "attn-bottom-copy", "关系", yellowHi),
    hold("attention", "attention-hold", 422),
    turn("turn-predict", 423, "predict"),

    ...pageTitle("predict", 500, "5", "根据上下文预测下一个 Token", orange),
    text("predict", "predict-copy", 504, 85, 220, 730, "AI 不是一次想好整段话，\n而是一步一步预测接下来最可能出现什么。", { fontSize: 39, lineHeight: 72 }),
    box("predict", "pred-1", 505, 70, 590, 160, 100, { stroke: orange, strokeWidth: 2.8, radius: 18 }),
    text("predict", "pred-1-t", 506, 85, 615, 130, "周末", { fontSize: 35, lineHeight: 48, textAlign: "center" }),
    arrow("predict", "pred-a1", 507, 240, 640, 310, 640, orange),
    box("predict", "pred-2", 508, 320, 590, 160, 100, { stroke: orange, strokeWidth: 2.8, radius: 18 }),
    text("predict", "pred-2-t", 509, 335, 615, 130, "深圳", { fontSize: 35, lineHeight: 48, textAlign: "center" }),
    arrow("predict", "pred-a2", 510, 490, 640, 560, 640, orange),
    box("predict", "pred-3", 511, 570, 590, 180, 100, { stroke: orange, strokeWidth: 2.8, radius: 18 }),
    text("predict", "pred-3-t", 512, 585, 615, 150, "一日游", { fontSize: 35, lineHeight: 48, textAlign: "center" }),
    arrow("predict", "pred-down", 513, 660, 715, 660, 830, orange),
    box("predict", "pred-next", 514, 170, 865, 560, 150, { stroke: orange, strokeWidth: 3, radius: 26, fill: "rgba(239,123,35,.06)" }),
    text("predict", "pred-next-t", 515, 205, 905, 490, "可以这样安排……", { color: orange, fontSize: 48, lineHeight: 62, fontWeight: 700, textAlign: "center" }),
    text("predict", "pred-core", 516, 135, 1100, 630, "本质：预测“下一个”最可能出现的词 / 片段", { color: ink, fontSize: 37, lineHeight: 58, textAlign: "center" }),
    highlight("predict", "pred-hi", 517, "pred-core", "下一个", orangeHi),
    text("predict", "pred-bottom", 518, 150, 1240, 600, "一次只往前走一步。", { color: orange, fontSize: 44, lineHeight: 58, fontWeight: 700, textAlign: "center" }),
    hold("predict", "predict-hold", 519),
    turn("turn-generate", 520, "generate"),

    ...pageTitle("generate", 600, "6", "连续生成回答"),
    box("generate", "gen-context", 604, 120, 290, 300, 115, { stroke: blue, strokeWidth: 2.8, radius: 20 }),
    text("generate", "gen-context-t", 605, 145, 320, 250, "理解当前上下文", { color: blue, fontSize: 38, lineHeight: 52, textAlign: "center" }),
    box("generate", "gen-next", 606, 480, 290, 300, 115, { stroke: blue, strokeWidth: 2.8, radius: 20 }),
    text("generate", "gen-next-t", 607, 505, 320, 250, "预测下一个 Token", { color: blue, fontSize: 38, lineHeight: 52, textAlign: "center" }),
    arrow("generate", "gen-loop-a", 608, 430, 345, 470, 345, blue),
    stroke("generate", "gen-loop-b", 609, "M 630 420 Q 450 560 270 420", { color: blue, width: 3.2 }),
    arrow("generate", "gen-out", 610, 450, 500, 450, 635, red),
    box("generate", "gen-answer", 611, 145, 675, 610, 390, { stroke: red, strokeWidth: 3, radius: 24, fill: "rgba(214,69,53,.035)" }),
    text("generate", "gen-answer-t", 612, 190, 720, 520, "上午：莲花山公园\n中午：附近午餐\n下午：深圳湾散步\n晚上：海上世界\n注意：提前看天气……", { fontSize: 36, lineHeight: 66 }),
    text("generate", "gen-rule", 613, 135, 1140, 630, "生成是连续的，\n不是一次性吐出全文。", { color: red, fontSize: 44, lineHeight: 72, fontWeight: 700, textAlign: "center" }),
    highlight("generate", "gen-hi", 614, "gen-rule", "连续的", yellowHi),
    hold("generate", "generate-hold", 615),
    turn("turn-check", 616, "check"),

    ...pageTitle("check", 700, "7", "输出前检查与整理", green),
    text("check", "check-copy", 704, 85, 220, 730, "在最终展示前，还会做一轮整理，\n让答案更适合直接给你看。", { fontSize: 39, lineHeight: 72 }),
    box("check", "check-panel", 705, 85, 520, 730, 400, { stroke: blue, strokeWidth: 3, radius: 30, fill: "rgba(255,255,255,.18)" }),
    ...check("check", "check-fluent", 706, 140, 605),
    text("check", "check-fluent-t", 708, 210, 600, 180, "通顺", { fontSize: 42, lineHeight: 56 }),
    ...check("check", "check-format", 709, 470, 605),
    text("check", "check-format-t", 711, 540, 600, 180, "格式", { fontSize: 42, lineHeight: 56 }),
    ...check("check", "check-safe", 712, 140, 745),
    text("check", "check-safe-t", 714, 210, 740, 180, "安全", { fontSize: 42, lineHeight: 56 }),
    ...check("check", "check-complete", 715, 470, 745),
    text("check", "check-complete-t", 717, 540, 740, 180, "完整", { fontSize: 42, lineHeight: 56 }),
    arrow("check", "check-arrow", 718, 450, 960, 450, 1080, green),
    box("check", "check-output", 719, 210, 1110, 480, 130, { stroke: green, strokeWidth: 3, radius: 24, fill: "rgba(70,177,118,.07)" }),
    text("check", "check-output-t", 720, 240, 1145, 420, "整理后的最终回答", { color: green, fontSize: 46, lineHeight: 60, fontWeight: 700, textAlign: "center" }),
    text("check", "check-bottom", 721, 150, 1300, 600, "你看到的是最后整理后的版本。", { color: gray, fontSize: 36, lineHeight: 56, textAlign: "center" }),
    hold("check", "check-hold", 722),
    turn("turn-summary", 723, "summary"),

    text("summary", "summary-title", 800, 80, 110, 740, "核心原理（一句话）", { color: red, fontSize: 58, lineHeight: 72, fontWeight: 700, textAlign: "center" }),
    stroke("summary", "summary-title-line", 801, "M 220 192 Q 450 178 680 192", { color: red, width: 3.5 }),
    box("summary", "summary-core-box", 802, 70, 265, 760, 330, { stroke: red, strokeWidth: 3, radius: 28, fill: "rgba(214,69,53,.035)" }),
    text("summary", "summary-core", 803, 110, 315, 680, "大语言模型不是“理解后直接回答”，\n而是把文本变成可计算的表示，\n再根据上下文一步步预测下一个 Token。", { fontSize: 38, lineHeight: 72, textAlign: "center" }),
    highlight("summary", "summary-core-hi", 804, "summary-core", "一步步预测下一个 Token", yellowHi),
    box("summary", "summary-phenomena-box", 805, 70, 665, 760, 360, { stroke: green, strokeWidth: 3, radius: 28, fill: "rgba(22,132,71,.035)" }),
    text("summary", "summary-phenomena-title", 806, 100, 705, 700, "你看到的现象", { color: green, fontSize: 46, lineHeight: 58, fontWeight: 700 }),
    text("summary", "summary-phenomena", 807, 110, 790, 680, "• 回答像在思考 → 因为它在连续生成\n• 能接上下文 → 因为 Attention 在建关系\n• 有时会出错 → 因为本质是在预测", { fontSize: 34, lineHeight: 72 }),
    highlight("summary", "summary-hi-predict", 808, "summary-phenomena", "本质是在预测", orangeHi),
    text("summary", "summary-flow-label", 809, 120, 1105, 660, "一句输入 → Token 化 → 向量化 → 上下文理解", { color: blue, fontSize: 34, lineHeight: 54, textAlign: "center" }),
    text("summary", "summary-flow-label2", 810, 120, 1175, 660, "→ 逐步预测 → 组织成回答 → 输出给用户", { color: blue, fontSize: 34, lineHeight: 54, textAlign: "center" }),
    stroke("summary", "summary-flow-line", 811, "M 120 1280 Q 450 1264 780 1280", { color: blue, width: 3.2 }),
    text("summary", "summary-last", 812, 150, 1340, 600, "关键不是“会背答案”，而是会继续预测。", { color: ink, fontSize: 38, lineHeight: 58, fontWeight: 650, textAlign: "center" }),
    highlight("summary", "summary-last-hi", 813, "summary-last", "继续预测", yellowHi),
  ],
};
