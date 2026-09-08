DO $$
BEGIN
  IF (SELECT count(*) FROM "about_profile") > 1 THEN RAISE EXCEPTION '0004 prevalidation: about_profile has more than one row'; END IF;
  IF (SELECT count(*) FROM "site_settings") > 1 THEN RAISE EXCEPTION '0004 prevalidation: site_settings has more than one row'; END IF;
  IF (SELECT count(*) FROM "showreels") > 1 THEN RAISE EXCEPTION '0004 prevalidation: showreels has more than one row'; END IF;
  IF EXISTS (SELECT 1 FROM "portfolio_categories" GROUP BY "display_order" HAVING count(*) > 1) THEN RAISE EXCEPTION '0004 prevalidation: duplicate portfolio category display_order'; END IF;
  IF EXISTS (SELECT 1 FROM "experiences" GROUP BY "display_order" HAVING count(*) > 1) THEN RAISE EXCEPTION '0004 prevalidation: duplicate experience display_order'; END IF;
  IF EXISTS (SELECT 1 FROM "services" GROUP BY "display_order" HAVING count(*) > 1) THEN RAISE EXCEPTION '0004 prevalidation: duplicate service display_order'; END IF;
  IF EXISTS (SELECT 1 FROM "about_skills" GROUP BY "name" HAVING count(*) > 1) THEN RAISE EXCEPTION '0004 prevalidation: duplicate About skill name'; END IF;
  IF EXISTS (SELECT 1 FROM "about_skills" GROUP BY "display_order" HAVING count(*) > 1) THEN RAISE EXCEPTION '0004 prevalidation: duplicate About skill display_order'; END IF;
  IF EXISTS (SELECT 1 FROM "about_tools" GROUP BY "name" HAVING count(*) > 1) THEN RAISE EXCEPTION '0004 prevalidation: duplicate About tool name'; END IF;
  IF EXISTS (SELECT 1 FROM "about_tools" GROUP BY "display_order" HAVING count(*) > 1) THEN RAISE EXCEPTION '0004 prevalidation: duplicate About tool display_order'; END IF;
  IF EXISTS (SELECT 1 FROM "project_tools" GROUP BY "project_id", "name" HAVING count(*) > 1) THEN RAISE EXCEPTION '0004 prevalidation: duplicate project tool name'; END IF;
  IF EXISTS (SELECT 1 FROM "project_media" GROUP BY "project_id", "display_order" HAVING count(*) > 1) THEN RAISE EXCEPTION '0004 prevalidation: duplicate project media display_order'; END IF;
  IF EXISTS (SELECT 1 FROM "portfolio_categories" WHERE "display_order" < 0) THEN RAISE EXCEPTION '0004 prevalidation: negative portfolio category display_order'; END IF;
  IF EXISTS (SELECT 1 FROM "portfolio_projects" WHERE "display_order" < 0) THEN RAISE EXCEPTION '0004 prevalidation: negative portfolio project display_order'; END IF;
  IF EXISTS (SELECT 1 FROM "experiences" WHERE "display_order" < 0) THEN RAISE EXCEPTION '0004 prevalidation: negative experience display_order'; END IF;
  IF EXISTS (SELECT 1 FROM "services" WHERE "display_order" < 0) THEN RAISE EXCEPTION '0004 prevalidation: negative service display_order'; END IF;
  IF EXISTS (SELECT 1 FROM "about_skills" WHERE "display_order" < 0) THEN RAISE EXCEPTION '0004 prevalidation: negative About skill display_order'; END IF;
  IF EXISTS (SELECT 1 FROM "about_tools" WHERE "display_order" < 0) THEN RAISE EXCEPTION '0004 prevalidation: negative About tool display_order'; END IF;
  IF EXISTS (SELECT 1 FROM "project_media" WHERE "display_order" < 0) THEN RAISE EXCEPTION '0004 prevalidation: negative project media display_order'; END IF;
  IF EXISTS (SELECT 1 FROM "testimonials" WHERE "rating" < 1 OR "rating" > 5) THEN RAISE EXCEPTION '0004 prevalidation: testimonial rating outside 1..5'; END IF;
  IF EXISTS (SELECT 1 FROM "admin_users" WHERE "session_version" < 1) THEN RAISE EXCEPTION '0004 prevalidation: admin session_version below 1'; END IF;
  IF EXISTS (SELECT 1 FROM "about_profile" WHERE "years_experience" < 0 OR "projects_completed" < 0 OR "client_count" < 0) THEN RAISE EXCEPTION '0004 prevalidation: negative About counter'; END IF;
  IF EXISTS (SELECT 1 FROM "experiences" WHERE "is_current" AND "end_date" IS NOT NULL) THEN RAISE EXCEPTION '0004 prevalidation: current experience has end_date'; END IF;
  IF EXISTS (SELECT 1 FROM "portfolio_projects" WHERE "status" NOT IN ('draft', 'published')) THEN RAISE EXCEPTION '0004 prevalidation: invalid portfolio project status'; END IF;
  IF EXISTS (SELECT 1 FROM "project_media" WHERE "type" NOT IN ('image', 'video')) THEN RAISE EXCEPTION '0004 prevalidation: invalid project media type'; END IF;
  IF EXISTS (SELECT 1 FROM "testimonials" WHERE "status" NOT IN ('draft', 'published')) THEN RAISE EXCEPTION '0004 prevalidation: invalid testimonial status'; END IF;
  IF EXISTS (SELECT 1 FROM "showreels" WHERE "status" NOT IN ('draft', 'published')) THEN RAISE EXCEPTION '0004 prevalidation: invalid showreel status'; END IF;
  IF EXISTS (SELECT 1 FROM "contact_messages" WHERE "status" NOT IN ('new', 'read', 'replied', 'archived')) THEN RAISE EXCEPTION '0004 prevalidation: invalid contact message status'; END IF;
