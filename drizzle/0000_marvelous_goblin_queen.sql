CREATE TABLE `about_profile` (
	`id` text PRIMARY KEY NOT NULL,
	`profile_image_url` text,
	`name` text DEFAULT 'Lucky Saroj' NOT NULL,
	`headline` text,
	`biography` text,
	`years_experience` integer DEFAULT 0 NOT NULL,
	`projects_completed` integer DEFAULT 0 NOT NULL,
	`client_count` integer DEFAULT 0 NOT NULL,
	`views_generated` text DEFAULT '0' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `about_skills` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`display_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `about_tools` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`display_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `admin_users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`password_hash` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_users_email_unique` ON `admin_users` (`email`);--> statement-breakpoint
CREATE TABLE `contact_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`project_type` text,
	`budget_range` text,
	`message` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `experiences` (
	`id` text PRIMARY KEY NOT NULL,
	`role` text NOT NULL,
	`company` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text,
	`is_current` integer DEFAULT false NOT NULL,
	`description` text,
	`location` text,
	`display_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `portfolio_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`display_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `portfolio_categories_slug_unique` ON `portfolio_categories` (`slug`);--> statement-breakpoint
CREATE TABLE `portfolio_projects` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`client_name` text,
	`year` integer,
	`description` text,
	`challenge` text,
	`approach` text,
	`result` text,
	`thumbnail_url` text,
	`video_url` text,
	`poster_url` text,
	`category_id` text,
	`is_featured` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`display_order` integer DEFAULT 0 NOT NULL,
	`seo_title` text,
	`seo_description` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `portfolio_categories`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `portfolio_projects_slug_unique` ON `portfolio_projects` (`slug`);--> statement-breakpoint
CREATE TABLE `project_media` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`url` text NOT NULL,
	`type` text NOT NULL,
	`display_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `portfolio_projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `project_tools` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`name` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `portfolio_projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`icon` text DEFAULT 'Clapperboard' NOT NULL,
	`is_featured` integer DEFAULT false NOT NULL,
	`display_order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE `showreels` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`video_url` text,
	`thumbnail_url` text,
	`duration` text,
	`is_featured` integer DEFAULT true NOT NULL,
	`status` text DEFAULT 'published' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `site_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`site_name` text DEFAULT 'Lucky Saroj' NOT NULL,
	`logo_text` text DEFAULT 'LS' NOT NULL,
	`favicon` text,
	`contact_email` text DEFAULT 'hello@luckysaroj.com' NOT NULL,
	`contact_phone` text DEFAULT '+91 12345 67890' NOT NULL,
	`location` text DEFAULT 'India' NOT NULL,
	`availability` text DEFAULT 'Freelance / Full-time / Remote' NOT NULL,
	`hero_heading` text DEFAULT 'LUCKY SAROJ' NOT NULL,
	`hero_subheading` text DEFAULT 'VIDEO EDITOR & VISUAL STORYTELLER' NOT NULL,
	`hero_description` text DEFAULT 'I turn raw footage into powerful stories that engage, inspire, and leave a lasting impact.' NOT NULL,
	`hero_image_url` text,
	`stat_years` text DEFAULT '5+' NOT NULL,
	`stat_projects` text DEFAULT '100+' NOT NULL,
	`stat_clients` text DEFAULT '50+' NOT NULL,
	`stat_views` text DEFAULT '10M+' NOT NULL,
	`footer_description` text DEFAULT 'I transform ideas and raw footage into powerful visual stories that engage, inspire and leave a lasting impact.' NOT NULL,
	`instagram_url` text,
	`youtube_url` text,
	`linkedin_url` text,
	`behance_url` text,
	`vimeo_url` text,
	`seo_title` text DEFAULT 'Lucky Saroj — Video Editor & Visual Storyteller' NOT NULL,
	`seo_description` text,
	`og_image_url` text
);
--> statement-breakpoint
CREATE TABLE `testimonials` (
	`id` text PRIMARY KEY NOT NULL,
	`client_name` text NOT NULL,
	`designation` text,
	`company` text,
	`profile_image_url` text,
	`testimonial_text` text NOT NULL,
	`rating` integer DEFAULT 5 NOT NULL,
	`is_featured` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'published' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
