import { splitGraphemes } from "@/lib/text/graphemes";
import type { NoteBlock, NoteDocument, TextSpan } from "@/features/notes/note-schema";
import { createSeededRandom, seededRange, seedFromString } from "./seeded-random";
import type { LayoutBox, LayoutDocument, LayoutElement, LayoutPage } from "./layout-types";
import type { TextMeasurer } from "./text-measurer";

export const A4_WIDTH = 794 as const;
export const A4_HEIGHT = 1123 as const;
export const PAGE_MARGIN = 64;
const CONTENT_WIDTH = A4_WIDTH - PAGE_MARGIN * 2;
const PAGE_BOTTOM = A4_HEIGHT - PAGE_MARGIN;
const BODY_FONT = 27;
const BODY_LINE_HEIGHT = 38;
const GAP = 24;

function wrap(text: string, maxWidth: number, fontSize: number, measurer: TextMeasurer): string[] {
  const graphemes = splitGraphemes(text); const lines: string[] = []; let line = "";
  for (const grapheme of graphemes) {
    const candidate = line + grapheme;
    if (line && measurer.measure(candidate, fontSize) > maxWidth) { lines.push(line); line = grapheme; } else line = candidate;
  }
  if (line) lines.push(line); return lines.length ? lines : [""];
}
function ellipsize(lines: string[], maxLines: number): { lines: string[]; ellipsized: boolean } {
  if (lines.length <= maxLines) return { lines, ellipsized: false };
  const result = lines.slice(0, maxLines); result[maxLines - 1] = `${result[maxLines - 1].replace(/[.…]+$/u, "")}…`; return { lines: result, ellipsized: true };
}
function anchorPoint(box: LayoutBox, anchor: string) {
  if (anchor === "top") return { x: box.x + box.width / 2, y: box.y };
  if (anchor === "right") return { x: box.x + box.width, y: box.y + box.height / 2 };
  if (anchor === "bottom") return { x: box.x + box.width / 2, y: box.y + box.height };
  if (anchor === "left") return { x: box.x, y: box.y + box.height / 2 };
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

export function layoutNote(note: NoteDocument, measurer: TextMeasurer): LayoutDocument {
  const diagnostics: string[] = []; const random = createSeededRandom(seedFromString(note.id));
  const pages: LayoutPage[] = [{ index: 0, width: A4_WIDTH, height: A4_HEIGHT, elements: [] }]; let page = pages[0]; let y = PAGE_MARGIN;
  const blockBoxes = new Map<string, { pageIndex: number; box: LayoutBox }>();
  const jitter = () => ({ rotate: seededRange(random, -0.45, 0.45), offsetY: seededRange(random, -1.5, 1.5) });
  const push = (element: Omit<LayoutElement, "pageIndex" | "elementIndex" | "jitter">) => {
    const full = { ...element, pageIndex: page.index, elementIndex: page.elements.length, jitter: jitter() } as LayoutElement; page.elements.push(full); if (full.blockId && !blockBoxes.has(full.blockId)) blockBoxes.set(full.blockId, { pageIndex: page.index, box: full.box }); return full;
  };
  const newPage = () => { page = { index: pages.length, width: A4_WIDTH, height: A4_HEIGHT, elements: [] }; pages.push(page); y = PAGE_MARGIN; };
  const ensure = (height: number) => { if (y + height > PAGE_BOTTOM && page.elements.length) newPage(); };
  const questionWrapped = ellipsize(wrap(`Q：${note.question}`, CONTENT_WIDTH, 26, measurer), 3);
  const questionHeight = questionWrapped.lines.length * 34 + 14;
  push({ id: `${note.id}:question`, kind: "question", box: { x: PAGE_MARGIN, y, width: CONTENT_WIDTH, height: questionHeight }, payload: { lines: questionWrapped.lines, fullQuestion: note.question, ellipsized: questionWrapped.ellipsized } }); y += questionHeight + 20;
  const titleLines = wrap(note.title, CONTENT_WIDTH, 38, measurer).slice(0, 2); const titleHeight = titleLines.length * 50;
  push({ id: `${note.id}:title`, kind: "title", box: { x: PAGE_MARGIN, y, width: CONTENT_WIDTH, height: titleHeight }, payload: { text: note.title } }); y += titleHeight + GAP;
  const addTextBlock = (block: Extract<NoteBlock, { type: "text" | "callout" }>) => {
    const spans = block.spans; const allLines = spans.flatMap((span) => wrap(span.text, CONTENT_WIDTH - (block.type === "callout" ? 34 : 0), BODY_FONT, measurer)); let cursor = 0; let part = 0;
    while (cursor < allLines.length) {
      const availableLines = Math.floor((PAGE_BOTTOM - y - 14) / BODY_LINE_HEIGHT); if (availableLines < 2 && page.elements.length) { newPage(); continue; }
      const take = Math.max(1, Math.min(allLines.length - cursor, Math.max(2, availableLines))); const lines = allLines.slice(cursor, cursor + take); const height = lines.length * BODY_LINE_HEIGHT + (block.type === "callout" ? 32 : 8);
      push({ id: `${block.id}:part-${part}`, blockId: block.id, kind: block.type === "callout" ? "callout" : "text", box: { x: PAGE_MARGIN, y, width: CONTENT_WIDTH, height }, payload: { spans, lines, annotations: block.annotations ?? [], ...(block.type === "callout" ? { tone: block.tone } : {}) } });
      y += height + GAP; cursor += take; part += 1; if (cursor < allLines.length) newPage();
    }
  };
  const addListBlock = (block: Extract<NoteBlock, { type: "bullet-list" }>) => {
    let cursor = 0; let part = 0;
    const items = block.items.map((item) => ({ ...item, lines: item.spans.flatMap((span) => wrap(span.text, CONTENT_WIDTH - 38, BODY_FONT, measurer)) }));
    while (cursor < items.length) {
      let used = 0; const selected: typeof items = [];
      while (cursor + selected.length < items.length) { const candidate = items[cursor + selected.length]; const height = Math.max(1, candidate.lines.length) * BODY_LINE_HEIGHT + 12; if (selected.length && y + used + height > PAGE_BOTTOM) break; if (!selected.length && y + height > PAGE_BOTTOM && page.elements.length) { newPage(); continue; } selected.push(candidate); used += height; }
      if (!selected.length) { newPage(); continue; }
      push({ id: `${block.id}:part-${part}`, blockId: block.id, kind: "bullet-list", box: { x: PAGE_MARGIN, y, width: CONTENT_WIDTH, height: used }, payload: { items: selected, annotations: block.annotations ?? [] } }); y += used + GAP; cursor += selected.length; part += 1; if (cursor < items.length) newPage();
    }
  };
  for (const block of note.blocks) {
    if (block.type === "text" || block.type === "callout") { addTextBlock(block); continue; }
    if (block.type === "bullet-list") { addListBlock(block); continue; }
    if (block.type === "comparison") { const rows = Math.max(block.left.items.length, block.right.items.length); const height = 72 + rows * 42; ensure(height); push({ id: block.id, blockId: block.id, kind: "comparison", box: { x: PAGE_MARGIN, y, width: CONTENT_WIDTH, height }, payload: block }); y += height + GAP; continue; }
    if (block.type === "flow-diagram") { const height = 220; ensure(height); push({ id: block.id, blockId: block.id, kind: "flow-diagram", box: { x: PAGE_MARGIN, y, width: CONTENT_WIDTH, height }, payload: block }); y += height + GAP; continue; }
    if (block.type === "line-chart") { const height = 270; ensure(height); push({ id: block.id, blockId: block.id, kind: "line-chart", box: { x: PAGE_MARGIN, y, width: CONTENT_WIDTH, height }, payload: block }); y += height + GAP; }
  }
  for (const arrow of note.arrows) {
    const from = blockBoxes.get(arrow.from.blockId); const to = blockBoxes.get(arrow.to.blockId);
    if (!from || !to || from.pageIndex !== to.pageIndex) { diagnostics.push(`dropped cross-page arrow ${arrow.id}`); continue; }
    const arrowPage = pages[from.pageIndex]; const fromPoint = anchorPoint(from.box, arrow.from.anchor); const toPoint = anchorPoint(to.box, arrow.to.anchor); const box = { x: Math.min(fromPoint.x, toPoint.x), y: Math.min(fromPoint.y, toPoint.y), width: Math.max(1, Math.abs(fromPoint.x - toPoint.x)), height: Math.max(1, Math.abs(fromPoint.y - toPoint.y)) };
    const element = { id: arrow.id, kind: "arrow", box, payload: { ...arrow, fromPoint, toPoint }, pageIndex: arrowPage.index, elementIndex: arrowPage.elements.length, jitter: jitter() } as LayoutElement; arrowPage.elements.push(element);
  }
  if (note.truncated) { const last = pages.at(-1)!; const footerY = PAGE_BOTTOM - 28; last.elements.push({ id: `${note.id}:footer`, kind: "footer", box: { x: PAGE_MARGIN, y: footerY, width: CONTENT_WIDTH, height: 28 }, payload: { text: "内容已精简" }, pageIndex: last.index, elementIndex: last.elements.length, jitter: jitter() }); }
  return { noteId: note.id, pages, diagnostics };
}
