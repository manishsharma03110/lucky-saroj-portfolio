const ALLOWED_TEST_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);
const DISPOSABLE_DATABASE_NAME = /^cms_phase3e_[a-z0-9_]+$/;

export type DestructiveTestTargetEnvironment = Readonly<{
  TEST_DATABASE_URL?: string;
  CMS_ALLOW_DESTRUCTIVE_LOCAL_DB_TESTS?: string;
}>;

export function validateDestructiveTransactionTestTarget(
  environment: DestructiveTestTargetEnvironment
): URL {
  if (environment.CMS_ALLOW_DESTRUCTIVE_LOCAL_DB_TESTS !== "1") {
    throw new Error("Destructive local database tests require explicit opt-in.");
  }

  let target: URL;
  try {
    target = new URL(environment.TEST_DATABASE_URL ?? "");
  } catch {
    throw new Error("Destructive local database test target is invalid.");
  }

  if (target.protocol !== "postgres:" && target.protocol !== "postgresql:") {
    throw new Error("Destructive local database test target must use PostgreSQL.");
  }
  if (!ALLOWED_TEST_HOSTS.has(target.hostname)) {
    throw new Error("Destructive local database test target must be loopback-only.");
  }

  const databaseName = decodeURIComponent(target.pathname.slice(1));
  if (!DISPOSABLE_DATABASE_NAME.test(databaseName)) {
    throw new Error("Destructive local database test target must use a disposable Phase 3E database name.");
  }

  return target;
}

export const TRANSACTION_TEST_ALLOWED_HOSTS = ["localhost", "127.0.0.1", "::1"] as const;
export const TRANSACTION_TEST_DATABASE_NAME_RULE = "^cms_phase3e_[a-z0-9_]+$";
