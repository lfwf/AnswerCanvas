# AnswerCanvas 多场景图片复刻设计规格

## 1. 目标

将图片复刻功能从“单个 `current-scene.ts` 被反复覆盖”改造成可持续扩展的多场景系统。每张参考图片对应一个独立场景文件，包含自己的元数据、画布尺寸、文字、方框和 SVG 路径；公共渲染与动画引擎只维护一份。

本次新增场景为 `ai-core-concepts`，复刻用户提供的《关于 AI 的核心概念与发展》双栏课堂笔记，同时保留现有 Skill/Agent 场景。

## 2. 核心约束

- 新图片只能新增场景文件，不覆盖或改写其他场景的数据。
- 场景数据不包含 React 组件、计时器或全局状态。
- 公共渲染器只消费 `RecreationScene`，不判断具体场景 ID。
- 每个场景 ID 在注册表中唯一并可作为 URL 参数。
- 文字、方框和路径使用场景内部稳定 ID，动画重播顺序确定。
- 参考图片不作为最终页面背景；内容必须用 HTML 文字和 SVG 路径重建。

## 3. 文件结构

```text
app/
  page.tsx                                  场景画廊入口
  scenes/[sceneId]/page.tsx                 按 ID 打开场景
features/recreation/
  scenes/
    skill-agent-notes.ts                    现有场景，迁移后保持不变
    ai-core-concepts.ts                     本次新增场景
    index.ts                                只导出场景列表
  scene-registry.ts                         查询、唯一性校验和默认场景
  SceneGallery.tsx                          场景卡片列表
  RecreationStage.tsx                      通用渲染与播放
  recreation-types.ts                      共享场景协议
  recreation-player.ts                     通用动画播放器
  recreation.css                           通用画布与控件样式
```

`current-scene.ts` 在迁移完成后删除。旧场景移动到 `scenes/skill-agent-notes.ts`，内容和 ID 不因迁移而变化。

## 4. 场景协议

`RecreationScene` 增加适合注册和展示的元数据：

```ts
interface RecreationScene {
  id: string;
  title: string;
  description: string;
  sourceName: string;
  createdAt: string;
  width: number;
  height: number;
  elements: RecreationElement[];
}
```

每个元素增加可选 `animated?: boolean`：

- 缺省或 `true`：按 `order` 加入书写时间轴。
- `false`：场景加载完成后立即可见，不进入时间轴。

结构线、纸张分区和点阵背景为静态；文字、强调线、箭头、图标与示意图为动态。静态元素不占用动画顺序，但仍需稳定 ID。

## 5. 注册与路由

`scene-registry.ts` 在模块初始化时验证：

- 场景 ID 非空且唯一。
- 场景尺寸为正数。
- 同一场景内元素 ID 唯一。
- 动态元素的 `order` 为非负有限数。

提供：

```ts
listScenes(): RecreationScene[]
getScene(sceneId: string): RecreationScene | undefined
getDefaultScene(): RecreationScene
```

路由规则：

- `/`：展示所有场景卡片。
- `/scenes/skill-agent-notes`：现有场景。
- `/scenes/ai-core-concepts`：本次新场景。
- 未知 ID：使用 Next.js `notFound()`，不悄悄显示默认场景。

画廊缩略图直接以较低比例渲染场景完成态，不维护额外截图文件。

## 6. 本次 AI 核心概念场景

逻辑画布采用参考图比例，建议 `1055 x 1466`。页面结构：

1. 顶部信息区：日期、课程主题、主题、页码。
2. 主体表格：左侧 Cue 栏约占 21%，右侧 Notes 栏约占 79%。
3. Notes 第一节：AI 定义、四个核心特点、人脑与感知/学习/推理/行动示意图。
4. 第二节：数据 → 算法 → 算力 → 模型 → 应用流程。
5. 第三节：ANI、AGI、ASI 说明及三层金字塔。
6. 第四节：制造业、医疗健康、自动驾驶、电商推荐、日常生活五个图标。
7. 第五节：发展趋势文字及创新效率/安全伦理天平。
8. 底部 Summary：四条结论和 AI 放射式思维导图。

颜色：黑色正文、蓝色章节标题、红色重点下划线、绿色流程框、紫色推理、橙色行动与应用。纸张使用暖白色细点阵纹理，不使用横线纸背景。

动画按照视觉阅读顺序进行：顶部信息 → 表头 → 每组 Cue → 对应 Notes 内容与插图 → Summary。页面边框、分隔线、表头框线和点阵背景立即显示。

## 7. UI 行为

- 画廊卡片显示场景标题、描述、来源文件名和完成态缩略图。
- 点击卡片进入独立场景 URL。
- 场景页保留播放、暂停、重播和速度选择。
- 增加“返回场景列表”入口。
- 切换路由时销毁旧播放器，不允许旧回调继续更新新场景。
- 移动端继续等比缩放并允许纵向滚动，不横向溢出页面。

## 8. 测试与验收

- 注册表返回两个场景，ID 唯一，未知 ID 返回 `undefined`。
- 旧场景迁移前后元素数量、ID、坐标与顺序完全一致。
- 静态元素首次渲染即完成；播放器事件只包含 `animated !== false` 的元素。
- `/` 同时展示两个场景卡片。
- 两个场景 URL 都能打开对应内容，未知 URL 返回 404。
- 新场景包含参考图的五个 Cue 分组、五个 Notes 章节和 Summary。
- 新场景包含流程框、人脑示意图、类型金字塔、五个领域图标、天平和底部思维导图。
- 重播不会隐藏结构线，但会重置全部动态内容。
- 桌面和移动端无页面级横向溢出。
- 单元测试、ESLint、生产构建和相关 Playwright 用例通过。

