export function getYouTubeVideoId(value: string | null | undefined): string | null {
  const input = value?.trim();
  if (!input) return null;
  if (/^[A-Za-z0-9_-]{11}$/.test(input)) return input;

  try {
    const url = new URL(input);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    let id: string | null = null;

    if (host === "youtu.be") id = url.pathname.split("/").filter(Boolean)[0] ?? null;
    else if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
      if (url.pathname === "/watch") id = url.searchParams.get("v");
      else {
        const parts = url.pathname.split("/").filter(Boolean);
        if (["embed", "shorts", "live"].includes(parts[0] ?? "")) id = parts[1] ?? null;
      }
    }

    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

export function normalizeYouTubeVideoUrl(value: string | null | undefined): string | null {
  const id = getYouTubeVideoId(value);
  return id ? `https://www.youtube.com/watch?v=${id}` : null;
}

export function isDirectVideoUrl(value: string | null | undefined): boolean {
  const input = value?.trim();
  if (!input) return false;

  const directExtension = /\.(mp4|webm|ogg|ogv|mov|m4v)$/i;

  try {
    const url = new URL(input);
    const pathname = url.pathname.toLowerCase();
    if (directExtension.test(pathname)) return true;

    return url.hostname.endsWith("public.blob.vercel-storage.com") && pathname.endsWith("/video");
  } catch {
    const cleanPath = input.split(/[?#]/, 1)[0] ?? "";
    return directExtension.test(cleanPath) || (cleanPath.startsWith("/") && cleanPath.endsWith("/video"));
  }
}

export function getYouTubeEmbedUrl(value: string | null | undefined): string | null {
  const id = getYouTubeVideoId(value);
  if (!id) return null;

  // PR #66 behavior: preserve the standard YouTube embed surface while
  // keeping playback inline inside the fixed project frame.
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&playsinline=1`;
}
