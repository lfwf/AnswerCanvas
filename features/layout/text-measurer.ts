export interface TextMeasurer { measure(text: string, fontSize: number, fontFamily?: string): number; }

const HANDWRITING_FONT_STACK = '"AnswerCanvasHandwriting", "Caveat", "STKaiti", "KaiTi", "Segoe Print", "Bradley Hand", cursive';

export function createCanvasTextMeasurer(): TextMeasurer {
  const canvas = typeof document === "undefined" ? null : document.createElement("canvas");
  const context = canvas?.getContext("2d") ?? null;
  return {
    measure(text, fontSize, fontFamily = HANDWRITING_FONT_STACK) {
      if (!context) return Array.from(text).length * fontSize;
      context.font = `${fontSize}px ${fontFamily}`;
      return context.measureText(text).width;
    },
  };
}

export const fallbackTextMeasurer: TextMeasurer = {
  measure(text, fontSize) {
    return Array.from(text).reduce((sum, char) => sum + (/\p{Script=Han}/u.test(char) ? fontSize * 0.94 : fontSize * 0.55), 0);
  },
};