## 9. 后续新增图片流程

1. 在 `features/recreation/scenes/` 新增一个以场景 ID 命名的文件。
2. 将文字、方框和 SVG 路径写入该文件。
3. 在 `scenes/index.ts` 注册一次。
4. 添加场景结构测试和关键元素断言。
5. 画廊和动态路由自动出现该场景，不修改播放器和其他场景。


## 10. 注册、画布与迁移细化（规范性）

本节覆盖前文中不够精确或冲突的描述。

### 10.1 旧场景 ID 迁移

现有场景 ID `photo-1-skill-agent-notes` 有意迁移为规范 ID `skill-agent-notes`。元素 ID、坐标、路径、样式和顺序不得改变。注册表保留旧 ID 别名；访问 `/scenes/photo-1-skill-agent-notes` 时返回 308 并跳转到 `/scenes/skill-agent-notes`。别名不出现在画廊或 `listScenes()` 中。

迁移前把现有场景的元素数量、完整 ID 列表、坐标、路径、样式与顺序序列化为 `tests/fixtures/skill-agent-scene-baseline.json`。迁移后用该独立基线验证等价性，只允许场景 ID、注册元数据和新增 paper 配置发生明确记录的变化。

### 10.2 场景纸张与任意尺寸画布

`RecreationScene` 新增：

```ts
paper: {
  background: string;
  pattern: "plain" | "ruled" | "dots";
  patternColor: string;
  spacing: number;
}
```

旧场景使用 ruled，新场景使用 dots。通用渲染器通过字段生成 CSS 变量或内联背景，不允许根据场景 ID 分支。

新增无状态 `RecreationCanvas`，只接收 scene、progress 和 `completed?: boolean`。其 SVG `viewBox` 必须动态使用 `0 0 ${scene.width} ${scene.height}`，不得写死 `908 x 1280`。completed 模式把所有动态元素视为 progress 1，不创建播放器、计时器、ResizeObserver、工具栏或品牌区。画廊缩略图只能使用该完成态画布。

### 10.3 静态与动态元素

元素协议分成两个判别分支：

- 动态元素：`animated?: true`，必须提供非负有限且场景内唯一的 `order`。
- 静态元素：`animated: false`，不得提供 `order`。

静态元素初始 progress 恒为 1，不加入播放器事件。暂停、重播与重置只更新动态元素 ID，不能隐藏结构线。结构线和分区框为静态；文字、强调线、箭头、图标与示意图为动态。

### 10.4 路由安全与确定顺序

规范场景 ID 必须匹配 `^[a-z0-9]+(?:-[a-z0-9]+)*$`。注册表数组顺序就是稳定画廊顺序；`DEFAULT_SCENE_ID = "ai-core-concepts"` 明确指定默认场景，不依赖数组第一项。未知、大小写不规范、包含斜杠或 URL 解码后不匹配 slug 的 ID 均返回 404。

注册表同时验证场景 ID 唯一、尺寸为正、paper spacing 为正、元素 ID 唯一，以及动态 order 唯一。

### 10.5 文案与验收补充

右上角说明改为“发送新图片后会新增独立场景并保留已有场景”，删除“更新当前复刻场景”的表述。

新增自动化断言：

- 两个场景的 SVG viewBox 匹配各自尺寸，背景分别为 ruled 与 dots。
- 静态元素首次渲染即完成，重播后仍为完成态。
- 画廊缩略图不创建播放器、计时器、ResizeObserver 或工具栏。
- 旧 ID 返回 308 到规范 URL；非法、编码后非法及未知 ID 返回 404。
## 11. 迁移白名单、别名解析与场景隔离（规范性）

### 11.1 旧场景结构元素迁移白名单

旧场景只允许以下六个结构元素从动态改为静态：

- `page-frame`
- `header-rule-1`
- `header-rule-2`
- `table-top`
- `table-divider`
- `summary-rule`

基线 fixture 为每个元素记录 legacyOrder。迁移等价测试对非白名单元素逐字段比较，包括 order；对白名单元素比较 ID、kind、坐标/路径与样式，另外断言迁移前 order 等于 fixture 的 legacyOrder，迁移后为 `animated: false` 且不存在 order。除这一白名单转换、场景级 ID/元数据和 paper 配置外，不允许其他差异。其他 box、stroke 和 text 仍保持动态。

### 11.2 类型化场景解析

注册表额外提供：

```ts
type SceneResolution =
  | { kind: "canonical"; scene: RecreationScene; canonicalId: string }
  | { kind: "alias"; scene: RecreationScene; canonicalId: string };

resolveSceneId(id: string): SceneResolution | undefined
```

`getScene` 只接受并返回规范 ID；路由统一使用 `resolveSceneId`。canonical 结果直接渲染，alias 结果执行 308 到 canonicalId，非法或未知 ID 返回 undefined 并进入 404。测试分别覆盖三条路径，不能依赖调用者猜测 alias。

### 11.3 场景切换隔离

不同场景允许复用相同元素 ID，因此所有 progress 和播放器生命周期必须以 canonical scene ID 隔离。动态路由使用 `<RecreationStage key={canonicalId} scene={scene} />` 强制卸载旧实例；卸载清除启动 timer、暂停/取消旧播放器并丢弃旧 progress，完成后才允许新播放器开始。

集成测试使用两个都包含 `title` 元素但进度不同的场景：切换路由后，新场景首次绘制不得继承旧 title progress；旧播放器后续回调不得修改新场景；切回旧场景时从其定义的初始状态重新开始。