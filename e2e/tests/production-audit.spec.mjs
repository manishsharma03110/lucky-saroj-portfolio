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

test("CMS route inventory and accessible forms", async ({page},info) => {
  test.skip(info.project.name!=="desktop", "CMS inventory is tested once; critical mutations run in desktop and mobile.");
  test.setTimeout(180000);
  await page.goto('/admin/login');
  await page.getByLabel('Email or Username').fill(process.env.E2E_ADMIN_EMAIL);
  await page.getByLabel('Password',{exact:true}).fill(process.env.E2E_ADMIN_PASSWORD);
  await page.getByRole('button',{name:'Sign in',exact:true}).click();
  await expect(page).toHaveURL(/\/admin\/(?!login)/);
  const rows=[];
  for(const path of ['dashboard','home','about','portfolio','portfolio/new','services','experience','contact','testimonials','categories','pages','showreel','navigation','messages','account','users','security','settings','maintenance','activity','seo']) {
    const response=await page.goto('/admin/'+path);
    expect(response.status()).toBe(200);
    await expect(page.locator('h1').first()).toBeVisible();
    const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    rows.push({path,finalPath:new URL(page.url()).pathname,violations:result.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});
  }
  await info.attach('cms-audit',{body:JSON.stringify(rows,null,2),contentType:'application/json'});
  console.log('CMS_AUDIT',JSON.stringify(rows));
  expect(rows.flatMap(r=>r.violations.filter(v=>v.impact==='critical'))).toEqual([]);
});

test("homepage performance diagnostics on production build",async({page},info)=>{
  test.skip(info.project.name!=='desktop', 'Single reproducible lab sample; not field Core Web Vitals.');
  await page.addInitScript(()=>{
    window.auditVitals={lcp:0,cls:0};
    new PerformanceObserver(list=>{for(const e of list.getEntries()) window.auditVitals.lcp=e.startTime;}).observe({type:'largest-contentful-paint',buffered:true});
    new PerformanceObserver(list=>{for(const e of list.getEntries()) if(!e.hadRecentInput) window.auditVitals.cls+=e.value;}).observe({type:'layout-shift',buffered:true});
  });
  await page.goto('/'); await expect(page.locator('[data-hero] h1')).toBeVisible();
  await page.waitForTimeout(1500);
  const metrics=await page.evaluate(()=>({vitals:window.auditVitals,navigation:performance.getEntriesByType('navigation').map(n=>({ttfb:n.responseStart,domContentLoaded:n.domContentLoadedEventEnd})),resources:performance.getEntriesByType('resource').map(r=>({name:new URL(r.name).pathname,bytes:r.transferSize,duration:r.duration}))}));
  console.log('PERFORMANCE_AUDIT',JSON.stringify(metrics));
  await info.attach('performance-audit',{body:JSON.stringify(metrics,null,2),contentType:'application/json'});
});

test("oversized contact attachment is rejected before upload", async({page})=>{
  await page.goto('/contact');
  const file=page.locator('input[type="file"][accept*="image/jpeg"]').first();
  await file.setInputFiles({name:'oversized.png',mimeType:'image/png',buffer:Buffer.alloc(4*1024*1024+1)});
  await expect(page.getByRole('alert').filter({hasText:'4 MB or smaller'})).toBeVisible();
});
