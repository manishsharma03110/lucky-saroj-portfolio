import { cn } from "@/lib/utils/cn";
import type { SelectHTMLAttributes } from "react";

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full rounded-lg border border-[var(--color-line)] bg-white px-4 py-3 text-sm text-[var(--color-ink)] focus:border-[var(--color-accent)] focus:outline-none transition-colors",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
