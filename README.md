# Lucky Saroj — Video Editor Portfolio & CMS

A full-stack portfolio website and content management system for Lucky Saroj,
built from the supplied Figma UI/UX design and production architecture
document.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Server Actions) + TypeScript |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Database | Postgres (e.g. Neon) via Drizzle ORM |
| Auth | NextAuth v5 (Credentials provider, JWT sessions, bcrypt) |
| Validation | Zod on every mutation, client and server |
| Icons | lucide-react + a few hand-rolled brand SVGs |
| Fonts | Poppins (headings) / Inter (body) via `@fontsource` |

## Two substitutions from the original spec, and why

The architecture doc specifies **Prisma** and Google Fonts via `next/font`.
Both were swapped in this build:

- **Prisma → Drizzle ORM.** The schema (`src/lib/db/schema.ts`) maps 1:1 to
  what a Prisma schema would look like for these entities, and runs against
  the same Postgres database. If you'd rather use Prisma, regenerate a
  `schema.prisma` from `schema.ts` (same fields/relations) and swap the
  client in `src/lib/db/index.ts` and `src/lib/db/queries.ts`.
- **Google Fonts → `@fontsource/poppins` + `@fontsource/inter`.** Same fonts,
  self-hosted npm packages instead of a runtime fetch from Google's CDN. If
  you want `next/font/google` instead, swap the imports in
  `src/app/layout.tsx`.

## Getting started

```bash
npm install
cp .env.example .env   # then fill in DATABASE_URL and AUTH_SECRET
npm run db:push         # create the schema in your Postgres database
npm run db:seed         # seed sample content + an admin user
npm run dev
```

Visit `http://localhost:3000` for the public site and
`http://localhost:3000/admin/login` for the CMS.

**`.env` values you need:**
- `DATABASE_URL` — your Postgres connection string (e.g. from Neon's
  dashboard: Connect to your database → copy the connection string). Hosted
  Neon production must use the pooled endpoint with `sslmode=verify-full`.
- `AUTH_SECRET` — generate one with:
  `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `ADMIN_BOOTSTRAP_EMAIL` and `ADMIN_BOOTSTRAP_PASSWORD` — required by
  `npm run db:seed` only when no administrator exists. Use unique values and
  never commit real credentials. The password must be at least 12 characters.

The bootstrap secret is for initial provisioning, not a permanent shared
password. Rotate production credentials separately and remove the bootstrap
password from the environment when it is no longer needed. The seed remains
idempotent and does not overwrite an existing administrator password. There is
currently no in-app password-change or password-reset screen.

## Project structure

```
src/
  app/
    (site)/            Public pages: Home, About, Portfolio, Experience, Services, Contact
    admin/
      (auth)/login/     Public admin login (no sidebar)
      (protected)/      Dashboard + all CMS CRUD screens (auth-gated by layout + middleware)
    api/auth/           NextAuth route handler
  components/
    layout/             Header, Footer, MobileMenu
    home/ about/ portfolio/ services/ testimonials/ contact/   Public-page sections
    admin/               CMS forms, lists, sidebar
    ui/                  Shared primitives (Button, Input, Select, Container, Badge...)
  lib/
    db/                  Drizzle schema, client, queries, seed script (Postgres)
    actions/             Server actions (one file per CMS module) — Zod-validated, auth-checked
    validations/         Zod schemas
    auth/                NextAuth config (edge-safe + full), split per Next's Edge runtime rules
proxy.ts                 Route protection for /admin/* (Next 16's middleware convention)
```

All public pages and the whole admin CMS are marked `force-dynamic` — they
render fresh on every request instead of being baked in at build time, so
edits made in the CMS show up immediately without a redeploy.

## What's covered

- **Public site** — all 6 pages from the Figma design, pulling live data from
  the database (no hardcoded content in the JSX).
- **Admin CMS** — dashboard with real stats, full CRUD for portfolio projects
  (with tools/category/SEO fields), categories, experience, services, the About
  singleton, showreel, testimonials, and a contact-message inbox with status
  management. Every mutation is a Zod-validated Server Action gated by a
  `requireAdmin()` session check, independent of the route middleware.
- **Auth** — credentials login, bcrypt-hashed passwords, JWT sessions,
  middleware + layout-level redirect for unauthenticated `/admin/*` access.
- **Contact form** — public submissions land in the same `contact_messages`
  table the admin inbox reads from.

## What's not included

- Real media upload/CDN pipeline — `thumbnailUrl` / `videoUrl` fields are
  plain URL inputs in the CMS forms rather than a file-upload widget. The doc
  calls for cloud storage (S3/Cloudinary-style) for this; wiring one in is a
  matter of adding an upload endpoint and pointing these fields at it.
  Placeholder imagery on unseeded thumbnails is pulled from Unsplash via a
  small deterministic picker (`fallbackImage` in `ProjectCard.tsx`) rather
  than committed image files.
- An admin "change password" / user-management screen.
- Automated tests. Everything was verified manually end-to-end (build, dev
  server route checks, a full login → CRUD → public-page cycle) during
  development, but there's no test suite committed.

## Deployment (Vercel + Neon)

1. Push this repo to GitHub.
2. Provision a free Postgres database on [neon.tech](https://neon.tech) — copy
   the connection string from the dashboard.
3. Go to [vercel.com](https://vercel.com), import the GitHub repo. Vercel
   auto-detects Next.js — no custom build config needed.
4. Before the first deploy, add Environment Variables in the Vercel
   project settings: `DATABASE_URL` (your Neon connection string) and
   `AUTH_SECRET` (generate a fresh one — don't reuse a dev value). Supply
   `ADMIN_BOOTSTRAP_EMAIL` and `ADMIN_BOOTSTRAP_PASSWORD` only for an
   explicitly approved initial administrator bootstrap; never commit them.
5. Deploy.
6. From your own machine, point your local `.env`'s `DATABASE_URL` at the
   same database and use the reviewed migration and provisioning procedure.
   Run `npm run db:seed` only when database seeding has been explicitly
   approved. It requires the bootstrap variables when no administrator exists
   and will not replace an existing administrator password.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run db:push` | Sync Drizzle schema to the database |
| `npm run db:seed` | Seed sample content + admin user |
| `npm run db:studio` | Drizzle Studio (visual DB browser) |
