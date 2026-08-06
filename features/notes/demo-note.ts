import { chatResultSchema, defaultNoteTheme, type ChatResult } from "./note-schema";

export type IdGenerator = () => string;
const defaultId: IdGenerator = () => crypto.randomUUID();

function createUniqueIdGenerator(idGenerator: IdGenerator): IdGenerator {
  const used = new Set<string>();
  return () => {
    const seed = idGenerator() || defaultId();
    let candidate = seed.slice(0, 120);
    let suffix = 2;
    while (used.has(candidate)) {
      const suffixText = `-${suffix++}`;
      candidate = `${seed.slice(0, 120 - suffixText.length)}${suffixText}`;
    }
    used.add(candidate);
    return candidate;
  };
}

export function createDemoChatResult(question: string, idGenerator: IdGenerator = defaultId): ChatResult {
  const nextId = createUniqueIdGenerator(idGenerator);
  const skillTopic = /(^|\s)skill|技能|能力包/i.test(question);
  const chartTopic = /(nvidia|nvda|amd|英伟达|趋势图|折线图|图表|chart)/i.test(question);
  const noteId = nextId();

  if (chartTopic) {
    const textBlock = nextId();
    const lead = nextId();
    const green = nextId();
    const middleA = nextId();
    const blue = nextId();
    const middleB = nextId();
    const wrongScale = nextId();
    const middleC = nextId();
    const sharedScale = nextId();
    const greenHighlight = nextId();
    const blueHighlight = nextId();
    const strike = nextId();
    const circle = nextId();
    const chartBlock = nextId();
    const greenSeries = nextId();
    const blueSeries = nextId();
    const calloutBlock = nextId();
    const calloutLead = nextId();
    const calloutFocus = nextId();
    const underline = nextId();

    return chatResultSchema.parse({
      answer: "当前是演示模式，曲线使用示意数据，只用于展示逐句书写、关键词标记、坐标轴和多条趋势线依次绘制的效果，不代表真实股票行情。",
      mode: "demo",
      note: {
        id: noteId,
        question,
        title: "把两条趋势线放进同一坐标，差异才真正有意义",
        theme: defaultNoteTheme,
        blocks: [
          {
            type: "text",
            id: textBlock,
            spans: [
              { id: lead, text: "演示数据里，" },
              { id: green, text: "绿色曲线" },
              { id: middleA, text: "增长更快，" },
              { id: blue, text: "蓝色曲线" },
              { id: middleB, text: "相对平缓。比较时不能" },
              { id: wrongScale, text: "分别缩放" },
              { id: middleC, text: "，而要使用" },
              { id: sharedScale, text: "同一坐标尺度。", emphasis: "strong" },
            ],
            annotations: [
              { id: greenHighlight, type: "highlight", target: { blockId: textBlock, spanId: green } },
              { id: blueHighlight, type: "highlight", target: { blockId: textBlock, spanId: blue } },
              { id: strike, type: "strike", target: { blockId: textBlock, spanId: wrongScale } },
              { id: circle, type: "circle", target: { blockId: textBlock, spanId: sharedScale } },
            ],
          },
          {
            type: "line-chart",
            id: chartBlock,
            title: "示例趋势（非真实行情）",
            labels: ["2022", "2023", "2024", "2025", "2026"],
            series: [
              { id: greenSeries, name: "NVIDIA demo", color: "green", points: [0, 8, 62, 148, 238] },
              { id: blueSeries, name: "AMD demo", color: "blue", points: [0, 16, 7, 32, 72] },
            ],
          },
          {
            type: "callout",
            id: calloutBlock,
            tone: "warning",
            spans: [
              { id: calloutLead, text: "这些数值是" },
              { id: calloutFocus, text: "动画演示数据，不代表真实行情。", emphasis: "strong" },
            ],
            annotations: [{ id: underline, type: "underline", target: { blockId: calloutBlock, spanId: calloutFocus } }],
          },
        ],
        arrows: [],
        truncated: false,
      },
    });
  }

  const ids = Array.from({ length: 24 }, () => nextId());
  const [
    definitionBlock,
    definitionLead,
    definitionFocus,
    definitionTail,
    pointsBlock,
    point1,
    point1Span,
    point2,
    point2Span,
    point3,
    point3Span,
    flowBlock,
    node1,
    node2,
    node3,
    highlight,
    calloutBlock,
    calloutLead,
    calloutFocus,
    underline,
  ] = ids;

  const answer = skillTopic
    ? "Skill 是一组可复用的任务方法、约束和工具调用规则。它的价值不在于说明写得长，而在于能否把重复工作变成稳定、可测试的执行流程。"
    : `关于“${question}”，可以先用一句话抓住核心，再补充真正影响判断的要点，最后用流程或图表解释关系。`;

  return chatResultSchema.parse({
    answer,
    mode: "demo",
    note: {
      id: noteId,
      question,
      title: skillTopic ? "Skill，就是把好方法变成可重复使用的能力" : "先抓住结论，再把关系画出来",
      theme: defaultNoteTheme,
      blocks: [
        {
          type: "text",
          id: definitionBlock,
          spans: [
            { id: definitionLead, text: skillTopic ? "Skill 不是一段更长的提示词，而是把" : "好的回答不会把所有资料堆在一起，而是先找到", emphasis: "normal" },
            { id: definitionFocus, text: skillTopic ? "可复用的方法" : "真正影响判断的信息", emphasis: "strong" },
            { id: definitionTail, text: skillTopic ? "固定成一套能反复执行、反复验证的流程。" : "，再用清晰的文字和图形解释它们之间的关系。", emphasis: "normal" },
          ],
          annotations: [{ id: highlight, type: "highlight", target: { blockId: definitionBlock, spanId: definitionFocus } }],
        },
        {
          type: "bullet-list",
          id: pointsBlock,
          items: [
            { id: point1, spans: [{ id: point1Span, text: skillTopic ? "输入明确：需要什么信息、有哪些限制。" : "先给结论：让读者知道答案指向哪里。" }] },
            { id: point2, spans: [{ id: point2Span, text: skillTopic ? "过程稳定：关键步骤、检查点和失败处理固定下来。" : "再给证据：只保留支撑结论的事实和数据。" }] },
            { id: point3, spans: [{ id: point3Span, text: skillTopic ? "结果可验收：输出结构、质量标准和测试方式清楚。" : "最后画关系：流程、对比和趋势比堆文字更直观。" }] },
          ],
        },
        {
          type: "flow-diagram",
          id: flowBlock,
          nodes: [
            { id: node1, label: skillTopic ? "重复问题" : "用户问题" },
            { id: node2, label: skillTopic ? "调用方法" : "提炼关系" },
            { id: node3, label: skillTopic ? "稳定结果" : "清晰答案" },
          ],
          edges: [{ from: node1, to: node2 }, { from: node2, to: node3 }],
        },
        {
          type: "callout",
          id: calloutBlock,
          tone: "summary",
          spans: [
            { id: calloutLead, text: skillTopic ? "判断一件事是否值得做成 Skill，就看它是否" : "判断一份回答是否有价值，就看它是否", emphasis: "normal" },
            { id: calloutFocus, text: skillTopic ? "被反复执行，而且结果必须稳定。" : "让读者更快理解、判断或行动。", emphasis: "strong" },
          ],
          annotations: [{ id: underline, type: "underline", target: { blockId: calloutBlock, spanId: calloutFocus } }],
        },
      ],
      arrows: [],
      truncated: false,
    },
  });
}
