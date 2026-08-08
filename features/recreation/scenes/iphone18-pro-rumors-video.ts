import type { RecreationBox, RecreationMark, RecreationPageTurn, RecreationScene, RecreationStroke, RecreationText, RecreationTextStyle, RecreationViewEffect } from "../recreation-types";

const ink = "#171717";
const blue = "#1754a7";
const orange = "#ef640b";
const green = "#158a4e";
const purple = "#7e48b5";
const red = "#d64535";
const gray = "#66645f";
const yellowHighlight = "rgba(246,207,76,.42)";
const blueHighlight = "rgba(86,150,226,.30)";
const greenHighlight = "rgba(70,177,118,.28)";
const purpleHighlight = "rgba(157,103,207,.25)";
const sceneFontScale = 1.1;
const sceneLineScale = 1.04;

const text = (pageId: string, id: string, order: number, x: number, y: number, width: number, value: string, style: RecreationTextStyle = {}): RecreationText => ({
  id,
  kind: "text",
  pageId,
  order,
  x,
  y,
  width,
  text: value,
  style: {
    ...style,
    ...(style.fontSize ? { fontSize: Math.round(style.fontSize * sceneFontScale) } : {}),
    ...(style.lineHeight ? { lineHeight: Math.round(style.lineHeight * sceneLineScale) } : {}),
  },
});
const stroke = (pageId: string, id: string, order: number, path: string, style: Omit<RecreationStroke, "id" | "kind" | "order" | "animated" | "pageId" | "path"> = {}): RecreationStroke => {
  const handDrawn = style.handDrawn !== false;
  return { id, kind: "stroke", pageId, order, path, ...style, ...(handDrawn ? { roughness: Math.max(style.roughness ?? 0, 1.35), bowing: Math.max(style.bowing ?? 0, 1.05) } : {}) };
};
const box = (pageId: string, id: string, order: number, x: number, y: number, width: number, height: number, style: Omit<RecreationBox, "id" | "kind" | "order" | "animated" | "pageId" | "x" | "y" | "width" | "height"> = {}): RecreationBox => {
  const handDrawn = style.handDrawn !== false;
  return { id, kind: "box", pageId, order, x, y, width, height, ...style, ...(handDrawn ? { roughness: Math.max(style.roughness ?? 0, 1.4), bowing: Math.max(style.bowing ?? 0, 1) } : {}) };
};
const highlight = (pageId: string, id: string, order: number, targetId: string, match: string, color = yellowHighlight): RecreationMark => ({ id, kind: "mark", pageId, order, targetId, match, mark: "highlight", color, opacity: .95, padding: 2, wobble: 1.1 });
const hold = (pageId: string, id: string, order: number, durationMs = 1000): RecreationViewEffect => ({ id, kind: "view", pageId, order, mode: "restore", durationMs });
const turn = (id: string, order: number, pageId: string, durationMs = 760): RecreationPageTurn => ({ id, kind: "page", order, pageId, durationMs, transition: "slide" });
const tickText = (pageId: string, id: string, order: number, centerX: number, y: number, value: string) => text(pageId, id, order, centerX - 66, y, 132, value, { fontSize: 24, lineHeight: 34, textAlign: "center" });

function scribblePath(x: number, y: number, width: number, height: number) {
  const columns = Math.max(2, Math.ceil(width / 3.2) + 1);
  const gap = width / (columns - 1);
  const top = y + 3;
  const bottom = y + height - 3;
  const parts = [`M ${x} ${bottom}`];
  for (let column = 0; column < columns; column += 1) {
    const xx = x + column * gap;
    const edgeWobble = Math.sin(column * 1.73) * 1.15;
    const yy = column % 2 === 0 ? top + edgeWobble : bottom - edgeWobble;
    parts.push(`L ${xx} ${yy}`);
    if (column < columns - 1) parts.push(`L ${xx + gap} ${yy}`);
  }
  return parts.join(" ");
}

