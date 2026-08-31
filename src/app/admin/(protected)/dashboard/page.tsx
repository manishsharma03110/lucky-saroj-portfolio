import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FolderKanban, Star, MessageSquareText, MessageCircle, Plus } from "lucide-react";
import { db, schema } from "@/lib/db";
import { desc, eq } from "drizzle-orm";
import { Button } from "@/components/ui/Button";
import { requirePermission } from "@/lib/auth/authorization";
import { AuthorizationError } from "@/lib/auth/authorization-core";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  await requirePermission("dashboard.view").catch((error) => { if (error instanceof AuthorizationError) notFound(); throw error; });
  const [allProjects, featuredRows, allMessages, allTestimonials, recentProjects, recentMessages] = await Promise.all([
    db.select().from(schema.portfolioProjects),
    db.select().from(schema.portfolioProjects).where(eq(schema.portfolioProjects.isFeatured, true)),
    db.select().from(schema.contactMessages),
    db.select().from(schema.testimonials),
    db.select().from(schema.portfolioProjects).orderBy(desc(schema.portfolioProjects.createdAt)).limit(4),
    db.select().from(schema.contactMessages).orderBy(desc(schema.contactMessages.createdAt)).limit(4),
  ]);

  const totalProjects = allProjects.length;
  const featuredProjects = featuredRows.length;
  const totalMessages = allMessages.length;
  const totalTestimonials = allTestimonials.length;

  const stats = [
    { label: "Total Projects", value: totalProjects, icon: FolderKanban },
    { label: "Featured Projects", value: featuredProjects, icon: Star },
    { label: "Total Messages", value: totalMessages, icon: MessageCircle },
    { label: "Testimonials", value: totalTestimonials, icon: MessageSquareText },
  ];

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">
            Welcome back, Lucky! 👋
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Here&rsquo;s what&rsquo;s happening with your portfolio.
          </p>
        </div>
        <Button href="/admin/portfolio/new" className="gap-2">
          <Plus size={16} /> Add New Project
        </Button>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-[var(--color-line)] bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                <Icon size={18} />
              </span>
            </div>
            <p className="font-display text-2xl font-bold text-[var(--color-ink)]">{value}</p>
            <p className="text-xs text-[var(--color-muted)]">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--color-line)] bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-[var(--color-ink)]">
              Recent Projects
            </h2>
            <Link href="/admin/portfolio" className="text-xs font-medium text-[var(--color-accent)]">
              View All
            </Link>
          </div>
          <ul className="divide-y divide-[var(--color-line)]">
            {recentProjects.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-[var(--color-ink)]">{p.title}</p>
                  <p className="text-xs text-[var(--color-muted)]">{p.year}</p>
                </div>
                <span
                  className={
                    "rounded-full px-2.5 py-1 text-xs font-medium " +
                    (p.status === "published"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-neutral-100 text-neutral-500")
                  }
                >
                  {p.status === "published" ? "Published" : "Draft"}
                </span>
              </li>
            ))}
            {recentProjects.length === 0 && (
              <p className="py-3 text-sm text-[var(--color-muted)]">No projects yet.</p>
            )}
          </ul>
        </div>

        <div className="rounded-2xl border border-[var(--color-line)] bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-[var(--color-ink)]">
              Recent Messages
            </h2>
            <Link href="/admin/messages" className="text-xs font-medium text-[var(--color-accent)]">
              View All
            </Link>
          </div>
          <ul className="divide-y divide-[var(--color-line)]">
            {recentMessages.map((m) => (
              <li key={m.id} className="py-3">
                <p className="text-sm font-medium text-[var(--color-ink)]">{m.name}</p>
                <p className="line-clamp-2 text-xs text-[var(--color-muted)]">{m.message}</p>
              </li>
            ))}
            {recentMessages.length === 0 && (
              <p className="py-3 text-sm text-[var(--color-muted)]">No messages yet.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
