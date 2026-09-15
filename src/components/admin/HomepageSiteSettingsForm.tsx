"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { FormCard } from "@/components/admin/FormParts";
import { MediaForm } from "@/components/admin/MediaForm";
import { FileUpload } from "@/components/admin/FileUpload";
import { updateSettings } from "@/lib/actions/settings";
import type { ActionState } from "@/lib/actions/portfolio";
import type { schema } from "@/lib/db";
import styles from "./AdminEditorial.module.css";

type BaseSettings = typeof schema.siteSettings.$inferSelect;
type Settings = BaseSettings & {
  twitterCardType: "summary" | "summary_large_image";
  twitterSiteUsername: string | null;
  robotsTxt: string;
};
const initialState: ActionState = { status: "idle" };

export function HomepageSiteSettingsForm({ settings, assetIds = {} }: {
  settings: Settings;
  assetIds?: Partial<Record<"hero_image" | "logo_image" | "favicon" | "og_image", string>>;
}) {
  const [state, action, pending] = useActionState(updateSettings, initialState);
  const hidden: Record<string, string> = {
    siteName: settings.siteName, logoText: settings.logoText, logoImageUrl: settings.logoImageUrl ?? "", logoImageAssetId: assetIds.logo_image ?? "",
    favicon: settings.favicon ?? "", faviconAssetId: assetIds.favicon ?? "", contactEmail: settings.contactEmail, contactPhone: settings.contactPhone,
    whatsapp: settings.whatsapp ?? "", location: settings.location, availability: settings.availability, paymentTerms: settings.paymentTerms ?? "",
    turnaroundTime: settings.turnaroundTime ?? "", footerDescription: settings.footerDescription, instagramUrl: settings.instagramUrl ?? "",
    twitterUrl: settings.twitterUrl ?? "", youtubeUrl: settings.youtubeUrl ?? "", linkedinUrl: settings.linkedinUrl ?? "", behanceUrl: settings.behanceUrl ?? "",
    vimeoUrl: settings.vimeoUrl ?? "", seoTitle: settings.seoTitle, seoDescription: settings.seoDescription ?? "", ogImageUrl: settings.ogImageUrl ?? "",
    ogImageAssetId: assetIds.og_image ?? "", googleAnalyticsMeasurementId: settings.googleAnalyticsMeasurementId ?? "",
    googleSiteVerification: settings.googleSiteVerification ?? "", twitterCardType: settings.twitterCardType,
    twitterSiteUsername: settings.twitterSiteUsername ?? "", robotsTxt: settings.robotsTxt,
  };

  return <MediaForm action={action} className={styles.sectionStack}>
    <input type="hidden" name="revision" value={settings.revision} />
    {Object.entries(hidden).map(([name, value]) => <input key={name} type="hidden" name={name} value={value} />)}
    <FormCard title="Homepage Hero & Stats">
      <p className={styles.helper}>These fields feed the visible homepage hero and statistics. They are intentionally editable here only, not in Global Settings.</p>
      <div><Label htmlFor="heroHeading">Hero Heading</Label><Input id="heroHeading" name="heroHeading" defaultValue={settings.heroHeading ?? ""} required /></div>
      <div><Label htmlFor="heroSubheading">Hero Subheading</Label><Input id="heroSubheading" name="heroSubheading" defaultValue={settings.heroSubheading ?? ""} required /></div>
      <div><Label htmlFor="heroDescription">Hero Description</Label><Textarea id="heroDescription" name="heroDescription" rows={3} defaultValue={settings.heroDescription ?? ""} /></div>
      <FileUpload name="heroImageUrl" assetIdName="heroImageAssetId" label="Home Hero Image" kind="image" defaultValue={settings.heroImageUrl} defaultAssetId={assetIds.hero_image} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div><Label htmlFor="statYears">Years</Label><Input id="statYears" name="statYears" defaultValue={settings.statYears ?? ""} /></div>
        <div><Label htmlFor="statProjects">Projects</Label><Input id="statProjects" name="statProjects" defaultValue={settings.statProjects ?? ""} /></div>
        <div><Label htmlFor="statClients">Clients</Label><Input id="statClients" name="statClients" defaultValue={settings.statClients ?? ""} /></div>
        <div><Label htmlFor="statViews">Views</Label><Input id="statViews" name="statViews" defaultValue={settings.statViews ?? ""} /></div>
      </div>
    </FormCard>
    {state.status === "error" && state.message && <p className={styles.feedbackError}>{state.message}</p>}
    {state.status === "success" && state.message && <p className={styles.feedbackSuccess}>{state.message}</p>}
    <div className={styles.saveBar}><Button type="submit" disabled={pending}>{pending ? "Saving..." : "Save Homepage Hero & Stats"}</Button></div>
  </MediaForm>;
}
