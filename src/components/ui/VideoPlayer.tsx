"use client";

import { Play } from "lucide-react";
import { useState } from "react";
import { getYouTubeEmbedUrl } from "@/lib/media/youtube";

type PosterFit = "cover" | "project-banner";

export function VideoPlayer({
  videoUrl,
  posterUrl,
  title,
  className = "",
  posterFit = "cover",
}: {
  videoUrl?: string | null;
  posterUrl?: string | null;
  title: string;
  className?: string;
  posterFit?: PosterFit;
}) {
  const [playing, setPlaying] = useState(false);
  const embedUrl = getYouTubeEmbedUrl(videoUrl);
  const posterFitClass = posterFit === "project-banner" ? "bg-contain bg-no-repeat" : "bg-contain bg-no-repeat";

  if (!embedUrl) {
    return (
      <div className={`overflow-hidden rounded-[inherit] border border-white/10 bg-black ${className}`}>
        <div className="aspect-video w-full bg-[var(--surface-primary)]">
          <div className={`h-full w-full bg-center ${posterFitClass}`} style={posterUrl ? { backgroundImage: `url('${posterUrl}')` } : undefined} role="img" aria-label={title} />
        </div>
      </div>
    );
  }

  if (playing) {
    const origin = typeof window !== "undefined" ? `&origin=${encodeURIComponent(window.location.origin)}` : "";
    return (
      <div className={`overflow-hidden rounded-[inherit] border border-white/10 bg-black ${className}`}>
        <div className="aspect-video w-full bg-black">
          <iframe
            src={`${embedUrl}&autoplay=1&controls=1&fs=1&rel=0&playsinline=1${origin}`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="block h-full w-full border-0"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-[inherit] border border-white/10 bg-[var(--surface-primary)] ${className}`}>
      <div className="flex min-h-11 items-center justify-between gap-3 border-b border-[var(--accent-primary)]/30 bg-[#030a14] px-4 py-2.5">
        <div className="min-w-0 border-l-2 border-[var(--accent-primary)] pl-3">
          <p className="truncate text-[10px] font-semibold uppercase tracking-[.18em] text-white">Lucky Saroj</p>
          <p className="truncate text-[8px] uppercase tracking-[.2em] text-white/60">Video Editor</p>
        </div>
        <span className="shrink-0 text-[9px] uppercase tracking-[.18em] text-white/55">Play · Edit · Create</span>
      </div>
      <button type="button" onClick={() => setPlaying(true)} className="group relative block aspect-video w-full overflow-hidden bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--focus)]" aria-label={`Play ${title} inline`}>
        <div className={`absolute inset-0 bg-center ${posterFitClass} transition-transform duration-500 group-hover:scale-[1.01]`} style={posterUrl ? { backgroundImage: `url('${posterUrl}')` } : undefined} role="img" aria-label={title} />
        <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/35 bg-black/65 text-white shadow-lg sm:h-14 sm:w-14">
          <Play size={20} fill="currentColor" />
        </span>
      </button>
    </div>
  );
}
