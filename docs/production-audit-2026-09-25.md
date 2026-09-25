# Production audit — 25 September 2026

Release candidate: PR #97. This report distinguishes source inspection, isolated automated tests and live verification. A page loading does not establish that all its mutations, error states or accessibility requirements pass.

## Scope and evidence

- Public inventory: Home, About, Portfolio, Services, Experience, Testimonials, Contact; ten published project-detail URLs; missing-page behavior.
- CMS inventory: dashboard, home, about, portfolio/list/new/edit, services, experience, contact, testimonials, categories, pages, showreel, navigation, messages, account, users, security, settings, maintenance, activity. `/admin/seo` redirects to settings.
- Auth/API: credentials/session, roles, password changes, project/image/video uploads, public attachments, contact server actions, content version, cleanup cron.
- Production database read-only aggregates: 1 administrator; 0 non-bcrypt passwords; 0 duplicate project slugs; 0 orphan admin roles; 0 orphan media references. No password/hash values retrieved.
- Production server log query: no 5xx records returned in the sampled hour; this is bounded log evidence, not a claim of zero lifetime errors.
- CI: lint, dependency audit, production build, migrations/schema, credential/authorization/upload policy tests, shared counter concurrency, isolated transaction rollback tests, Playwright production server with verified local PostgreSQL TLS.
- Chromium desktop/Pixel emulation retain critical mutation coverage. Firefox/WebKit run public/hero/API smoke checks. Physical phones and installed Safari versions are not represented by WebKit emulation.
- Axe results and lab performance diagnostics are attached to the GitHub Actions report. Critical and serious accessibility results gate CI. Contrast is measured with reduced motion enabled after theme colors settle; animation behavior has separate regressions. Automated checks do not establish complete WCAG conformance.

## Issue register

| ID | Module | Severity / priority | Reproduction and actual behavior | Expected / root cause / correction | Verification |
|---|---|---|---|---|---|
| H01 | Hero | Medium / P1 | Toggle light mode: image becomes a rounded side card; dark hero uses a different composition. | Full section background in both themes. Removed light-only position/size/card overrides; added theme gradients, responsive cover, no parallax enlargement. | Preview visually reviewed; five widths in both themes automated. |
| H02 | Palette | Medium / P1 | Light canvas and surfaces use warm grey/green tokens inconsistent with requested blue editorial palette. | Adopt #F7F8FA/#EEF1F5/white, #111318/#4F5663, #2563EB. Meaningful muted small text uses #606977 for contrast; #747C89 retained as decorative token. | Theme persistence and computed colors tested across public/CMS routes. |
| H03 | Media | Low / P2 | Desktop portfolio images have grayscale applied until hover; hero requested quality 40. | Preserve original media color, use hero quality 75 and responsive srcset. Removed grayscale filter; removed remaining duplicate blurred portrait layer from CMS project-list thumbnails. | Source inspected; preview review; no source image replaced. |
| S01 | Cleanup API | High / P1 | Source authorized destructive expiry cleanup using only spoofable User-Agent. No destructive exploit performed. | Exact constant-time CRON_SECRET Bearer authorization; absent secret fails closed. | Unit and unauthenticated API regressions; scheduler configuration remains pending. |
| S02 | Contact / upload limits | Medium / P1 | Upload limiter was a process-local Map; contact submission lacked shared throttling. | Atomic expiring PostgreSQL counters, separate contact/upload namespaces, hashed addresses, fail closed on database failure. | Concurrent isolated DB test, submission regressions. |
| F01 | Contact and CMS image upload | Medium / P1 | Contact and CMS image UI/API allowed 10 MB through a Vercel function limited to 4.5 MB requests. | Consistent 4 MB cap leaves multipart overhead; client validation and early server size check. | Source and API/UI regressions. CMS direct-to-Blob video uploads retain their existing larger limits. |
| S03 | Attachment URL validation | Medium / P1 | A foreign URL containing `blob.vercel-storage.com/contact-attachments/` passed substring validation. | Parse URL; require HTTPS, actual public Blob hostname, attachment path, no credentials or custom port. | Host/path spoof regression tests. |
| A01 | Testimonials motion | Low / P2 | One extra testimonial repeated continuously in marquee without keyboard pause. | Render additional testimonials once in wrapping layout; preserve original text. | Source reviewed and public page regression. |
| SEO01 | Project titles | Low / P2 | Eight published project titles repeated Lucky Saroj via metadata template. | Use absolute project title when CMS title already contains brand. | Reproduced on live project detail pages; follow-up live titles required after release. |
| A02 | Primary buttons | Medium / P1 | White 14px button labels on #3B82F6 have insufficient normal-text contrast. | Use #2563EB with darker hover/pressed states for solid buttons in both themes. | Automated contrast audit and preview review. |
| P01 | Server queries | Low / P2 | Metadata and page render repeat project/settings reads. | Request-scoped React cache shares results within a render, without cross-request stale CMS data. | Build and public/detail regressions; field impact not benchmarked. |
| A03 | CMS contrast | Medium / P1 | Helper text, timestamps and table headings used #626975 on dark cards (about 3.2:1). | Meaningful text uses theme-aware muted token; CMS solid buttons use accessible blue including hover. Contact Options editor replaces hardcoded dark backgrounds with theme tokens. | Both-theme CMS axe regression; final CI status in delivered report. |
| C01 | Project copy | Low / P2 | Motion Graphic Video Challenge ended with two periods. | Corrected one punctuation character in CMS; retained title and other content. | Saved and public project detail re-opened successfully. |
| S04 | Public attachments | Low / P2 | Upload form did not explain that Blob attachments are accessible to anyone holding the link. | Added an explicit public-link notice before submission. | Preview contact form visibly displays notice. Storage remains public-by-link; private attachment storage is not claimed. |
| C02 | Published project media | Low / P2 | Six project details have no video/media supplied. | Owner must supply actual project assets; no invented content or silent removal. | Live details checked; pending assets. |
| POL01 | Policy content | Informational / P2 | No Privacy/Terms links in public navigation/footer. | Publish owner-approved policies if required for the site's operations. | Content pending; no legal compliance determination made. |
| OPS01 | Test environment | Informational / P2 | Production-start test server rejected insecure local PostgreSQL connection. | CI creates a one-day local TLS certificate and trusts its CA; production TLS rule preserved. | CI rerun. |

