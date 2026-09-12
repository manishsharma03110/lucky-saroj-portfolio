import "server-only";
import { sql } from "drizzle-orm";
import { withCmsTransaction } from "./index";
import { ContentNotFoundError, StaleRevisionError } from "./mutation-errors";

export const HOME_CONTENT_ID = "singleton:home";

export type HomePageContent = Readonly<{
  id: string;
  heroPrimaryLabel: string;
  heroPrimaryUrl: string;
  heroShowreelLabel: string;
  heroShowreelUrl: string;
  heroImageAlt: string;
  showreelEyebrow: string;
  showreelRuntimeLabel: string;
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
  aboutStatYearsLabel: string;
  aboutStatProjectsLabel: string;
  aboutStatClientsLabel: string;
  aboutStatViewsLabel: string;
  aboutPortraitFallbackLabel: string;
  aboutProfileImageAlt: string;
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
        hero_primary_label AS "heroPrimaryLabel",
        hero_primary_url AS "heroPrimaryUrl",
        hero_showreel_label AS "heroShowreelLabel",
        hero_showreel_url AS "heroShowreelUrl",
        hero_image_alt AS "heroImageAlt",
        showreel_eyebrow AS "showreelEyebrow",
        showreel_runtime_label AS "showreelRuntimeLabel",
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
        about_stat_years_label AS "aboutStatYearsLabel",
        about_stat_projects_label AS "aboutStatProjectsLabel",
        about_stat_clients_label AS "aboutStatClientsLabel",
        about_stat_views_label AS "aboutStatViewsLabel",
        about_portrait_fallback_label AS "aboutPortraitFallbackLabel",
        about_profile_image_alt AS "aboutProfileImageAlt",
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
        hero_primary_label=${input.heroPrimaryLabel},
        hero_primary_url=${input.heroPrimaryUrl},
        hero_showreel_label=${input.heroShowreelLabel},
        hero_showreel_url=${input.heroShowreelUrl},
        hero_image_alt=${input.heroImageAlt},
        showreel_eyebrow=${input.showreelEyebrow},
        showreel_runtime_label=${input.showreelRuntimeLabel},
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
        about_stat_years_label=${input.aboutStatYearsLabel},
        about_stat_projects_label=${input.aboutStatProjectsLabel},
        about_stat_clients_label=${input.aboutStatClientsLabel},
        about_stat_views_label=${input.aboutStatViewsLabel},
        about_portrait_fallback_label=${input.aboutPortraitFallbackLabel},
        about_profile_image_alt=${input.aboutProfileImageAlt},
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
