"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { FormCard } from "@/components/admin/FormParts";
import { MediaForm } from "@/components/admin/MediaForm";
import { updateSettings } from "@/lib/actions/settings";
import type { ActionState } from "@/lib/actions/portfolio";
import type { schema } from "@/lib/db";
import styles from "./AdminEditorial.module.css";

type BaseSettings = typeof schema.siteSettings.$inferSelect;
type Settings = BaseSettings & { twitterCardType: "summary" | "summary_large_image"; twitterSiteUsername: string | null; robotsTxt: string };
const initialState: ActionState = { status: "idle" };

export function SocialSettingsForm({ settings, assetIds = {} }: { settings: Settings; assetIds?: Partial<Record<"hero_image" | "logo_image" | "favicon" | "og_image", string>> }) {
  const [state, action, pending] = useActionState(updateSettings, initialState);
  const hidden: Record<string, string> = {
    siteName: settings.siteName, logoText: settings.logoText, logoImageUrl: settings.logoImageUrl ?? "", favicon: settings.favicon ?? "",
    contactEmail: settings.contactEmail, contactPhone: settings.contactPhone, whatsapp: settings.whatsapp ?? "", location: settings.location, availability: settings.availability,
    paymentTerms: settings.paymentTerms ?? "", turnaroundTime: settings.turnaroundTime ?? "", heroHeading: settings.heroHeading, heroSubheading: settings.heroSubheading,
    heroDescription: settings.heroDescription, heroImageUrl: settings.heroImageUrl ?? "", statYears: settings.statYears, statProjects: settings.statProjects,
    statClients: settings.statClients, statViews: settings.statViews, footerDescription: settings.footerDescription, seoTitle: settings.seoTitle,
    seoDescription: settings.seoDescription ?? "", ogImageUrl: settings.ogImageUrl ?? "", googleAnalyticsMeasurementId: settings.googleAnalyticsMeasurementId ?? "",
    googleSiteVerification: settings.googleSiteVerification ?? "", twitterCardType: settings.twitterCardType, twitterSiteUsername: settings.twitterSiteUsername ?? "",
    robotsTxt: settings.robotsTxt, logoImageAssetId: assetIds.logo_image ?? "", heroImageAssetId: assetIds.hero_image ?? "", faviconAssetId: assetIds.favicon ?? "", ogImageAssetId: assetIds.og_image ?? ""
  };
  const profiles: Array<{ name: "instagramUrl" | "youtubeUrl" | "linkedinUrl" | "twitterUrl" | "behanceUrl" | "vimeoUrl"; label: string; value: string | null }> = [
    { name: "instagramUrl", label: "Instagram", value: settings.instagramUrl }, { name: "youtubeUrl", label: "YouTube", value: settings.youtubeUrl },
    { name: "linkedinUrl", label: "LinkedIn", value: settings.linkedinUrl }, { name: "twitterUrl", label: "X / Twitter", value: settings.twitterUrl },
    { name: "behanceUrl", label: "Behance", value: settings.behanceUrl }, { name: "vimeoUrl", label: "Vimeo", value: settings.vimeoUrl },
  ];
  return <MediaForm action={action} className={styles.sectionStack}><input type="hidden" name="revision" value={settings.revision} />{Object.entries(hidden).map(([name, value]) => <input key={name} type="hidden" name={name} value={value} />)}<FormCard title="Social Profiles"><div className="grid grid-cols-1 gap-5 lg:grid-cols-2">{profiles.map(({ name, label, value }) => <div key={name}><Label htmlFor={name}>{label}</Label><Input id={name} name={name} type="url" placeholder="https://" defaultValue={value ?? ""} /></div>)}</div><p className={styles.helper}>Blank profiles stay hidden on the public site. Saved URLs feed the footer and Person structured data automatically. Twitter/X SEO card defaults are managed separately in Global Settings.</p></FormCard>{state.status === "error" && state.message && <p className={styles.feedbackError}>{state.message}</p>}{state.status === "success"&&state.message&&<p className={styles.feedbackSuccess}>{state.message}</p>}<div className={styles.saveBar}><Button type="submit" disabled={pending}>{pending?"Saving...":"Save Social Links"}</Button></div></MediaForm>;
}
