CREATE TABLE "media_asset_references" (
	"id" text PRIMARY KEY NOT NULL,
	"asset_id" text NOT NULL,
	"owner_type" text NOT NULL,
	"portfolio_project_id" text,
	"showreel_id" text,
	"slot" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "media_asset_references_asset_owner_slot_unique" UNIQUE("asset_id","owner_type","portfolio_project_id","showreel_id","slot"),
	CONSTRAINT "media_asset_references_owner_valid" CHECK ((
    ("media_asset_references"."owner_type" = 'portfolio_project' AND "media_asset_references"."portfolio_project_id" IS NOT NULL AND "media_asset_references"."showreel_id" IS NULL)
    OR
    ("media_asset_references"."owner_type" = 'showreel' AND "media_asset_references"."portfolio_project_id" IS NULL AND "media_asset_references"."showreel_id" = 'singleton:showreel')
  )),
	CONSTRAINT "media_asset_references_slot_valid" CHECK ("media_asset_references"."slot" IN ('thumbnail', 'video'))
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" text PRIMARY KEY NOT NULL,
	"provider" text DEFAULT 'vercel_blob' NOT NULL,
	"provider_key" text NOT NULL,
	"url" text,
	"kind" text NOT NULL,
	"original_filename" text NOT NULL,
	"uploaded_by_admin_id" text,
	"state" text DEFAULT 'pending' NOT NULL,
	"delete_attempts" integer DEFAULT 0 NOT NULL,
	"last_delete_attempt_at" timestamp,
	"last_delete_error_code" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "media_assets_provider_key_unique" UNIQUE("provider_key"),
	CONSTRAINT "media_assets_id_canonical_uuid" CHECK ("media_assets"."id" ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
	CONSTRAINT "media_assets_provider_valid" CHECK ("media_assets"."provider" = 'vercel_blob'),
	CONSTRAINT "media_assets_provider_key_canonical" CHECK ("media_assets"."provider_key" = 'cms-media/' || "media_assets"."id" || '/' || "media_assets"."kind"),
	CONSTRAINT "media_assets_url_bounded" CHECK ("media_assets"."url" IS NULL OR char_length("media_assets"."url") BETWEEN 1 AND 2048),
	CONSTRAINT "media_assets_state_url_coherent" CHECK ("media_assets"."state" IN ('pending', 'orphaned') OR "media_assets"."url" IS NOT NULL),
	CONSTRAINT "media_assets_kind_valid" CHECK ("media_assets"."kind" IN ('image', 'video')),
	CONSTRAINT "media_assets_original_filename_bounded" CHECK (char_length("media_assets"."original_filename") BETWEEN 1 AND 255),
	CONSTRAINT "media_assets_state_valid" CHECK ("media_assets"."state" IN ('pending', 'attached', 'orphaned', 'deleting', 'delete_failed', 'deleted')),
	CONSTRAINT "media_assets_delete_attempts_nonnegative" CHECK ("media_assets"."delete_attempts" >= 0),
	CONSTRAINT "media_assets_delete_error_code_bounded" CHECK ("media_assets"."last_delete_error_code" IS NULL OR char_length("media_assets"."last_delete_error_code") BETWEEN 1 AND 64)
);
--> statement-breakpoint
ALTER TABLE "media_asset_references" ADD CONSTRAINT "media_asset_references_asset_id_media_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_asset_references" ADD CONSTRAINT "media_asset_references_portfolio_project_id_portfolio_projects_id_fk" FOREIGN KEY ("portfolio_project_id") REFERENCES "public"."portfolio_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_asset_references" ADD CONSTRAINT "media_asset_references_showreel_id_showreels_id_fk" FOREIGN KEY ("showreel_id") REFERENCES "public"."showreels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_uploaded_by_admin_id_admin_users_id_fk" FOREIGN KEY ("uploaded_by_admin_id") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "media_asset_references_project_slot_unique" ON "media_asset_references" USING btree ("portfolio_project_id","slot") WHERE "media_asset_references"."owner_type" = 'portfolio_project';--> statement-breakpoint
CREATE UNIQUE INDEX "media_asset_references_showreel_slot_unique" ON "media_asset_references" USING btree ("showreel_id","slot") WHERE "media_asset_references"."owner_type" = 'showreel';--> statement-breakpoint
CREATE INDEX "media_asset_references_asset_id_idx" ON "media_asset_references" USING btree ("asset_id");--> statement-breakpoint
CREATE INDEX "media_assets_cleanup_state_updated_idx" ON "media_assets" USING btree ("state","updated_at");--> statement-breakpoint
CREATE INDEX "media_assets_delete_retry_idx" ON "media_assets" USING btree ("state","last_delete_attempt_at");
--> statement-breakpoint
CREATE FUNCTION "mark_unreferenced_media_asset_orphaned"() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  UPDATE "media_assets"
  SET "state" = 'orphaned', "updated_at" = now()
  WHERE "id" = OLD."asset_id"
    AND "state" = 'attached'
    AND NOT EXISTS (SELECT 1 FROM "media_asset_references" WHERE "asset_id" = OLD."asset_id");
  RETURN OLD;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER "media_asset_reference_delete_lifecycle"
AFTER DELETE ON "media_asset_references"
FOR EACH ROW EXECUTE FUNCTION "mark_unreferenced_media_asset_orphaned"();
