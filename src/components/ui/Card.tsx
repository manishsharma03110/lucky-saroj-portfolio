import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

/**
 * A bordered, dark-surface card for the cinematic design system. Subtle
 * border + gentle elevation on hover — no gradients, no glassmorphism.
 * Not used by any existing page yet.
 */
export function Card({
  children,
  className,
  hover = true,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--cine-radius-md)] border border-[var(--cine-border)] bg-[var(--cine-surface)] p-6",
        hover &&
          "transition-colors duration-300 hover:border-[var(--cine-border-strong)] hover:bg-[var(--cine-surface-2)]",
        className
      )}
    >
      {children}
    </div>
  );
}
