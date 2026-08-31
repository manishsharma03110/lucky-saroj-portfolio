import assert from "node:assert/strict";
import { before, mock, test } from "node:test";
import { AuthorizationError } from "./authorization-core";

class NotFoundSignal extends Error {}
mock.module("@/lib/auth/authorization", { namedExports: { requirePermission: async () => { throw new AuthorizationError("missing-permission"); } } });
mock.module("@/lib/db", { namedExports: { db: {}, schema: {} } });
mock.module("next/navigation", { namedExports: { notFound: () => { throw new NotFoundSignal(); } } });

let Dashboard: () => Promise<unknown>;
before(async () => { ({ default: Dashboard } = await import("@/app/admin/(protected)/dashboard/page")); });

test("direct protected URL permission denial renders not-found", async () => {
  await assert.rejects(Dashboard, NotFoundSignal);
});
