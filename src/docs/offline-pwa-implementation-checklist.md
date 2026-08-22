# Offline/PWA implementation checklist

This checklist is derived from the current-state audit in `offline-pwa-audit-and-redesign.md` and is intended as an implementation tracker for the real offline feature work.

## Phase 0 — Establish the safe baseline

- [ ] Create a feature branch for offline work and deploy a preview environment.
- [ ] Record the current baseline in Chrome DevTools:
  - manifest warnings
  - service worker registration
  - cache storage entries
  - offline behavior for itinerary + one detail page
- [ ] Confirm the current worker is still the old version in `public/sw.js`.
- [ ] Keep the existing behavior untouched until the new flow is validated.

Relevant files:

- `public/sw.js`
- `src/layouts/BaseLayout.astro`
- `public/manifest.webmanifest`

## Phase 1 — Fix the PWA foundation

- [ ] Add valid 192x192 and 512x512 PNG icons at the paths already referenced by `public/manifest.webmanifest`.
- [ ] Validate the manifest in Chrome and Edge DevTools with no missing-icon or installability warnings.
- [ ] Replace the hand-maintained route list in `public/sw.js` with a build-generated app-shell precache.
- [ ] Cache only the app shell and static assets, not a manual list of HTML pages.
- [ ] Version cache names by build or content version.
- [ ] Remove obsolete worker caches on activation.
- [ ] Keep the old worker until the new app-shell worker is proven.

Relevant files:

- `public/manifest.webmanifest`
- `public/sw.js`

## Phase 2 — Create one offline guide data source

- [ ] Define the offline content contract: version, generated date, points, detail map, slug mapping.
- [ ] Create a single read-only export endpoint such as `/api/offline-guide.json`.
- [ ] Pull the data from Supabase in one controlled server-side export, not from scattered browser fetches.
- [ ] Use one shared slug/location resolver across online and offline paths.
- [ ] Ensure all itinerary links and detail links resolve via the same logic as in `src/utils/getPointsSlug.ts`.
- [ ] Add versioning through a timestamp or deterministic hash.
- [ ] Set HTTP cache headers for update checks, but do not use HTTP cache as the offline source of truth.

Relevant files:

- `src/utils/getPointsSlug.ts`
- `src/pages/api/points.json.ts`
- `src/pages/itinerar.astro`
- `src/pages/bod/[slug].astro`

## Phase 3 — Build browser-side offline storage

- [ ] Add a dedicated IndexedDB layer for offline guide data and metadata.
- [ ] Store:
  - version
  - downloadedAt
  - lastCheckedAt
  - size estimate
  - state: not-downloaded / downloading / ready / update-available / error
- [ ] Implement download flow:
  - fetch offline guide
  - validate structure
  - store to temporary record
  - mark ready only after full atomic write succeeds
- [ ] Implement:
  - delete guide
  - re-download guide
  - check for update
  - cancellation handling
  - clear error state
- [ ] Keep v1 text+details only; do not include full gallery images by default.
- [ ] Add dev-only clear-guide action for repeatable testing.

Relevant files:

- likely new client-side module under `src/lib` or `src/utils`
- existing app shell in `src/layouts/BaseLayout.astro`

## Phase 4 — Make itinerary render from local data

- [ ] Extract the pure itinerary filtering logic from the current SSR page.
- [ ] Make it reusable in online and offline modes.
- [ ] If the guide is ready, filter from local data instead of cached HTML route variants.
- [ ] If offline and no guide is downloaded, show a clear “download guide first” state.
- [ ] Preserve URL query state such as `/itinerar?filtr=ubytovani`.
- [ ] Keep the online SSR path unchanged when the app is connected.
- [ ] Add an itinerary card with actions:
  - Download guide
  - Downloading...
  - Ready
  - Update available
  - Remove guide

Relevant files:

- `src/pages/itinerar.astro`
- `src/components/InstallBanner.astro`

