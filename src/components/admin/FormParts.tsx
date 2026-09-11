import type { ReactNode } from "react";
import styles from "./AdminContent.module.css";

export function FormCard({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className={styles.formCard}>
      {title && <h2 className={styles.formHeader}>{title}</h2>}
      <div className={styles.formBody}>{children}</div>
    </div>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className={styles.fieldError}>{message}</p>;
}

export function CheckboxField({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className={styles.checkboxRow}>
      <input type="checkbox" name={name} defaultChecked={defaultChecked} />
      <span>{label}</span>
    </label>
  );
}
