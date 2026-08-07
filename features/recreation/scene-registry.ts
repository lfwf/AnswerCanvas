import { recreationScenes } from "./scenes";
import type { RecreationScene } from "./recreation-types";
import { isAnimatedElement, isStaticElement } from "./recreation-types";

export const DEFAULT_SCENE_ID = "ai-core-concepts";
const SCENE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const aliases: Readonly<Record<string, string>> = Object.freeze({
  "photo-1-skill-agent-notes": "skill-agent-notes",
});

export type SceneResolution =
  | { kind: "canonical"; scene: RecreationScene; canonicalId: string }
  | { kind: "alias"; scene: RecreationScene; canonicalId: string };

function assertScene(scene: RecreationScene, knownIds: Set<string>) {
  if (!SCENE_ID_PATTERN.test(scene.id)) throw new Error(`Invalid scene id: ${scene.id}`);
  if (knownIds.has(scene.id)) throw new Error(`Duplicate scene id: ${scene.id}`);
  knownIds.add(scene.id);
  if (!Number.isFinite(scene.width) || scene.width <= 0) throw new Error(`Scene ${scene.id} width must be positive`);
  if (!Number.isFinite(scene.height) || scene.height <= 0) throw new Error(`Scene ${scene.id} height must be positive`);
  if (!Number.isFinite(scene.paper.spacing) || scene.paper.spacing <= 0) throw new Error(`Scene ${scene.id} paper spacing must be positive`);

  const elementIds = new Set<string>();
  const orders = new Set<number>();
  for (const element of scene.elements) {
    if (!element.id) throw new Error(`Scene ${scene.id} contains an empty element id`);
    if (elementIds.has(element.id)) throw new Error(`Scene ${scene.id} contains duplicate element id: ${element.id}`);
    elementIds.add(element.id);
    if (isStaticElement(element)) {
      if ("order" in element && element.order !== undefined) throw new Error(`Static element ${scene.id}/${element.id} must not define order`);
      continue;
    }
    if (!isAnimatedElement(element) || !Number.isFinite(element.order) || element.order < 0) throw new Error(`Animated element ${scene.id}/${element.id} has invalid order`);
    if (orders.has(element.order)) throw new Error(`Scene ${scene.id} contains duplicate dynamic order: ${element.order}`);
    orders.add(element.order);
  }
}

const ids = new Set<string>();
for (const scene of recreationScenes) assertScene(scene, ids);
if (!ids.has(DEFAULT_SCENE_ID)) throw new Error(`Default scene is not registered: ${DEFAULT_SCENE_ID}`);
for (const [alias, canonicalId] of Object.entries(aliases)) {
  if (!SCENE_ID_PATTERN.test(alias)) throw new Error(`Invalid scene alias: ${alias}`);
  if (ids.has(alias)) throw new Error(`Scene alias collides with canonical id: ${alias}`);
  if (!ids.has(canonicalId)) throw new Error(`Scene alias ${alias} points to missing scene: ${canonicalId}`);
}

const sceneMap = new Map<string, RecreationScene>(recreationScenes.map((scene) => [scene.id, scene]));

export function isValidSceneSlug(value: string): boolean {
  return SCENE_ID_PATTERN.test(value);
}

export function listScenes(): RecreationScene[] {
  return [...recreationScenes];
}

export function getScene(sceneId: string): RecreationScene | undefined {
  if (!isValidSceneSlug(sceneId)) return undefined;
  return sceneMap.get(sceneId);
}

export function getDefaultScene(): RecreationScene {
  const scene = sceneMap.get(DEFAULT_SCENE_ID);
  if (!scene) throw new Error(`Default scene disappeared from registry: ${DEFAULT_SCENE_ID}`);
  return scene;
}

export function resolveSceneId(sceneId: string): SceneResolution | undefined {
  if (!isValidSceneSlug(sceneId)) return undefined;
  const canonical = sceneMap.get(sceneId);
  if (canonical) return { kind: "canonical", scene: canonical, canonicalId: canonical.id };
  const canonicalId = aliases[sceneId];
  if (!canonicalId) return undefined;
  const scene = sceneMap.get(canonicalId);
  if (!scene) return undefined;
  return { kind: "alias", scene, canonicalId };
}
