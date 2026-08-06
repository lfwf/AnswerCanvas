# AI 手写笔记生成器设计规格

## 1. 目标

构建一个 Next.js 单体 Web 应用。用户在左侧聊天区提问，系统生成普通文字回答和结构化笔记；右侧以 A4 纸张形式动态播放手写文字、荧光标记、圈选、箭头、流程图和简单数据图表。

第一版优先保证可控、稳定且便于扩展，不追求汉字真实笔顺，也不提供图片或视频导出。

## 2. 范围

### 2.1 第一版包含

- 左侧聊天、右侧 A4 笔记的桌面双栏界面。
- 第一页顶部直接显示用户原始问题，随后播放 AI 回答的手写动画。
- OpenAI API 生成回答和结构化笔记。
- 未配置 API Key 时可使用的完整演示模式。
- HTML 手写文字与 SVG 图形混合渲染。
- 标题、正文、项目列表、对比、提示框、流程图和折线图。
- 荧光笔、圈选、删除线、下划线和箭头标注。
- 逐字显现、笔尖跟随以及 SVG 路径绘制动画。
- 暂停、继续、重新播放和播放速度控制。
- 多页 A4 自动分页与播放跟随滚动。
- 本地会话历史以及历史笔记重新播放。
- 桌面和移动端响应式布局。

### 2.2 第一版不包含

- PNG、GIF、WebM 或 MP4 导出。
- 图像生成模型产生的复杂插画。
- 中文或英文字符的真实逐笔画书写。
- 多用户账户、云端同步和共享链接。
- 任意 AI 生成 HTML、SVG 或绝对坐标。

## 3. 技术路线

采用 Next.js、React 和 TypeScript 构建单体应用。服务端 Route Handler 调用 OpenAI；客户端使用 HTML 负责主要文字排版，SVG 负责图表、示意图与标注。动画由集中式时间轴控制，文字通过遮罩或逐字显现模拟书写，SVG 图形使用路径长度和 `stroke-dashoffset` 沿线绘制。

普通字体不包含可靠的笔顺数据，因此第一版的文字采用逐字显现与笔尖跟随模拟。流程线、曲线、圈选、删除线和荧光标记均沿真实 SVG 路径绘制。此边界不会阻碍未来接入笔顺数据，因为文字动画被隔离在独立的手写模块中。

## 4. 架构与模块边界

数据流如下：

```text
用户提问
  -> Chat Service
  -> Note Schema
  -> Layout Engine
  -> A4 Renderer
       -> HTML Text Renderer
       -> SVG Diagram Renderer
       -> SVG Annotation Renderer
  -> Animation Timeline
```

建议的源码边界：

```text
app/
  api/chat/                 请求验证和服务端调用入口
features/
  chat/                     消息、输入和会话状态
  notes/                    笔记协议、校验和演示数据
  layout/                   换行、测量、分页和坐标计算
  paper/                    A4 页面、缩放和翻页/滚动
  handwriting/              文字显现、笔尖和时间轴
  diagrams/                 流程图和折线图
  annotations/              荧光笔、圈选、删除线、下划线和跨元素箭头
lib/
  ai/                       OpenAI 客户端、提示词和结果转换
```

模块约束：

- AI 层只输出内容和语义，不输出像素坐标、HTML 或 SVG。
- Note Schema 是 AI、布局和渲染之间唯一共享的领域协议。
- Layout Engine 只产生页面、边界框和元素位置，不绘制 UI。
- Renderer 只消费布局结果，不感知 OpenAI 或演示数据来源。
- Animation Timeline 统一调度播放事件，组件不各自维护互相冲突的计时器。
- 每类图形通过注册表映射到独立渲染器；增加新图形无需修改画布核心。
- 视觉扰动使用笔记 ID 派生的固定随机种子，重播时布局和笔迹保持一致。

## 5. 产品交互

