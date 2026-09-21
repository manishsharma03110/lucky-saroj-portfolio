"use client";

import type { ReactNode } from "react";
import { getVideoSource, type VideoOrientation } from "@/lib/media/video";
import { useGlobalVideoPlayer } from "@/components/ui/GlobalVideoPlayer";

export function VideoLaunchSurface({
  videoUrl,
  title,
  posterUrl,
  orientation = "auto",
  className = "",
  children,
}: {
  videoUrl: string;
  title: string;
  posterUrl?: string | null;
  orientation?: VideoOrientation;
  className?: string;
  children: ReactNode;
}) {
  const { openVideo } = useGlobalVideoPlayer();
  const playable = Boolean(getVideoSource(videoUrl));

  return (
    <button
      type="button"
      disabled={!playable}
      onClick={() => {
        if (!playable) return;
        openVideo({ videoUrl, title, posterUrl, orientation });
      }}
      className={`group block text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] disabled:cursor-default ${className}`}
      aria-label={playable ? `Play ${title}` : title}
    >
      {children}
    </button>
  );
}
