export function canUseOptimizedImage(value: string | null | undefined): value is string {
  if (!value) return false;
  if (value.startsWith("/") && !value.startsWith("//")) return true;

  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:") return false;

    // Vercel Blob currently serves both the legacy blob.vercel-storage.com
    // hostname and newer per-store public.blob.vercel-storage.com hosts.
    // Keep all of them on the Next/Image optimization path so responsive
    // AVIF/WebP variants are generated instead of downloading originals.
    return parsed.hostname === "blob.vercel-storage.com" || parsed.hostname.endsWith(".blob.vercel-storage.com");
  } catch {
    return false;
  }
}
