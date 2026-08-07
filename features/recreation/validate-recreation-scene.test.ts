import { aiCoreConceptsScene } from "./scenes/ai-core-concepts";
import { immersiveGrammarAnalysisScene } from "./scenes/immersive-grammar-analysis";
import { skillAgentNotesScene } from "./scenes/skill-agent-notes";
import type { RecreationAnnotation, RecreationMark, RecreationScene, RecreationViewEffect } from "./recreation-types";
import { validateRecreationScene } from "./validate-recreation-scene";

describe("validateRecreationScene", () => {
  it("accepts registered recreation scenes including immersive analysis", () => {
    expect(validateRecreationScene(skillAgentNotesScene)).toEqual([]);
    expect(validateRecreationScene(aiCoreConceptsScene)).toEqual([]);
    expect(validateRecreationScene(immersiveGrammarAnalysisScene)).toEqual([]);
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
      elements: aiCoreConceptsScene.elements.map((element) => {
        if (element.kind !== "mark" || element.id !== firstMark.id || element.animated === false) return element;
        return { ...element, order: 0 };
      }),
    };
    expect(validateRecreationScene(broken).some((issue) => issue.includes("must play after text"))).toBe(true);
  });

  it("reports missing anchored annotation matches", () => {
    const first = immersiveGrammarAnalysisScene.elements.find((element): element is RecreationAnnotation => element.kind === "annotation");
    expect(first).toBeDefined();
    if (!first) return;
    const broken: RecreationScene = {
      ...immersiveGrammarAnalysisScene,
      elements: immersiveGrammarAnalysisScene.elements.map((element) => element.id === first.id ? { ...first, match: "not in source" } : element),
    };
    expect(validateRecreationScene(broken).some((issue) => issue.includes("cannot find match"))).toBe(true);
  });

  it("reports view effects that reference missing scene elements", () => {
    const first = immersiveGrammarAnalysisScene.elements.find((element): element is RecreationViewEffect => element.kind === "view" && element.mode === "focus");
    expect(first).toBeDefined();
    if (!first) return;
    const broken: RecreationScene = {
      ...immersiveGrammarAnalysisScene,
      elements: immersiveGrammarAnalysisScene.elements.map((element) => element.id === first.id ? { ...first, targetIds: [...(first.targetIds ?? []), "missing-element"] } : element),
    };
    expect(validateRecreationScene(broken).some((issue) => issue.includes("missing element"))).toBe(true);
  });

  it("reports invalid or missing per-element lecture visibility overrides", () => {
    const first = immersiveGrammarAnalysisScene.elements.find((element): element is RecreationViewEffect => element.kind === "view" && element.mode === "focus");
    expect(first).toBeDefined();
    if (!first) return;
    const broken: RecreationScene = {
      ...immersiveGrammarAnalysisScene,
      elements: immersiveGrammarAnalysisScene.elements.map((element) => element.id === first.id ? { ...first, elementOpacity: { ...(first.elementOpacity ?? {}), "missing-opacity-target": 1.4 } } : element),
    };
    const issues = validateRecreationScene(broken);
    expect(issues.some((issue) => issue.includes("invalid opacity"))).toBe(true);
    expect(issues.some((issue) => issue.includes("missing opacity element"))).toBe(true);
  });
});
