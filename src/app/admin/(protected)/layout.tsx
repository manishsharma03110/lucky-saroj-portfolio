import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSessionProvider } from "@/components/admin/AdminSessionProvider";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

// Session-gated CMS screens must always render per-request.
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  return (
    <AdminSessionProvider>
      <div className="flex min-h-screen bg-[var(--color-paper-dim)]">
        <AdminSidebar userName={session.user.name} />
        <main className="flex-1 overflow-x-hidden px-8 py-8">{children}</main>
      </div>
    </AdminSessionProvider>
  );
}
