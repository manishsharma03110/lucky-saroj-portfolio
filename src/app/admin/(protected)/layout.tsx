import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth/admin";
import { AdminSessionProvider } from "@/components/admin/AdminSessionProvider";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getAuthorizationContext } from "@/lib/auth/authorization";
import styles from "@/components/admin/AdminShell.module.css";
import motion from "@/components/admin/AdminDynamic.module.css";
import quality from "@/components/admin/AdminQuality.module.css";

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
        <a href="#admin-main-content" className={quality.skipLink}>Skip to CMS content</a>
        <AdminSidebar userName={admin.name} permissions={[...authorization.permissions]} />
        <main id="admin-main-content" tabIndex={-1} className={`${styles.main} ${quality.mainQuality}`}>
          <div className={`${styles.content} ${motion.dynamicContent}`}>{children}</div>
        </main>
      </div>
    </AdminSessionProvider>
  );
}
