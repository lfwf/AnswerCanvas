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
  const noteId = nextId();
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
