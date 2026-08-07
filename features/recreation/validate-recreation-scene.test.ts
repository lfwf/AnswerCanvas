import { aiCoreConceptsScene } from "./scenes/ai-core-concepts";
import { skillAgentNotesScene } from "./scenes/skill-agent-notes";
import type { RecreationMark, RecreationScene } from "./recreation-types";
import { validateRecreationScene } from "./validate-recreation-scene";

describe("validateRecreationScene", () => {
  it("accepts both registered recreation scenes", () => {
    expect(validateRecreationScene(skillAgentNotesScene)).toEqual([]);
    expect(validateRecreationScene(aiCoreConceptsScene)).toEqual([]);
  });

  it("reports missing semantic mark targets", () => {
    const broken: RecreationScene = {
      ...aiCoreConceptsScene,
      elements: aiCoreConceptsScene.elements.map((element) => element.kind === "mark" ? { ...element, targetId: "missing" } : element),
    };
    expect(validateRecreationScene(broken).some((issue) => issue.includes("missing text"))).toBe(true);
  });

  it("reports a mark scheduled before its target text", () => {
    const firstMark = aiCoreConceptsScene.elements.find((element): element is RecreationMark => element.kind === "mark");
    expect(firstMark).toBeDefined();
    if (!firstMark || firstMark.animated === false) return;
    const broken: RecreationScene = {
      ...aiCoreConceptsScene,
      elements: aiCoreConceptsScene.elements.map((element) => element.id === firstMark.id ? { ...element, order: 0 } : element),
    };
    expect(validateRecreationScene(broken).some((issue) => issue.includes("must play after text"))).toBe(true);
  });
});
