import { buildHandDrawnBoxPasses, buildHandDrawnStrokePasses, parseSimpleLinePath } from "./hand-drawn-path";

describe("hand drawn paths", () => {
  it("parses simple SVG line paths", () => {
    expect(parseSimpleLinePath("M 10 20 L 90 22")).toEqual({ start: { x: 10, y: 20 }, end: { x: 90, y: 22 } });
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

  it("uses one pass for dashed boxes so dashes stay legible", () => {
    const passes = buildHandDrawnBoxPasses({ id: "box", kind: "box", order: 1, x: 10, y: 20, width: 80, height: 40, dash: "7 5" });
    expect(passes).toHaveLength(1);
    expect(passes[0].path).toContain("Q");
  });
});
