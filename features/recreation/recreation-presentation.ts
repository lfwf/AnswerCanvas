import type { RecreationElement, RecreationScene, RecreationViewEffect } from "./recreation-types";
import { isStaticElement } from "./recreation-types";

function clamp01(value: number) { return Math.max(0, Math.min(1, value)); }
function easeInOut(value: number) { const x = clamp01(value); return x * x * (3 - 2 * x); }

export function viewEffects(scene: RecreationScene): RecreationViewEffect[] {
  return scene.elements.filter((element): element is RecreationViewEffect => element.kind === "view").sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
}

export function presentationOpacityFor(element: RecreationElement, scene: RecreationScene, progress: Record<string, number> | undefined, completed = false): number {
  if (completed || isStaticElement(element) || element.kind === "view") return 1;
  let opacity = 1;
  for (const effect of viewEffects(scene)) {
    const value = easeInOut(progress?.[effect.id] ?? 0);
    if (value <= 0) continue;
    const createdAfterFocus = element.order > effect.order;
    const targetOpacity = effect.mode === "restore" || createdAfterFocus || effect.targetIds?.includes(element.id) ? 1 : clamp01(effect.dimOpacity ?? 0.08);
    opacity += (targetOpacity - opacity) * value;
  }
  return clamp01(opacity);
}
