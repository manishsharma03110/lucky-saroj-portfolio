"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { canUseOptimizedImage } from "@/lib/media/image-source";

function isDirectVideo(url?: string | null) {
  if (!url) return false;
  return /\.(mp4|webm|ogg)(?:$|[?#])/i.test(url);
}

export function InteractiveWorkVisual({
  title,
  visualUrl,
  videoUrl,
  large,
  categoryName,
}: {
  title: string;
  visualUrl?: string | null;
  videoUrl?: string | null;
  large: boolean;
  categoryName?: string;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hovered, setHovered] = useState(false);
  const [finePointer, setFinePointer] = useState(false);
  const directVideo = useMemo(() => isDirectVideo(videoUrl), [videoUrl]);
  const optimizedVisual = canUseOptimizedImage(visualUrl);

  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setFinePointer(query.matches);
    sync();
    query.addEventListener?.("change", sync);
    return () => query.removeEventListener?.("change", sync);
  }, []);

  const resetTilt = () => {
    const node = frameRef.current;
    if (!node) return;
    node.style.transform = "perspective(1100px) rotateX(0deg) rotateY(0deg) translateZ(0)";
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!finePointer || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const node = frameRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    node.style.transform = `perspective(1100px) rotateX(${(-y * 3.5).toFixed(2)}deg) rotateY(${(x * 4.5).toFixed(2)}deg) translateZ(0)`;
    node.style.setProperty("--cursor-x", `${event.clientX - rect.left}px`);
    node.style.setProperty("--cursor-y", `${event.clientY - rect.top}px`);
  };

  const onEnter = async () => {
    setHovered(true);
    if (!directVideo || !videoRef.current || !finePointer) return;
    try {
      videoRef.current.currentTime = 0;
      await videoRef.current.play();
    } catch {
      // Browser autoplay policy can still block playback; poster remains visible.
    }
  };

  const onLeave = () => {
    setHovered(false);
    resetTilt();
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div
      ref={frameRef}
      onPointerMove={onPointerMove}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      className={`relative h-full w-full transform-gpu overflow-hidden transition-transform duration-300 ease-out motion-reduce:!transform-none motion-reduce:transition-none ${finePointer ? "will-change-transform" : ""}`}
    >
      {visualUrl ? (
        optimizedVisual ? (
          <Image
            src={visualUrl}
            alt={title}
            fill
            sizes={large ? "100vw" : "(min-width: 1024px) 50vw, 100vw"}
            className="object-cover object-center transition-[transform,filter] duration-700 ease-[var(--cine-ease)] motion-reduce:transition-none group-hover:scale-[1.01]"
          />
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-[transform,filter] duration-700 ease-[var(--cine-ease)] motion-reduce:transition-none group-hover:scale-[1.01]"
            style={{ backgroundImage: `url('${visualUrl}')` }}
            role="img"
            aria-label={title}
          />
        )
      ) : null}

      {directVideo && videoUrl && (
        <video
          ref={videoRef}
          src={videoUrl}
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={`${title} preview`}
          className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-500 ${hovered && finePointer ? "opacity-100" : "pointer-events-none opacity-0"}`}
        />
      )}

      

      {videoUrl && <span className="pointer-events-none absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-black/55 text-white/90 backdrop-blur-sm sm:right-4 sm:top-4" aria-hidden="true"><Play size={13} fill="currentColor" /></span>}

      {videoUrl && finePointer && (
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute left-[var(--cursor-x)] top-[var(--cursor-y)] z-20 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/55 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-md transition-[opacity,transform] duration-200 ${hovered ? "scale-100 opacity-100" : "scale-75 opacity-0"}`}
        >
          Play
        </span>
      )}
    </div>
  );
}
