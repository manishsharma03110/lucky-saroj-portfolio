"use client";

import { useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { refreshPublicCache } from "@/lib/actions/maintenance";

export function CacheRefreshButton() {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  return <div className="space-y-3"><Button type="button" disabled={pending} onClick={() => startTransition(async () => { const result = await refreshPublicCache(); setMessage(result.message ?? null); })}><RefreshCw size={16} className={pending ? "animate-spin" : ""} />{pending ? "Refreshing..." : "Refresh Public Cache"}</Button>{message && <p className="text-sm text-[var(--text-secondary)]" role="status">{message}</p>}</div>;
}