1. 用户输入问题并提交。
2. 左侧立即加入用户消息，右侧显示“正在整理笔记…”。
3. 服务端生成一份简洁回答和一份结构化笔记。
4. 服务端校验结构化结果并返回统一响应。
5. 左侧显示回答；右侧根据完整笔记先完成稳定布局，再从标题开始播放。
6. 用户可暂停、继续、重播，并选择 `0.5x`、`1x`、`1.5x` 或 `2x`。
7. 新问题创建新笔记；点击历史回答可查看并重播其笔记。

第一版不渲染残缺的流式 JSON，以避免元素在生成过程中反复跳位。等待阶段使用明确的纸张状态，完整场景返回后立即开始动画。

## 6. 笔记领域协议

顶层响应包括：

```ts
interface ChatResult {
  answer: string;
  note: NoteDocument;
  mode: "openai" | "demo" | "fallback";
}

interface NoteDocument {
  id: string;
  title: string;
  theme?: NoteTheme;
  blocks: NoteBlock[];
}
```

受支持的块类型：

```ts
type NoteBlock =
  | TextBlock
  | BulletListBlock
  | ComparisonBlock
  | FlowDiagramBlock
  | LineChartBlock
  | CalloutBlock;
```

标注作为受控语义附着于文本或图形目标：

```ts
type Annotation =
  | { type: "highlight"; target: string }
  | { type: "circle"; target: string }
  | { type: "underline"; target: string }
  | { type: "strike"; target: string };
```

AI 输出经过运行时 Schema 校验。所有字符串长度、块数量、图表序列数量和数据点数量均设置上限，以控制布局复杂度和请求滥用。

## 7. 布局系统

布局以逻辑 A4 尺寸为坐标系，并在显示层等比缩放。布局过程分为：

1. 根据内容类型选择块级模板。
2. 使用可预测的字体度量进行中文与英文换行。
3. 计算块的最小高度和段间距。
4. 将放不下的完整块移到下一页；可拆分的正文和列表按行拆页。
5. 为每个可动画元素生成稳定 ID 和边界框。
6. 渲染完成后由纸张容器适配实际视口尺寸。

排版遵守安全边距，任何未知或过大的内容都必须截断、拆分或降级，不能溢出纸张。

## 8. 视觉与动画

视觉基准为用户提供的研究笔记截图：暖白纸张、黑色手写正文、黄色重点标记、蓝绿数据线以及少量圈选和删除线。

- 纸张：A4 比例、暖白色、轻纸纹和柔和阴影。
- 文字：支持中文的手写字体栈，带本地回退；通过固定种子生成轻微倾斜和基线变化。
- 荧光笔：半透明、不规则、从左向右扫过。
- 图表：简化坐标轴和刻度，曲线根据真实数据点生成。
- 手绘线条：使用轻微抖动或双路径，但必须保持可读。
- 笔尖：跟随当前活动元素，在段落与图形之间保留自然停顿。

时间轴事件是统一数据结构，至少包含开始时间、持续时间、元素 ID、事件类型和可选路径。切换笔记或重播前必须取消旧时间轴。

## 9. 状态与持久化

客户端会话记录用户消息、回答、笔记 JSON、模式和创建时间。第一版保存在浏览器本地存储中。持久化数据必须带版本号；遇到无效或旧版本数据时安全清空或迁移，不能阻塞应用启动。

API Key 仅通过服务端环境变量 `OPENAI_API_KEY` 获取，绝不下发到客户端或写入本地存储。

## 10. 异常与降级

- 缺少 API Key：返回演示笔记并在界面标明演示模式。
- AI 超时或网络失败：保留当前成功笔记，在对应消息位置提供重试。
- 非法结构化输出：服务端尝试一次结构修复；仍失败则返回纯文本 `TextBlock` 的安全笔记。
- 不支持的块：转换为文字说明，其他块继续渲染。
- 内容过长：截断、换行或分页，并记录可展示的提示。
- 动画切换：取消旧时间轴后再挂载新笔记。
- 小屏幕：双栏变为上下结构，聊天与纸张均可独立滚动。

