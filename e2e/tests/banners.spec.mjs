import { test, expect } from "playwright/test";
import pg from "pg";
import { randomUUID } from "node:crypto";

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
async function assertCover(art) {
  await expect(art).toHaveCount(1);
  await expect(art).toBeVisible();
  const style = await art.evaluate(el => {
    const s = getComputedStyle(el);
    return el.tagName === "IMG"
      ? { fit: s.objectFit, position: s.objectPosition }
      : { fit: s.backgroundSize, position: s.backgroundPosition };
  });
  expect(style).toEqual({ fit: "cover", position: "50% 50%" });
}
for (const orientation of ["portrait", "landscape"]) {
  test(`${orientation} banner uploads and saves with no size or orientation entry`, async ({ page }, info) => {
    await login(page);
    const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
    await db.connect();
    const id = randomUUID(), pathname = `cms-media/${id}/image`, url = `https://e2e.public.blob.vercel-storage.com/${pathname}`;
    try {
      // Simulate only Blob transport. Save, ownership attachment and reopen use the real local database.
      await db.query(`INSERT INTO media_assets(id,provider,provider_key,kind,original_filename,url,uploaded_by_admin_id)
        SELECT $1,'vercel_blob',$2,'image',$3,$4,id FROM admin_users WHERE email=$5`,
        [id, pathname, `banner-${orientation}.png`, url, process.env.E2E_ADMIN_EMAIL]);
      await page.route(url, route => route.fulfill({ path: `../public/e2e/banner-${orientation}.png`, contentType: "image/png" }));
      await page.route("**/api/upload/image", route => route.fulfill({
        status: 200, contentType: "application/json",
        body: JSON.stringify({ assetId: id, pathname, kind: "image", url })
      }));
      await page.goto("/admin/portfolio/new");
      const title = `E2E ${orientation} banner ${info.project.name} ${Date.now()}`;
      await page.getByLabel("Project Title", { exact: true }).fill(title);
      await page.getByLabel("Upload Project Banner — optional", { exact: true }).setInputFiles(`../public/e2e/banner-${orientation}.png`);
      await expect(page.locator('input[name="thumbnailAssetId"]')).toHaveValue(id);
      await expect(page.getByLabel("Video Orientation", { exact: true })).toHaveValue("auto");
      await page.getByRole("button", { name: "Publish Project", exact: true }).click();
      await expect(page).toHaveURL(/\/admin\/portfolio$/);
      const saved = (await db.query("SELECT id,thumbnail_url,video_orientation FROM portfolio_projects WHERE title=$1",[title])).rows[0];
      expect(saved.thumbnail_url).toBe(url); expect(saved.video_orientation).toBe("auto");
      expect((await db.query("SELECT state FROM media_assets WHERE id=$1",[id])).rows[0].state).toBe("attached");
      await page.goto(`/admin/portfolio/${saved.id}/edit`);
      await expect(page.locator('input[name="thumbnailUrl"]')).toHaveValue(url);
      await page.getByLabel("Client Name", { exact: true }).fill("Banner preserved on unrelated edit");
      await page.getByRole("button", { name: "Save Changes", exact: true }).click();
      await expect(page).toHaveURL(/\/admin\/portfolio$/);
      expect((await db.query("SELECT thumbnail_url FROM portfolio_projects WHERE id=$1",[saved.id])).rows[0].thumbnail_url).toBe(url);
    } finally { await db.end(); }
  });

  test(`${orientation} banner remains one center-cover layer across all public surfaces`, async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: `Show E2E ${orientation}`, exact: true }).click();
    // Home slider uses the project title as the artwork label.
    await assertCover(page.locator("#home-selected-work").getByRole("img", { name: `E2E ${orientation}`, exact: true }));
    await page.goto("/portfolio");
    await assertCover(page.getByRole("img", { name: `E2E ${orientation} banner`, exact: true }));
    await page.goto(`/portfolio/e2e-${orientation}`);
    await assertCover(page.getByRole("img", { name: `E2E ${orientation} banner`, exact: true }));
    const other = orientation === "portrait" ? "landscape" : "portrait";
    await page.goto(`/portfolio/e2e-${other}`);
    await assertCover(page.locator('section[aria-labelledby="related-projects-heading"]').getByRole("img", { name: `E2E ${orientation} banner`, exact: true }));
  });
}

test("project saves without a banner, dimensions or manual orientation", async ({ page }) => {
  await login(page); await page.goto("/admin/portfolio/new");
  const title = `E2E optional banner ${Date.now()}`;
  await page.getByLabel("Project Title", { exact: true }).fill(title);
  await page.getByRole("button", { name: "Publish Project", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/portfolio$/);
  await page.getByRole("tab", { name: "Projects", exact: true }).click();
  await page.locator("tr").filter({ hasText: title }).getByRole("link", { name: `Edit ${title}`, exact: true }).click();
  await expect(page.getByLabel("Project Title", { exact: true })).toHaveValue(title);
  await expect(page.locator('input[name="thumbnailUrl"]')).toHaveValue("");
  await expect(page.getByLabel("Video Orientation", { exact: true })).toHaveValue("auto");
});
