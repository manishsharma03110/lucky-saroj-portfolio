import { pgTable, text, integer, boolean, timestamp, primaryKey, index, check, unique, uniqueIndex, jsonb } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

export const roles = pgTable("roles", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  key: text("key").notNull().unique(),
  label: text("label").notNull(),
  trustLevel: integer("trust_level").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  check("roles_trust_level_nonnegative", sql`${table.trustLevel} >= 0`),
]);

export const permissions = pgTable("permissions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  key: text("key").notNull().unique(),
  resource: text("resource").notNull(),
  action: text("action").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  check("permissions_key_matches_parts", sql`${table.key} = ${table.resource} || '.' || ${table.action}`),
  check("permissions_key_format", sql`${table.key} ~ '^[a-z][a-z0-9_]*\\.[a-z][a-z0-9_]*$'`),
]);

export const rolePermissions = pgTable("role_permissions", {
  roleId: text("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
  permissionId: text("permission_id").notNull().references(() => permissions.id, { onDelete: "cascade" }),
}, (table) => [
  primaryKey({ columns: [table.roleId, table.permissionId] }),
  index("role_permissions_permission_id_idx").on(table.permissionId),
]);

export const adminUsers = pgTable("admin_users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  sessionVersion: integer("session_version").notNull().default(1),
  isActive: boolean("is_active").notNull().default(true),
  roleId: text("role_id").notNull().references(() => roles.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("admin_users_role_id_idx").on(table.roleId),
  check("admin_users_session_version_positive", sql`${table.sessionVersion} >= 1`),
]);

export const portfolioCategories = pgTable("portfolio_categories", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  displayOrder: integer("display_order").notNull().default(0),
}, (table) => [
  unique("portfolio_categories_display_order_unique").on(table.displayOrder),
  check("portfolio_categories_display_order_nonnegative", sql`${table.displayOrder} >= 0`),
]);

export const portfolioProjects = pgTable("portfolio_projects", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  clientName: text("client_name"),
  year: integer("year"),
  description: text("description"),
  challenge: text("challenge"),
  approach: text("approach"),
  result: text("result"),
  thumbnailUrl: text("thumbnail_url"),
  videoUrl: text("video_url"),
  posterUrl: text("poster_url"),
  categoryId: text("category_id").references(() => portfolioCategories.id, { onDelete: "set null" }),
  isFeatured: boolean("is_featured").notNull().default(false),
  status: text("status", { enum: ["draft", "published"] }).notNull().default("draft"),
  displayOrder: integer("display_order").notNull().default(0),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  revision: integer("revision").notNull().default(1),
}, (table) => [
  check("portfolio_projects_display_order_nonnegative", sql`${table.displayOrder} >= 0`),
  check("portfolio_projects_revision_positive", sql`${table.revision} >= 1`),
  check("portfolio_projects_status_valid", sql`${table.status} IN ('draft', 'published')`),
]);

export const projectMedia = pgTable("project_media", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull().references(() => portfolioProjects.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  type: text("type", { enum: ["image", "video"] }).notNull(),
  displayOrder: integer("display_order").notNull().default(0),
}, (table) => [
  unique("project_media_project_id_display_order_unique").on(table.projectId, table.displayOrder),
  check("project_media_display_order_nonnegative", sql`${table.displayOrder} >= 0`),
  check("project_media_type_valid", sql`${table.type} IN ('image', 'video')`),
]);

export const projectTools = pgTable("project_tools", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull().references(() => portfolioProjects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
}, (table) => [
  unique("project_tools_project_id_name_unique").on(table.projectId, table.name),
]);

export const experiences = pgTable("experiences", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  role: text("role").notNull(),
  company: text("company").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  isCurrent: boolean("is_current").notNull().default(false),
  description: text("description"),
  location: text("location"),
  displayOrder: integer("display_order").notNull().default(0),
  revision: integer("revision").notNull().default(1),
}, (table) => [
  unique("experiences_display_order_unique").on(table.displayOrder),
  check("experiences_display_order_nonnegative", sql`${table.displayOrder} >= 0`),
  check("experiences_revision_positive", sql`${table.revision} >= 1`),
  check("experiences_current_end_date", sql`NOT ${table.isCurrent} OR ${table.endDate} IS NULL`),
]);

