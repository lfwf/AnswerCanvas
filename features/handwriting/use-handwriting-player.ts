"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LayoutDocument } from "@/features/layout/layout-types";
import { buildTimeline } from "./build-timeline";
import { TimelinePlayer } from "./timeline-player";

export function useHandwritingPlayer(layout: LayoutDocument | null, options?: { reducedMotion?: boolean; onPageFollow?(page: number): void }) {
  const [progress, setProgress] = useState<Record<string, number>>({}); const [status, setStatus] = useState<"idle" | "playing" | "paused" | "complete">("idle"); const [speed, setSpeedState] = useState(1);
  const playerRef = useRef<TimelinePlayer | null>(null); const timeline = useMemo(() => layout ? buildTimeline(layout) : null, [layout]);
  useEffect(() => {
    playerRef.current?.cancel();
    playerRef.current = null;
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setProgress({});
      if (!timeline) { setStatus("idle"); return; }
      if (options?.reducedMotion) {
        const complete: Record<string, number> = {};
        for (const event of timeline.events) complete[event.targetId] = 1;
        setProgress(complete); setStatus("complete"); return;
      }
      const player = new TimelinePlayer({
        timeline,
        onProgress: (event, value) => { if (active) setProgress((current) => current[event.targetId] === value ? current : { ...current, [event.targetId]: value }); },
        onPageFollow: options?.onPageFollow,
        onComplete: () => { if (active) setStatus("complete"); },
      });
      playerRef.current = player; setStatus("playing"); player.play();
    });
    return () => { active = false; playerRef.current?.cancel(); playerRef.current = null; };
  }, [timeline, options?.reducedMotion, options?.onPageFollow]);
  const pause = useCallback(() => { playerRef.current?.pause(); setStatus("paused"); }, []);
  const resume = useCallback(() => { playerRef.current?.resume(); setStatus("playing"); }, []);
  const replay = useCallback(() => {
    if (options?.reducedMotion && timeline) {
      const hidden: Record<string, number> = {}; const complete: Record<string, number> = {};
      for (const event of timeline.events) { hidden[event.targetId] = 0; complete[event.targetId] = 1; }
      setProgress(hidden); setStatus("playing"); window.setTimeout(() => { setProgress(complete); setStatus("complete"); }, 180); return;
    }
    playerRef.current?.replay(); setStatus("playing");
  }, [options?.reducedMotion, timeline]);
  const setSpeed = useCallback((value: number) => { playerRef.current?.setSpeed(value); setSpeedState(value); }, []);
  const suppressFollow = useCallback(() => playerRef.current?.suppressFollowFor(), []);
  return { progress, status, speed, pause, resume, replay, setSpeed, suppressFollow };
}
