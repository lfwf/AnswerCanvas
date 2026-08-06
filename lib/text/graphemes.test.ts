import { countGraphemes, splitGraphemes } from "./graphemes";
describe("graphemes", () => { it("counts Chinese, combining marks and emoji sequences", () => { expect(countGraphemes("中文")).toBe(2); expect(countGraphemes("e\u0301")).toBe(1); expect(countGraphemes("👨‍👩‍👧‍👦")).toBe(1); expect(splitGraphemes("👍🏽a")).toEqual(["👍🏽", "a"]); }); });