export const services = pgTable("services", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon").notNull().default("Clapperboard"),
  isFeatured: boolean("is_featured").notNull().default(false),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  revision: integer("revision").notNull().default(1),
}, (table) => [
  unique("services_display_order_unique").on(table.displayOrder),
  check("services_display_order_nonnegative", sql`${table.displayOrder} >= 0`),
  check("services_revision_positive", sql`${table.revision} >= 1`),
]);

export const aboutProfile = pgTable("about_profile", {
  id: text("id").primaryKey().default("singleton:about"),
  profileImageUrl: text("profile_image_url"),
  name: text("name").notNull().default("Lucky Saroj"),
  headline: text("headline"),
  biography: text("biography"),
  yearsExperience: integer("years_experience").notNull().default(0),
  projectsCompleted: integer("projects_completed").notNull().default(0),
  clientCount: integer("client_count").notNull().default(0),
  viewsGenerated: text("views_generated").notNull().default("0"),
  revision: integer("revision").notNull().default(1),
}, (table) => [
  check("about_profile_singleton_id", sql`${table.id} = 'singleton:about'`),
  check("about_profile_years_experience_nonnegative", sql`${table.yearsExperience} >= 0`),
  check("about_profile_projects_completed_nonnegative", sql`${table.projectsCompleted} >= 0`),
  check("about_profile_client_count_nonnegative", sql`${table.clientCount} >= 0`),
  check("about_profile_revision_positive", sql`${table.revision} >= 1`),
]);

export const aboutSkills = pgTable("about_skills", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  profileId: text("profile_id").notNull().default("singleton:about").references(() => aboutProfile.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
}, (table) => [
  unique("about_skills_profile_id_name_unique").on(table.profileId, table.name),
  unique("about_skills_profile_id_display_order_unique").on(table.profileId, table.displayOrder),
  check("about_skills_display_order_nonnegative", sql`${table.displayOrder} >= 0`),
]);

export const aboutTools = pgTable("about_tools", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  profileId: text("profile_id").notNull().default("singleton:about").references(() => aboutProfile.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
}, (table) => [
  unique("about_tools_profile_id_name_unique").on(table.profileId, table.name),
  unique("about_tools_profile_id_display_order_unique").on(table.profileId, table.displayOrder),
  check("about_tools_display_order_nonnegative", sql`${table.displayOrder} >= 0`),
]);

export const testimonials = pgTable("testimonials", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  clientName: text("client_name").notNull(),
  designation: text("designation"),
  company: text("company"),
  profileImageUrl: text("profile_image_url"),
  testimonialText: text("testimonial_text").notNull(),
  rating: integer("rating").notNull().default(5),
  isFeatured: boolean("is_featured").notNull().default(false),
  status: text("status", { enum: ["draft", "published"] }).notNull().default("published"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  revision: integer("revision").notNull().default(1),
}, (table) => [
  check("testimonials_rating_range", sql`${table.rating} BETWEEN 1 AND 5`),
  check("testimonials_revision_positive", sql`${table.revision} >= 1`),
  check("testimonials_status_valid", sql`${table.status} IN ('draft', 'published')`),
]);

export const showreels = pgTable("showreels", {
  id: text("id").primaryKey().default("singleton:showreel"),
  title: text("title").notNull(),
  videoUrl: text("video_url"),
  thumbnailUrl: text("thumbnail_url"),
  duration: text("duration"),
  isFeatured: boolean("is_featured").notNull().default(true),
  status: text("status", { enum: ["draft", "published"] }).notNull().default("published"),
  revision: integer("revision").notNull().default(1),
}, (table) => [
  check("showreels_singleton_id", sql`${table.id} = 'singleton:showreel'`),
  check("showreels_revision_positive", sql`${table.revision} >= 1`),
  check("showreels_status_valid", sql`${table.status} IN ('draft', 'published')`),
]);

