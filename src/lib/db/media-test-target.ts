const ALLOWED_PHASE3G_TEST_HOSTS = new Set(["localhost", "127.0.0.1"]);
const PHASE3G_DATABASE_NAME = /^cms_phase3g_[a-z0-9_]+$/;

export type Phase3gTestTargetEnvironment = Readonly<{
  PHASE3G_TEST_DATABASE_URL?: string;
  CMS_ALLOW_PHASE3G_LOCAL_DB_TESTS?: string;
}>;

export function validatePhase3gTestTarget(environment: Phase3gTestTargetEnvironment): URL {
  if (environment.CMS_ALLOW_PHASE3G_LOCAL_DB_TESTS !== "1") {
    throw new Error("Phase 3G local database tests require explicit opt-in.");
  }

  let target: URL;
  try {
    target = new URL(environment.PHASE3G_TEST_DATABASE_URL ?? "");
  } catch {
    throw new Error("Phase 3G local database test target is invalid.");
  }

  if (target.protocol !== "postgres:" && target.protocol !== "postgresql:") {
    throw new Error("Phase 3G local database test target must use PostgreSQL.");
  }
  if (!ALLOWED_PHASE3G_TEST_HOSTS.has(target.hostname)) {
    throw new Error("Phase 3G local database test target must be loopback-only.");
  }
  if (target.search || target.hash) {
    throw new Error("Phase 3G local database test target must not contain URL options.");
  }

  const databaseName = decodeURIComponent(target.pathname.slice(1));
  if (!PHASE3G_DATABASE_NAME.test(databaseName)) {
    throw new Error("Phase 3G local database test target must use the disposable Phase 3G namespace.");
  }

  return target;
}

export const PHASE3G_TEST_ALLOWED_HOSTS = ["localhost", "127.0.0.1"] as const;
export const PHASE3G_TEST_DATABASE_NAME_RULE = "^cms_phase3g_[a-z0-9_]+$";
