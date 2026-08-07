import type { RecreationElement, RecreationScene, RecreationViewEffect } from "./recreation-types";
import { isStaticElement } from "./recreation-types";

function clamp01(value: number) { return Math.max(0, Math.min(1, value)); }
function easeInOut(value: number) { const x = clamp01(value); return x * x * (3 - 2 * x); }

export function viewEffects(scene: RecreationScene): RecreationViewEffect[] {
  return scene.elements.filter((element): element is RecreationViewEffect => element.kind === "view").sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
}

function targetOpacityFor(element: RecreationElement, effect: RecreationViewEffect): number {
  if (effect.mode === "restore") return 1;
  const explicit = effect.elementOpacity?.[element.id];
  if (explicit !== undefined) return clamp01(explicit);
  if (effect.targetIds?.includes(element.id)) return 1;
  return clamp01(effect.dimOpacity ?? 0.08);
}

export function presentationOpacityFor(element: RecreationElement, scene: RecreationScene, progress: Record<string, number> | undefined, completed = false): number {
  if (completed || isStaticElement(element) || element.kind === "view") return 1;
  let opacity = 1;
  for (const effect of viewEffects(scene)) {
    const value = easeInOut(progress?.[effect.id] ?? 0);
    if (value <= 0) continue;
    const createdAfterEffect = element.order > effect.order;
    const targetOpacity = createdAfterEffect ? 1 : targetOpacityFor(element, effect);
    opacity += (targetOpacity - opacity) * value;
  }
  return clamp01(opacity);
}
