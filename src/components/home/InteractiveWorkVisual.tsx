"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { canUseOptimizedImage } from "@/lib/media/image-source";
import type { VideoOrientation } from "@/lib/media/video";

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
  orientation = "landscape",
}: {
  title: string;
  visualUrl?: string | null;
  videoUrl?: string | null;
  large: boolean;
  categoryName?: string;
  orientation?: VideoOrientation;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hovered, setHovered] = useState(false);
  const [finePointer, setFinePointer] = useState(false);
  const directVideo = useMemo(() => isDirectVideo(videoUrl), [videoUrl]);
  const optimizedVisual = canUseOptimizedImage(visualUrl);
  const portrait = orientation === "portrait";

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
    node.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg) translateZ(0)";
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!finePointer || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const node = frameRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    node.style.transform = `perspective(1200px) rotateX(${(-y * 3.2).toFixed(2)}deg) rotateY(${(x * 4.2).toFixed(2)}deg) translateZ(0)`;
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
      // Poster stays visible when preview autoplay is blocked.
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

  const media = (
    <>
      {visualUrl ? (
        optimizedVisual ? (
          <Image
            src={visualUrl}
            alt={title}
            fill
            sizes={portrait ? "420px" : large ? "100vw" : "(min-width: 1024px) 50vw, 100vw"}
            className="object-cover object-center transition-transform duration-700 ease-[var(--cine-ease)] motion-reduce:transition-none group-hover:scale-[1.012]"
          />
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 ease-[var(--cine-ease)] motion-reduce:transition-none group-hover:scale-[1.012]"
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
    </>
  );

  return (
    <div
      ref={frameRef}
      onPointerMove={onPointerMove}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      className={`relative h-full w-full transform-gpu overflow-hidden bg-[radial-gradient(circle_at_72%_26%,rgba(59,130,246,.22),transparent_32%),linear-gradient(145deg,#121419_0%,#08090B_78%)] transition-transform duration-300 ease-out motion-reduce:!transform-none motion-reduce:transition-none ${finePointer ? "will-change-transform" : ""}`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] [background-size:52px_52px]" aria-hidden />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent-glow)] opacity-45 blur-[70px] motion-safe:animate-pulse" aria-hidden />

      {categoryName && (
        <span className="pointer-events-none absolute left-4 top-4 z-30 rounded-full border border-white/12 bg-black/45 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent-hover)] backdrop-blur-md sm:left-5 sm:top-5">
          {categoryName}
        </span>
      )}

      {portrait ? (
        <div className="absolute left-1/2 top-1/2 h-[88%] aspect-[9/16] -translate-x-1/2 -translate-y-1/2 rounded-[clamp(1.4rem,5vw,2.6rem)] border border-white/20 bg-[#0A0C10] p-[clamp(5px,1.2vw,9px)] shadow-[0_28px_90px_rgba(0,0,0,.58),0_0_0_1px_rgba(59,130,246,.14)] transition-transform duration-500 group-hover:scale-[1.012] motion-reduce:transition-none">
          <div className="relative h-full w-full overflow-hidden rounded-[clamp(1.15rem,4.4vw,2.15rem)] bg-black">
            {media}
            <span className="pointer-events-none absolute left-1/2 top-2 z-20 h-1.5 w-[28%] -translate-x-1/2 rounded-full bg-black/80" aria-hidden />
          </div>
        </div>
      ) : (
        <div className="absolute inset-x-[5%] top-1/2 -translate-y-[54%]">
          <div className="relative aspect-video overflow-hidden rounded-[clamp(.75rem,1.4vw,1.15rem)] border border-white/18 bg-black p-[clamp(4px,.55vw,7px)] shadow-[0_32px_90px_rgba(0,0,0,.55),0_0_0_1px_rgba(59,130,246,.12)] transition-transform duration-500 group-hover:scale-[1.008] motion-reduce:transition-none">
            <div className="relative h-full w-full overflow-hidden rounded-[clamp(.55rem,1vw,.85rem)] bg-black">
              {media}
            </div>
          </div>
          <div className="mx-auto h-[clamp(8px,1.1vw,14px)] w-[18%] bg-gradient-to-b from-[#272B34] to-[#121419]" aria-hidden />
          <div className="mx-auto h-[clamp(5px,.7vw,9px)] w-[30%] rounded-full bg-[#22262E] shadow-[0_7px_20px_rgba(0,0,0,.5)]" aria-hidden />
        </div>
      )}

      {videoUrl && (
        <span className="pointer-events-none absolute right-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--accent-primary)]/55 bg-black/70 text-[var(--accent-hover)] shadow-[0_8px_30px_rgba(0,0,0,.4)] backdrop-blur-md sm:right-5 sm:top-5" aria-hidden="true">
          <Play size={14} fill="currentColor" />
        </span>
      )}

      {videoUrl && finePointer && (
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute left-[var(--cursor-x)] top-[var(--cursor-y)] z-50 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/62 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-md transition-[opacity,transform] duration-200 ${hovered ? "scale-100 opacity-100" : "scale-75 opacity-0"}`}
        >
          Play
        </span>
      )}
    </div>
  );
}
