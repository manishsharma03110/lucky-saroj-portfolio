import { redirect } from "next/navigation";

export default function AdminSeoPage() {
  // Backward-compatible route: Global Settings is now the single authoritative
  // location for site-wide SEO and technical settings.
  redirect("/admin/settings");
}
