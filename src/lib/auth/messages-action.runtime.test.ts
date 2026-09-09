import assert from "node:assert/strict";
import { before, mock, test } from "node:test";
import Module from "node:module";
import { ContentNotFoundError, StaleRevisionError } from "../db/mutation-errors";
let mode = "success";
const logs: object[] = []; const writes: unknown[][] = []; const paths: string[] = [];
let update: typeof import("../actions/messages").updateMessageStatus;
before(async () => {
  const loader = Module as unknown as { _load: (name: string, ...args: unknown[]) => unknown }; const load = loader._load;
  mock.method(loader, "_load", (name: string, ...args: unknown[]) => {
    if (name === "@/lib/db") return { db: {}, schema: {} };
    if (name === "@/lib/auth/authorization") return { requirePermission: async (permission: string) => { assert.equal(permission, "messages.update"); if (mode === "permission") throw new Error("SECRET"); } };
    if (name === "@/lib/db/remaining-content-service") return { updateMessageStatusRevision: async (...args: unknown[]) => { writes.push(args); if (mode === "stale") throw new StaleRevisionError(); if (mode === "missing") throw new ContentNotFoundError(); if (mode === "unexpected") throw new Error("SECRET"); return 2; } };
    if (name === "next/cache") return { revalidatePath: (path: string) => { paths.push(path); if (mode === "cache") throw new Error("SECRET"); } };
    return load(name, ...args);
  });
  mock.method(console, "info", (entry: object) => { logs.push(entry); });
  ({ updateMessageStatus: update } = await import("../actions/messages"));
});
const id = "7bcb0598-46f5-4b71-afcd-265ba6981540";
for (const scenario of ["success", "stale", "missing", "permission", "unexpected", "validation", "cache"]) test(`sanitized action diagnostics: ${scenario}`, async () => {
  mode = scenario; logs.length = 0; writes.length = 0; paths.length = 0;
  const call = () => update(scenario === "validation" ? "SECRET@example.test" : id, 1, "read");
  if (["permission", "unexpected", "cache"].includes(scenario)) await assert.rejects(call);
  else { const result = await call(); assert.equal(result.status, scenario === "success" ? "success" : "error"); }
  assert.ok(!JSON.stringify(logs).includes("SECRET"));
  const categories = logs.map(entry => (entry as { result: string }).result);
  const expected: Record<string, string> = { success: "success", stale: "stale", missing: "not_found", permission: "authorization_check_failed", unexpected: "mutation_failed", validation: "validation_failed", cache: "revalidation_failed" };
  assert.equal(categories.at(-1), expected[scenario]);
  assert.equal(categories.includes("committed"), ["success", "cache"].includes(scenario));
  if (["permission", "validation"].includes(scenario)) assert.equal(writes.length, 0);
  else assert.deepEqual(writes[0], [id, 1, "read"]);
  assert.deepEqual(paths, ["success", "cache"].includes(scenario) ? ["/admin/messages"] : []);
});
