import { createDemoChatResult } from "./demo-note";

describe("createDemoChatResult", () => {
  it("creates deterministic Skill demo content", () => {
    let index = 0;
    const ids = () => `id-${++index}`;
    const result = createDemoChatResult("什么是 Skill？", ids);
    expect(result.mode).toBe("demo");
    expect(result.note.question).toBe("什么是 Skill？");
    expect(result.note.blocks.filter((block) => block.type === "text" || block.type === "bullet-list").length).toBeGreaterThanOrEqual(2);
    expect(result.note.blocks.some((block) => block.type === "flow-diagram" && block.nodes.length === 3)).toBe(true);
    expect(JSON.stringify(result.note)).toContain("highlight");
  });

  it("creates a chart demo with multiple annotations and shared-scale series", () => {
    let index = 0;
    const result = createDemoChatResult("比较 NVIDIA 和 AMD 的趋势图", () => `chart-${++index}`);
    const chart = result.note.blocks.find((block) => block.type === "line-chart");
    const text = result.note.blocks.find((block) => block.type === "text");
    expect(chart?.type).toBe("line-chart");
    expect(chart?.type === "line-chart" && chart.series).toHaveLength(2);
    expect(text?.type === "text" && text.annotations.map((annotation) => annotation.type)).toEqual(["highlight", "highlight", "strike", "circle"]);
    expect(result.answer).toContain("不代表真实股票行情");
  });
});
