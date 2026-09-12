import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth/admin";
import { AdminSessionProvider } from "@/components/admin/AdminSessionProvider";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getAuthorizationContext } from "@/lib/auth/authorization";
import styles from "@/components/admin/AdminShell.module.css";
import motion from "@/components/admin/AdminDynamic.module.css";

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
      <div className={`${styles.shell} ${motion.dynamicShell}`}>
        <AdminSidebar userName={admin.name} permissions={[...authorization.permissions]} />
        <main className={styles.main}>
          <div className={`${styles.content} ${motion.dynamicContent}`}>{children}</div>
        </main>
      </div>
    </AdminSessionProvider>
  );
}
