import { RecreationPlayer } from "./recreation-player";

describe("RecreationPlayer", () => {
  it("keeps one active writing event at a time", () => {
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
    expect(progress.at(-1)).toEqual(["second", 0]);
    expect(progress.some(([id, value]) => id === "second" && value > 0)).toBe(false);

    now = 350;
    callback?.(now);
    expect(progress.at(-1)).toEqual(["second", 0.5]);
  });
});
