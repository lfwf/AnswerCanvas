import { characterTransform, resolveTextPlacement } from "./text-placement";

describe("text placement", () => {
  it("snaps a handwritten baseline to the nearest paper rule", () => {
    const placement = resolveTextPlacement({ id: "line", kind: "text", order: 1, x: 20, y: 40, width: 300, text: "文字", style: { fontSize: 18, lineHeight: 29, snapToRule: true } }, { ruleSpacing: 31, ruleOffset: 30 });
    const baseline = placement.top + Math.min((placement.lineHeight ?? 29) * 0.78, 18 * 1.08);
    expect(Math.abs((baseline - 30) % 31)).toBeLessThan(0.01);
    expect(placement.lineHeight).toBe(31);
  });

  it("keeps unsnapped text at its authored coordinates plus nudges", () => {
    expect(resolveTextPlacement({ id: "label", kind: "text", order: 1, x: 20, y: 40, width: 100, text: "标签", style: { nudgeX: 2, nudgeY: -3 } }, { ruleSpacing: 31, ruleOffset: 30 })).toEqual({ left: 22, top: 37, lineHeight: undefined });
  });

  it("uses deterministic character jitter", () => {
    expect(characterTransform("text", 3, 0.8)).toBe(characterTransform("text", 3, 0.8));
    expect(characterTransform("text", 3, 0.8)).not.toBe(characterTransform("text", 4, 0.8));
  });
});
