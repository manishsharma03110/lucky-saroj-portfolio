import assert from "node:assert/strict";
import test from "node:test";
import { PHASE3G_TEST_DATABASE_NAME_RULE, validatePhase3gTestTarget } from "./media-test-target";

const safeTarget = "postgresql://local:local@127.0.0.1:5432/cms_phase3g_media_assets";

test("Phase 3G target guard requires opt-in and a strict disposable loopback target", () => {
  for (const environment of [
    { PHASE3G_TEST_DATABASE_URL: safeTarget },
    { PHASE3G_TEST_DATABASE_URL: "postgresql://local:local@db.example.com/cms_phase3g_media_assets", CMS_ALLOW_PHASE3G_LOCAL_DB_TESTS: "1" },
    { PHASE3G_TEST_DATABASE_URL: "postgresql://local:local@ep-example.neon.tech/cms_phase3g_media_assets", CMS_ALLOW_PHASE3G_LOCAL_DB_TESTS: "1" },
    { PHASE3G_TEST_DATABASE_URL: "postgresql://local:local@127.0.0.1/lucky_saroj_dev", CMS_ALLOW_PHASE3G_LOCAL_DB_TESTS: "1" },
    { PHASE3G_TEST_DATABASE_URL: "postgresql://local:local@127.0.0.1/lucky_saroj_dev_restore", CMS_ALLOW_PHASE3G_LOCAL_DB_TESTS: "1" },
    { PHASE3G_TEST_DATABASE_URL: "postgresql://local:local@127.0.0.1/postgres", CMS_ALLOW_PHASE3G_LOCAL_DB_TESTS: "1" },
    { PHASE3G_TEST_DATABASE_URL: "postgresql://local:local@127.0.0.1/cms_phase3e_media", CMS_ALLOW_PHASE3G_LOCAL_DB_TESTS: "1" },
    { PHASE3G_TEST_DATABASE_URL: `${safeTarget}?sslmode=require`, CMS_ALLOW_PHASE3G_LOCAL_DB_TESTS: "1" },
    { PHASE3G_TEST_DATABASE_URL: "not-a-url", CMS_ALLOW_PHASE3G_LOCAL_DB_TESTS: "1" },
  ]) assert.throws(() => validatePhase3gTestTarget(environment));
});

test("Phase 3G target guard accepts only approved names on IPv4/name loopback", () => {
  for (const host of ["127.0.0.1", "localhost"]) {
    const target = validatePhase3gTestTarget({
      PHASE3G_TEST_DATABASE_URL: `postgresql://local:local@${host}:5432/cms_phase3g_media_assets`,
      CMS_ALLOW_PHASE3G_LOCAL_DB_TESTS: "1",
    });
    assert.equal(target.hostname, host);
    assert.match(target.pathname.slice(1), new RegExp(PHASE3G_TEST_DATABASE_NAME_RULE));
  }
});
