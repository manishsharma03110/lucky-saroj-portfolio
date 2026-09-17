"use server";

import { revalidatePath } from "next/cache";
import { sql } from "drizzle-orm";
import { requirePermission } from "@/lib/auth/authorization";
import { withCmsTransaction } from "@/lib/db";
import { entityIdSchema } from "@/lib/validations/identifiers";

export async function reorderPortfolioProjects(ids: string[]): Promise<void> {
  await requirePermission("portfolio.update");
  if (!Array.isArray(ids) || ids.length === 0 || ids.length > 500 || new Set(ids).size !== ids.length || ids.some((id) => !entityIdSchema.safeParse(id).success)) throw new Error("Invalid project order.");
  await withCmsTransaction(async (tx) => {
    const existing = await tx.db.select<{ id: string }>(sql`SELECT id FROM portfolio_projects WHERE id IN ${ids}`);
    if (existing.rows.length !== ids.length) throw new Error("Project list changed. Reload and try again.");
    for (const [index, id] of ids.entries()) await tx.db.update(sql`UPDATE portfolio_projects SET display_order=${index}, updated_at=now() WHERE id=${id}`);
  });
  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
  revalidatePath("/");
}
