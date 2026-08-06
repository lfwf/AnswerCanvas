import { expect, test } from "@playwright/test";
import { demoChatResult } from "../tests/fixtures/chat-results";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/chat", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: demoChatResult }) }));
});

test("demo question renders as a prompt bubble above handwritten content", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "什么是 Skill？", exact: true }).click();
  await expect(page.getByLabel("输入你的问题")).toHaveValue("什么是 Skill？");
  await page.getByRole("button", { name: "生成手写笔记" }).click();
  await expect(page.locator(".canvas-status")).toContainText("Demo");
  await expect(page.locator(".question-header")).toContainText("什么是 Skill？");
  await expect(page.getByRole("button", { name: "重播" })).toBeVisible();
});

test("mobile has no document-level horizontal overflow", async ({ page }) => {
  await page.goto("/");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});
