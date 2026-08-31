import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth/admin";
import { AdminSessionProvider } from "@/components/admin/AdminSessionProvider";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getAuthorizationContext } from "@/lib/auth/authorization";

// Session-gated CMS screens must always render per-request.
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }
  const authorization = await getAuthorizationContext();

  return (
    <AdminSessionProvider>
      <div className="flex min-h-screen bg-[var(--color-paper-dim)]">
        <AdminSidebar userName={admin.name} permissions={[...authorization.permissions]} />
        <main className="flex-1 overflow-x-hidden px-8 py-8">{children}</main>
      </div>
    </AdminSessionProvider>
  );
}
