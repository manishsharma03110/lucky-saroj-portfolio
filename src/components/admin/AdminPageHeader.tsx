import type { ReactNode } from "react";
import styles from "./AdminShell.module.css";

export function AdminPageHeader({
  title,
  description,
  eyebrow,
  action,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  action?: ReactNode;
}) {
  return (
    <div className={styles.pageHeader}>
      <div className={styles.pageHeaderCopy}>
        {eyebrow && <p className={styles.pageEyebrow}>{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action && <div className={styles.pageHeaderAction}>{action}</div>}
    </div>
  );
}
