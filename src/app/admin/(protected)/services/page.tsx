import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db, schema } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ServiceForm } from "@/components/admin/ServiceForm";
import { ServiceListItem } from "@/components/admin/ServiceListItem";
import { requirePermission } from "@/lib/auth/authorization";
import { AuthorizationError } from "@/lib/auth/authorization-core";

export const metadata: Metadata = { title: "Services" };

export default async function AdminServicesPage() {
  await requirePermission("services.read").catch((error) => { if (error instanceof AuthorizationError) notFound(); throw error; });
  const services = await db.select().from(schema.services).orderBy(schema.services.displayOrder);

  return (
    <div>
      <AdminPageHeader title="Services" description="Manage the services you offer" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {services.map((s) => (
            <ServiceListItem key={s.id} service={s} />
          ))}
          {services.length === 0 && (
            <p className="rounded-2xl border border-[var(--color-line)] bg-white px-5 py-8 text-center text-sm text-[var(--color-muted)]">
              No services yet.
            </p>
          )}
        </div>

        <ServiceForm />
      </div>
    </div>
  );
}
