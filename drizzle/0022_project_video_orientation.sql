ALTER TABLE portfolio_projects
  ADD COLUMN video_orientation text NOT NULL DEFAULT 'auto';

ALTER TABLE portfolio_projects
  ADD CONSTRAINT portfolio_projects_video_orientation_valid
  CHECK (video_orientation IN ('auto', 'landscape', 'portrait'));

UPDATE portfolio_projects
SET video_orientation = 'portrait'
WHERE slug = 'motion-graphic-reel';
