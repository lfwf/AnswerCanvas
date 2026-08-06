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
    this.events = options.events;
    this.onProgress = options.onProgress;
    this.onComplete = options.onComplete;
    this.clock = options.clock ?? browserClock;
  }

  play() {
    if (!this.events.length) { this.status = "complete"; this.onComplete?.(); return; }
    this.status = "playing";
    this.lastRealMs = this.clock.now();
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
    const delta = Math.max(0, realNow - this.lastRealMs);
    this.lastRealMs = realNow;
    this.eventElapsedMs += delta * this.speed;
    const event = this.events[this.index];
    if (this.eventElapsedMs >= event.durationMs) {
      this.onProgress(event, 1);
      this.index += 1;
      this.eventElapsedMs = 0;
    }
    if (this.index >= this.events.length) {
      this.status = "complete";
      this.unschedule();
      if (!this.completedEmitted) { this.completedEmitted = true; this.onComplete?.(); }
      return;
    }
    if (this.index !== this.events.findIndex((candidate) => candidate.id === event.id)) this.onProgress(this.events[this.index], 0);
    else this.onProgress(event, this.eventElapsedMs / event.durationMs);
    this.schedule();
  }
}
