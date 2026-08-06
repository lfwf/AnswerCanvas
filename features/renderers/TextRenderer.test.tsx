import { revealText } from "./TextRenderer";

describe("revealText", () => {
  it("reveals Chinese characters one at a time", () => {
    expect(revealText("你好世界", 0)).toBe("");
    expect(revealText("你好世界", 0.25)).toBe("你");
    expect(revealText("你好世界", 0.5)).toBe("你好");
    expect(revealText("你好世界", 1)).toBe("你好世界");
  });

  it("treats a ZWJ emoji as one visible grapheme", () => {
    expect(revealText("A👨‍👩‍👧‍👦B", 2 / 3)).toBe("A👨‍👩‍👧‍👦");
  });
});
