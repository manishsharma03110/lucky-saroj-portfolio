"use client";

import { useActionState } from "react";
import { Label, Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormCard } from "@/components/admin/FormParts";
import { saveHomePageContent } from "@/lib/actions/home-content";
import type { ActionState } from "@/lib/actions/portfolio";
import type { HomePageContent } from "@/lib/db/home-content-service";
import styles from "./AdminEditorial.module.css";

const initialState: ActionState = { status: "idle" };

export function HomeContentForm({ content }: { content: HomePageContent }) {
  const [state, formAction, pending] = useActionState(saveHomePageContent, initialState);
  return (
    <form action={formAction} className={styles.sectionStack}>
      <input type="hidden" name="revision" value={content.revision} />

      <FormCard title="Hero Section">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><Label htmlFor="heroPrimaryLabel">Primary CTA Label</Label><Input id="heroPrimaryLabel" name="heroPrimaryLabel" defaultValue={content.heroPrimaryLabel} /></div>
          <div><Label htmlFor="heroPrimaryUrl">Primary CTA URL</Label><Input id="heroPrimaryUrl" name="heroPrimaryUrl" defaultValue={content.heroPrimaryUrl} /></div>
          <div><Label htmlFor="heroShowreelLabel">Showreel CTA Label</Label><Input id="heroShowreelLabel" name="heroShowreelLabel" defaultValue={content.heroShowreelLabel} /></div>
          <div><Label htmlFor="heroShowreelUrl">Showreel CTA URL / Anchor</Label><Input id="heroShowreelUrl" name="heroShowreelUrl" defaultValue={content.heroShowreelUrl} /></div>
        </div>
        <div><Label htmlFor="heroImageAlt">Hero Image Alt Text</Label><Input id="heroImageAlt" name="heroImageAlt" defaultValue={content.heroImageAlt} placeholder="Leave blank when the hero image is decorative" /></div>
      </FormCard>

      <FormCard title="Showreel Section">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><Label htmlFor="showreelEyebrow">Eyebrow</Label><Input id="showreelEyebrow" name="showreelEyebrow" defaultValue={content.showreelEyebrow} /></div>
          <div><Label htmlFor="showreelRuntimeLabel">Runtime Label</Label><Input id="showreelRuntimeLabel" name="showreelRuntimeLabel" defaultValue={content.showreelRuntimeLabel} /></div>
        </div>
      </FormCard>

      <FormCard title="Selected Work Section">
        <div><Label htmlFor="selectedWorkEyebrow">Eyebrow</Label><Input id="selectedWorkEyebrow" name="selectedWorkEyebrow" defaultValue={content.selectedWorkEyebrow} /></div>
        <div><Label htmlFor="selectedWorkHeading">Heading</Label><Input id="selectedWorkHeading" name="selectedWorkHeading" defaultValue={content.selectedWorkHeading} /></div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><Label htmlFor="selectedWorkCtaLabel">CTA Label</Label><Input id="selectedWorkCtaLabel" name="selectedWorkCtaLabel" defaultValue={content.selectedWorkCtaLabel} /></div>
          <div><Label htmlFor="selectedWorkCtaUrl">CTA URL</Label><Input id="selectedWorkCtaUrl" name="selectedWorkCtaUrl" defaultValue={content.selectedWorkCtaUrl} /></div>
        </div>
      </FormCard>

      <FormCard title="Services / What I Do Section">
        <div><Label htmlFor="servicesEyebrow">Eyebrow</Label><Input id="servicesEyebrow" name="servicesEyebrow" defaultValue={content.servicesEyebrow} /></div>
        <div><Label htmlFor="servicesHeading">Heading</Label><Input id="servicesHeading" name="servicesHeading" defaultValue={content.servicesHeading} /></div>
        <div><Label htmlFor="servicesDescription">Description</Label><Textarea id="servicesDescription" name="servicesDescription" rows={3} defaultValue={content.servicesDescription} /></div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><Label htmlFor="servicesCtaLabel">CTA Label</Label><Input id="servicesCtaLabel" name="servicesCtaLabel" defaultValue={content.servicesCtaLabel} /></div>
          <div><Label htmlFor="servicesCtaUrl">CTA URL</Label><Input id="servicesCtaUrl" name="servicesCtaUrl" defaultValue={content.servicesCtaUrl} /></div>
        </div>
      </FormCard>

      <FormCard title="About Preview Section">
        <div><Label htmlFor="aboutEyebrow">Eyebrow</Label><Input id="aboutEyebrow" name="aboutEyebrow" defaultValue={content.aboutEyebrow} /></div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><Label htmlFor="aboutCtaLabel">CTA Label</Label><Input id="aboutCtaLabel" name="aboutCtaLabel" defaultValue={content.aboutCtaLabel} /></div>
          <div><Label htmlFor="aboutCtaUrl">CTA URL</Label><Input id="aboutCtaUrl" name="aboutCtaUrl" defaultValue={content.aboutCtaUrl} /></div>
          <div><Label htmlFor="aboutStatYearsLabel">Years Stat Label</Label><Input id="aboutStatYearsLabel" name="aboutStatYearsLabel" defaultValue={content.aboutStatYearsLabel} /></div>
          <div><Label htmlFor="aboutStatProjectsLabel">Projects Stat Label</Label><Input id="aboutStatProjectsLabel" name="aboutStatProjectsLabel" defaultValue={content.aboutStatProjectsLabel} /></div>
          <div><Label htmlFor="aboutStatClientsLabel">Clients Stat Label</Label><Input id="aboutStatClientsLabel" name="aboutStatClientsLabel" defaultValue={content.aboutStatClientsLabel} /></div>
          <div><Label htmlFor="aboutStatViewsLabel">Views Stat Label</Label><Input id="aboutStatViewsLabel" name="aboutStatViewsLabel" defaultValue={content.aboutStatViewsLabel} /></div>
          <div><Label htmlFor="aboutPortraitFallbackLabel">Portrait Fallback Label</Label><Input id="aboutPortraitFallbackLabel" name="aboutPortraitFallbackLabel" defaultValue={content.aboutPortraitFallbackLabel} /></div>
          <div><Label htmlFor="aboutProfileImageAlt">Profile Image Alt Text</Label><Input id="aboutProfileImageAlt" name="aboutProfileImageAlt" defaultValue={content.aboutProfileImageAlt} placeholder="Falls back to profile name" /></div>
        </div>
        <p className={styles.helper}>Headline and biography continue to come from About Me so the same profile content stays consistent across the site.</p>
      </FormCard>

      <FormCard title="Testimonials Section">
        <div><Label htmlFor="testimonialsEyebrow">Eyebrow</Label><Input id="testimonialsEyebrow" name="testimonialsEyebrow" defaultValue={content.testimonialsEyebrow} /></div>
        <div><Label htmlFor="testimonialsHeading">Heading</Label><Input id="testimonialsHeading" name="testimonialsHeading" defaultValue={content.testimonialsHeading} /></div>
        <div><Label htmlFor="testimonialsDescription">Description</Label><Textarea id="testimonialsDescription" name="testimonialsDescription" rows={3} defaultValue={content.testimonialsDescription} /></div>
      </FormCard>

      <FormCard title="Final CTA Section">
        <div><Label htmlFor="finalCtaEyebrow">Eyebrow</Label><Input id="finalCtaEyebrow" name="finalCtaEyebrow" defaultValue={content.finalCtaEyebrow} /></div>
        <div><Label htmlFor="finalCtaHeading">Heading</Label><Input id="finalCtaHeading" name="finalCtaHeading" defaultValue={content.finalCtaHeading} /></div>
        <div><Label htmlFor="finalCtaDescription">Description</Label><Textarea id="finalCtaDescription" name="finalCtaDescription" rows={3} defaultValue={content.finalCtaDescription} /></div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><Label htmlFor="finalCtaButtonLabel">Button Label</Label><Input id="finalCtaButtonLabel" name="finalCtaButtonLabel" defaultValue={content.finalCtaButtonLabel} /></div>
          <div><Label htmlFor="finalCtaButtonUrl">Button URL</Label><Input id="finalCtaButtonUrl" name="finalCtaButtonUrl" defaultValue={content.finalCtaButtonUrl} /></div>
        </div>
      </FormCard>

      {state.status === "error" && state.message && <p className={styles.feedbackError}>{state.message}</p>}
      {state.status === "success" && state.message && <p className={styles.feedbackSuccess}>{state.message}</p>}
      <div className={styles.saveBar}><Button type="submit" disabled={pending}>{pending ? "Saving..." : "Save Homepage Content"}</Button></div>
    </form>
  );
}