## Public pages

| Route | Evidence / finding |
|---|---|
| `/` | Hero before/after screenshots, theme switch, slider, CTA, heading/landmark, reduced-motion and contact popup checks. |
| `/about` | Live title, single H1/main, no desktop overflow or broken loaded images; automated navigation/metadata/a11y. |
| `/portfolio` | Ten project links inventoried; filtering and card/player regression coverage; six projects lack media. |
| `/services` | Live title, single H1/main, no desktop overflow or broken loaded images; service anchor links present. |
| `/experience` | Live title, single H1/main, no desktop overflow or broken loaded images. |
| `/testimonials` | Published content present; automated semantic/a11y coverage. |
| `/contact` | Required-field validation, isolated submission-to-inbox, attachment validation and live TEST inquiry release check. |
| `/portfolio/documentary-style-video` | Live H1/title/canonical, no overflow, video available. |
| `/portfolio/motion-typography-reel` | Live H1/title/canonical, no overflow, video available. |
| `/portfolio/cinematic-nature-video` | Live H1/canonical, no overflow, video available; duplicated title found. |
| `/portfolio/motion-graphic-reel` | Live H1/canonical, no overflow, portrait video available; duplicated title found. |
| `/portfolio/product-launch-commercial` | Live detail and canonical; no video; duplicated title found. |
| `/portfolio/urban-flow` | Live detail and canonical; no video; duplicated title found. |
| `/portfolio/travel-vibes` | Live detail and canonical; no video; duplicated title found. |
| `/portfolio/fitness-motivation` | Live detail and canonical; no video; duplicated title found. |
| `/portfolio/gaming-highlights` | Live detail and canonical; no video; duplicated title found. |
| `/portfolio/brand-film` | Live detail and canonical; no video; duplicated title found. |
| Missing route | Automated 404 response check. |
| `/robots.txt`, `/sitemap.xml` | Automated availability and admin exclusion checks. |

## Release and operational notes

No schema migration is introduced by PR #97. Public rate counters reuse the existing indexed, expiring counter table with disjoint namespaces. Prior migration 0024 and its Neon snapshot remain intact. No production data is removed as part of this audit.

Set a strong `CRON_SECRET` in the Vercel production environment before considering scheduled attachment retention verified. Vercel supplies the Bearer header for its cron requests. Do not add secrets to source, logs or this report. Without the setting the endpoint intentionally returns 403, preventing unauthorized cleanup but also pausing scheduled cleanup.

## Outstanding scope and content

- [→] Supply real media for Brand Film, Fitness Motivation, Gaming Highlights, Product Launch Commercial, Travel Vibes and Urban Flow. No invented media or silent unpublishing.
- [→] Confirm/configure scheduler secret and observe an authenticated scheduled cleanup run; destructive retention behavior was not executed on live attachments.
- [→] Privacy/terms content needs owner-approved policies. No such public links were found; no invented legal promises added.
- [ ] Real-device QA, assistive-technology user testing and field Core Web Vitals not checked. Emulation/axe/lab data do not substitute for these.
- [ ] External video-provider availability for every legacy URL, email delivery outside the CMS inbox, load testing and penetration-test certification are not established.
- [x] Blog, FAQ, pricing and public registration are not in the current observed product navigation; not represented as existing features.

Legend: [ ] Not Checked; [x] Checked & Passed; [!] Issue Found; [✓] Fixed & Verified; [→] Pending. Final release evidence and counts are recorded in the delivered audit report after CI and live checks complete.
