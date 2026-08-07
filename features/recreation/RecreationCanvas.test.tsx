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
});
