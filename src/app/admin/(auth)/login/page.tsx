import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Admin Login" };

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden flex-1 bg-[var(--color-ink)] lg:block">
        <div
          className="h-full w-full bg-cover bg-center opacity-60"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop')",
          }}
        />
      </div>

      <div className="flex flex-1 items-center justify-center bg-[var(--color-paper)] px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--color-ink)] font-display text-sm font-bold text-white">
              LS
            </span>
            <div>
              <p className="timecode">WELCOME BACK</p>
              <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">
                Admin Login
              </h1>
            </div>
          </div>
          <p className="mb-8 text-sm text-[var(--color-muted)]">
            Sign in to your dashboard to manage your portfolio.
          </p>
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
          <p className="mt-8 text-center text-xs text-[var(--color-muted)]">
            Only authorized users can access this area.
          </p>
        </div>
      </div>
    </div>
  );
}
