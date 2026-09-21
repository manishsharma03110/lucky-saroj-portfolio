import { AuthorizationError } from "@/lib/auth/authorization-core";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/authorization";
import { listActivityLogs } from "@/lib/audit/activity-log";
export default async function SecurityPage() {
  await requirePermission("admin_users.manage").catch(error => { if (error instanceof AuthorizationError) notFound(); throw error; });
  const events = await listActivityLogs({ resource: "admin_account", limit: 100 });
  return <div className="space-y-6"><h1 className="text-3xl font-semibold">Security activity</h1>
    <p>Latest 100 successful sign-ins and account changes. Passwords and hashes are never included.</p>
    <ol className="space-y-3">{events.map(event=><li key={event.id} className="rounded border border-white/15 p-4">
      <p>{event.summary}</p><p className="break-all text-sm">{event.actor_email} · {new Date(event.created_at).toISOString()}</p>
    </li>)}</ol>
  </div>;
}
