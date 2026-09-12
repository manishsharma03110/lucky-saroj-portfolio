ALTER TABLE "media_asset_references" ADD COLUMN "testimonial_id" text;
--> statement-breakpoint
ALTER TABLE "media_asset_references" ADD CONSTRAINT "media_asset_references_testimonial_id_testimonials_id_fk" FOREIGN KEY ("testimonial_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "media_asset_references" DROP CONSTRAINT IF EXISTS "media_asset_references_owner_valid";
--> statement-breakpoint
ALTER TABLE "media_asset_references" ADD CONSTRAINT "media_asset_references_owner_valid" CHECK (
  ("owner_type" = 'portfolio_project' AND "portfolio_project_id" IS NOT NULL AND "showreel_id" IS NULL AND "site_settings_id" IS NULL AND "testimonial_id" IS NULL)
  OR ("owner_type" = 'showreel' AND "portfolio_project_id" IS NULL AND "showreel_id" = 'singleton:showreel' AND "site_settings_id" IS NULL AND "testimonial_id" IS NULL)
  OR ("owner_type" = 'site_settings' AND "portfolio_project_id" IS NULL AND "showreel_id" IS NULL AND "site_settings_id" = 'singleton:settings' AND "testimonial_id" IS NULL)
  OR ("owner_type" = 'testimonial' AND "portfolio_project_id" IS NULL AND "showreel_id" IS NULL AND "site_settings_id" IS NULL AND "testimonial_id" IS NOT NULL)
);
--> statement-breakpoint
ALTER TABLE "media_asset_references" DROP CONSTRAINT IF EXISTS "media_asset_references_slot_valid";
--> statement-breakpoint
ALTER TABLE "media_asset_references" ADD CONSTRAINT "media_asset_references_slot_valid" CHECK (
  ("owner_type" IN ('portfolio_project','showreel') AND "slot" IN ('thumbnail','video'))
  OR ("owner_type" = 'site_settings' AND "slot" IN ('hero_image','about_profile_image','logo_image','favicon','og_image','services_hero_image','experience_hero_image','contact_hero_image'))
  OR ("owner_type" = 'testimonial' AND "slot" = 'profile_image')
);
--> statement-breakpoint
CREATE UNIQUE INDEX "media_asset_references_testimonial_slot_unique" ON "media_asset_references" USING btree ("testimonial_id","slot") WHERE "owner_type" = 'testimonial';
