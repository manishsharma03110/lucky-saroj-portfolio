# Lucky Saroj — Portfolio & Studio CMS

Database-driven video-editor portfolio hosted on Vercel, using Neon PostgreSQL and Vercel Blob media storage.

## Stack
Next.js 16.3.4 App Router, React 19, TypeScript, Tailwind CSS v4, Drizzle ORM, NextAuth credentials/JWT sessions, bcryptjs, Zod, Sharp and Framer Motion. Poppins/Inter load through next/font/google. The public design uses near-black surfaces and electric-blue accents.

## Public routes
- / — hero, selected-work slider, showreel, editing styles, about/testimonial previews, contact CTA
- /about, /portfolio, /services, /experience, /testimonials, /contact
- /portfolio/[slug] — published project detail, video, case study, gallery, tools, related projects and navigation
- /sitemap.xml and /robots.txt

Project counts depend on published database records; they are not fixed in source.

## Studio CMS
/admin/login authenticates administrators. Protected modules include dashboard, home, about, portfolio (new and edit), categories, services, experience, contact, testimonials, navigation, pages, SEO, showreel, settings, maintenance, messages and activity.

Server actions and upload routes enforce permissions independently of navigation visibility. Roles are SUPER_ADMIN, ADMIN and EDITOR; database grants determine access. Sessions are revalidated against active state and session version. Content saves use optimistic revisions and transactional media binding.

Account management: /admin/account provides current-password-verified password changes. SUPER_ADMIN with admin_users.manage uses /admin/users for accounts/role assignment; /admin/security lists security events. Apply migration 0023 before deployment. See [account management](docs/admin-accounts.md).

## Media and video workflow
1. Upload a compressed MP4/WebM in the project form (maximum 25 MB).
2. The server registers an owned media asset; the browser uploads to the dedicated public Vercel Blob store.
3. Save the project to bind the uploaded asset. Images use the Sharp compression endpoint; project banners have no required dimensions or aspect ratio.
4. Home cards show previews and link to project details; project media opens the global player.
5. Direct videos use custom play/pause, seek, mute, time and fullscreen controls. The modal centers contained media in the viewport and supports Escape, close and browser Back.
6. Legacy YouTube, Google Drive, Pinterest and valid HTTP(S) URLs remain supported through provider playback or an external-source fallback. Provider availability, embedding restrictions and branding remain controlled by the provider.

Portrait banners use a single centered cover layer inside landscape cards; playback preserves the whole video's aspect ratio. See [video workflow](docs/video-workflow.md).

## Local setup
Use Node.js 20+ and the committed lockfile:
```bash
npm ci
cp .env.example .env
```
Configure DATABASE_URL, AUTH_SECRET and NEXT_PUBLIC_SITE_URL. Uploads also require PORTFOLIO_MEDIA_READ_WRITE_TOKEN for a dedicated Blob store. Use a disposable development database. The guarded seed requires a localhost database name matching cms_phase3e_* and CMS_ALLOW_DESTRUCTIVE_LOCAL_DB_TESTS=1; it is disabled in production. Browser tests create their own fixtures in the separately guarded portfolio_e2e database.

For a fresh disposable database, replay the SQL migrations with DATABASE_URL exported, then provision approved local content/admin using the seed script:
```bash
npm run ci:migrate
npm run db:seed
npm run dev
```
The seed requires ADMIN_BOOTSTRAP_EMAIL/PASSWORD when no admin exists. It does not replace existing admin passwords. Do not run bootstrap or sample seeding against existing production data.

## Validation
```bash
npm run lint
npm run build
```
The repository already contains Node/tsx unit, runtime and database integration tests. Browser regression instructions are maintained in [testing](docs/testing.md). Never interpret skipped environment-dependent tests as passes.

## Deployment
The existing GitHub/Vercel project serves production. Configure runtime secrets in Vercel, review the branch diff and CI results, rehearse any schema migration, then deploy through the established Git integration. Migrations are separate from builds and application startup. Never replay the baseline over an existing database or use db:push to change production.

See [database migrations](docs/database-migrations.md) and [PR audit](docs/pr-audit-2026-09-21.md).

## Source map
- src/app/(site): public routes; src/app/admin: CMS
- src/app/api/upload: authenticated uploads and callbacks
- src/components/admin: forms and media management
- src/components/ui/GlobalVideoPlayer.tsx: global playback
- src/lib/actions: validated server actions
- src/lib/db: schema, transactions, queries, content and asset services
- src/lib/auth: credentials, session revalidation, permissions and administrator policies
- drizzle: ordered PostgreSQL migrations

## SEO
CMS metadata includes page/project titles and descriptions, H1/H2 overrides, canonical/social metadata, JSON-LD, Google verification and optional Analytics. Contact inquiries are stored in the CMS inbox.

Project banners accept portrait, landscape and square images without required dimensions/aspect ratio. Video orientation defaults to Auto; neither it nor banner dimensions need manual entry. See [video workflow](docs/video-workflow.md).


### Motion and release QA (PR #96)

Public content renders visibly before JavaScript. Scroll reveals progressively enhance offscreen sections; portrait/landscape banners retain a single centered cover layer. Project images use a small requestAnimationFrame-driven 3D tilt on mouse devices only. Reduced-motion and touch users get a static surface. The selected-work carousel has a persistent pause control, pauses when offscreen, and suppresses automatic video previews for reduced motion. Contact opens only from its explicit floating button; Escape closes it and restores focus.

Admin login throttling uses the shared `admin_login_attempts` PostgreSQL table (migration `0024_shared_login_throttle.sql`), not per-worker memory: five attempts per address/identifier pair and fifty per address per 15-minute window. Successful login clears the pair bucket, not the address budget. Only SHA-256 keys are persisted, expired rows are cleaned in bounded batches, and database failures fail closed. Vercel's trusted forwarded-IP header is used in deployment.

Before deploying this auth change, create a Neon backup branch, replay migration 0024 on a verification branch, then apply the additive migration to the production database. The old app remains compatible with the new table. If application validation fails, restore the previous Vercel deployment; retain the additive table to avoid deleting data.

CI covers desktop/mobile-emulated public and CMS workflows, motion preferences, keyboard contact controls, first-click navigation, no-JavaScript visibility, uploads, banner orientation, long URLs, player controls, and isolated-database throttle concurrency/expiry. Physical-device QA is outside this release's requested scope.
