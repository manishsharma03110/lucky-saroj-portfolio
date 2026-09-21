import { test, expect } from "playwright/test";

// Returning-visitor state prevents the intentionally automatic contact popup from stealing the first click.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("contact-popup-shown", "1"));
});

async function login(page) {
  await page.goto("/admin/login");
  await page.getByLabel("Email or Username").fill(process.env.E2E_ADMIN_EMAIL);
  await page.getByLabel("Password", { exact: true }).fill(process.env.E2E_ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/(?!login)/);
}

for (const path of ["/","/about","/portfolio","/services","/experience","/testimonials","/contact"]) {
  test(`public page ${path}`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response.status()).toBe(200);
    await expect(page.locator("h1").first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
  });
}

test("home slider navigation opens a project", async ({ page }) => {
  await page.goto("/");
  const slider = page.locator("#home-selected-work");
  await expect(slider).toBeVisible();
  const position = slider.locator('[aria-label="Slider position"] [aria-current="true"]');
  const before = await position.getAttribute("aria-label");
  await slider.getByRole("button", { name: "Next project", exact: true }).click();
  await expect(position).not.toHaveAttribute("aria-label", before);
  await slider.getByRole("button", { name: "Previous project", exact: true }).click();
  await expect(position).toHaveAttribute("aria-label", before);
  await slider.locator('a[href^="/portfolio/"]').first().click();
  await expect(page).toHaveURL(/\/portfolio\/[^/]+$/);
});

for (const orientation of ["portrait","landscape"]) {
  test(`${orientation} detail video playback, sizing, close and Escape`, async ({ page }) => {
    await page.goto(`/portfolio/e2e-${orientation}`);
    await expect(page.locator("h1")).toContainText(`E2E ${orientation}`);
    await page.getByRole("button", { name: /play/i }).first().click();
    const dialog = page.getByRole("dialog", { name: `E2E ${orientation} video player` });
    await expect(dialog).toBeVisible();
    const video = dialog.locator("video");
    await expect(video).toBeVisible();
    await expect.poll(() => video.evaluate(v => v.readyState)).toBeGreaterThanOrEqual(2);
    if (await video.evaluate(v => v.paused)) await dialog.getByRole("button", { name: "Play video", exact: true }).click();
    await expect.poll(() => video.evaluate(v => v.currentTime)).toBeGreaterThan(0);
    await dialog.getByRole("button", { name: "Pause video", exact: true }).click();
    await expect.poll(() => video.evaluate(v => v.paused)).toBe(true);
    const sizing = await video.evaluate(v => {
      const b=v.getBoundingClientRect(), ratio=v.videoWidth/v.videoHeight;
      const displayedWidth=Math.min(b.width,b.height*ratio), displayedHeight=displayedWidth/ratio;
      return { centered: Math.abs(b.x+b.width/2-innerWidth/2)<20 && Math.abs(b.y+b.height/2-innerHeight/2)<40,
        fills: Math.max(displayedWidth/innerWidth,displayedHeight/innerHeight)>0.8 };
    });
    expect(sizing.centered).toBeTruthy(); expect(sizing.fills).toBeTruthy();
    await page.setViewportSize({ width: 844, height: 390 });
    await expect(dialog.getByRole("button", { name: "Close video" })).toBeInViewport();
    await dialog.getByRole("button", { name: "Close video" }).click();
    await expect(dialog).not.toBeVisible();
    await page.getByRole("button", { name: /play/i }).first().click();
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
  });
}

test("new and edit project preserve single field values and legacy source", async ({ page }, info) => {
  await login(page);
  await page.goto("/admin/portfolio/new");
  const title = `E2E draft ${info.project.name} ${Date.now()}`;
  await page.getByLabel("Project Title", { exact: true }).fill(title);
  await page.getByLabel("Client Name", { exact: true }).fill("Regression client");
  await page.getByLabel("Project Banner Alt Text").fill("Single banner description");
  await page.locator('summary').filter({ hasText: "Advanced / Legacy video URL" }).first().click();
  await page.getByLabel("Or paste any video URL").first().fill("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  await page.locator('summary').filter({ hasText: "Advanced / Legacy video URL" }).first().click();
  await expect(page.locator('input[name="videoUrl"]')).toHaveValue("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  await page.getByRole("button", { name: "Publish Project", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/portfolio$/);
  await page.getByRole("tab", { name: "Projects", exact: true }).click();
  const row = page.locator("tr").filter({ hasText: title });
  await row.locator('a[href^="/admin/portfolio/"]').first().click();
  await expect(page).toHaveURL(/\/admin\/portfolio\/[^/]+\/edit$/);
  const editURL = page.url();
  await expect(page.getByLabel("Project Title", { exact: true })).toHaveValue(title);
  const changed = title + " revised";
  await page.getByLabel("Project Title", { exact: true }).fill("");
  await page.getByLabel("Project Title", { exact: true }).pressSequentially(changed);
  await page.getByLabel("Client Name", { exact: true }).fill("Replacement client");
  await page.getByLabel("Description", { exact: true }).fill("A single description.");
  await page.getByRole("button", { name: "Save Changes", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/portfolio$/);
  await page.goto(editURL);
  await expect(page.getByLabel("Project Title", { exact: true })).toHaveValue(changed);
  await expect(page.getByLabel("Client Name", { exact: true })).toHaveValue("Replacement client");
  await expect(page.getByLabel("Description", { exact: true })).toHaveValue("A single description.");
  await expect(page.locator('input[name="videoUrl"]')).toHaveValue("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
});

test("upload rejects invalid types and displays initiation failure without losing text", async ({ page }) => {
  await login(page); await page.goto("/admin/portfolio/new");
  await page.getByLabel("Project Title", { exact: true }).fill("Upload regression");
  const file = page.locator('input[type="file"][accept*="video"]').first();
  await file.setInputFiles({ name: "bad.txt", mimeType: "text/plain", buffer: Buffer.from("not a video") });
  await expect(page.getByText("Upload blocked: only MP4 and WebM video files are allowed.")).toBeVisible();
  await page.route("**/api/upload/initiate", route => route.fulfill({ status: 503, body: "{}" }));
  await file.setInputFiles("../public/e2e/portrait.mp4");
  await expect(page.getByText("Upload failed. Please try again.")).toBeVisible();
  await expect(page.getByLabel("Project Title", { exact: true })).toHaveValue("Upload regression");
  await expect(page.getByLabel("Video Orientation", { exact: true })).toHaveValue("portrait");
});

test("contact validates required fields and delivers inquiry to admin inbox", async ({ page }) => {
  await page.goto("/contact");
  const form = page.locator('form').filter({ has: page.locator('textarea[name="message"]') }).first();
  await form.locator('button[type="submit"]').click();
  expect(await form.evaluate(f => f.checkValidity())).toBe(false);
  const marker = `E2E inquiry ${Date.now()}`;
  await form.locator('[name="name"]').fill(marker);
  await form.locator('[name="email"]').fill("inquiry@example.test");
  await form.locator('[name="message"]').fill("This is an automated test inquiry in an isolated local database.");
  await form.locator('button[type="submit"]').click();
  await expect(page.getByRole("status").first()).toBeVisible();
  await login(page); await page.goto("/admin/messages");
  await expect(page.getByText(marker, { exact: true }).first()).toBeVisible();
});
