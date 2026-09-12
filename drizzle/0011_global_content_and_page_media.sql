ALTER TABLE "page_content" DROP CONSTRAINT "page_content_page_key_valid";--> statement-breakpoint
ALTER TABLE "page_content" ADD CONSTRAINT "page_content_page_key_valid" CHECK ("page_content"."page_key" IN ('global','about','services','experience','portfolio','contact'));--> statement-breakpoint

INSERT INTO "page_content" ("page_key","content") VALUES
('global', jsonb_build_object(
  'headerRoleLabel','Video Editor','headerCtaLabel','Let’s Talk','headerCtaUrl','/contact',
  'footerEyebrow','Have a project in mind?','footerHeadingLine1','Let’s create','footerHeadingLine2','something','footerHeadingAccent','worth watching.',
  'footerCtaDescription','Share the project and what you want the final edit to communicate.','footerCtaLabel','Start a project','footerCtaUrl','/contact',
  'footerRoleLabel','Video Editor & Visual Storyteller','footerExploreLabel','Explore','footerExpertiseLabel','Expertise',
  'footerSocialEyebrow','Social presence','footerSocialHeading','Follow my work','footerCopyrightRole','Video Editor'
))
ON CONFLICT ("page_key") DO NOTHING;--> statement-breakpoint

UPDATE "page_content" SET "content" = "content" || jsonb_build_object(
  'heroImageUrl', COALESCE("content"->>'heroImageUrl',''),
  'heroImageAlt', COALESCE("content"->>'heroImageAlt','Video editor working at a desktop editing setup')
) WHERE "page_key"='services';--> statement-breakpoint

UPDATE "page_content" SET "content" = "content" || jsonb_build_object(
  'heroImageUrl', COALESCE("content"->>'heroImageUrl',''),
  'heroImageAlt', COALESCE("content"->>'heroImageAlt','Video editor working at a professional editing workstation')
) WHERE "page_key"='experience';--> statement-breakpoint

UPDATE "page_content" SET "content" = "content" || jsonb_build_object(
  'heroImageUrl', COALESCE("content"->>'heroImageUrl',''),
  'heroImageAlt', COALESCE("content"->>'heroImageAlt','Video editor working at a professional editing workstation')
) WHERE "page_key"='contact';--> statement-breakpoint

ALTER TABLE "media_asset_references" DROP CONSTRAINT "media_asset_references_slot_valid";--> statement-breakpoint
ALTER TABLE "media_asset_references" ADD CONSTRAINT "media_asset_references_slot_valid" CHECK ((
  ("media_asset_references"."owner_type" IN ('portfolio_project','showreel') AND "media_asset_references"."slot" IN ('thumbnail','video'))
  OR ("media_asset_references"."owner_type" = 'site_settings' AND "media_asset_references"."slot" IN ('hero_image','about_profile_image','logo_image','favicon','og_image','services_hero_image','experience_hero_image','contact_hero_image'))
));
