# Backlog — non-spooky-react-cookie

## Done

- [x] Script loading — consent-gated load/unload primitives (`script-loader.ts`, `script-registry.ts`, `script-runtime.ts`, `useConsentScript`, `loadConsentScript`)
- [x] Package structure + README docs
- [x] **Item consent gates independently of its parent category** — selecting just an item (e.g. Meta Pixel) loads its script; the category switch is a convenience toggle, not a hard gate.
- [x] **Ready-made public types** — `ConsentScripts`, `TextOverrides`.
- [x] **Pluggable storage (2026-09-15)** — `src/storage/` with a `PreferencesStorage` strategy; provider props `storage`, `cookieOptions`, `initialPreferences`; server-side `readPreferencesFromCookies`.
- [x] **Open-source foundation (2026-09-16)**
  - Build to JS: tsdown → `dist/` ESM + CJS + `.d.ts`, `dist/styles.css`; publint + attw green on every entry.
  - Renamed to `non-spooky-react-cookie`, `private` removed, MIT license, version `1.0.0`.
  - Plain CSS: all Tailwind utility classes replaced by `nsr-*` classes in `src/styles.css`. No Tailwind needed by consumers.
  - New `non-spooky-react-cookie/server` entry; the main barrel is `"use client"`.
  - `dialogProps` on `CookieBanner`.
  - Biome (lint + format), Vitest unit tests for storage / texts / registry, pnpm workspace.
  - `examples/vite-playground` with 14 scenarios, dev alias to `src/`, build against `dist/`.
  - GitHub Actions: `ci.yml` (lint, typecheck, test, build, package check, playground build) and `release.yml` (Changesets + npm trusted publishing).
  - Docs: README rewritten, `MAINTAINING.md`, `CONTRIBUTING.md`, `examples/README.md`.

## Next

- [ ] Click through every playground scenario in a browser (see `examples/README.md`); note visual issues below.
- [ ] Do the one-time release setup from `MAINTAINING.md` §4: create the GitHub repo, enable "Actions may create PRs", first manual `pnpm release`, configure the npm trusted publisher.
- [ ] Switch `handwerk-portfolio` from `file:./packages/...` to the published package and add `import "non-spooky-react-cookie/styles.css"`; delete the copied `packages/` folder there.
- [ ] Add debug mode (log consent decisions and script load/unload to the console when enabled).
- [ ] Component tests (Vitest + Testing Library) for the banner and the settings dialog.
- [ ] Docs site (the playground could grow into it).

## Manual test notes

Issues found during manual testing (what to fix):

-
