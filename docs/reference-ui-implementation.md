# Reference Portfolio Manager & Cinematic Player

## Phase 1 — Audit
Audited the existing Portfolio CMS, project schema, shared VideoPlayer, media fields and public/admin bindings. Existing project data and CMS architecture are preserved.

## Phase 2 — Portfolio Projects Admin UI
The Projects tab now uses each project's existing `thumbnailUrl`, falling back to `posterUrl`, as the banner. Drag dots and up/down controls are removed from the visual manager. Published, Featured, View, Edit and Delete remain.

## Phase 3 — Portfolio Settings
Existing Settings tab and CMS bindings remain intact; no destructive schema changes were introduced.

## Phase 4 — Cinematic Player
The shared player uses a fully opaque top/bottom cinematic shell matching the approved reference direction.

## Phase 5 — YouTube containment
The embedded YouTube player uses the JS API with native controls/fullscreen disabled in the embedded state, while the custom controls remain. The iframe is constrained between opaque top and bottom bars. YouTube-controlled content cannot be guaranteed branding-free in every native state; direct/self-hosted video is required for that guarantee.

## Phase 6 — Responsive
Existing responsive classes remain; new admin thumbnails have compact mobile dimensions and scale at `sm`.

## Phase 7 — QA
Required verification: GitHub CI lint/build, preview/production deployment, public portfolio/video playback and admin Portfolio Projects tab.

## Phase 8 — Release
Merge only after CI passes, then verify Vercel production is READY and the live routes respond successfully.
