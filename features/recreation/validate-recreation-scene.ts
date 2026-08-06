import { validateMark } from "./recreation-geometry";
import type { RecreationScene, RecreationText } from "./recreation-types";

export function validateRecreationScene(scene: RecreationScene): string[] {
  const issues: string[] = [];
  if (!Number.isFinite(scene.width) || scene.width <= 0) issues.push("scene width must be positive");
  if (!Number.isFinite(scene.height) || scene.height <= 0) issues.push("scene height must be positive");

  const ids = new Set<string>();
  const texts = new Map<string, RecreationText>();
  for (const element of scene.elements) {
    if (ids.has(element.id)) issues.push(`duplicate element id: ${element.id}`);
    ids.add(element.id);
    if (!Number.isFinite(element.order)) issues.push(`element ${element.id} has invalid order`);
    if (element.kind === "text") {
      texts.set(element.id, element);
      if (element.x < 0 || element.y < 0 || element.x + element.width > scene.width + 0.5) issues.push(`text ${element.id} is outside scene bounds`);
      if (element.height !== undefined && element.y + element.height > scene.height + 0.5) issues.push(`text ${element.id} height exceeds scene bounds`);
      const lineHeight = element.style?.lineHeight ?? Math.round((element.style?.fontSize ?? 17) * 1.65);
      const requiredHeight = element.text.split(/\r?\n/u).length * lineHeight;
      if (element.height !== undefined && requiredHeight > element.height + 1) issues.push(`text ${element.id} height is too small for explicit lines`);
    }
    if (element.kind === "box" && (element.x < 0 || element.y < 0 || element.x + element.width > scene.width + 0.5 || element.y + element.height > scene.height + 0.5)) issues.push(`box ${element.id} is outside scene bounds`);
  }

  for (const element of scene.elements) {
    if (element.kind !== "mark") continue;
    const target = texts.get(element.targetId);
    if (!target) issues.push(`mark ${element.id} references missing text ${element.targetId}`);
    else {
      const issue = validateMark(element, target);
      if (issue) issues.push(issue);
    }
  }
  return issues;
}