## 11. 测试策略

### 11.1 单元测试

- Note Schema 接受合法文档并拒绝超限或未知结构。
- 中文、英文和混合文本正确换行。
- 内容在安全边距内分页，块不会无声丢失。
- 相同笔记 ID 产生相同视觉扰动。
- 时间轴事件顺序稳定，并可正确取消和重播。
- AI 结果转换与纯文本降级保持领域协议有效。

### 11.2 组件测试

- 输入提交和加载状态。
- 演示模式标识。
- 暂停、继续、重播和变速控制。
- API 错误和重试。
- 历史笔记切换时旧动画停止。

### 11.3 端到端测试

- 无 API Key 时，从提问到演示笔记播放完成。
- 模拟有效 AI 响应时，左侧显示回答，右侧显示标题、正文、重点和图形。
- 刷新后恢复本地历史。
- 桌面双栏与移动端上下布局均可使用。

## 12. 验收标准

- 输入“什么是 Skill？”后，左侧出现回答，右侧播放动态手写笔记。
- 笔记至少包含标题、正文、黄色重点和一种语义匹配的简单示意图。
- 箭头、圈选、荧光笔或折线图能沿路径播放。
- 播放控制可用，重播结果稳定。
- 多页内容正确分页，并在播放时跟随当前页。
- 未配置 API Key 仍可完整体验。
- 刷新页面后保留有效的本地会话。
- 不向浏览器暴露 API Key。
- 主要功能模块保持上述边界，没有把 AI、布局、渲染和动画堆进单个组件。

## 13. 后续扩展点

- 接入汉字或英文字形笔顺数据，实现真实逐笔书写。
- 增加时间线、柱状图、公式、地图和更多图形渲染器。
- 增加图片和视频导出。
- 接入复杂插图生成模型。
- 支持云端会话、分享与协作。


## 14. 可执行契约补充（规范性）

本节用于消除前文中“截断、降级、可用”等宽泛表述；发生冲突时以本节为准。

### 14.1 完整运行时 Schema

所有对象采用严格 Schema，未知字段一律拒绝。服务端在进入严格校验前可把 AI 产生的未知块转换为说明性正文；客户端和本地存储中的未知块直接判为无效。

- `NoteDocument`：必填 `id`、`title`、`blocks`；可选 `theme`，缺省为暖白纸、黑墨和黄/蓝/绿强调色。
- 每个块都有唯一 `id` 和可选 `annotations`。
- `text`：`spans: { id, text, emphasis? }[]`。
- `bullet-list`：`items: { id, spans }[]`。
- `comparison`：左右各含 `title` 和 `items: string[]`。
- `flow-diagram`：`nodes: { id, label }[]` 和 `edges: { from, to, label? }[]`。
- `line-chart`：可选标题、`labels`，以及 `series: { id, name, color, points }[]`。
- `callout`：`tone: idea | warning | summary` 和 `spans`。
- 文字标注：`{ id, type, target: { blockId, spanId } }`，类型为 highlight、circle、underline 或 strike。
- 箭头标注：`{ id, type: arrow, from, to, label? }`；端点为 `{ blockId, anchor }`，anchor 为 top、right、bottom、left 或 center。

文档、块、Span、节点和标注 ID 必须在各自作用域唯一。服务端规范化重复 ID。文字标注必须引用现存 Span，箭头必须引用现存块，流程边必须引用同一流程块的节点；失效的单个标注或边会被删除并记录诊断，不能拖垮整篇笔记。

限制为：问题 4,000 个 Unicode grapheme、标题 80、块 12、单块可见文字 1,200、列表项 8、流程节点 8、图表序列 3、每序列数据点 30、标注总数 20。达到限制而精简内容时，末尾必须加入可见的“内容已精简”提示。

### 14.2 布局与渲染接口

