import { futureAiJobsScene } from "./future-ai-jobs";
import { isAnimatedElement } from "../recreation-types";
import { validateRecreationScene } from "../validate-recreation-scene";

describe("future-ai-jobs scene", () => {
  it("matches the reference canvas and conversation prompt", () => {
    expect(futureAiJobsScene.width).toBe(1122);
    expect(futureAiJobsScene.height).toBe(1402);
    expect(futureAiJobsScene.prompt).toMatch(/未来3年/);
  });

  it("contains the four reading quadrants and their key diagrams", () => {
    const ids = new Set(futureAiJobsScene.elements.map((element) => element.id));
    for (const id of [
      "s1-title", "job1-screen", "job6-factory",
      "s2-title", "funnel-top", "ai-process", "human-judge", "output-result",
      "s3-title", "cap1-bubble", "cap5-axis",
      "s4-title", "conclusion-box", "matrix-x", "matrix-y", "formula",
    ]) expect(ids.has(id)).toBe(true);
  });

  it("keeps the requested quadrant order and draws icons before their text", () => {
    const dynamic = futureAiJobsScene.elements.filter(isAnimatedElement);
    const order = new Map(dynamic.map((element) => [element.id, element.order]));
    expect(order.get("s1-title")!).toBeLessThan(order.get("s2-title")!);
    expect(order.get("s2-title")!).toBeLessThan(order.get("s3-title")!);
    expect(order.get("s3-title")!).toBeLessThan(order.get("s4-title")!);
    expect(order.get("job1-screen")!).toBeLessThan(order.get("job1")!);
    expect(order.get("job2-board")!).toBeLessThan(order.get("job2")!);
    expect(order.get("job3-axis")!).toBeLessThan(order.get("job3")!);
    expect(order.get("job4-palette")!).toBeLessThan(order.get("job4")!);
    expect(order.get("job5-headband")!).toBeLessThan(order.get("job5")!);
    expect(order.get("job6-factory")!).toBeLessThan(order.get("job6")!);
    expect(order.get("cap1-bubble")!).toBeLessThan(order.get("cap1")!);
    expect(order.get("cap2-wrench")!).toBeLessThan(order.get("cap2")!);
    expect(order.get("cap3-board")!).toBeLessThan(order.get("cap3")!);
    expect(order.get("cap4-node-a")!).toBeLessThan(order.get("cap4")!);
    expect(order.get("cap5-axis")!).toBeLessThan(order.get("cap5")!);
  });

  it("passes shared scene validation", () => {
    expect(validateRecreationScene(futureAiJobsScene)).toEqual([]);
  });
});
