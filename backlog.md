# Backlog — non-spooky-react-cookie

## Done

- [x] Script loading — consent-gated load/unload primitives (`script-loader.ts`, `script-registry.ts`, `script-runtime.ts`, `useConsentScript`, `loadConsentScript`) — commits `ad88df6`, `9b00aaa`
- [x] Package structure + README docs — commits `da58fa9`, `181052c`, `ad88df6`
- [x] **Item consent gates independently of its parent category** — selecting just an item (e.g. Meta Pixel) now loads its script; the category switch is a convenience toggle, not a hard gate. `isGateAllowed` / `isAllowed` no longer require the parent. README + app comments updated.
- [x] **Ready-made public types** — added `ConsentScripts = Record<string, ConsentScript>` and `TextOverrides = DeepPartial<Texts>`, used them in the provider props/context, and exported them from `index.ts`. App (`lib/consent-config.ts`) now imports the named types instead of the raw records.
- [x] **Pluggable storage (2026-09-15)** — `storage.ts` split into `src/storage/` with a `PreferencesStorage` strategy (`get`/`set`/`remove` on strings). Provider props `storage` (`"localStorage"` default | `"cookie"` | `"both"` | custom adapter), `cookieOptions`, `initialPreferences`. `"both"` writes to both and reads cookie-first. Server-side `readPreferencesFromCookies(headerOrCookieStore, key)` for Next/Node. App uses `storage: "both"`.

## Next

- [ ] Manual testing of all scenarios (re-verify after the item-gating fix)
  - Select ONLY "Meta Pixel" (Marketing master off) → its script loads; `demo-marketing` card stays empty
  - Toggle the item off → script removed, `window.fbq` deleted
  - Marketing master on/off → both items + scripts load/unload together
- [ ] Add debug mode


### Fixed 2026-09-15 (SonarQube review + logic fixes)

- [x] `updateGoogleTracker` now takes an optional `categories` map: a category grants its consent-mode signals when the category OR any of its items is accepted ("only Google Ads" no longer leaves `ad_storage` denied). Provider passes `categories` at all call sites; signature stays backward-compatible.
- [x] `storage.ts`: `writePreferences`/`removePreferences` wrapped in try/catch (blocked/quota storage no longer crashes accept/reject/reset).
- [x] `CookieSettingsLink`: consumer `onClick` no longer overrides the built-in `openSettings` (both run now).
- [x] Provider `resolveLabel`: `itemToCategory` added to the `useCallback` deps (no stale labels when `config` changes without `texts`).
- [x] Provider unmount: only unregisters the scripts it registered (ref-tracked ids) instead of the global `clearRegistry()`.
- [x] Settings dialog migrated to a native `<dialog>` (top-layer, focus trap, Escape via `onCancel`); backdrop is `::backdrop` + an inert click-to-close `<button>` (`styles.css` in the package).
- [x] All 9 open SonarQube findings cleared (read-only props, redundant `Language` alias, dialog a11y rules).

### Fixed 2026-09-15 (code review: bugs + simplification)

- [x] `removeScript` skips scripts that are already blocked and not in the DOM — `cleanup` no longer fires on every unrelated preference change.
- [x] Script load errors are recorded: `useConsentScript().error` and `loadConsentScript` rejections now carry the real `Error` (`setScriptStatus(id, status, error?)`).
- [x] Theme works in dark mode: `--nsr-*` defaults (light + `.dark`) live in `styles.css`, the `dark:` utilities that overrode theme values are gone, and `borderColor` is wired up.
- [x] Google consent mode is opt-in via `googleConsentMode` (no `window.gtag` stub on sites without Google tags).
- [x] Removed: legacy `@local/privacy-consent` storage migration, implicit `delete window[id]` on withdrawal, `/datenschutz` default for `policyUrl`, unused `ConsentItemConfig.required`, `"use client"` on the barrel.
- [x] Simplified: one `buildState` for default/accept/reject, `showBanner` derived from `hasDecision`, single register/unregister effect (no id ref), `useConsentScript` single code path, dialog draft is just the accepted map and mounts fresh per open, `safeCall` helper in the loader.

## Release / open source

- [ ] Add build to JS (currently `main`/`exports` point at `src/index.ts`, no build step)
- [ ] Move to open source and release the package on npm (rename from `@local/...`, drop `"private": true`)
- [ ] Manually test the published package
- [ ] Add documentation — maybe a static docs site (README exists, no site yet)
- [ ] Add tests — maybe e2e tests for the static docs site. First candidates for unit tests: `src/storage/adapters.ts` and `src/storage/server.ts` (pure, no React).

## Manual test notes

Issues found during manual testing (what to fix):

- 
