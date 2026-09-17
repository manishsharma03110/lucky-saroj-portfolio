import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;
type VersionRow = { version: string };

export async function GET() {
  const result = await db.execute<VersionRow>(sql`
    SELECT md5(concat_ws(':',
      (SELECT concat(count(*), '-', coalesce(sum(revision),0)) FROM portfolio_projects),
      (SELECT concat(count(*), '-', coalesce(sum(revision),0)) FROM experiences),
      (SELECT concat(count(*), '-', coalesce(sum(revision),0)) FROM services),
      (SELECT concat(count(*), '-', coalesce(sum(revision),0)) FROM testimonials),
      (SELECT concat(count(*), '-', coalesce(sum(revision),0)) FROM showreels),
      (SELECT concat(count(*), '-', coalesce(sum(revision),0)) FROM about_profile),
      (SELECT concat(count(*), '-', coalesce(sum(revision),0)) FROM site_settings),
      (SELECT concat(count(*), '-', coalesce(sum(revision),0)) FROM home_page_content),
      (SELECT concat(count(*), '-', coalesce(sum(revision),0)) FROM page_content),
      (SELECT concat(count(*), '-', coalesce(sum(revision),0)) FROM page_seo),
      (SELECT concat(count(*), '-', coalesce(sum(display_order),0), '-', coalesce(sum(length(name)),0)) FROM portfolio_categories),
      (SELECT concat(count(*), '-', coalesce(sum(display_order),0), '-', coalesce(sum(length(name)),0)) FROM about_skills),
      (SELECT concat(count(*), '-', coalesce(sum(display_order),0), '-', coalesce(sum(length(name)),0)) FROM about_tools),
      (SELECT concat(count(*), '-', coalesce(sum(display_order),0), '-', coalesce(sum(length(url)),0)) FROM project_media),
      (SELECT concat(count(*), '-', coalesce(sum(length(name)),0)) FROM project_tools)
    )) AS version
  `);
  return NextResponse.json({ version: result.rows[0]?.version ?? "0" }, { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } });
}
