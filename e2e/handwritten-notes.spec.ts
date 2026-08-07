import { expect, test } from "@playwright/test";

test("gallery exposes both canonical recreation scenes", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: /关于 AI 的核心概念与发展/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Skill 与 Agent 课堂笔记/ })).toBeVisible();
  await expect(page.locator("[data-scene-id]")).toHaveCount(2);
  await expect(page.locator(".recreation-toolbar")).toHaveCount(0);
});

test("each scene opens with its own canvas protocol", async ({ page }) => {
  await page.goto("/scenes/ai-core-concepts");
  await expect(page.locator('[data-scene-id="ai-core-concepts"]')).toBeVisible();
  await expect(page.locator(".recreation-paper--dots")).toBeVisible();
  await expect(page.locator("svg")).toHaveAttribute("viewBox", "0 0 1055 1466");
  await expect(page.getByRole("button", { name: "重播" })).toBeVisible();

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
  await page.goto("/scenes/ai-core-concepts");
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
});
