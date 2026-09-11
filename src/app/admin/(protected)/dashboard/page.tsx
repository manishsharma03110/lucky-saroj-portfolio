import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  FolderKanban,
  Star,
  MessageSquareText,
  MessageCircle,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import { db, schema } from "@/lib/db";
import { desc, eq } from "drizzle-orm";
import { requirePermission } from "@/lib/auth/authorization";
import { AuthorizationError } from "@/lib/auth/authorization-core";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import styles from "@/components/admin/AdminShell.module.css";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  await requirePermission("dashboard.view").catch((error) => {
    if (error instanceof AuthorizationError) notFound();
    throw error;
  });

  const [allProjects, featuredRows, allMessages, allTestimonials, recentProjects, recentMessages] = await Promise.all([
    db.select().from(schema.portfolioProjects),
    db.select().from(schema.portfolioProjects).where(eq(schema.portfolioProjects.isFeatured, true)),
    db.select().from(schema.contactMessages),
    db.select().from(schema.testimonials),
    db.select().from(schema.portfolioProjects).orderBy(desc(schema.portfolioProjects.createdAt)).limit(4),
    db.select().from(schema.contactMessages).orderBy(desc(schema.contactMessages.createdAt)).limit(4),
  ]);

  const stats = [
    { label: "Total Projects", value: allProjects.length, icon: FolderKanban },
    { label: "Featured Projects", value: featuredRows.length, icon: Star },
    { label: "Total Messages", value: allMessages.length, icon: MessageCircle },
    { label: "Testimonials", value: allTestimonials.length, icon: MessageSquareText },
  ];

  return (
    <div>
      <AdminPageHeader
        eyebrow="Overview"
        title="Welcome back"
        description="A focused view of your portfolio content, enquiries, and recent activity."
        action={
          <Link href="/admin/portfolio/new" className={styles.primaryAction}>
            <Plus size={16} />
            <span>Add project</span>
          </Link>
        }
      />

      <section className={styles.statsGrid} aria-label="Portfolio overview">
        {stats.map(({ label, value, icon: Icon }) => (
          <article key={label} className={styles.statCard}>
            <div className={styles.statIcon}>
              <Icon size={18} strokeWidth={1.8} />
            </div>
            <div className={styles.statMeta}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          </article>
        ))}
      </section>

      <section className={styles.dashboardGrid}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.panelEyebrow}>Content</p>
              <h2>Recent Projects</h2>
            </div>
            <Link href="/admin/portfolio" className={styles.panelLink}>
              View all <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className={styles.panelList}>
            {recentProjects.map((project) => (
              <div key={project.id} className={styles.listRow}>
                <div className={styles.listCopy}>
                  <strong>{project.title}</strong>
                  <span>{project.year}</span>
                </div>
                <span className={project.status === "published" ? styles.statusPublished : styles.statusDraft}>
                  {project.status === "published" ? "Published" : "Draft"}
                </span>
              </div>
            ))}
            {recentProjects.length === 0 && (
              <div className={styles.emptyState}>
                <FolderKanban size={20} />
                <p>No projects yet.</p>
              </div>
            )}
          </div>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.panelEyebrow}>Inbox</p>
              <h2>Recent Messages</h2>
            </div>
            <Link href="/admin/messages" className={styles.panelLink}>
              View all <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className={styles.panelList}>
            {recentMessages.map((message) => (
              <div key={message.id} className={styles.messageRow}>
                <strong>{message.name}</strong>
                <p>{message.message}</p>
              </div>
            ))}
            {recentMessages.length === 0 && (
              <div className={styles.emptyState}>
                <MessageCircle size={20} />
                <p>No messages yet.</p>
              </div>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
