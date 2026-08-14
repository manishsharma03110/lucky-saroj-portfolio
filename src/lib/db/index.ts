import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

// Production uses Postgres (e.g. Neon) via the DATABASE_URL environment
// variable set in Vercel. See README for local SQLite setup notes.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export const db = drizzle(pool, { schema });
export { schema };
