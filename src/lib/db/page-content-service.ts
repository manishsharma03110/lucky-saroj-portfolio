import "server-only";
import { sql } from "drizzle-orm";
import { withCmsTransaction } from "./index";
import { ContentNotFoundError, StaleRevisionError } from "./mutation-errors";
import { prepareSiteImageSlot, synchronizeSiteImageSlot, type SiteImageSlot } from "./site-media-slot-service";
import { defaultPageContent, PAGE_CONTENT_KEYS, type PageContentKey } from "@/lib/page-content";

export type PageContentRecord = Readonly<{
  pageKey: PageContentKey;
  content: Record<string, string>;
  revision: number;
}>;

const PAGE_HERO_SLOTS: Partial<Record<PageContentKey, SiteImageSlot>> = {
  services: "services_hero_image",
  experience: "experience_hero_image",
  contact: "contact_hero_image",
};

function normalizeContent(pageKey: PageContentKey, value: unknown): Record<string, string> {
  const defaults = defaultPageContent(pageKey);
  if (!value || typeof value !== "object" || Array.isArray(value)) return defaults;
  const input = value as Record<string, unknown>;
  return Object.fromEntries(Object.entries(defaults).map(([key, fallback]) => [key, typeof input[key] === "string" ? input[key] as string : fallback]));
}

function missingRelation(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && "code" in error && (error as { code?: unknown }).code === "42P01");
}

export async function getPageContent(pageKey: PageContentKey): Promise<PageContentRecord> {
  try {
    return await withCmsTransaction(async (tx) => {
      const result = await tx.db.select<{ pageKey: PageContentKey; content: unknown; revision: number }>(sql`
        SELECT page_key AS "pageKey", content, revision FROM page_content WHERE page_key=${pageKey}
      `);
      const row = result.rows[0];
      if (!row) return Object.freeze({ pageKey, content: defaultPageContent(pageKey), revision: 1 });
      return Object.freeze({ pageKey, content: normalizeContent(pageKey, row.content), revision: row.revision });
    });
  } catch (error) {
    if (missingRelation(error)) return Object.freeze({ pageKey, content: defaultPageContent(pageKey), revision: 1 });
    throw error;
  }
}

export async function getAllPageContent(): Promise<PageContentRecord[]> {
  try {
    return await withCmsTransaction(async (tx) => {
      const result = await tx.db.select<{ pageKey: PageContentKey; content: unknown; revision: number }>(sql`
        SELECT page_key AS "pageKey", content, revision FROM page_content ORDER BY page_key
      `);
      const byKey = new Map(result.rows.map((row) => [row.pageKey, row]));
      return PAGE_CONTENT_KEYS.map((pageKey) => {
        const row = byKey.get(pageKey);
        return Object.freeze({ pageKey, content: row ? normalizeContent(pageKey, row.content) : defaultPageContent(pageKey), revision: row?.revision ?? 1 });
      });
    });
  } catch (error) {
    if (missingRelation(error)) return PAGE_CONTENT_KEYS.map((pageKey) => Object.freeze({ pageKey, content: defaultPageContent(pageKey), revision: 1 }));
    throw error;
  }
}

export async function updatePageContent(
  pageKey: PageContentKey,
  content: Record<string, string>,
  expectedRevision: number,
  heroImageAssetId?: string | null
): Promise<number> {
  return withCmsTransaction(async (tx) => {
    const normalized = normalizeContent(pageKey, content);
    const heroSlot = PAGE_HERO_SLOTS[pageKey];
    const heroImage = heroSlot
      ? await prepareSiteImageSlot(tx, { assetId: heroImageAssetId || null, url: normalized.heroImageUrl || null, kind: "image" })
      : null;
    const serialized = JSON.stringify(normalized);
    const updated = await tx.db.update<{ revision: number }>(sql`
      UPDATE page_content SET content=${serialized}::jsonb, revision=revision+1
      WHERE page_key=${pageKey} AND revision=${expectedRevision}
      RETURNING revision
    `);
    if (!updated.rows[0]) {
      const exists = await tx.db.select(sql`SELECT 1 FROM page_content WHERE page_key=${pageKey}`);
      if (!exists.rows[0]) throw new ContentNotFoundError();
      throw new StaleRevisionError();
    }
    if (heroSlot && heroImage) await synchronizeSiteImageSlot(tx, heroSlot, heroImage);
    return updated.rows[0].revision;
  });
}
