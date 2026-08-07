import { splitGraphemes } from "@/lib/text/graphemes";
import type { RecreationMark, RecreationText } from "./recreation-types";

export interface RecreationRect { left: number; top: number; right: number; bottom: number; width: number; height: number; }
export interface RecreationMarkSegment { x: number; y: number; width: number; height: number; }

export function drawableGraphemes(text: string): string[] {
  return splitGraphemes(text).filter((unit) => unit !== "\n" && unit !== "\r");
}

export function findGraphemeRange(text: string, match: string, occurrence = 1): { start: number; end: number } | null {
  if (!match || occurrence < 1) return null;
  const source = drawableGraphemes(text);
  const needle = drawableGraphemes(match);
  if (!needle.length || needle.length > source.length) return null;
  let found = 0;
  for (let start = 0; start <= source.length - needle.length; start += 1) {
    if (!needle.every((unit, index) => source[start + index] === unit)) continue;
    found += 1;
    if (found === occurrence) return { start, end: start + needle.length - 1 };
  }
  return null;
}

export function mergeRectsByLine(rects: RecreationRect[], tolerance = 3): RecreationMarkSegment[] {
  const sorted = [...rects].sort((a, b) => a.top - b.top || a.left - b.left);
  const lines: RecreationRect[][] = [];
  for (const rect of sorted) {
    const line = lines.find((candidate) => Math.abs(candidate[0].top - rect.top) <= tolerance);
    if (line) line.push(rect);
    else lines.push([rect]);
  }
  return lines.map((line) => {
    const left = Math.min(...line.map((rect) => rect.left));
    const right = Math.max(...line.map((rect) => rect.right));
    const top = Math.min(...line.map((rect) => rect.top));
    const bottom = Math.max(...line.map((rect) => rect.bottom));
    return { x: left, y: top, width: right - left, height: bottom - top };
  });
}

export function validateMark(mark: RecreationMark, text: RecreationText): string | null {
  if (mark.targetId !== text.id) return `mark ${mark.id} target mismatch`;
  if (!findGraphemeRange(text.text, mark.match, mark.occurrence)) return `mark ${mark.id} cannot find “${mark.match}” in ${text.id}`;
  return null;
}
