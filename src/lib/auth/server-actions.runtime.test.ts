import assert from "node:assert/strict";
import { before, mock, test } from "node:test";

let authorizationFailure: Error | null = null;
let mutationCalls = 0;

mock.module("@/lib/auth/authorization", {
  namedExports: {
    requirePermission: async () => {
      if (authorizationFailure) throw authorizationFailure;
      return { id: "11111111-1111-4111-8111-111111111111", email: "admin@example.invalid", name: "Admin" };
    },
  },
});
mock.module("next/cache", { namedExports: { revalidatePath: () => {} } });
mock.module("@/lib/db", {
  namedExports: {
    schema: { portfolioCategories: {}, experiences: {} },
    db: new Proxy({}, {
      get() {
        mutationCalls += 1;
        throw new Error("database boundary reached");
      },
    }),
  },
});

let categories: typeof import("@/lib/actions/categories");
let experience: typeof import("@/lib/actions/experience");
let portfolio: typeof import("@/lib/actions/portfolio");
before(async () => {
  categories = await import("@/lib/actions/categories");
  experience = await import("@/lib/actions/experience");
  portfolio = await import("@/lib/actions/portfolio");
});
const idle = { status: "idle" as const };

for (const [name, invoke] of [
  ["categories", () => categories.createCategory(idle, new FormData())],
  ["experience", () => experience.createExperience(idle, new FormData())],
] as const) {
  test(`${name} action rejects missing authorization before mutation`, async () => {
    authorizationFailure = new Error("unauthenticated");
    mutationCalls = 0;
    await assert.rejects(invoke, /unauthenticated/);
    assert.equal(mutationCalls, 0);
  });

  test(`${name} action rejects stale authorization before mutation`, async () => {
    authorizationFailure = new Error("stale");
    mutationCalls = 0;
    await assert.rejects(invoke, /stale/);
    assert.equal(mutationCalls, 0);
  });

  test(`${name} action with valid authorization reaches validation without mutation`, async () => {
    authorizationFailure = null;
    mutationCalls = 0;
    const result = await invoke();
    assert.equal(result.status, "error");
    assert.equal(mutationCalls, 0);
  });
}

test("authorized malformed ordinary IDs stop before database mutation", async () => {
  authorizationFailure = null;
  mutationCalls = 0;
  await assert.rejects(() => categories.deleteCategory("singleton:about"), /Invalid action input/);
  await assert.rejects(() => experience.deleteExperience("not-a-uuid"), /Invalid action input/);
  assert.equal(mutationCalls, 0);
});

test("featured toggle rejects malformed IDs and string booleans before its service", async () => {
  authorizationFailure = null;
  mutationCalls = 0;
  await assert.rejects(() => portfolio.toggleProjectFeatured("not-a-uuid", 1, true), /Invalid action input/);
  await assert.rejects(() => portfolio.toggleProjectFeatured("11111111-1111-4111-8111-111111111111", 1, "false" as never), /Invalid action input/);
  assert.equal(mutationCalls, 0);
});
mock.module("@/lib/db/remaining-content-service", {
  namedExports: {
    createOrderedCategory: async () => { mutationCalls += 1; },
    createOrderedExperience: async () => { mutationCalls += 1; },
    updateExperienceRevision: async () => { mutationCalls += 1; return 2; },
  },
});
mock.module("@/lib/db/portfolio-service", {
  namedExports: {
    createPortfolioProject: async () => { mutationCalls += 1; return "id"; },
    updatePortfolioProject: async () => { mutationCalls += 1; return 2; },
    togglePortfolioFeatured: async () => { mutationCalls += 1; return 2; },
  },
});
