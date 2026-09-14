ALTER TABLE "site_settings"
  ADD COLUMN IF NOT EXISTS "google_analytics_measurement_id" text;

ALTER TABLE "portfolio_projects"
  ADD COLUMN IF NOT EXISTS "thumbnail_alt" text;

ALTER TABLE "site_settings"
  ADD CONSTRAINT "site_settings_ga_measurement_id_format"
  CHECK (
    "google_analytics_measurement_id" IS NULL
    OR "google_analytics_measurement_id" = ''
    OR "google_analytics_measurement_id" ~ '^G-[A-Z0-9]+$'
  );

ALTER TABLE "portfolio_projects"
  ADD CONSTRAINT "portfolio_projects_thumbnail_alt_bounded"
  CHECK ("thumbnail_alt" IS NULL OR char_length("thumbnail_alt") <= 300);
