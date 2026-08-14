"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils/cn";

export function CategoryFilter({
  categories,
}: {
  categories: { id: string; name: string; slug: string }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("category") ?? "all";

  function setCategory(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug === "all") {
      params.delete("category");
    } else {
      params.set("category", slug);
    }
    const qs = params.toString();
    router.push(qs ? `/portfolio?${qs}` : "/portfolio");
  }

  const tabs = [{ id: "all", name: "All", slug: "all" }, ...categories];

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => setCategory(tab.slug)}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition-colors",
            active === tab.slug
              ? "bg-[var(--color-ink)] text-white"
              : "bg-[var(--color-paper-dim)] text-[var(--color-ink-soft)] hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-accent)]"
          )}
        >
          {tab.name}
        </button>
      ))}
    </div>
  );
}
