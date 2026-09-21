# Regression verification

Existing unit/runtime/integration tests are in src/**/*.test.ts and *.test.tsx. Browser tests are in e2e/, isolated from the application's dependency lockfile.

## Browser suite
Use a fresh PostgreSQL 18 database named portfolio_e2e on localhost. Export DATABASE_URL, AUTH_SECRET, E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD (12+ characters), plus CMS_ALLOW_DESTRUCTIVE_LOCAL_DB_TESTS=1. These must be disposable credentials. Run migrations before tests.
```bash
npm ci
npm run ci:migrate
npm install --prefix e2e
cd e2e
npx playwright install chromium
npm test
npx playwright show-report
```
ffmpeg must be installed. Setup generates synthetic local video fixtures and inserts only test records into the explicitly named local database. Suite refuses nonlocal URLs and other database names. Never use production credentials. Dispose of the test database afterward.

Coverage: seven public routes/overflow, slider navigation, both video orientations with playback/pause/close/rotation, new/edit title replacement and saved legacy URL, invalid upload/error recovery, contact validation and actual local inbox delivery.

Upload policy/error tests do not prove a real Vercel Blob round trip. Verify one MP4 and one image upload against a dedicated staging Blob store before release. Browser viewport emulation does not prove physical iPhone/Android behavior.

Failures retain screenshots/traces in the Playwright HTML report. Skipped, blocked or unexecuted checks are not passes.

Account coverage additionally checks add/delete, bcrypt verification, last-login recording, self-delete protection, role changes invalidating sessions, denied editor access and own-password rotation with old-password rejection. Pure validation/policy tests run in CI before migrations.

Public flow tests use the existing returning-visitor sessionStorage flag so the first-interaction contact popup does not intercept slider/video clicks. Fixture About headline and relative poster paths are explicitly populated. Existing upload-initiation handler and file-policy tests also run in CI.
