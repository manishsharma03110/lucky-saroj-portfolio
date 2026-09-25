import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "playwright/test";

const routes = ["/", "/about", "/portfolio", "/services", "/experience", "/testimonials", "/contact"];
for (const theme of ["dark", "light"]) {
  test(`hero background remains integrated across five widths in ${theme}`, async ({ page }, info) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Light mode", exact: true }).filter({ visible: true }).first();
    if (theme === "light") await toggle.click();
    for (const width of [360, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      const hero = page.locator('[data-hero]');
      await expect(hero.locator("h1")).toBeVisible();
      const result = await hero.evaluate(el => {
        const h=el.getBoundingClientRect(), bg=el.querySelector('[data-hero-background]'), b=bg.getBoundingClientRect();
        const img=bg.querySelector('img'), text=el.querySelector('h1').getBoundingClientRect();
        return {covers: Math.abs(h.width-b.width)<1 && Math.abs(h.height-b.height)<1,
          radius:getComputedStyle(bg).borderRadius, fit:getComputedStyle(img).objectFit,
          textFits:text.left>=h.left && text.right<=h.right+1, overflow:document.documentElement.scrollWidth>innerWidth+1};
      });
      expect(result).toEqual({ covers:true, radius:"0px", fit:"cover", textFits:true, overflow:false });
      await info.attach(`hero-${theme}-${width}`, { body:await page.screenshot(), contentType:"image/png" });
    }
  });
}

test("public route metadata, semantic structure, links and runtime audit", async ({page},info) => {
  const errors=[]; page.on("pageerror", e=>errors.push(e.message));
  const rows=[];
  for (const path of routes) {
    const response=await page.goto(path);
    expect(response.status()).toBe(200);
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /\S{10}/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /^https:\/\//);
    const badLinks=await page.locator('a[href]').evaluateAll(els=>els.filter(a=>/^javascript:|^$/.test(a.getAttribute('href'))).map(a=>a.textContent));
    expect(badLinks).toEqual([]);
    rows.push({path,status:response.status(),title:await page.title()});
  }
  expect(errors).toEqual([]);
  await info.attach("public-audit",{body:JSON.stringify(rows,null,2),contentType:"application/json"});
});

test("security boundaries, crawl endpoints and missing page", async ({request,page}) => {
  const cleanup=await request.get('/api/contact/attachment/cleanup',{headers:{'user-agent':'vercel-cron/1.0'}});
  expect(cleanup.status()).toBe(403);
  for (const path of ['/api/upload/initiate','/api/upload/complete','/api/upload/image']) {
    const response=await request.post(path,{data:{}});
    expect([401,403]).toContain(response.status());
  }
  await page.goto('/admin/users'); await expect(page).toHaveURL(/\/admin\/login/);
  const missing=await request.get('/definitely-not-a-real-page-audit'); expect(missing.status()).toBe(404);
  const robots=await request.get('/robots.txt'); expect(robots.ok()).toBe(true); expect(await robots.text()).toContain('Sitemap:');
  const sitemap=await request.get('/sitemap.xml'); expect(sitemap.ok()).toBe(true); expect(await sitemap.text()).not.toContain('/admin/');
  const home=await request.get('/'); expect(home.headers()['x-content-type-options']).toBe('nosniff'); expect(home.headers()['x-frame-options']).toBe('DENY');
});


test("WCAG automated audit across public pages in both themes", async ({page},info) => {
  test.skip(info.project.name !== "desktop", "One complete axe audit; other engines run behavior checks.");
  test.setTimeout(180000);
  const findings=[];
  for(const theme of ["dark","light"]) {
    for(const path of routes) {
      await page.goto(path);
      if(await page.locator('html').getAttribute('data-theme') !== theme) await page.getByRole('button',{name:'Light mode',exact:true}).filter({visible:true}).first().click();
      const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
      findings.push({path,theme,violations:result.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});
    }
  }
  await info.attach('accessibility-audit',{body:JSON.stringify(findings,null,2),contentType:'application/json'});
  console.log('ACCESSIBILITY_AUDIT',JSON.stringify(findings));
  expect(findings.flatMap(f=>f.violations.filter(v=>v.impact==='critical'))).toEqual([]);
});
