"use client";

import { ExternalLink, Link2, Pause, Play, Volume2, VolumeX, X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getVideoSource, normalizeVideoOrientation, type VideoOrientation } from "@/lib/media/video";

type GlobalVideoRequest = {
  videoUrl: string;
  title: string;
  posterUrl?: string | null;
  orientation?: VideoOrientation;
};

type PlayerContextValue = {
  openVideo: (request: GlobalVideoRequest) => void;
  closeVideo: () => void;
  active: boolean;
};

type PinterestWindow = Window & {
  PinUtils?: { build?: () => void };
};

const GlobalVideoContext = createContext<PlayerContextValue | null>(null);

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function DirectVideo({
  src,
  posterUrl,
  title,
}: {
  src: string;
  posterUrl?: string | null;
  title: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlayback = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) await video.play().catch(() => setPaused(true));
    else video.pause();
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <video
        ref={videoRef}
        src={src}
        poster={posterUrl || undefined}
        autoPlay
        playsInline
        preload="metadata"
        controls={false}
        disablePictureInPicture
        controlsList="nodownload noplaybackrate noremoteplayback"
        aria-label={title}
        onClick={togglePlayback}
        onLoadedMetadata={(event) => {
          const video = event.currentTarget;
          setDuration(Number.isFinite(video.duration) ? video.duration : 0);
          void video.play().catch(() => setPaused(true));
        }}
        onDurationChange={(event) => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onPlay={() => setPaused(false)}
        onPause={() => setPaused(true)}
        onEnded={() => setPaused(true)}
        onVolumeChange={(event) => setMuted(event.currentTarget.muted)}
        className="absolute inset-0 h-full w-full cursor-pointer bg-black object-contain"
      />

      {paused ? (
        <button
          type="button"
          onClick={togglePlayback}
          className="absolute left-1/2 top-1/2 z-20 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/55 bg-black/70 text-white shadow-[0_12px_40px_rgba(0,0,0,.45)] backdrop-blur-md transition hover:scale-105 hover:border-[var(--accent-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] sm:h-16 sm:w-16"
          aria-label={`Play ${title}`}
        >
          <Play size={24} fill="currentColor" className="ml-0.5" />
        </button>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black via-black/75 to-transparent px-3 pb-3 pt-12 sm:px-5 sm:pb-5 sm:pt-16">
        <input
          type="range"
          min={0}
          max={duration > 0 ? duration : 1}
          step={0.05}
          value={duration > 0 ? Math.min(currentTime, duration) : 0}
          onChange={(event) => {
            const video = videoRef.current;
            if (!video || duration <= 0) return;
            const next = Number(event.target.value);
            video.currentTime = next;
            setCurrentTime(next);
          }}
          aria-label="Video progress"
          className="block h-1.5 w-full cursor-pointer accent-[var(--accent-primary)]"
        />
        <div className="mt-3 flex items-center gap-2.5 text-white sm:gap-3">
          <button
            type="button"
            onClick={togglePlayback}
            className="flex h-9 w-9 items-center justify-center rounded-md transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
            aria-label={paused ? "Play video" : "Pause video"}
          >
            {paused ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />}
          </button>
          <button
            type="button"
            onClick={toggleMute}
            className="flex h-9 w-9 items-center justify-center rounded-md transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
            aria-label={muted ? "Unmute video" : "Mute video"}
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <span className="min-w-0 text-[10px] tabular-nums text-white/70 sm:text-xs">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}

function PinterestPinEmbed({ pinUrl, title }: { pinUrl: string; title: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.replaceChildren();
    const anchor = document.createElement("a");
    anchor.href = pinUrl;
    anchor.setAttribute("data-pin-do", "embedPin");
    anchor.setAttribute("aria-label", title);
    container.appendChild(anchor);

    const build = () => {
      const pinterestWindow = window as PinterestWindow;
      pinterestWindow.PinUtils?.build?.();
      window.setTimeout(() => setLoaded(true), 250);
    };

    const selector = 'script[data-portfolio-pinterest="true"]';
    const existing = document.querySelector<HTMLScriptElement>(selector);
    if (existing) {
      if ((window as PinterestWindow).PinUtils?.build) build();
      else existing.addEventListener("load", build, { once: true });
      return () => existing.removeEventListener("load", build);
    }

    const script = document.createElement("script");
    script.src = "https://assets.pinterest.com/js/pinit.js";
    script.async = true;
    script.defer = true;
    script.dataset.portfolioPinterest = "true";
    script.addEventListener("load", build, { once: true });
    document.body.appendChild(script);

    return () => script.removeEventListener("load", build);
  }, [pinUrl, title]);

  return (
    <div className="absolute inset-0 overflow-y-auto bg-black px-3 py-16 sm:px-6 sm:py-14">
      <div className="mx-auto flex min-h-full w-full max-w-[720px] items-center justify-center">
        <div className="relative w-full rounded-xl border border-white/10 bg-[var(--surface-primary)] p-4 text-center shadow-[0_30px_100px_rgba(0,0,0,.7)] sm:p-6">
          {!loaded ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-[var(--surface-primary)]">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[var(--accent-primary)]" aria-label="Loading Pinterest video" />
            </div>
          ) : null}
          <div ref={containerRef} className="mx-auto flex min-h-[320px] w-full items-center justify-center" />
          <a
            href={pinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent-hover)] hover:text-white"
          >
            Open on Pinterest <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}

function ExternalVideoFallback({ pageUrl, title }: { pageUrl: string; title: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black p-5 sm:p-10">
      <div className="w-full max-w-lg rounded-xl border border-white/10 bg-[var(--surface-primary)] p-6 text-center shadow-[0_30px_100px_rgba(0,0,0,.7)] sm:p-8">
        <Link2 size={30} className="mx-auto text-[var(--accent-primary)]" />
        <h2 className="mt-4 text-xl font-semibold text-white sm:text-2xl">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
          This video URL is saved in the CMS, but this provider does not expose a reliable embeddable player. Open the source directly without losing the project page.
        </p>
        <a
          href={pageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--accent-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)]"
        >
          Open video source <ExternalLink size={16} />
        </a>
      </div>
    </div>
  );
}

