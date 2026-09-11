import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db, schema } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ServiceForm } from "@/components/admin/ServiceForm";
import { ServiceListItem } from "@/components/admin/ServiceListItem";
import { requirePermission } from "@/lib/auth/authorization";
import { AuthorizationError } from "@/lib/auth/authorization-core";
import styles from "@/components/admin/AdminContent.module.css";

export const metadata: Metadata = { title: "Services" };

export default async function AdminServicesPage() {
  await requirePermission("services.read").catch((error) => {
    if (error instanceof AuthorizationError) notFound();
    throw error;
  });

  const services = await db.select().from(schema.services).orderBy(schema.services.displayOrder);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Content"
        title="Services"
        description="Manage the capabilities and services shown across your portfolio."
      />

      <div className={styles.twoColumn}>
        <div className={styles.listStack}>
          {services.map((service) => (
            <ServiceListItem key={service.id} service={service} />
          ))}
          {services.length === 0 && (
            <div className={styles.emptyState}>No services yet. Add your first service from the form.</div>
          )}
        </div>

        <ServiceForm />
      </div>
    </div>
  );
}
