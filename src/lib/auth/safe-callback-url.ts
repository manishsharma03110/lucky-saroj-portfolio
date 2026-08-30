const DEFAULT_ADMIN_DESTINATION = "/admin/dashboard";
const LOCAL_ORIGIN = "https://local.invalid";

export function getSafeAdminCallbackUrl(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return DEFAULT_ADMIN_DESTINATION;
  }

  try {
    const parsed = new URL(value, LOCAL_ORIGIN);
    const isLocalOrigin = parsed.origin === LOCAL_ORIGIN;
    const isAdminPath = parsed.pathname === "/admin" || parsed.pathname.startsWith("/admin/");

    if (!isLocalOrigin || !isAdminPath) {
      return DEFAULT_ADMIN_DESTINATION;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return DEFAULT_ADMIN_DESTINATION;
  }
}
