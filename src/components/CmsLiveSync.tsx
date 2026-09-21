"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

const POLL_INTERVAL_MS = 30000;

export function CmsLiveSync() {
  const router = useRouter();
  const pathname = usePathname();
  const lastVersion = useRef<string | null>(null);
  const disabled = pathname.startsWith("/admin");

  useEffect(() => {
    if (disabled) return;

    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function check() {
      try {
        const response = await fetch("/api/content-version", { cache: "no-store" });
        if (!response.ok) return;
        const { version } = (await response.json()) as { version: string };
        if (lastVersion.current === null) lastVersion.current = version;
        else if (lastVersion.current !== version) {
          lastVersion.current = version;
          router.refresh();
        }
      } catch {
        // A transient network failure should never interrupt the visitor.
      } finally {
        if (!stopped) timer = setTimeout(check, POLL_INTERVAL_MS);
      }
    }

    timer = setTimeout(check, POLL_INTERVAL_MS);
    const onVisibility = () => {
      if (document.visibilityState === "visible") void check();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [disabled, router]);

  return null;
}
