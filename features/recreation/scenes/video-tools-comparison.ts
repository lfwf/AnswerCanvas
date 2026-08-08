import type { RecreationBox, RecreationMark, RecreationPageTurn, RecreationScene, RecreationStroke, RecreationText, RecreationTextStyle, RecreationViewEffect } from "../recreation-types";

const ink = "#171717";
const blue = "#1754a7";
const green = "#168447";
const orange = "#e96813";
const purple = "#7d49b5";
const yellow = "#e9a91a";
const gray = "#65625d";
const blueHi = "rgba(78,145,225,.27)";
const greenHi = "rgba(70,177,118,.26)";
const orangeHi = "rgba(239,123,35,.24)";
const purpleHi = "rgba(151,99,205,.24)";
const yellowHi = "rgba(246,207,76,.38)";

const text = (pageId: string, id: string, order: number, x: number, y: number, width: number, value: string, style: RecreationTextStyle = {}): RecreationText => ({ id, kind: "text", pageId, order, x, y, width, text: value, style });
const stroke = (pageId: string, id: string, order: number, path: string, style: Omit<RecreationStroke, "id" | "kind" | "order" | "animated" | "pageId" | "path"> = {}): RecreationStroke => ({ id, kind: "stroke", pageId, order, path, ...style, ...(style.handDrawn === false ? {} : { roughness: Math.max(style.roughness ?? 0, 1.45), bowing: Math.max(style.bowing ?? 0, 1.1) }) });
const box = (pageId: string, id: string, order: number, x: number, y: number, width: number, height: number, style: Omit<RecreationBox, "id" | "kind" | "order" | "animated" | "pageId" | "x" | "y" | "width" | "height"> = {}): RecreationBox => ({ id, kind: "box", pageId, order, x, y, width, height, ...style, ...(style.handDrawn === false ? {} : { roughness: Math.max(style.roughness ?? 0, 1.45), bowing: Math.max(style.bowing ?? 0, 1.05) }) });
const mark = (pageId: string, id: string, order: number, targetId: string, match: string, color: string): RecreationMark => ({ id, kind: "mark", pageId, order, targetId, match, mark: "highlight", color, opacity: .94, padding: 2, wobble: 1.2 });
const hold = (pageId: string, id: string, order: number, durationMs = 1100): RecreationViewEffect => ({ id, kind: "view", pageId, order, mode: "restore", durationMs });
const turn = (id: string, order: number, pageId: string): RecreationPageTurn => ({ id, kind: "page", order, pageId, durationMs: 820, transition: "flip" });

function pageTitle(pageId: string, order: number, number: string, title: string) {
  return [
    box(pageId, `${pageId}-no-box`, order, 62, 62, 82, 82, { stroke: blue, strokeWidth: 3, radius: 22, fill: "rgba(255,255,255,.28)" }),
    text(pageId, `${pageId}-no`, order + 1, 62, 72, 82, number, { color: blue, fontSize: 50, lineHeight: 58, fontWeight: 700, textAlign: "center" }),
    text(pageId, `${pageId}-title`, order + 2, 170, 70, 650, title, { color: blue, fontSize: 50, lineHeight: 62, fontWeight: 700 }),
    stroke(pageId, `${pageId}-title-line`, order + 3, "M 172 142 Q 390 132 610 143", { color: blue, width: 3.2 }),
  ];
}

function videoIcon(pageId: string, prefix: string, order: number, x: number, y: number, color: string) {
  return [
    box(pageId, `${prefix}-screen`, order, x, y, 86, 58, { stroke: color, strokeWidth: 3, radius: 9 }),
    stroke(pageId, `${prefix}-play`, order + 1, `M ${x + 34} ${y + 15} L ${x + 34} ${y + 43} L ${x + 60} ${y + 29} Z`, { color, width: 3 }),
    stroke(pageId, `${prefix}-spark`, order + 2, `M ${x + 75} ${y - 13} L ${x + 80} ${y - 28} M ${x + 88} ${y - 6} L ${x + 101} ${y - 16}`, { color, width: 2.4 }),
  ];
}

function starIcon(pageId: string, id: string, order: number, x: number, y: number, color: string) {
  return stroke(pageId, id, order, `M ${x} ${y - 20} L ${x + 7} ${y - 6} L ${x + 23} ${y - 4} L ${x + 11} ${y + 7} L ${x + 15} ${y + 23} L ${x} ${y + 14} L ${x - 15} ${y + 23} L ${x - 11} ${y + 7} L ${x - 23} ${y - 4} L ${x - 7} ${y - 6} Z`, { color, width: 2.8 });
}

