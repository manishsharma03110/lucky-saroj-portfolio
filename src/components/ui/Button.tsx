import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "cine-outline" | "cine-solid";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-hover)] active:bg-[var(--accent-active)] shadow-[0_1px_0_rgba(0,0,0,0.05)]",
  secondary:
    "bg-transparent text-[var(--color-ink)] border border-[var(--color-ink)]/20 hover:border-[var(--color-ink)]/50",
  ghost: "bg-transparent text-[var(--color-ink)] hover:text-[var(--color-accent)]",
  // Cinematic-system variants — additive, not used by any existing page yet.
  // Intended for dark (--cine-void) surfaces in the upcoming redesign.
  "cine-outline":
    "bg-transparent text-[var(--cine-text-primary)] border border-[var(--cine-border-strong)] hover:border-[var(--cine-accent)] hover:text-[var(--cine-accent)]",
  "cine-solid":
    "bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-hover)] active:bg-[var(--accent-active)]",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium tracking-wide transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none";

export function Button({
  children,
  variant = "primary",
  className,
  href,
  withArrow = false,
  ...props
}: {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  href?: string;
  /** Adds a trailing arrow that nudges right on hover — opt-in, off by
   * default so no existing button call site is affected. */
  withArrow?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const classes = cn(base, variantClasses[variant], withArrow && "group", className);
  const content = withArrow ? (
    <>
      {children}
      <ArrowRight
        size={16}
        className="transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1"
      />
    </>
  ) : (
    children
  );
  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }
  return (
    <button className={classes} {...props}>
      {content}
    </button>
  );
}
