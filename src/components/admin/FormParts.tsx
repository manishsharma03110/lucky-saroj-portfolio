import type { ReactNode } from "react";

export function FormCard({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-white p-6">
      {title && (
        <h2 className="mb-5 font-display text-sm font-semibold uppercase tracking-wide text-[var(--color-ink)]">
          {title}
        </h2>
      )}
      <div className="space-y-5">{children}</div>
    </div>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

export function CheckboxField({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-[var(--color-ink)]">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 rounded border-[var(--color-line)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
      />
      {label}
    </label>
  );
}
