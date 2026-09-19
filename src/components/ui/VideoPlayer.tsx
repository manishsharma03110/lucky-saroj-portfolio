"use client";

import { Clapperboard, Film, Play, Scissors, Video } from "lucide-react";
import { useState } from "react";
import { getYouTubeEmbedUrl } from "@/lib/media/youtube";

type PosterFit = "cover" | "project-banner";

function ToolPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border border-sky-400/55 bg-[#030a14]/50 px-3 py-2 shadow-[0_0_20px_rgba(14,165,233,0.12)] backdrop-blur-sm sm:gap-4 sm:px-4 sm:py-3 ${className}`}
      aria-hidden="true"
    >
      {children}
    </div>
  );
}

function ToolIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-7 w-7 items-center justify-center text-sky-300 sm:h-8 sm:w-8">
      {children}
    </span>
  );
}

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
      src={`${embedUrl}&autoplay=1&controls=1&fs=1&iv_load_policy=3`}
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

      <div className="absolute inset-0 bg-gradient-to-b from-black/12 via-transparent to-black/18" aria-hidden="true" />

      <ToolPanel className="absolute left-3 top-3 sm:left-4 sm:top-4">
        <ToolIcon><Clapperboard size={22} strokeWidth={1.7} /></ToolIcon>
        <span className="h-6 w-px bg-white/20" />
        <ToolIcon><Film size={22} strokeWidth={1.7} /></ToolIcon>
        <span className="h-6 w-px bg-white/20" />
        <ToolIcon><Scissors size={22} strokeWidth={1.7} /></ToolIcon>
      </ToolPanel>

      <ToolPanel className="absolute right-3 top-3 sm:right-4 sm:top-4">
        <ToolIcon><Video size={22} strokeWidth={1.7} /></ToolIcon>
        <span className="h-6 w-px bg-white/20" />
        <ToolIcon><Film size={22} strokeWidth={1.7} /></ToolIcon>
      </ToolPanel>

      <ToolPanel className="absolute bottom-3 right-3 px-2.5 py-2 sm:bottom-4 sm:right-4 sm:px-3">
        <ToolIcon><Clapperboard size={22} strokeWidth={1.7} /></ToolIcon>
      </ToolPanel>

      {embedUrl ? (
        <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/90 bg-black/45 text-white shadow-lg sm:h-16 sm:w-16">
          <Play size={22} fill="currentColor" />
        </span>
      ) : null}
    </button>
  );

  return (
    <div className={`overflow-hidden rounded-[12px] border border-sky-400/30 bg-[#030a14] shadow-[0_0_0_1px_rgba(56,189,248,0.05)] ${className}`}>
      <div className="flex min-h-12 items-center justify-between gap-3 border-b border-sky-400/25 bg-[#030a14] px-4 py-2.5 sm:min-h-14 sm:px-5">
        <div className="min-w-0 border-l-2 border-sky-400 pl-3">
          <p className="truncate text-[10px] font-semibold uppercase tracking-[.18em] text-white sm:text-xs">Lucky Saroj</p>
          <p className="truncate text-[8px] uppercase tracking-[.2em] text-white/60 sm:text-[9px]">Video Editor</p>
        </div>
        <span className="shrink-0 text-[8px] font-semibold uppercase tracking-[.16em] text-sky-400 sm:text-[9px] sm:tracking-[.18em]">Play · Edit · Create</span>
      </div>

      <div className="relative aspect-video w-full bg-black">
        {media}
      </div>

      <div className="flex min-h-12 items-center justify-between gap-4 border-t border-sky-400/25 bg-[#030a14] px-4 py-3 sm:px-5">
        <div className="flex min-w-0 flex-1 items-center gap-2" aria-hidden="true">
          <span className="h-0.5 w-20 shrink-0 bg-sky-400 sm:w-24" />
          <span className="h-px w-full max-w-[220px] bg-white/30" />
        </div>
        <span className="shrink-0 text-[8px] font-semibold uppercase tracking-[.24em] text-white/75 sm:text-[9px]">Project Video</span>
      </div>
    </div>
  );
}