逻辑 A4 固定为 `794 x 1123`，四周安全边距 64，正文默认行高 38。布局器输出 `LayoutDocument -> LayoutPage[] -> LayoutElement[]`；每个元素包含稳定 ID、blockId、pageIndex、kind、边界框和类型化 payload。HTML/SVG renderer 只消费该结果。

文字以 Unicode grapheme 分割，优先使用 `Intl.Segmenter`，缺失时使用受测的 splitter。布局前最多等待 `document.fonts.ready` 3 秒；超时后锁定系统回退字体，本次笔记不再因字体迟到而重排。客户端统一使用隐藏 Canvas 的 `measureText`，测试注入确定性度量器。

分页规则：

- 正文和列表按完整行拆分，页底至少保留两行。
- 对比块保持两栏结构，必要时同步按列表行拆页。
- 流程图和折线图不可拆；先缩小至最低 70%，仍放不下则转换为文字摘要。
- Callout 优先整体移至下一页；单块仍过高则转换为正文。
- 任何输入行都不能被静默丢弃，所有边界框必须位于安全区域。

布局模块产生几何信息；renderer 产生 DOM/SVG 目标；`handwriting/timeline-builder` 根据布局结果和 renderer 暴露的目标建立事件。布局器不决定动画时长，renderer 不决定全局播放顺序。

### 14.3 请求与 OpenAI 契约

请求状态为 `idle -> submitting -> success | error`。每次提交获得单调 requestId，响应只更新对应消息。迟到响应不能抢占用户当前选择的笔记。重试复用原消息位置并增加尝试次数，不追加重复的用户消息。失败时保留上一张成功笔记；选择失败消息时显示错误卡片。

OpenAI 只在服务端调用，采用严格 JSON Schema structured output。输入超过 4,000 grapheme 返回 400。上游请求 30 秒超时，并随客户端 AbortSignal 取消。结构失败只允许一次修复；修复输入仅含原输出与 Schema 错误。再次失败时用安全纯文本构造合法 TextBlock。

成功返回 `200 { data: ChatResult }`；可重试故障返回 `502/504 { error: { code, message, retryable: true } }`；输入错误返回 400 且 retryable 为 false。日志不得包含 API Key 或完整用户问题。

`demo` 表示无 Key 时由确定性本地模板按问题关键词生成；未知主题使用“定义、要点、流程”通用模板。`fallback` 表示真实 AI 已调用，但结构修复失败后返回的合法纯文本笔记。

### 14.4 动画语义

事件按 pageIndex、elementIndex、phase、稳定 eventId 排序。默认文字每个 grapheme 45ms，路径动画按长度计算并限制在 300–2,500ms，元素间停顿 120ms。

暂停保存逻辑播放位置；继续从原位置恢复；播放中变速立即改变后续时钟倍率且不跳帧；重播先恢复全部元素的初始隐藏状态，再从零播放。进入下一页首个事件时只触发一次平滑跟随。用户手动滚动后的 3 秒内暂停自动跟随。切换笔记必须 abort 旧时间轴并移除回调。

启用 `prefers-reduced-motion: reduce` 时默认立即显示完成态，不移动笔尖或自动滚动；用户主动重播时使用淡入而非路径移动。

### 14.5 持久化契约

存储包络为 `{ version: 1, conversations, selectedMessageId? }`。ID 使用 `crypto.randomUUID()`，测试可注入生成器；加载碰撞时保留第一项。

最多保存 20 轮问答或 2MB，以先到者为准，超限删除最旧的完整轮次。无效 JSON、未知版本或 Schema 失败时清空持久化值并继续使用空历史；第一版不迁移未知版本。localStorage 不可用或 quota 失败时继续使用内存状态，并显示一次非阻塞提示。

### 14.6 可测验收定义

