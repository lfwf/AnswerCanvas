import { characterTransform, resolveTextPlacement } from "./text-placement";

const ruledPaper = { background: "#fff", pattern: "ruled" as const, patternColor: "#ccd", spacing: 31, patternOffset: 30 };
const dottedPaper = { background: "#fff", pattern: "dots" as const, patternColor: "#ccd", spacing: 15 };

describe("text placement", () => {
  it("snaps ruled handwritten baselines by default", () => {
    const placement = resolveTextPlacement({ id: "line", kind: "text", order: 1, x: 20, y: 40, width: 300, text: "文字", style: { fontSize: 18, lineHeight: 29 } }, ruledPaper);
    const baseline = placement.top + Math.min((placement.lineHeight ?? 29) * 0.78, 18 * 1.08);
    expect(Math.abs((baseline - 30) % 31)).toBeLessThan(0.01);
    expect(placement.lineHeight).toBe(31);
  });

  it("honors explicit opt-out from ruled baseline snapping", () => {
    expect(resolveTextPlacement({ id: "label", kind: "text", order: 1, x: 20, y: 40, width: 100, text: "标签", style: { nudgeX: 2, nudgeY: -3, snapToRule: false } }, ruledPaper)).toEqual({ left: 22, top: 37, lineHeight: undefined });
  });

  it("never snaps dotted paper text to a ruled baseline", () => {
    expect(resolveTextPlacement({ id: "label", kind: "text", order: 1, x: 20, y: 40, width: 100, text: "标签", style: { nudgeY: 2 } }, dottedPaper)).toEqual({ left: 20, top: 42, lineHeight: undefined });
  });

  it("uses deterministic character jitter", () => {
    expect(characterTransform("text", 3, 0.8)).toBe(characterTransform("text", 3, 0.8));
    expect(characterTransform("text", 3, 0.8)).not.toBe(characterTransform("text", 4, 0.8));
  });
});
