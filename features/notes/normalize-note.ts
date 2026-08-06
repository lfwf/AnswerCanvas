import { countGraphemes, splitGraphemes } from "@/lib/text/graphemes";
import { defaultNoteTheme, noteDocumentSchema, type NoteBlock, type NoteDocument, type TextAnnotation } from "./note-schema";

export interface NormalizeResult { note: NoteDocument; diagnostics: string[]; }
type RecordValue = Record<string, unknown>;
const asRecord = (value: unknown): RecordValue | null => value && typeof value === "object" && !Array.isArray(value) ? value as RecordValue : null;
const asArray = (value: unknown): unknown[] => Array.isArray(value) ? value : [];
const clip = (value: unknown, max: number, fallback = "") => typeof value === "string" ? splitGraphemes(value.trim()).slice(0, max).join("") || fallback : fallback;
const rawId = (value: unknown) => typeof value === "string" && /^[\w.-]{1,120}$/.test(value) ? value : null;

export function normalizeNote(raw: unknown, validatedQuestion: string): NormalizeResult {
  const source = asRecord(raw) ?? {};
  const diagnostics: string[] = [];
  const rawBlocks = asArray(source.blocks).slice(0, 12);
  const idCounts = new Map<string, number>();
  const countId = (value: unknown) => { const id = rawId(value); if (id) idCounts.set(id, (idCounts.get(id) ?? 0) + 1); };
  rawBlocks.forEach((item) => {
    const block = asRecord(item); if (!block) return; countId(block.id);
    if (block.type === "flow-diagram") asArray(block.nodes).forEach((node) => countId(asRecord(node)?.id));
    if (block.type === "line-chart") asArray(block.series).forEach((series) => countId(asRecord(series)?.id));
    const spans = block.type === "bullet-list" ? asArray(block.items).flatMap((it) => asArray(asRecord(it)?.spans)) : asArray(block.spans);
    spans.forEach((span) => countId(asRecord(span)?.id));
  });
  const uniqueMap = new Map<string, string>();
  const blocks: NoteBlock[] = [];
  const blockSpans = new Map<string, Set<string>>();
  const mapIfUnique = (original: unknown, canonical: string) => { const id = rawId(original); if (id && idCounts.get(id) === 1) uniqueMap.set(id, canonical); };
  const makeSpans = (value: unknown, blockId: string, prefix: string) => {
    const result = asArray(value).slice(0, 12).map((item, index) => {
      const span = asRecord(item) ?? {}; const id = `${prefix}-span-${index + 1}`; mapIfUnique(span.id, id);
      return { id, text: clip(span.text, 240, "（内容缺失）"), ...(span.emphasis === "strong" ? { emphasis: "strong" as const } : {}) };
    });
    if (!result.length) result.push({ id: `${prefix}-span-1`, text: "（内容缺失）" });
    const known = blockSpans.get(blockId) ?? new Set<string>(); for (const span of result) known.add(span.id); blockSpans.set(blockId, known);
    return result;
  };
  const pendingAnnotations: Array<{ blockIndex: number; raw: unknown[] }> = [];
  rawBlocks.forEach((item, blockIndex) => {
    const block = asRecord(item); if (!block) { diagnostics.push(`dropped non-object block ${blockIndex}`); return; }
    const id = `block-${blockIndex + 1}`; mapIfUnique(block.id, id);
    const type = block.type;
    if (type === "text") {
      blocks.push({ type, id, spans: makeSpans(block.spans, id, id) }); pendingAnnotations.push({ blockIndex: blocks.length - 1, raw: asArray(block.annotations) }); return;
    }
    if (type === "bullet-list") {
      const items = asArray(block.items).slice(0, 8).map((rawItem, itemIndex) => { const obj = asRecord(rawItem) ?? {}; return { id: `${id}-item-${itemIndex + 1}`, spans: makeSpans(obj.spans, id, `${id}-item-${itemIndex + 1}`) }; });
      blocks.push({ type, id, items: items.length ? items : [{ id: `${id}-item-1`, spans: makeSpans([], id, `${id}-item-1`) }] }); pendingAnnotations.push({ blockIndex: blocks.length - 1, raw: asArray(block.annotations) }); return;
    }
    if (type === "comparison") {
      const side = (rawSide: unknown) => { const obj = asRecord(rawSide) ?? {}; const items = asArray(obj.items).slice(0, 8).map((v) => clip(v, 160)).filter(Boolean); return { title: clip(obj.title, 80, "对比项"), items: items.length ? items : ["（内容缺失）"] }; };
      blocks.push({ type, id, left: side(block.left), right: side(block.right) }); return;
    }
    if (type === "flow-diagram") {
      const rawNodes = asArray(block.nodes).slice(0, 8); const nodes = rawNodes.map((node, index) => { const obj = asRecord(node) ?? {}; const nodeId = `${id}-node-${index + 1}`; mapIfUnique(obj.id, nodeId); return { id: nodeId, label: clip(obj.label, 80, `步骤 ${index + 1}`) }; });
      const edges = asArray(block.edges).slice(0, 12).flatMap((edge) => { const obj = asRecord(edge); if (!obj) return []; const from = typeof obj.from === "string" ? uniqueMap.get(obj.from) : undefined; const to = typeof obj.to === "string" ? uniqueMap.get(obj.to) : undefined; if (!from || !to || from === to || !nodes.some((node) => node.id === from) || !nodes.some((node) => node.id === to)) { diagnostics.push(`dropped invalid flow edge in ${id}`); return []; } return [{ from, to, ...(clip(obj.label, 60) ? { label: clip(obj.label, 60) } : {}) }]; });
      if (nodes.length >= 2 && edges.length) blocks.push({ type, id, nodes, edges });
      else { diagnostics.push(`degraded invalid flow diagram ${id}`); blocks.push({ type: "text", id, spans: [{ id: `${id}-span-1`, text: nodes.map((n) => n.label).join(" → ") || "流程图内容无法解析" }] }); blockSpans.set(id, new Set([`${id}-span-1`])); }
      return;
    }
    if (type === "line-chart") {
      const labels = asArray(block.labels).slice(0, 30).map((v) => clip(v, 30)).filter(Boolean); const series = asArray(block.series).slice(0, 3).flatMap((rawSeries, index) => { const obj = asRecord(rawSeries); if (!obj) return []; const points = asArray(obj.points).filter((point): point is number => typeof point === "number" && Number.isFinite(point)).slice(0, labels.length); if (points.length !== labels.length || labels.length < 2) return []; const seriesId = `${id}-series-${index + 1}`; mapIfUnique(obj.id, seriesId); return [{ id: seriesId, name: clip(obj.name, 40, `系列 ${index + 1}`), color: obj.color === "green" ? "green" as const : "blue" as const, points }]; });
      if (labels.length >= 2 && series.length) blocks.push({ type, id, ...(clip(block.title, 80) ? { title: clip(block.title, 80) } : {}), labels, series });
      else { diagnostics.push(`degraded invalid line chart ${id}`); blocks.push({ type: "text", id, spans: [{ id: `${id}-span-1`, text: "图表数据不完整，已转换为文字说明。" }] }); blockSpans.set(id, new Set([`${id}-span-1`])); }
      return;
    }
    if (type === "callout") {
      blocks.push({ type, id, tone: block.tone === "warning" || block.tone === "summary" ? block.tone : "idea", spans: makeSpans(block.spans, id, id) }); pendingAnnotations.push({ blockIndex: blocks.length - 1, raw: asArray(block.annotations) }); return;
    }
    diagnostics.push(`converted unknown block ${String(type)}`);
    const summary = clip(block.text ?? block.content ?? JSON.stringify(block).slice(0, 220), 240, "不支持的内容块");
    blocks.push({ type: "text", id, spans: [{ id: `${id}-span-1`, text: summary }] }); blockSpans.set(id, new Set([`${id}-span-1`]));
  });
  if (!blocks.length) { blocks.push({ type: "text", id: "block-1", spans: [{ id: "block-1-span-1", text: "暂时没有可展示的结构化内容。" }] }); blockSpans.set("block-1", new Set(["block-1-span-1"])); }
  for (const pending of pendingAnnotations) {
    const block = blocks[pending.blockIndex]; if (!(block.type === "text" || block.type === "bullet-list" || block.type === "callout")) continue;
    const annotations: TextAnnotation[] = pending.raw.slice(0, 20).flatMap((rawAnnotation, index) => { const annotation = asRecord(rawAnnotation); const target = asRecord(annotation?.target); if (!annotation || !target) return []; const type = annotation.type; if (!(type === "highlight" || type === "circle" || type === "underline" || type === "strike")) return []; const targetBlockId = typeof target.blockId === "string" ? uniqueMap.get(target.blockId) : undefined; const spanId = typeof target.spanId === "string" ? uniqueMap.get(target.spanId) : undefined; if (targetBlockId !== block.id || !spanId || !blockSpans.get(block.id)?.has(spanId)) { diagnostics.push(`dropped invalid annotation in ${block.id}`); return []; } return [{ id: `${block.id}-annotation-${index + 1}`, type, target: { blockId: block.id, spanId } }]; });
    if (annotations.length) block.annotations = annotations;
  }
  const arrows = asArray(source.arrows).slice(0, 8).flatMap((rawArrow, index) => { const arrow = asRecord(rawArrow); const from = asRecord(arrow?.from); const to = asRecord(arrow?.to); if (!arrow || !from || !to) return []; const fromId = typeof from.blockId === "string" ? uniqueMap.get(from.blockId) : undefined; const toId = typeof to.blockId === "string" ? uniqueMap.get(to.blockId) : undefined; const anchors = new Set(["top", "right", "bottom", "left", "center"]); if (!fromId || !toId || fromId === toId || !anchors.has(String(from.anchor)) || !anchors.has(String(to.anchor))) { diagnostics.push("dropped invalid document arrow"); return []; } return [{ id: `arrow-${index + 1}`, type: "arrow" as const, from: { blockId: fromId, anchor: from.anchor as "top" | "right" | "bottom" | "left" | "center" }, to: { blockId: toId, anchor: to.anchor as "top" | "right" | "bottom" | "left" | "center" }, ...(clip(arrow.label, 60) ? { label: clip(arrow.label, 60) } : {}) }]; });
  const title = clip(source.title, 80, "AI 回答笔记"); let truncated = source.truncated === true;
  const blockVisibleText = (block: NoteBlock): string => {
    if (block.type === "text" || block.type === "callout") return block.spans.map((span) => span.text).join("");
    if (block.type === "bullet-list") return block.items.flatMap((item) => item.spans.map((span) => span.text)).join("");
    if (block.type === "comparison") return block.left.title + block.left.items.join("") + block.right.title + block.right.items.join("");
    if (block.type === "flow-diagram") return block.nodes.map((node) => node.label).join("") + block.edges.map((edge) => edge.label ?? "").join("");
    return (block.title ?? "") + block.labels.join("") + block.series.map((series) => series.name).join("");
  };
  const contentCount = () => countGraphemes(title + blocks.map(blockVisibleText).join("") + arrows.map((arrow) => arrow.label ?? "").join(""));
  while (blocks.length > 1 && contentCount() > 9000) { const removed = blocks.pop(); if (removed) diagnostics.push(`removed over-budget block ${removed.id}`); truncated = true; }
  const retainedIds = new Set(blocks.map((block) => block.id)); const retainedArrows = arrows.filter((arrow) => retainedIds.has(arrow.from.blockId) && retainedIds.has(arrow.to.blockId));
  if (retainedArrows.length !== arrows.length) { diagnostics.push("removed arrows referencing truncated blocks"); truncated = true; }
  const note = noteDocumentSchema.parse({ id: rawId(source.id) ?? "note-normalized", question: validatedQuestion, title, theme: defaultNoteTheme, blocks, arrows: retainedArrows, truncated });
  return { note, diagnostics };
}
