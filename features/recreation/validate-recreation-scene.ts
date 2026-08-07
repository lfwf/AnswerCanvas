import { validateMark } from "./recreation-geometry";
import type { RecreationScene, RecreationText } from "./recreation-types";
import { isAnimatedElement, isStaticElement } from "./recreation-types";

export function validateRecreationScene(scene: RecreationScene): string[] {
  const issues: string[] = [];
  if (!scene.id) issues.push("scene id must be non-empty");
  if (!scene.title) issues.push("scene title must be non-empty");
  if (!Number.isFinite(scene.width) || scene.width <= 0) issues.push("scene width must be positive");
  if (!Number.isFinite(scene.height) || scene.height <= 0) issues.push("scene height must be positive");
  if (!Number.isFinite(scene.paper.spacing) || scene.paper.spacing <= 0) issues.push("paper spacing must be positive");

  const ids = new Set<string>();
  const orders = new Set<number>();
  const texts = new Map<string, RecreationText>();
  for (const element of scene.elements) {
    const elementId = element.id;
    if (ids.has(elementId)) issues.push(`duplicate element id: ${elementId}`);
    ids.add(elementId);
    if (isStaticElement(element)) {
      const order = (element as { order?: unknown }).order;
      if (order !== undefined) issues.push(`static element ${elementId} must not define order`);
    } else if (isAnimatedElement(element)) {
      if (!Number.isFinite(element.order) || element.order < 0) issues.push(`element ${elementId} has invalid order`);
      else if (orders.has(element.order)) issues.push(`duplicate dynamic order: ${element.order}`);
      else orders.add(element.order);
    }

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
      if (isAnimatedElement(element) && isAnimatedElement(target) && element.order <= target.order) issues.push(`mark ${element.id} must play after text ${target.id}`);
    }
  }
  return issues;
}
