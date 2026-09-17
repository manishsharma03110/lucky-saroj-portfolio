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

const controlClass = "group relative flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white shadow-lg backdrop-blur-sm transition hover:border-[var(--accent-primary)]/70 hover:bg-black/90 hover:text-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-45 sm:h-9 sm:w-9";

function ControlButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled: boolean; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} disabled={disabled} className={controlClass} aria-label={label} title={label}>{children}</button>;
}

function CinematicFrame({ title, children, controls }: { title: string; children: React.ReactNode; controls?: React.ReactNode }) {
  return <div className="relative h-full w-full overflow-hidden rounded-[inherit] bg-black">
    {children}
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[46px] border-b border-[var(--accent-primary)]/35 bg-[linear-gradient(180deg,rgba(3,10,20,.96),rgba(3,10,20,.86))] shadow-[0_8px_24px_rgba(0,0,0,.22)] sm:h-[54px]">
      <div className="flex h-full items-center justify-between gap-3 px-3 sm:px-5">
        <div className="min-w-0 border-l-2 border-[var(--accent-primary)] pl-2.5 sm:pl-3">
          <p className="truncate text-[9px] font-semibold uppercase tracking-[0.18em] text-white sm:text-[11px]">Lucky Saroj</p>
          <p className="truncate text-[7px] uppercase tracking-[0.22em] text-white/55 sm:text-[9px]">Video Editor</p>
        </div>
        <p className="hidden max-w-[42%] truncate text-[9px] uppercase tracking-[0.22em] text-white/55 sm:block">{title}</p>
        <div className="flex shrink-0 items-center gap-1.5 text-[7px] uppercase tracking-[0.18em] text-white/55 sm:text-[9px]"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-primary)]" /><span>Play · Edit · Create</span></div>
      </div>
    </div>
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[48px] border-t border-[var(--accent-primary)]/30 bg-[linear-gradient(0deg,rgba(3,10,20,.98),rgba(3,10,20,.88))] sm:h-[58px]">
      <div className="flex h-full items-center px-3 sm:px-5"><div className="h-px flex-1 bg-white/10"><div className="h-px w-1/3 bg-[var(--accent-primary)]" /></div><span className="ml-3 text-[7px] uppercase tracking-[0.2em] text-white/45 sm:text-[9px]">Cinematic Edit</span></div>
    </div>
    {controls ? <div className="absolute bottom-1.5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/10 bg-black/55 p-1 shadow-xl backdrop-blur-md sm:bottom-2 sm:gap-1.5" role="group" aria-label={`${title} playback controls`}>{controls}</div> : null}
    <span className="pointer-events-none absolute left-2 top-[54px] z-10 h-3 w-3 border-l border-t border-[var(--accent-primary)]/45 sm:left-3 sm:top-[62px]" />
    <span className="pointer-events-none absolute right-2 top-[54px] z-10 h-3 w-3 border-r border-t border-[var(--accent-primary)]/45 sm:right-3 sm:top-[62px]" />
  </div>;
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
    const controls = <><ControlButton label="Play" disabled={!ready} onClick={() => playerRef.current?.playVideo()}><Play size={14} fill="currentColor" /></ControlButton><ControlButton label="Pause" disabled={!ready} onClick={() => playerRef.current?.pauseVideo()}><Pause size={14} fill="currentColor" /></ControlButton><ControlButton label="Stop" disabled={!ready} onClick={() => { const player = playerRef.current; if (!player) return; player.stopVideo(); player.seekTo(0, true); player.pauseVideo(); }}><Square size={13} fill="currentColor" /></ControlButton><ControlButton label="Restart" disabled={!ready} onClick={() => { const player = playerRef.current; if (!player) return; player.seekTo(0, true); player.playVideo(); }}><RotateCcw size={14} /></ControlButton></>;
    return <div className={`relative overflow-hidden bg-black ${className}`}><CinematicFrame title={title} controls={controls}><iframe ref={iframeRef} src={`${embedUrl}&enablejsapi=1&autoplay=1${origin}`} title={title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin" className="h-full w-full border-0" /></CinematicFrame></div>;
  }

  return <button type="button" onClick={() => setPlaying(true)} className={`group relative block w-full overflow-hidden bg-[var(--color-ink)] ${className}`} aria-label={`Play ${title}`}><CinematicFrame title={title}><div className="h-full w-full bg-cover bg-center opacity-90 transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:transition-none" style={posterUrl ? { backgroundImage: `url('${posterUrl}')` } : undefined} role="img" aria-label={title} /><div className="absolute inset-0 flex items-center justify-center bg-black/15 transition-colors group-hover:bg-black/25 motion-reduce:transition-none"><span className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--accent-primary)]/45 bg-black/70 text-white shadow-lg backdrop-blur-sm sm:h-14 sm:w-14"><Play size={20} fill="currentColor" /></span></div></CinematicFrame></button>;
}
