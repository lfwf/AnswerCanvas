import { validateRecreationScene } from "../validate-recreation-scene";
import { llmReceivesSentenceScene } from "./llm-receives-sentence";

function byId(id: string) {
  const element = llmReceivesSentenceScene.elements.find((item) => item.id === id);
  if (!element) throw new Error(`missing ${id}`);
  return element;
}

function order(id: string) {
  const element = byId(id);
  if (element.animated === false) throw new Error(`${id} is static`);
  return element.order;
}

describe("LLM receives sentence paged handwriting scene", () => {
  it("uses nine vertical pages from cover through seven steps and final summary", () => {
    expect(llmReceivesSentenceScene.width).toBe(900);
    expect(llmReceivesSentenceScene.height).toBe(1600);
    expect(llmReceivesSentenceScene.snapshotRevision).toBe("2026-08-08.1");
    expect(llmReceivesSentenceScene.pages?.map((page) => page.id)).toEqual([
      "cover", "input", "token", "embedding", "attention", "predict", "generate", "check", "summary",
    ]);
  });

  it("holds each completed teaching page before flipping to the next one", () => {
    for (const id of ["cover-hold", "input-hold", "token-hold", "embedding-hold", "attention-hold", "predict-hold", "generate-hold", "check-hold"] as const) {
      const element = byId(id);
      if (element.kind !== "view") throw new Error(`${id} is not a view hold`);
      expect(element.durationMs).toBeGreaterThanOrEqual(1000);
    }
    expect(order("cover-hold")).toBeLessThan(order("turn-input"));
    expect(order("input-hold")).toBeLessThan(order("turn-token"));
    expect(order("token-hold")).toBeLessThan(order("turn-embedding"));
    expect(order("embedding-hold")).toBeLessThan(order("turn-attention"));
    expect(order("attention-hold")).toBeLessThan(order("turn-predict"));
    expect(order("predict-hold")).toBeLessThan(order("turn-generate"));
    expect(order("generate-hold")).toBeLessThan(order("turn-check"));
    expect(order("check-hold")).toBeLessThan(order("turn-summary"));
  });

  it("builds Token boxes only after the original sentence has been written", () => {
    expect(order("token-source-text")).toBeLessThan(order("token-down"));
    expect(order("token-down")).toBeLessThan(order("tok-1"));
    expect(order("tok-1")).toBeLessThan(order("tok-1-t"));
    expect(order("tok-6")).toBeLessThan(order("tok-6-t"));
    expect(order("tok-6-t")).toBeLessThan(order("token-note"));
  });

  it("draws vectors and attention relationships in a teachable order", () => {
    expect(order("embed-token-a-t")).toBeLessThan(order("embed-arrow-a"));
    expect(order("embed-arrow-a")).toBeLessThan(order("embed-vector-a"));
    expect(order("embed-vector-a")).toBeLessThan(order("embed-vector-a-t"));
    expect(order("attn-center-t")).toBeLessThan(order("attn-a1"));
    expect(order("attn-bottom-t")).toBeLessThan(order("attn-a4"));
    expect(order("attn-a4")).toBeLessThan(order("attn-key"));
  });

  it("shows prediction as a chain and continuous generation as a loop before the final answer", () => {
    expect(order("pred-1-t")).toBeLessThan(order("pred-a1"));
    expect(order("pred-a1")).toBeLessThan(order("pred-2"));
    expect(order("pred-a2")).toBeLessThan(order("pred-3"));
    expect(order("pred-down")).toBeLessThan(order("pred-next"));
    expect(order("gen-context-t")).toBeLessThan(order("gen-loop-a"));
    expect(order("gen-next-t")).toBeLessThan(order("gen-loop-b"));
    expect(order("gen-loop-b")).toBeLessThan(order("gen-out"));
    expect(order("gen-out")).toBeLessThan(order("gen-answer"));
  });

  it("draws each output check before writing the final organized answer", () => {
    expect(order("check-fluent-tick")).toBeLessThan(order("check-format-box"));
    expect(order("check-format-tick")).toBeLessThan(order("check-safe-box"));
    expect(order("check-safe-tick")).toBeLessThan(order("check-complete-box"));
    expect(order("check-complete-tick")).toBeLessThan(order("check-arrow"));
    expect(order("check-arrow")).toBeLessThan(order("check-output"));
  });

  it("keeps the final page focused on the predictive-generation principle", () => {
    const core = byId("summary-core");
    const phenomena = byId("summary-phenomena");
    if (core.kind !== "text" || phenomena.kind !== "text") throw new Error("summary text missing");
    expect(core.text).toContain("一步步预测下一个 Token");
    expect(phenomena.text).toContain("连续生成");
    expect(phenomena.text).toContain("Attention");
    expect(phenomena.text).toContain("本质是在预测");
  });

  it("passes the shared scene validator", () => {
    expect(validateRecreationScene(llmReceivesSentenceScene)).toEqual([]);
  });
});
