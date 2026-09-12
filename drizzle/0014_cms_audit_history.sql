CREATE TABLE IF NOT EXISTS activity_logs (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  admin_user_id text REFERENCES admin_users(id) ON DELETE SET NULL,
  actor_name text NOT NULL,
  actor_email text NOT NULL,
  action text NOT NULL,
  resource text NOT NULL,
  resource_id text,
  summary text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp NOT NULL DEFAULT now(),
  CONSTRAINT activity_logs_action_format CHECK (action ~ '^[a-z][a-z0-9_]*$'),
  CONSTRAINT activity_logs_resource_format CHECK (resource ~ '^[a-z][a-z0-9_]*$'),
  CONSTRAINT activity_logs_metadata_object CHECK (jsonb_typeof(metadata) = 'object')
);

CREATE INDEX IF NOT EXISTS activity_logs_created_at_idx
  ON activity_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS activity_logs_admin_user_created_at_idx
  ON activity_logs (admin_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS activity_logs_resource_created_at_idx
  ON activity_logs (resource, resource_id, created_at DESC);
CREATE INDEX IF NOT EXISTS activity_logs_action_created_at_idx
  ON activity_logs (action, created_at DESC);

INSERT INTO permissions (key, resource, action, description)
VALUES ('activity.read', 'activity', 'read', 'View CMS activity and change history')
ON CONFLICT (key) DO UPDATE SET
  resource = EXCLUDED.resource,
  action = EXCLUDED.action,
  description = EXCLUDED.description;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.key = 'activity.read'
WHERE r.key IN ('SUPER_ADMIN', 'ADMIN')
ON CONFLICT DO NOTHING;
