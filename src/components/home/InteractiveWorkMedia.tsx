"use client";

import Image from "next/image";
import { ArrowUpRight, Play } from "lucide-react";
import { type CSSProperties, useEffect, useRef, useState } from "react";

type InteractiveWorkMediaProps = {
  title: string;
  categoryName?: string;
  visualUrl?: string | null;
  optimizedVisual?: boolean;
  previewVideoUrl?: string | null;
  large?: boolean;
};

function initials(title: string) {
  return title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function InteractiveWorkMedia({
  title,
  categoryName,
  visualUrl,
  optimizedVisual = false,
  previewVideoUrl,
  large = false,
}: InteractiveWorkMediaProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const [previewActive, setPreviewActive] = useState(false);
  const [finePointer, setFinePointer] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const pointer = window.matchMedia("(pointer: fine)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setFinePointer(pointer.matches);
      setReducedMotion(motion.matches);
    };
    sync();
    pointer.addEventListener("change", sync);
    motion.addEventListener("change", sync);
    return () => {
      pointer.removeEventListener("change", sync);
      motion.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !previewVideoUrl) return;

    if (!previewActive || reducedMotion) {
      video.pause();
      video.currentTime = 0;
      return;
    }

    if (video.getAttribute("src") !== previewVideoUrl) video.src = previewVideoUrl;
    video.play().catch(() => undefined);
  }, [previewActive, previewVideoUrl, reducedMotion]);

  const resetTilt = () => {
    const frame = frameRef.current;
    const cursor = cursorRef.current;
    if (frame) {
      frame.style.setProperty("--tilt-x", "0deg");
      frame.style.setProperty("--tilt-y", "0deg");
      frame.style.setProperty("--tilt-scale", "1");
    }
    if (cursor) cursor.style.opacity = "0";
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!finePointer || reducedMotion) return;
    const frame = frameRef.current;
    if (!frame) return;
    const rect = frame.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    frame.style.setProperty("--tilt-x", `${(0.5 - y) * 5}deg`);
    frame.style.setProperty("--tilt-y", `${(x - 0.5) * 7}deg`);
    frame.style.setProperty("--tilt-scale", "1.012");

    const cursor = cursorRef.current;
    if (cursor && previewVideoUrl) {
      cursor.style.transform = `translate3d(${event.clientX - rect.left}px, ${event.clientY - rect.top}px, 0) translate(-50%, -50%)`;
      cursor.style.opacity = "1";
    }
  };

  return (
    <div
      ref={frameRef}
      onPointerEnter={() => setPreviewActive(true)}
      onPointerLeave={() => {
        setPreviewActive(false);
        resetTilt();
      }}
      onPointerMove={handlePointerMove}
      style={
        {
          "--tilt-x": "0deg",
          "--tilt-y": "0deg",
          "--tilt-scale": "1",
        } as CSSProperties
      }
      className={`group/media relative overflow-hidden rounded-[12px] border border-white/10 bg-[var(--surface-primary)] shadow-[0_24px_80px_rgba(0,0,0,0.24)] transition-[border-color,box-shadow,transform] duration-500 ease-[var(--cine-ease)] motion-reduce:transform-none motion-reduce:transition-none group-hover:border-[var(--accent-border)] group-hover:shadow-[0_30px_100px_rgba(0,0,0,0.42)] [transform:perspective(1100px)_rotateX(var(--tilt-x))_rotateY(var(--tilt-y))_scale(var(--tilt-scale))] ${large ? "aspect-[4/3] sm:aspect-[16/9] lg:aspect-[2.35/1]" : "aspect-[4/3] sm:aspect-[16/10]"}`}
    >
      {visualUrl ? (
        optimizedVisual ? (
          <Image
            src={visualUrl}
            alt={title}
            fill
            sizes={large ? "100vw" : "(min-width: 1024px) 50vw, 100vw"}
            className="object-cover object-center grayscale transition-[filter,transform,opacity] duration-700 ease-[var(--cine-ease)] motion-reduce:transition-none group-hover/media:scale-[1.035] group-hover/media:grayscale-0"
          />
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center grayscale transition-[filter,transform,opacity] duration-700 ease-[var(--cine-ease)] motion-reduce:transition-none group-hover/media:scale-[1.035] group-hover/media:grayscale-0"
            style={{ backgroundImage: `url('${visualUrl}')` }}
            role="img"
            aria-label={title}
          />
        )
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(145deg,var(--surface-elevated)_0%,var(--background-secondary)_68%)]">
          <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:72px_72px]" aria-hidden />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_67%_38%,var(--accent-glow),transparent_38%)]" aria-hidden />
          <span className="absolute right-[5%] top-1/2 -translate-y-1/2 select-none font-display text-[clamp(5rem,16vw,13rem)] font-semibold text-[var(--text-primary)] opacity-[0.055]" aria-hidden="true">
            {initials(title)}
          </span>
          <div className="absolute inset-x-6 bottom-6 sm:inset-x-8 sm:bottom-8">
            {categoryName && <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent-primary)]">{categoryName}</p>}
            <p className="mt-2 max-w-[75%] font-display text-xl font-semibold tracking-[-0.03em] text-[var(--text-primary)] sm:text-2xl">{title}</p>
            <span className="mt-4 block h-px bg-gradient-to-r from-[var(--accent-primary)]/70 to-transparent" aria-hidden />
          </div>
        </div>
      )}

      {previewVideoUrl && (
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="none"
          aria-label={`${title} preview`}
          className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-500 motion-reduce:hidden ${previewActive && !reducedMotion ? "opacity-100" : "opacity-0"}`}
        />
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-black/10 opacity-75 transition-opacity duration-300 group-hover/media:opacity-90" aria-hidden="true" />
      {previewVideoUrl && (
        <span
          ref={cursorRef}
          className="pointer-events-none absolute left-0 top-0 z-20 hidden h-[74px] w-[74px] items-center justify-center rounded-full border border-white/40 bg-black/55 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-white opacity-0 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-md transition-opacity duration-150 md:flex"
          aria-hidden="true"
        >
          Play
        </span>
      )}
      <div className="absolute inset-x-5 top-5 flex items-start justify-between gap-4 sm:inset-x-7 sm:top-7">
        {categoryName ? (
          <span className="border border-white/20 bg-black/35 px-3 py-1.5 text-xs text-white/85 backdrop-blur-sm">{categoryName}</span>
        ) : <span />}
        {previewVideoUrl && (
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/35 bg-black/30 text-white backdrop-blur-sm" aria-hidden="true">
            <Play size={16} fill="currentColor" />
          </span>
        )}
      </div>
      <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4 sm:inset-x-7 sm:bottom-7">
        <span className="text-sm font-medium text-white">View project</span>
        <ArrowUpRight size={20} className="text-[var(--accent-hover)] transition-transform duration-300 motion-reduce:transition-none group-hover/media:-translate-y-0.5 group-hover/media:translate-x-0.5" aria-hidden="true" />
      </div>
    </div>
  );
}
