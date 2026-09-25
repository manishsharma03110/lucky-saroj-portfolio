import { test, expect } from "playwright/test";

test("first interaction navigates without an unsolicited contact dialog", async ({ page }) => {
  await page.goto("/");
  await page.locator('main a[href="/portfolio"]').first().click();
  await expect(page).toHaveURL(/\/portfolio$/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("contact dialog opens deliberately, closes with Escape and restores focus", async ({ page }) => {
  await page.goto("/");
  const button = page.locator('button[aria-haspopup="dialog"]');
  await expect(button).toHaveCount(1);
  await button.click();
  await expect(page.locator('[aria-labelledby="contact-popup-title"]')).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator('[aria-labelledby="contact-popup-title"]')).toHaveCount(0);
  await expect(button).toBeFocused();
});

test("slideshow pause survives pointer and focus changes", async ({ page }) => {
  await page.goto("/");
  const slider = page.locator("#home-selected-work");
  await slider.scrollIntoViewIfNeeded();
  await slider.getByRole("button", { name: "Pause slideshow", exact: true }).click();
  await page.locator("h1").click();
  await expect(slider.getByRole("button", { name: "Resume slideshow", exact: true })).toHaveAttribute("aria-pressed", "true");
  const current = slider.locator('[aria-current="true"]');
  const title = await current.getAttribute("aria-label");
  await page.waitForTimeout(6800);
  await expect(current).toHaveAttribute("aria-label", title);
});

test("reduced motion leaves content visible and automatic previews stopped", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("main")).toHaveCount(1);
  const slider = page.locator("#home-selected-work");
  await slider.scrollIntoViewIfNeeded();
  await expect(slider.getByRole("button", { name: "Resume slideshow", exact: true })).toBeDisabled();
  expect(await slider.locator("video").evaluateAll(videos => videos.every(video => video.paused))).toBe(true);
  await page.goto("/about");
  const heading = page.locator("h1");
  await expect(heading).toBeVisible();
  expect(await heading.evaluate(node => { for(let p=node;p;p=p.parentElement) if(getComputedStyle(p).opacity==="0") return false; return true; })).toBe(true);
});

test("public content remains visible when JavaScript is unavailable", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(baseURL + "/about");
  await expect(page.locator("h1")).toBeVisible();
  expect(await page.locator("h1").evaluate(node => { for(let p=node;p;p=p.parentElement) if(getComputedStyle(p).opacity==="0") return false; return true; })).toBe(true);
  await context.close();
});
