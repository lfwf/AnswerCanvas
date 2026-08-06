import { currentRecreationScene } from "./current-scene";
import { withCurrentSceneAnnotations } from "./current-scene-annotations";
import { validateRecreationScene } from "./validate-recreation-scene";

describe("validateRecreationScene", () => {
  it("accepts the current annotated recreation scene", () => {
    expect(validateRecreationScene(withCurrentSceneAnnotations(currentRecreationScene))).toEqual([]);
  });

  it("reports missing semantic mark targets", () => {
    const scene = withCurrentSceneAnnotations(currentRecreationScene);
    const broken = { ...scene, elements: scene.elements.map((element) => element.kind === "mark" ? { ...element, targetId: "missing" } : element) };
    expect(validateRecreationScene(broken).some((issue) => issue.includes("missing text"))).toBe(true);
  });
});
