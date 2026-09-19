"use client";

import { Play } from "lucide-react";
import { useState } from "react";
import { getVideoSource } from "@/lib/media/video";

type PosterFit = "cover" | "project-banner";
type MobileAspect = "standard" | "comfortable";

export function VideoPlayer({
  videoUrl,
  posterUrl,
  title,
  className = "",
  posterFit = "cover",
  mobileAspect = "standard",
}: {
  videoUrl?: string | null;
  posterUrl?: string | null;
  title: string;
  className?: string;
  posterFit?: PosterFit;
  mobileAspect?: MobileAspect;
}) {
  const [playing, setPlaying] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [driveReady, setDriveReady] = useState(false);
  const source = getVideoSource(videoUrl);
  const posterFitClass = posterFit === "project-banner"
    ? "bg-contain bg-no-repeat"
    : "bg-cover bg-no-repeat";
  const mediaAspectClass = source?.provider === "google-drive" && mobileAspect === "comfortable"
    ? "aspect-[4/3] sm:aspect-video"
    : "aspect-video";

  function retry() {
    setLoadError(false);
    setDriveReady(false);
    setRetryKey((value) => value + 1);
  }

  const loadFailure = (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black px-6 text-center text-white">
      <p className="text-sm text-white/80">Video could not be loaded in this page.</p>
      <button
        type="button"
        onClick={retry}
        className="rounded-full border border-[var(--accent-primary)]/50 px-4 py-2 text-xs font-semibold uppercase tracking-[.14em] text-[var(--accent-hover)] transition hover:border-[var(--accent-primary)]"
      >
        Retry video
      </button>
    </div>
  );

  let media;
  if (source?.provider === "google-drive") {
    media = loadError ? loadFailure : (
      <>
        <iframe
          key={retryKey}
          src={source.embedUrl}
          title={`${title} video`}
          allow="autoplay; fullscreen"
          allowFullScreen
          loading="eager"
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => setDriveReady(true)}
          onError={() => setLoadError(true)}
          className="absolute inset-0 block h-full w-full border-0 bg-black"
        />
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-[#030a14] transition-opacity duration-300 ${driveReady ? "opacity-0" : "opacity-100"}`}
        >
          <div
            className={`absolute inset-0 bg-center ${posterFitClass}`}
            style={posterUrl ? { backgroundImage: `url('${posterUrl}')` } : undefined}
          />
          <span className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[var(--accent-primary)]/60 bg-[#030a14]/85 shadow-lg sm:h-12 sm:w-12">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-[var(--accent-primary)]" />
          </span>
        </div>
      </>
    );
  } else if (playing && source && loadError) {
    media = loadFailure;
  } else if (playing && source?.provider === "youtube") {
    media = (
      <iframe
        key={retryKey}
        src={`${source.embedUrl}&autoplay=1&controls=1&fs=1&iv_load_policy=3`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        onError={() => setLoadError(true)}
        className="absolute inset-0 block h-full w-full border-0"
      />
    );
  } else if (playing && source?.provider === "direct") {
    media = (
      <video
        key={retryKey}
        src={source.mediaUrl}
        controls
        playsInline
        autoPlay
        preload="metadata"
        aria-label={title}
        onError={() => setLoadError(true)}
        className="absolute inset-0 block h-full w-full object-contain"
      />
    );
  } else {
    media = (
      <button
        type="button"
        onClick={() => {
          if (!source) return;
          setLoadError(false);
          setPlaying(true);
        }}
        disabled={!source}
        className="group absolute inset-0 block h-full w-full overflow-hidden bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--focus)] disabled:cursor-default"
        aria-label={source ? `Play ${title} inline` : title}
      >
        <div
          className={`absolute inset-0 bg-center ${posterFitClass} transition-transform duration-500 group-hover:scale-[1.01]`}
          style={posterUrl ? { backgroundImage: `url('${posterUrl}')` } : undefined}
          role="img"
          aria-label={title}
        />
        {source ? (
          <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/90 bg-black/60 text-white shadow-lg sm:h-16 sm:w-16">
            <Play size={22} fill="currentColor" />
          </span>
        ) : null}
      </button>
    );
  }

  return (
    <div className={`min-w-0 overflow-hidden rounded-[inherit] border border-white/10 bg-[#030a14] ${className}`}>
      <div className="flex min-h-9 items-center justify-between gap-2 border-b border-white/10 px-3 py-2 sm:min-h-11 sm:gap-3 sm:px-5 sm:py-2.5">
        <div className="min-w-0 border-l-2 border-[var(--accent-primary)] pl-2.5 sm:pl-3">
          <p className="truncate text-[9px] font-semibold uppercase tracking-[.16em] text-white sm:text-xs sm:tracking-[.18em]">Lucky Saroj</p>
          <p className="truncate text-[7px] uppercase tracking-[.18em] text-white/60 sm:text-[9px] sm:tracking-[.2em]">Video Editor</p>
        </div>
        <span className="shrink-0 text-[7px] font-semibold uppercase tracking-[.12em] text-[var(--accent-hover)] sm:text-[9px] sm:tracking-[.18em]">Play · Edit · Create</span>
      </div>

      <div className={`relative w-full overflow-hidden bg-black ${mediaAspectClass}`}>
        {media}
      </div>

      <div className="flex min-h-8 items-center justify-between gap-3 border-t border-white/10 px-3 py-2 sm:min-h-10 sm:gap-4 sm:px-5 sm:py-2.5">
        <span className="h-0.5 w-16 shrink-0 bg-[var(--accent-primary)] sm:w-24" aria-hidden="true" />
        <span className="truncate text-[7px] font-semibold uppercase tracking-[.14em] text-white/55 sm:text-[9px] sm:tracking-[.18em]">Cinematic Edit</span>
      </div>
    </div>
  );
}
