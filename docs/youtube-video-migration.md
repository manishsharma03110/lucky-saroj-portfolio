# YouTube video delivery migration

## Decision
New CMS project/showreel videos use manually uploaded **YouTube Unlisted** videos. The CMS stores a canonical YouTube watch URL in the existing `video_url` text columns. No YouTube Data API/OAuth integration is required, avoiding long-lived Google refresh tokens, quota management, channel authorization, and another privileged upload surface.

## Database safety
No destructive schema migration is required. Existing `portfolio_projects.video_url` and `showreels.video_url` columns remain `text`; their semantic use changes from generic media URL to canonical YouTube URL. Existing image/media ownership tables remain intact.

## Existing Vercel Blob videos
Existing Blob video files are **not deleted automatically** and are not rewritten by a database migration. Migration is deliberate per asset:

1. Inventory project/showreel rows and `project_media` video rows that point to Vercel Blob.
2. Download/retain the original video safely.
3. Upload it to the portfolio owner's YouTube channel as Unlisted.
4. In CMS, replace the Project/Showreel video value with the new YouTube URL. Gallery video rows should be migrated before Blob cleanup as well.
5. Verify the public embed works and preserves the intended poster/title.
6. Only after verification, detach/delete the old Blob media asset through the existing ownership/cleanup workflow.

Until a row has a YouTube reference, the public player will not stream its old direct Blob video. Its poster/thumbnail remains visible, which prevents new direct-Blob delivery while keeping the migration non-destructive and reversible.

## Rollback
Because the schema is unchanged and old Blob objects are retained during migration, rollback is code-only until each old Blob is explicitly cleaned up.