## Phase 5 — Make point details render from local data

- [ ] Extract pure detail preparation from `src/pages/bod/[slug].astro`.
- [ ] Create an offline detail resolver that reads from the downloaded guide dataset.
- [ ] Add a fallback for missing guide data:
  - “This point is not in your downloaded guide”
  - return to itinerary action
- [ ] Ensure the same slug logic is used in online and offline detail rendering.
- [ ] Keep full gallery images out of v1 unless separately added as optional package.
- [ ] Test:
  - grouped point detail
  - standalone point detail
  - direct URL refresh while offline

Relevant files:

- `src/pages/bod/[slug].astro`
- `src/utils/getPointsSlug.ts`

## Phase 6 — Remove the brittle route snapshot model

- [ ] Remove manual detail-route caching from `public/sw.js`.
- [ ] Remove the obsolete injection mechanism from `src/scripts/inject-detail-pages.cjs`.
- [ ] Remove npm script steps tied to route injection once the new flow is validated.
- [ ] Configure the worker navigation fallback to return the app shell for known public routes.
- [ ] Let the client decide whether to render itinerary or detail content from local data.
- [ ] Keep a helpful offline fallback for unknown pages.

Relevant files:

- `public/sw.js`
- `src/scripts/inject-detail-pages.cjs`

## Phase 7 — Unify install, connection, and guide status

- [ ] Replace the disconnected banner/modal/toast/header logic with one shared PWA state manager.
- [ ] Keep installation UX separate from offline guide state.
- [ ] Use install prompt only when the browser offers it.
- [ ] Show Safari-specific instructions for iOS.
- [ ] Remove the misleading “app is ready for offline use” toast that appears on every page load.
- [ ] Show toasts only for important transitions:
  - download complete
  - download failed
  - update available
  - connection lost/restored
- [ ] Keep the header indicator focused on actual connection state; do not treat Online as proof of app readiness.
- [ ] Use a single guide-status model: not-downloaded / downloading / ready / update-available / error.

Relevant files:

- `src/layouts/BaseLayout.astro`
- `src/components/Header.astro`
- `src/components/InstallBanner.astro`
- `src/components/InstallModal.astro`

## Phase 8 — Validate and merge

- [ ] Test on Preview using a clean browser profile.
- [ ] Validate on:
  - Chrome Android
  - Safari iOS
  - Chrome desktop
  - Edge desktop
- [ ] Verify:
  - manifest valid
  - worker installed
  - app shell cached
  - offline guide stored
  - itinerary works offline
  - detail works offline
  - old cache entries removed
- [ ] Confirm no broken fallback gives a blank 503 or home-page fallback incorrectly.
- [ ] Update documentation only after the real behavior is validated.
- [ ] Merge only after the acceptance tests pass.

Relevant files:

- `src/docs/offline-pwa-audit-and-redesign.md`
- `src/docs/offline-pwa.md`

## Release-blocking acceptance criteria

- [ ] PWA is installable in Chrome/Edge with valid icons.
- [ ] The offline guide can be explicitly downloaded.
- [ ] Offline itinerary works with all current filters after reopening the app without network.
- [ ] Offline point details work via both itinerary flow and direct URL refresh.
- [ ] Unknown offline routes show a helpful state instead of 503 or wrong fallback.
- [ ] Newer guide versions are checked after reconnecting and applied only through a clear user action.
- [ ] No stale manual HTML route list remains in the worker.
- [ ] Public docs match actual shipped behavior.

## Suggested implementation order

1. Phase 1 — PWA foundation
2. Phase 2 — offline data contract
3. Phase 3 — browser storage
4. Phase 4 — itinerary rendering from local data
5. Phase 5 — detail rendering from local data
6. Phase 6 — retire brittle route snapshot logic
7. Phase 7 — unify UI status states
8. Phase 8 — validation and merge

This should be treated as the working checklist for the repo until the app is proven offline in preview and then production.
