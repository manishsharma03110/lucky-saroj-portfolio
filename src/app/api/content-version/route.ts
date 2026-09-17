import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type VersionRow = { version: string };

export async function GET() {
  const result = await db.execute<VersionRow>(sql`
    SELECT GREATEST(
      COALESCE((SELECT MAX(updated_at) FROM portfolio_projects), '1970-01-01'::timestamp),
      COALESCE((SELECT MAX(updated_at) FROM page_content), '1970-01-01'::timestamp),
      COALESCE((SELECT MAX(updated_at) FROM site_settings), '1970-01-01'::timestamp)
    )::text AS version
  `);
  return NextResponse.json(
    { version: result.rows[0]?.version ?? "0" },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } },
  );
}
