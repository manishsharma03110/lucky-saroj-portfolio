"use client";

import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

/**
 * Cinematic frame for portfolio media: subtle corner brackets (a restrained
 * nod to viewfinder/frame-guide overlays used in editing software), a
 * hairline border, and a slow hover-zoom on whatever is passed as children
 * (typically a thumbnail `<img>`/background-image div, or the existing
 * `VideoPlayer` component). This component only provides the frame — it
 * does not fetch or render media itself, so it composes with what already
 * exists rather than duplicating it.
 */
export function MediaFrame({
  children,
  overlay,
  aspect = "aspect-video",
  showCorners = true,
  className,
}: {
  children: ReactNode;
  /** Optional content rendered above the media, outside the hover-zoom
   * scaling wrapper — badges, gradient scrims, WATCH labels, etc. Kept
   * separate from `children` so overlay UI never stretches/scales with
   * the zoom effect. */
  overlay?: ReactNode;
  aspect?: string;
  showCorners?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[var(--cine-radius-md)] border border-[var(--cine-border)] bg-[var(--cine-surface)]",
        aspect,
        className
      )}
    >
      <div className="cine-hover-zoom h-full w-full">{children}</div>

      {overlay}

      {showCorners && (
        <>
          <span className="pointer-events-none absolute left-3 top-3 h-4 w-4 border-l border-t border-white/25 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <span className="pointer-events-none absolute right-3 top-3 h-4 w-4 border-r border-t border-white/25 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <span className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 border-b border-l border-white/25 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <span className="pointer-events-none absolute bottom-3 right-3 h-4 w-4 border-b border-r border-white/25 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </>
      )}
    </div>
  );
}
