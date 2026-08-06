import { RecreationPlayer } from "./recreation-player";

describe("RecreationPlayer", () => {
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
