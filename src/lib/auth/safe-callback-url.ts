const DEFAULT_ADMIN_DESTINATION = "/admin/dashboard";
const LOCAL_ORIGIN = "https://local.invalid";
const UNSAFE_CALLBACK_CHARACTERS = /[\\\u0000-\u001f\u007f]/;

export function getSafeAdminCallbackUrl(value: string | null | undefined): string {
  if (!value || value !== value.trim() || !value.startsWith("/") || value.startsWith("//") || UNSAFE_CALLBACK_CHARACTERS.test(value)) {
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
