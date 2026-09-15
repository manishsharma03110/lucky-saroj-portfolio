"use client";

import { useActionState } from "react";
import { Label, Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FieldError, FormCard } from "@/components/admin/FormParts";
import { updateSettings } from "@/lib/actions/settings";
import type { ActionState } from "@/lib/actions/portfolio";
import type { schema } from "@/lib/db";
import { MediaForm } from "@/components/admin/MediaForm";
import { FileUpload } from "@/components/admin/FileUpload";
import styles from "./AdminEditorial.module.css";

type BaseSettings = typeof schema.siteSettings.$inferSelect;
type Settings = BaseSettings & {
  twitterCardType: "summary" | "summary_large_image";
  twitterSiteUsername: string | null;
  robotsTxt: string;
};

const initialState: ActionState = { status: "idle" };

export function SettingsForm({ settings, logoImageUrl, heroImageAssetId, logoImageAssetId, faviconAssetId, ogImageAssetId }: {
  settings: Settings;
  logoImageUrl?: string | null;
  heroImageAssetId?: string | null;
  logoImageAssetId?: string | null;
  faviconAssetId?: string | null;
  ogImageAssetId?: string | null;
}) {
  const [state, formAction, pending] = useActionState(updateSettings, initialState);

  // These values are owned by the Homepage or Navigation & Social editors. They are
  // submitted unchanged because updateSettings validates the complete singleton record.
  const preserved: Record<string, string> = {
    heroHeading: settings.heroHeading ?? "", heroSubheading: settings.heroSubheading ?? "", heroDescription: settings.heroDescription ?? "",
    heroImageUrl: settings.heroImageUrl ?? "", heroImageAssetId: heroImageAssetId ?? "", statYears: settings.statYears ?? "", statProjects: settings.statProjects ?? "",
    statClients: settings.statClients ?? "", statViews: settings.statViews ?? "", footerDescription: settings.footerDescription ?? "",
    instagramUrl: settings.instagramUrl ?? "", twitterUrl: settings.twitterUrl ?? "", youtubeUrl: settings.youtubeUrl ?? "", linkedinUrl: settings.linkedinUrl ?? "",
    behanceUrl: settings.behanceUrl ?? "", vimeoUrl: settings.vimeoUrl ?? "",
  };

  return (
    <MediaForm action={formAction} className={styles.sectionStack}>
      <input type="hidden" name="revision" value={settings.revision} />
      {Object.entries(preserved).map(([name, value]) => <input key={name} type="hidden" name={name} value={value} />)}

      <FormCard title="Site Identity">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div><Label htmlFor="logoText">Logo Text Fallback</Label><Input id="logoText" name="logoText" defaultValue={settings.logoText ?? "LS"} maxLength={10} required /></div>
          <div><Label htmlFor="siteName">Site Name</Label><Input id="siteName" name="siteName" defaultValue={settings.siteName ?? "Lucky Saroj"} required /></div>
        </div>
        <FileUpload name="logoImageUrl" assetIdName="logoImageAssetId" label="Website Logo Image" kind="image" defaultValue={logoImageUrl} defaultAssetId={logoImageAssetId} />
        <FileUpload name="favicon" assetIdName="faviconAssetId" label="Favicon / Browser Icon" kind="image" defaultValue={settings.favicon} defaultAssetId={faviconAssetId} />
      </FormCard>

      <FormCard title="Contact & Professional Details">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div><Label htmlFor="contactEmail">Email</Label><Input id="contactEmail" name="contactEmail" type="email" defaultValue={settings.contactEmail ?? ""} required /></div>
          <div><Label htmlFor="contactPhone">Phone</Label><Input id="contactPhone" name="contactPhone" type="tel" defaultValue={settings.contactPhone ?? ""} /></div>
          <div><Label htmlFor="whatsapp">WhatsApp</Label><Input id="whatsapp" name="whatsapp" inputMode="tel" defaultValue={settings.whatsapp ?? ""} /></div>
          <div><Label htmlFor="location">Location</Label><Input id="location" name="location" defaultValue={settings.location ?? ""} /></div>
          <div className="sm:col-span-2"><Label htmlFor="availability">Availability</Label><Input id="availability" name="availability" defaultValue={settings.availability ?? ""} /></div>
          <div><Label htmlFor="paymentTerms">Payment Terms</Label><Textarea id="paymentTerms" name="paymentTerms" rows={3} defaultValue={settings.paymentTerms ?? ""} /></div>
          <div><Label htmlFor="turnaroundTime">Turnaround Time</Label><Textarea id="turnaroundTime" name="turnaroundTime" rows={3} defaultValue={settings.turnaroundTime ?? ""} /></div>
        </div>
      </FormCard>

      <FormCard title="Site-wide SEO & Technical Settings">
        <p className={styles.helper}>These are fallback/site-wide values only. Home, About, Services and other pages keep their own Meta/OG/Twitter overrides in that page&apos;s SEO tab.</p>
        <div><Label htmlFor="seoTitle">Default Meta Title</Label><Input id="seoTitle" name="seoTitle" defaultValue={settings.seoTitle ?? ""} required /></div>
        <div><Label htmlFor="seoDescription">Default Meta Description</Label><Textarea id="seoDescription" name="seoDescription" rows={3} defaultValue={settings.seoDescription ?? ""} /></div>
        <FileUpload name="ogImageUrl" assetIdName="ogImageAssetId" label="Default Open Graph / Twitter Image" kind="image" defaultValue={settings.ogImageUrl} defaultAssetId={ogImageAssetId} />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div><Label htmlFor="twitterCardType">Default Twitter Card</Label><select id="twitterCardType" name="twitterCardType" defaultValue={settings.twitterCardType}><option value="summary_large_image">Large image</option><option value="summary">Summary</option></select></div>
          <div><Label htmlFor="twitterSiteUsername">Twitter / X Site Username</Label><Input id="twitterSiteUsername" name="twitterSiteUsername" placeholder="@username" defaultValue={settings.twitterSiteUsername ?? ""} /><FieldError message={state.fieldErrors?.twitterSiteUsername} /></div>
        </div>
        <div><Label htmlFor="googleSiteVerification">Google Search Console Verification Code</Label><Input id="googleSiteVerification" name="googleSiteVerification" maxLength={512} defaultValue={settings.googleSiteVerification ?? ""} autoComplete="off" spellCheck={false} /><p className={styles.helper}>Enter only the verification content value. A full verification meta tag is normalized automatically.</p><FieldError message={state.fieldErrors?.googleSiteVerification} /></div>
        <div><Label htmlFor="googleAnalyticsMeasurementId">Google Analytics Measurement ID</Label><Input id="googleAnalyticsMeasurementId" name="googleAnalyticsMeasurementId" placeholder="G-XXXXXXXXXX" defaultValue={settings.googleAnalyticsMeasurementId ?? ""} /></div>
        <div><Label htmlFor="robotsTxt">robots.txt</Label><Textarea id="robotsTxt" name="robotsTxt" rows={10} defaultValue={settings.robotsTxt} /><p className={styles.helper}>Admin and API routes remain blocked by the public robots route. Sitemap/Host directives must use HTTPS.</p><FieldError message={state.fieldErrors?.robotsTxt} /></div>
        <p className={styles.helper}>Google&apos;s legacy sitemap ping endpoint is retired, so no misleading “Notify Google” button is shown. Keep the sitemap referenced in robots.txt and submit/manage it through Google Search Console.</p>
      </FormCard>

      {state.status === "error" && state.message && <p className={styles.feedbackError}>{state.message}</p>}
      {state.status === "success" && state.message && <p className={styles.feedbackSuccess}>{state.message}</p>}
      <div className={styles.saveBar}><Button type="submit" disabled={pending}>{pending ? "Saving..." : "Save Global Settings"}</Button></div>
    </MediaForm>
  );
}
