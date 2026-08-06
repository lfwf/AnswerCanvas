const fallbackPattern = /(?:\p{Regional_Indicator}{2}|\p{Extended_Pictographic}(?:\uFE0F|\p{Emoji_Modifier})?(?:\u200D\p{Extended_Pictographic}(?:\uFE0F|\p{Emoji_Modifier})?)*|\P{Mark}\p{Mark}*|\p{Mark}+)/gu;

export function splitGraphemes(value: string): string[] {
  const Segmenter = Intl.Segmenter;
  if (Segmenter) return Array.from(new Segmenter(undefined, { granularity: "grapheme" }).segment(value), (part) => part.segment);
  return value.match(fallbackPattern) ?? [];
}
export function countGraphemes(value: string): number { return splitGraphemes(value).length; }
