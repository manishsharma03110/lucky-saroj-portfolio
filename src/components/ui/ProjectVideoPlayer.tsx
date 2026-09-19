"use client";

import { Play } from "lucide-react";
import { useRef, useState } from "react";
import { getYouTubeEmbedUrl, isDirectVideoUrl } from "@/lib/media/youtube";

export type ProjectVideoPlayerProps = Readonly<{
  hostedVideoUrl?: string | null;
  youtubeVideoUrl?: string | null;
  posterUrl?: string | null;
  title: string;
  editorName: string;
  editorRole: string;
  tagline: string;
  bottomLabel: string;
  className?: string;
}>;

export function ProjectVideoPlayer({
  hostedVideoUrl,
  youtubeVideoUrl,
  posterUrl,
  title,
  editorName,
  editorRole,
  tagline,
  bottomLabel,
  className = "",
}: ProjectVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(true);

  const directVideoUrl = isDirectVideoUrl(hostedVideoUrl) ? hostedVideoUrl?.trim() ?? null : null;
  const youtubeEmbedUrl = getYouTubeEmbedUrl(youtubeVideoUrl);
  const canPlay = Boolean(directVideoUrl || youtubeEmbedUrl);
  const origin = typeof window !== "undefined" ? `&origin=${encodeURIComponent(window.location.origin)}` : "";

  function startPlayback() {
    if (!canPlay) return;
    setStarted(true);
  }

  async function resumeHostedVideo() {
    const video = videoRef.current;
    if (!video) return;
    if (video.ended) video.currentTime = 0;
    await video.play().catch(() => undefined);
  }

  return (
    <div className={`overflow-hidden rounded-[12px] border border-sky-400/25 bg-[#030a14] shadow-[0_30px_100px_rgba(0,0,0,0.34)] ${className}`}>
      <div className="flex h-14 items-center justify-between gap-3 border-b border-sky-400/20 bg-[#030a14] px-4 sm:px-5">
        <div className="min-w-0 border-l-2 border-[var(--accent-primary)] pl-3">
          <p className="truncate text-[10px] font-semibold uppercase tracking-[.18em] text-white sm:text-xs">{editorName}</p>
          <p className="truncate text-[8px] uppercase tracking-[.2em] text-white/60 sm:text-[9px]">{editorRole}</p>
        </div>
        <span className="shrink-0 truncate text-[8px] font-semibold uppercase tracking-[.16em] text-[var(--accent-hover)] sm:max-w-[45%] sm:text-[9px] sm:tracking-[.18em]">{tagline}</span>
      </div>

      <div className="relative aspect-video w-full overflow-hidden bg-black">
        {!started ? (
          <button
            type="button"
            onClick={startPlayback}
            disabled={!canPlay}
            className="group absolute inset-0 block h-full w-full overflow-hidden bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--focus)] disabled:cursor-default"
            aria-label={canPlay ? `Play ${title}` : title}
          >
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-[1.01]"
              style={posterUrl ? { backgroundImage: `url('${posterUrl}')` } : undefined}
              role="img"
              aria-label={title}
            />
            {canPlay ? (
              <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/90 bg-black/60 text-white shadow-lg sm:h-16 sm:w-16">
                <Play size={22} fill="currentColor" />
              </span>
            ) : null}
          </button>
        ) : directVideoUrl ? (
          <>
            <video
              ref={videoRef}
              src={directVideoUrl}
              poster={posterUrl ?? undefined}
              autoPlay
              controls
              playsInline
              preload="none"
              controlsList="nodownload noremoteplayback"
              disablePictureInPicture
              onPlay={() => setPaused(false)}
              onPause={() => setPaused(true)}
              onEnded={() => setPaused(true)}
              className="absolute inset-0 block h-full w-full bg-black object-cover"
              aria-label={title}
            />
            {paused ? (
              <button
                type="button"
                onClick={resumeHostedVideo}
                className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/90 bg-black/60 text-white shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] sm:h-16 sm:w-16"
                aria-label={`Resume ${title}`}
              >
                <Play size={22} fill="currentColor" />
              </button>
            ) : null}
          </>
        ) : youtubeEmbedUrl ? (
          <iframe
            src={`${youtubeEmbedUrl}&autoplay=1${origin}`}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 block h-full w-full border-0"
          />
        ) : null}
      </div>

      <div className="flex h-10 items-center justify-between gap-4 border-t border-sky-400/20 bg-[#030a14] px-4 sm:px-5">
        <span className="h-0.5 w-20 shrink-0 bg-[var(--accent-primary)] sm:w-24" aria-hidden="true" />
        <span className="truncate text-[8px] font-semibold uppercase tracking-[.18em] text-white/55 sm:text-[9px]">{bottomLabel}</span>
      </div>
    </div>
  );
}
