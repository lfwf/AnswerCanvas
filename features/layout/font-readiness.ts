import type { TextMeasurer } from "./text-measurer";

export interface FontReadyLike { ready: Promise<unknown>; }
export async function selectLockedTextMeasurer(options: { fonts?: FontReadyLike; primary: TextMeasurer; fallback: TextMeasurer; timeoutMs?: number; setTimer?: typeof setTimeout; clearTimer?: typeof clearTimeout; }): Promise<TextMeasurer> {
  const { fonts, primary, fallback, timeoutMs = 3000, setTimer = setTimeout, clearTimer = clearTimeout } = options;
  if (!fonts) return fallback;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<"fallback">((resolve) => { timer = setTimer(() => resolve("fallback"), timeoutMs); });
  const ready = fonts.ready.then(() => "primary" as const, () => "fallback" as const);
  const winner = await Promise.race([ready, timeout]);
  if (timer) clearTimer(timer);
  return winner === "primary" ? primary : fallback;
}
