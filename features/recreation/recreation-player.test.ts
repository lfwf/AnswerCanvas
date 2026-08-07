import { RecreationPlayer } from "./recreation-player";

describe("RecreationPlayer", () => {
  it("resets to a paused start without scheduling playback", () => {
    let now = 0;
    const callbacks: FrameRequestCallback[] = [];
    const cancelled: number[] = [];
    const progress: Array<[string, number]> = [];
    const player = new RecreationPlayer({
      events: [{ id: "first", durationMs: 100 }, { id: "second", durationMs: 100 }],
      onProgress: (event, value) => progress.push([event.id, value]),
      clock: {
        now: () => now,
        requestFrame: (callback) => { callbacks.push(callback); return callbacks.length; },
        cancelFrame: (handle) => { cancelled.push(handle); },
      },
    });

    player.play();
    const staleCallback = callbacks[0];
    player.reset();

    expect(player.getState().status).toBe("paused");
    expect(progress.slice(-2)).toEqual([["first", 0], ["second", 0]]);
    expect(callbacks).toHaveLength(1);
    expect(cancelled).toContain(1);

    now = 50;
    staleCallback(now);
    expect(progress.at(-1)).toEqual(["second", 0]);

    player.resume();
    expect(callbacks).toHaveLength(2);
    now = 100;
    callbacks[1](now);
    expect(progress.at(-1)).toEqual(["first", 0.5]);
  });

  it("keeps replay as reset followed by immediate playback", () => {
    const callbacks: FrameRequestCallback[] = [];
    const player = new RecreationPlayer({
      events: [{ id: "only", durationMs: 100 }],
      onProgress: () => {},
      clock: { now: () => 0, requestFrame: (callback) => { callbacks.push(callback); return callbacks.length; }, cancelFrame: () => {} },
    });

    player.replay();

    expect(player.getState().status).toBe("playing");
    expect(callbacks).toHaveLength(1);
  });
  it("keeps one active writing event at a time and preserves frame remainder", () => {
    let now = 0;
    let callback: FrameRequestCallback | undefined;
    const progress: Array<[string, number]> = [];
    const player = new RecreationPlayer({
      events: [{ id: "first", durationMs: 200 }, { id: "second", durationMs: 200 }],
      onProgress: (event, value) => progress.push([event.id, value]),
      clock: {
        now: () => now,
        requestFrame: (next) => { callback = next; return 1; },
        cancelFrame: () => {},
      },
    });

    player.play();
    now = 100;
    callback?.(now);
    expect(progress.at(-1)).toEqual(["first", 0.5]);
    expect(progress.some(([id, value]) => id === "second" && value > 0)).toBe(false);

    now = 250;
    callback?.(now);
    expect(progress.at(-1)).toEqual(["second", 0.25]);
    expect(progress.filter(([id, value]) => id === "first" && value === 1)).toHaveLength(1);

    now = 350;
    callback?.(now);
    expect(progress.at(-1)).toEqual(["second", 0.75]);
  });

  it("can advance across multiple completed events without running them concurrently", () => {
    let now = 0;
    let callback: FrameRequestCallback | undefined;
    const progress: Array<[string, number]> = [];
    const player = new RecreationPlayer({
      events: [{ id: "a", durationMs: 100 }, { id: "b", durationMs: 100 }, { id: "c", durationMs: 100 }],
      onProgress: (event, value) => progress.push([event.id, value]),
      clock: { now: () => now, requestFrame: (next) => { callback = next; return 1; }, cancelFrame: () => {} },
    });
    player.play();
    now = 250;
    callback?.(now);
    expect(progress.at(-1)).toEqual(["c", 0.5]);
    expect(progress.filter(([, value]) => value > 0 && value < 1)).toEqual([["c", 0.5]]);
  });
});
