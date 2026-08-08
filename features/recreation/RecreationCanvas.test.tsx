import { render } from "@testing-library/react";
import { RecreationCanvas } from "./RecreationCanvas";
import type { RecreationScene } from "./recreation-types";

const scene: RecreationScene = {
  id: "canvas-test",
  title: "Canvas test",
  description: "Canvas test",
  sourceName: "test.png",
  createdAt: "2026-08-07",
  width: 200,
  height: 120,
  paper: { background: "#fff", pattern: "dots", patternColor: "#ddd", spacing: 12 },
  elements: [
    { id: "structure", kind: "stroke", animated: false, path: "M 10 10 L 190 10", handDrawn: false },
    { id: "title", kind: "text", order: 1, x: 20, y: 30, width: 160, text: "测试" },
  ],
};

const pagedScene: RecreationScene = {
  ...scene,
  id: "paged-canvas-test",
  width: 900,
  height: 1600,
  paper: { background: "#f5efe2", pattern: "plain", patternColor: "transparent", spacing: 40 },
  pages: [{ id: "one", title: "One" }],
  elements: [
    { id: "box-copy", kind: "text", pageId: "one", order: 1, x: 100, y: 100, width: 190, text: "多任务切换更轻松", style: { fontSize: 58, lineHeight: 72 } },
  ],
};

describe("RecreationCanvas", () => {
  it("renders static structure immediately while dynamic text stays hidden", () => {
    const { container } = render(<RecreationCanvas scene={scene} progress={{}} />);
    expect(container.querySelector('[data-drawn-element="structure"]')).toHaveAttribute("stroke-opacity", "1");
    const chars = Array.from(container.querySelectorAll('[data-text-id="title"] [data-grapheme-index]')) as HTMLElement[];
    expect(chars.every((char) => char.style.visibility === "hidden")).toBe(true);
  });

  it("renders every dynamic element complete in thumbnail mode", () => {
    const { container } = render(<RecreationCanvas scene={scene} completed />);
    const chars = Array.from(container.querySelectorAll('[data-text-id="title"] [data-grapheme-index]')) as HTMLElement[];
    expect(chars.every((char) => char.style.visibility === "visible")).toBe(true);
    expect(container.querySelector("button")).toBeNull();
    expect(container.querySelector("select")).toBeNull();
    expect(container.querySelector("svg")?.getAttribute("viewBox")).toBe("0 0 200 120");
  });

  it("adds visible paper fiber texture to paged video scenes", () => {
    const { container } = render(<RecreationCanvas scene={pagedScene} completed pageId="one" />);
    const paper = container.querySelector<HTMLElement>(".recreation-paper");
    expect(paper?.style.backgroundImage).toContain("repeating-linear-gradient");
    expect(paper?.style.backgroundImage).toContain("radial-gradient");
  });

  it("fits enlarged paged text inside its authored width instead of overflowing", () => {
    const { container } = render(<RecreationCanvas scene={pagedScene} completed pageId="one" />);
    const copy = container.querySelector<HTMLElement>('[data-text-id="box-copy"]');
    expect(Number(copy?.dataset.fitScale)).toBeLessThan(1);
    expect(Number.parseFloat(copy?.style.fontSize ?? "0")).toBeLessThan(58 * 1.18);
    expect(copy?.style.width).toBe("190px");
  });
});
