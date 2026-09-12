ALTER TABLE "home_page_content" ADD COLUMN "hero_primary_label" text NOT NULL DEFAULT 'View My Work';
--> statement-breakpoint
ALTER TABLE "home_page_content" ADD COLUMN "hero_primary_url" text NOT NULL DEFAULT '/portfolio';
--> statement-breakpoint
ALTER TABLE "home_page_content" ADD COLUMN "hero_showreel_label" text NOT NULL DEFAULT 'Watch Showreel';
--> statement-breakpoint
ALTER TABLE "home_page_content" ADD COLUMN "hero_showreel_url" text NOT NULL DEFAULT '#showreel';
--> statement-breakpoint
ALTER TABLE "home_page_content" ADD COLUMN "hero_image_alt" text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE "home_page_content" ADD COLUMN "showreel_eyebrow" text NOT NULL DEFAULT 'Featured showreel';
--> statement-breakpoint
ALTER TABLE "home_page_content" ADD COLUMN "showreel_runtime_label" text NOT NULL DEFAULT 'Runtime';
--> statement-breakpoint
ALTER TABLE "home_page_content" ADD COLUMN "about_stat_years_label" text NOT NULL DEFAULT 'Years';
--> statement-breakpoint
ALTER TABLE "home_page_content" ADD COLUMN "about_stat_projects_label" text NOT NULL DEFAULT 'Projects';
--> statement-breakpoint
ALTER TABLE "home_page_content" ADD COLUMN "about_stat_clients_label" text NOT NULL DEFAULT 'Clients';
--> statement-breakpoint
ALTER TABLE "home_page_content" ADD COLUMN "about_stat_views_label" text NOT NULL DEFAULT 'Views';
--> statement-breakpoint
ALTER TABLE "home_page_content" ADD COLUMN "about_portrait_fallback_label" text NOT NULL DEFAULT 'Portrait forthcoming';
--> statement-breakpoint
ALTER TABLE "home_page_content" ADD COLUMN "about_profile_image_alt" text NOT NULL DEFAULT '';
