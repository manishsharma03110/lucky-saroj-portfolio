"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Home,
  FileText,
  Search,
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
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { PermissionKey } from "@/lib/auth/permissions";
import styles from "./AdminShell.module.css";

const NAV_SECTIONS = [
  {
    label: "Content",
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, permission: "dashboard.view" },
      { label: "Homepage", href: "/admin/home", icon: Home, permission: "settings.read" },
      { label: "Page Content", href: "/admin/pages", icon: FileText, permission: "settings.read" },
      { label: "SEO", href: "/admin/seo", icon: Search, permission: "settings.read" },
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const allowed = new Set(permissions);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  const navigation = (
    <>
      <div className={styles.brandBlock}>
        <div className={styles.brandMark}>LS</div>
        <div className={styles.brandCopy}>
          <strong>{userName ?? "Lucky Saroj"}</strong>
          <span>Studio CMS</span>
        </div>
      </div>

      <nav className={styles.navigation} aria-label="Admin navigation">
        {NAV_SECTIONS.map((section) => {
          const visibleItems = section.items.filter((item) => allowed.has(item.permission as PermissionKey));
          if (visibleItems.length === 0) return null;
          return (
            <div className={styles.navSection} key={section.label}>
              <p className={styles.navLabel}>{section.label}</p>
              <ul className={styles.navList}>
                {visibleItems.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(item.href + "/");
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(styles.navItem, active && styles.navItemActive)}
                        onClick={() => setMobileOpen(false)}
                      >
                        <Icon size={17} strokeWidth={1.8} />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className={styles.sidebarFooter}>
        <Link href="/" target="_blank" className={styles.utilityLink}>
          <ExternalLink size={16} />
          <span>View live site</span>
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className={styles.utilityLink}
        >
          <LogOut size={16} />
          <span>Sign out</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside className={styles.desktopSidebar}>{navigation}</aside>

      <header className={styles.mobileHeader}>
        <div className={styles.mobileBrand}>
          <span className={styles.mobileBrandMark}>LS</span>
          <span>Studio CMS</span>
        </div>
        <button
          type="button"
          className={styles.menuButton}
          onClick={() => setMobileOpen(true)}
          aria-label="Open admin navigation"
          aria-expanded={mobileOpen}
        >
          <Menu size={20} />
        </button>
      </header>

      {mobileOpen && (
        <div className={styles.mobileLayer}>
          <button
            className={styles.backdrop}
            type="button"
            aria-label="Close admin navigation"
            onClick={() => setMobileOpen(false)}
          />
          <aside className={styles.mobileDrawer}>
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => setMobileOpen(false)}
              aria-label="Close admin navigation"
            >
              <X size={19} />
            </button>
            {navigation}
          </aside>
        </div>
      )}
    </>
  );
}
