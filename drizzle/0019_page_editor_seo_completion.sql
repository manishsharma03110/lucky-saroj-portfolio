ALTER TABLE page_seo
  ADD COLUMN IF NOT EXISTS page_h1 text,
  ADD COLUMN IF NOT EXISTS page_h2 text,
  ADD COLUMN IF NOT EXISTS twitter_title text,
  ADD COLUMN IF NOT EXISTS twitter_description text,
  ADD COLUMN IF NOT EXISTS twitter_image_url text;

ALTER TABLE page_seo DROP CONSTRAINT IF EXISTS page_seo_page_key_valid;
ALTER TABLE page_seo ADD CONSTRAINT page_seo_page_key_valid
  CHECK (page_key IN ('home','about','portfolio','services','experience','contact','testimonials'));

INSERT INTO page_seo (page_key, meta_title, meta_description, canonical_path, og_title, og_description, robots_index, revision)
VALUES ('testimonials','Testimonials','Client testimonials and feedback for Lucky Saroj video editing and post-production work.','/testimonials','Testimonials','Client testimonials and feedback for Lucky Saroj video editing and post-production work.',true,1)
ON CONFLICT (page_key) DO NOTHING;
