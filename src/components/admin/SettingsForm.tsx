"use client";

import { useActionState } from "react";
import { Label, Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormCard } from "@/components/admin/FormParts";
import { updateSettings } from "@/lib/actions/settings";
import type { ActionState } from "@/lib/actions/portfolio";
import type { schema } from "@/lib/db";

type Settings = typeof schema.siteSettings.$inferSelect;

const initialState: ActionState = { status: "idle" };

export function SettingsForm({ settings }: { settings?: Settings }) {
  const [state, formAction, pending] = useActionState(updateSettings, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <FormCard title="General">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="logoText">Logo Text</Label>
            <Input id="logoText" name="logoText" defaultValue={settings?.logoText ?? "LS"} maxLength={10} required />
          </div>
        </div>
      </FormCard>

      <FormCard title="Contact & Professional Details">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="siteName">Display Name</Label>
            <Input id="siteName" name="siteName" defaultValue={settings?.siteName ?? "Lucky Saroj"} required />
          </div>
          <div>
            <Label htmlFor="contactEmail">Email</Label>
            <Input id="contactEmail" name="contactEmail" type="email" defaultValue={settings?.contactEmail ?? ""} required />
          </div>
          <div>
            <Label htmlFor="contactPhone">Phone</Label>
            <Input id="contactPhone" name="contactPhone" type="tel" defaultValue={settings?.contactPhone ?? ""} />
          </div>
          <div>
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input id="whatsapp" name="whatsapp" inputMode="tel" defaultValue={settings?.whatsapp ?? ""} />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input id="location" name="location" defaultValue={settings?.location ?? ""} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="availability">Availability</Label>
            <Input id="availability" name="availability" placeholder="Available for freelance projects" defaultValue={settings?.availability ?? ""} />
          </div>
          <div>
            <Label htmlFor="paymentTerms">Payment Terms</Label>
            <Textarea id="paymentTerms" name="paymentTerms" rows={3} placeholder="50% advance, remaining on final delivery" defaultValue={settings?.paymentTerms ?? ""} />
          </div>
          <div>
            <Label htmlFor="turnaroundTime">Turnaround Time</Label>
            <Textarea id="turnaroundTime" name="turnaroundTime" rows={3} placeholder="Typically 3–7 working days depending on scope" defaultValue={settings?.turnaroundTime ?? ""} />
          </div>
        </div>
      </FormCard>

      <FormCard title="Homepage">
        <div>
          <Label htmlFor="heroHeading">Hero Heading</Label>
          <Input id="heroHeading" name="heroHeading" defaultValue={settings?.heroHeading ?? ""} required />
        </div>
        <div>
          <Label htmlFor="heroSubheading">Hero Subheading</Label>
          <Input id="heroSubheading" name="heroSubheading" defaultValue={settings?.heroSubheading ?? ""} required />
        </div>
        <div>
          <Label htmlFor="heroDescription">Hero Description</Label>
          <Textarea id="heroDescription" name="heroDescription" rows={3} defaultValue={settings?.heroDescription ?? ""} />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <Label htmlFor="statYears">Years</Label>
            <Input id="statYears" name="statYears" defaultValue={settings?.statYears ?? "5+"} />
          </div>
          <div>
            <Label htmlFor="statProjects">Projects</Label>
            <Input id="statProjects" name="statProjects" defaultValue={settings?.statProjects ?? "100+"} />
          </div>
          <div>
            <Label htmlFor="statClients">Clients</Label>
            <Input id="statClients" name="statClients" defaultValue={settings?.statClients ?? "50+"} />
          </div>
          <div>
            <Label htmlFor="statViews">Views</Label>
            <Input id="statViews" name="statViews" defaultValue={settings?.statViews ?? "10M+"} />
          </div>
        </div>
      </FormCard>

      <FormCard title="Footer">
        <div>
          <Label htmlFor="footerDescription">Footer Description</Label>
          <Textarea id="footerDescription" name="footerDescription" rows={2} defaultValue={settings?.footerDescription ?? ""} />
        </div>
      </FormCard>

      <FormCard title="Social Links">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="instagramUrl">Instagram URL</Label>
            <Input id="instagramUrl" name="instagramUrl" type="url" defaultValue={settings?.instagramUrl ?? ""} />
          </div>
          <div>
            <Label htmlFor="twitterUrl">X / Twitter URL</Label>
            <Input id="twitterUrl" name="twitterUrl" type="url" defaultValue={settings?.twitterUrl ?? ""} />
          </div>
          <div>
            <Label htmlFor="youtubeUrl">YouTube URL</Label>
            <Input id="youtubeUrl" name="youtubeUrl" type="url" defaultValue={settings?.youtubeUrl ?? ""} />
          </div>
          <div>
            <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
            <Input id="linkedinUrl" name="linkedinUrl" type="url" defaultValue={settings?.linkedinUrl ?? ""} />
          </div>
          <div>
            <Label htmlFor="behanceUrl">Behance URL</Label>
            <Input id="behanceUrl" name="behanceUrl" type="url" defaultValue={settings?.behanceUrl ?? ""} />
          </div>
          <div>
            <Label htmlFor="vimeoUrl">Vimeo URL</Label>
            <Input id="vimeoUrl" name="vimeoUrl" type="url" defaultValue={settings?.vimeoUrl ?? ""} />
          </div>
        </div>
      </FormCard>

      <FormCard title="SEO Settings">
        <div>
          <Label htmlFor="seoTitle">Default Meta Title</Label>
          <Input id="seoTitle" name="seoTitle" defaultValue={settings?.seoTitle ?? ""} required />
        </div>
        <div>
          <Label htmlFor="seoDescription">Default Meta Description</Label>
          <Textarea id="seoDescription" name="seoDescription" rows={2} defaultValue={settings?.seoDescription ?? ""} />
        </div>
      </FormCard>

      {state.status === "error" && state.message && <p className="text-sm text-red-600">{state.message}</p>}
      {state.status === "success" && state.message && <p className="text-sm text-emerald-600">{state.message}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </form>
  );
}
