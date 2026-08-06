import { expect, test } from "@playwright/test";
import { demoChatResult } from "../tests/fixtures/chat-results";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/chat", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: demoChatResult }) }));
});

test("demo question renders a static question and handwritten note", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("输入你的问题").fill("什么是 Skill？");
  await page.getByRole("button", { name: "生成手写笔记" }).click();
  await expect(page.getByText("演示模式")).toBeVisible();
  await expect(page.getByText("Q：什么是 Skill？")).toBeVisible();
  await expect(page.getByRole("button", { name: "重播" })).toBeVisible();
});

test("mobile has no document-level horizontal overflow", async ({ page }) => {
  await page.goto("/");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});
