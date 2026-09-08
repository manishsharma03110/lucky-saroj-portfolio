import { z } from "zod";

export const BUDGET_RANGES = ["Under ₹5,000", "₹5,000 – ₹10,000", "₹10,000 – ₹25,000", "₹25,000 – ₹50,000", "₹50,000+", "Let's Discuss"] as const;
export const VIDEO_TYPES = ["YouTube Video", "Short Form / Reels", "Advertisement", "Corporate Video", "Educational Video", "Documentary", "Podcast", "Music Video", "Other"] as const;
export const PROJECT_TIMELINES = ["As soon as possible", "Within 1 week", "1–2 weeks", "2–4 weeks", "1+ month", "Flexible"] as const;
export const POPUP_PROJECT_TYPES = ["YouTube Video", "Reels / Shorts", "Brand / Commercial Video", "Social Media Ad", "Corporate Video", "Event / Wedding Video", "Podcast / Talking Head", "Music Video", "Documentary / Short Film", "Motion Graphics", "Other"] as const;

export const budgetRangeSchema = z.enum(BUDGET_RANGES);
export const videoTypeSchema = z.enum(VIDEO_TYPES);
export const projectTimelineSchema = z.enum(PROJECT_TIMELINES);
export const popupProjectTypeSchema = z.enum(POPUP_PROJECT_TYPES);

export function createProjectTypeSchema(categoryNames: readonly string[]) {
  const allowed = new Set([...categoryNames, "Other"]);
  return z.string().trim().min(1, "Project type is required.").max(120).refine((value) => allowed.has(value), "Select a supported project type.");
}
