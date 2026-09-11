"use client";

import * as Icons from "lucide-react";
import { Pencil } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteService } from "@/lib/actions/services";
import type { schema } from "@/lib/db";
import { ServiceForm } from "./ServiceForm";
import styles from "./AdminContent.module.css";

type Service = typeof schema.services.$inferSelect;

export function ServiceListItem({ service }: { service: Service }) {
  const Icon = (Icons[service.icon as keyof typeof Icons] as LucideIcon) ?? Icons.Clapperboard;

  return (
    <article className={styles.itemCard}>
      <div className={styles.itemTop}>
        <div className={styles.itemIdentity}>
          <span className={styles.itemIcon} aria-hidden="true">
            <Icon size={18} strokeWidth={1.8} />
          </span>
          <div className={styles.itemCopy}>
            <h3>{service.name}</h3>
            {service.description && <p>{service.description}</p>}
            <div className={styles.itemMeta}>
              {service.isFeatured && <span className={styles.featuredBadge}>Featured</span>}
              {service.isActive && <span className={styles.activeBadge}>Active</span>}
            </div>
          </div>
        </div>

        <div className={styles.itemActions}>
          <DeleteButton confirmText={`Delete "${service.name}"?`} onDelete={() => deleteService(service.id)} />
        </div>
      </div>

      <details className={styles.editDisclosure}>
        <summary>
          <Pencil size={13} />
          Edit service
        </summary>
        <div className={styles.editBody}>
          <ServiceForm service={service} />
        </div>
      </details>
    </article>
  );
}
