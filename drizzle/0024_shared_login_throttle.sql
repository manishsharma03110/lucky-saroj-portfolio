-- Additive migration: shared, atomic login attempts across serverless instances.
CREATE TABLE IF NOT EXISTS admin_login_attempts (
  key_hash text PRIMARY KEY,
  attempts integer NOT NULL CHECK (attempts > 0),
  expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS admin_login_attempts_expiry_idx ON admin_login_attempts (expires_at);
