import { ChatService } from "./chat-service";
import { createDemoChatResult } from "@/features/notes/demo-note";

const raw = { answer: "Skill 是可复用的能力模块。", note: { id: "raw-note", question: "AI 不应控制这个字段", title: "Skill", blocks: [{ type: "text", id: "raw-block", spans: [{ id: "raw-span", text: "把稳定的方法、工具和约束封装起来。" }], annotations: [] }], arrows: [], truncated: false } };

describe("ChatService", () => {
  it("uses deterministic demo mode without calling a generator", async () => {
    const generate = vi.fn(); const service = new ChatService({ generator: { generate, repair: vi.fn() }, idGenerator: () => "demo-id" });
    const result = await service.answer("什么是 Skill？", new AbortController().signal);
    expect(generate).not.toHaveBeenCalled(); expect(result.mode).toBe("demo"); expect(result.note.question).toBe("什么是 Skill？");
  });

  it("routes NVIDIA AMD comparisons through the market provider", async () => {
    const marketResult = createDemoChatResult("Can you compare NVIDIA and AMD stock performance?", (() => { let id = 0; return () => `stock-${++id}`; })());
    const stockComparisonProvider = vi.fn().mockResolvedValue(marketResult);
    const generate = vi.fn();
    const service = new ChatService({ stockComparisonProvider, generator: { generate, repair: vi.fn() } });
    const result = await service.answer("Can you compare NVIDIA and AMD stock performance?", new AbortController().signal);
    expect(stockComparisonProvider).toHaveBeenCalledTimes(1);
    expect(generate).not.toHaveBeenCalled();
    expect(result.note.question).toContain("NVIDIA");
  });

  it("injects the validated question and ignores the AI question", async () => {
    const service = new ChatService({ apiKey: "test", generator: { generate: vi.fn().mockResolvedValue(raw), repair: vi.fn() } });
    const result = await service.answer("服务端问题", new AbortController().signal);
    expect(result.mode).toBe("openai"); expect(result.note.question).toBe("服务端问题");
  });

  it("repairs once and then returns a valid fallback", async () => {
    const generator = { generate: vi.fn().mockResolvedValue({ answer: "可保留的回答", note: null }), repair: vi.fn().mockResolvedValue({ invalid: true }) };
    const service = new ChatService({ apiKey: "test", generator, idGenerator: () => "fallback-id" });
    const result = await service.answer("问题", new AbortController().signal);
    expect(generator.repair).toHaveBeenCalledTimes(1); expect(result.mode).toBe("fallback"); expect(result.answer).toBe("可保留的回答"); expect(result.note.question).toBe("问题");
  });
});
