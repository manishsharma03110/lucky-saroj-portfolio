ALTER TABLE "media_asset_references" DROP CONSTRAINT "media_asset_references_owner_valid";--> statement-breakpoint
ALTER TABLE "media_asset_references" DROP CONSTRAINT "media_asset_references_slot_valid";--> statement-breakpoint
ALTER TABLE "media_asset_references" ADD COLUMN "site_settings_id" text;--> statement-breakpoint
ALTER TABLE "media_asset_references" ADD CONSTRAINT "media_asset_references_site_settings_id_site_settings_id_fk" FOREIGN KEY ("site_settings_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "media_asset_references_settings_slot_unique" ON "media_asset_references" USING btree ("site_settings_id","slot") WHERE "media_asset_references"."owner_type" = 'site_settings';--> statement-breakpoint
ALTER TABLE "media_asset_references" ADD CONSTRAINT "media_asset_references_owner_valid" CHECK ((
    ("media_asset_references"."owner_type" = 'portfolio_project' AND "media_asset_references"."portfolio_project_id" IS NOT NULL AND "media_asset_references"."showreel_id" IS NULL AND "media_asset_references"."site_settings_id" IS NULL)
    OR
    ("media_asset_references"."owner_type" = 'showreel' AND "media_asset_references"."portfolio_project_id" IS NULL AND "media_asset_references"."showreel_id" = 'singleton:showreel' AND "media_asset_references"."site_settings_id" IS NULL)
    OR
    ("media_asset_references"."owner_type" = 'site_settings' AND "media_asset_references"."portfolio_project_id" IS NULL AND "media_asset_references"."showreel_id" IS NULL AND "media_asset_references"."site_settings_id" = 'singleton:settings')
  ));--> statement-breakpoint
ALTER TABLE "media_asset_references" ADD CONSTRAINT "media_asset_references_slot_valid" CHECK ((
    ("media_asset_references"."owner_type" IN ('portfolio_project','showreel') AND "media_asset_references"."slot" IN ('thumbnail','video'))
    OR ("media_asset_references"."owner_type" = 'site_settings' AND "media_asset_references"."slot" = 'hero_image')
  ));