export const videoToolsComparisonScene: RecreationScene = {
  id: "video-tools-comparison",
  title: "Kling / Veo / Runway / Hailuo 视频能力对比",
  description: "竖屏分页手写视频：省略评分表，每个核心观点单独一页，重点用颜色、卡片、图标和结论表达。",
  prompt: "把 Kling / Veo / Runway / Hailuo 视频能力对比做成适合小红书竖屏录制的手写视频。不要做评分表。每个编号观点单独一页，先写信息，再画图标和结构，最后补高亮与结论。",
  sourceName: "Kling-Veo-Runway-Hailuo 视频能力对比.png",
  createdAt: "2026-08-08",
  snapshotRevision: "2026-08-08.1",
  width: 900,
  height: 1600,
  paper: { background: "#f7f1e5", pattern: "plain", patternColor: "rgba(102,83,55,.055)", spacing: 38 },
  pages: [
    { id: "cover", title: "封面" },
    { id: "impression", title: "1 一眼印象" },
    { id: "best-for", title: "3 各自更适合什么" },
    { id: "choice", title: "4 选择建议" },
    { id: "summary", title: "5 一句话总结" },
  ],
  elements: [
    text("cover", "cover-kling", 10, 80, 300, 220, "Kling", { color: blue, fontSize: 72, lineHeight: 84, fontWeight: 700, textAlign: "center" }),
    text("cover", "cover-slash1", 11, 295, 300, 45, "/", { color: ink, fontSize: 68, lineHeight: 82, textAlign: "center" }),
    text("cover", "cover-veo", 12, 340, 300, 160, "Veo", { color: green, fontSize: 72, lineHeight: 84, fontWeight: 700, textAlign: "center" }),
    text("cover", "cover-slash2", 13, 500, 300, 45, "/", { color: ink, fontSize: 68, lineHeight: 82, textAlign: "center" }),
    text("cover", "cover-runway", 14, 545, 300, 260, "Runway", { color: orange, fontSize: 70, lineHeight: 84, fontWeight: 700, textAlign: "center" }),
    text("cover", "cover-hailuo", 15, 170, 425, 560, "Hailuo 视频能力对比", { color: purple, fontSize: 62, lineHeight: 76, fontWeight: 700, textAlign: "center" }),
    stroke("cover", "cover-wave", 16, "M 150 535 Q 195 515 240 535 T 330 535 T 420 535 T 510 535 T 600 535 T 690 535", { color: blue, width: 4 }),
    text("cover", "cover-subtitle", 17, 130, 590, 640, "综合体验笔记（非官方，仅作参考）", { color: gray, fontSize: 36, lineHeight: 48, textAlign: "center" }),
    ...videoIcon("cover", "cover-video", 18, 405, 760, blue),
    text("cover", "cover-guide", 21, 130, 920, 640, "一眼印象 → 适合什么 → 怎么选 → 一句话总结", { color: ink, fontSize: 38, lineHeight: 60, textAlign: "center" }),
    mark("cover", "cover-hi-guide", 22, "cover-guide", "怎么选", yellowHi),
    starIcon("cover", "cover-star-a", 23, 245, 1110, yellow),
    starIcon("cover", "cover-star-b", 24, 655, 1110, yellow),
    text("cover", "cover-tip", 25, 180, 1070, 540, "不比参数堆砌，只看创作体验", { color: blue, fontSize: 40, lineHeight: 56, fontWeight: 650, textAlign: "center" }),
    hold("cover", "cover-hold", 26),
    turn("turn-impression", 27, "impression"),

    ...pageTitle("impression", 100, "1", "一眼印象"),
    box("impression", "k-card", 104, 70, 220, 360, 460, { stroke: blue, strokeWidth: 3, radius: 28, fill: "rgba(23,84,167,.035)" }),
    text("impression", "k-name", 105, 95, 245, 310, "Kling ☆", { color: blue, fontSize: 48, lineHeight: 58, fontWeight: 700, textAlign: "center" }),
    text("impression", "k-copy", 106, 105, 340, 290, "• 运动感强\n• 中文友好\n• 效果冲击力好", { fontSize: 34, lineHeight: 66 }),
    ...videoIcon("impression", "k-icon", 107, 255, 565, blue),

    box("impression", "v-card", 111, 470, 220, 360, 460, { stroke: green, strokeWidth: 3, radius: 28, fill: "rgba(22,132,71,.035)" }),
    text("impression", "v-name", 112, 495, 245, 310, "Veo ☆", { color: green, fontSize: 48, lineHeight: 58, fontWeight: 700, textAlign: "center" }),
    text("impression", "v-copy", 113, 505, 340, 290, "• 画面质感强\n• 理解力高\n• 更偏高质量生成", { fontSize: 34, lineHeight: 66 }),
    box("impression", "v-camera", 114, 615, 555, 86, 62, { stroke: green, strokeWidth: 3, radius: 10 }),
    box("impression", "v-lens", 115, 642, 571, 32, 32, { stroke: green, strokeWidth: 3, radius: 16 }),
    stroke("impression", "v-camera-top", 116, "M 635 555 L 646 535 L 673 535 L 682 555", { color: green, width: 3 }),

    box("impression", "r-card", 120, 70, 730, 360, 460, { stroke: orange, strokeWidth: 3, radius: 28, fill: "rgba(233,104,19,.035)" }),
    text("impression", "r-name", 121, 95, 755, 310, "Runway ☆", { color: orange, fontSize: 46, lineHeight: 58, fontWeight: 700, textAlign: "center" }),
    text("impression", "r-copy", 122, 105, 850, 290, "• 工具链成熟\n• 可控性强\n• 创作者常用", { fontSize: 34, lineHeight: 66 }),
    stroke("impression", "r-wrench", 123, "M 245 1065 L 305 1005 M 238 1057 L 210 1085 L 232 1107 L 260 1079 M 304 1005 Q 335 975 360 990 L 335 1015 L 355 1035 Q 326 1053 304 1035", { color: orange, width: 6 }),

    box("impression", "h-card", 127, 470, 730, 360, 460, { stroke: purple, strokeWidth: 3, radius: 28, fill: "rgba(125,73,181,.035)" }),
    text("impression", "h-name", 128, 495, 755, 310, "Hailuo ☆", { color: purple, fontSize: 46, lineHeight: 58, fontWeight: 700, textAlign: "center" }),
    text("impression", "h-copy", 129, 505, 850, 290, "• 上手快\n• 出片直接\n• 适合日常短视频", { fontSize: 34, lineHeight: 66 }),
    ...videoIcon("impression", "h-icon", 130, 610, 1035, purple),
    text("impression", "impression-bottom", 134, 130, 1260, 640, "四个平台的差异，不在“能不能生成”，而在创作体验。", { color: ink, fontSize: 36, lineHeight: 58, textAlign: "center" }),
    mark("impression", "impression-hi", 135, "impression-bottom", "创作体验", yellowHi),
    hold("impression", "impression-hold", 136),
    turn("turn-best", 137, "best-for"),

    ...pageTitle("best-for", 200, "3", "各自更适合什么"),
    box("best-for", "best-k-box", 204, 70, 240, 760, 230, { stroke: blue, strokeWidth: 2.8, radius: 26, fill: "rgba(23,84,167,.035)" }),
    ...videoIcon("best-for", "best-k-icon", 205, 105, 310, blue),
    text("best-for", "best-k-name", 208, 230, 275, 180, "Kling", { color: blue, fontSize: 46, lineHeight: 58, fontWeight: 700 }),
    text("best-for", "best-k-copy", 209, 230, 350, 555, "情绪镜头 · 人物动作 · 冲击力画面", { fontSize: 36, lineHeight: 52 }),
    mark("best-for", "best-k-hi", 210, "best-k-copy", "人物动作", blueHi),

    box("best-for", "best-v-box", 214, 70, 520, 760, 230, { stroke: green, strokeWidth: 2.8, radius: 26, fill: "rgba(22,132,71,.035)" }),
    box("best-for", "best-v-film", 215, 105, 590, 88, 58, { stroke: green, strokeWidth: 3, radius: 5 }),
    stroke("best-for", "best-v-film-cells", 216, "M 128 590 L 128 648 M 170 590 L 170 648 M 105 610 L 193 610 M 105 628 L 193 628", { color: green, width: 2.4 }),
    text("best-for", "best-v-name", 217, 230, 555, 180, "Veo", { color: green, fontSize: 46, lineHeight: 58, fontWeight: 700 }),
    text("best-for", "best-v-copy", 218, 230, 630, 555, "高质感短片 · 广告感 · 电影感镜头", { fontSize: 36, lineHeight: 52 }),
    mark("best-for", "best-v-hi", 219, "best-v-copy", "电影感镜头", greenHi),

    box("best-for", "best-r-box", 223, 70, 800, 760, 230, { stroke: orange, strokeWidth: 2.8, radius: 26, fill: "rgba(233,104,19,.035)" }),
    stroke("best-for", "best-r-scissors", 224, "M 115 870 Q 145 840 165 870 Q 145 895 115 870 M 115 940 Q 145 910 165 940 Q 145 965 115 940 M 160 885 L 205 845 M 160 925 L 205 965", { color: orange, width: 4 }),
    text("best-for", "best-r-name", 225, 230, 835, 210, "Runway", { color: orange, fontSize: 44, lineHeight: 58, fontWeight: 700 }),
    text("best-for", "best-r-copy", 226, 230, 910, 555, "剪辑配合 · 创意实验 · 流程化创作", { fontSize: 36, lineHeight: 52 }),
    mark("best-for", "best-r-hi", 227, "best-r-copy", "流程化创作", orangeHi),

    box("best-for", "best-h-box", 231, 70, 1080, 760, 230, { stroke: purple, strokeWidth: 2.8, radius: 26, fill: "rgba(125,73,181,.035)" }),
    stroke("best-for", "best-h-bolt", 232, "M 155 1145 L 120 1202 L 154 1202 L 133 1250 L 205 1177 L 165 1177 L 190 1145 Z", { color: purple, width: 4 }),
    text("best-for", "best-h-name", 233, 230, 1115, 210, "Hailuo", { color: purple, fontSize: 44, lineHeight: 58, fontWeight: 700 }),
    text("best-for", "best-h-copy", 234, 230, 1190, 555, "快速出片 · 剧情短视频 · 轻量创作", { fontSize: 36, lineHeight: 52 }),
    mark("best-for", "best-h-hi", 235, "best-h-copy", "快速出片", purpleHi),
    text("best-for", "best-footer", 239, 160, 1380, 580, "先想清楚你要做什么，再选工具。", { color: blue, fontSize: 42, lineHeight: 58, fontWeight: 650, textAlign: "center" }),
    hold("best-for", "best-for-hold", 240),
    turn("turn-choice", 241, "choice"),

    ...pageTitle("choice", 300, "4", "选择建议"),
    box("choice", "choice-1-box", 304, 70, 245, 760, 220, { stroke: green, strokeWidth: 2.8, radius: 26, fill: "rgba(22,132,71,.035)" }),
    text("choice", "choice-1-q", 305, 105, 300, 455, "想要画质上限", { fontSize: 42, lineHeight: 58, fontWeight: 620 }),
    stroke("choice", "choice-1-arrow", 306, "M 570 350 L 655 350 M 655 350 L 632 328 M 655 350 L 632 372", { color: ink, width: 4 }),
    text("choice", "choice-1-a", 307, 665, 310, 140, "Veo", { color: green, fontSize: 52, lineHeight: 64, fontWeight: 700, textAlign: "center" }),
    stroke("choice", "choice-1-line", 308, "M 675 382 Q 730 372 785 382", { color: green, width: 3.2 }),

    box("choice", "choice-2-box", 312, 70, 510, 760, 220, { stroke: blue, strokeWidth: 2.8, radius: 26, fill: "rgba(23,84,167,.035)" }),
    text("choice", "choice-2-q", 313, 105, 555, 455, "运动表现 / 中文体验", { fontSize: 40, lineHeight: 58, fontWeight: 620 }),
    stroke("choice", "choice-2-arrow", 314, "M 570 615 L 655 615 M 655 615 L 632 593 M 655 615 L 632 637", { color: ink, width: 4 }),
    text("choice", "choice-2-a", 315, 655, 575, 160, "Kling", { color: blue, fontSize: 50, lineHeight: 64, fontWeight: 700, textAlign: "center" }),
    stroke("choice", "choice-2-line", 316, "M 665 647 Q 730 637 795 647", { color: blue, width: 3.2 }),

    box("choice", "choice-3-box", 320, 70, 775, 760, 220, { stroke: orange, strokeWidth: 2.8, radius: 26, fill: "rgba(233,104,19,.035)" }),
    text("choice", "choice-3-q", 321, 105, 820, 455, "工具链 / 创作者工作流", { fontSize: 38, lineHeight: 58, fontWeight: 620 }),
    stroke("choice", "choice-3-arrow", 322, "M 570 880 L 655 880 M 655 880 L 632 858 M 655 880 L 632 902", { color: ink, width: 4 }),
    text("choice", "choice-3-a", 323, 645, 840, 180, "Runway", { color: orange, fontSize: 46, lineHeight: 64, fontWeight: 700, textAlign: "center" }),
    stroke("choice", "choice-3-line", 324, "M 660 912 Q 735 902 810 912", { color: orange, width: 3.2 }),

    box("choice", "choice-4-box", 328, 70, 1040, 760, 220, { stroke: purple, strokeWidth: 2.8, radius: 26, fill: "rgba(125,73,181,.035)" }),
    text("choice", "choice-4-q", 329, 105, 1085, 455, "快、直接、容易上手", { fontSize: 40, lineHeight: 58, fontWeight: 620 }),
    stroke("choice", "choice-4-arrow", 330, "M 570 1145 L 655 1145 M 655 1145 L 632 1123 M 655 1145 L 632 1167", { color: ink, width: 4 }),
    text("choice", "choice-4-a", 331, 645, 1105, 180, "Hailuo", { color: purple, fontSize: 46, lineHeight: 64, fontWeight: 700, textAlign: "center" }),
    stroke("choice", "choice-4-line", 332, "M 660 1177 Q 735 1167 810 1177", { color: purple, width: 3.2 }),
    box("choice", "choice-footer-box", 336, 130, 1340, 640, 135, { stroke: yellow, strokeWidth: 2.8, radius: 26, fill: "rgba(246,207,76,.12)" }),
    text("choice", "choice-footer", 337, 150, 1375, 600, "不是选“最强”，而是选最适合你的创作目标。", { color: ink, fontSize: 36, lineHeight: 52, textAlign: "center" }),
    mark("choice", "choice-footer-hi", 338, "choice-footer", "创作目标", yellowHi),
    hold("choice", "choice-hold", 339),
    turn("turn-summary", 340, "summary"),

    ...pageTitle("summary", 400, "5", "一句话总结"),
    box("summary", "summary-quote-box", 404, 70, 240, 760, 290, { stroke: yellow, strokeWidth: 3.2, radius: 30, fill: "rgba(246,207,76,.10)" }),
    text("summary", "summary-quote", 405, 105, 285, 690, "没有谁是绝对最强，\n关键看你更在意：\n画质、运动、可控性，还是出片效率。", { color: ink, fontSize: 40, lineHeight: 72, fontWeight: 620, textAlign: "center" }),
    mark("summary", "summary-hi-quality", 406, "summary-quote", "画质", greenHi),
    mark("summary", "summary-hi-motion", 407, "summary-quote", "运动", blueHi),
    mark("summary", "summary-hi-control", 408, "summary-quote", "可控性", orangeHi),
    mark("summary", "summary-hi-speed", 409, "summary-quote", "出片效率", purpleHi),

    box("summary", "quality-box", 413, 80, 620, 740, 210, { stroke: green, strokeWidth: 2.5, radius: 24, fill: "rgba(22,132,71,.035)" }),
    text("summary", "quality-label", 414, 110, 655, 180, "画质倾向", { color: green, fontSize: 40, lineHeight: 54, fontWeight: 700 }),
    text("summary", "quality-rank", 415, 275, 655, 500, "Veo  >  Kling  ≈  Runway  >  Hailuo", { fontSize: 35, lineHeight: 54, textAlign: "center" }),
    mark("summary", "quality-veo-hi", 416, "quality-rank", "Veo", greenHi),

    box("summary", "speed-box", 420, 80, 875, 740, 210, { stroke: purple, strokeWidth: 2.5, radius: 24, fill: "rgba(125,73,181,.035)" }),
    text("summary", "speed-label", 421, 110, 910, 230, "速度 / 易用性", { color: purple, fontSize: 38, lineHeight: 54, fontWeight: 700 }),
    text("summary", "speed-rank", 422, 320, 910, 455, "Hailuo  ≈  Kling  >  Runway  >  Veo", { fontSize: 35, lineHeight: 54, textAlign: "center" }),
    mark("summary", "speed-hailuo-hi", 423, "speed-rank", "Hailuo", purpleHi),

    box("summary", "overall-box", 427, 80, 1130, 740, 210, { stroke: blue, strokeWidth: 2.5, radius: 24, fill: "rgba(23,84,167,.035)" }),
    text("summary", "overall-label", 428, 110, 1165, 210, "综合创作", { color: blue, fontSize: 40, lineHeight: 54, fontWeight: 700 }),
    text("summary", "overall-copy", 429, 310, 1165, 430, "各有优势", { color: ink, fontSize: 48, lineHeight: 60, fontWeight: 700, textAlign: "center" }),
    mark("summary", "overall-hi", 430, "overall-copy", "各有优势", yellowHi),
    starIcon("summary", "summary-star-left", 431, 255, 1430, yellow),
    starIcon("summary", "summary-star-right", 432, 645, 1430, yellow),
    text("summary", "summary-end", 433, 250, 1390, 400, "按目标选工具，比追“最强”更重要。", { color: blue, fontSize: 35, lineHeight: 52, fontWeight: 650, textAlign: "center" }),
    hold("summary", "summary-hold", 434, 1300),
  ],
};
