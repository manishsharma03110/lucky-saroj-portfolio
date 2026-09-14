CREATE TABLE IF NOT EXISTS project_related_projects (
  project_id text NOT NULL REFERENCES portfolio_projects(id) ON DELETE CASCADE,
  related_project_id text NOT NULL REFERENCES portfolio_projects(id) ON DELETE CASCADE,
  display_order integer NOT NULL DEFAULT 0,
  CONSTRAINT project_related_projects_pkey PRIMARY KEY (project_id, related_project_id),
  CONSTRAINT project_related_projects_not_self CHECK (project_id <> related_project_id),
  CONSTRAINT project_related_projects_display_order_nonnegative CHECK (display_order >= 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS project_related_projects_project_order_unique
  ON project_related_projects(project_id, display_order);

CREATE INDEX IF NOT EXISTS project_related_projects_related_idx
  ON project_related_projects(related_project_id);
