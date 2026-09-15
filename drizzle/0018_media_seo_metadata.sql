ALTER TABLE "project_media"
  ADD COLUMN IF NOT EXISTS "alt_text" text,
  ADD COLUMN IF NOT EXISTS "title" text,
  ADD COLUMN IF NOT EXISTS "description" text;

ALTER TABLE "project_media"
  ADD CONSTRAINT "project_media_alt_text_bounded"
  CHECK ("alt_text" IS NULL OR char_length("alt_text") <= 300),
  ADD CONSTRAINT "project_media_title_bounded"
  CHECK ("title" IS NULL OR char_length("title") <= 200),
  ADD CONSTRAINT "project_media_description_bounded"
  CHECK ("description" IS NULL OR char_length("description") <= 600);
