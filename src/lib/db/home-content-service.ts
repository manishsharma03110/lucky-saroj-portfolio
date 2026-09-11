import "server-only";
import { sql } from "drizzle-orm";
import { withCmsTransaction } from "./index";
import { ContentNotFoundError, StaleRevisionError } from "./mutation-errors";

export const HOME_CONTENT_ID = "singleton:home";

export type HomePageContent = Readonly<{
  id: string;
  selectedWorkEyebrow: string;
  selectedWorkHeading: string;
  selectedWorkCtaLabel: string;
  selectedWorkCtaUrl: string;
  servicesEyebrow: string;
  servicesHeading: string;
  servicesDescription: string;
  servicesCtaLabel: string;
  servicesCtaUrl: string;
  aboutEyebrow: string;
  aboutCtaLabel: string;
  aboutCtaUrl: string;
  testimonialsEyebrow: string;
  testimonialsHeading: string;
  testimonialsDescription: string;
  finalCtaEyebrow: string;
  finalCtaHeading: string;
  finalCtaDescription: string;
  finalCtaButtonLabel: string;
  finalCtaButtonUrl: string;
  revision: number;
}>;

export type HomePageContentInput = Omit<HomePageContent, "id" | "revision">;

export async function getHomePageContent(): Promise<HomePageContent> {
  return withCmsTransaction(async (tx) => {
    const result = await tx.db.select<HomePageContent>(sql`
      SELECT
        id,
        selected_work_eyebrow AS "selectedWorkEyebrow",
        selected_work_heading AS "selectedWorkHeading",
        selected_work_cta_label AS "selectedWorkCtaLabel",
        selected_work_cta_url AS "selectedWorkCtaUrl",
        services_eyebrow AS "servicesEyebrow",
        services_heading AS "servicesHeading",
        services_description AS "servicesDescription",
        services_cta_label AS "servicesCtaLabel",
        services_cta_url AS "servicesCtaUrl",
        about_eyebrow AS "aboutEyebrow",
        about_cta_label AS "aboutCtaLabel",
        about_cta_url AS "aboutCtaUrl",
        testimonials_eyebrow AS "testimonialsEyebrow",
        testimonials_heading AS "testimonialsHeading",
        testimonials_description AS "testimonialsDescription",
        final_cta_eyebrow AS "finalCtaEyebrow",
        final_cta_heading AS "finalCtaHeading",
        final_cta_description AS "finalCtaDescription",
        final_cta_button_label AS "finalCtaButtonLabel",
        final_cta_button_url AS "finalCtaButtonUrl",
        revision
      FROM home_page_content
      WHERE id=${HOME_CONTENT_ID}
    `);
    if (!result.rows[0]) throw new ContentNotFoundError();
    return Object.freeze(result.rows[0]);
  });
}

export async function updateHomePageContent(input: HomePageContentInput, expectedRevision: number): Promise<number> {
  return withCmsTransaction(async (tx) => {
    const result = await tx.db.update<{ revision: number }>(sql`
      UPDATE home_page_content SET
        selected_work_eyebrow=${input.selectedWorkEyebrow},
        selected_work_heading=${input.selectedWorkHeading},
        selected_work_cta_label=${input.selectedWorkCtaLabel},
        selected_work_cta_url=${input.selectedWorkCtaUrl},
        services_eyebrow=${input.servicesEyebrow},
        services_heading=${input.servicesHeading},
        services_description=${input.servicesDescription},
        services_cta_label=${input.servicesCtaLabel},
        services_cta_url=${input.servicesCtaUrl},
        about_eyebrow=${input.aboutEyebrow},
        about_cta_label=${input.aboutCtaLabel},
        about_cta_url=${input.aboutCtaUrl},
        testimonials_eyebrow=${input.testimonialsEyebrow},
        testimonials_heading=${input.testimonialsHeading},
        testimonials_description=${input.testimonialsDescription},
        final_cta_eyebrow=${input.finalCtaEyebrow},
        final_cta_heading=${input.finalCtaHeading},
        final_cta_description=${input.finalCtaDescription},
        final_cta_button_label=${input.finalCtaButtonLabel},
        final_cta_button_url=${input.finalCtaButtonUrl},
        revision=revision+1
      WHERE id=${HOME_CONTENT_ID} AND revision=${expectedRevision}
      RETURNING revision
    `);
    if (result.rows[0]) return result.rows[0].revision;
    const exists = await tx.db.select(sql`SELECT 1 FROM home_page_content WHERE id=${HOME_CONTENT_ID}`);
    if (!exists.rows[0]) throw new ContentNotFoundError();
    throw new StaleRevisionError();
  });
}
