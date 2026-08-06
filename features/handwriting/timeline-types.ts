import type { AnimationTargetKind } from "./animation-targets";
export interface TimelineEvent { id: string; targetId: string; elementId: string; pageIndex: number; elementIndex: number; phase: number; kind: AnimationTargetKind; startMs: number; durationMs: number; endMs: number; }
export interface Timeline { events: TimelineEvent[]; durationMs: number; }
