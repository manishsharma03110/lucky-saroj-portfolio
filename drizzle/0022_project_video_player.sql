ALTER TABLE portfolio_projects
  ADD COLUMN IF NOT EXISTS hosted_video_url text,
  ADD COLUMN IF NOT EXISTS video_editor_name text NOT NULL DEFAULT 'Lucky Saroj',
  ADD COLUMN IF NOT EXISTS video_editor_role text NOT NULL DEFAULT 'Video Editor',
  ADD COLUMN IF NOT EXISTS video_tagline text NOT NULL DEFAULT 'Play · Edit · Create',
  ADD COLUMN IF NOT EXISTS video_bottom_label text NOT NULL DEFAULT 'Cinematic Edit';
