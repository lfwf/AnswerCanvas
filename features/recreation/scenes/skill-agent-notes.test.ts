import baseline from "@/tests/fixtures/skill-agent-scene-baseline.json";
import { skillAgentNotesScene } from "./skill-agent-notes";
import { isAnimatedElement, isStaticElement } from "../recreation-types";

describe("skill-agent-notes migration", () => {
  it("keeps the legacy element inventory and dynamic order sequence", () => {
    expect(skillAgentNotesScene.id).toBe("skill-agent-notes");
    expect(skillAgentNotesScene.width).toBe(baseline.width);
    expect(skillAgentNotesScene.height).toBe(baseline.height);
    expect(skillAgentNotesScene.elements).toHaveLength(baseline.elementCount);
    expect(skillAgentNotesScene.elements.filter(isAnimatedElement).map((element) => [element.id, element.order])).toEqual(baseline.dynamicSequence);
  });

  it("only converts the six whitelisted structural elements to static", () => {
    const expectedIds = baseline.staticWhitelist.map((element) => element.id);
    const staticElements = skillAgentNotesScene.elements.filter(isStaticElement);
    expect(staticElements.map((element) => element.id)).toEqual(expectedIds);
    for (const expected of baseline.staticWhitelist) {
      const actual = staticElements.find((element) => element.id === expected.id);
      expect(actual).toBeDefined();
      expect(actual).not.toHaveProperty("order");
      if (!actual) continue;
      if (expected.kind === "stroke" && actual.kind === "stroke") {
        expect({ path: actual.path, color: actual.color, width: actual.width }).toEqual({ path: expected.path, color: expected.color, width: expected.width });
      }
      if (expected.kind === "box" && actual.kind === "box") {
        expect({ x: actual.x, y: actual.y, width: actual.width, height: actual.height, stroke: actual.stroke, strokeWidth: actual.strokeWidth }).toEqual({ x: expected.x, y: expected.y, width: expected.width, height: expected.height, stroke: expected.stroke, strokeWidth: expected.strokeWidth });
      }
    }
  });

  it("uses the ruled paper protocol after migration", () => {
    expect(skillAgentNotesScene.paper).toMatchObject({ pattern: "ruled", spacing: 31 });
  });
});
