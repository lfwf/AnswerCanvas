import { drawableGraphemes, findGraphemeRange, mergeRectsByLine } from "./recreation-geometry";

describe("recreation geometry", () => {
  it("finds a semantic phrase using drawable grapheme indexes", () => {
    expect(drawableGraphemes("第一行\n第二行")).toEqual(["第", "一", "行", "第", "二", "行"]);
    expect(findGraphemeRange("第一行\n第二行", "第二")).toEqual({ start: 3, end: 4 });
  });

  it("supports repeated phrases by occurrence", () => {
    expect(findGraphemeRange("skill 调用 skill", "skill", 2)).toEqual({ start: 9, end: 13 });
  });

  it("merges character boxes into separate line segments", () => {
    const segments = mergeRectsByLine([
      { left: 10, top: 20, right: 20, bottom: 40, width: 10, height: 20 },
      { left: 20, top: 21, right: 32, bottom: 40, width: 12, height: 19 },
      { left: 10, top: 55, right: 22, bottom: 75, width: 12, height: 20 },
    ]);
    expect(segments).toEqual([
      { x: 10, y: 20, width: 22, height: 20 },
      { x: 10, y: 55, width: 12, height: 20 },
    ]);
  });
});
