"use client";

import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteService } from "@/lib/actions/services";
import type { schema } from "@/lib/db";

type Service = typeof schema.services.$inferSelect;

export function ServiceListItem({ service }: { service: Service }) {
  const Icon = (Icons[service.icon as keyof typeof Icons] as LucideIcon) ?? Icons.Clapperboard;

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--color-line)] bg-white p-5">
      <div className="flex items-center gap-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
          <Icon size={18} />
        </span>
        <div>
          <h3 className="font-display text-sm font-semibold text-[var(--color-ink)]">{service.name}</h3>
          <p className="text-xs text-[var(--color-muted)]">{service.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {service.isFeatured && (
          <span className="rounded-full bg-[var(--color-accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--color-accent)]">
            Featured
          </span>
        )}
        <DeleteButton confirmText={`Delete "${service.name}"?`} onDelete={() => deleteService(service.id)} />
      </div>
    </div>
  );
}
