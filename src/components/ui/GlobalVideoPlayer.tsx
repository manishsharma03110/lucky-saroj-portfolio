"use client";

import { Maximize2, Minimize2, Pause, Play, Volume2, VolumeX, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { flushSync } from "react-dom";
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
  onDetectedOrientation,
  onToggleFullscreen,
}: {
  src: string;
  posterUrl?: string | null;
  title: string;
  onDetectedOrientation: (orientation: Exclude<VideoOrientation, "auto">) => void;
  onToggleFullscreen: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlayback = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      await video.play().catch(() => setPaused(true));
    } else {
      video.pause();
    }
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
          if (video.videoWidth && video.videoHeight) {
            onDetectedOrientation(video.videoHeight > video.videoWidth ? "portrait" : "landscape");
          }
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
          className="absolute left-1/2 top-1/2 z-20 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/55 bg-[#08090b]/80 text-white shadow-[0_12px_40px_rgba(0,0,0,.45)] backdrop-blur-md transition hover:scale-105 hover:border-[var(--accent-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] sm:h-16 sm:w-16"
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
          <button type="button" onClick={togglePlayback} className="flex h-9 w-9 items-center justify-center rounded-md transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]" aria-label={paused ? "Play video" : "Pause video"}>
            {paused ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />}
          </button>
          <button type="button" onClick={toggleMute} className="flex h-9 w-9 items-center justify-center rounded-md transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]" aria-label={muted ? "Unmute video" : "Mute video"}>
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <span className="min-w-0 text-[10px] tabular-nums text-white/70 sm:text-xs">{formatTime(currentTime)} / {formatTime(duration)}</span>
          <button type="button" onClick={onToggleFullscreen} className="ml-auto flex h-9 w-9 items-center justify-center rounded-md transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]" aria-label="Toggle fullscreen">
            {typeof document !== "undefined" && document.fullscreenElement ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}

