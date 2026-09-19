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
  const posterFitClass = posterFit === "project-banner"
    ? "bg-contain bg-no-repeat"
    : "bg-cover bg-no-repeat";

  const media = playing && embedUrl ? (
    <iframe
      src={`${embedUrl}&autoplay=1&controls=0&fs=0&iv_load_policy=3&disablekb=1`}
      title={title}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
      className="absolute inset-0 block h-full w-full border-0"
    />
  ) : (
    <button
      type="button"
      onClick={() => embedUrl && setPlaying(true)}
      disabled={!embedUrl}
      className="group absolute inset-0 block h-full w-full overflow-hidden bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--focus)] disabled:cursor-default"
      aria-label={embedUrl ? `Play ${title} inline` : title}
    >
      <div
        className={`absolute inset-0 bg-center ${posterFitClass} transition-transform duration-500 group-hover:scale-[1.01]`}
        style={posterUrl ? { backgroundImage: `url('${posterUrl}')` } : undefined}
        role="img"
        aria-label={title}
      />
      {embedUrl ? (
        <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/90 bg-black/60 text-white shadow-lg sm:h-16 sm:w-16">
          <Play size={22} fill="currentColor" />
        </span>
      ) : null}
    </button>
  );

  return (
    <div className={`overflow-hidden rounded-[inherit] border border-white/10 bg-[#030a14] ${className}`}>
      <div className="flex min-h-11 items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5 sm:px-5">
        <div className="min-w-0 border-l-2 border-[var(--accent-primary)] pl-3">
          <p className="truncate text-[10px] font-semibold uppercase tracking-[.18em] text-white sm:text-xs">Lucky Saroj</p>
          <p className="truncate text-[8px] uppercase tracking-[.2em] text-white/60 sm:text-[9px]">Video Editor</p>
        </div>
        <span className="shrink-0 text-[8px] font-semibold uppercase tracking-[.16em] text-[var(--accent-hover)] sm:text-[9px] sm:tracking-[.18em]">Play · Edit · Create</span>
      </div>

      <div className="relative aspect-video w-full bg-black">
        {media}
      </div>

      <div className="flex min-h-10 items-center justify-between gap-4 border-t border-white/10 px-4 py-2.5 sm:px-5">
        <span className="h-0.5 w-20 shrink-0 bg-[var(--accent-primary)] sm:w-24" aria-hidden="true" />
        <span className="truncate text-[8px] font-semibold uppercase tracking-[.18em] text-white/55 sm:text-[9px]">Cinematic Edit</span>
      </div>
    </div>
  );
}
