import assert from "node:assert/strict";
import { before, mock, test } from "node:test";

let authorizationFailure: Error | null = null;
let mutationCalls = 0;

mock.module("@/lib/auth/admin", {
  namedExports: {
    requireAuthenticatedAdmin: async () => {
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
before(async () => {
  categories = await import("@/lib/actions/categories");
  experience = await import("@/lib/actions/experience");
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