- “什么是 Skill？”的 demo 固定产生标题、至少两个正文/列表块、一个黄色 highlight 和一个三节点流程图。
- 无 Key 时不得发起 OpenAI 请求，仍能完成提问、渲染、播放控制和刷新恢复。
- 暂停后 300ms 内逻辑位置不再推进；2x 剩余播放时间约为 1x 的一半；重播的元素顺序、坐标和扰动值一致。
- 每个布局边界框都位于 x=64..730、y=64..1059；跨页测试不丢输入行，进入新页首个事件时产生一次跟随。
- 浏览器 bundle、API 响应、本地存储和测试快照中都不得出现测试 API Key。
- 大于等于 1024px 使用双栏，小于 1024px 使用上下布局；1440x900 与 390x844 端到端测试无页面级横向溢出。
- 单元测试覆盖引用完整性、grapheme、字体超时、超大块降级、存储损坏/quota、假时钟播放控制、未知块转换。
- 组件及端到端测试覆盖快速连续提交与迟到响应、超时、一次修复成功、修复失败降级、页面跟随和 reduced-motion。
## 15. Schema 与断言细化（规范性）

本节覆盖 14.1 中仍不够精确的字段描述。

### 15.1 最终领域结构

`ChatResult` 必须包含 `answer: string`、`note: NoteDocument` 和 `mode: openai | demo | fallback`。answer 为 1–6,000 grapheme。

`NoteDocument` 必须且只能包含：

- `id: string`；
- `question: string`，1–4,000 grapheme，由服务端从已校验的用户请求注入，AI 无权生成或修改；
- `title: string`，1–80 grapheme；
- `theme: { paper: "warm-white", ink: "black", accent: "yellow-blue-green" }`；
- `blocks: NoteBlock[]`，1–12 个；
- `arrows: ArrowAnnotation[]`，0–8 个；
- `truncated: boolean`。

所有块必须包含判别字段 `type` 和 `id`。只有 text、bullet-list 和 callout 可包含 `annotations: TextAnnotation[]`；comparison、flow-diagram 和 line-chart 不允许 annotations 字段。跨块箭头只存在于文档级 arrows，不归属于任何块。

字段约束：

- `TextSpan`：必填 id、text；可选 `emphasis: normal | strong`；text 为 1–240 grapheme；每个 spans 数组 1–12 项。
- `text`：必填 type、id、spans；可选 annotations。
- `bullet-list`：必填 type、id、items；items 为 1–8 项，每项必填唯一 id 和 spans；可选 annotations。
- `comparison`：必填 type、id、left、right；每侧必填 title（1–80 grapheme）和 items（1–8 个字符串，每项 1–160 grapheme）。
- `flow-diagram`：必填 type、id、nodes、edges；nodes 为 2–8 项，每项含唯一 id 和 1–80 grapheme 的 label；edges 为 1–12 项，每项含 from、to 和可选 1–60 grapheme label，且 from 不得等于 to。
- `line-chart`：必填 type、id、labels、series；可选 title（1–80 grapheme）；labels 为 2–30 个字符串，每项 1–30 grapheme；series 为 1–3 项，每项含唯一 id、1–40 grapheme name、`color: blue | green` 和有限数字 points；每个 points 长度必须等于 labels 长度。
- `callout`：必填 type、id、`tone: idea | warning | summary`、spans；可选 annotations。
- `TextAnnotation`：必填唯一 id、`type: highlight | circle | underline | strike` 和 `target: { blockId, spanId }`；target 必须位于拥有该 annotations 数组的同一块内。
- `ArrowAnnotation`：必填唯一 id、`type: arrow`、from、to；可选 1–60 grapheme label；端点含 blockId 和 `anchor: top | right | bottom | left | center`，from 与 to 必须引用两个不同的现存块。

