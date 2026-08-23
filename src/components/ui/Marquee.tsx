"use client";

import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

/**
 * A continuous horizontal marquee — for things like a client/brand strip or
 * a repeating tag line ("EDIT · GRADE · MIX · DELIVER"). Pure CSS animation
 * (no Framer Motion needed for an infinite loop), pauses on hover, and
 * respects `prefers-reduced-motion` via the existing global rule in
 * globals.css. Not used by any existing page yet.
 */
export function Marquee({
  children,
  durationSeconds = 28,
  pauseOnHover = true,
  className,
}: {
  children: ReactNode;
  durationSeconds?: number;
  pauseOnHover?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("group relative overflow-hidden", className)}>
      <div
        className={cn(
          "flex w-max shrink-0 items-center gap-16",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
        style={{
          animation: `cine-marquee ${durationSeconds}s linear infinite`,
        }}
      >
        <div className="flex shrink-0 items-center gap-16">{children}</div>
        <div className="flex shrink-0 items-center gap-16" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
