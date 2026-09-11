CREATE TABLE "home_page_content" (
  "id" text PRIMARY KEY DEFAULT 'singleton:home' NOT NULL,
  "selected_work_eyebrow" text NOT NULL DEFAULT 'Selected work',
  "selected_work_heading" text NOT NULL DEFAULT 'Work built to be watched.',
  "selected_work_cta_label" text NOT NULL DEFAULT 'View All Work',
  "selected_work_cta_url" text NOT NULL DEFAULT '/portfolio',
  "services_eyebrow" text NOT NULL DEFAULT 'What I do',
  "services_heading" text NOT NULL DEFAULT 'Post-production built around the story.',
  "services_description" text NOT NULL DEFAULT 'Explore the services currently available for projects and collaborations.',
  "services_cta_label" text NOT NULL DEFAULT 'Explore services',
  "services_cta_url" text NOT NULL DEFAULT '/services',
  "about_eyebrow" text NOT NULL DEFAULT 'About the editor',
  "about_cta_label" text NOT NULL DEFAULT 'More about me',
  "about_cta_url" text NOT NULL DEFAULT '/about',
  "testimonials_eyebrow" text NOT NULL DEFAULT 'Client perspective',
  "testimonials_heading" text NOT NULL DEFAULT 'The work, in their words.',
  "testimonials_description" text NOT NULL DEFAULT 'Real feedback from published client testimonials.',
  "final_cta_eyebrow" text NOT NULL DEFAULT 'Start a project',
  "final_cta_heading" text NOT NULL DEFAULT 'Let''s shape the next story.',
  "final_cta_description" text NOT NULL DEFAULT 'Tell me what you''re making, where it needs to land, and what success should feel like.',
  "final_cta_button_label" text NOT NULL DEFAULT 'Start a conversation',
  "final_cta_button_url" text NOT NULL DEFAULT '/contact',
  "revision" integer NOT NULL DEFAULT 1,
  CONSTRAINT "home_page_content_singleton_id" CHECK ("id" = 'singleton:home'),
  CONSTRAINT "home_page_content_revision_positive" CHECK ("revision" >= 1)
);
--> statement-breakpoint
INSERT INTO "home_page_content" ("id") VALUES ('singleton:home') ON CONFLICT ("id") DO NOTHING;
