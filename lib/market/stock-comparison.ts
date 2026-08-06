import { chatResultSchema, defaultNoteTheme, type ChatResult } from "@/features/notes/note-schema";

interface PriceRow { date: string; close: number; }
type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export function isNvdaAmdComparison(question: string) {
  const normalized = question.toLowerCase();
  const hasNvda = /nvidia|nvda|英伟达/.test(normalized);
  const hasAmd = /\bamd\b|超威半导体/.test(normalized);
  const comparison = /compare|comparison|performance|走势|表现|比较|对比|涨幅|回报/.test(normalized);
  return hasNvda && hasAmd && comparison;
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10).replaceAll("-", "");
}

function parseCsv(csv: string): PriceRow[] {
  const lines = csv.trim().split(/\r?\n/u);
  if (lines.length < 3) throw new Error("market data is empty");
  const headers = lines[0].split(",");
  const dateIndex = headers.indexOf("Date");
  const closeIndex = headers.indexOf("Close");
  if (dateIndex < 0 || closeIndex < 0) throw new Error("market data columns are missing");
  return lines.slice(1).flatMap((line) => {
    const columns = line.split(",");
    const close = Number(columns[closeIndex]);
    const date = columns[dateIndex];
    return date && Number.isFinite(close) && close > 0 ? [{ date, close }] : [];
  }).sort((a, b) => a.date.localeCompare(b.date));
}

async function fetchMonthlyPrices(symbol: string, start: Date, end: Date, signal: AbortSignal, fetcher: FetchLike): Promise<PriceRow[]> {
  const url = new URL("https://stooq.com/q/d/l/");
  url.searchParams.set("s", `${symbol.toLowerCase()}.us`);
  url.searchParams.set("d1", formatDate(start));
  url.searchParams.set("d2", formatDate(end));
  url.searchParams.set("i", "m");
  const response = await fetcher(url, { signal, headers: { accept: "text/csv" }, cache: "no-store" });
  if (!response.ok) throw new Error(`market data request failed: ${response.status}`);
  return parseCsv(await response.text());
}

function sampleIndexes(length: number, limit = 24) {
  if (length <= limit) return Array.from({ length }, (_, index) => index);
  return Array.from({ length: limit }, (_, index) => Math.round(index * (length - 1) / (limit - 1)));
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function idFactory(generator?: () => string) {
  const used = new Set<string>();
  return () => {
    let id = (generator?.() || crypto.randomUUID()).slice(0, 120);
    while (used.has(id)) id = `${id.slice(0, 112)}-${used.size + 1}`;
    used.add(id);
    return id;
  };
}

export async function createNvdaAmdComparisonResult(
  question: string,
  signal: AbortSignal,
  options: { fetcher?: FetchLike; now?: Date; idGenerator?: () => string } = {},
): Promise<ChatResult> {
  const now = options.now ?? new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear() - 5, now.getUTCMonth(), now.getUTCDate()));
  const fetcher = options.fetcher ?? fetch;
  const [nvdaRows, amdRows] = await Promise.all([
    fetchMonthlyPrices("NVDA", start, now, signal, fetcher),
    fetchMonthlyPrices("AMD", start, now, signal, fetcher),
  ]);

  const amdByDate = new Map(amdRows.map((row) => [row.date, row.close]));
  const common = nvdaRows.flatMap((row) => {
    const amdClose = amdByDate.get(row.date);
    return amdClose ? [{ date: row.date, nvda: row.close, amd: amdClose }] : [];
  });
  if (common.length < 2) throw new Error("not enough overlapping market data");

  const selected = sampleIndexes(common.length).map((index) => common[index]);
  const nvdaBase = selected[0].nvda;
  const amdBase = selected[0].amd;
  const nvdaPoints = selected.map((row) => round((row.nvda / nvdaBase - 1) * 100));
  const amdPoints = selected.map((row) => round((row.amd / amdBase - 1) * 100));
  const nvdaReturn = nvdaPoints.at(-1) ?? 0;
  const amdReturn = amdPoints.at(-1) ?? 0;
  const leader = nvdaReturn >= amdReturn ? "NVIDIA" : "AMD";
  const leaderReturn = Math.max(nvdaReturn, amdReturn);
  const trailing = leader === "NVIDIA" ? "AMD" : "NVIDIA";
  const trailingReturn = Math.min(nvdaReturn, amdReturn);
  const lastDate = selected.at(-1)!.date;
  const ids = idFactory(options.idGenerator);
  const textBlock = ids();
  const lead = ids();
  const leaderSpan = ids();
  const middle = ids();
  const trailingSpan = ids();
  const tail = ids();
  const highlight = ids();
  const circle = ids();
  const chartBlock = ids();
  const nvdaSeries = ids();
  const amdSeries = ids();
  const calloutBlock = ids();
  const sourceSpan = ids();

  return chatResultSchema.parse({
    answer: `截至 ${lastDate}，以五年前共同起点为 0%，${leader} 的累计涨幅约为 ${leaderReturn.toFixed(1)}%，${trailing} 约为 ${trailingReturn.toFixed(1)}%。图表使用同一纵轴，便于直接比较。`,
    mode: "demo",
    note: {
      id: ids(),
      question,
      title: `五年放在同一坐标里，${leader} 的累计涨幅更高`,
      theme: defaultNoteTheme,
      blocks: [
        {
          type: "text",
          id: textBlock,
          spans: [
            { id: lead, text: `截至 ${lastDate}，` },
            { id: leaderSpan, text: `${leader} 约 +${leaderReturn.toFixed(1)}%`, emphasis: "strong" },
            { id: middle, text: "，而" },
            { id: trailingSpan, text: `${trailing} 约 +${trailingReturn.toFixed(1)}%` },
            { id: tail, text: "。两条曲线使用相同起点和相同纵轴。" },
          ],
          annotations: [
            { id: highlight, type: "highlight", target: { blockId: textBlock, spanId: leaderSpan } },
            { id: circle, type: "circle", target: { blockId: textBlock, spanId: trailingSpan } },
          ],
        },
        {
          type: "line-chart",
          id: chartBlock,
          title: "5 年累计涨幅（共同起点 = 0%）",
          labels: selected.map((row) => row.date.slice(0, 7)),
          series: [
            { id: nvdaSeries, name: "NVIDIA", color: "green", points: nvdaPoints },
            { id: amdSeries, name: "AMD", color: "blue", points: amdPoints },
          ],
        },
        {
          type: "callout",
          id: calloutBlock,
          tone: "summary",
          spans: [{ id: sourceSpan, text: "数据来自 Stooq 月度历史收盘价，按数据源口径计算；未计交易成本，仅用于信息展示。" }],
        },
      ],
      arrows: [],
      truncated: false,
    },
  });
}
