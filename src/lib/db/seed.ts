import { Pool } from "pg";
import { runWithCleanup } from "./seed-lifecycle";
import { validateSeedTarget } from "./seed-target";

async function verifyPostgres18(databaseUrl: string): Promise<void> {
  const verificationPool = new Pool({ connectionString: databaseUrl, max: 1 });
  try {
    const result = await verificationPool.query<{ major: number }>("SELECT current_setting('server_version_num')::int / 10000 AS major");
    if (result.rows[0]?.major !== 18) throw new Error("Seed target must use PostgreSQL 18.");
  } finally { await verificationPool.end(); }
}

async function main(): Promise<void> {
  const target = validateSeedTarget(process.env);
  await verifyPostgres18(target.href);
  process.env.DATABASE_URL = target.href;
  const [{ runSeed }, { closeDatabasePool }] = await Promise.all([import("./seed-service"), import("./core")]);
  const result = await runWithCleanup(
    () => runSeed({ bootstrapEmail: process.env.ADMIN_BOOTSTRAP_EMAIL, bootstrapPassword: process.env.ADMIN_BOOTSTRAP_PASSWORD }),
    closeDatabasePool
  );
  console.log(`Seed complete: settings=${result.settings}, about=${result.about}, administrator=${result.administrator}.`);
}

main().catch(() => {
  console.error("Seed failed. Review the local error context without exposing credentials.");
  process.exitCode = 1;
});