END $$;--> statement-breakpoint
INSERT INTO "about_profile" ("id") SELECT 'singleton:about' WHERE NOT EXISTS (SELECT 1 FROM "about_profile");--> statement-breakpoint
UPDATE "about_profile" SET "id" = 'singleton:about' WHERE "id" <> 'singleton:about';--> statement-breakpoint
INSERT INTO "site_settings" ("id") SELECT 'singleton:settings' WHERE NOT EXISTS (SELECT 1 FROM "site_settings");--> statement-breakpoint
UPDATE "site_settings" SET "id" = 'singleton:settings' WHERE "id" <> 'singleton:settings';--> statement-breakpoint
UPDATE "showreels" SET "id" = 'singleton:showreel' WHERE "id" <> 'singleton:showreel';--> statement-breakpoint
ALTER TABLE "about_profile" ALTER COLUMN "id" SET DEFAULT 'singleton:about';--> statement-breakpoint
ALTER TABLE "showreels" ALTER COLUMN "id" SET DEFAULT 'singleton:showreel';--> statement-breakpoint
ALTER TABLE "site_settings" ALTER COLUMN "id" SET DEFAULT 'singleton:settings';--> statement-breakpoint
ALTER TABLE "about_profile" ADD COLUMN "revision" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "about_skills" ADD COLUMN "profile_id" text;--> statement-breakpoint
ALTER TABLE "about_tools" ADD COLUMN "profile_id" text;--> statement-breakpoint
UPDATE "about_skills" SET "profile_id" = 'singleton:about';--> statement-breakpoint
UPDATE "about_tools" SET "profile_id" = 'singleton:about';--> statement-breakpoint
ALTER TABLE "about_skills" ALTER COLUMN "profile_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "about_tools" ALTER COLUMN "profile_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "about_skills" ALTER COLUMN "profile_id" SET DEFAULT 'singleton:about';--> statement-breakpoint
ALTER TABLE "about_tools" ALTER COLUMN "profile_id" SET DEFAULT 'singleton:about';--> statement-breakpoint
ALTER TABLE "contact_messages" ADD COLUMN "revision" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "experiences" ADD COLUMN "revision" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "portfolio_projects" ADD COLUMN "revision" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "revision" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "showreels" ADD COLUMN "revision" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "revision" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "testimonials" ADD COLUMN "revision" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "about_skills" ADD CONSTRAINT "about_skills_profile_id_about_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."about_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "about_tools" ADD CONSTRAINT "about_tools_profile_id_about_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."about_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "about_skills" ADD CONSTRAINT "about_skills_profile_id_name_unique" UNIQUE("profile_id","name");--> statement-breakpoint
ALTER TABLE "about_skills" ADD CONSTRAINT "about_skills_profile_id_display_order_unique" UNIQUE("profile_id","display_order");--> statement-breakpoint
ALTER TABLE "about_tools" ADD CONSTRAINT "about_tools_profile_id_name_unique" UNIQUE("profile_id","name");--> statement-breakpoint
ALTER TABLE "about_tools" ADD CONSTRAINT "about_tools_profile_id_display_order_unique" UNIQUE("profile_id","display_order");--> statement-breakpoint
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_display_order_unique" UNIQUE("display_order");--> statement-breakpoint
ALTER TABLE "portfolio_categories" ADD CONSTRAINT "portfolio_categories_display_order_unique" UNIQUE("display_order");--> statement-breakpoint
ALTER TABLE "project_media" ADD CONSTRAINT "project_media_project_id_display_order_unique" UNIQUE("project_id","display_order");--> statement-breakpoint
ALTER TABLE "project_tools" ADD CONSTRAINT "project_tools_project_id_name_unique" UNIQUE("project_id","name");--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_display_order_unique" UNIQUE("display_order");--> statement-breakpoint
ALTER TABLE "about_profile" ADD CONSTRAINT "about_profile_singleton_id" CHECK ("about_profile"."id" = 'singleton:about');--> statement-breakpoint
ALTER TABLE "about_profile" ADD CONSTRAINT "about_profile_years_experience_nonnegative" CHECK ("about_profile"."years_experience" >= 0);--> statement-breakpoint
ALTER TABLE "about_profile" ADD CONSTRAINT "about_profile_projects_completed_nonnegative" CHECK ("about_profile"."projects_completed" >= 0);--> statement-breakpoint
ALTER TABLE "about_profile" ADD CONSTRAINT "about_profile_client_count_nonnegative" CHECK ("about_profile"."client_count" >= 0);--> statement-breakpoint
ALTER TABLE "about_profile" ADD CONSTRAINT "about_profile_revision_positive" CHECK ("about_profile"."revision" >= 1);--> statement-breakpoint
ALTER TABLE "about_skills" ADD CONSTRAINT "about_skills_display_order_nonnegative" CHECK ("about_skills"."display_order" >= 0);--> statement-breakpoint
ALTER TABLE "about_tools" ADD CONSTRAINT "about_tools_display_order_nonnegative" CHECK ("about_tools"."display_order" >= 0);--> statement-breakpoint
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_session_version_positive" CHECK ("admin_users"."session_version" >= 1);--> statement-breakpoint
ALTER TABLE "contact_messages" ADD CONSTRAINT "contact_messages_revision_positive" CHECK ("contact_messages"."revision" >= 1);--> statement-breakpoint
ALTER TABLE "contact_messages" ADD CONSTRAINT "contact_messages_status_valid" CHECK ("contact_messages"."status" IN ('new', 'read', 'replied', 'archived'));--> statement-breakpoint
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_display_order_nonnegative" CHECK ("experiences"."display_order" >= 0);--> statement-breakpoint
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_revision_positive" CHECK ("experiences"."revision" >= 1);--> statement-breakpoint
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_current_end_date" CHECK (NOT "experiences"."is_current" OR "experiences"."end_date" IS NULL);--> statement-breakpoint
ALTER TABLE "portfolio_categories" ADD CONSTRAINT "portfolio_categories_display_order_nonnegative" CHECK ("portfolio_categories"."display_order" >= 0);--> statement-breakpoint
ALTER TABLE "portfolio_projects" ADD CONSTRAINT "portfolio_projects_display_order_nonnegative" CHECK ("portfolio_projects"."display_order" >= 0);--> statement-breakpoint
ALTER TABLE "portfolio_projects" ADD CONSTRAINT "portfolio_projects_revision_positive" CHECK ("portfolio_projects"."revision" >= 1);--> statement-breakpoint
ALTER TABLE "portfolio_projects" ADD CONSTRAINT "portfolio_projects_status_valid" CHECK ("portfolio_projects"."status" IN ('draft', 'published'));--> statement-breakpoint
ALTER TABLE "project_media" ADD CONSTRAINT "project_media_display_order_nonnegative" CHECK ("project_media"."display_order" >= 0);--> statement-breakpoint
ALTER TABLE "project_media" ADD CONSTRAINT "project_media_type_valid" CHECK ("project_media"."type" IN ('image', 'video'));--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_display_order_nonnegative" CHECK ("services"."display_order" >= 0);--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_revision_positive" CHECK ("services"."revision" >= 1);--> statement-breakpoint
ALTER TABLE "showreels" ADD CONSTRAINT "showreels_singleton_id" CHECK ("showreels"."id" = 'singleton:showreel');--> statement-breakpoint
ALTER TABLE "showreels" ADD CONSTRAINT "showreels_revision_positive" CHECK ("showreels"."revision" >= 1);--> statement-breakpoint
ALTER TABLE "showreels" ADD CONSTRAINT "showreels_status_valid" CHECK ("showreels"."status" IN ('draft', 'published'));--> statement-breakpoint
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_singleton_id" CHECK ("site_settings"."id" = 'singleton:settings');--> statement-breakpoint
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_revision_positive" CHECK ("site_settings"."revision" >= 1);--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_rating_range" CHECK ("testimonials"."rating" BETWEEN 1 AND 5);--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_revision_positive" CHECK ("testimonials"."revision" >= 1);--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_status_valid" CHECK ("testimonials"."status" IN ('draft', 'published'));