单文档由 AI 生成的标题、块、图表标签和标注文字合计最多 9,000 grapheme；该预算不包含由服务端独立注入的 `question`，question 使用自己的 4,000-grapheme 上限。TextAnnotation 最多 20 个，流程边合计最多 24 个。truncated 为 true 时，renderer 在纸张页脚显示固定的“内容已精简”；该页脚是 UI 状态，不占块、Span 或 9,000 grapheme 配额，因此不会导致 Schema 再次超限。

### 15.2 ID 与引用规范化

服务端先扫描原始文档并记录所有原始 ID 的出现次数，再生成基于文档位置的规范 ID。仅出现一次的原始 ID 建立到规范 ID 的映射；重复、缺失或格式非法的原始 ID 不建立映射。随后统一解析引用：可唯一映射的引用被重写为规范 ID，任何指向歧义 ID、缺失 ID 或错误作用域的标注、箭头或流程边都被删除并生成诊断。系统绝不猜测重复 ID 指向哪一个元素。

### 15.3 持久化字节限制

2MB 上限定义为 `TextEncoder().encode(JSON.stringify(envelope)).byteLength <= 2 * 1024 * 1024`。每次写入前从最旧完整问答开始淘汰，直到同时满足字节限制和 20 轮限制；单个最新轮次自身超过 2MB 时不持久化该轮，但保留在当前内存会话并显示一次提示。

### 15.4 精确验收谓词

- 速度测试使用同一时间轴和假时钟，忽略初始化时间；`duration2x / duration1x` 必须位于 0.48–0.52。
- 安全区域要求整个矩形满足 `x >= 64`、`x + width <= 730`、`y >= 64`、`y + height <= 1059`。
- 时间轴在活动页从 n 变为 n+1 且开始该页首个事件时调用一次 `onPageFollow(n + 1)`；同一页后续事件不得再次调用。端到端测试通过该回调产生的 `handwriting:page-follow` 自定义事件计数。

## 16. 引用清理后的确定性降级（规范性）

- 流程图完成 ID 规范化和无效边清理后，若剩余边数为零，则该流程块转换为同位置的 TextBlock：按原节点顺序生成“节点 A → 节点 B”文字摘要，使用新的规范块 ID，并删除原流程块的节点引用。若摘要触发文档文字上限，则设置 truncated 并按既有精简规则处理。最终进入客户端 Schema 的 flow-diagram 始终保有 1–12 条合法边。
- 文档级箭头在布局完成后必须解析到同一 A4 页。端点跨页、端点块被降级或端点不存在时，布局器删除该箭头并生成诊断；箭头标签不承载独立事实，因此删除不需要额外文字替代。Renderer 永远不会收到跨页箭头。
## 17. 用户问题显示（规范性）

- API Route 完成 grapheme 长度校验后，将原始问题传给 ChatService。ChatService 调用 `normalizeNote(raw.note, validatedQuestion)`，由 normalizer 在最终 `noteDocumentSchema` 校验前注入 question；demo 和 fallback 工厂同样接收该已验证问题。OpenAI structured output 不包含 question 字段，若原始 AI 对象额外携带 question，该字段必须被丢弃，绝不能覆盖用户原文。
- 布局器在第一页安全区顶部创建唯一的静态问题元素，再排列标题和回答块。问题只在第一页显示，不进入动画时间轴，也不显示跟随笔尖。
- 问题区域使用较小的灰黑色文字、`Q：` 前缀和静态蓝色手绘下划线。笔记布局完成时整个问题区域立即可见，随后从 AI 回答标题开始播放手写动画。
- 问题最多显示三行；超过三行时第三行以省略号结尾。`NoteDocument.question` 和聊天历史仍保存完整原文，显示精简不设置 `truncated`。
- 组件与端到端测试必须验证：问题无需推进动画时钟即可显示、回答标题是首个动画事件、长问题限制为三行并显示省略号、第二页不重复问题、重播时问题始终保持可见。
- OpenAI、demo 和 fallback 结果均须精确保留已验证问题；本地存储往返保存完整未省略原文。三行省略只存在于布局 payload，不得修改 `NoteDocument.question`。