ALTER TABLE "admin_users" ADD COLUMN "session_version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "admin_users" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;