import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const { Client } = pg;
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required.");

const drizzleDir = path.resolve(process.cwd(), "drizzle");
const files = (await readdir(drizzleDir))
  .filter((name) => /^\d{4}_.+\.sql$/.test(name))
  .sort((a, b) => a.localeCompare(b));

if (files.length === 0) throw new Error("No SQL migrations found.");

const client = new Client({ connectionString: databaseUrl, application_name: "ci-migration-replay" });
await client.connect();

try {
  for (const file of files) {
    const sql = await readFile(path.join(drizzleDir, file), "utf8");
    process.stdout.write(`Applying ${file}... `);
    await client.query(sql);
    console.log("ok");
  }
  console.log(`Applied ${files.length} SQL migrations successfully.`);
} finally {
  await client.end();
}