export const contactMessages = pgTable("contact_messages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  projectType: text("project_type"),
  budgetRange: text("budget_range"),
  videoType: text("video_type"),
  projectTimeline: text("project_timeline"),
  referenceUrl: text("reference_url"),
  message: text("message").notNull(),
  status: text("status", { enum: ["new", "read", "replied", "archived"] }).notNull().default("new"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  revision: integer("revision").notNull().default(1),
}, (table) => [
  check("contact_messages_revision_positive", sql`${table.revision} >= 1`),
  check("contact_messages_status_valid", sql`${table.status} IN ('new', 'read', 'replied', 'archived')`),
]);

export const siteSettings = pgTable("site_settings", {
  id: text("id").primaryKey().default("singleton:settings"),
  siteName: text("site_name").notNull().default("Lucky Saroj"),
  logoText: text("logo_text").notNull().default("LS"),
  logoImageUrl: text("logo_image_url"),
  favicon: text("favicon"),
  contactEmail: text("contact_email").notNull().default("hello@luckysaroj.com"),
  contactPhone: text("contact_phone").notNull().default("+91 12345 67890"),
  whatsapp: text("whatsapp"),
  location: text("location").notNull().default("India"),
  availability: text("availability").notNull().default("Freelance / Full-time / Remote"),
  paymentTerms: text("payment_terms"),
  turnaroundTime: text("turnaround_time"),
  heroHeading: text("hero_heading").notNull().default("LUCKY SAROJ"),
  heroSubheading: text("hero_subheading").notNull().default("VIDEO EDITOR & VISUAL STORYTELLER"),
  heroDescription: text("hero_description").notNull().default("I turn raw footage into powerful stories that engage, inspire, and leave a lasting impact."),
  heroImageUrl: text("hero_image_url"),
  statYears: text("stat_years").notNull().default("5+"),
  statProjects: text("stat_projects").notNull().default("100+"),
  statClients: text("stat_clients").notNull().default("50+"),
  statViews: text("stat_views").notNull().default("10M+"),
  footerDescription: text("footer_description").notNull().default("I transform ideas and raw footage into powerful visual stories that engage, inspire and leave a lasting impact."),
  instagramUrl: text("instagram_url"),
  twitterUrl: text("twitter_url"),
  youtubeUrl: text("youtube_url"),
  linkedinUrl: text("linkedin_url"),
  behanceUrl: text("behance_url"),
  vimeoUrl: text("vimeo_url"),
  seoTitle: text("seo_title").notNull().default("Lucky Saroj — Video Editor & Visual Storyteller"),
  seoDescription: text("seo_description"),
  ogImageUrl: text("og_image_url"),
  revision: integer("revision").notNull().default(1),
}, (table) => [
  check("site_settings_singleton_id", sql`${table.id} = 'singleton:settings'`),
  check("site_settings_revision_positive", sql`${table.revision} >= 1`),
]);

export const homePageContent = pgTable("home_page_content", {
  id: text("id").primaryKey().default("singleton:home"),
  selectedWorkEyebrow: text("selected_work_eyebrow").notNull().default("Selected work"),
  selectedWorkHeading: text("selected_work_heading").notNull().default("Work built to be watched."),
  selectedWorkCtaLabel: text("selected_work_cta_label").notNull().default("View All Work"),
  selectedWorkCtaUrl: text("selected_work_cta_url").notNull().default("/portfolio"),
  servicesEyebrow: text("services_eyebrow").notNull().default("What I do"),
  servicesHeading: text("services_heading").notNull().default("Post-production built around the story."),
  servicesDescription: text("services_description").notNull().default("Explore the services currently available for projects and collaborations."),
  servicesCtaLabel: text("services_cta_label").notNull().default("Explore services"),
  servicesCtaUrl: text("services_cta_url").notNull().default("/services"),
  aboutEyebrow: text("about_eyebrow").notNull().default("About the editor"),
  aboutCtaLabel: text("about_cta_label").notNull().default("More about me"),
  aboutCtaUrl: text("about_cta_url").notNull().default("/about"),
  testimonialsEyebrow: text("testimonials_eyebrow").notNull().default("Client perspective"),
  testimonialsHeading: text("testimonials_heading").notNull().default("The work, in their words."),
  testimonialsDescription: text("testimonials_description").notNull().default("Real feedback from published client testimonials."),
  finalCtaEyebrow: text("final_cta_eyebrow").notNull().default("Start a project"),
  finalCtaHeading: text("final_cta_heading").notNull().default("Let’s shape the next story."),
  finalCtaDescription: text("final_cta_description").notNull().default("Tell me what you’re making, where it needs to land, and what success should feel like."),
  finalCtaButtonLabel: text("final_cta_button_label").notNull().default("Start a conversation"),
  finalCtaButtonUrl: text("final_cta_button_url").notNull().default("/contact"),
  revision: integer("revision").notNull().default(1),
}, (table) => [
  check("home_page_content_singleton_id", sql`${table.id} = 'singleton:home'`),
  check("home_page_content_revision_positive", sql`${table.revision} >= 1`),
]);

