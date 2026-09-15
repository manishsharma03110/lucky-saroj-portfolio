import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CacheRefreshButton } from "@/components/admin/CacheRefreshButton";
import { FormCard } from "@/components/admin/FormParts";
import { requirePermission } from "@/lib/auth/authorization";
import { AuthorizationError } from "@/lib/auth/authorization-core";

export const metadata: Metadata = { title: "Maintenance" };

export default async function MaintenancePage() {
  await requirePermission("settings.read").catch((error) => { if (error instanceof AuthorizationError) notFound(); throw error; });
  return <div><AdminPageHeader eyebrow="System" title="Maintenance" description="Safe operational tools for refreshing public content without deleting CMS data or media." /><div className="max-w-3xl"><FormCard title="Cache & Revalidation"><p className="text-sm leading-6 text-[var(--text-secondary)]">Use this after a content or SEO update if a public route appears stale. It revalidates pages and metadata only; it does not delete database rows, uploads, sessions or configuration.</p><CacheRefreshButton /></FormCard></div></div>;
}
