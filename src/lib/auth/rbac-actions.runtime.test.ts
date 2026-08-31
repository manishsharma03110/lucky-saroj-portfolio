import assert from "node:assert/strict";
import { before, mock, test } from "node:test";

class Denied extends Error {}
let seen: string | null = null;
mock.module("@/lib/auth/authorization", { namedExports: { requirePermission: async (permission: string) => { seen = permission; throw new Denied(); } } });
mock.module("@/lib/db", { namedExports: { db: {}, schema: {} } });
mock.module("next/cache", { namedExports: { revalidatePath: () => {} } });
mock.module("next/navigation", { namedExports: { redirect: () => {} } });

let modules: Record<string, Record<string, (...args: never[]) => Promise<unknown>>>;
before(async () => {
  modules = {
    about: await import("@/lib/actions/about"), categories: await import("@/lib/actions/categories"),
    experience: await import("@/lib/actions/experience"), messages: await import("@/lib/actions/messages"),
    portfolio: await import("@/lib/actions/portfolio"), services: await import("@/lib/actions/services"),
    settings: await import("@/lib/actions/settings"), showreel: await import("@/lib/actions/showreel"),
    testimonials: await import("@/lib/actions/testimonials"),
  } as typeof modules;
});

const idle = { status: "idle" as const };
const cases: Array<[string, string, string, unknown[]]> = [
  ["about","updateAboutProfile","about.update",[idle,new FormData()]],
  ["categories","createCategory","categories.create",[idle,new FormData()]], ["categories","deleteCategory","categories.delete",["id"]],
  ["experience","createExperience","experience.create",[idle,new FormData()]], ["experience","updateExperience","experience.update",["id",idle,new FormData()]], ["experience","deleteExperience","experience.delete",["id"]],
  ["messages","updateMessageStatus","messages.update",["id","read"]], ["messages","deleteMessage","messages.delete",["id"]],
  ["portfolio","createProject","portfolio.create",[idle,new FormData()]], ["portfolio","updateProject","portfolio.update",["id",idle,new FormData()]], ["portfolio","deleteProject","portfolio.delete",["id"]], ["portfolio","toggleProjectFeatured","portfolio.update",["id",true]],
  ["services","createService","services.create",[idle,new FormData()]], ["services","updateService","services.update",["id",idle,new FormData()]], ["services","deleteService","services.delete",["id"]],
  ["settings","updateSettings","settings.update",[idle,new FormData()]], ["showreel","upsertShowreel","showreel.update",[idle,new FormData()]],
  ["testimonials","createTestimonial","testimonials.create",[idle,new FormData()]], ["testimonials","updateTestimonial","testimonials.update",["id",idle,new FormData()]], ["testimonials","deleteTestimonial","testimonials.delete",["id"]],
];

for (const [moduleName, functionName, permission, args] of cases) {
  test(`${moduleName}.${functionName} enforces ${permission} before mutation`, async () => {
    seen = null;
    await assert.rejects(() => modules[moduleName][functionName](...(args as never[])), Denied);
    assert.equal(seen, permission);
  });
}
