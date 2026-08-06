# AnswerCanvas

AnswerCanvas 是一个 Next.js 单体应用：用户在左侧提问，右侧把 AI 回答以 A4 手写笔记的形式逐步呈现。第一版采用 HTML 文字与原生 SVG 图形混合渲染，不依赖 AI 生成 HTML、SVG 或绝对坐标。

## 运行环境

- Node.js `>=22.12 <26`
- npm `>=10.9`

```bash
npm install
npm run dev
```

未配置 API Key 时自动进入确定性的演示模式，输入“什么是 Skill？”即可体验标题、重点标记、列表、流程图和播放控制。

OpenAI 模式：

```bash
cp .env.example .env.local
# 在 .env.local 中设置：
# OPENAI_API_KEY=...
# OPENAI_MODEL=gpt-5-mini
npm run dev
```

`OPENAI_API_KEY` 只在 Route Handler 的服务端模块读取，不会进入 API 响应或 localStorage。

## 验证

```bash
npm test
npm run lint
npm run build
npx playwright install chromium
npm run test:e2e
npm run security:scan
```

## 架构

- `features/notes`：严格 Zod 领域协议、演示数据、AI 边界解析与规范化。
- `features/layout`：字体度量、换行、A4 分页与稳定坐标。
- `features/renderers`：HTML/SVG 渲染器注册表。
- `features/handwriting`：动画目标、时间轴和可控制播放器。
- `features/paper`：纸张缩放、页面播放和跟随滚动。
- `features/chat`：纯 reducer、请求编排和聊天 UI。
- `features/persistence`：版本化 localStorage 与容量控制。
- `lib/ai`：服务端 OpenAI structured output、一次修复与安全降级。

## 已知边界

当前文字动画是“逐字显现 + 笔尖跟随”，不是汉字或英文字形的真实逐笔画书写。流程线、图表线、圈选、下划线和荧光笔使用真实 SVG 路径动画；未来可在不改变领域协议和布局层的前提下接入笔顺数据。
