import type { LayoutElement } from "@/features/layout/layout-types";
import { countGraphemes } from "@/lib/text/graphemes";

export type AnimationTargetKind = "text-reveal" | "path-draw" | "marker-sweep" | "underline" | "circle" | "strike" | "arrow";
export interface AnimationTargetDescriptor { id: string; elementId: string; pageIndex: number; elementIndex: number; phase: number; kind: AnimationTargetKind; graphemes?: number; pathLength?: number; }

export function targetsForElement(element: LayoutElement): AnimationTargetDescriptor[] {
  if (element.kind === "question" || element.kind === "footer") return [];
  const base = { elementId: element.id, pageIndex: element.pageIndex, elementIndex: element.elementIndex };
  if (element.kind === "title") return [{ ...base, id: `${element.id}:text`, phase: 0, kind: "text-reveal", graphemes: countGraphemes(element.payload.text) }];
  if (element.kind === "text" || element.kind === "callout") {
    const targets: AnimationTargetDescriptor[] = [{ ...base, id: `${element.id}:text`, phase: 0, kind: "text-reveal", graphemes: countGraphemes(element.payload.lines.join("")) }];
    for (const [index, annotation] of element.payload.annotations.entries()) targets.push({ ...base, id: `${element.id}:annotation:${annotation.id}`, phase: index + 1, kind: annotation.type === "highlight" ? "marker-sweep" : annotation.type, pathLength: Math.max(80, element.box.width * 0.6) });
    return targets;
  }
  if (element.kind === "bullet-list") {
    const count = element.payload.items.reduce((sum, item) => sum + countGraphemes(item.lines.join("")), 0);
    return [{ ...base, id: `${element.id}:text`, phase: 0, kind: "text-reveal", graphemes: count }, ...element.payload.annotations.map((annotation, index) => ({ ...base, id: `${element.id}:annotation:${annotation.id}`, phase: index + 1, kind: annotation.type === "highlight" ? "marker-sweep" as const : annotation.type, pathLength: element.box.width * 0.55 }))];
  }
  if (element.kind === "comparison") return [{ ...base, id: `${element.id}:text`, phase: 0, kind: "text-reveal", graphemes: countGraphemes(JSON.stringify(element.payload)) }];
  if (element.kind === "flow-diagram") return [{ ...base, id: `${element.id}:labels`, phase: 0, kind: "text-reveal", graphemes: element.payload.nodes.reduce((sum, node) => sum + countGraphemes(node.label), 0) }, ...element.payload.edges.map((edge, index) => ({ ...base, id: `${element.id}:edge:${index}`, phase: index + 1, kind: "path-draw" as const, pathLength: 180 }))];
  if (element.kind === "line-chart") return [{ ...base, id: `${element.id}:labels`, phase: 0, kind: "text-reveal", graphemes: element.payload.labels.reduce((sum, label) => sum + countGraphemes(label), 0) }, ...element.payload.series.map((series, index) => ({ ...base, id: `${element.id}:series:${series.id}`, phase: index + 1, kind: "path-draw" as const, pathLength: 420 }))];
  if (element.kind === "arrow") return [{ ...base, id: `${element.id}:path`, phase: 0, kind: "arrow", pathLength: Math.hypot(element.payload.toPoint.x - element.payload.fromPoint.x, element.payload.toPoint.y - element.payload.fromPoint.y) }];
  return [];
}
