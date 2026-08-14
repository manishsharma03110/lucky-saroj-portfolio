import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

export function Badge({
  children,
  className,
  tone = "default",
}: {
  children: ReactNode;
  className?: string;
  tone?: "default" | "accent" | "success" | "muted";
}) {
  const tones = {
    default: "bg-[var(--color-paper-dim)] text-[var(--color-ink-soft)]",
    accent: "bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
    success: "bg-emerald-100 text-emerald-700",
    muted: "bg-neutral-100 text-neutral-500",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
