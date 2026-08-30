import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const protectedActions = [
  "about.ts",
  "categories.ts",
  "experience.ts",
  "messages.ts",
  "portfolio.ts",
  "services.ts",
  "settings.ts",
  "showreel.ts",
  "testimonials.ts",
];

test("all protected action modules use centralized revalidation", () => {
  let authorizationCalls = 0;
  for (const filename of protectedActions) {
    const source = fs.readFileSync(path.join(root, "src/lib/actions", filename), "utf8");
    assert.match(source, /import \{ requireAuthenticatedAdmin \} from "@\/lib\/auth\/admin";/);
    assert.doesNotMatch(source, /function requireAdmin|await auth\(\)|session\?\.user/);
    authorizationCalls += source.match(/await requireAuthenticatedAdmin\(\);/g)?.length ?? 0;
  }
  assert.equal(authorizationCalls, 20);
});

test("public contact submission remains intentionally public", () => {
  const source = fs.readFileSync(path.join(root, "src/lib/actions/contact.ts"), "utf8");
  assert.match(source, /export async function submitContactForm/);
  assert.doesNotMatch(source, /requireAuthenticatedAdmin|requireAdminForApi/);
});

test("upload API rejects requests through centralized API authorization", () => {
  const routeSource = fs.readFileSync(path.join(root, "src/app/api/upload/route.ts"), "utf8");
  const handlerSource = fs.readFileSync(path.join(root, "src/app/api/upload/handler.ts"), "utf8");
  assert.match(routeSource, /authorizeAdmin: requireAdminForApi/);
  assert.match(routeSource, /handleBlobUpload: handleUpload/);
  assert.match(handlerSource, /const authorization = await authorizeAdmin\(\)/);
  assert.match(handlerSource, /if \(!authorization\.ok\) return authorization\.response/);
  assert.ok(
    handlerSource.indexOf("await authorizeAdmin()") < handlerSource.indexOf("await request.json()")
  );
  assert.ok(
    handlerSource.indexOf("await authorizeAdmin()") < handlerSource.indexOf("await handleBlobUpload(")
  );
  assert.doesNotMatch(`${routeSource}\n${handlerSource}`, /await auth\(\)|session\?\.user/);
});

test("admin navigation boundaries use current database-revalidated admin", () => {
  for (const filename of ["src/app/admin/page.tsx", "src/app/admin/(protected)/layout.tsx"]) {
    const source = fs.readFileSync(path.join(root, filename), "utf8");
    assert.match(source, /await getCurrentAdmin\(\)/);
    assert.doesNotMatch(source, /await auth\(\)|session\?\.user/);
  }
});
