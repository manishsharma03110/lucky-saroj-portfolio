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
  orientation = "landscape",
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hovered, setHovered] = useState(false);
  const source = useMemo(() => getVideoSource(videoUrl), [videoUrl]);
  const directVideo = source?.provider === "direct";
  const optimizedVisual = canUseOptimizedImage(visualUrl);
  const portrait = orientation === "portrait";
  const previewVisible = autoPreview || hovered;

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

  const onEnter = () => {
    setHovered(true);
  };

  const onLeave = () => {
    setHovered(false);
  };

  const providerPreviewUrl = useMemo(() => {
    if (!autoPreview || !source || source.provider === "direct") return null;
    if (source.provider === "youtube") {
      return `${source.embedUrl}&autoplay=1&mute=1&controls=0&modestbranding=1&iv_load_policy=3&disablekb=1`;
    }
    return `${source.embedUrl}${source.embedUrl.includes("?") ? "&" : "?"}autoplay=1`;
  }, [autoPreview, source]);

  return (
    <div
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      className="relative h-full w-full overflow-hidden bg-[var(--surface-primary)]"
    >
      {visualUrl ? (
        optimizedVisual ? (
          <>
            {portrait ? (
              <Image
                src={visualUrl}
                alt=""
                aria-hidden
                fill
                sizes="(min-width: 1024px) 34vw, 100vw"
                className="scale-110 object-cover object-center opacity-45 blur-xl"
              />
            ) : null}
            <Image
              src={visualUrl}
              alt={title}
              fill
              sizes={large ? "100vw" : "(min-width: 1024px) 34vw, (min-width: 768px) 50vw, 100vw"}
              className={`${portrait ? "object-contain" : "object-cover"} object-center transition-transform duration-500 ease-[var(--cine-ease)] motion-reduce:transition-none group-hover:scale-[1.015]`}
            />
          </>
        ) : (
          <>
            {portrait ? (
              <div
                className="absolute -inset-4 scale-110 bg-cover bg-center bg-no-repeat opacity-45 blur-xl"
                style={{ backgroundImage: `url('${visualUrl}')` }}
                aria-hidden
              />
            ) : null}
            <div
              className={`absolute inset-0 bg-center bg-no-repeat transition-transform duration-500 ease-[var(--cine-ease)] motion-reduce:transition-none group-hover:scale-[1.015] ${portrait ? "bg-contain" : "bg-cover"}`}
              style={{ backgroundImage: `url('${visualUrl}')` }}
              role="img"
              aria-label={title}
            />
          </>
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
          className={`pointer-events-none absolute inset-0 z-10 h-full w-full object-center transition-opacity duration-400 ${portrait ? "object-contain" : "object-cover"} ${previewVisible ? "opacity-100" : "opacity-0"}`}
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
