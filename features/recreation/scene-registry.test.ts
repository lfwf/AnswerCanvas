import { DEFAULT_SCENE_ID, getDefaultScene, getScene, isValidSceneSlug, listScenes, resolveSceneId } from "./scene-registry";

describe("scene registry", () => {
  it("lists both canonical scenes in stable order", () => {
    expect(listScenes().map((scene) => scene.id)).toEqual(["ai-core-concepts", "skill-agent-notes"]);
    expect(getDefaultScene().id).toBe(DEFAULT_SCENE_ID);
  });

  it("keeps getScene canonical-only", () => {
    expect(getScene("skill-agent-notes")?.id).toBe("skill-agent-notes");
    expect(getScene("photo-1-skill-agent-notes")).toBeUndefined();
    expect(getScene("missing-scene")).toBeUndefined();
  });

  it("resolves the legacy id as an explicit alias", () => {
    expect(resolveSceneId("photo-1-skill-agent-notes")).toMatchObject({ kind: "alias", canonicalId: "skill-agent-notes" });
    expect(resolveSceneId("ai-core-concepts")).toMatchObject({ kind: "canonical", canonicalId: "ai-core-concepts" });
  });

  it("rejects unsafe or non-canonical slug shapes", () => {
    expect(isValidSceneSlug("AI-Core-Concepts")).toBe(false);
    expect(resolveSceneId("AI-Core-Concepts")).toBeUndefined();
    expect(resolveSceneId("../ai-core-concepts")).toBeUndefined();
    expect(resolveSceneId("ai/core-concepts")).toBeUndefined();
    expect(resolveSceneId("ai%2Fcore-concepts")).toBeUndefined();
  });
});
