import { z } from "zod";
import { countGraphemes } from "@/lib/text/graphemes";

const limited = (min: number, max: number, label: string) => z.string().refine((value) => {
  const count = countGraphemes(value);
  return count >= min && count <= max;
}, `${label} must contain ${min}-${max} graphemes`);
const idSchema = z.string().min(1).max(120);
const anchorSchema = z.enum(["top", "right", "bottom", "left", "center"]);
export const noteThemeSchema = z.object({ paper: z.literal("warm-white"), ink: z.literal("black"), accent: z.literal("yellow-blue-green") }).strict();
export const textSpanSchema = z.object({ id: idSchema, text: limited(1, 240, "span text"), emphasis: z.enum(["normal", "strong"]).optional() }).strict();
const spansSchema = z.array(textSpanSchema).min(1).max(12);
const textAnnotationTargetSchema = z.object({ blockId: idSchema, spanId: idSchema }).strict();
export const textAnnotationSchema = z.object({ id: idSchema, type: z.enum(["highlight", "circle", "underline", "strike"]), target: textAnnotationTargetSchema }).strict();
const textAnnotationsSchema = z.array(textAnnotationSchema).max(20).optional();

export const textBlockSchema = z.object({ type: z.literal("text"), id: idSchema, spans: spansSchema, annotations: textAnnotationsSchema }).strict();
export const bulletListBlockSchema = z.object({
  type: z.literal("bullet-list"), id: idSchema,
  items: z.array(z.object({ id: idSchema, spans: spansSchema }).strict()).min(1).max(8),
  annotations: textAnnotationsSchema,
}).strict();
const comparisonSideSchema = z.object({ title: limited(1, 80, "comparison title"), items: z.array(limited(1, 160, "comparison item")).min(1).max(8) }).strict();
export const comparisonBlockSchema = z.object({ type: z.literal("comparison"), id: idSchema, left: comparisonSideSchema, right: comparisonSideSchema }).strict();
const flowNodeSchema = z.object({ id: idSchema, label: limited(1, 80, "flow label") }).strict();
const flowEdgeSchema = z.object({ from: idSchema, to: idSchema, label: limited(1, 60, "edge label").optional() }).strict().refine((edge) => edge.from !== edge.to, "flow edge endpoints must differ");
export const flowDiagramBlockSchema = z.object({ type: z.literal("flow-diagram"), id: idSchema, nodes: z.array(flowNodeSchema).min(2).max(8), edges: z.array(flowEdgeSchema).min(1).max(12) }).strict();
const chartSeriesSchema = z.object({ id: idSchema, name: limited(1, 40, "series name"), color: z.enum(["blue", "green"]), points: z.array(z.number().finite()).min(2).max(30) }).strict();
export const lineChartBlockSchema = z.object({ type: z.literal("line-chart"), id: idSchema, title: limited(1, 80, "chart title").optional(), labels: z.array(limited(1, 30, "chart label")).min(2).max(30), series: z.array(chartSeriesSchema).min(1).max(3) }).strict().superRefine((block, context) => {
  for (const series of block.series) if (series.points.length !== block.labels.length) context.addIssue({ code: "custom", message: `series ${series.id} points must match labels` });
});
export const calloutBlockSchema = z.object({ type: z.literal("callout"), id: idSchema, tone: z.enum(["idea", "warning", "summary"]), spans: spansSchema, annotations: textAnnotationsSchema }).strict();
export const noteBlockSchema = z.discriminatedUnion("type", [textBlockSchema, bulletListBlockSchema, comparisonBlockSchema, flowDiagramBlockSchema, lineChartBlockSchema, calloutBlockSchema]);
const arrowEndpointSchema = z.object({ blockId: idSchema, anchor: anchorSchema }).strict();
export const arrowAnnotationSchema = z.object({ id: idSchema, type: z.literal("arrow"), from: arrowEndpointSchema, to: arrowEndpointSchema, label: limited(1, 60, "arrow label").optional() }).strict().refine((arrow) => arrow.from.blockId !== arrow.to.blockId, "arrow endpoints must differ");

function visibleText(blocks: z.infer<typeof noteBlockSchema>[], title: string, arrows: z.infer<typeof arrowAnnotationSchema>[]): string {
  const parts = [title];
  for (const block of blocks) {
    if (block.type === "text" || block.type === "callout") parts.push(...block.spans.map((span) => span.text));
    if (block.type === "bullet-list") for (const item of block.items) parts.push(...item.spans.map((span) => span.text));
    if (block.type === "comparison") parts.push(block.left.title, ...block.left.items, block.right.title, ...block.right.items);
    if (block.type === "flow-diagram") { parts.push(...block.nodes.map((node) => node.label)); parts.push(...block.edges.flatMap((edge) => edge.label ? [edge.label] : [])); }
    if (block.type === "line-chart") { if (block.title) parts.push(block.title); parts.push(...block.labels, ...block.series.map((series) => series.name)); }
  }
  parts.push(...arrows.flatMap((arrow) => arrow.label ? [arrow.label] : []));
  return parts.join("");
}

