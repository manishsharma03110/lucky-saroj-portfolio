import assert from "node:assert/strict";
import test from "node:test";

test("plain CLI runtime can load the canonical seed service chain without connecting", async () => {
  const previousDatabaseUrl = process.env.DATABASE_URL;
  process.env.DATABASE_URL = "postgresql://synthetic:synthetic@127.0.0.1:5432/cms_phase3e_cli_smoke";
  try {
    const seedService = await import("./seed-service");
    assert.equal(typeof seedService.runSeed, "function");
  } finally {
    if (previousDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previousDatabaseUrl;
  }
});
