import { createNvdaAmdComparisonResult, isNvdaAmdComparison } from "./stock-comparison";

const csv = (closes: number[]) => `Date,Open,High,Low,Close,Volume\n${closes.map((close, index) => `202${index + 1}-01-31,1,1,1,${close},100`).join("\n")}`;

describe("stock comparison", () => {
  it("recognizes NVIDIA and AMD comparison questions", () => {
    expect(isNvdaAmdComparison("Can you compare NVIDIA and AMD stock performance?")).toBe(true);
    expect(isNvdaAmdComparison("什么是 NVIDIA？")).toBe(false);
  });

  it("normalizes both stocks from the same starting point", async () => {
    let id = 0;
    const fetcher = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      return new Response(url.includes("nvda.us") ? csv([10, 20, 30]) : csv([10, 15, 20]), { status: 200 });
    });
    const result = await createNvdaAmdComparisonResult(
      "Can you compare NVIDIA and AMD stock performance?",
      new AbortController().signal,
      { fetcher, now: new Date("2026-02-01T00:00:00Z"), idGenerator: () => `market-${++id}` },
    );
    const chart = result.note.blocks.find((block) => block.type === "line-chart");
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(result.mode).toBe("demo");
    expect(chart?.type).toBe("line-chart");
    if (chart?.type !== "line-chart") throw new Error("missing chart");
    expect(chart.series[0].points).toEqual([0, 100, 200]);
    expect(chart.series[1].points).toEqual([0, 50, 100]);
    expect(result.answer).toContain("200.0%");
  });
});
