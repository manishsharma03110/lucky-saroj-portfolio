"use client";

import { Maximize2, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { flushSync } from "react-dom";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
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
}: {
  src: string;
  posterUrl?: string | null;
  title: string;
  onDetectedOrientation: (orientation: Exclude<VideoOrientation, "auto">) => void;
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

export function GlobalVideoPlayerProvider({ children }: { children: ReactNode }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const nativeFullscreenRef = useRef(false);
  const historyEntryRef = useRef(false);
  const [nativeFullscreen, setNativeFullscreen] = useState(false);
  const [request, setRequest] = useState<GlobalVideoRequest | null>(null);
  const [detectedOrientation, setDetectedOrientation] = useState<Exclude<VideoOrientation, "auto">>("landscape");
  const source = useMemo(() => getVideoSource(request?.videoUrl), [request?.videoUrl]);
  const requestedOrientation = normalizeVideoOrientation(request?.orientation);
  const resolvedOrientation = requestedOrientation === "auto" ? detectedOrientation : requestedOrientation;
  const active = Boolean(request && source);

  const resetPlayer = useCallback(() => {
    setRequest(null);
    setDetectedOrientation("landscape");
    setNativeFullscreen(false);
    nativeFullscreenRef.current = false;
    if (typeof document !== "undefined" && document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined);
    }
  }, []);

  const closeVideo = useCallback(() => {
    if (typeof window !== "undefined" && historyEntryRef.current) {
      historyEntryRef.current = false;
      window.history.back();
    }
    resetPlayer();
  }, [resetPlayer]);

  const requestNativeFullscreen = useCallback(() => {
    if (typeof document === "undefined" || document.fullscreenElement) return;
    const node = overlayRef.current;
    if (!node?.requestFullscreen) return;
    void node.requestFullscreen().then(() => {
      nativeFullscreenRef.current = true;
      setNativeFullscreen(true);
    }).catch(() => {
      nativeFullscreenRef.current = false;
      setNativeFullscreen(false);
    });
  }, []);

  const openVideo = useCallback((next: GlobalVideoRequest) => {
    if (!getVideoSource(next.videoUrl)) return;
    const orientation = normalizeVideoOrientation(next.orientation);

    if (typeof window !== "undefined" && !historyEntryRef.current) {
      window.history.pushState({ ...(window.history.state ?? {}), portfolioVideoPlayer: true }, "", window.location.href);
      historyEntryRef.current = true;
    }

    flushSync(() => {
      setDetectedOrientation(orientation === "auto" ? "landscape" : orientation);
      setRequest({ ...next, orientation });
    });
    requestNativeFullscreen();
  }, [requestNativeFullscreen]);

  useEffect(() => {
    if (!active) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !document.fullscreenElement) closeVideo();
    };
    const onPopState = () => {
      historyEntryRef.current = false;
      resetPlayer();
    };
    const onFullscreenChange = () => {
      const isFullscreen = Boolean(document.fullscreenElement);
      setNativeFullscreen(isFullscreen);
      if (nativeFullscreenRef.current && !isFullscreen) closeVideo();
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    window.addEventListener("popstate", onPopState);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      window.removeEventListener("popstate", onPopState);
    };
  }, [active, closeVideo, resetPlayer]);

  const playerStyle: CSSProperties = resolvedOrientation === "portrait"
    ? { height: "min(calc(100dvh - 64px), calc(100vw * 16 / 9))", aspectRatio: "9 / 16" }
    : { width: "min(100vw, calc((100dvh - 64px) * 16 / 9))", aspectRatio: "16 / 9" };

  const railStyle: CSSProperties = resolvedOrientation === "portrait"
    ? { width: "min(100vw, calc((100dvh - 64px) * 9 / 16))" }
    : { width: "min(100vw, calc((100dvh - 64px) * 16 / 9))" };

  return (
    <GlobalVideoContext.Provider value={{ openVideo, closeVideo, active }}>
      {children}
      <div
        ref={overlayRef}
        role="dialog"
        aria-modal="true"
        aria-label={request ? `${request.title} video player` : "Video player"}
        aria-hidden={!active}
        className={`fixed inset-0 z-[300] flex h-[100dvh] w-screen flex-col items-center justify-center overflow-hidden bg-black transition-[opacity,visibility] duration-150 ${active ? "visible opacity-100" : "invisible pointer-events-none opacity-0"}`}
      >
        {active ? (
          <div className="flex h-16 shrink-0 items-center justify-between px-1.5 sm:px-2" style={railStyle}>
            <button
              type="button"
              onClick={closeVideo}
              className="flex h-11 items-center gap-2 rounded-full border border-white/90 bg-white px-3.5 text-sm font-extrabold text-[#08090B] shadow-[0_10px_35px_rgba(0,0,0,.75)] transition hover:bg-[#F5F7FA] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--accent-primary)] sm:px-4"
              aria-label="Back to project"
              title="Back to project"
            >
              <span aria-hidden className="text-[28px] font-black leading-none text-[var(--accent-primary)]">←</span>
              <span>Back to project</span>
            </button>

            {!nativeFullscreen ? (
              <button
                type="button"
                onClick={requestNativeFullscreen}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-black text-white shadow-[0_10px_30px_rgba(0,0,0,.5)] transition hover:border-[var(--accent-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
                aria-label="Enter fullscreen"
              >
                <Maximize2 size={19} />
              </button>
            ) : <span aria-hidden className="h-11 w-11" />}
          </div>
        ) : null}

        {active && request && source ? (
          <div className="relative max-h-[calc(100dvh-64px)] max-w-[100vw] overflow-hidden bg-black" style={playerStyle}>
            {source.provider === "direct" ? (
              <DirectVideo
                src={source.mediaUrl}
                posterUrl={request.posterUrl}
                title={request.title}
                onDetectedOrientation={(orientation) => {
                  if (requestedOrientation === "auto") setDetectedOrientation(orientation);
                }}
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
