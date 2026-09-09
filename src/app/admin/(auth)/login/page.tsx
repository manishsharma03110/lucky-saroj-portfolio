import type { Metadata } from "next";
import { Suspense } from "react";
import { ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/admin/LoginForm";
import styles from "@/components/admin/Login.module.css";

export const metadata: Metadata = { title: "Admin Login" };

export default function AdminLoginPage() {
  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="login-heading">
        <div className={styles.brand} aria-label="LS Admin">LS</div>
        <p className={styles.eyebrow}>ADMIN ACCESS</p>
        <h1 id="login-heading" className={styles.heading}>Welcome back.</h1>
        <p className={styles.description}>Sign in to your dashboard to manage your portfolio.</p>
        <Suspense fallback={null}><LoginForm /></Suspense>
        <p className={styles.security}><ShieldCheck size={15} aria-hidden="true" />Only authorized users can access this area.</p>
      </section>
    </main>
  );
}
