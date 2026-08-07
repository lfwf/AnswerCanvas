import { pagePresentationFor } from "./recreation-pages";
import type { RecreationScene } from "./recreation-types";

const scene: RecreationScene = {
  id: "pages-test",
  title: "Pages test",
  description: "Pages test",
  sourceName: "pages.png",
  createdAt: "2026-08-07",
  width: 100,
  height: 180,
  paper: { background: "#fff", pattern: "plain", patternColor: "transparent", spacing: 10 },
  pages: [{ id: "a", title: "A" }, { id: "b", title: "B" }, { id: "c", title: "C" }],
  elements: [
    { id: "a-text", kind: "text", pageId: "a", order: 1, x: 1, y: 1, width: 90, text: "A" },
    { id: "to-b", kind: "page", order: 2, pageId: "b", durationMs: 700, transition: "slide" },
    { id: "b-text", kind: "text", pageId: "b", order: 3, x: 1, y: 1, width: 90, text: "B" },
    { id: "to-c", kind: "page", order: 4, pageId: "c", durationMs: 700, transition: "fade" },
  ],
};

describe("pagePresentationFor", () => {
  it("starts on the first scene page", () => {
    expect(pagePresentationFor(scene, {})).toMatchObject({ currentPageId: "a", transitionProgress: 1 });
  });

  it("keeps outgoing and incoming pages during a page turn", () => {
    expect(pagePresentationFor(scene, { "to-b": 0.4 })).toMatchObject({ outgoingPageId: "a", incomingPageId: "b", transitionProgress: 0.4, transition: "slide" });
  });

  it("moves to the next page only after the turn completes", () => {
    expect(pagePresentationFor(scene, { "to-b": 1 })).toMatchObject({ currentPageId: "b" });
    expect(pagePresentationFor(scene, { "to-b": 1, "to-c": 0.5 })).toMatchObject({ outgoingPageId: "b", incomingPageId: "c", transition: "fade" });
  });

  it("completed presentation resolves to the final page", () => {
    expect(pagePresentationFor(scene, {}, true)).toMatchObject({ currentPageId: "c" });
  });
});
