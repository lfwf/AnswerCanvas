import { composeAbortSignal } from "./openai-note-generator";

describe("composeAbortSignal", () => {
  it("forwards caller cancellation", () => { const caller = new AbortController(); const composed = composeAbortSignal(caller.signal, 10_000); caller.abort("cancelled"); expect(composed.signal.aborted).toBe(true); expect(composed.signal.reason).toBe("cancelled"); composed.cleanup(); });
  it("aborts on timeout", () => { vi.useFakeTimers(); const composed = composeAbortSignal(new AbortController().signal, 30_000); vi.advanceTimersByTime(30_000); expect(composed.signal.aborted).toBe(true); expect((composed.signal.reason as DOMException).name).toBe("TimeoutError"); composed.cleanup(); vi.useRealTimers(); });
});
