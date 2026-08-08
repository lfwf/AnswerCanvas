import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import type { RecreationScene } from "./recreation-types";

vi.mock("./PageSnapshotPanel", () => ({
  PageSnapshotPanel: ({ ready }: { ready: boolean }) => <span data-testid="snapshot-ready">{String(ready)}</span>,
}));

import { durationForElement, RecreationStage, timelineElements } from "./RecreationStage";

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

function makePagedScene(): RecreationScene {
  return {
    ...makeScene("paged-video", 1),
    width: 900,
    height: 1600,
    pages: [{ id: "one", title: "One" }, { id: "two", title: "Two" }],
    elements: [
      { id: "one-text", kind: "text", pageId: "one", order: 1, x: 80, y: 100, width: 720, text: "One" },
      { id: "turn", kind: "page", pageId: "two", order: 2, durationMs: 880, transition: "slide" },
      { id: "two-text", kind: "text", pageId: "two", order: 3, x: 80, y: 100, width: 720, text: "Two" },
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

  it("schedules a page turn between the outgoing page and the next page writing", () => {
    const timeline = timelineElements(makePagedScene());
    expect(timeline.map((element) => element.id)).toEqual(["one-text", "turn", "two-text"]);
    expect(durationForElement(timeline[1])).toBe(880);
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

  it("marks paged scenes as contained video viewports", () => {
    const { container } = render(<RecreationStage scene={makePagedScene()} />);
    expect(container.querySelector(".answer-canvas-viewport.is-paged-video")).toBeInTheDocument();
  });

  it("makes final snapshot rendering ready before the playback timeline completes", async () => {
    render(<RecreationStage scene={makePagedScene()} />);
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });
    expect(screen.getByTestId("snapshot-ready")).toHaveTextContent("true");
    expect(screen.queryByText("已完成")).not.toBeInTheDocument();
  });

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
