export const ROLE_KEYS = ["SUPER_ADMIN", "ADMIN", "EDITOR"] as const;
export type RoleKey = (typeof ROLE_KEYS)[number];

export const PERMISSION_KEYS = [
  "dashboard.view",
  "portfolio.read", "portfolio.create", "portfolio.update", "portfolio.delete",
  "categories.read", "categories.create", "categories.delete",
  "experience.read", "experience.create", "experience.update", "experience.delete",
  "services.read", "services.create", "services.update", "services.delete",
  "about.read", "about.update",
  "showreel.read", "showreel.update",
  "testimonials.read", "testimonials.create", "testimonials.update", "testimonials.delete",
  "messages.read", "messages.update", "messages.delete",
  "settings.read", "settings.update", "media.upload",
  "admin_users.manage", "roles.manage",
] as const;
export type PermissionKey = (typeof PERMISSION_KEYS)[number];

const roleKeys = new Set<string>(ROLE_KEYS);
const permissionKeys = new Set<string>(PERMISSION_KEYS);

export function isRoleKey(value: unknown): value is RoleKey {
  return typeof value === "string" && roleKeys.has(value);
}

export function isPermissionKey(value: unknown): value is PermissionKey {
  return typeof value === "string" && permissionKeys.has(value);
}
