import assert from "node:assert/strict";
import test from "node:test";
import { validateSeedTarget } from "./seed-target";

const optIn = "1";

test("seed target accepts opted-in disposable databases on every supported loopback host", () => {
  for (const url of [
    "postgresql://local:local@localhost:5432/cms_phase3e_localhost",
    "postgresql://local:local@127.0.0.1:5432/cms_phase3e_ipv4",
    "postgresql://local:local@[::1]:5432/cms_phase3e_ipv6",
  ]) {
    assert.match(validateSeedTarget({ DATABASE_URL: url, CMS_ALLOW_DESTRUCTIVE_LOCAL_DB_TESTS: optIn }).pathname, /^\/cms_phase3e_/);
  }
});

test("seed target rejects unsafe environments and parsed targets without connecting", () => {
  const rejected = [
    { DATABASE_URL: "postgresql://local:local@127.0.0.1:5432/cms_phase3e_pass2e", CMS_ALLOW_DESTRUCTIVE_LOCAL_DB_TESTS: optIn, NODE_ENV: "production" },
    { DATABASE_URL: "postgresql://local:local@127.0.0.1:5432/lucky_saroj_dev_restore", CMS_ALLOW_DESTRUCTIVE_LOCAL_DB_TESTS: optIn },
    { DATABASE_URL: "postgresql://local:local@127.0.0.1:5432/lucky_saroj_dev", CMS_ALLOW_DESTRUCTIVE_LOCAL_DB_TESTS: optIn },
    { DATABASE_URL: "postgresql://local:local@127.0.0.1:5432/neondb", CMS_ALLOW_DESTRUCTIVE_LOCAL_DB_TESTS: optIn },
    { DATABASE_URL: "postgresql://local:local@example.com:5432/cms_phase3e_pass2e", CMS_ALLOW_DESTRUCTIVE_LOCAL_DB_TESTS: optIn },
    { DATABASE_URL: "postgresql://local:local@ep-synthetic.us-east-2.aws.neon.tech/cms_phase3e_pass2e", CMS_ALLOW_DESTRUCTIVE_LOCAL_DB_TESTS: optIn },
    { DATABASE_URL: "postgresql://local:local@127.0.0.1:5432/cms_phase3e_pass2e" },
    { DATABASE_URL: "postgresql://local:local@127.0.0.1:5432/cms_phase3e_pass2e", CMS_ALLOW_DESTRUCTIVE_LOCAL_DB_TESTS: "" },
    { DATABASE_URL: "postgresql://local:local@127.0.0.1:5432/cms_phase3e_pass2e", CMS_ALLOW_DESTRUCTIVE_LOCAL_DB_TESTS: "0" },
    { DATABASE_URL: "postgresql://local:local@127.0.0.1:5432/cms_phase3e_pass2e", CMS_ALLOW_DESTRUCTIVE_LOCAL_DB_TESTS: "true" },
    { DATABASE_URL: "postgresql://local:local@127.0.0.1:5432/cms_phase3e_pass2e", CMS_ALLOW_DESTRUCTIVE_LOCAL_DB_TESTS: "yes" },
    { DATABASE_URL: "postgresql://local:local@127.0.0.1:5432/cms_phase3e_pass2e", CMS_ALLOW_DESTRUCTIVE_LOCAL_DB_TESTS: "unexpected" },
    { DATABASE_URL: "postgresql://local:local@127.0.0.1:5432/not_phase3e", CMS_ALLOW_DESTRUCTIVE_LOCAL_DB_TESTS: optIn },
    { DATABASE_URL: "postgresql://local:local@127.0.0.1:5432/CMS_PHASE3E_UPPER", CMS_ALLOW_DESTRUCTIVE_LOCAL_DB_TESTS: optIn },
    { DATABASE_URL: "not a URL", CMS_ALLOW_DESTRUCTIVE_LOCAL_DB_TESTS: optIn },
    { DATABASE_URL: "postgresql://localhost.example.com:5432/cms_phase3e_suffix", CMS_ALLOW_DESTRUCTIVE_LOCAL_DB_TESTS: optIn },
    { DATABASE_URL: "postgresql://localhost@evil.example:5432/cms_phase3e_userinfo", CMS_ALLOW_DESTRUCTIVE_LOCAL_DB_TESTS: optIn },
    { DATABASE_URL: "postgresql://local:local@127.0.0.1:5432/cms_phase3e_valid%2Fextra", CMS_ALLOW_DESTRUCTIVE_LOCAL_DB_TESTS: optIn },
  ];
  for (const environment of rejected) assert.throws(() => validateSeedTarget(environment));
});