export function GlobalVideoPlayerProvider({ children }: { children: ReactNode }) {
  const historyEntryRef = useRef(false);
  const [request, setRequest] = useState<GlobalVideoRequest | null>(null);
  const source = useMemo(() => getVideoSource(request?.videoUrl), [request?.videoUrl]);
  const active = Boolean(request && source);

  const resetPlayer = useCallback(() => {
    setRequest(null);
  }, []);

  const closeVideo = useCallback(() => {
    if (typeof window !== "undefined" && historyEntryRef.current) {
      historyEntryRef.current = false;
      window.history.back();
    }
    resetPlayer();
  }, [resetPlayer]);

  const openVideo = useCallback((next: GlobalVideoRequest) => {
    if (!getVideoSource(next.videoUrl)) return;

    if (typeof window !== "undefined" && !historyEntryRef.current) {
      window.history.pushState({ ...(window.history.state ?? {}), portfolioVideoPlayer: true }, "", window.location.href);
      historyEntryRef.current = true;
    }

    setRequest({ ...next, orientation: normalizeVideoOrientation(next.orientation) });
  }, []);

  useEffect(() => {
    if (!active) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeVideo();
    };
    const onPopState = () => {
      historyEntryRef.current = false;
      resetPlayer();
    };

    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("popstate", onPopState);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("popstate", onPopState);
    };
  }, [active, closeVideo, resetPlayer]);

  return (
    <GlobalVideoContext.Provider value={{ openVideo, closeVideo, active }}>
      {children}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={request ? `${request.title} video player` : "Video player"}
        aria-hidden={!active}
        className={`fixed inset-0 z-[300] flex h-[100dvh] w-screen items-center justify-center overflow-hidden bg-black px-2 py-11 transition-[opacity,visibility] duration-150 sm:px-4 sm:py-12 ${active ? "visible opacity-100" : "invisible pointer-events-none opacity-0"}`}
      >
        {active ? (
          <button
            type="button"
            onClick={closeVideo}
            className="fixed z-[360] flex h-12 w-12 touch-manipulation items-center justify-center rounded-full border border-white/40 bg-black/90 text-white shadow-[0_10px_35px_rgba(0,0,0,.75)] backdrop-blur-md transition hover:border-white/75 hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
            style={{ top: "max(10px, env(safe-area-inset-top))", right: "max(10px, env(safe-area-inset-right))" }}
            aria-label="Close video"
            title="Close video"
          >
            <X size={25} strokeWidth={2.4} />
          </button>
        ) : null}

        {active && request && source ? (
          <div
            className="relative max-w-[1600px] overflow-hidden rounded-[4px] bg-black shadow-[0_30px_100px_rgba(0,0,0,.7)]"
            style={{ height: "min(56.25vw, calc(100dvh - 88px), 900px)", aspectRatio: "16 / 9" }}
          >
            {source.provider === "direct" ? (
              <DirectVideo
                src={source.mediaUrl}
                posterUrl={request.posterUrl}
                title={request.title}
              />
            ) : source.provider === "youtube" ? (
              <iframe
                src={`${source.embedUrl}&autoplay=1&controls=1&fs=1&iv_load_policy=3&modestbranding=1`}
                title={request.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                className="absolute inset-0 h-full w-full border-0 bg-black"
              />
            ) : source.provider === "google-drive" ? (
              <iframe
                src={`${source.embedUrl}${source.embedUrl.includes("?") ? "&" : "?"}autoplay=1`}
                title={request.title}
                allow="autoplay; fullscreen"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                className="absolute inset-0 h-full w-full border-0 bg-black"
              />
            ) : source.provider === "pinterest" ? (
              <PinterestPinEmbed pinUrl={source.pinUrl} title={request.title} />
            ) : (
              <ExternalVideoFallback pageUrl={source.pageUrl} title={request.title} />
            )}
          </div>
        ) : null}
      </div>
    </GlobalVideoContext.Provider>
  );
}

export function useGlobalVideoPlayer() {
  const context = useContext(GlobalVideoContext);
  if (!context) throw new Error("useGlobalVideoPlayer must be used inside GlobalVideoPlayerProvider.");
  return context;
}

export type { GlobalVideoRequest };