export const pageContent = pgTable("page_content", {
  pageKey: text("page_key").primaryKey(),
  content: jsonb("content").notNull().default({}),
  revision: integer("revision").notNull().default(1),
}, (table) => [
  check("page_content_page_key_valid", sql`${table.pageKey} IN ('global','about','services','experience','portfolio','contact')`),
  check("page_content_revision_positive", sql`${table.revision} >= 1`),
]);

export const pageSeo = pgTable("page_seo", {
  pageKey: text("page_key").primaryKey(),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  canonicalPath: text("canonical_path"),
  ogTitle: text("og_title"),
  ogDescription: text("og_description"),
  ogImageUrl: text("og_image_url"),
  robotsIndex: boolean("robots_index").notNull().default(true),
  keywords: text("keywords"),
  revision: integer("revision").notNull().default(1),
}, (table) => [
  check("page_seo_page_key_valid", sql`${table.pageKey} IN ('home','about','portfolio','services','experience','contact')`),
  check("page_seo_revision_positive", sql`${table.revision} >= 1`),
]);

export const mediaAssets = pgTable("media_assets", {
  id: text("id").primaryKey(),
  provider: text("provider", { enum: ["vercel_blob"] }).notNull().default("vercel_blob"),
  providerKey: text("provider_key").notNull().unique(),
  url: text("url"),
  kind: text("kind", { enum: ["image", "video"] }).notNull(),
  originalFilename: text("original_filename").notNull(),
  uploadedByAdminId: text("uploaded_by_admin_id").references(() => adminUsers.id, { onDelete: "set null" }),
  state: text("state", { enum: ["pending", "attached", "orphaned", "deleting", "delete_failed", "deleted"] }).notNull().default("pending"),
  deleteAttempts: integer("delete_attempts").notNull().default(0),
  lastDeleteAttemptAt: timestamp("last_delete_attempt_at"),
  lastDeleteErrorCode: text("last_delete_error_code"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  check("media_assets_id_canonical_uuid", sql`${table.id} ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'`),
  check("media_assets_provider_valid", sql`${table.provider} = 'vercel_blob'`),
  check("media_assets_provider_key_canonical", sql`${table.providerKey} = 'cms-media/' || ${table.id} || '/' || ${table.kind}`),
  check("media_assets_url_bounded", sql`${table.url} IS NULL OR char_length(${table.url}) BETWEEN 1 AND 2048`),
  check("media_assets_state_url_coherent", sql`${table.state} IN ('pending', 'orphaned') OR ${table.url} IS NOT NULL`),
  check("media_assets_kind_valid", sql`${table.kind} IN ('image', 'video')`),
  check("media_assets_original_filename_bounded", sql`char_length(${table.originalFilename}) BETWEEN 1 AND 255`),
  check("media_assets_state_valid", sql`${table.state} IN ('pending', 'attached', 'orphaned', 'deleting', 'delete_failed', 'deleted')`),
  check("media_assets_delete_attempts_nonnegative", sql`${table.deleteAttempts} >= 0`),
  check("media_assets_delete_error_code_bounded", sql`${table.lastDeleteErrorCode} IS NULL OR char_length(${table.lastDeleteErrorCode}) BETWEEN 1 AND 64`),
  index("media_assets_cleanup_state_updated_idx").on(table.state, table.updatedAt),
  index("media_assets_delete_retry_idx").on(table.state, table.lastDeleteAttemptAt),
]);

export const mediaAssetReferences = pgTable("media_asset_references", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  assetId: text("asset_id").notNull().references(() => mediaAssets.id, { onDelete: "restrict" }),
  ownerType: text("owner_type", { enum: ["portfolio_project", "showreel", "site_settings"] }).notNull(),
  portfolioProjectId: text("portfolio_project_id").references(() => portfolioProjects.id, { onDelete: "cascade" }),
  showreelId: text("showreel_id").references(() => showreels.id, { onDelete: "cascade" }),
  siteSettingsId: text("site_settings_id").references(() => siteSettings.id, { onDelete: "cascade" }),
  slot: text("slot").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  check("media_asset_references_owner_valid", sql`(
    (${table.ownerType} = 'portfolio_project' AND ${table.portfolioProjectId} IS NOT NULL AND ${table.showreelId} IS NULL AND ${table.siteSettingsId} IS NULL)
    OR (${table.ownerType} = 'showreel' AND ${table.portfolioProjectId} IS NULL AND ${table.showreelId} = 'singleton:showreel' AND ${table.siteSettingsId} IS NULL)
    OR (${table.ownerType} = 'site_settings' AND ${table.portfolioProjectId} IS NULL AND ${table.showreelId} IS NULL AND ${table.siteSettingsId} = 'singleton:settings')
  )`),
  check("media_asset_references_slot_valid", sql`(
    (${table.ownerType} IN ('portfolio_project','showreel') AND ${table.slot} IN ('thumbnail','video'))
    OR (${table.ownerType} = 'site_settings' AND ${table.slot} IN ('hero_image','about_profile_image','logo_image','favicon','og_image','services_hero_image','experience_hero_image','contact_hero_image'))
  )`),
  unique("media_asset_references_asset_owner_slot_unique").on(table.assetId, table.ownerType, table.portfolioProjectId, table.showreelId, table.slot),
  uniqueIndex("media_asset_references_project_slot_unique").on(table.portfolioProjectId, table.slot).where(sql`${table.ownerType} = 'portfolio_project'`),
  uniqueIndex("media_asset_references_showreel_slot_unique").on(table.showreelId, table.slot).where(sql`${table.ownerType} = 'showreel'`),
  uniqueIndex("media_asset_references_settings_slot_unique").on(table.siteSettingsId, table.slot).where(sql`${table.ownerType} = 'site_settings'`),
  index("media_asset_references_asset_id_idx").on(table.assetId),
]);

