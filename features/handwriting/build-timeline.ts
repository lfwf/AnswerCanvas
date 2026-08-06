import type { LayoutDocument } from "@/features/layout/layout-types";
import { targetsForElement } from "./animation-targets";
import type { Timeline, TimelineEvent } from "./timeline-types";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
export function buildTimeline(layout: LayoutDocument): Timeline {
  const targets = layout.pages.flatMap((page) => page.elements.flatMap(targetsForElement)).sort((a, b) => a.pageIndex - b.pageIndex || a.elementIndex - b.elementIndex || a.phase - b.phase || a.id.localeCompare(b.id));
  const events: TimelineEvent[] = []; let cursor = 0;
  for (const target of targets) {
    const durationMs = target.kind === "text-reveal" ? Math.max(180, (target.graphemes ?? 1) * 45) : clamp((target.pathLength ?? 100) * 5, 300, 2500);
    events.push({ id: `event:${target.id}`, targetId: target.id, elementId: target.elementId, pageIndex: target.pageIndex, elementIndex: target.elementIndex, phase: target.phase, kind: target.kind, startMs: cursor, durationMs, endMs: cursor + durationMs });
    cursor += durationMs + 120;
  }
  return { events, durationMs: events.length ? events.at(-1)!.endMs : 0 };
}
