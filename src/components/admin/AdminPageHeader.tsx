import type { ReactNode } from "react";

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">{title}</h1>
        {description && <p className="mt-1 text-sm text-[var(--color-muted)]">{description}</p>}
      </div>
      {action}
    </div>
  );
}
