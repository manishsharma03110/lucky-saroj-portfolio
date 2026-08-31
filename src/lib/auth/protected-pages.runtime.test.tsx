import assert from "node:assert/strict";
import { before, mock, test } from "node:test";
import { AuthorizationError } from "./authorization-core";

class NotFoundSignal extends Error {}
let allowed = false;
let dbCalls = 0;
let seen: string[] = [];

mock.module("@/lib/auth/authorization", { namedExports: {
  requirePermission: async (permission: string) => {
    seen.push(permission);
    if (!allowed) throw new AuthorizationError("missing-permission");
    return { admin:{id:"x",email:"x@test",name:"X"},role:"EDITOR",permissions:new Set([permission]) };
  },
} });
mock.module("next/navigation", { namedExports: {
  notFound: () => { throw new NotFoundSignal(); },
  redirect: () => { throw new Error("unexpected redirect"); },
} });

const query = new Proxy({}, {
  get: (_target, property) => {
    if (property === "then") return (resolve: (value: unknown[]) => void) => { dbCalls += 1; resolve([]); };
    return () => query;
  },
});
const db = new Proxy({}, { get: () => () => query });
const schema = new Proxy({}, { get: () => new Proxy({}, { get: () => ({}) }) });
mock.module("@/lib/db", { namedExports: { db, schema } });

const cases = [
  ["dashboard", "@/app/admin/(protected)/dashboard/page", "dashboard.view"],
  ["portfolio", "@/app/admin/(protected)/portfolio/page", "portfolio.read"],
  ["portfolio new", "@/app/admin/(protected)/portfolio/new/page", "portfolio.create"],
  ["portfolio edit", "@/app/admin/(protected)/portfolio/[id]/edit/page", "portfolio.update"],
  ["categories", "@/app/admin/(protected)/categories/page", "categories.read"],
  ["services", "@/app/admin/(protected)/services/page", "services.read"],
  ["testimonials", "@/app/admin/(protected)/testimonials/page", "testimonials.read"],
  ["experience", "@/app/admin/(protected)/experience/page", "experience.read"],
  ["about", "@/app/admin/(protected)/about/page", "about.read"],
  ["showreel", "@/app/admin/(protected)/showreel/page", "showreel.read"],
  ["messages", "@/app/admin/(protected)/messages/page", "messages.read"],
  ["settings", "@/app/admin/(protected)/settings/page", "settings.read"],
] as const;

const pages = new Map<string, (arg?: unknown) => Promise<unknown>>();
before(async () => {
  for (const [, path] of cases) pages.set(path, (await import(path)).default as (arg?: unknown) => Promise<unknown>);
});

for (const [name, path, permission] of cases) {
  test(`${name} allows exact permission and denies missing permission`, async () => {
    const page = pages.get(path)!;
    const arg = name === "portfolio edit" ? { params: Promise.resolve({ id:"missing" }) } : undefined;
    allowed = false; dbCalls = 0; seen = [];
    await assert.rejects(() => page(arg), NotFoundSignal);
    assert.deepEqual(seen, [permission]);
    assert.equal(dbCalls, 0);

    allowed = true; dbCalls = 0; seen = [];
    if (name === "portfolio edit") await assert.rejects(() => page(arg), NotFoundSignal);
    else assert.ok(await page(arg));
    assert.deepEqual(seen, [permission]);
    assert.ok(dbCalls > 0 || name === "portfolio new");
  });
}
