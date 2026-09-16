"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Square } from "lucide-react";
import { getYouTubeEmbedUrl } from "@/lib/media/youtube";

type YouTubePlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  destroy: () => void;
};

type YouTubeWindow = Window & {
  YT?: { Player: new (element: HTMLIFrameElement) => YouTubePlayer };
  onYouTubeIframeAPIReady?: () => void;
};

let youtubeApiPromise: Promise<void> | null = null;

function loadYouTubeApi() {
  if (typeof window === "undefined") return Promise.resolve();
  const youtubeWindow = window as YouTubeWindow;
  if (youtubeWindow.YT?.Player) return Promise.resolve();
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise<void>((resolve) => {
    const previousReady = youtubeWindow.onYouTubeIframeAPIReady;
    youtubeWindow.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      resolve();
    };

    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.head.appendChild(script);
    }
  });

  return youtubeApiPromise;
}

const controlClass = "group relative flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/75 text-white shadow-lg backdrop-blur-sm transition hover:border-[var(--accent-primary)]/70 hover:bg-black/90 hover:text-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-45";

function ControlButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled: boolean; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} disabled={disabled} className={controlClass} aria-label={label} title={label}>{children}</button>;
}

export function VideoPlayer({ videoUrl, posterUrl, title, className = "" }: { videoUrl?: string | null; posterUrl?: string | null; title: string; className?: string }) {
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const embedUrl = getYouTubeEmbedUrl(videoUrl);

  useEffect(() => {
    if (!playing || !iframeRef.current) return;
    let cancelled = false;
    let player: YouTubePlayer | null = null;

    void loadYouTubeApi().then(() => {
      if (cancelled || !iframeRef.current) return;
      const youtubeWindow = window as YouTubeWindow;
      if (!youtubeWindow.YT?.Player) return;
      player = new youtubeWindow.YT.Player(iframeRef.current);
      playerRef.current = player;
      setReady(true);
    });

    return () => {
      cancelled = true;
      setReady(false);
      playerRef.current = null;
      player?.destroy();
    };
  }, [playing]);

  if (!embedUrl) return <div className={`flex items-center justify-center bg-[var(--color-ink)] ${className}`}><div className="h-full w-full bg-cover bg-center opacity-70" style={posterUrl ? { backgroundImage: `url('${posterUrl}')` } : undefined} role="img" aria-label={title} /></div>;

  if (playing) {
    const origin = typeof window !== "undefined" ? `&origin=${encodeURIComponent(window.location.origin)}` : "";
    return <div className={`relative overflow-hidden bg-black ${className}`}>
      <iframe ref={iframeRef} src={`${embedUrl}&enablejsapi=1&autoplay=1${origin}`} title={title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin" className="h-full w-full border-0" />
      <div className="absolute bottom-12 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/10 bg-black/45 p-1.5 shadow-xl backdrop-blur-md sm:gap-2" role="group" aria-label={`${title} playback controls`}>
        <ControlButton label="Play" disabled={!ready} onClick={() => playerRef.current?.playVideo()}><Play size={15} fill="currentColor" /></ControlButton>
        <ControlButton label="Pause" disabled={!ready} onClick={() => playerRef.current?.pauseVideo()}><Pause size={15} fill="currentColor" /></ControlButton>
        <ControlButton label="Stop" disabled={!ready} onClick={() => { const player = playerRef.current; if (!player) return; player.stopVideo(); player.seekTo(0, true); player.pauseVideo(); }}><Square size={14} fill="currentColor" /></ControlButton>
        <ControlButton label="Restart" disabled={!ready} onClick={() => { const player = playerRef.current; if (!player) return; player.seekTo(0, true); player.playVideo(); }}><RotateCcw size={15} /></ControlButton>
      </div>
    </div>;
  }

  return <button type="button" onClick={() => setPlaying(true)} className={`group relative block w-full overflow-hidden bg-[var(--color-ink)] ${className}`} aria-label={`Play ${title}`}><div className="h-full w-full bg-cover bg-center opacity-90 transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none" style={posterUrl ? { backgroundImage: `url('${posterUrl}')` } : undefined} role="img" aria-label={title} /><div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/30 motion-reduce:transition-none"><span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-[var(--color-ink)] shadow-lg"><Play size={20} fill="currentColor" /></span></div></button>;
}
