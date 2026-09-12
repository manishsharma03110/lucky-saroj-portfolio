import { BUDGET_RANGES, POPUP_PROJECT_TYPES, PROJECT_TIMELINES, VIDEO_TYPES } from "@/lib/validations/contact-options";

export type ContactOption = {
  id: string;
  label: string;
  enabled: boolean;
};

export type ContactOptionsConfig = {
  budgetRanges: ContactOption[];
  videoTypes: ContactOption[];
  projectTimelines: ContactOption[];
  popupProjectTypes: ContactOption[];
};

export type ContactOptionGroup = keyof ContactOptionsConfig;

function slugId(prefix: string, label: string, index: number) {
  const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48);
  return `${prefix}-${slug || index + 1}`;
}

function options(prefix: string, values: readonly string[]): ContactOption[] {
  return values.map((label, index) => ({ id: slugId(prefix, label, index), label, enabled: true }));
}

export const DEFAULT_CONTACT_OPTIONS_CONFIG: ContactOptionsConfig = {
  budgetRanges: options("budget", BUDGET_RANGES),
  videoTypes: options("video", VIDEO_TYPES),
  projectTimelines: options("timeline", PROJECT_TIMELINES),
  popupProjectTypes: options("popup", POPUP_PROJECT_TYPES),
};

export const DEFAULT_CONTACT_OPTIONS_SERIALIZED = JSON.stringify(DEFAULT_CONTACT_OPTIONS_CONFIG);

function normalizeGroup(value: unknown, fallback: ContactOption[]): ContactOption[] {
  if (!Array.isArray(value)) return fallback.map((item) => ({ ...item }));
  const seen = new Set<string>();
  const normalized: ContactOption[] = [];
  for (const [index, candidate] of value.entries()) {
    if (!candidate || typeof candidate !== "object") continue;
    const raw = candidate as Partial<ContactOption>;
    const label = typeof raw.label === "string" ? raw.label.trim().slice(0, 120) : "";
    if (!label || seen.has(label.toLowerCase())) continue;
    const id = typeof raw.id === "string" && raw.id.trim() ? raw.id.trim().slice(0, 120) : slugId("option", label, index);
    normalized.push({ id, label, enabled: raw.enabled !== false });
    seen.add(label.toLowerCase());
  }
  return normalized.length ? normalized.slice(0, 50) : fallback.map((item) => ({ ...item }));
}

export function parseContactOptionsConfig(raw?: string | null): ContactOptionsConfig {
  if (!raw) return structuredClone(DEFAULT_CONTACT_OPTIONS_CONFIG);
  try {
    const parsed = JSON.parse(raw) as Partial<ContactOptionsConfig>;
    return {
      budgetRanges: normalizeGroup(parsed.budgetRanges, DEFAULT_CONTACT_OPTIONS_CONFIG.budgetRanges),
      videoTypes: normalizeGroup(parsed.videoTypes, DEFAULT_CONTACT_OPTIONS_CONFIG.videoTypes),
      projectTimelines: normalizeGroup(parsed.projectTimelines, DEFAULT_CONTACT_OPTIONS_CONFIG.projectTimelines),
      popupProjectTypes: normalizeGroup(parsed.popupProjectTypes, DEFAULT_CONTACT_OPTIONS_CONFIG.popupProjectTypes),
    };
  } catch {
    return structuredClone(DEFAULT_CONTACT_OPTIONS_CONFIG);
  }
}

export function activeContactOptionLabels(config: ContactOptionsConfig, group: ContactOptionGroup): string[] {
  return config[group].filter((option) => option.enabled).map((option) => option.label);
}
