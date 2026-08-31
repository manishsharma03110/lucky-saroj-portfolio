import { pgTable, text, integer, boolean, timestamp, primaryKey, index, check } from "drizzle-orm/pg-core";
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

// ---------------------------------------------------------------------------
// AdminUser
// ---------------------------------------------------------------------------
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
]);

// ---------------------------------------------------------------------------
// PortfolioCategory
// ---------------------------------------------------------------------------
export const portfolioCategories = pgTable("portfolio_categories", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  displayOrder: integer("display_order").notNull().default(0),
});

// ---------------------------------------------------------------------------
// PortfolioProject
// ---------------------------------------------------------------------------
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
  categoryId: text("category_id").references(() => portfolioCategories.id, {
    onDelete: "set null",
  }),
  isFeatured: boolean("is_featured").notNull().default(false),
  status: text("status", { enum: ["draft", "published"] })
    .notNull()
    .default("draft"),
  displayOrder: integer("display_order").notNull().default(0),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// ProjectMedia (gallery / extra media beyond thumbnail+video)
// ---------------------------------------------------------------------------
export const projectMedia = pgTable("project_media", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id")
    .notNull()
    .references(() => portfolioProjects.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  type: text("type", { enum: ["image", "video"] }).notNull(),
  displayOrder: integer("display_order").notNull().default(0),
});

// ---------------------------------------------------------------------------
// ProjectTool (tools/software used, per project)
// ---------------------------------------------------------------------------
export const projectTools = pgTable("project_tools", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id")
    .notNull()
    .references(() => portfolioProjects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
});

// ---------------------------------------------------------------------------
// Experience
// ---------------------------------------------------------------------------
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
});

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------
export const services = pgTable("services", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon").notNull().default("Clapperboard"),
  isFeatured: boolean("is_featured").notNull().default(false),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

// ---------------------------------------------------------------------------
// AboutProfile (singleton row)
// ---------------------------------------------------------------------------
export const aboutProfile = pgTable("about_profile", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  profileImageUrl: text("profile_image_url"),
  name: text("name").notNull().default("Lucky Saroj"),
  headline: text("headline"),
  biography: text("biography"),
  yearsExperience: integer("years_experience").notNull().default(0),
  projectsCompleted: integer("projects_completed").notNull().default(0),
  clientCount: integer("client_count").notNull().default(0),
  viewsGenerated: text("views_generated").notNull().default("0"),
});

// ---------------------------------------------------------------------------
// AboutSkill
// ---------------------------------------------------------------------------
export const aboutSkills = pgTable("about_skills", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
});

// ---------------------------------------------------------------------------
// AboutTool (software/tools shown on About page)
// ---------------------------------------------------------------------------
export const aboutTools = pgTable("about_tools", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
});

// ---------------------------------------------------------------------------
// Testimonial
// ---------------------------------------------------------------------------
export const testimonials = pgTable("testimonials", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  clientName: text("client_name").notNull(),
  designation: text("designation"),
  company: text("company"),
  profileImageUrl: text("profile_image_url"),
  testimonialText: text("testimonial_text").notNull(),
  rating: integer("rating").notNull().default(5),
  isFeatured: boolean("is_featured").notNull().default(false),
  status: text("status", { enum: ["draft", "published"] })
    .notNull()
    .default("published"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Showreel
// ---------------------------------------------------------------------------
export const showreels = pgTable("showreels", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  videoUrl: text("video_url"),
  thumbnailUrl: text("thumbnail_url"),
  duration: text("duration"),
  isFeatured: boolean("is_featured").notNull().default(true),
  status: text("status", { enum: ["draft", "published"] })
    .notNull()
    .default("published"),
});

// ---------------------------------------------------------------------------
// ContactMessage
// ---------------------------------------------------------------------------
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
  status: text("status", { enum: ["new", "read", "replied", "archived"] })
    .notNull()
    .default("new"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// SiteSettings (singleton row, JSON-ish flat fields per §16)
// ---------------------------------------------------------------------------
export const siteSettings = pgTable("site_settings", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  // General
  siteName: text("site_name").notNull().default("Lucky Saroj"),
  logoText: text("logo_text").notNull().default("LS"),
  favicon: text("favicon"),
  contactEmail: text("contact_email").notNull().default("hello@luckysaroj.com"),
  contactPhone: text("contact_phone").notNull().default("+91 12345 67890"),
  whatsapp: text("whatsapp"),
  location: text("location").notNull().default("India"),
  availability: text("availability").notNull().default("Freelance / Full-time / Remote"),
  paymentTerms: text("payment_terms"),
  turnaroundTime: text("turnaround_time"),
  // Homepage
  heroHeading: text("hero_heading").notNull().default("LUCKY SAROJ"),
  heroSubheading: text("hero_subheading").notNull().default("VIDEO EDITOR & VISUAL STORYTELLER"),
  heroDescription: text("hero_description").notNull().default(
    "I turn raw footage into powerful stories that engage, inspire, and leave a lasting impact."
  ),
  heroImageUrl: text("hero_image_url"),
  statYears: text("stat_years").notNull().default("5+"),
  statProjects: text("stat_projects").notNull().default("100+"),
  statClients: text("stat_clients").notNull().default("50+"),
  statViews: text("stat_views").notNull().default("10M+"),
  // Footer / social
  footerDescription: text("footer_description").notNull().default(
    "I transform ideas and raw footage into powerful visual stories that engage, inspire and leave a lasting impact."
  ),
  instagramUrl: text("instagram_url"),
  twitterUrl: text("twitter_url"),
  youtubeUrl: text("youtube_url"),
  linkedinUrl: text("linkedin_url"),
  behanceUrl: text("behance_url"),
  vimeoUrl: text("vimeo_url"),
  // SEO
  seoTitle: text("seo_title").notNull().default("Lucky Saroj — Video Editor & Visual Storyteller"),
  seoDescription: text("seo_description"),
  ogImageUrl: text("og_image_url"),
});

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------
export const portfolioProjectsRelations = relations(portfolioProjects, ({ one, many }) => ({
  category: one(portfolioCategories, {
    fields: [portfolioProjects.categoryId],
    references: [portfolioCategories.id],
  }),
  media: many(projectMedia),
  tools: many(projectTools),
}));

export const portfolioCategoriesRelations = relations(portfolioCategories, ({ many }) => ({
  projects: many(portfolioProjects),
}));

export const projectMediaRelations = relations(projectMedia, ({ one }) => ({
  project: one(portfolioProjects, {
    fields: [projectMedia.projectId],
    references: [portfolioProjects.id],
  }),
}));

export const projectToolsRelations = relations(projectTools, ({ one }) => ({
  project: one(portfolioProjects, {
    fields: [projectTools.projectId],
    references: [portfolioProjects.id],
  }),
}));
