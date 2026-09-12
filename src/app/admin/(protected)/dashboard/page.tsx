import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Eye,
  FileText,
  FolderKanban,
  Inbox,
  Mail,
  MessageCircle,
  MessageSquareText,
  Phone,
  Plus,
  SearchCheck,
  Settings,
  Sparkles,
  Star,
} from "lucide-react";
import { db, schema } from "@/lib/db";
import { desc } from "drizzle-orm";
import { requirePermission } from "@/lib/auth/authorization";
import { AuthorizationError } from "@/lib/auth/authorization-core";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import shellStyles from "@/components/admin/AdminShell.module.css";
import styles from "./Dashboard.module.css";

export const metadata: Metadata = { title: "Dashboard" };

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatSubmittedAt(value: Date) {
  return dateFormatter.format(value);
}

export default async function AdminDashboardPage() {
  await requirePermission("dashboard.view").catch((error) => {
    if (error instanceof AuthorizationError) notFound();
    throw error;
  });

  const [allProjects, allMessages, allTestimonials, recentProjects, recentMessages] = await Promise.all([
    db.select().from(schema.portfolioProjects),
    db.select().from(schema.contactMessages),
    db.select().from(schema.testimonials),
    db.select().from(schema.portfolioProjects).orderBy(desc(schema.portfolioProjects.createdAt)).limit(5),
    db.select().from(schema.contactMessages).orderBy(desc(schema.contactMessages.createdAt)).limit(5),
  ]);

  const publishedProjects = allProjects.filter((project) => project.status === "published").length;
  const draftProjects = allProjects.length - publishedProjects;
  const featuredProjects = allProjects.filter((project) => project.isFeatured).length;
  const newMessages = allMessages.filter((message) => message.status === "new").length;
  const readMessages = allMessages.filter((message) => message.status === "read").length;
  const repliedMessages = allMessages.filter((message) => message.status === "replied").length;
  const archivedMessages = allMessages.filter((message) => message.status === "archived").length;
  const publishedTestimonials = allTestimonials.filter((testimonial) => testimonial.status === "published").length;
  const projectHealthIssues = allProjects.filter((project) =>
    project.status === "published" && (!project.thumbnailUrl || !project.seoTitle || !project.seoDescription)
  ).length;
  const pendingEnquiries = newMessages + readMessages;
  const contentHealthTotal = projectHealthIssues + draftProjects;

  const overview = [
    { label: "Published projects", value: publishedProjects, detail: `${draftProjects} draft`, icon: FolderKanban },
    { label: "New enquiries", value: newMessages, detail: `${pendingEnquiries} need attention`, icon: Inbox },
    { label: "Featured work", value: featuredProjects, detail: `${allProjects.length} total projects`, icon: Star },
    { label: "Testimonials", value: publishedTestimonials, detail: `${allTestimonials.length} total`, icon: MessageSquareText },
  ];

  const messageBreakdown = [
    { label: "New", value: newMessages, className: styles.messageNew },
    { label: "Read", value: readMessages, className: styles.messageRead },
    { label: "Replied", value: repliedMessages, className: styles.messageReplied },
    { label: "Archived", value: archivedMessages, className: styles.messageArchived },
  ];

  const quickActions = [
    { href: "/admin/portfolio/new", label: "Add project", detail: "Create new portfolio work", icon: Plus },
    { href: "/admin/messages", label: "Open inbox", detail: "Review contact enquiries", icon: Mail },
    { href: "/admin/pages", label: "Page content", detail: "Edit website copy", icon: FileText },
    { href: "/admin/seo", label: "SEO controls", detail: "Review page metadata", icon: SearchCheck },
    { href: "/admin/settings", label: "Site settings", detail: "Branding and global details", icon: Settings },
  ];

  return (
    <div className={styles.dashboard}>
      <AdminPageHeader
        eyebrow="Command center"
        title="Dashboard"
        description="A clearer operational view of portfolio content, incoming enquiries, and the work that needs attention next."
        action={
          <Link href="/admin/portfolio/new" className={shellStyles.primaryAction}>
            <Plus size={16} aria-hidden="true" />
            <span>Add project</span>
          </Link>
        }
      />

      <section className={styles.overviewGrid} aria-label="CMS overview">
        {overview.map(({ label, value, detail, icon: Icon }) => (
          <article key={label} className={styles.overviewCard}>
            <div className={styles.overviewIcon}><Icon size={18} strokeWidth={1.8} aria-hidden="true" /></div>
            <div className={styles.overviewCopy}>
              <strong>{value}</strong>
              <span>{label}</span>
              <small>{detail}</small>
            </div>
          </article>
        ))}
      </section>

      <section className={styles.attentionGrid} aria-label="Attention summary">
        <article className={`${styles.attentionCard} ${pendingEnquiries > 0 ? styles.attentionPriority : ""}`}>
          <div className={styles.attentionIcon}><MessageCircle size={20} aria-hidden="true" /></div>
          <div>
            <p>Enquiry priority</p>
            <strong>{pendingEnquiries > 0 ? `${pendingEnquiries} conversations need attention` : "Inbox is caught up"}</strong>
            <span>{newMessages > 0 ? `${newMessages} are still new and should be reviewed first.` : "No unread enquiries right now."}</span>
          </div>
          <Link href="/admin/messages" className={styles.inlineAction}>Review inbox <ArrowUpRight size={14} aria-hidden="true" /></Link>
        </article>

        <article className={styles.attentionCard}>
          <div className={styles.attentionIcon}><Sparkles size={20} aria-hidden="true" /></div>
          <div>
            <p>Content health</p>
            <strong>{contentHealthTotal === 0 ? "Portfolio content looks healthy" : `${contentHealthTotal} content checks to review`}</strong>
            <span>{projectHealthIssues} published projects missing thumbnail or SEO details · {draftProjects} drafts.</span>
          </div>
          <Link href="/admin/portfolio" className={styles.inlineAction}>Review projects <ArrowUpRight size={14} aria-hidden="true" /></Link>
        </article>
      </section>

      <section className={styles.messageSummary} aria-label="Message status summary">
        <div className={styles.sectionHeading}>
          <div>
            <p>Inbox pulse</p>
            <h2>Message status</h2>
          </div>
          <Link href="/admin/messages" className={styles.sectionLink}>View messages <ArrowUpRight size={14} aria-hidden="true" /></Link>
        </div>
        <div className={styles.messageStatusGrid}>
          {messageBreakdown.map((item) => (
            <div key={item.label} className={`${styles.messageStatusCard} ${item.className}`}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.mainGrid}>
        <article className={styles.panel}>
          <div className={styles.sectionHeading}>
            <div>
              <p>Inbox</p>
              <h2>Recent enquiries</h2>
            </div>
            <Link href="/admin/messages" className={styles.sectionLink}>View all <ArrowUpRight size={14} aria-hidden="true" /></Link>
          </div>
          <div className={styles.enquiryList}>
            {recentMessages.map((message) => (
              <Link href="/admin/messages" key={message.id} className={`${styles.enquiryRow} ${message.status === "new" ? styles.enquiryNew : ""}`}>
                <div className={styles.enquiryTop}>
                  <div className={styles.enquiryIdentity}>
                    <strong>{message.name}</strong>
                    <span className={`${styles.statusBadge} ${styles[`status${message.status.charAt(0).toUpperCase()}${message.status.slice(1)}` as keyof typeof styles] || ""}`}>{message.status}</span>
                  </div>
                  <time dateTime={message.createdAt.toISOString()}>{formatSubmittedAt(message.createdAt)}</time>
                </div>
                <div className={styles.enquiryMeta}>
                  <span><Mail size={13} aria-hidden="true" /> {message.email}</span>
                  {message.phone && <span><Phone size={13} aria-hidden="true" /> {message.phone}</span>}
                  {message.projectType && <span><FolderKanban size={13} aria-hidden="true" /> {message.projectType}</span>}
                </div>
                <p>{message.message}</p>
              </Link>
            ))}
            {recentMessages.length === 0 && <div className={styles.emptyState}><MessageCircle size={22} /><p>No enquiries yet.</p></div>}
          </div>
        </article>

        <aside className={styles.sideStack}>
          <article className={styles.panel}>
            <div className={styles.sectionHeading}>
              <div>
                <p>Workflow</p>
                <h2>Quick actions</h2>
              </div>
            </div>
            <div className={styles.quickActions}>
              {quickActions.map(({ href, label, detail, icon: Icon }) => (
                <Link href={href} key={href} className={styles.quickAction}>
                  <div className={styles.quickIcon}><Icon size={16} aria-hidden="true" /></div>
                  <div><strong>{label}</strong><span>{detail}</span></div>
                  <ArrowUpRight size={14} aria-hidden="true" />
                </Link>
              ))}
            </div>
          </article>

          <article className={styles.panel}>
            <div className={styles.sectionHeading}>
              <div><p>Health</p><h2>CMS checks</h2></div>
            </div>
            <div className={styles.healthList}>
              <div><span className={pendingEnquiries === 0 ? styles.healthGood : styles.healthWarn}>{pendingEnquiries === 0 ? <CheckCircle2 size={16} /> : <Clock3 size={16} />}</span><p><strong>Enquiries</strong><small>{pendingEnquiries === 0 ? "Nothing waiting" : `${pendingEnquiries} awaiting follow-up`}</small></p></div>
              <div><span className={projectHealthIssues === 0 ? styles.healthGood : styles.healthWarn}>{projectHealthIssues === 0 ? <CheckCircle2 size={16} /> : <CircleAlert size={16} />}</span><p><strong>Published project health</strong><small>{projectHealthIssues === 0 ? "Thumbnail and SEO checks clear" : `${projectHealthIssues} need content review`}</small></p></div>
              <div><span className={draftProjects === 0 ? styles.healthGood : styles.healthNeutral}>{draftProjects === 0 ? <CheckCircle2 size={16} /> : <Eye size={16} />}</span><p><strong>Draft projects</strong><small>{draftProjects === 0 ? "No drafts pending" : `${draftProjects} currently unpublished`}</small></p></div>
            </div>
          </article>
        </aside>
      </section>

      <section className={styles.panel}>
        <div className={styles.sectionHeading}>
          <div><p>Portfolio</p><h2>Recent projects</h2></div>
          <Link href="/admin/portfolio" className={styles.sectionLink}>Manage portfolio <ArrowUpRight size={14} aria-hidden="true" /></Link>
        </div>
        <div className={styles.projectGrid}>
          {recentProjects.map((project) => (
            <Link href={`/admin/portfolio/${project.id}/edit`} key={project.id} className={styles.projectCard}>
              <div>
                <strong>{project.title}</strong>
                <span>{project.year ?? "Year not set"}</span>
              </div>
              <div className={styles.projectFlags}>
                {project.isFeatured && <span className={styles.featuredBadge}><Star size={12} aria-hidden="true" /> Featured</span>}
                <span className={project.status === "published" ? styles.publishedBadge : styles.draftBadge}>{project.status}</span>
              </div>
            </Link>
          ))}
          {recentProjects.length === 0 && <div className={styles.emptyState}><FolderKanban size={22} /><p>No projects yet.</p></div>}
        </div>
      </section>
    </div>
  );
}
