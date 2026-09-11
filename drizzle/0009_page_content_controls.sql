CREATE TABLE "page_content" (
  "page_key" text PRIMARY KEY NOT NULL,
  "content" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "revision" integer NOT NULL DEFAULT 1,
  CONSTRAINT "page_content_page_key_valid" CHECK ("page_content"."page_key" IN ('about','services','experience','portfolio','contact')),
  CONSTRAINT "page_content_revision_positive" CHECK ("page_content"."revision" >= 1)
);--> statement-breakpoint

INSERT INTO "page_content" ("page_key","content") VALUES
('about', jsonb_build_object(
  'heroEyebrow','About the editor','heroPrimaryLabel','View portfolio','heroPrimaryUrl','/portfolio','heroSecondaryLabel','Start a conversation','heroSecondaryUrl','/contact',
  'storyEyebrow','My story','storyHeading','Craft first. Technology in service of the story.','skillsLabel','Skills','toolsLabel','Tools I use',
  'ctaEyebrow','Next chapter','ctaHeading','Bring the next story into focus.','ctaDescription','Explore the work or start a conversation about your project.',
  'ctaPrimaryLabel','Start a conversation','ctaPrimaryUrl','/contact','ctaSecondaryLabel','View portfolio','ctaSecondaryUrl','/portfolio'
)),
('services', jsonb_build_object(
  'heroEyebrow','Services','heroHeading','How I can help tell your story','heroDescription','From YouTube documentaries to fast-paced social reels, I offer end-to-end post-production so you can focus on creating — I’ll handle the edit.',
  'processEyebrow','How we work','processHeading','My Process','process1Title','Brief & Footage','process1Description','Share your raw footage, goals and any reference edits.',
  'process2Title','Rough Cut','process2Description','A first pass structuring the story, pacing and key moments.','process3Title','Refine','process3Description','Sound design, color and motion graphics layered in with your feedback.',
  'process4Title','Deliver','process4Description','Final export in the formats you need, ready to publish.'
)),
('experience', jsonb_build_object(
  'heroEyebrow','Experience','heroHeading','Crafting stories through experience and precision.','heroDescription','Over the years, I’ve worked across different industries and creative environments — sharpening my skills, understanding stories deeper, and delivering impactful edits.',
  'heroPrimaryLabel','View My Work','heroPrimaryUrl','/portfolio','heroSecondaryLabel','Let’s Connect','heroSecondaryUrl','/contact',
  'ctaEyebrow','Next chapter','ctaHeading','Have a project in mind?','ctaDescription','Let’s collaborate and create something impactful together.',
  'ctaPrimaryLabel','Start a Conversation','ctaPrimaryUrl','/contact','ctaSecondaryLabel','View Portfolio','ctaSecondaryUrl','/portfolio'
)),
('portfolio', jsonb_build_object(
  'heroEyebrow','Selected work','heroHeading','Stories shaped to hold attention.','heroDescription','Editing work across formats, built around clarity, pacing, and the moments that make a story land.',
  'collectionEyebrow','Project collection','collectionHeading','More selected work.','caseStudyEyebrow','Featured case study','caseStudyLinkLabel','View case study',
  'emptyHeading','No projects here yet.','emptyDescription','Published work will appear here when it is available.',
  'ctaEyebrow','Next project','ctaHeading','Bring the next story into focus.','ctaDescription','Share the brief, the footage, or simply the idea. We can shape the next piece together.',
  'ctaLabel','Start a Conversation','ctaUrl','/contact'
)),
('contact', jsonb_build_object(
  'heroEyebrow','Contact','heroTitleBefore','Let’s create something','heroTitleAccent','impactful','heroTitleAfter','together.',
  'heroDescription','Have a project in mind or want to discuss an idea? I’d love to hear from you. Let’s bring your story to life.',
  'portfolioCtaHeading','Have a project to discuss?','portfolioCtaDescription','Explore the work and see how different stories have been shaped.',
  'portfolioCtaLabel','View My Work','portfolioCtaUrl','/portfolio'
))
ON CONFLICT ("page_key") DO NOTHING;
