import { validateDestructiveTransactionTestTarget } from "./transaction-test-target";

export type SeedTargetEnvironment = Readonly<{ DATABASE_URL?: string; NODE_ENV?: string; CMS_ALLOW_DESTRUCTIVE_LOCAL_DB_TESTS?: string }>;

export function validateSeedTarget(environment: SeedTargetEnvironment): URL {
  if (environment.NODE_ENV === "production") throw new Error("Database seed is disabled in production.");
  return validateDestructiveTransactionTestTarget({ TEST_DATABASE_URL: environment.DATABASE_URL, CMS_ALLOW_DESTRUCTIVE_LOCAL_DB_TESTS: environment.CMS_ALLOW_DESTRUCTIVE_LOCAL_DB_TESTS });
}
