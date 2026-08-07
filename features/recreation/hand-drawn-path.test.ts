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

  it("roughens cubic, quadratic and closed source paths instead of returning print-perfect geometry", () => {
    const source = "M 20 40 C 30 10 70 10 80 40 Q 70 70 50 65 L 20 40 Z";
    const first = buildHandDrawnStrokePasses({ id: "curved-icon", kind: "stroke", order: 1, path: source });
    const second = buildHandDrawnStrokePasses({ id: "curved-icon", kind: "stroke", order: 1, path: source });
    expect(first).toEqual(second);
    expect(first).toHaveLength(2);
    expect(first[0].path).not.toBe(source);
    expect(first[0].path).toContain(" C ");
    expect(first[0].path).toContain(" Q ");
    expect((first[0].path.match(/\bM\b/g) ?? [])).toHaveLength(3);
  });

  it("keeps relative curve commands hand-drawn too", () => {
    const passes = buildHandDrawnStrokePasses({ id: "relative-curve", kind: "stroke", order: 1, path: "M 10 10 c 10 0 20 10 30 10 q 10 10 20 0" });
    expect(passes).toHaveLength(2);
    expect(passes[0].path).toContain(" C ");
    expect(passes[0].path).toContain(" Q ");
  });

  it("draws large rectangles as several uneven hand-drawn edge segments instead of four perfect sides", () => {
    const box = { id: "large-card", kind: "box" as const, order: 1, x: 40, y: 80, width: 720, height: 330, radius: 24, roughness: 1.8, bowing: 1.1 };
    const first = buildHandDrawnBoxPasses(box);
    const second = buildHandDrawnBoxPasses(box);
    expect(first).toEqual(second);
    expect(first).toHaveLength(2);
    expect((first[0].path.match(/\bQ\b/g) ?? []).length).toBeGreaterThan(14);
    expect(first[0].path).not.toBe(first[1].path);
  });

  it("uses one visibly wobbly pass for dashed boxes so dashes stay legible", () => {
    const passes = buildHandDrawnBoxPasses({ id: "box", kind: "box", order: 1, x: 10, y: 20, width: 620, height: 240, dash: "7 5", roughness: 1.8, bowing: 1.1 });
    expect(passes).toHaveLength(1);
    expect((passes[0].path.match(/\bQ\b/g) ?? []).length).toBeGreaterThan(10);
  });
});
