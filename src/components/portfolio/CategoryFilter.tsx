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
    if (slug === "all") params.delete("category");
    else params.set("category", slug);
    const query = params.toString();
    router.push(query ? `/portfolio?${query}` : "/portfolio");
  }

  const tabs = [{ id: "all", name: "All", slug: "all" }, ...categories];

  return (
    <div className="-mx-2 overflow-x-auto px-2" aria-label="Filter projects by category">
      <div className="flex min-w-max items-center gap-8 sm:gap-10 lg:min-w-0 lg:flex-wrap lg:gap-12">
        {tabs.map((tab) => {
          const selected = active === tab.slug;
          return (
            <button
              key={tab.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setCategory(tab.slug)}
              className={cn(
                "relative min-h-12 py-3 text-sm transition-colors duration-300 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:transition-transform after:duration-300 motion-reduce:transition-none motion-reduce:after:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cine-accent)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--cine-void)]",
                selected
                  ? "text-[var(--cine-accent)] after:scale-x-100 after:bg-[var(--cine-accent)]"
                  : "text-[var(--cine-text-secondary)] after:scale-x-0 after:bg-[var(--cine-border-strong)] hover:text-[var(--cine-text-primary)] hover:after:scale-x-100"
              )}
            >
              {tab.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
