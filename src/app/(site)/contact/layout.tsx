import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ContactPopup } from "@/components/contact/ContactPopup";
import { getSiteSettings } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  return (
    <>
      <Header logoText={settings?.logoText} siteName={settings?.siteName} />
      <main className="flex-1">{children}</main>
      <Footer />
      <ContactPopup />
    </>
  );
}