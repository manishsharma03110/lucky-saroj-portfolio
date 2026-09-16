"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { getYouTubeEmbedUrl } from "@/lib/media/youtube";

export function VideoPlayer({ videoUrl, posterUrl, title, className = "" }: { videoUrl?: string | null; posterUrl?: string | null; title: string; className?: string }) {
  const [playing, setPlaying] = useState(false);
  const embedUrl = getYouTubeEmbedUrl(videoUrl);

  if (!embedUrl) return <div className={`flex items-center justify-center bg-[var(--color-ink)] ${className}`}><div className="h-full w-full bg-cover bg-center opacity-70" style={posterUrl ? { backgroundImage: `url('${posterUrl}')` } : undefined} role="img" aria-label={title} /></div>;

  if (playing) return <div className={`relative overflow-hidden bg-black ${className}`}><iframe src={`${embedUrl}&autoplay=1`} title={title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin" className="h-full w-full border-0" /></div>;

  return <button type="button" onClick={() => setPlaying(true)} className={`group relative block w-full overflow-hidden bg-[var(--color-ink)] ${className}`} aria-label={`Play ${title}`}><div className="h-full w-full bg-cover bg-center opacity-90 transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none" style={posterUrl ? { backgroundImage: `url('${posterUrl}')` } : undefined} role="img" aria-label={title} /><div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/30 motion-reduce:transition-none"><span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-[var(--color-ink)] shadow-lg"><Play size={20} fill="currentColor" /></span></div></button>;
}
