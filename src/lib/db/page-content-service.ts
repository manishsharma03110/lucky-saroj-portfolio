import "server-only";
import { sql } from "drizzle-orm";
import { withCmsTransaction } from "./index";
import { ContentNotFoundError, StaleRevisionError } from "./mutation-errors";
import { defaultPageContent, PAGE_CONTENT_KEYS, type PageContentKey } from "@/lib/page-content";

export type PageContentRecord = Readonly<{
  pageKey: PageContentKey;
  content: Record<string, string>;
  revision: number;
}>;

function normalizeContent(pageKey: PageContentKey, value: unknown): Record<string, string> {
  const defaults = defaultPageContent(pageKey);
  if (!value || typeof value !== "object" || Array.isArray(value)) return defaults;
  const input = value as Record<string, unknown>;
  return Object.fromEntries(Object.entries(defaults).map(([key, fallback]) => [key, typeof input[key] === "string" ? input[key] as string : fallback]));
}

export async function getPageContent(pageKey: PageContentKey): Promise<PageContentRecord> {
  return withCmsTransaction(async (tx) => {
    const result = await tx.db.select<{ pageKey: PageContentKey; content: unknown; revision: number }>(sql`
      SELECT page_key AS "pageKey", content, revision FROM page_content WHERE page_key=${pageKey}
    `);
    const row = result.rows[0];
    if (!row) return Object.freeze({ pageKey, content: defaultPageContent(pageKey), revision: 1 });
    return Object.freeze({ pageKey, content: normalizeContent(pageKey, row.content), revision: row.revision });
  });
}

export async function getAllPageContent(): Promise<PageContentRecord[]> {
  return withCmsTransaction(async (tx) => {
    const result = await tx.db.select<{ pageKey: PageContentKey; content: unknown; revision: number }>(sql`
      SELECT page_key AS "pageKey", content, revision FROM page_content ORDER BY page_key
    `);
    const byKey = new Map(result.rows.map((row) => [row.pageKey, row]));
    return PAGE_CONTENT_KEYS.map((pageKey) => {
      const row = byKey.get(pageKey);
      return Object.freeze({
        pageKey,
        content: row ? normalizeContent(pageKey, row.content) : defaultPageContent(pageKey),
        revision: row?.revision ?? 1,
      });
    });
  });
}

export async function updatePageContent(pageKey: PageContentKey, content: Record<string, string>, expectedRevision: number): Promise<number> {
  return withCmsTransaction(async (tx) => {
    const serialized = JSON.stringify(normalizeContent(pageKey, content));
    const updated = await tx.db.update<{ revision: number }>(sql`
      UPDATE page_content SET content=${serialized}::jsonb, revision=revision+1
      WHERE page_key=${pageKey} AND revision=${expectedRevision}
      RETURNING revision
    `);
    if (updated.rows[0]) return updated.rows[0].revision;
    const exists = await tx.db.select(sql`SELECT 1 FROM page_content WHERE page_key=${pageKey}`);
    if (!exists.rows[0]) throw new ContentNotFoundError();
    throw new StaleRevisionError();
  });
}
