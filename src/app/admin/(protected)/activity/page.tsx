import { requirePermission } from "@/lib/auth/authorization";
import { listActivityFilterOptions, listActivityLogs } from "@/lib/audit/activity-log";
import styles from "./Activity.module.css";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function scalar(value: string | string[] | undefined): string {
  return typeof value === "string" ? value.trim().slice(0, 120) : "";
}

function formatTimestamp(value: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value));
}

function titleCase(value: string): string {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function ActivityPage({ searchParams }: { searchParams: SearchParams }) {
  await requirePermission("activity.read");
  const params = await searchParams;
  const filters = {
    actor: scalar(params.actor),
    action: scalar(params.action),
    resource: scalar(params.resource),
    from: scalar(params.from),
    to: scalar(params.to),
  };
  const [logs, options] = await Promise.all([
    listActivityLogs(filters),
    listActivityFilterOptions(),
  ]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>System history</p>
          <h1>Activity Log</h1>
          <p className={styles.description}>A chronological record of important CMS changes. Sensitive credentials and secrets are never displayed here.</p>
        </div>
        <div className={styles.count}>{logs.length}<span>events shown</span></div>
      </header>

      <form className={styles.filters} method="get" aria-label="Filter activity history">
        <label><span>Admin</span><select name="actor" defaultValue={filters.actor}><option value="">All admins</option>{options.actors.map((actor) => <option key={actor.id} value={actor.id}>{actor.name} · {actor.email}</option>)}</select></label>
        <label><span>Action</span><select name="action" defaultValue={filters.action}><option value="">All actions</option>{options.actions.map((action) => <option key={action} value={action}>{titleCase(action)}</option>)}</select></label>
        <label><span>Resource</span><select name="resource" defaultValue={filters.resource}><option value="">All resources</option>{options.resources.map((resource) => <option key={resource} value={resource}>{titleCase(resource)}</option>)}</select></label>
        <label><span>From</span><input type="date" name="from" defaultValue={filters.from} /></label>
        <label><span>To</span><input type="date" name="to" defaultValue={filters.to} /></label>
        <div className={styles.filterActions}><button type="submit">Apply filters</button><a href="/admin/activity">Reset</a></div>
      </form>

      {logs.length === 0 ? (
        <div className={styles.empty}><strong>No activity found</strong><span>Changes recorded after Phase 12 activation will appear here.</span></div>
      ) : (
        <div className={styles.timeline}>
          {logs.map((log) => {
            const metadata = Object.entries(log.metadata ?? {});
            return (
              <article className={styles.event} key={log.id}>
                <div className={styles.rail}><span /></div>
                <div className={styles.card}>
                  <div className={styles.cardTop}>
                    <div className={styles.badges}><span className={styles.action}>{titleCase(log.action)}</span><span className={styles.resource}>{titleCase(log.resource)}</span></div>
                    <time dateTime={new Date(log.created_at).toISOString()}>{formatTimestamp(log.created_at)} IST</time>
                  </div>
                  <h2>{log.summary}</h2>
                  <p className={styles.actor}>{log.actor_name} <span>· {log.actor_email}</span></p>
                  {log.resource_id && <p className={styles.resourceId}>Resource ID: <code>{log.resource_id}</code></p>}
                  {metadata.length > 0 && <dl className={styles.metadata}>{metadata.map(([key, value]) => <div key={key}><dt>{titleCase(key)}</dt><dd>{Array.isArray(value) ? value.join(", ") : String(value)}</dd></div>)}</dl>}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
