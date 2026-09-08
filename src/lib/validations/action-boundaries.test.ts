import assert from "node:assert/strict";
import test from "node:test";
import { z } from "zod";
import { fieldErrorsFromIssues, InvalidActionInputError, SAFE_VALIDATION_MESSAGE } from "./action-errors";
import { categorySchema } from "./category";
import { experienceSchema } from "./experience";
import { projectSchema } from "./project";
import { serviceSchema } from "./service";
import { settingsSchema } from "./settings";
import { showreelSchema } from "./showreel";
import { testimonialSchema } from "./testimonial";

const projectInput = {
  title: "Project",
  slug: "project-slug",
  clientName: "",
  year: "2026",
  categoryId: "11111111-1111-4111-8111-111111111111",
  description: "",
  challenge: "",
  approach: "",
  result: "",
  thumbnailUrl: "/uploads/portfolio/thumb.webp",
  videoUrl: "https://example.com/video",
  isFeatured: "on",
  status: "draft",
  seoTitle: "",
  seoDescription: "",
  tools: "",
};

test("category and project boundaries compose authoritative slug, ID, media, and checkbox schemas", () => {
  assert.equal(categorySchema.safeParse({ name: "All", slug: "all" }).success, false);
  assert.equal(projectSchema.safeParse(projectInput).success, true);
  for (const patch of [
    { slug: "Bad Slug" },
    { categoryId: "singleton:about" },
    { thumbnailUrl: "/uploads/../secret" },
    { videoUrl: "javascript:alert(1)" },
    { isFeatured: "false" },
  ]) assert.equal(projectSchema.safeParse({ ...projectInput, ...patch }).success, false);
});

test("project and showreel handoff accepts optional canonical owned IDs without inferring ownership from URLs", () => {
  const ownedId = "22222222-2222-4222-8222-222222222222";
  assert.equal(projectSchema.safeParse({ ...projectInput, thumbnailAssetId: ownedId, videoAssetId: ownedId }).success, true);
  assert.equal(projectSchema.safeParse({ ...projectInput, thumbnailAssetId: "", videoAssetId: "" }).success, true);
  assert.equal(projectSchema.safeParse({ ...projectInput, thumbnailAssetId: "not-an-asset" }).success, false);
  const showreel = { title: "Reel", videoUrl: "https://example.com/reel", thumbnailUrl: "/uploads/showreel/thumb.webp", duration: "1:00", isFeatured: "on", status: "published" };
  assert.equal(showreelSchema.safeParse({ ...showreel, thumbnailAssetId: ownedId, videoAssetId: ownedId }).success, true);
  assert.equal(showreelSchema.safeParse(showreel).success, true);
  assert.equal(showreelSchema.safeParse({ ...showreel, videoAssetId: "https://example.com/not-identity" }).success, false);
});
test("Experience boundary enforces checkbox and year-range invariants", () => {
  const base = { role: "Editor", company: "Studio", startDate: "2024", endDate: "", isCurrent: null, location: "", description: "" };
  assert.equal(experienceSchema.safeParse(base).success, true);
  assert.equal(experienceSchema.safeParse({ ...base, isCurrent: "on", endDate: "2024" }).success, false);
  assert.equal(experienceSchema.safeParse({ ...base, startDate: "2025", endDate: "2024" }).success, false);
  assert.equal(experienceSchema.safeParse({ ...base, isCurrent: "false" }).success, false);
});

test("service and testimonial boundaries reject checkbox type confusion", () => {
  assert.equal(serviceSchema.safeParse({ name: "Editing", description: "", icon: "video", isFeatured: null, isActive: "on" }).success, true);
  assert.equal(serviceSchema.safeParse({ name: "Editing", description: "", icon: "video", isFeatured: "false", isActive: "on" }).success, false);
  const testimonial = { clientName: "Client", designation: "", company: "", testimonialText: "Great", rating: "5", isFeatured: null, status: "published" };
  assert.equal(testimonialSchema.safeParse(testimonial).success, true);
  assert.equal(testimonialSchema.safeParse({ ...testimonial, isFeatured: "true" }).success, false);
});

test("settings and showreel boundaries enforce HTTPS and persisted media contracts", () => {
  const settings = {
    siteName: "Site", logoText: "LS", contactEmail: "admin@example.com", contactPhone: "", whatsapp: "", location: "India",
    availability: "Available", paymentTerms: "", turnaroundTime: "", heroHeading: "Hero", heroSubheading: "Sub",
    heroDescription: "Description", heroImageUrl: "", heroImageAssetId: "", statYears: "1", statProjects: "1", statClients: "1", statViews: "1",
    footerDescription: "Footer", instagramUrl: "https://example.com", twitterUrl: "", youtubeUrl: "", linkedinUrl: "",
    behanceUrl: "", vimeoUrl: "", seoTitle: "SEO", seoDescription: "",
  };
  assert.equal(settingsSchema.safeParse(settings).success, true);
  const ownedId = "22222222-2222-4222-8222-222222222222";
  assert.equal(settingsSchema.safeParse({ ...settings, heroImageUrl: "https://example.com/hero.webp", heroImageAssetId: ownedId }).success, true);
  assert.equal(settingsSchema.safeParse({ ...settings, heroImageUrl: "/uploads/HomePage/hero.webp", heroImageAssetId: "" }).success, true);
  assert.equal(settingsSchema.safeParse({ ...settings, heroImageUrl: "", heroImageAssetId: "" }).success, true);
  assert.equal(settingsSchema.safeParse({ ...settings, heroImageAssetId: "not-an-asset" }).success, false);
  assert.equal(settingsSchema.safeParse({ ...settings, heroImageUrl: "javascript:alert(1)" }).success, false);
  assert.equal(settingsSchema.safeParse({ ...settings, instagramUrl: "http://example.com" }).success, false);
  const showreel = { title: "Reel", videoUrl: "https://example.com/reel", thumbnailUrl: "/uploads/showreel/thumb.webp", duration: "1:00", isFeatured: "on", status: "published" };
  assert.equal(showreelSchema.safeParse(showreel).success, true);
  assert.equal(showreelSchema.safeParse({ ...showreel, thumbnailUrl: "/uploads/../secret" }).success, false);
});

test("safe validation errors expose stable application messages only", () => {
  const parsed = z.object({ slug: z.string().min(3, "Use a longer slug.") }).safeParse({ slug: "x" });
  assert.equal(parsed.success, false);
  if (parsed.success) return;
  assert.deepEqual(fieldErrorsFromIssues(parsed.error.issues), { slug: "Use a longer slug." });
  assert.equal(SAFE_VALIDATION_MESSAGE, "Please fix the errors below.");
  const error = new InvalidActionInputError();
  assert.equal(error.message, "Invalid action input.");
  assert.equal(error.code, "INVALID_ACTION_INPUT");
});
