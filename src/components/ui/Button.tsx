import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-[var(--color-accent)] text-white hover:bg-[#b3661f] shadow-[0_1px_0_rgba(0,0,0,0.05)]",
  secondary:
    "bg-transparent text-[var(--color-ink)] border border-[var(--color-ink)]/20 hover:border-[var(--color-ink)]/50",
  ghost: "bg-transparent text-[var(--color-ink)] hover:text-[var(--color-accent)]",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium tracking-wide transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none";

export function Button({
  children,
  variant = "primary",
  className,
  href,
  ...props
}: {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  href?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const classes = cn(base, variantClasses[variant], className);
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
