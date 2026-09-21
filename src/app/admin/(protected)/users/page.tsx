import { sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/authorization";
import { AdminControls, CreateAdminForm } from "@/components/admin/AccountForms";
export default async function UsersPage() {
  const actor = await requirePermission("admin_users.manage");
  if (actor.role !== "SUPER_ADMIN") notFound();
  const users = await db.execute<{ id: string; name: string; email: string; role: string; is_active: boolean; last_login_at: Date | null }>(sql`
    SELECT a.id,a.name,a.email,r.key AS role,a.is_active,a.last_login_at
    FROM admin_users a JOIN roles r ON r.id=a.role_id ORDER BY a.created_at,a.id`);
  return <div className="space-y-8"><h1 className="text-3xl font-semibold">Administrators</h1>
    <section className="space-y-4"><h2 className="text-xl font-semibold">Add administrator</h2><CreateAdminForm/></section>
    <section className="space-y-4" aria-label="Administrator accounts">{users.rows.map(user=><article key={user.id} className="space-y-3 rounded-lg border border-white/15 p-5">
      <h2 className="text-xl">{user.name}</h2><p>{user.email} · {user.role} · {user.is_active ? "Active" : "Disabled"}</p>
      <p className="text-sm">Last login: {user.last_login_at ? new Date(user.last_login_at).toISOString() : "Not recorded"}</p>
      <AdminControls id={user.id} role={user.role} active={user.is_active} self={user.id===actor.admin.id}/>
    </article>)}</section>
  </div>;
}
