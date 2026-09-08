import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";

const styles = readFileSync("src/app/globals.css", "utf8");
const siteLayout = readFileSync("src/app/(site)/layout.tsx", "utf8");
const adminLayout = readFileSync("src/app/admin/(protected)/layout.tsx", "utf8");
const homePage = readFileSync("src/app/(site)/page.tsx", "utf8");
const homeComponents = [
  "Hero",
  "SelectedWork",
  "ShowreelSection",
  "EditingStyles",
  "AboutPreview",
  "TestimonialsPreview",
  "FinalCTA",
  "WorkCard",
].map((name) => readFileSync(`src/components/home/${name}.tsx`, "utf8")).join("\n");
const header = readFileSync("src/components/layout/Header.tsx", "utf8");
const mobileMenu = readFileSync("src/components/layout/MobileMenu.tsx", "utf8");
const footer = readFileSync("src/components/layout/Footer.tsx", "utf8");

function publicTsxSource(path: string): string {
  return readdirSync(path, { withFileTypes: true }).map((entry) => {
    const entryPath = `${path}/${entry.name}`;
    if (entry.isDirectory()) return publicTsxSource(entryPath);
    return entry.name.endsWith(".tsx") ? readFileSync(entryPath, "utf8") : "";
  }).join("\n");
}

test("public layout owns the cinematic-blue scope without applying it to Admin", () => {
  assert.match(siteLayout, /className="public-site contents"/);
  assert.doesNotMatch(adminLayout, /public-site/);
  assert.match(styles, /:root\s*\{[\s\S]*--accent-primary:\s*#3b82f6/);
  assert.match(styles, /\.public-site\s*\{[\s\S]*--public-accent-primary:\s*#3b82f6/);
});

test("Home keeps its CMS composition and image-only Hero resolver", () => {
  for (const component of ["Hero", "SelectedWork", "ShowreelSection", "EditingStyles", "AboutPreview", "TestimonialsPreview", "FinalCTA"]) {
    assert.ok(homePage.includes(`<${component}`), `Missing existing Home section: ${component}`);
  }
  assert.match(homePage, /getSiteSettings\(\)/);
  assert.match(homePage, /getFeaturedShowreel\(\)/);
  assert.match(homeComponents, /resolveHeroImageUrl\(heroImageUrl\)/);
  assert.doesNotMatch(homeComponents, /Hero video|heroVideo|hero_video/i);
});

test("Home visual layer uses scoped accents without rejected editor chrome", () => {
  assert.doesNotMatch(homeComponents, /rgba\(59,\s*130,\s*246/);
  assert.doesNotMatch(homeComponents, /\bREC\b|timecode|fake timeline|editing ruler/i);
  assert.match(homeComponents, /var\(--accent-glow\)/);
  assert.match(styles, /--accent-text:\s*var\(--public-accent-text\)/);
  assert.match(styles, /--accent-border:\s*var\(--public-accent-border\)/);
});

test("Home responsive remediation keeps touch targets while improving mobile and wide-screen rhythm", () => {
  assert.match(header, /h-16[\s\S]*sm:h-\[4\.5rem\][\s\S]*lg:h-20/);
  assert.match(header, /h-11 w-11/);
  assert.match(mobileMenu, /100dvh-4rem/);
  assert.match(homeComponents, /max-w-\[1560px\]/);
  assert.match(homeComponents, /py-16 md:py-20 lg:py-24 2xl:py-28/);
  assert.match(footer, /max-\[360px\]:grid-cols-1/);
  assert.doesNotMatch(footer, /<span className="truncate">\{label\}<\/span>/);
});

test("public palette locks interaction, surface, focus, text, border, glow, and gradient tokens", () => {
  for (const token of [
    "--public-accent-hover: #60a5fa",
    "--public-accent-active: #2563eb",
    "--public-accent-subtle: rgba(59, 130, 246, 0.08)",
    "--public-accent-border: rgba(59, 130, 246, 0.35)",
    "--public-accent-text: #60a5fa",
    "--public-focus-ring: #60a5fa",
    "--public-accent-glow: rgba(59, 130, 246, 0.14)",
    "--public-accent-gradient: linear-gradient(135deg, #60a5fa 0%, #3b82f6 55%, #2563eb 100%)",
    "--surface: #121419",
    "--border-default: #242832",
  ]) assert.ok(styles.includes(token), `Missing locked token: ${token}`);

});

test("public explicit focus rings use the locked focus token", () => {
  const publicSource = [
    publicTsxSource("src/app/(site)"),
    publicTsxSource("src/components/layout"),
    publicTsxSource("src/components/home"),
    publicTsxSource("src/components/portfolio"),
    publicTsxSource("src/components/about"),
    publicTsxSource("src/components/services"),
    publicTsxSource("src/components/contact"),
  ].join("\n");

  assert.doesNotMatch(publicSource, /focus-visible:ring-\[var\(--accent-primary\)\]/);
  assert.match(publicSource, /focus-visible:ring-\[var\(--focus\)\]/);
});