export const noteDocumentSchema = z.object({
  id: idSchema,
  question: limited(1, 4000, "question"),
  title: limited(1, 80, "title"),
  theme: noteThemeSchema,
  blocks: z.array(noteBlockSchema).min(1).max(12),
  arrows: z.array(arrowAnnotationSchema).max(8),
  truncated: z.boolean(),
}).strict().superRefine((note, context) => {
  const blockIds = new Set<string>();
  const textAnnotationIds = new Set<string>();
  let annotationCount = 0;
  let flowEdgeCount = 0;
  for (const block of note.blocks) {
    if (blockIds.has(block.id)) context.addIssue({ code: "custom", message: `duplicate block id: ${block.id}` });
    blockIds.add(block.id);
    const blockText = visibleText([block], "", []);
    if (countGraphemes(blockText) > 1200) context.addIssue({ code: "custom", message: `block ${block.id} exceeds 1200 graphemes` });
    if (block.type === "flow-diagram") {
      flowEdgeCount += block.edges.length;
      const nodeIds = new Set<string>();
      for (const node of block.nodes) { if (nodeIds.has(node.id)) context.addIssue({ code: "custom", message: `duplicate flow node id: ${node.id}` }); nodeIds.add(node.id); }
      for (const edge of block.edges) if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) context.addIssue({ code: "custom", message: `invalid flow edge in ${block.id}` });
    }
    if (block.type === "line-chart") {
      const seriesIds = new Set<string>();
      for (const series of block.series) { if (seriesIds.has(series.id)) context.addIssue({ code: "custom", message: `duplicate series id: ${series.id}` }); seriesIds.add(series.id); }
    }
    if (block.type === "text" || block.type === "callout" || block.type === "bullet-list") {
      const spanIds = new Set<string>();
      if (block.type === "bullet-list") {
        const itemIds = new Set<string>();
        for (const item of block.items) {
          if (itemIds.has(item.id)) context.addIssue({ code: "custom", message: `duplicate bullet item id: ${item.id}` });
          itemIds.add(item.id);
          for (const span of item.spans) { if (spanIds.has(span.id)) context.addIssue({ code: "custom", message: `duplicate span id: ${span.id}` }); spanIds.add(span.id); }
        }
      }
      else for (const span of block.spans) { if (spanIds.has(span.id)) context.addIssue({ code: "custom", message: `duplicate span id: ${span.id}` }); spanIds.add(span.id); }
      annotationCount += block.annotations?.length ?? 0;
      for (const annotation of block.annotations ?? []) {
        if (textAnnotationIds.has(annotation.id)) context.addIssue({ code: "custom", message: `duplicate text annotation id: ${annotation.id}` });
        textAnnotationIds.add(annotation.id);
        if (annotation.target.blockId !== block.id || !spanIds.has(annotation.target.spanId)) context.addIssue({ code: "custom", message: `invalid text annotation ${annotation.id}` });
      }
    }
  }
  const arrowIds = new Set<string>();
  for (const arrow of note.arrows) {
    if (arrowIds.has(arrow.id)) context.addIssue({ code: "custom", message: `duplicate arrow id: ${arrow.id}` });
    arrowIds.add(arrow.id);
    if (!blockIds.has(arrow.from.blockId) || !blockIds.has(arrow.to.blockId)) context.addIssue({ code: "custom", message: `invalid arrow ${arrow.id}` });
  }
  if (annotationCount > 20) context.addIssue({ code: "custom", message: "too many text annotations" });
  if (flowEdgeCount > 24) context.addIssue({ code: "custom", message: "too many flow edges" });
  if (countGraphemes(visibleText(note.blocks, note.title, note.arrows)) > 9000) context.addIssue({ code: "custom", message: "AI-visible content exceeds 9000 graphemes" });
});

export const chatResultSchema = z.object({ answer: limited(1, 6000, "answer"), note: noteDocumentSchema, mode: z.enum(["openai", "demo", "fallback"]) }).strict();
export type NoteTheme = z.infer<typeof noteThemeSchema>;
export type TextSpan = z.infer<typeof textSpanSchema>;
export type TextAnnotation = z.infer<typeof textAnnotationSchema>;
export type ArrowAnnotation = z.infer<typeof arrowAnnotationSchema>;
export type NoteBlock = z.infer<typeof noteBlockSchema>;
export type NoteDocument = z.infer<typeof noteDocumentSchema>;
export type ChatResult = z.infer<typeof chatResultSchema>;
export const defaultNoteTheme: NoteTheme = { paper: "warm-white", ink: "black", accent: "yellow-blue-green" };
