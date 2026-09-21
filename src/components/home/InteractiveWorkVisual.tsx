"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { canUseOptimizedImage } from "@/lib/media/image-source";
import { getVideoSource, type VideoOrientation } from "@/lib/media/video";

export function InteractiveWorkVisual({
  title,
  visualUrl,
  videoUrl,
  large,
  categoryName,
  autoPreview = false,
}: {
  title: string;
  visualUrl?: string | null;
  videoUrl?: string | null;
  large: boolean;
  categoryName?: string;
  orientation?: VideoOrientation;
  autoPreview?: boolean;
}) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const [motionAllowed, setMotionAllowed] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: no-preference) and (pointer: fine)");
    const update = () => { setMotionAllowed(query.matches); if (!query.matches && surfaceRef.current) surfaceRef.current.style.transform = ""; };
    update(); query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hovered, setHovered] = useState(false);
  const source = useMemo(() => getVideoSource(videoUrl), [videoUrl]);
  const directVideo = source?.provider === "direct";
  const optimizedVisual = canUseOptimizedImage(visualUrl);
  const previewVisible = autoPreview || (motionAllowed && hovered);

  useEffect(() => {
    const video = videoRef.current;
    if (!directVideo || !video) return;
    if (previewVisible) {
      video.currentTime = 0;
      void video.play().catch(() => undefined);
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [directVideo, previewVisible]);

  const providerPreviewUrl = useMemo(() => {
    if (!autoPreview || !source || source.provider === "direct") return null;
    if (source.provider === "youtube") {
      return `${source.embedUrl}&autoplay=1&mute=1&controls=0&modestbranding=1&iv_load_policy=3&disablekb=1`;
    }
    if (source.provider === "google-drive") {
      return `${source.embedUrl}${source.embedUrl.includes("?") ? "&" : "?"}autoplay=1`;
    }
    return null;
  }, [autoPreview, source]);

  return (
    <div
      ref={surfaceRef}
      onPointerMove={(event) => {
        if (!motionAllowed || !surfaceRef.current) return;
        const box = event.currentTarget.getBoundingClientRect();
        const x = (event.clientX - box.left) / box.width - 0.5;
        const y = (event.clientY - box.top) / box.height - 0.5;
        surfaceRef.current.style.transform = `perspective(1000px) rotateX(${-y * 3}deg) rotateY(${x * 3}deg)`;
      }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => { setHovered(false); if (surfaceRef.current) surfaceRef.current.style.transform = ""; }}
      className="work-visual relative h-full w-full overflow-hidden bg-[var(--surface-primary)]"
    >
      {visualUrl ? (
        optimizedVisual ? (
          <Image
            src={visualUrl}
            alt={title}
            fill
            sizes={large ? "100vw" : "(min-width: 1024px) 34vw, (min-width: 768px) 50vw, 100vw"}
            className="object-cover object-center transition-transform duration-500 ease-[var(--cine-ease)] motion-reduce:transition-none group-hover:scale-[1.015]"
          />
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-500 ease-[var(--cine-ease)] motion-reduce:transition-none group-hover:scale-[1.015]"
            style={{ backgroundImage: `url('${visualUrl}')` }}
            role="img"
            aria-label={title}
          />
        )
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_24%,var(--accent-glow),transparent_34%),linear-gradient(145deg,var(--surface-elevated),var(--background-primary))]" aria-hidden />
      )}

      {directVideo && source?.provider === "direct" ? (
        <video
          ref={videoRef}
          src={source.mediaUrl}
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={`${title} preview`}
          className={`pointer-events-none absolute inset-0 z-10 h-full w-full object-cover object-center transition-opacity duration-400 ${previewVisible ? "opacity-100" : "opacity-0"}`}
        />
      ) : null}

      {providerPreviewUrl ? (
        <iframe
          src={providerPreviewUrl}
          title={`${title} muted preview`}
          allow="autoplay; encrypted-media; picture-in-picture"
          tabIndex={-1}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 h-full w-full border-0 bg-black"
        />
      ) : null}

      <div className="pointer-events-none absolute inset-0 z-[15] bg-gradient-to-t from-black/30 via-transparent to-black/10" aria-hidden />

      {categoryName && (
        <span className="pointer-events-none absolute left-4 top-4 z-20 rounded-full border border-white/15 bg-black/55 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent-hover)] backdrop-blur-md sm:left-5 sm:top-5">
          {categoryName}
        </span>
      )}

      {videoUrl && (
        <span className="pointer-events-none absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--accent-primary)]/55 bg-black/70 text-[var(--accent-hover)] shadow-[0_8px_30px_rgba(0,0,0,.4)] backdrop-blur-md sm:right-5 sm:top-5" aria-hidden="true">
          <Play size={14} fill="currentColor" />
        </span>
      )}
    </div>
  );
}
