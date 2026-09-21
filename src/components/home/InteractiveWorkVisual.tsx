"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { canUseOptimizedImage } from "@/lib/media/image-source";
import { getVideoSource, type VideoOrientation } from "@/lib/media/video";

export function InteractiveWorkVisual({
  title,
  visualUrl,
  videoUrl,
  large,
  categoryName,
  orientation = "landscape",
}: {
  title: string;
  visualUrl?: string | null;
  videoUrl?: string | null;
  large: boolean;
  categoryName?: string;
  orientation?: VideoOrientation;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hovered, setHovered] = useState(false);
  const source = useMemo(() => getVideoSource(videoUrl), [videoUrl]);
  const directVideo = source?.provider === "direct";
  const optimizedVisual = canUseOptimizedImage(visualUrl);
  const portrait = orientation === "portrait";

  const onEnter = async () => {
    setHovered(true);
    if (!directVideo || !videoRef.current || window.matchMedia("(pointer: coarse)").matches) return;
    try {
      videoRef.current.currentTime = 0;
      await videoRef.current.play();
    } catch {
      // Keep the poster visible when preview autoplay is blocked.
    }
  };

  const onLeave = () => {
    setHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      className="relative h-full w-full overflow-hidden bg-[var(--surface-primary)]"
    >
      {visualUrl ? (
        optimizedVisual ? (
          <Image
            src={visualUrl}
            alt={title}
            fill
            sizes={portrait ? "420px" : large ? "100vw" : "(min-width: 1024px) 50vw, 100vw"}
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

      {directVideo && source?.provider === "direct" && (
        <video
          ref={videoRef}
          src={source.mediaUrl}
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={`${title} preview`}
          className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-400 ${hovered ? "opacity-100" : "pointer-events-none opacity-0"}`}
        />
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" aria-hidden />

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
