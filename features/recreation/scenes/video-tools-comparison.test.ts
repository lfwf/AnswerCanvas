import { validateRecreationScene } from "../validate-recreation-scene";
import { videoToolsComparisonScene } from "./video-tools-comparison";

function byId(id: string) {
  const element = videoToolsComparisonScene.elements.find((item) => item.id === id);
  if (!element) throw new Error(`missing ${id}`);
  return element;
}

function order(id: string) {
  const element = byId(id);
  if (element.animated === false) throw new Error(`${id} is static`);
  return element.order;
}

describe("video tools comparison paged handwriting scene", () => {
  it("uses five vertical pages and intentionally omits point two", () => {
    expect(videoToolsComparisonScene.width).toBe(900);
    expect(videoToolsComparisonScene.height).toBe(1600);
    expect(videoToolsComparisonScene.pages?.map((page) => page.id)).toEqual(["cover", "impression", "best-for", "choice", "summary"]);
    expect(videoToolsComparisonScene.pages?.some((page) => /2/u.test(page.title))).toBe(false);
    expect(videoToolsComparisonScene.elements.some((element) => element.kind === "text" && /核心能力打分|5分制/u.test(element.text))).toBe(false);
  });

  it("writes each impression card in human reading order", () => {
    expect(order("k-card")).toBeLessThan(order("k-name"));
    expect(order("k-name")).toBeLessThan(order("k-copy"));
    expect(order("k-copy")).toBeLessThan(order("k-icon-screen"));
    expect(order("v-card")).toBeLessThan(order("v-name"));
    expect(order("r-card")).toBeLessThan(order("r-name"));
    expect(order("h-card")).toBeLessThan(order("h-name"));
  });

  it("reveals recommendation questions before arrows and answers", () => {
    for (const index of [1, 2, 3, 4] as const) {
      expect(order(`choice-${index}-box`)).toBeLessThan(order(`choice-${index}-q`));
      expect(order(`choice-${index}-q`)).toBeLessThan(order(`choice-${index}-arrow`));
      expect(order(`choice-${index}-arrow`)).toBeLessThan(order(`choice-${index}-a`));
    }
  });

  it("holds every completed content page before flipping", () => {
    for (const id of ["cover-hold", "impression-hold", "best-for-hold", "choice-hold"] as const) {
      const element = byId(id);
      if (element.kind !== "view") throw new Error(`${id} is not a hold`);
      expect(element.durationMs).toBeGreaterThanOrEqual(1000);
    }
    expect(order("cover-hold")).toBeLessThan(order("turn-impression"));
    expect(order("impression-hold")).toBeLessThan(order("turn-best"));
    expect(order("best-for-hold")).toBeLessThan(order("turn-choice"));
    expect(order("choice-hold")).toBeLessThan(order("turn-summary"));
  });

  it("uses clear silent-video takeaways instead of implementation copy", () => {
    for (const id of ["impression-bottom", "best-footer", "choice-footer", "summary-end"] as const) expect(byId(id)).toBeTruthy();
    expect(videoToolsComparisonScene.elements.some((element) => element.kind === "text" && /先写|再画|播放器|实现/u.test(element.text))).toBe(false);
  });

  it("passes the shared scene validator", () => {
    expect(validateRecreationScene(videoToolsComparisonScene)).toEqual([]);
  });
});
