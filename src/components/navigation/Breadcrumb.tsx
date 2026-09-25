import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { absoluteSiteUrl } from "@/lib/seo";

type BreadcrumbItem = { label: string; href?: string };

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  if (items.length < 2) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: absoluteSiteUrl(item.href) } : {}),
    })),
  };

  return (
    <>
      <JsonLd data={schema} />
      <nav aria-label="Breadcrumb" className="border-b border-white/[0.07] bg-[var(--background-primary)]">
        <div className="mx-auto flex min-h-11 w-full max-w-[1480px] items-center gap-1.5 overflow-x-auto px-5 py-2 text-xs text-[var(--text-readable,var(--text-muted))] sm:px-8 lg:px-12 2xl:px-16">
          {items.map((item, index) => {
            const current = index === items.length - 1;
            return (
              <span key={`${item.label}-${index}`} className="inline-flex shrink-0 items-center gap-1.5">
                {index > 0 && <ChevronRight size={13} aria-hidden className="text-white/25" />}
                {item.href && !current ? (
                  <Link href={item.href} className="rounded-sm py-1 transition-colors hover:text-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]">{item.label}</Link>
                ) : (
                  <span aria-current={current ? "page" : undefined} className={current ? "max-w-[48vw] truncate text-[var(--text-secondary)]" : undefined}>{item.label}</span>
                )}
              </span>
            );
          })}
        </div>
      </nav>
    </>
  );
}
