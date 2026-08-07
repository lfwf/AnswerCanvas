import { findGraphemeRange, validateMark } from "./recreation-geometry";
import type { RecreationScene, RecreationText } from "./recreation-types";
import { isAnimatedElement, isStaticElement } from "./recreation-types";

export function validateRecreationScene(scene: RecreationScene): string[] {
  const issues: string[] = [];
  if (!scene.id) issues.push("scene id must be non-empty");
  if (!scene.title) issues.push("scene title must be non-empty");
  if (!Number.isFinite(scene.width) || scene.width <= 0) issues.push("scene width must be positive");
  if (!Number.isFinite(scene.height) || scene.height <= 0) issues.push("scene height must be positive");
  if (!Number.isFinite(scene.paper.spacing) || scene.paper.spacing <= 0) issues.push("paper spacing must be positive");

  const pageIds = new Set<string>();
  for (const page of scene.pages ?? []) {
    if (!page.id) issues.push("page id must be non-empty");
    else if (pageIds.has(page.id)) issues.push(`duplicate page id: ${page.id}`);
    else pageIds.add(page.id);
    if (!page.title) issues.push(`page ${page.id || "<empty>"} title must be non-empty`);
  }

  const ids = new Set<string>();
  const orders = new Set<number>();
  const texts = new Map<string, RecreationText>();
  for (const element of scene.elements) {
    const elementId = element.id;
    if (ids.has(elementId)) issues.push(`duplicate element id: ${elementId}`);
    ids.add(elementId);
    if (element.pageId && scene.pages?.length && !pageIds.has(element.pageId)) issues.push(`element ${elementId} references missing page ${element.pageId}`);
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
    if (element.kind === "view") {
      if (element.durationMs !== undefined && (!Number.isFinite(element.durationMs) || element.durationMs <= 0)) issues.push(`view ${element.id} has invalid duration`);
      if (element.dimOpacity !== undefined && (!Number.isFinite(element.dimOpacity) || element.dimOpacity < 0 || element.dimOpacity > 1)) issues.push(`view ${element.id} has invalid dimOpacity`);
    }
    if (element.kind === "page") {
      if (!scene.pages?.length) issues.push(`page turn ${element.id} requires scene pages`);
      else if (!pageIds.has(element.pageId)) issues.push(`page turn ${element.id} references missing page ${element.pageId}`);
      if (element.durationMs !== undefined && (!Number.isFinite(element.durationMs) || element.durationMs <= 0)) issues.push(`page turn ${element.id} has invalid duration`);
    }
  }

  for (const element of scene.elements) {
    if (element.kind === "mark") {
      const target = texts.get(element.targetId);
      if (!target) issues.push(`mark ${element.id} references missing text ${element.targetId}`);
      else {
        const issue = validateMark(element, target);
        if (issue) issues.push(issue);
        if (element.pageId && target.pageId && element.pageId !== target.pageId) issues.push(`mark ${element.id} must share page with text ${target.id}`);
        if (isAnimatedElement(element) && isAnimatedElement(target) && element.order <= target.order) issues.push(`mark ${element.id} must play after text ${target.id}`);
      }
      continue;
    }
    if (element.kind === "annotation") {
      const target = texts.get(element.targetId);
      if (!target) issues.push(`annotation ${element.id} references missing text ${element.targetId}`);
      else {
        if (!findGraphemeRange(target.text, element.match, element.occurrence)) issues.push(`annotation ${element.id} cannot find match in text ${target.id}`);
        if (element.pageId && target.pageId && element.pageId !== target.pageId) issues.push(`annotation ${element.id} must share page with text ${target.id}`);
        if (isAnimatedElement(target) && element.order <= target.order) issues.push(`annotation ${element.id} must play after text ${target.id}`);
      }
      continue;
    }
    if (element.kind === "view") {
      for (const targetId of element.targetIds ?? []) if (!ids.has(targetId)) issues.push(`view ${element.id} references missing element ${targetId}`);
    }
  }
  return issues;
}
