"use client";

import { motion } from "framer-motion";
import { fadeUp, viewportOnce } from "@/lib/motion";
import { cn } from "@/lib/utils/cn";

/**
 * A small uppercase eyebrow label above a section heading — the timecode
 * motif already used elsewhere in the site (`.timecode` in globals.css),
 * offered here as a typed, reusable component for the cinematic system.
 * Optionally prefixed with a subtle video-editor marker (REC / CUT / etc.)
 * instead of a raw timecode string.
 */
export function Eyebrow({
  children,
  marker,
  className,
}: {
  children: React.ReactNode;
  marker?: "rec" | "cut" | "b-roll" | "color" | "sfx";
  className?: string;
}) {
  return (
    <p className={cn("cine-eyebrow flex items-center gap-2", className)}>
      {marker === "rec" && (
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
          REC
        </span>
      )}
      {marker && marker !== "rec" && (
        <span className="rounded-sm border border-current px-1 py-px text-[0.65rem]">
          {marker.toUpperCase()}
        </span>
      )}
      {children}
    </p>
  );
}

/**
 * Standard section heading for the cinematic system: eyebrow + large bold
 * display heading, with a restrained reveal-on-scroll animation. Purely
 * presentational — not wired into any page yet.
 */
export function SectionHeading({
  eyebrow,
  marker,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  marker?: "rec" | "cut" | "b-roll" | "color" | "sfx";
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      className={cn(align === "center" && "text-center", className)}
    >
      {eyebrow && (
        <Eyebrow marker={marker} className={cn("mb-4", align === "center" && "justify-center")}>
          {eyebrow}
        </Eyebrow>
      )}
      <h2 className="cine-display text-3xl text-[var(--cine-text-primary)] sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "cine-body mt-4 max-w-xl text-base sm:text-lg",
            align === "center" && "mx-auto"
          )}
        >
          {description}
        </p>
      )}
    </motion.div>
  );
}
