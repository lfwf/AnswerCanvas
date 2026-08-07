import { presentationOpacityFor } from "./recreation-presentation";
import type { RecreationScene } from "./recreation-types";

const scene: RecreationScene = {
  id: "focus-test",
  title: "Focus test",
  description: "Focus test",
  sourceName: "focus.png",
  createdAt: "2026-08-07",
  width: 200,
  height: 120,
  paper: { background: "#fff", pattern: "plain", patternColor: "transparent", spacing: 12 },
  elements: [
    { id: "frame", kind: "stroke", animated: false, path: "M 0 0 L 200 0" },
    { id: "sentence", kind: "text", order: 1, x: 10, y: 20, width: 180, text: "Although I was tired" },
    { id: "notes", kind: "text", order: 2, x: 10, y: 70, width: 180, text: "notes" },
    { id: "focus", kind: "view", order: 3, mode: "focus", targetIds: ["sentence"], dimOpacity: 0.1 },
    { id: "new-analysis", kind: "text", order: 4, x: 10, y: 90, width: 180, text: "new analysis" },
    { id: "restore", kind: "view", order: 5, mode: "restore" },
  ],
};

const sentence = scene.elements[1];
const notes = scene.elements[2];
const frame = scene.elements[0];
const newAnalysis = scene.elements[4];

describe("presentationOpacityFor", () => {
  it("fades earlier non-target content while preserving focus targets and static paper structure", () => {
    const progress = { focus: 1 };
    expect(presentationOpacityFor(sentence, scene, progress)).toBe(1);
    expect(presentationOpacityFor(notes, scene, progress)).toBeCloseTo(0.1);
    expect(presentationOpacityFor(frame, scene, progress)).toBe(1);
  });

  it("keeps content created after the active focus event visible", () => {
    expect(presentationOpacityFor(newAnalysis, scene, { focus: 1 })).toBe(1);
  });

  it("interpolates focus transitions instead of popping visibility", () => {
    expect(presentationOpacityFor(notes, scene, { focus: 0.5 })).toBeCloseTo(0.55);
  });

  it("restores every dynamic element and completed thumbnails ignore temporary focus", () => {
    const progress = { focus: 1, restore: 1 };
    expect(presentationOpacityFor(notes, scene, progress)).toBe(1);
    expect(presentationOpacityFor(notes, scene, { focus: 1 }, true)).toBe(1);
  });
});
