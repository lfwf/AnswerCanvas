import { validateRecreationScene } from "../validate-recreation-scene";
import { longSentenceAnalysisPracticeScene } from "./long-sentence-analysis-practice";

function byId(id: string) {
  const element = longSentenceAnalysisPracticeScene.elements.find((item) => item.id === id);
  if (!element) throw new Error(`missing ${id}`);
  return element;
}

function order(id: string) {
  const element = byId(id);
  if (element.animated === false) throw new Error(`${id} is static`);
  return element.order;
}

describe("long sentence analysis practice scene", () => {
  it("passes the shared scene validator", () => {
    expect(validateRecreationScene(longSentenceAnalysisPracticeScene)).toEqual([]);
  });

  it("writes the complete source sentence before any grammar annotation", () => {
    expect(order("sentence-line-1")).toBeLessThan(order("sentence-line-2"));
    expect(order("sentence-line-2")).toBeLessThan(order("sentence-line-3"));
    expect(order("sentence-line-3")).toBeLessThan(order("sentence-line-4"));
    expect(order("sentence-line-4")).toBeLessThan(order("m-although"));
    expect(order("sentence-line-4")).toBeLessThan(order("a-although"));
  });

  it("anchors grammar labels to the already written source lines instead of rewriting the sentence", () => {
    for (const [id, targetId] of [
      ["a-although", "sentence-line-1"],
      ["a-which", "sentence-line-2"],
      ["a-because", "sentence-line-3"],
      ["a-spend-bottom", "sentence-line-4"],
    ] as const) {
      const element = byId(id);
      expect(element.kind).toBe("annotation");
      if (element.kind === "annotation") expect(element.targetId).toBe(targetId);
    }
  });

  it("plays source analysis, structure graph, logical split, grammar recap, memory sketch, then final order", () => {
    expect(order("a-family")).toBeLessThan(order("structure-title-cloud"));
    expect(order("structure-right-spine")).toBeLessThan(order("split-title"));
    expect(order("teacher-star")).toBeLessThan(order("grammar-title-cloud"));
    expect(order("grammar-spend")).toBeLessThan(order("memory-title-cloud"));
    expect(order("memory-family-label")).toBeLessThan(order("final-order"));
  });

  it("draws memory icons before writing their captions", () => {
    expect(order("memory-building")).toBeLessThan(order("memory-building-label"));
    expect(order("memory-list")).toBeLessThan(order("memory-list-label"));
    expect(order("memory-person")).toBeLessThan(order("memory-person-label"));
    expect(order("memory-magnifier")).toBeLessThan(order("memory-magnifier-label"));
    expect(order("memory-clock")).toBeLessThan(order("memory-clock-label"));
    expect(order("memory-family")).toBeLessThan(order("memory-family-label"));
  });
});
