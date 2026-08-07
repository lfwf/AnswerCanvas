import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import { durationForElement, RecreationStage, timelineElements } from "./RecreationStage";
import type { RecreationScene } from "./recreation-types";

function makeScene(id: string, titleOrder: number): RecreationScene {
  return {
    id,
    title: id,
    description: id,
    sourceName: `${id}.png`,
    createdAt: "2026-08-07",
    width: 100,
    height: 100,
    paper: { background: "#fff", pattern: "plain", patternColor: "transparent", spacing: 12 },
    elements: [
      { id: "frame", kind: "stroke", animated: false, path: "M 0 0 L 100 0" },
      { id: "title", kind: "text", order: titleOrder, x: 10, y: 10, width: 80, text: id },
    ],
  };
}

describe("RecreationStage timeline", () => {
  it("keeps static structure out of player events", () => {
    expect(timelineElements(makeScene("first-scene", 2)).map((element) => element.id)).toEqual(["title"]);
  });

  it("does not share progress identity across scenes that reuse element ids", () => {
    const first = timelineElements(makeScene("first-scene", 2));
    const second = timelineElements(makeScene("second-scene", 7));
    expect(first[0].id).toBe(second[0].id);
    expect(first[0].order).toBe(2);
    expect(second[0].order).toBe(7);
  });

  it("schedules view transitions and anchored annotations as ordinary sequential events", () => {
    const scene: RecreationScene = {
      ...makeScene("immersive", 1),
      elements: [
        { id: "sentence", kind: "text", order: 1, x: 10, y: 10, width: 80, text: "I still went" },
        { id: "focus", kind: "view", order: 2, mode: "focus", targetIds: ["sentence"], durationMs: 540 },
        { id: "label", kind: "annotation", order: 3, targetId: "sentence", match: "I", label: "pron." },
        { id: "restore", kind: "view", order: 4, mode: "restore" },
      ],
    };
    const timeline = timelineElements(scene);
    expect(timeline.map((element) => element.id)).toEqual(["sentence", "focus", "label", "restore"]);
    expect(durationForElement(timeline[1])).toBe(540);
    expect(durationForElement(timeline[2])).toBeGreaterThan(0);
  });
});
afterEach(() => {
  vi.useRealTimers();
});

describe("RecreationStage playback controls", () => {
  async function initializeStage() {
    render(<RecreationStage scene={makeScene("replay-scene", 1)} />);
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });
    act(() => { vi.advanceTimersByTime(0); });
  }

  it("keeps initial autoplay behavior", async () => {
    vi.useFakeTimers();
    await initializeStage();

    act(() => { vi.advanceTimersByTime(351); });

    expect(screen.getByRole("button", { name: "暂停" })).toBeInTheDocument();
    expect(screen.getByText("正在书写")).toBeInTheDocument();
  });

  it("resets to paused and waits for continue", async () => {
    vi.useFakeTimers();
    await initializeStage();

    fireEvent.click(screen.getByRole("button", { name: "重播" }));

    expect(screen.getByRole("button", { name: "继续" })).toBeInTheDocument();
    expect(screen.getByText("已暂停")).toBeInTheDocument();

    act(() => { vi.advanceTimersByTime(500); });
    expect(screen.getByRole("button", { name: "继续" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "继续" }));
    expect(screen.getByRole("button", { name: "暂停" })).toBeInTheDocument();
  });
});