export function GlobalVideoPlayerProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const overlayRef = useRef<HTMLDivElement>(null);
  const nativeFullscreenRef = useRef(false);
  const [request, setRequest] = useState<GlobalVideoRequest | null>(null);
  const [detectedOrientation, setDetectedOrientation] = useState<Exclude<VideoOrientation, "auto">>("landscape");
  const source = useMemo(() => getVideoSource(request?.videoUrl), [request?.videoUrl]);
  const requestedOrientation = normalizeVideoOrientation(request?.orientation);
  const resolvedOrientation = requestedOrientation === "auto" ? detectedOrientation : requestedOrientation;
  const active = Boolean(request && source);

  const closeVideo = useCallback(() => {
    setRequest(null);
    setDetectedOrientation("landscape");
    nativeFullscreenRef.current = false;
    if (typeof document !== "undefined" && document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined);
    }
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (typeof document === "undefined") return;
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => undefined);
      return;
    }
    const node = overlayRef.current;
    if (!node?.requestFullscreen) return;
    await node.requestFullscreen().then(() => {
      nativeFullscreenRef.current = true;
    }).catch(() => undefined);
  }, []);

  const openVideo = useCallback((next: GlobalVideoRequest) => {
    if (!getVideoSource(next.videoUrl)) return;
    const orientation = normalizeVideoOrientation(next.orientation);
    flushSync(() => {
      setDetectedOrientation(orientation === "auto" ? "landscape" : orientation);
      setRequest({ ...next, orientation });
    });

    const node = overlayRef.current;
    if (typeof document !== "undefined" && node?.requestFullscreen && !document.fullscreenElement) {
      void node.requestFullscreen().then(() => {
        nativeFullscreenRef.current = true;
      }).catch(() => {
        nativeFullscreenRef.current = false;
      });
    }
  }, []);

  useEffect(() => {
    if (!active) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !document.fullscreenElement) closeVideo();
    };
    const onFullscreenChange = () => {
      if (nativeFullscreenRef.current && !document.fullscreenElement) closeVideo();
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, [active, closeVideo]);

  const previousPathRef = useRef(pathname);
  useEffect(() => {
    if (previousPathRef.current !== pathname) {
      previousPathRef.current = pathname;
      if (request) closeVideo();
    }
  }, [pathname, request, closeVideo]);

  const providerLabel = source?.provider === "direct" ? "Clean HTML5" : source?.provider === "youtube" ? "YouTube" : source?.provider === "google-drive" ? "Google Drive" : "Video";
  const shellClass = resolvedOrientation === "portrait"
    ? "aspect-[9/16] w-auto max-w-[92vw] flex-1 max-h-[calc(100dvh-8rem)]"
    : "aspect-video w-full max-w-[1600px] max-h-[calc(100dvh-8rem)]";

  return (
    <GlobalVideoContext.Provider value={{ openVideo, closeVideo, active }}>
      {children}
      <div
        ref={overlayRef}
        role="dialog"
        aria-modal="true"
        aria-label={request ? `${request.title} video player` : "Video player"}
        aria-hidden={!active}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget && active) closeVideo();
        }}
        className={`fixed inset-0 z-[300] flex min-h-[100dvh] flex-col overflow-hidden bg-[var(--background-primary)] text-[var(--text-primary)] transition-[opacity,visibility] duration-200 ${active ? "visible opacity-100" : "invisible pointer-events-none opacity-0"}`}
      >
        <div className="flex min-h-16 shrink-0 items-center gap-3 border-b border-white/10 bg-[var(--background-primary)]/95 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <span className="h-8 w-1 rounded-full bg-[var(--accent-primary)] shadow-[0_0_18px_var(--accent-glow)]" aria-hidden />
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-semibold text-[var(--text-primary)] sm:text-base">{request?.title || "Video"}</p>
            <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--accent-hover)] sm:text-[10px]">{providerLabel} · {resolvedOrientation === "portrait" ? "Portrait 9:16" : "Landscape 16:9"}</p>
          </div>
          <button type="button" onClick={toggleFullscreen} className="ml-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[var(--surface-primary)] text-[var(--text-primary)] transition hover:border-[var(--accent-primary)]/60 hover:text-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]" aria-label="Toggle fullscreen">
            <Maximize2 size={19} />
          </button>
          <button type="button" onClick={closeVideo} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[var(--surface-primary)] text-[var(--text-primary)] transition hover:border-[var(--accent-primary)]/60 hover:text-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]" aria-label="Close video">
            <X size={20} />
          </button>
        </div>

        <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden p-3 sm:p-5 lg:p-7">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,var(--accent-glow),transparent_42%)] opacity-65" aria-hidden />
          {active && request && source ? (
            <div className={`relative flex min-h-0 items-center justify-center overflow-hidden rounded-[14px] border border-white/10 bg-black shadow-[0_30px_120px_rgba(0,0,0,.58)] ${shellClass}`}>
              <div className="relative h-full w-full overflow-hidden bg-black">
                {source.provider === "direct" ? (
                  <DirectVideo
                    src={source.mediaUrl}
                    posterUrl={request.posterUrl}
                    title={request.title}
                    onDetectedOrientation={(orientation) => {
                      if (requestedOrientation === "auto") setDetectedOrientation(orientation);
                    }}
                    onToggleFullscreen={toggleFullscreen}
                  />
                ) : source.provider === "youtube" ? (
                  <iframe
                    src={`${source.embedUrl}&autoplay=1&controls=1&fs=1&iv_load_policy=3`}
                    title={request.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    className="absolute inset-0 h-full w-full border-0 bg-black"
                  />
                ) : (
                  <iframe
                    src={`${source.embedUrl}${source.embedUrl.includes("?") ? "&" : "?"}autoplay=1`}
                    title={request.title}
                    allow="autoplay; fullscreen"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    className="absolute inset-0 h-full w-full border-0 bg-black"
                  />
                )}
              </div>
            </div>
          ) : null}
        </div>

        <div className="shrink-0 border-t border-white/10 bg-[var(--background-primary)] px-4 py-2 text-center text-[9px] uppercase tracking-[0.16em] text-[var(--text-muted)] sm:text-[10px]">
          Tap close or press Esc to return to the project
        </div>
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
