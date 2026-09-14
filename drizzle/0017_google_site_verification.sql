ALTER TABLE "site_settings"
  ADD COLUMN IF NOT EXISTS "google_site_verification" text;

ALTER TABLE "site_settings"
  ADD CONSTRAINT "site_settings_google_site_verification_bounded"
  CHECK (
    "google_site_verification" IS NULL
    OR char_length("google_site_verification") <= 255
  );
