"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import styles from "./Login.module.css";
import { getSafeAdminCallbackUrl } from "@/lib/auth/safe-callback-url";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password.");
        return;
      }

      const callbackUrl = getSafeAdminCallbackUrl(searchParams.get("callbackUrl"));
      router.push(callbackUrl);
      router.refresh();
    });
  }

  return (
    <form action={onSubmit} className={styles.form} aria-busy={pending}>
      <div>
        <label className={styles.label} htmlFor="email">Email or Username</label>
        <div className={styles.inputWrap}>
          <Mail size={18} aria-hidden="true" />
          <input className={styles.input} id="email" name="email" type="text" placeholder="Enter your email or username" autoComplete="username" aria-describedby={error ? "login-error" : undefined} aria-invalid={!!error} required />
        </div>
      </div>
      <div>
        <label className={styles.label} htmlFor="password">Password</label>
        <div className={styles.inputWrap}>
          <LockKeyhole size={18} aria-hidden="true" />
          <input className={styles.input} id="password" name="password" type="password" placeholder="Enter your password" autoComplete="current-password" aria-describedby={error ? "login-error" : undefined} aria-invalid={!!error} required />
        </div>
      </div>

      {error && <p id="login-error" role="alert" className={styles.error}>{error}</p>}

      <button type="submit" disabled={pending} className={styles.submit}>
        <span>{pending ? "Signing in..." : "Sign in"}</span>
        {!pending && <ArrowRight size={18} aria-hidden="true" />}
      </button>
    </form>
  );
}
