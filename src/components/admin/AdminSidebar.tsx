"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FolderKanban,
  Tags,
  Briefcase,
  Wrench,
  UserCircle,
  Film,
  MessageSquareText,
  Mail,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { PermissionKey } from "@/lib/auth/permissions";

const NAV_SECTIONS = [
  {
    label: "Content Management",
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, permission: "dashboard.view" },
      { label: "Portfolio", href: "/admin/portfolio", icon: FolderKanban, permission: "portfolio.read" },
      { label: "Categories", href: "/admin/categories", icon: Tags, permission: "categories.read" },
      { label: "Experience", href: "/admin/experience", icon: Briefcase, permission: "experience.read" },
      { label: "Services", href: "/admin/services", icon: Wrench, permission: "services.read" },
      { label: "About Me", href: "/admin/about", icon: UserCircle, permission: "about.read" },
      { label: "Showreel", href: "/admin/showreel", icon: Film, permission: "showreel.read" },
      { label: "Testimonials", href: "/admin/testimonials", icon: MessageSquareText, permission: "testimonials.read" },
    ],
  },
  {
    label: "Communication",
    items: [{ label: "Messages", href: "/admin/messages", icon: Mail, permission: "messages.read" }],
  },
  {
    label: "System",
    items: [{ label: "Settings", href: "/admin/settings", icon: Settings, permission: "settings.read" }],
  },
];

export function AdminSidebar({ userName, permissions }: { userName?: string | null; permissions: PermissionKey[] }) {
  const pathname = usePathname();
  const allowed = new Set(permissions);

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-[var(--color-line)] bg-white">
      <div className="flex items-center gap-3 border-b border-[var(--color-line)] px-6 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--color-ink)] font-display text-sm font-bold text-white">
          LS
        </span>
        <div className="leading-none">
          <p className="font-display text-sm font-semibold text-[var(--color-ink)]">
            {userName ?? "Lucky Saroj"}
          </p>
          <p className="timecode mt-0.5">CMS PANEL</p>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
              {section.label}
            </p>
            <ul className="space-y-1">
              {section.items.filter((item) => allowed.has(item.permission as PermissionKey)).map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-[var(--color-accent)] text-white"
                          : "text-[var(--color-ink-soft)] hover:bg-[var(--color-paper-dim)]"
                      )}
                    >
                      <Icon size={16} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-[var(--color-line)] p-3">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--color-ink-soft)] transition-colors hover:bg-[var(--color-paper-dim)]"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}
