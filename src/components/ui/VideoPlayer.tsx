"use client";

import { useState } from "react";
import { Play } from "lucide-react";

function getEmbedUrl(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1`;

  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1`;

  return null;
}

export function VideoPlayer({
  videoUrl,
  posterUrl,
  title,
  className = "",
}: {
  videoUrl?: string | null;
  posterUrl?: string | null;
  title: string;
  className?: string;
}) {
  const [playing, setPlaying] = useState(false);

  if (!videoUrl) {
    return (
      <div className={`flex items-center justify-center bg-[var(--color-ink)] ${className}`}>
        <div
          className="h-full w-full bg-cover bg-center opacity-70"
          style={posterUrl ? { backgroundImage: `url('${posterUrl}')` } : undefined}
          role="img"
          aria-label={title}
        />
      </div>
    );
  }

  const embedUrl = getEmbedUrl(videoUrl);

  if (playing) {
    if (embedUrl) {
      return (
        <div className={`relative overflow-hidden bg-black ${className}`}>
          <iframe
            src={embedUrl}
            title={title}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      );
    }
    return (
      <div className={`relative overflow-hidden bg-black ${className}`}>
        <video src={videoUrl} controls autoPlay poster={posterUrl ?? undefined} className="h-full w-full">
          <track kind="captions" />
        </video>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className={`group relative block w-full overflow-hidden bg-[var(--color-ink)] ${className}`}
      aria-label={`Play ${title}`}
    >
      <div
        className="h-full w-full bg-cover bg-center opacity-90 transition-transform duration-500 group-hover:scale-105"
        style={posterUrl ? { backgroundImage: `url('${posterUrl}')` } : undefined}
        role="img"
        aria-label={title}
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/30">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-[var(--color-ink)] shadow-lg">
          <Play size={20} fill="currentColor" />
        </span>
      </div>
    </button>
  );
}