ALTER TABLE "site_settings" ADD COLUMN "logo_image_url" text;--> statement-breakpoint

ALTER TABLE "media_asset_references" DROP CONSTRAINT "media_asset_references_slot_valid";--> statement-breakpoint
ALTER TABLE "media_asset_references" ADD CONSTRAINT "media_asset_references_slot_valid" CHECK ((
  ("media_asset_references"."owner_type" IN ('portfolio_project','showreel') AND "media_asset_references"."slot" IN ('thumbnail','video'))
  OR ("media_asset_references"."owner_type" = 'site_settings' AND "media_asset_references"."slot" IN ('hero_image','about_profile_image','logo_image','favicon','og_image'))
));--> statement-breakpoint

CREATE TABLE "page_seo" (
  "page_key" text PRIMARY KEY NOT NULL,
  "meta_title" text,
  "meta_description" text,
  "canonical_path" text,
  "og_title" text,
  "og_description" text,
  "robots_index" boolean DEFAULT true NOT NULL,
  "keywords" text,
  "revision" integer DEFAULT 1 NOT NULL,
  CONSTRAINT "page_seo_page_key_valid" CHECK ("page_seo"."page_key" IN ('home','about','portfolio','services','experience','contact')),
  CONSTRAINT "page_seo_revision_positive" CHECK ("page_seo"."revision" >= 1)
);--> statement-breakpoint

INSERT INTO "page_seo" ("page_key") VALUES
  ('home'),('about'),('portfolio'),('services'),('experience'),('contact')
ON CONFLICT ("page_key") DO NOTHING;
