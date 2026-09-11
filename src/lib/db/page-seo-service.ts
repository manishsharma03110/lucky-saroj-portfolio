import "server-only";
import { sql } from "drizzle-orm";
import { withCmsTransaction } from "./index";
import { ContentNotFoundError, StaleRevisionError } from "./mutation-errors";
import { SEO_PAGE_DEFAULTS, SEO_PAGE_KEYS, type SeoPageKey } from "@/lib/page-seo";

export type PageSeoRecord = Readonly<{
  pageKey: SeoPageKey;
  metaTitle: string;
  metaDescription: string;
  canonicalPath: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
  robotsIndex: boolean;
  keywords: string;
  revision: number;
}>;

function defaults(pageKey: SeoPageKey): PageSeoRecord {
  const item = SEO_PAGE_DEFAULTS[pageKey];
  return Object.freeze({
    pageKey,
    metaTitle: item.title,
    metaDescription: item.description,
    canonicalPath: item.path,
    ogTitle: item.title,
    ogDescription: item.description,
    ogImageUrl: "",
    robotsIndex: true,
    keywords: "",
    revision: 1,
  });
}

function normalize(pageKey: SeoPageKey, row?: Partial<PageSeoRecord> | null): PageSeoRecord {
  const fallback = defaults(pageKey);
  if (!row) return fallback;
  return Object.freeze({
    pageKey,
    metaTitle: row.metaTitle?.trim() || fallback.metaTitle,
    metaDescription: row.metaDescription?.trim() || fallback.metaDescription,
    canonicalPath: row.canonicalPath?.trim() || fallback.canonicalPath,
    ogTitle: row.ogTitle?.trim() || row.metaTitle?.trim() || fallback.ogTitle,
    ogDescription: row.ogDescription?.trim() || row.metaDescription?.trim() || fallback.ogDescription,
    ogImageUrl: row.ogImageUrl?.trim() || "",
    robotsIndex: row.robotsIndex ?? true,
    keywords: row.keywords?.trim() || "",
    revision: row.revision ?? 1,
  });
}

export async function getPageSeo(pageKey: SeoPageKey): Promise<PageSeoRecord> {
  return withCmsTransaction(async (tx) => {
    const result = await tx.db.select<Partial<PageSeoRecord>>(sql`
      SELECT
        page_key AS "pageKey",
        meta_title AS "metaTitle",
        meta_description AS "metaDescription",
        canonical_path AS "canonicalPath",
        og_title AS "ogTitle",
        og_description AS "ogDescription",
        og_image_url AS "ogImageUrl",
        robots_index AS "robotsIndex",
        keywords,
        revision
      FROM page_seo WHERE page_key=${pageKey}
    `);
    return normalize(pageKey, result.rows[0]);
  });
}

export async function getAllPageSeo(): Promise<PageSeoRecord[]> {
  return withCmsTransaction(async (tx) => {
    const result = await tx.db.select<Partial<PageSeoRecord>>(sql`
      SELECT
        page_key AS "pageKey",
        meta_title AS "metaTitle",
        meta_description AS "metaDescription",
        canonical_path AS "canonicalPath",
        og_title AS "ogTitle",
        og_description AS "ogDescription",
        og_image_url AS "ogImageUrl",
        robots_index AS "robotsIndex",
        keywords,
        revision
      FROM page_seo ORDER BY page_key
    `);
    const byKey = new Map(result.rows.map((row) => [row.pageKey, row]));
    return SEO_PAGE_KEYS.map((key) => normalize(key, byKey.get(key)));
  });
}

export async function updatePageSeo(input: PageSeoRecord, expectedRevision: number): Promise<number> {
  return withCmsTransaction(async (tx) => {
    const updated = await tx.db.update<{ revision: number }>(sql`
      UPDATE page_seo SET
        meta_title=${input.metaTitle || null},
        meta_description=${input.metaDescription || null},
        canonical_path=${input.canonicalPath || null},
        og_title=${input.ogTitle || null},
        og_description=${input.ogDescription || null},
        og_image_url=${input.ogImageUrl || null},
        robots_index=${input.robotsIndex},
        keywords=${input.keywords || null},
        revision=revision+1
      WHERE page_key=${input.pageKey} AND revision=${expectedRevision}
      RETURNING revision
    `);
    if (updated.rows[0]) return updated.rows[0].revision;
    const exists = await tx.db.select(sql`SELECT 1 FROM page_seo WHERE page_key=${input.pageKey}`);
    if (!exists.rows[0]) throw new ContentNotFoundError();
    throw new StaleRevisionError();
  });
}
