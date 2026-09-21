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

export function getYouTubeEmbedUrl(value: string | null | undefined): string | null {
  const id = getYouTubeVideoId(value);
  if (!id) return null;

  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&playsinline=1&modestbranding=1`;
}
