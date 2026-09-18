"use client";

import { useEffect, useRef, useState } from "react";
import { Maximize, Pause, Play, RotateCcw, Square, Volume1, Volume2, VolumeX } from "lucide-react";
import { getYouTubeEmbedUrl } from "@/lib/media/youtube";

type YouTubePlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  setVolume: (volume: number) => void;
  getVolume: () => number;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  destroy: () => void;
};

type YouTubeWindow = Window & {
  YT?: { Player: new (element: HTMLIFrameElement) => YouTubePlayer };
  onYouTubeIframeAPIReady?: () => void;
};

type PosterFit = "cover" | "project-banner";

let youtubeApiPromise: Promise<void> | null = null;

function loadYouTubeApi() {
  if (typeof window === "undefined") return Promise.resolve();
  const w = window as YouTubeWindow;
  if (w.YT?.Player) return Promise.resolve();
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise<void>((resolve) => {
    const previous = w.onYouTubeIframeAPIReady;
    w.onYouTubeIframeAPIReady = () => {
      previous?.();
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

const controlClass = "group relative flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black text-white shadow-lg transition hover:border-[var(--accent-primary)]/70 hover:text-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] disabled:cursor-not-allowed disabled:opacity-45 sm:h-9 sm:w-9";

function ControlButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return <button type="button" onClick={onClick} disabled={disabled} className={controlClass} aria-label={label} title={label}>{children}</button>;
}

function CinematicFrame({
  title,
  children,
  controls,
}: {
  title: string;
  children: React.ReactNode;
  controls?: React.ReactNode;
}) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[inherit] border border-[var(--accent-primary)]/35 bg-black">
      {children}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[54px] border-b border-[var(--accent-primary)]/55 bg-[#030a14] opacity-100 sm:h-[62px]">
        <div className="flex h-full items-center justify-between gap-3 px-3 sm:px-5">
          <div className="min-w-0 border-l-2 border-[var(--accent-primary)] pl-2.5 sm:pl-3">
            <p className="truncate text-[9px] font-semibold uppercase tracking-[.18em] text-white sm:text-[11px]">Lucky Saroj</p>
            <p className="truncate text-[7px] uppercase tracking-[.22em] text-white/65 sm:text-[9px]">Video Editor</p>
          </div>
          <p className="hidden max-w-[42%] truncate text-[9px] uppercase tracking-[.22em] text-white/65 sm:block">{title}</p>
          <div className="flex shrink-0 items-center gap-1.5 text-[7px] uppercase tracking-[.18em] text-white/65 sm:text-[9px]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-primary)]" />
            <span>Play · Edit · Create</span>
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[56px] border-t border-[var(--accent-primary)]/55 bg-[#030a14] opacity-100 sm:h-[66px]">
        <div className="flex h-full items-center px-3 sm:px-5">
          <div className="h-px flex-1 bg-white/10"><div className="h-px w-1/3 bg-[var(--accent-primary)]" /></div>
          <span className="ml-3 text-[7px] uppercase tracking-[.2em] text-white/55 sm:text-[9px]">Cinematic Edit</span>
        </div>
      </div>
      {controls ? (
        <div className="absolute bottom-2 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/15 bg-black p-1 shadow-xl sm:bottom-3 sm:gap-1.5" role="group" aria-label={`${title} playback controls`}>
          {controls}
        </div>
      ) : null}
      <span className="pointer-events-none absolute left-2 top-[62px] z-20 h-3 w-3 border-l border-t border-[var(--accent-primary)]/60 sm:left-3 sm:top-[70px]" />
      <span className="pointer-events-none absolute right-2 top-[62px] z-20 h-3 w-3 border-r border-t border-[var(--accent-primary)]/60 sm:right-3 sm:top-[70px]" />
    </div>
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
  const [ready, setReady] = useState(false);
  const [volume, setVolume] = useState(100);
  const [muted, setMuted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const embedUrl = getYouTubeEmbedUrl(videoUrl);
  const posterFitClass = posterFit === "project-banner" ? "bg-contain bg-no-repeat lg:bg-cover" : "bg-cover";

  useEffect(() => {
    if (!playing || !iframeRef.current) return;
    let cancelled = false;
    let player: YouTubePlayer | null = null;

    void loadYouTubeApi().then(() => {
      if (cancelled || !iframeRef.current) return;
      const w = window as YouTubeWindow;
      if (!w.YT?.Player) return;
      player = new w.YT.Player(iframeRef.current);
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

  if (!embedUrl) {
    return (
      <div className={`flex items-center justify-center bg-[var(--color-ink)] ${className}`}>
        <div className={`h-full w-full bg-center ${posterFitClass} opacity-70`} style={posterUrl ? { backgroundImage: `url('${posterUrl}')` } : undefined} role="img" aria-label={title} />
      </div>
    );
  }

  if (playing) {
    const origin = typeof window !== "undefined" ? `&origin=${encodeURIComponent(window.location.origin)}` : "";
    const toggleMute = () => {
      const p = playerRef.current;
      if (!p) return;
      if (p.isMuted()) {
        p.unMute();
        setMuted(false);
      } else {
        p.mute();
        setMuted(true);
      }
    };
    const changeVolume = (value: number) => {
      const p = playerRef.current;
      if (!p) return;
      p.setVolume(value);
      if (value > 0 && p.isMuted()) p.unMute();
      setVolume(value);
      setMuted(value === 0);
    };
    const enterFullscreen = () => {
      const el = frameRef.current;
      if (!el) return;
      if (document.fullscreenElement) {
        void document.exitFullscreen();
      } else {
        void el.requestFullscreen();
      }
    };
    const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 55 ? Volume1 : Volume2;
    const controls = (
      <>
        <ControlButton label="Play" disabled={!ready} onClick={() => playerRef.current?.playVideo()}><Play size={14} fill="currentColor" /></ControlButton>
        <ControlButton label="Pause" disabled={!ready} onClick={() => playerRef.current?.pauseVideo()}><Pause size={14} fill="currentColor" /></ControlButton>
        <ControlButton label="Stop" disabled={!ready} onClick={() => { const p = playerRef.current; if (!p) return; p.stopVideo(); p.seekTo(0, true); p.pauseVideo(); }}><Square size={13} fill="currentColor" /></ControlButton>
        <ControlButton label="Restart" disabled={!ready} onClick={() => { const p = playerRef.current; if (!p) return; p.seekTo(0, true); p.playVideo(); }}><RotateCcw size={14} /></ControlButton>
        <ControlButton label={muted ? "Unmute" : "Mute"} disabled={!ready} onClick={toggleMute}><VolumeIcon size={15} /></ControlButton>
        <label className="hidden items-center sm:flex" aria-label="Volume">
          <input type="range" min="0" max="100" step="5" value={muted ? 0 : volume} disabled={!ready} onChange={(event) => changeVolume(Number(event.target.value))} className="h-8 w-20 cursor-pointer accent-[var(--accent-primary)] disabled:cursor-not-allowed disabled:opacity-45" title="Volume" />
        </label>
        <ControlButton label="Fullscreen" disabled={!ready} onClick={enterFullscreen}><Maximize size={15} /></ControlButton>
      </>
    );

    return (
      <div ref={frameRef} className={`relative overflow-hidden bg-black ${className}`}>
        <CinematicFrame title={title} controls={controls}>
          <div className="absolute inset-x-0 bottom-[56px] top-[54px] overflow-hidden bg-black sm:bottom-[66px] sm:top-[62px]">
            <iframe
              ref={iframeRef}
              src={`${embedUrl}&enablejsapi=1&autoplay=1&controls=0&fs=1&rel=0&iv_load_policy=3&playsinline=1${origin}`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              className="absolute left-1/2 top-1/2 h-[124%] w-[124%] max-w-none -translate-x-1/2 -translate-y-1/2 border-0"
            />
          </div>
        </CinematicFrame>
      </div>
    );
  }

  return (
    <button type="button" onClick={() => setPlaying(true)} className={`group relative block w-full overflow-hidden bg-[var(--color-ink)] ${className}`} aria-label={`Play ${title}`}>
      <CinematicFrame title={title}>
        <div className={`h-full w-full bg-center ${posterFitClass} opacity-90 transition-transform duration-500 group-hover:scale-[1.02]`} style={posterUrl ? { backgroundImage: `url('${posterUrl}')` } : undefined} role="img" aria-label={title} />
        <div className="absolute inset-0 flex items-center justify-center bg-black/15 group-hover:bg-black/25">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--accent-primary)]/55 bg-black text-white shadow-lg sm:h-14 sm:w-14"><Play size={20} fill="currentColor" /></span>
        </div>
      </CinematicFrame>
    </button>
  );
}