export const portfolioProjectsRelations = relations(portfolioProjects, ({ one, many }) => ({
  category: one(portfolioCategories, { fields: [portfolioProjects.categoryId], references: [portfolioCategories.id] }),
  media: many(projectMedia),
  tools: many(projectTools),
}));

export const portfolioCategoriesRelations = relations(portfolioCategories, ({ many }) => ({ projects: many(portfolioProjects) }));
export const projectMediaRelations = relations(projectMedia, ({ one }) => ({ project: one(portfolioProjects, { fields: [projectMedia.projectId], references: [portfolioProjects.id] }) }));
export const projectToolsRelations = relations(projectTools, ({ one }) => ({ project: one(portfolioProjects, { fields: [projectTools.projectId], references: [portfolioProjects.id] }) }));
export const aboutProfileRelations = relations(aboutProfile, ({ many }) => ({ skills: many(aboutSkills), tools: many(aboutTools) }));
export const aboutSkillsRelations = relations(aboutSkills, ({ one }) => ({ profile: one(aboutProfile, { fields: [aboutSkills.profileId], references: [aboutProfile.id] }) }));
export const aboutToolsRelations = relations(aboutTools, ({ one }) => ({ profile: one(aboutProfile, { fields: [aboutTools.profileId], references: [aboutProfile.id] }) }));
