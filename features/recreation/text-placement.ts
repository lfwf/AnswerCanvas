import { createSeededRandom, seedFromString, seededRange } from "@/features/layout/seeded-random";
import type { RecreationPaperStyle, RecreationText } from "./recreation-types";

export interface ResolvedTextPlacement {
  left: number;
  top: number;
  lineHeight?: number;
}

function clamp(value: number, min: number, max: number) { return Math.min(max, Math.max(min, value)); }

export function resolveTextPlacement(element: RecreationText, paper: RecreationPaperStyle): ResolvedTextPlacement {
  const style = element.style;
  const left = element.x + (style?.nudgeX ?? 0);
  let top = element.y + (style?.nudgeY ?? 0);
  let lineHeight = style?.lineHeight;
  if (paper.pattern === "ruled" && style?.snapToRule) {
    const spacing = paper.spacing;
    const offset = paper.patternOffset ?? spacing;
    const fontSize = style.fontSize ?? 17;
    const naturalLineHeight = lineHeight ?? Math.round(fontSize * 1.65);
    const baselineWithinLine = style.baselineShift ?? Math.min(naturalLineHeight * 0.78, fontSize * 1.08);
    const estimatedBaseline = top + baselineWithinLine;
    const snappedBaseline = offset + Math.round((estimatedBaseline - offset) / spacing) * spacing;
    top += clamp(snappedBaseline - estimatedBaseline, -spacing * 0.46, spacing * 0.46);
    if (lineHeight !== undefined && Math.abs(lineHeight - spacing) <= 3.25) lineHeight = spacing;
  }
  return { left, top, lineHeight };
}

export function characterTransform(elementId: string, index: number, amount = 1): string | undefined {
  if (amount <= 0) return undefined;
  const random = createSeededRandom(seedFromString(`${elementId}:${index}`));
  const x = seededRange(random, -0.22, 0.22) * amount;
  const y = seededRange(random, -0.52, 0.52) * amount;
  const rotate = seededRange(random, -0.42, 0.42) * amount;
  const scaleX = 1 + seededRange(random, -0.012, 0.012) * amount;
  return `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) rotate(${rotate.toFixed(2)}deg) scaleX(${scaleX.toFixed(3)})`;
}
