export const PAGE_CONTENT_KEYS = ["about", "services", "experience", "portfolio", "contact"] as const;
export type PageContentKey = (typeof PAGE_CONTENT_KEYS)[number];

export type PageContentField = Readonly<{
  key: string;
  label: string;
  kind?: "input" | "textarea" | "url";
  maxLength?: number;
  defaultValue: string;
}>;

export const PAGE_CONTENT_CONFIG: Record<PageContentKey, { label: string; fields: readonly PageContentField[] }> = {
  about: {
    label: "About Page",
    fields: [
      { key: "heroEyebrow", label: "Hero Eyebrow", defaultValue: "About the editor" },
      { key: "heroPrimaryLabel", label: "Hero Primary Button", defaultValue: "View portfolio" },
      { key: "heroPrimaryUrl", label: "Hero Primary URL", kind: "url", defaultValue: "/portfolio" },
      { key: "heroSecondaryLabel", label: "Hero Secondary Button", defaultValue: "Start a conversation" },
      { key: "heroSecondaryUrl", label: "Hero Secondary URL", kind: "url", defaultValue: "/contact" },
      { key: "storyEyebrow", label: "Story Eyebrow", defaultValue: "My story" },
      { key: "storyHeading", label: "Story Heading", kind: "textarea", maxLength: 240, defaultValue: "Craft first. Technology in service of the story." },
      { key: "skillsLabel", label: "Skills Label", defaultValue: "Skills" },
      { key: "toolsLabel", label: "Tools Label", defaultValue: "Tools I use" },
      { key: "ctaEyebrow", label: "Bottom CTA Eyebrow", defaultValue: "Next chapter" },
      { key: "ctaHeading", label: "Bottom CTA Heading", kind: "textarea", maxLength: 240, defaultValue: "Bring the next story into focus." },
      { key: "ctaDescription", label: "Bottom CTA Description", kind: "textarea", maxLength: 500, defaultValue: "Explore the work or start a conversation about your project." },
      { key: "ctaPrimaryLabel", label: "Bottom Primary Button", defaultValue: "Start a conversation" },
      { key: "ctaPrimaryUrl", label: "Bottom Primary URL", kind: "url", defaultValue: "/contact" },
      { key: "ctaSecondaryLabel", label: "Bottom Secondary Button", defaultValue: "View portfolio" },
      { key: "ctaSecondaryUrl", label: "Bottom Secondary URL", kind: "url", defaultValue: "/portfolio" },
    ],
  },
  services: {
    label: "Services Page",
    fields: [
      { key: "heroEyebrow", label: "Hero Eyebrow", defaultValue: "Services" },
      { key: "heroHeading", label: "Hero Heading", kind: "textarea", maxLength: 240, defaultValue: "How I can help tell your story" },
      { key: "heroDescription", label: "Hero Description", kind: "textarea", maxLength: 600, defaultValue: "From YouTube documentaries to fast-paced social reels, I offer end-to-end post-production so you can focus on creating — I’ll handle the edit." },
      { key: "processEyebrow", label: "Process Eyebrow", defaultValue: "How we work" },
      { key: "processHeading", label: "Process Heading", defaultValue: "My Process" },
      { key: "process1Title", label: "Process 1 Title", defaultValue: "Brief & Footage" },
      { key: "process1Description", label: "Process 1 Description", kind: "textarea", defaultValue: "Share your raw footage, goals and any reference edits." },
      { key: "process2Title", label: "Process 2 Title", defaultValue: "Rough Cut" },
      { key: "process2Description", label: "Process 2 Description", kind: "textarea", defaultValue: "A first pass structuring the story, pacing and key moments." },
      { key: "process3Title", label: "Process 3 Title", defaultValue: "Refine" },
      { key: "process3Description", label: "Process 3 Description", kind: "textarea", defaultValue: "Sound design, color and motion graphics layered in with your feedback." },
      { key: "process4Title", label: "Process 4 Title", defaultValue: "Deliver" },
      { key: "process4Description", label: "Process 4 Description", kind: "textarea", defaultValue: "Final export in the formats you need, ready to publish." },
    ],
  },
  experience: {
    label: "Experience Page",
    fields: [
      { key: "heroEyebrow", label: "Hero Eyebrow", defaultValue: "Experience" },
      { key: "heroHeading", label: "Hero Heading", kind: "textarea", maxLength: 240, defaultValue: "Crafting stories through experience and precision." },
      { key: "heroDescription", label: "Hero Description", kind: "textarea", maxLength: 600, defaultValue: "Over the years, I’ve worked across different industries and creative environments — sharpening my skills, understanding stories deeper, and delivering impactful edits." },
      { key: "heroPrimaryLabel", label: "Hero Primary Button", defaultValue: "View My Work" },
      { key: "heroPrimaryUrl", label: "Hero Primary URL", kind: "url", defaultValue: "/portfolio" },
      { key: "heroSecondaryLabel", label: "Hero Secondary Button", defaultValue: "Let’s Connect" },
      { key: "heroSecondaryUrl", label: "Hero Secondary URL", kind: "url", defaultValue: "/contact" },
      { key: "ctaEyebrow", label: "Bottom CTA Eyebrow", defaultValue: "Next chapter" },
      { key: "ctaHeading", label: "Bottom CTA Heading", defaultValue: "Have a project in mind?" },
      { key: "ctaDescription", label: "Bottom CTA Description", kind: "textarea", defaultValue: "Let’s collaborate and create something impactful together." },
      { key: "ctaPrimaryLabel", label: "Bottom Primary Button", defaultValue: "Start a Conversation" },
      { key: "ctaPrimaryUrl", label: "Bottom Primary URL", kind: "url", defaultValue: "/contact" },
      { key: "ctaSecondaryLabel", label: "Bottom Secondary Button", defaultValue: "View Portfolio" },
      { key: "ctaSecondaryUrl", label: "Bottom Secondary URL", kind: "url", defaultValue: "/portfolio" },
    ],
  },
  portfolio: {
    label: "Portfolio Page",
    fields: [
      { key: "heroEyebrow", label: "Hero Eyebrow", defaultValue: "Selected work" },
      { key: "heroHeading", label: "Hero Heading", kind: "textarea", maxLength: 240, defaultValue: "Stories shaped to hold attention." },
      { key: "heroDescription", label: "Hero Description", kind: "textarea", maxLength: 600, defaultValue: "Editing work across formats, built around clarity, pacing, and the moments that make a story land." },
      { key: "collectionEyebrow", label: "Collection Eyebrow", defaultValue: "Project collection" },
      { key: "collectionHeading", label: "Collection Heading", defaultValue: "More selected work." },
      { key: "caseStudyEyebrow", label: "Case Study Eyebrow", defaultValue: "Featured case study" },
      { key: "caseStudyLinkLabel", label: "Case Study Link Label", defaultValue: "View case study" },
      { key: "emptyHeading", label: "Empty State Heading", defaultValue: "No projects here yet." },
      { key: "emptyDescription", label: "Empty State Description", kind: "textarea", defaultValue: "Published work will appear here when it is available." },
      { key: "ctaEyebrow", label: "Bottom CTA Eyebrow", defaultValue: "Next project" },
      { key: "ctaHeading", label: "Bottom CTA Heading", defaultValue: "Bring the next story into focus." },
      { key: "ctaDescription", label: "Bottom CTA Description", kind: "textarea", defaultValue: "Share the brief, the footage, or simply the idea. We can shape the next piece together." },
      { key: "ctaLabel", label: "Bottom CTA Button", defaultValue: "Start a Conversation" },
      { key: "ctaUrl", label: "Bottom CTA URL", kind: "url", defaultValue: "/contact" },
    ],
  },
  contact: {
    label: "Contact Page",
    fields: [
      { key: "heroEyebrow", label: "Hero Eyebrow", defaultValue: "Contact" },
      { key: "heroTitleBefore", label: "Hero Title Before Accent", defaultValue: "Let’s create something" },
      { key: "heroTitleAccent", label: "Hero Accent Word", defaultValue: "impactful" },
      { key: "heroTitleAfter", label: "Hero Title After Accent", defaultValue: "together." },
      { key: "heroDescription", label: "Hero Description", kind: "textarea", maxLength: 600, defaultValue: "Have a project in mind or want to discuss an idea? I’d love to hear from you. Let’s bring your story to life." },
      { key: "portfolioCtaHeading", label: "Portfolio CTA Heading", defaultValue: "Have a project to discuss?" },
      { key: "portfolioCtaDescription", label: "Portfolio CTA Description", kind: "textarea", defaultValue: "Explore the work and see how different stories have been shaped." },
      { key: "portfolioCtaLabel", label: "Portfolio CTA Button", defaultValue: "View My Work" },
      { key: "portfolioCtaUrl", label: "Portfolio CTA URL", kind: "url", defaultValue: "/portfolio" },
    ],
  },
};

export function defaultPageContent(pageKey: PageContentKey): Record<string, string> {
  return Object.fromEntries(PAGE_CONTENT_CONFIG[pageKey].fields.map((field) => [field.key, field.defaultValue]));
}
