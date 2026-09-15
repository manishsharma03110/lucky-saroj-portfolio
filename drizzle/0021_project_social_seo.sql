ALTER TABLE portfolio_projects
  ADD COLUMN IF NOT EXISTS og_title text,
  ADD COLUMN IF NOT EXISTS og_description text,
  ADD COLUMN IF NOT EXISTS og_image_url text,
  ADD COLUMN IF NOT EXISTS twitter_title text,
  ADD COLUMN IF NOT EXISTS twitter_description text,
  ADD COLUMN IF NOT EXISTS twitter_image_url text;
ALTER TABLE portfolio_projects ADD CONSTRAINT portfolio_projects_og_title_bounded CHECK (og_title IS NULL OR char_length(og_title)<=200);
ALTER TABLE portfolio_projects ADD CONSTRAINT portfolio_projects_og_description_bounded CHECK (og_description IS NULL OR char_length(og_description)<=320);
ALTER TABLE portfolio_projects ADD CONSTRAINT portfolio_projects_og_image_url_bounded CHECK (og_image_url IS NULL OR char_length(og_image_url)<=2048);
ALTER TABLE portfolio_projects ADD CONSTRAINT portfolio_projects_twitter_title_bounded CHECK (twitter_title IS NULL OR char_length(twitter_title)<=200);
ALTER TABLE portfolio_projects ADD CONSTRAINT portfolio_projects_twitter_description_bounded CHECK (twitter_description IS NULL OR char_length(twitter_description)<=320);
ALTER TABLE portfolio_projects ADD CONSTRAINT portfolio_projects_twitter_image_url_bounded CHECK (twitter_image_url IS NULL OR char_length(twitter_image_url)<=2048);
