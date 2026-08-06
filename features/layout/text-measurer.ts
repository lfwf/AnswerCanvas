import { splitGraphemes } from "@/lib/text/graphemes";

export interface TextMeasurer { measure(text: string, fontSize: number, fontFamily?: string): number; }

const HANDWRITING_FONT_STACK = '"AnswerCanvasHandwriting", "Caveat", "STKaiti", "KaiTi", "Segoe Print", "Bradley Hand", cursive';
const LATIN_HANDWRITING_FONT_STACK = '"Caveat", "Segoe Print", "Bradley Hand", cursive';

export function createCanvasTextMeasurer(): TextMeasurer {
  const canvas = typeof document === "undefined" ? null : document.createElement("canvas");
  const context = canvas?.getContext("2d") ?? null;
  return {
    measure(text, fontSize, fontFamily = HANDWRITING_FONT_STACK) {
      if (!context) return Array.from(text).length * fontSize;
      return splitGraphemes(text).reduce((width, grapheme) => {
        const family = /[A-Za-z0-9]/u.test(grapheme) ? LATIN_HANDWRITING_FONT_STACK : fontFamily;
        context.font = `${fontSize}px ${family}`;
        return width + context.measureText(grapheme).width;
      }, 0);
    },
  };
}

export const fallbackTextMeasurer: TextMeasurer = {
  measure(text, fontSize) {
    return Array.from(text).reduce((sum, char) => sum + (/\p{Script=Han}/u.test(char) ? fontSize * 0.94 : fontSize * 0.55), 0);
  },
};
