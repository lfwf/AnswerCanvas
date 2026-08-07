import { aiCoreConceptsScene } from "./ai-core-concepts";
import { isAnimatedElement, isStaticElement } from "../recreation-types";

describe("ai-core-concepts scene", () => {
  it("uses the reference image canvas and dotted paper", () => {
    expect(aiCoreConceptsScene.width).toBe(1055);
    expect(aiCoreConceptsScene.height).toBe(1466);
    expect(aiCoreConceptsScene.paper).toMatchObject({ pattern: "dots", spacing: 15 });
  });

  it("contains five Cue groups, five Notes sections and Summary", () => {
    const ids = new Set(aiCoreConceptsScene.elements.map((element) => element.id));
    for (const id of ["cue-ai", "cue-components", "cue-types", "cue-applications", "cue-trends", "ai-title", "components-title", "types-title", "applications-title", "trends-title", "summary-title"]) expect(ids.has(id)).toBe(true);
  });

  it("contains the expected visual explanation groups", () => {
    const ids = new Set(aiCoreConceptsScene.elements.map((element) => element.id));
    for (const id of ["brain-profile", "flow-data", "flow-application", "pyramid-left", "icon-manufacturing", "icon-health", "icon-car", "icon-cart", "icon-chat", "balance-top", "mind-ai"]) expect(ids.has(id)).toBe(true);
  });

  it("keeps page structure static and content animated", () => {
    const staticIds = aiCoreConceptsScene.elements.filter(isStaticElement).map((element) => element.id);
    expect(staticIds).toEqual(["page-frame", "header-line-left-1", "header-line-left-2", "header-line-right-1", "header-line-right-2", "table-heading-bottom", "table-divider", "summary-divider"]);
    expect(aiCoreConceptsScene.elements.filter(isAnimatedElement).length).toBeGreaterThan(60);
  });
});
