export interface TextMeasurer { measure(text: string, fontSize: number, fontFamily?: string): number; }

const HANDWRITING_FONT_STACK = '"Caveat", "LXGW WenKai", "FZKai-Z03", "STKaiti", "KaiTi", "Segoe Print", "Bradley Hand", "Comic Sans MS", cursive';

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
    return Array.from(text).reduce((sum, char) => sum + (/\p{Script=Han}/u.test(char) ? fontSize : fontSize * 0.54), 0);
  },
};
