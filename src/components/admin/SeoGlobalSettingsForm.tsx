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

type Settings = typeof schema.siteSettings.$inferSelect;
const initialState: ActionState = { status: "idle" };

export function SeoGlobalSettingsForm({ settings, ogImageAssetId }: { settings: Settings; ogImageAssetId?: string | null }) {
  const [state, formAction, pending] = useActionState(updateSettings, initialState);

  return (
    <MediaForm action={formAction} className={styles.sectionStack}>
      <input type="hidden" name="revision" value={settings.revision} />
      {/* Preserve non-SEO singleton values because updateSettings validates the complete settings contract. */}
      <input type="hidden" name="logoText" value={settings.logoText ?? "LS"} />
      <input type="hidden" name="siteName" value={settings.siteName ?? "Lucky Saroj"} />
      <input type="hidden" name="contactEmail" value={settings.contactEmail ?? ""} />
      <input type="hidden" name="contactPhone" value={settings.contactPhone ?? ""} />
      <input type="hidden" name="whatsapp" value={settings.whatsapp ?? ""} />
      <input type="hidden" name="location" value={settings.location ?? ""} />
      <input type="hidden" name="availability" value={settings.availability ?? ""} />
      <input type="hidden" name="paymentTerms" value={settings.paymentTerms ?? ""} />
      <input type="hidden" name="turnaroundTime" value={settings.turnaroundTime ?? ""} />
      <input type="hidden" name="heroHeading" value={settings.heroHeading ?? ""} />
      <input type="hidden" name="heroSubheading" value={settings.heroSubheading ?? ""} />
      <input type="hidden" name="heroDescription" value={settings.heroDescription ?? ""} />
      <input type="hidden" name="heroImageUrl" value={settings.heroImageUrl ?? ""} />
      <input type="hidden" name="statYears" value={settings.statYears ?? ""} />
      <input type="hidden" name="statProjects" value={settings.statProjects ?? ""} />
      <input type="hidden" name="statClients" value={settings.statClients ?? ""} />
      <input type="hidden" name="statViews" value={settings.statViews ?? ""} />
      <input type="hidden" name="footerDescription" value={settings.footerDescription ?? ""} />
      <input type="hidden" name="instagramUrl" value={settings.instagramUrl ?? ""} />
      <input type="hidden" name="twitterUrl" value={settings.twitterUrl ?? ""} />
      <input type="hidden" name="youtubeUrl" value={settings.youtubeUrl ?? ""} />
      <input type="hidden" name="linkedinUrl" value={settings.linkedinUrl ?? ""} />
      <input type="hidden" name="behanceUrl" value={settings.behanceUrl ?? ""} />
      <input type="hidden" name="vimeoUrl" value={settings.vimeoUrl ?? ""} />
      <input type="hidden" name="favicon" value={settings.favicon ?? ""} />

      <FormCard title="Global & Technical SEO">
        <div>
          <Label htmlFor="seoTitle">Default Meta Title</Label>
          <Input id="seoTitle" name="seoTitle" defaultValue={settings.seoTitle ?? ""} required />
          <p className={styles.helper}>Fallback title used when a page does not provide its own SEO title.</p>
        </div>
        <div>
          <Label htmlFor="seoDescription">Default Meta Description</Label>
          <Textarea id="seoDescription" name="seoDescription" rows={3} defaultValue={settings.seoDescription ?? ""} />
        </div>
        <FileUpload
          name="ogImageUrl"
          assetIdName="ogImageAssetId"
          label="Default Social / Open Graph Image"
          kind="image"
          defaultValue={settings.ogImageUrl}
          defaultAssetId={ogImageAssetId}
        />
        <p className={styles.helper}>Used only when a page or project does not have its own social image.</p>
        <div>
          <Label htmlFor="googleSiteVerification">Google Search Console Verification Code</Label>
          <Input id="googleSiteVerification" name="googleSiteVerification" maxLength={1024} placeholder="XXXXX" defaultValue={settings.googleSiteVerification ?? ""} autoComplete="off" spellCheck={false} />
          <p className={styles.helper}>Paste the verification content value. A full Google verification meta tag is normalized automatically.</p>
          <FieldError message={state.fieldErrors?.googleSiteVerification} />
        </div>
        <div>
          <Label htmlFor="googleAnalyticsMeasurementId">Google Analytics Measurement ID</Label>
          <Input id="googleAnalyticsMeasurementId" name="googleAnalyticsMeasurementId" placeholder="G-XXXXXXXXXX" defaultValue={settings.googleAnalyticsMeasurementId ?? ""} autoCapitalize="characters" />
          <p className={styles.helper}>Optional. Analytics loads on public pages only when a valid GA4 ID is saved.</p>
        </div>
      </FormCard>

      {state.status === "error" && state.message && <p className={styles.feedbackError}>{state.message}</p>}
      {state.status === "success" && state.message && <p className={styles.feedbackSuccess}>{state.message}</p>}
      <div className={styles.saveBar}>
        <Button type="submit" disabled={pending}>{pending ? "Saving..." : "Save Global SEO"}</Button>
      </div>
    </MediaForm>
  );
}
