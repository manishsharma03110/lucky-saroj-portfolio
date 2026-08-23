"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { viewportOnce } from "@/lib/motion";

/**
 * A decorative horizontal timeline with a playhead marker that sweeps across
 * once when scrolled into view — a subtle nod to an editing timeline, meant
 * as a section divider (in place of a plain `<hr>` / `.scrubber`). Purely
 * decorative: no real playback state. Not used by any existing page yet.
 */
export function Playhead({ className }: { className?: string }) {
  return (
    <div className={cn("relative h-6", className)} aria-hidden>
      <div className="cine-scrubber absolute left-0 right-0 top-1/2 -translate-y-1/2" />
      <motion.div
        initial={{ left: "0%", opacity: 0 }}
        whileInView={{ left: "100%", opacity: 1 }}
        viewport={viewportOnce}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
      >
        <span className="h-2.5 w-[2px] bg-[var(--cine-accent)]" />
        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[var(--cine-accent)]" />
      </motion.div>
    </div>
  );
}
