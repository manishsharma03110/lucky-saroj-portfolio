import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ContactPopup } from "@/components/contact/ContactPopup";
import { GoogleAnalytics } from "@/components/seo/GoogleAnalytics";
import { JsonLd } from "@/components/seo/JsonLd";
import { CustomCursorProvider } from "@/components/ui/CustomCursor";
import { MotionReveal } from "@/components/ui/MotionReveal";
import { RouteTransition } from "@/components/ui/RouteTransition";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import quality from "@/components/ui/SiteQuality.module.css";
import { getSiteBranding, getSiteSettings } from "@/lib/db/queries";
import { getPageContent } from "@/lib/db/page-content-service";
import { personJsonLd } from "@/lib/structured-data";

export const dynamic = "force-dynamic";
type NavItem = { label: string; href: string };
function parseNavItems(value?: string): NavItem[] | undefined { if (!value) return undefined; try { const parsed=JSON.parse(value) as unknown; if(!Array.isArray(parsed)) return undefined; const items=parsed.filter((item):item is NavItem=>Boolean(item&&typeof item==="object"&&typeof (item as NavItem).label==="string"&&typeof (item as NavItem).href==="string")).map(item=>({label:item.label.trim(),href:item.href.trim()})).filter(item=>item.label&&item.href); return items.length?items:undefined; } catch { return undefined; } }

export async function generateMetadata(): Promise<Metadata> { const settings=await getSiteSettings(); const socialImage=settings?.ogImageUrl||undefined; return { icons:settings?.favicon?{icon:settings.favicon}:undefined, openGraph:socialImage?{images:[{url:socialImage}]}:undefined, twitter:socialImage?{card:"summary_large_image",images:[socialImage]}:undefined }; }

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, branding, globalPage, contactPage] = await Promise.all([getSiteSettings(),getSiteBranding(),getPageContent("global"),getPageContent("contact")]);
  const global=globalPage.content; const sameAs=[settings?.instagramUrl,settings?.twitterUrl,settings?.youtubeUrl,settings?.linkedinUrl,settings?.behanceUrl,settings?.vimeoUrl]; const navItems=parseNavItems(global.navItemsJson);
  return <CustomCursorProvider><div className={`public-site ${quality.boundary}`}><JsonLd data={personJsonLd({name:settings?.siteName??"Lucky Saroj",jobTitle:"Video Editor",sameAs})}/><a href="#site-main-content" className={quality.skipLink}>Skip to content</a><ScrollProgress/><Header logoText={settings?.logoText} logoImageUrl={branding?.logoImageUrl} siteName={settings?.siteName} roleLabel={global.headerRoleLabel} ctaLabel={global.headerCtaLabel} ctaUrl={global.headerCtaUrl} navItems={navItems} navLabels={{home:global.navHomeLabel,about:global.navAboutLabel,portfolio:global.navPortfolioLabel,services:global.navServicesLabel,experience:global.navExperienceLabel,contact:global.navContactLabel}}/><main id="site-main-content" tabIndex={-1} className={`flex-1 ${quality.main}`}><RouteTransition>{children}</RouteTransition></main><MotionReveal><Footer content={global}/></MotionReveal><ContactPopup copy={global} optionsConfig={contactPage.content.contactOptionsConfig}/>{settings?.googleAnalyticsMeasurementId?<GoogleAnalytics measurementId={settings.googleAnalyticsMeasurementId}/>:null}</div></CustomCursorProvider>;
}
