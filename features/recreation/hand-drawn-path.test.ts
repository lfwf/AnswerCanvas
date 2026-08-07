import { buildHandDrawnBoxPasses, buildHandDrawnStrokePasses, parseLineSegments, parseSimpleLinePath } from "./hand-drawn-path";

describe("hand drawn paths", () => {
  it("parses simple SVG line paths", () => {
    expect(parseSimpleLinePath("M 10 20 L 90 22")).toEqual({ start: { x: 10, y: 20 }, end: { x: 90, y: 22 } });
  });

  it("parses compound arrow-head line paths", () => {
    expect(parseLineSegments("M 80 40 L 72 34 M 80 40 L 72 46")).toEqual([
      { start: { x: 80, y: 40 }, end: { x: 72, y: 34 } },
      { start: { x: 80, y: 40 }, end: { x: 72, y: 46 } },
    ]);
  });

  it("creates deterministic double passes for solid lines", () => {
    const stroke = { id: "rule", kind: "stroke" as const, order: 1, path: "M 10 20 L 90 20" };
    const first = buildHandDrawnStrokePasses(stroke);
    const second = buildHandDrawnStrokePasses(stroke);
    expect(first).toEqual(second);
    expect(first).toHaveLength(2);
    expect(first[0].path).toContain(" C ");
    expect(first[0].path).not.toBe(first[1].path);
  });

  it("roughens every segment in a compound stroke", () => {
    const passes = buildHandDrawnStrokePasses({ id: "arrow-head", kind: "stroke", order: 1, path: "M 80 40 L 72 34 M 80 40 L 72 46" });
    expect((passes[0].path.match(/\bM\b/g) ?? [])).toHaveLength(2);
    expect((passes[0].path.match(/\bC\b/g) ?? [])).toHaveLength(2);
  });

  it("uses one pass for dashed boxes so dashes stay legible", () => {
    const passes = buildHandDrawnBoxPasses({ id: "box", kind: "box", order: 1, x: 10, y: 20, width: 80, height: 40, dash: "7 5" });
    expect(passes).toHaveLength(1);
    expect(passes[0].path).toContain("Q");
  });
});
