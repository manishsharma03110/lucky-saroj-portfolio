# Administrator accounts
Apply additive migration 0023 before deploying this feature. It adds nullable last_login_at only. Existing passwords/accounts are preserved.

- /admin/account: authenticated administrators change their own password, proving their current password. New passwords require 12 characters and at most 72 UTF-8 bytes.
- /admin/users: SUPER_ADMIN plus admin_users.manage can add accounts, assign SUPER_ADMIN/ADMIN/EDITOR, enable/disable and delete accounts with explicit confirmation.
- /admin/security: admin_users.manage sees successful sign-ins and account changes. The existing /admin/activity also includes these events.

Password hashes use bcrypt cost 12. Password/role/state changes increment session_version; subsequent authenticated requests reject old sessions. Self-delete/disable/demotion and removing the last active SUPER_ADMIN are refused. Security mutations share the existing advisory transaction lock and revalidate actor state, session version and grants inside the transaction.

Security events are committed atomically with account mutations. A failed security audit write rolls back the mutation. Credentials/hashes are not written into the activity metadata or returned to the client. Deleting a user retains audit actor snapshots. Successful sign-in updates last login only if the verified session version is still current.

No password recovery email is added. Existing users remain able to log in after migration. Test account changes on disposable accounts before production release.
