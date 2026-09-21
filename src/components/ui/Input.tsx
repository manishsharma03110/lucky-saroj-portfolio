import { cn } from "@/lib/utils/cn";
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "min-w-0 max-w-full w-full rounded-lg border border-[var(--color-line)] bg-[var(--surface-primary)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] focus:outline-none transition-colors",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-w-0 max-w-full w-full rounded-lg border border-[var(--color-line)] bg-[var(--surface-primary)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] focus:outline-none transition-colors resize-none",
        className
      )}
      {...props}
    />
  );
}

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
      {children}
    </label>
  );
}