function pageTitle(pageId: string, order: number, number: string, title: string, color: string) {
  return [
    box(pageId, `${pageId}-number-box`, order, 66, 64, 78, 78, { stroke: color, strokeWidth: 3, radius: 22, roughness: 1.05, fill: "rgba(255,255,255,.34)" }),
    text(pageId, `${pageId}-number`, order + 1, 66, 72, 78, number, { color, fontSize: 50, lineHeight: 60, fontWeight: 700, textAlign: "center" }),
    text(pageId, `${pageId}-title`, order + 2, 166, 72, 650, title, { color, fontSize: 50, lineHeight: 62, fontWeight: 620 }),
  ];
}

export const iphone18ProRumorsVideoScene: RecreationScene = {
  id: "iphone18-pro-rumors-video",
  title: "iPhone 18 Pro 爆料参数 · 分页视频版",
  description: "专为竖屏录屏设计：7 个参数模块逐页手写，每页按信息逻辑依次写字、画图、标刻度、填色和标注。",
  prompt: "把这张 iPhone 18 Pro 爆料参数笔记做成适合小红书竖屏录制的手写视频。7 个模块必须分开逐页演示，每页内容放大，所有图表和图标按人的真实书写/绘制逻辑依次完成。",
  sourceName: "iPhone 18 Pro 爆料参数笔记.png",
  createdAt: "2026-08-07",
  snapshotRevision: "2026-08-08.5",
  width: 900,
  height: 1600,
  paper: { background: "#fbfaf6", pattern: "ruled", patternColor: "rgba(78,102,126,.12)", spacing: 48, patternOffset: 44, patternThickness: 1 },
  pages: [
    { id: "cover", title: "封面" },
    { id: "chip-ai", title: "1 芯片 / AI" },
    { id: "memory", title: "2 内存" },
    { id: "display", title: "3 屏幕" },
    { id: "camera", title: "4 影像" },
    { id: "battery", title: "5 续航" },
    { id: "connectivity", title: "6 通信" },
    { id: "appearance", title: "7 外观" },
    { id: "summary", title: "核心数字速看" },
  ],
  elements: [
    text("cover", "cover-title", 10, 70, 330, 760, "iPhone 18 Pro\n爆料参数笔记", { color: ink, fontSize: 72, lineHeight: 100, fontWeight: 650, textAlign: "center", characterJitter: .55 }),
    stroke("cover", "cover-underline", 11, "M 150 555 Q 455 538 755 552", { color: blue, width: 4, roughness: 1.1, bowing: 1.3 }),
    text("cover", "cover-rumor", 12, 140, 610, 620, "Rumors / 非官方，仅供参考", { color: gray, fontSize: 34, lineHeight: 44, textAlign: "center" }),
    text("cover", "cover-guide", 13, 130, 815, 640, "芯片 / 内存 / 屏幕 / 影像\n续航 / 通信 / 外观", { color: blue, fontSize: 36, lineHeight: 72, textAlign: "center" }),
    hold("cover", "cover-hold", 14),
    turn("turn-chip", 15, "chip-ai"),

    ...pageTitle("chip-ai", 100, "1", "芯片 / AI", blue),
    text("chip-ai", "chip-bullets", 103, 86, 210, 720, "• A20 Pro（传闻）\n• 2nm 工艺\n• 性能：约 +15%\n• 功耗：约 -30%\n• 端侧 AI 更强", { fontSize: 37, lineHeight: 72 }),
    highlight("chip-ai", "chip-hi-2nm", 103.1, "chip-bullets", "2nm 工艺"),
    highlight("chip-ai", "chip-hi-perf", 103.2, "chip-bullets", "+15%", blueHighlight),
    highlight("chip-ai", "chip-hi-power", 103.3, "chip-bullets", "-30%", greenHighlight),
    highlight("chip-ai", "chip-hi-ai", 103.4, "chip-bullets", "端侧 AI 更强", yellowHighlight),
    text("chip-ai", "perf-label", 104, 86, 660, 220, "性能提升", { fontSize: 34, lineHeight: 44 }),
    box("chip-ai", "perf-bar-frame", 105, 270, 670, 430, 74, { stroke: ink, strokeWidth: 2.2, radius: 3, roughness: .7 }),
    stroke("chip-ai", "perf-axis", 106, "M 270 780 L 700 780 M 270 765 L 270 795 M 485 765 L 485 795 M 700 765 L 700 795", { color: ink, width: 2.1, roughness: .55 }),
    tickText("chip-ai", "perf-tick-left", 107, 270, 808, "-20%"),
    tickText("chip-ai", "perf-tick-mid", 107.1, 485, 808, "0"),
    tickText("chip-ai", "perf-tick-right", 107.2, 700, 808, "+20%"),
    stroke("chip-ai", "perf-fill", 108, scribblePath(275, 679, 320, 55), { color: blue, width: 7.2, opacity: .88, handDrawn: false }),
    text("chip-ai", "perf-value", 109, 715, 680, 130, "+15%", { color: blue, fontSize: 38, lineHeight: 48, fontWeight: 620 }),
    text("chip-ai", "power-label", 110, 86, 925, 220, "功耗降低", { fontSize: 34, lineHeight: 44 }),
    box("chip-ai", "power-bar-frame", 111, 270, 935, 430, 74, { stroke: ink, strokeWidth: 2.2, radius: 3, roughness: .7 }),
    stroke("chip-ai", "power-axis", 112, "M 270 1045 L 700 1045 M 270 1030 L 270 1060 M 485 1030 L 485 1060 M 700 1030 L 700 1060", { color: ink, width: 2.1, roughness: .55 }),
    tickText("chip-ai", "power-tick-left", 113, 270, 1074, "-40%"),
    tickText("chip-ai", "power-tick-mid", 113.1, 485, 1074, "-20%"),
    tickText("chip-ai", "power-tick-right", 113.2, 700, 1074, "0"),
    stroke("chip-ai", "power-fill", 114, scribblePath(275, 944, 250, 55), { color: green, width: 7.2, opacity: .88, handDrawn: false }),
    text("chip-ai", "power-value", 115, 715, 945, 130, "-30%", { color: green, fontSize: 38, lineHeight: 48, fontWeight: 620 }),
    text("chip-ai", "chip-fast", 116, 120, 1265, 170, "更快", { color: blue, fontSize: 42, lineHeight: 54, fontWeight: 650, textAlign: "center" }),
    text("chip-ai", "chip-efficient", 116.1, 340, 1265, 190, "更省电", { color: green, fontSize: 42, lineHeight: 54, fontWeight: 650, textAlign: "center" }),
    text("chip-ai", "chip-ai-takeaway", 116.2, 565, 1265, 240, "端侧 AI 更强", { color: orange, fontSize: 38, lineHeight: 54, fontWeight: 650, textAlign: "center" }),
    hold("chip-ai", "chip-hold", 117),
    turn("turn-memory", 118, "memory"),

    ...pageTitle("memory", 200, "2", "内存", orange),
    text("memory", "memory-bullets", 203, 92, 245, 710, "• 12GB RAM（传闻）\n• 多任务 / AI 更从容", { fontSize: 42, lineHeight: 84 }),
    highlight("memory", "memory-hi-12gb", 203.1, "memory-bullets", "12GB RAM"),
    box("memory", "memory-panel", 205, 90, 650, 720, 330, { stroke: orange, strokeWidth: 2.2, dash: "12 10", radius: 28, roughness: .8, fill: "rgba(239,100,11,.035)" }),
    box("memory", "memory-8-box", 206, 155, 755, 210, 120, { stroke: orange, strokeWidth: 2.8, radius: 22, roughness: 1 }),
    text("memory", "memory-8", 207, 155, 778, 210, "8GB", { fontSize: 52, lineHeight: 64, textAlign: "center" }),
    stroke("memory", "memory-arrow", 208, "M 405 815 L 535 815 M 535 815 L 510 792 M 535 815 L 510 838", { color: orange, width: 4, roughness: 1 }),
    box("memory", "memory-12-box", 209, 575, 755, 210, 120, { stroke: orange, strokeWidth: 2.8, radius: 22, roughness: 1 }),
    text("memory", "memory-12", 210, 575, 778, 210, "12GB", { fontSize: 52, lineHeight: 64, textAlign: "center" }),
    box("memory", "memory-bottom-box", 210.5, 165, 1040, 570, 210, { stroke: orange, strokeWidth: 2, radius: 26, roughness: .7, fill: "rgba(239,100,11,.055)" }),
    text("memory", "memory-bottom", 211, 150, 1080, 600, "多任务切换更轻松\n本地 AI 更有余量", { color: orange, fontSize: 38, lineHeight: 72, textAlign: "center" }),
    hold("memory", "memory-hold", 212),
    turn("turn-display", 213, "display"),

    ...pageTitle("display", 300, "3", "屏幕", green),
    text("display", "display-bullets", 303, 86, 225, 500, "• 6.3 英寸 Pro\n• 6.9 英寸 Pro Max\n• LTPO OLED\n• 120Hz ProMotion\n• 灵动岛或更小", { fontSize: 38, lineHeight: 72 }),
    highlight("display", "display-hi-63", 303.1, "display-bullets", "6.3 英寸 Pro", blueHighlight),
    highlight("display", "display-hi-69", 303.2, "display-bullets", "6.9 英寸 Pro Max", greenHighlight),
    highlight("display", "display-hi-120", 303.3, "display-bullets", "120Hz ProMotion", yellowHighlight),
    box("display", "phone-outline", 304, 540, 300, 270, 600, { stroke: ink, strokeWidth: 3, radius: 58, roughness: .85 }),
    box("display", "phone-island", 305, 615, 330, 120, 28, { stroke: ink, fill: ink, strokeWidth: 1, radius: 15, roughness: .4 }),
    stroke("display", "screen-diagonal", 306, "M 585 815 L 760 405 M 760 405 L 748 430 M 760 405 L 735 413 M 585 815 L 596 789 M 585 815 L 608 805", { color: ink, width: 2.4, roughness: .65 }),
    text("display", "screen-69", 307, 570, 490, 150, "6.9”", { fontSize: 50, lineHeight: 60 }),
    text("display", "screen-63", 308, 670, 735, 150, "6.3”", { fontSize: 50, lineHeight: 60 }),
    box("display", "display-recap-box", 308.5, 105, 1035, 690, 230, { stroke: green, strokeWidth: 2.2, radius: 26, roughness: .75, fill: "rgba(21,138,78,.055)" }),
    text("display", "display-recap", 309, 120, 1080, 660, "Pro 6.3”  ·  Pro Max 6.9”\n120Hz ProMotion", { color: green, fontSize: 40, lineHeight: 72, fontWeight: 620, textAlign: "center" }),
    hold("display", "display-hold", 310),
    turn("turn-camera", 311, "camera"),

    ...pageTitle("camera", 400, "4", "影像", purple),
    text("camera", "camera-bullets", 403, 86, 220, 730, "• 前摄：24MP（传闻）\n• 主摄：可变光圈（高关注）\n• 夜景 / 人像 / 视频更强\n• 算法虚化 → 光学 + AI", { fontSize: 37, lineHeight: 74 }),
    highlight("camera", "camera-hi-24mp", 403.1, "camera-bullets", "24MP", purpleHighlight),
    highlight("camera", "camera-hi-aperture", 403.2, "camera-bullets", "可变光圈", yellowHighlight),
    highlight("camera", "camera-hi-ai", 403.3, "camera-bullets", "光学 + AI", blueHighlight),
    text("camera", "before-label", 404, 105, 610, 300, "Before（算法虚化）", { fontSize: 31, lineHeight: 40 }),
    box("camera", "before-frame", 405, 90, 680, 310, 330, { stroke: ink, strokeWidth: 2.2, radius: 8, roughness: .8 }),
    stroke("camera", "before-face", 406, "M 185 790 Q 245 735 305 790 Q 315 875 245 920 Q 175 875 185 790 M 205 805 Q 245 770 285 805 M 217 850 L 226 850 M 263 850 L 272 850 M 226 884 Q 245 896 265 884", { color: ink, width: 2.3, roughness: 1 }),
    stroke("camera", "before-blur", 407, "M 110 740 L 168 740 M 320 760 L 380 760 M 110 940 L 175 940 M 320 915 L 382 915", { color: gray, width: 3, dash: "9 8", roughness: 1.1 }),
    stroke("camera", "camera-arrow", 408, "M 430 845 L 520 845 M 520 845 L 493 821 M 520 845 L 493 869", { color: purple, width: 5, roughness: 1 }),
    text("camera", "after-label", 409, 535, 610, 300, "After（光学 + AI）", { fontSize: 31, lineHeight: 40 }),
    box("camera", "after-frame", 410, 520, 680, 310, 330, { stroke: ink, strokeWidth: 2.2, radius: 8, roughness: .8 }),
    stroke("camera", "after-face", 411, "M 615 790 Q 675 735 735 790 Q 745 875 675 920 Q 605 875 615 790 M 635 805 Q 675 770 715 805 M 647 850 L 656 850 M 693 850 L 702 850 M 656 884 Q 675 900 695 884", { color: ink, width: 2.3, roughness: 1 }),
    stroke("camera", "sparkles", 412, "M 560 745 L 570 745 M 565 740 L 565 750 M 770 760 L 788 760 M 779 751 L 779 769 M 755 900 L 770 900 M 763 892 L 763 908", { color: purple, width: 3, roughness: .7 }),
    box("camera", "camera-bottom-box", 412.5, 130, 1080, 640, 170, { stroke: purple, strokeWidth: 2, radius: 28, roughness: .75, fill: "rgba(126,72,181,.055)" }),
    text("camera", "camera-bottom", 413, 120, 1125, 660, "光学能力 × AI 算法", { color: purple, fontSize: 44, lineHeight: 58, fontWeight: 620, textAlign: "center" }),
    hold("camera", "camera-hold", 414),
    turn("turn-battery", 415, "battery"),

    ...pageTitle("battery", 500, "5", "续航", blue),
    text("battery", "battery-bullets", 503, 86, 220, 720, "• 更大电池（传闻）\n• 续航：预计 +10%～+15%\n• 重度使用更稳\n• 轻度使用更久", { fontSize: 39, lineHeight: 78 }),
    highlight("battery", "battery-hi-range", 503.1, "battery-bullets", "+10%～+15%", greenHighlight),
    box("battery", "battery-outline", 504, 95, 640, 360, 185, { stroke: ink, strokeWidth: 3, radius: 18, roughness: .9 }),
    box("battery", "battery-tip", 505, 455, 700, 32, 65, { stroke: ink, strokeWidth: 2.4, radius: 5, roughness: .7 }),
    box("battery", "cell-1", 506, 120, 680, 62, 105, { stroke: green, strokeWidth: 2, fill: "rgba(21,138,78,.28)", radius: 5, roughness: .6 }),
    box("battery", "cell-2", 507, 198, 680, 62, 105, { stroke: green, strokeWidth: 2, fill: "rgba(21,138,78,.28)", radius: 5, roughness: .6 }),
    box("battery", "cell-3", 508, 276, 680, 62, 105, { stroke: green, strokeWidth: 2, fill: "rgba(21,138,78,.28)", radius: 5, roughness: .6 }),
    box("battery", "cell-4", 509, 354, 680, 62, 105, { stroke: green, strokeWidth: 2, fill: "rgba(21,138,78,.28)", radius: 5, roughness: .6 }),
    text("battery", "battery-word", 510, 505, 704, 190, "续航 ↑", { fontSize: 40, lineHeight: 50 }),
    stroke("battery", "battery-chart-axes", 511, "M 190 1160 L 190 915 M 190 1160 L 745 1160", { color: ink, width: 2.6, roughness: .6 }),
    text("battery", "battery-baseline", 512, 200, 1080, 170, "基准", { fontSize: 30, lineHeight: 38 }),
    text("battery", "battery-left-label", 513, 120, 1190, 270, "iPhone 17 Pro", { fontSize: 26, lineHeight: 34 }),
    text("battery", "battery-right-label", 514, 570, 1190, 260, "iPhone 18 Pro\n（传闻）", { fontSize: 26, lineHeight: 36, textAlign: "center" }),
    stroke("battery", "battery-trend", 515, "M 285 1085 Q 430 1035 635 930", { color: green, width: 4, roughness: 1.1 }),
    box("battery", "battery-dot-a", 516, 274, 1074, 18, 18, { stroke: green, fill: green, strokeWidth: 1, radius: 9, roughness: .4 }),
    box("battery", "battery-dot-b", 517, 626, 920, 18, 18, { stroke: green, fill: green, strokeWidth: 1, radius: 9, roughness: .4 }),
    text("battery", "battery-value", 518, 550, 835, 275, "+10%～+15%", { color: green, fontSize: 38, lineHeight: 48 }),
    box("battery", "battery-takeaway-box", 518.4, 130, 1330, 640, 130, { stroke: green, strokeWidth: 2, radius: 24, roughness: .7, fill: "rgba(21,138,78,.05)" }),
    text("battery", "battery-takeaway", 518.5, 130, 1365, 640, "重度更稳 · 轻度更久", { color: green, fontSize: 36, lineHeight: 48, fontWeight: 620, textAlign: "center" }),
    hold("battery", "battery-hold", 519),
    turn("turn-connectivity", 520, "connectivity"),

    ...pageTitle("connectivity", 600, "6", "通信", orange),
    text("connectivity", "connectivity-bullets", 603, 86, 230, 700, "• C2 基带（传闻）\n• Wi-Fi 7\n• 延迟更低\n• 连接更稳", { fontSize: 42, lineHeight: 88 }),
    highlight("connectivity", "connectivity-hi-c2", 603.05, "connectivity-bullets", "C2 基带", yellowHighlight),
    highlight("connectivity", "connectivity-hi-wifi", 603.1, "connectivity-bullets", "Wi-Fi 7", blueHighlight),
    text("connectivity", "signal-heading", 604, 100, 660, 320, "5G 信号", { fontSize: 38, lineHeight: 48 }),
    box("connectivity", "sig1", 605, 450, 735, 42, 70, { stroke: ink, fill: ink, strokeWidth: 1, radius: 4, roughness: .5 }),
    box("connectivity", "sig2", 606, 515, 685, 42, 120, { stroke: ink, fill: ink, strokeWidth: 1, radius: 4, roughness: .5 }),
    box("connectivity", "sig3", 607, 580, 625, 42, 180, { stroke: ink, fill: ink, strokeWidth: 1, radius: 4, roughness: .5 }),
    box("connectivity", "sig4", 608, 645, 555, 42, 250, { stroke: ink, fill: ink, strokeWidth: 1, radius: 4, roughness: .5 }),
    text("connectivity", "signal-result", 609, 390, 845, 360, "5G 信号更稳", { fontSize: 42, lineHeight: 52, textAlign: "center" }),
    text("connectivity", "wifi-heading", 610, 100, 1030, 320, "Wi-Fi 7", { color: orange, fontSize: 42, lineHeight: 52 }),
    box("connectivity", "wifi-dot", 611, 555, 1265, 24, 24, { stroke: blue, fill: blue, strokeWidth: 1, radius: 12, roughness: .4 }),
    stroke("connectivity", "wifi-arc-1", 612, "M 510 1245 Q 567 1195 624 1245", { color: blue, width: 7, roughness: .8 }),
    stroke("connectivity", "wifi-arc-2", 613, "M 465 1195 Q 567 1105 669 1195", { color: blue, width: 7, roughness: .8 }),
    stroke("connectivity", "wifi-arc-3", 614, "M 415 1140 Q 567 1005 719 1140", { color: blue, width: 7, roughness: .8 }),
    text("connectivity", "wifi-result", 615, 420, 1320, 300, "Wi-Fi 7", { fontSize: 44, lineHeight: 54, textAlign: "center" }),
    text("connectivity", "connectivity-takeaway", 615.5, 120, 1440, 660, "更低延迟 · 更稳连接", { color: gray, fontSize: 31, lineHeight: 42, textAlign: "center" }),
    hold("connectivity", "connectivity-hold", 616),
    turn("turn-appearance", 617, "appearance"),

    ...pageTitle("appearance", 700, "7", "外观", purple),
    text("appearance", "appearance-bullets", 703, 86, 220, 710, "• 新配色（传闻）\n• 机身更精致\n• 屏占比更高\n• Face ID 组件可能更隐藏", { fontSize: 40, lineHeight: 82 }),
    highlight("appearance", "appearance-hi-faceid", 703.1, "appearance-bullets", "Face ID", purpleHighlight),
    text("appearance", "swatch-heading", 704, 100, 590, 700, "传闻配色", { color: purple, fontSize: 40, lineHeight: 50, textAlign: "center" }),
    box("appearance", "swatch-black", 705, 105, 725, 180, 180, { stroke: ink, fill: "#444441", strokeWidth: 2, radius: 24, roughness: .8 }),
    text("appearance", "swatch-black-label", 706, 105, 925, 180, "曜石黑", { fontSize: 31, textAlign: "center" }),
    box("appearance", "swatch-white", 707, 360, 725, 180, 180, { stroke: "#595a5c", fill: "#ffffff", strokeWidth: 3, radius: 24, roughness: 1.15, bowing: 1.1 }),
    box("appearance", "swatch-white-inner", 707.2, 372, 737, 156, 156, { stroke: "#d2d5d9", fill: "none", strokeWidth: 1.6, radius: 18, roughness: .7, bowing: .7 }),
    text("appearance", "swatch-white-label", 708, 360, 925, 180, "星光白", { fontSize: 31, textAlign: "center" }),
    box("appearance", "swatch-blue", 709, 615, 725, 180, 180, { stroke: blue, fill: "#345d86", strokeWidth: 2, radius: 24, roughness: .8 }),
    text("appearance", "swatch-blue-label", 710, 615, 925, 180, "深空蓝", { fontSize: 31, textAlign: "center" }),
    box("appearance", "swatch-gray", 711, 105, 1040, 180, 180, { stroke: gray, fill: "#cbc8be", strokeWidth: 2, radius: 24, roughness: .8 }),
    text("appearance", "swatch-gray-label", 712, 105, 1240, 180, "钛灰", { fontSize: 31, textAlign: "center" }),
    box("appearance", "swatch-green", 713, 360, 1040, 180, 180, { stroke: green, fill: "#a5b89b", strokeWidth: 2, radius: 24, roughness: .8 }),
    text("appearance", "swatch-green-label", 714, 360, 1240, 180, "雾绿", { fontSize: 31, textAlign: "center" }),
    box("appearance", "swatch-rose", 715, 615, 1040, 180, 180, { stroke: red, fill: "#e9a193", strokeWidth: 2, radius: 24, roughness: .8 }),
    text("appearance", "swatch-rose-label", 716, 615, 1240, 180, "玫瑰金", { fontSize: 31, textAlign: "center" }),
    box("appearance", "appearance-takeaway-box", 716.4, 110, 1360, 680, 125, { stroke: purple, strokeWidth: 2, radius: 24, roughness: .7, fill: "rgba(126,72,181,.05)" }),
    text("appearance", "appearance-takeaway", 716.5, 120, 1394, 660, "新配色 · 更高屏占比 · Face ID 更隐藏", { color: purple, fontSize: 30, lineHeight: 42, textAlign: "center" }),
    hold("appearance", "appearance-hold", 717),
    turn("turn-summary", 718, "summary"),

    text("summary", "summary-title", 800, 90, 110, 720, "☆ 6 个核心数字 ☆", { color: blue, fontSize: 55, lineHeight: 68, fontWeight: 620, textAlign: "center" }),
    box("summary", "sum-card-1", 801, 90, 280, 330, 220, { stroke: blue, strokeWidth: 2.4, dash: "10 8", radius: 20, roughness: .7, fill: "rgba(86,150,226,.045)" }),
    text("summary", "sum-1", 802, 90, 325, 330, "2nm", { color: blue, fontSize: 62, textAlign: "center" }),
    text("summary", "sum-1-caption", 803, 90, 415, 330, "芯片工艺", { fontSize: 30, textAlign: "center" }),
    box("summary", "sum-card-2", 804, 480, 280, 330, 220, { stroke: green, strokeWidth: 2.4, dash: "10 8", radius: 20, roughness: .7, fill: "rgba(70,177,118,.045)" }),
    text("summary", "sum-2", 805, 480, 325, 330, "12GB", { color: green, fontSize: 62, textAlign: "center" }),
    text("summary", "sum-2-caption", 806, 480, 415, 330, "内存", { fontSize: 30, textAlign: "center" }),
    box("summary", "sum-card-3", 807, 90, 560, 330, 220, { stroke: purple, strokeWidth: 2.4, dash: "10 8", radius: 20, roughness: .7, fill: "rgba(157,103,207,.04)" }),
    text("summary", "sum-3", 808, 90, 605, 330, "24MP", { color: purple, fontSize: 60, textAlign: "center" }),
    text("summary", "sum-3-caption", 809, 90, 695, 330, "前置影像", { fontSize: 30, textAlign: "center" }),
    box("summary", "sum-card-4", 810, 480, 560, 330, 220, { stroke: blue, strokeWidth: 2.4, dash: "10 8", radius: 20, roughness: .7, fill: "rgba(86,150,226,.04)" }),
    text("summary", "sum-4", 811, 480, 605, 330, "6.3” / 6.9”", { color: blue, fontSize: 49, textAlign: "center" }),
    text("summary", "sum-4-caption", 812, 480, 695, 330, "屏幕尺寸", { fontSize: 30, textAlign: "center" }),
    box("summary", "sum-card-5", 813, 90, 840, 330, 220, { stroke: orange, strokeWidth: 2.4, dash: "10 8", radius: 20, roughness: .7, fill: "rgba(239,100,11,.04)" }),
    text("summary", "sum-5", 814, 90, 885, 330, "Wi-Fi 7", { color: orange, fontSize: 55, textAlign: "center" }),
    text("summary", "sum-5-caption", 815, 90, 975, 330, "通信", { fontSize: 30, textAlign: "center" }),
    box("summary", "sum-card-6", 816, 480, 840, 330, 220, { stroke: green, strokeWidth: 2.4, dash: "10 8", radius: 20, roughness: .7, fill: "rgba(70,177,118,.04)" }),
    text("summary", "sum-6", 817, 480, 885, 330, "+10%～15%", { color: green, fontSize: 51, textAlign: "center" }),
    text("summary", "sum-6-caption", 818, 480, 975, 330, "续航预期", { fontSize: 30, textAlign: "center" }),
    text("summary", "summary-note", 819, 100, 1190, 700, "以上为供应链 / 媒体爆料整理\n最终以苹果官方发布为准。", { color: gray, fontSize: 32, lineHeight: 56, textAlign: "center" }),
    stroke("summary", "summary-final-line", 820, "M 170 1370 Q 450 1355 730 1370", { color: blue, width: 3.2, roughness: 1.1 }),
    hold("summary", "summary-hold", 821, 1200),
  ],
};