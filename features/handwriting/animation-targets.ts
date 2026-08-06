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
    for (const [index, annotation] of element.payload.annotations.entries()) targets.push({ ...base, id: `${element.id}:annotation:${annotation.id}`, phase: index + 1, kind: annotation.type === "highlight" ? "marker-sweep" : annotation.type, pathLength: Math.max(70, element.box.width * 0.32) });
    return targets;
  }

  if (element.kind === "bullet-list") {
    const count = element.payload.items.reduce((sum, item) => sum + countGraphemes(item.lines.join("")), 0);
    return [{ ...base, id: `${element.id}:text`, phase: 0, kind: "text-reveal", graphemes: count }, ...element.payload.annotations.map((annotation, index) => ({ ...base, id: `${element.id}:annotation:${annotation.id}`, phase: index + 1, kind: annotation.type === "highlight" ? "marker-sweep" as const : annotation.type, pathLength: element.box.width * 0.34 }))];
  }

  if (element.kind === "comparison") return [{ ...base, id: `${element.id}:text`, phase: 0, kind: "text-reveal", graphemes: countGraphemes(JSON.stringify(element.payload)) }];

  if (element.kind === "flow-diagram") {
    const targets: AnimationTargetDescriptor[] = [];
    let phase = 0;
    for (const node of element.payload.nodes) {
      targets.push({ ...base, id: `${element.id}:node-ring:${node.id}`, phase: phase++, kind: "path-draw", pathLength: 220 });
      targets.push({ ...base, id: `${element.id}:node-label:${node.id}`, phase: phase++, kind: "text-reveal", graphemes: countGraphemes(node.label) });
    }
    for (const [index] of element.payload.edges.entries()) targets.push({ ...base, id: `${element.id}:edge:${index}`, phase: phase++, kind: "path-draw", pathLength: 180 });
    return targets;
  }

  if (element.kind === "line-chart") {
    const targets: AnimationTargetDescriptor[] = [];
    let phase = 0;
    targets.push({ ...base, id: `${element.id}:axis`, phase: phase++, kind: "path-draw", pathLength: 310 });
    if (element.payload.title) targets.push({ ...base, id: `${element.id}:title`, phase: phase++, kind: "text-reveal", graphemes: countGraphemes(element.payload.title) });
    for (let index = 0; index < 3; index += 1) targets.push({ ...base, id: `${element.id}:y-label:${index}`, phase: phase++, kind: "text-reveal", graphemes: 5 });
    const xIndexes = Array.from(new Set([0, Math.floor((element.payload.labels.length - 1) / 2), element.payload.labels.length - 1]));
    for (const index of xIndexes) targets.push({ ...base, id: `${element.id}:x-label:${index}`, phase: phase++, kind: "text-reveal", graphemes: countGraphemes(element.payload.labels[index]) });
    for (const series of element.payload.series) {
      targets.push({ ...base, id: `${element.id}:series:${series.id}`, phase: phase++, kind: "path-draw", pathLength: 420 });
      targets.push({ ...base, id: `${element.id}:series-label:${series.id}`, phase: phase++, kind: "text-reveal", graphemes: countGraphemes(series.name) + 6 });
    }
    return targets;
  }

  if (element.kind === "arrow") return [{ ...base, id: `${element.id}:path`, phase: 0, kind: "arrow", pathLength: Math.hypot(element.payload.toPoint.x - element.payload.fromPoint.x, element.payload.toPoint.y - element.payload.fromPoint.y) }];
  return [];
}
