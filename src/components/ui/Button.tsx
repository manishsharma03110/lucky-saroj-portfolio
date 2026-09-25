import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "cine-outline" | "cine-solid";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-[#2563eb] text-white hover:bg-[#1d4ed8] active:bg-[#1e40af] shadow-[0_1px_0_rgba(0,0,0,0.05)]",
  secondary:
    "bg-transparent text-[var(--color-ink)] border border-[var(--color-ink)]/20 hover:border-[var(--color-ink)]/50",
  ghost: "bg-transparent text-[var(--color-ink)] hover:text-[var(--color-accent)]",
  "cine-outline":
    "bg-transparent text-[var(--cine-text-primary)] border border-[var(--cine-border-strong)] hover:border-[var(--cine-accent)] hover:text-[var(--cine-accent)]",
  "cine-solid":
    "bg-[#2563eb] text-white hover:bg-[#1d4ed8] active:bg-[#1e40af]",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium tracking-wide transition-[color,background-color,border-color,box-shadow,transform] duration-200 motion-safe:hover:-translate-y-0.5 motion-reduce:transform-none disabled:pointer-events-none disabled:opacity-50";

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
  withArrow?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const classes = cn(base, "studio-button", `studio-button-${variant}`, variantClasses[variant], withArrow && "group", className);
  const content = withArrow ? (
    <>
      {children}
      <ArrowRight
        size={16}
        className="transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover:translate-x-1"
        aria-hidden="true"
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

