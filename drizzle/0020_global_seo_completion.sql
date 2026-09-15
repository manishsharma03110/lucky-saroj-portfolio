ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS twitter_card_type text NOT NULL DEFAULT 'summary_large_image',
  ADD COLUMN IF NOT EXISTS twitter_site_username text,
  ADD COLUMN IF NOT EXISTS robots_txt text NOT NULL DEFAULT E'User-agent: *\nAllow: /';

ALTER TABLE site_settings DROP CONSTRAINT IF EXISTS site_settings_twitter_card_type_valid;
ALTER TABLE site_settings ADD CONSTRAINT site_settings_twitter_card_type_valid
  CHECK (twitter_card_type IN ('summary', 'summary_large_image'));
ALTER TABLE site_settings DROP CONSTRAINT IF EXISTS site_settings_twitter_site_username_bounded;
ALTER TABLE site_settings ADD CONSTRAINT site_settings_twitter_site_username_bounded
  CHECK (twitter_site_username IS NULL OR char_length(twitter_site_username) <= 16);
ALTER TABLE site_settings DROP CONSTRAINT IF EXISTS site_settings_robots_txt_bounded;
ALTER TABLE site_settings ADD CONSTRAINT site_settings_robots_txt_bounded
  CHECK (char_length(robots_txt) <= 5000);
