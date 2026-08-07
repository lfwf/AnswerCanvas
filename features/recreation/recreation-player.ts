export interface RecreationEvent { id: string; durationMs: number; }
export type RecreationPlayerStatus = "idle" | "playing" | "paused" | "complete";
export interface RecreationClock { now(): number; requestFrame(callback: FrameRequestCallback): number; cancelFrame(handle: number): void; }

const browserClock: RecreationClock = {
  now: () => performance.now(),
  requestFrame: (callback) => requestAnimationFrame(callback),
  cancelFrame: (handle) => cancelAnimationFrame(handle),
};

export class RecreationPlayer {
  private readonly events: RecreationEvent[];
  private readonly clock: RecreationClock;
  private readonly onProgress: (event: RecreationEvent, value: number) => void;
  private readonly onComplete?: () => void;
  private frame?: number;
  private status: RecreationPlayerStatus = "idle";
  private speed = 1;
  private index = 0;
  private eventElapsedMs = 0;
  private lastRealMs = 0;
  private completedEmitted = false;

  constructor(options: { events: RecreationEvent[]; onProgress(event: RecreationEvent, value: number): void; onComplete?: () => void; clock?: RecreationClock }) {
    this.events = options.events.map((event) => ({ ...event, durationMs: Math.max(1, event.durationMs) }));
    this.onProgress = options.onProgress;
    this.onComplete = options.onComplete;
    this.clock = options.clock ?? browserClock;
  }

  play() {
    if (!this.events.length) { this.finish(); return; }
    this.status = "playing";
    this.lastRealMs = this.clock.now();
    this.onProgress(this.events[this.index], this.eventElapsedMs / this.events[this.index].durationMs);
    this.schedule();
  }

  pause() { if (this.status === "playing") { this.status = "paused"; this.unschedule(); } }

  resume() {
    if (this.status === "complete") return;
    this.status = "playing";
    this.lastRealMs = this.clock.now();
    this.schedule();
  }

  replay() {
    this.unschedule();
    this.status = "idle";
    this.index = 0;
    this.eventElapsedMs = 0;
    this.completedEmitted = false;
    for (const event of this.events) this.onProgress(event, 0);
    this.play();
  }

  setSpeed(speed: number) { this.speed = Math.min(2, Math.max(0.5, speed)); }
  getState() { return { status: this.status, index: this.index, positionMs: this.events.slice(0, this.index).reduce((sum, event) => sum + event.durationMs, 0) + this.eventElapsedMs, speed: this.speed }; }

  private schedule() { this.unschedule(); this.frame = this.clock.requestFrame((now) => this.tick(now)); }
  private unschedule() { if (this.frame !== undefined) { this.clock.cancelFrame(this.frame); this.frame = undefined; } }

  private tick(realNow: number) {
    if (this.status !== "playing") return;
    const delta = Math.max(0, realNow - this.lastRealMs) * this.speed;
    this.lastRealMs = realNow;
    this.eventElapsedMs += delta;

    while (this.index < this.events.length && this.eventElapsedMs >= this.events[this.index].durationMs) {
      const completed = this.events[this.index];
      this.eventElapsedMs -= completed.durationMs;
      this.onProgress(completed, 1);
      this.index += 1;
      if (this.index < this.events.length) this.onProgress(this.events[this.index], 0);
    }

    if (this.index >= this.events.length) { this.finish(); return; }
    const current = this.events[this.index];
    this.onProgress(current, Math.min(1, this.eventElapsedMs / current.durationMs));
    this.schedule();
  }

  private finish() {
    this.status = "complete";
    this.unschedule();
    if (!this.completedEmitted) { this.completedEmitted = true; this.onComplete?.(); }
  }
}
