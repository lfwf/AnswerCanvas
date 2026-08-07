import { timelineElements } from "./RecreationStage";
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
});
