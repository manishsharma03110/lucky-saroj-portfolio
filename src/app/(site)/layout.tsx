import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getSiteSettings } from "@/lib/db/queries";

// CMS-driven content should reflect immediately after an admin edit, not
// require a rebuild — render these pages per-request instead of at build time.
export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  return (
    <>
      <Header logoText={settings?.logoText} siteName={settings?.siteName} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
