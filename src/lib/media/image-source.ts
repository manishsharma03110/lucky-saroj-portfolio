export function canUseOptimizedImage(value: string | null | undefined): value is string {
  if (!value) return false;
  if (value.startsWith("/") && !value.startsWith("//")) return true;

  try {
    const parsed = new URL(value);
    return (
      parsed.protocol === "https:" &&
      (parsed.hostname === "blob.vercel-storage.com" || parsed.hostname.endsWith(".blob.vercel-storage.com"))
    );
  } catch {
    return false;
  }
}
