CREATE TABLE "roles" ("id" text PRIMARY KEY NOT NULL,"key" text NOT NULL,"label" text NOT NULL,"trust_level" integer NOT NULL,"created_at" timestamp DEFAULT now() NOT NULL,CONSTRAINT "roles_key_unique" UNIQUE("key"),CONSTRAINT "roles_trust_level_unique" UNIQUE("trust_level"),CONSTRAINT "roles_trust_level_nonnegative" CHECK ("roles"."trust_level" >= 0));
--> statement-breakpoint
CREATE TABLE "permissions" ("id" text PRIMARY KEY NOT NULL,"key" text NOT NULL,"resource" text NOT NULL,"action" text NOT NULL,"description" text NOT NULL,"created_at" timestamp DEFAULT now() NOT NULL,CONSTRAINT "permissions_key_unique" UNIQUE("key"),CONSTRAINT "permissions_key_matches_parts" CHECK ("permissions"."key" = "permissions"."resource" || '.' || "permissions"."action"),CONSTRAINT "permissions_key_format" CHECK ("permissions"."key" ~ '^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$'));
--> statement-breakpoint
CREATE TABLE "role_permissions" ("role_id" text NOT NULL,"permission_id" text NOT NULL,CONSTRAINT "role_permissions_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id"),CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action,CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action);
--> statement-breakpoint
INSERT INTO "roles" ("id","key","label","trust_level") VALUES ('10000000-0000-4000-8000-000000000001','SUPER_ADMIN','Super Administrator',100),('10000000-0000-4000-8000-000000000002','ADMIN','Administrator',50),('10000000-0000-4000-8000-000000000003','EDITOR','Editor',10);
--> statement-breakpoint
INSERT INTO "permissions" ("id","key","resource","action","description") VALUES
('20000000-0000-4000-8000-000000000001','dashboard.view','dashboard','view','View CMS dashboard'),
('20000000-0000-4000-8000-000000000002','portfolio.read','portfolio','read','View projects in CMS'),
('20000000-0000-4000-8000-000000000003','portfolio.create','portfolio','create','Create projects'),
('20000000-0000-4000-8000-000000000004','portfolio.update','portfolio','update','Edit projects and featured status'),
('20000000-0000-4000-8000-000000000005','portfolio.delete','portfolio','delete','Delete projects'),
('20000000-0000-4000-8000-000000000006','categories.read','categories','read','View categories'),
('20000000-0000-4000-8000-000000000007','categories.create','categories','create','Create categories'),
('20000000-0000-4000-8000-000000000008','categories.delete','categories','delete','Delete categories'),
('20000000-0000-4000-8000-000000000009','experience.read','experience','read','View experience records'),
('20000000-0000-4000-8000-000000000010','experience.create','experience','create','Create experience records'),
('20000000-0000-4000-8000-000000000011','experience.update','experience','update','Edit experience records'),
('20000000-0000-4000-8000-000000000012','experience.delete','experience','delete','Delete experience records'),
('20000000-0000-4000-8000-000000000013','services.read','services','read','View services'),
('20000000-0000-4000-8000-000000000014','services.create','services','create','Create services'),
('20000000-0000-4000-8000-000000000015','services.update','services','update','Edit services'),
('20000000-0000-4000-8000-000000000016','services.delete','services','delete','Delete services'),
('20000000-0000-4000-8000-000000000017','about.read','about','read','View the About editor'),
('20000000-0000-4000-8000-000000000018','about.update','about','update','Update About profile, skills, and tools'),
('20000000-0000-4000-8000-000000000019','showreel.read','showreel','read','View showreel configuration'),
('20000000-0000-4000-8000-000000000020','showreel.update','showreel','update','Create or update showreel configuration'),
('20000000-0000-4000-8000-000000000021','testimonials.read','testimonials','read','View testimonials'),
('20000000-0000-4000-8000-000000000022','testimonials.create','testimonials','create','Create testimonials'),
('20000000-0000-4000-8000-000000000023','testimonials.update','testimonials','update','Edit testimonials'),
('20000000-0000-4000-8000-000000000024','testimonials.delete','testimonials','delete','Delete testimonials'),
('20000000-0000-4000-8000-000000000025','messages.read','messages','read','View contact messages'),
('20000000-0000-4000-8000-000000000026','messages.update','messages','update','Change message status'),
('20000000-0000-4000-8000-000000000027','messages.delete','messages','delete','Delete messages'),
('20000000-0000-4000-8000-000000000028','settings.read','settings','read','View site settings'),
('20000000-0000-4000-8000-000000000029','settings.update','settings','update','Update site-wide settings'),
('20000000-0000-4000-8000-000000000030','media.upload','media','upload','Authorize Blob image and video uploads'),
('20000000-0000-4000-8000-000000000031','admin_users.manage','admin_users','manage','Admin lifecycle and role assignment foundation'),
('20000000-0000-4000-8000-000000000032','roles.manage','roles','manage','Role-permission management foundation');
--> statement-breakpoint
INSERT INTO "role_permissions" ("role_id","permission_id") SELECT r."id",p."id" FROM "roles" r CROSS JOIN "permissions" p WHERE r."key"='SUPER_ADMIN';
--> statement-breakpoint
INSERT INTO "role_permissions" ("role_id","permission_id") SELECT r."id",p."id" FROM "roles" r CROSS JOIN "permissions" p WHERE r."key"='ADMIN' AND p."key" NOT IN ('admin_users.manage','roles.manage');
--> statement-breakpoint
INSERT INTO "role_permissions" ("role_id","permission_id") SELECT r."id",p."id" FROM "roles" r CROSS JOIN "permissions" p WHERE r."key"='EDITOR' AND p."key" IN ('dashboard.view','portfolio.read','portfolio.create','portfolio.update','categories.read','categories.create','experience.read','experience.create','experience.update','services.read','services.create','services.update','about.read','about.update','showreel.read','showreel.update','testimonials.read','testimonials.create','testimonials.update','messages.read','messages.update','media.upload');
--> statement-breakpoint
ALTER TABLE "admin_users" ADD COLUMN "role_id" text;
--> statement-breakpoint
UPDATE "admin_users" SET "role_id"=(SELECT "id" FROM "roles" WHERE "key"='SUPER_ADMIN') WHERE "role_id" IS NULL;
--> statement-breakpoint
DO $$ BEGIN IF EXISTS (SELECT 1 FROM "admin_users" WHERE "role_id" IS NULL) THEN RAISE EXCEPTION 'RBAC backfill left admin_users.role_id NULL'; END IF; END $$;
--> statement-breakpoint
ALTER TABLE "admin_users" ALTER COLUMN "role_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "admin_users_role_id_idx" ON "admin_users" USING btree ("role_id");
--> statement-breakpoint
CREATE INDEX "role_permissions_permission_id_idx" ON "role_permissions" USING btree ("permission_id");
