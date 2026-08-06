import type { Timeline, TimelineEvent } from "./timeline-types";
export interface PlayerClock { now(): number; requestFrame(callback: FrameRequestCallback): number; cancelFrame(id: number): void; }
export interface TimelinePlayerOptions { timeline: Timeline; clock?: PlayerClock; onProgress(event: TimelineEvent, progress: number): void; onPageFollow?(pageIndex: number): void; onComplete?(): void; }
export type PlayerStatus = "idle" | "playing" | "paused" | "complete" | "cancelled";
const browserClock: PlayerClock = { now: () => performance.now(), requestFrame: (cb) => requestAnimationFrame(cb), cancelFrame: (id) => cancelAnimationFrame(id) };

export class TimelinePlayer {
  private timeline: Timeline; private clock: PlayerClock; private onProgress: TimelinePlayerOptions["onProgress"]; private onPageFollow?: TimelinePlayerOptions["onPageFollow"]; private onComplete?: TimelinePlayerOptions["onComplete"];
  private status: PlayerStatus = "idle"; private frame: number | null = null; private speed = 1; private logicalMs = 0; private lastRealMs = 0; private followed = new Set<number>(); private manualScrollUntil = 0; private completedEmitted = false;
  constructor(options: TimelinePlayerOptions) { this.timeline = options.timeline; this.clock = options.clock ?? browserClock; this.onProgress = options.onProgress; this.onPageFollow = options.onPageFollow; this.onComplete = options.onComplete; }
  getState() { return { status: this.status, positionMs: this.logicalMs, speed: this.speed }; }
  play() { if (this.status === "cancelled" || this.status === "complete" || this.status === "playing") return; this.status = "playing"; this.lastRealMs = this.clock.now(); this.schedule(); }
  pause() { if (this.status !== "playing") return; this.tick(this.clock.now()); this.status = "paused"; this.unschedule(); }
  resume() { this.play(); }
  setSpeed(speed: number) { if (![0.5, 1, 1.5, 2].includes(speed)) throw new Error("unsupported speed"); if (this.status === "playing") this.tick(this.clock.now()); this.speed = speed; this.lastRealMs = this.clock.now(); }
  replay() { this.unschedule(); this.logicalMs = 0; this.followed.clear(); this.completedEmitted = false; this.status = "idle"; for (const event of this.timeline.events) this.onProgress(event, 0); this.play(); }
  cancel() { this.unschedule(); this.status = "cancelled"; }
  suppressFollowFor(ms = 3000) { this.manualScrollUntil = this.clock.now() + ms; }
  private schedule() { if (this.frame === null) this.frame = this.clock.requestFrame((time) => { this.frame = null; this.tick(time); if (this.status === "playing") this.schedule(); }); }
  private unschedule() { if (this.frame !== null) this.clock.cancelFrame(this.frame); this.frame = null; }
  private tick(realNow: number) {
    if (this.status !== "playing") return; const delta = Math.max(0, realNow - this.lastRealMs); this.lastRealMs = realNow; this.logicalMs = Math.min(this.timeline.durationMs, this.logicalMs + delta * this.speed);
    for (const event of this.timeline.events) {
      const progress = this.logicalMs <= event.startMs ? 0 : this.logicalMs >= event.endMs ? 1 : (this.logicalMs - event.startMs) / event.durationMs;
      this.onProgress(event, progress);
      if (progress > 0 && !this.followed.has(event.pageIndex)) { this.followed.add(event.pageIndex); if (realNow >= this.manualScrollUntil) this.onPageFollow?.(event.pageIndex); }
    }
    if (this.logicalMs >= this.timeline.durationMs) { this.status = "complete"; this.unschedule(); if (!this.completedEmitted) { this.completedEmitted = true; this.onComplete?.(); } }
  }
}
