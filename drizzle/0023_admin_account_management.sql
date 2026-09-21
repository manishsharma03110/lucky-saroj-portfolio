-- Additive migration; existing accounts and passwords remain unchanged.
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS last_login_at timestamp;
