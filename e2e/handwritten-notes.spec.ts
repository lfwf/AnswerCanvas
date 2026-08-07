import { expect, test } from "@playwright/test";

test("gallery exposes all canonical recreation scenes", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: /iPhone 18 Pro 爆料参数/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /长句分析练习/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /长句语法沉浸式分析/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /未来3年，最需要 AI 能力的岗位/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /关于 AI 的核心概念与发展/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Skill 与 Agent 课堂笔记/ })).toBeVisible();
  await expect(page.locator("[data-scene-id]")).toHaveCount(6);
  await expect(page.locator(".answer-controls")).toHaveCount(0);
});

test("scene page is presented as a conversation with history, prompt and composer", async ({ page }) => {
  await page.goto("/scenes/long-sentence-analysis-practice");
  await expect(page.getByRole("complementary", { name: "历史记录" })).toBeVisible();
  await expect(page.getByRole("link", { name: /iPhone 18 Pro 爆料参数/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /长句分析练习/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /长句语法沉浸式分析/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /未来3年，最需要 AI 能力的岗位/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /关于 AI 的核心概念与发展/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Skill 与 Agent 课堂笔记/ })).toBeVisible();
  await expect(page.locator(".user-message")).toContainText("先写原句");
  await expect(page.getByRole("article", { name: "AnswerCanvas 手写回答" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "继续提问" })).toBeVisible();
  await expect(page.getByRole("button", { name: "发送" })).toBeVisible();
});

test("paged iPhone scene opens as a vertical recording page", async ({ page }) => {
  await page.goto("/scenes/iphone18-pro-rumors-video");
  await expect(page.locator('[data-scene-id="iphone18-pro-rumors-video"]')).toBeVisible();
  await expect(page.locator('[data-page-id="cover"]')).toBeVisible();
  await expect(page.locator("svg")).toHaveAttribute("viewBox", "0 0 900 1600");
  await expect(page.locator(".page-indicator")).toContainText("1/9");
  await expect(page.locator(".user-message")).toContainText("7 个模块必须分开逐页演示");
});

test("long sentence practice keeps source text and analysis on the same notebook page", async ({ page }) => {
  await page.goto("/scenes/long-sentence-analysis-practice");
  await expect(page.locator('[data-scene-id="long-sentence-analysis-practice"]')).toBeVisible();
  await expect(page.locator(".recreation-paper--ruled")).toBeVisible();
  await expect(page.locator("svg")).toHaveAttribute("viewBox", "0 0 1216 1294");
  await expect(page.locator('[data-text-id="sentence-line-1"]')).toHaveCount(1);
  await expect(page.locator('[data-annotation-id="a-although"]')).toHaveCount(1);
  await expect(page.locator('[data-text-id="structure-title"]')).toHaveCount(1);
  await expect(page.locator('[data-text-id="memory-title"]')).toHaveCount(1);
  await expect(page.getByRole("button", { name: "重播" })).toBeVisible();
});

test("immersive grammar scene remains available after reverting the teacher phase experiment", async ({ page }) => {
  await page.goto("/scenes/immersive-grammar-analysis");
  await expect(page.locator('[data-scene-id="immersive-grammar-analysis"]')).toBeVisible();
  await expect(page.locator("svg")).toHaveAttribute("viewBox", "0 0 1536 1450");
  await expect(page.locator('[data-text-id="full-sentence"]')).toHaveCount(1);
  await expect(page.locator('[data-annotation-id="clause-1-label"]')).toHaveCount(1);
});

test("existing scenes keep their own canvas protocol", async ({ page }) => {
  await page.goto("/scenes/future-ai-jobs");
  await expect(page.locator('[data-scene-id="future-ai-jobs"]')).toBeVisible();
  await expect(page.locator("svg")).toHaveAttribute("viewBox", "0 0 1122 1402");

  await page.goto("/scenes/ai-core-concepts");
  await expect(page.locator('[data-scene-id="ai-core-concepts"]')).toBeVisible();
  await expect(page.locator("svg")).toHaveAttribute("viewBox", "0 0 1055 1466");

  await page.goto("/scenes/skill-agent-notes");
  await expect(page.locator('[data-scene-id="skill-agent-notes"]')).toBeVisible();
  await expect(page.locator(".recreation-paper--ruled")).toBeVisible();
  await expect(page.locator("svg")).toHaveAttribute("viewBox", "0 0 908 1280");
});

test("legacy scene id redirects permanently and unknown ids return 404", async ({ request }) => {
  const alias = await request.get("/scenes/photo-1-skill-agent-notes", { maxRedirects: 0 });
  expect(alias.status()).toBe(308);
  expect(alias.headers().location).toContain("/scenes/skill-agent-notes");

  const missing = await request.get("/scenes/not-a-real-scene");
  expect(missing.status()).toBe(404);
});

test("replay never hides static structure", async ({ page }) => {
  await page.goto("/scenes/ai-core-concepts");
  const frame = page.locator('[data-drawn-element="page-frame"]').first();
  await expect(frame).toBeVisible();
  await page.getByRole("button", { name: "重播" }).click();
  await expect(frame).toBeVisible();
  await expect(frame).not.toHaveAttribute("stroke-opacity", "0");
});

test("mobile gallery and scene pages have no document-level horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
  await page.goto("/scenes/iphone18-pro-rumors-video");
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
  await expect(page.getByRole("complementary", { name: "历史记录" })).toBeHidden();
  await expect(page.getByRole("textbox", { name: "继续提问" })).toBeVisible();
});
