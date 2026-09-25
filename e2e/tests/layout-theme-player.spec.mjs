import { test, expect } from "playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("contact-popup-shown", "1"));
});
async function login(page) {
  await page.goto("/admin/login");
  await page.getByLabel("Email or Username").fill(process.env.E2E_ADMIN_EMAIL);
  await page.getByLabel("Password", { exact:true }).fill(process.env.E2E_ADMIN_PASSWORD);
  await page.getByRole("button", { name:"Sign in", exact:true }).click();
  await expect(page).toHaveURL(/\/admin\/(?!login)/);
}
const toggle = page => page.getByRole("button", { name:"Light mode", exact:true }).filter({visible:true}).first();

test("long legacy URLs never resize fields, even on narrow and landscape screens", async ({page}) => {
  await login(page); await page.goto("/admin/portfolio/new");
  await page.locator("summary").filter({hasText:"Advanced / Legacy video URL"}).click();
  const input=page.getByLabel("Or paste any video URL");
  const title=page.getByLabel("Project Title",{exact:true});
  for (const size of [{width:1280,height:800},{width:844,height:390},{width:390,height:844}]) {
    await page.setViewportSize(size); await input.fill("");
    const before=await title.boundingBox();
    const url="https://example.com/video?token="+"abcdef0123456789".repeat(750);
    await input.fill(url);
    await expect(input).toHaveValue(url);
    const after=await title.boundingBox();
    expect(Math.abs(before.width-after.width)).toBeLessThan(1);
    expect(await input.evaluate(el=>el.getBoundingClientRect().right<=innerWidth)).toBe(true);
    expect(await page.locator("form").first().evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);
  }
});

test("theme persists across all public pages, reload and CMS login", async ({page}) => {
  await page.goto("/"); await toggle(page).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme","light");
  for(const path of ["/about","/portfolio","/services","/experience","/testimonials","/contact","/admin/login"]) {
    await page.goto(path);
    await expect(page.locator("html")).toHaveAttribute("data-theme","light");
    const colors=await page.locator("body").evaluate(el=>({bg:getComputedStyle(el).backgroundColor,text:getComputedStyle(el).color}));
    expect(colors.bg).toBe("rgb(247, 248, 250)"); expect(colors.text).toBe("rgb(17, 19, 24)");
    await expect(toggle(page)).toHaveAttribute("aria-pressed","true");
  }
  await login(page);
  for(const path of ["/admin/dashboard","/admin/portfolio/new","/admin/account","/admin/users","/admin/security"]) {
    await page.goto(path); await expect(page.locator("html")).toHaveAttribute("data-theme","light");
    await expect(page.locator("h1")).toBeVisible();
  }
  await page.reload(); await expect(toggle(page)).toHaveAttribute("aria-pressed","true");
  await toggle(page).click(); await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme","dark");
});

test("landscape controls stay compact, hide during playback and return on tap", async ({page}) => {
  await page.setViewportSize({width:844,height:390});
  await page.goto("/portfolio/e2e-landscape");
  await page.getByRole("button",{name:"Play E2E landscape",exact:true}).click();
  const dialog=page.getByRole("dialog",{name:"E2E landscape video player"});
  const video=dialog.locator("video");
  await expect.poll(()=>video.evaluate(v=>v.readyState)).toBeGreaterThanOrEqual(2);
  if(await video.evaluate(v=>v.paused)) await dialog.getByRole("button",{name:"Play video",exact:true}).click();
  const timeline=dialog.getByRole("slider",{name:"Video progress"});
  await dialog.getByRole("button",{name:"Show video controls",exact:true}).click({position:{x:10,y:100}});
  const dimensions=await timeline.evaluate(el=>{const r=el.parentElement.getBoundingClientRect();return {height:r.height,bottom:r.bottom};});
  expect(dimensions.height).toBeLessThanOrEqual(52);
  expect(Math.abs(dimensions.bottom-390)).toBeLessThan(2);
  await expect(timeline).not.toBeVisible({timeout:6000});
  await expect(dialog.getByRole("button",{name:"Close video",exact:true})).toBeVisible();
  await dialog.getByRole("button",{name:"Show video controls",exact:true}).click({position:{x:10,y:100}});
  await expect(timeline).toBeVisible();
  await dialog.getByRole("button",{name:"Pause video",exact:true}).click();
  await expect.poll(()=>video.evaluate(v=>v.paused)).toBe(true);
  await page.waitForTimeout(2800); await expect(timeline).toBeVisible();
  await timeline.focus(); await timeline.press("ArrowRight");
  await expect(timeline).toBeFocused();
  await dialog.getByRole("button",{name:"Close video",exact:true}).click();
  await expect(dialog).not.toBeVisible();
});
