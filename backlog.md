# Backlog — non-spooky-react-cookie

## Done

- [x] Script loading — consent-gated load/unload via the provider `scripts` prop (`script-loader.ts`, `script-runtime.ts`, `useConsentScript`)
- [x] Package structure + README docs
- [x] **Item consent gates independently of its parent category** — selecting just an item (e.g. Meta Pixel) loads its script; the category switch is a convenience toggle, not a hard gate.
- [x] **Ready-made public types** — `ConsentScripts`, `TextOverrides`.
- [x] **Pluggable storage (2026-09-15)** — `src/storage/` with a `PreferencesStorage` strategy; provider props `storage`, `cookieOptions`, `initialPreferences`; server-side `readPreferencesFromCookies`.
- [x] **window.justDont() global (2026-09-21)** — the provider registers `window.justDont()` automatically (opt out with `windowJustDont={false}`): one global call rejects all optional categories, for console snippets and "I don't care about cookies"-style extensions. `DEFAULT_STORAGE_KEY` is also exported. Component tests in `tests/just-dont.test.tsx`; playground scenario `JustDontGlobal.tsx`. (Replaced an earlier `globalName` experiment that exposed the full API on `window[globalName]`.)
- [x] **Open-source foundation (2026-09-16)**
  - Build to JS: tsdown → `dist/` ESM + CJS + `.d.ts`, `dist/styles.css`; publint + attw green on every entry.
  - Renamed to `non-spooky-react-cookie`, `private` removed, MIT license, version `1.0.0`.
  - Plain CSS: all Tailwind utility classes replaced by `nsr-*` classes in `src/styles.css`. No Tailwind needed by consumers.
  - New `non-spooky-react-cookie/server` entry; the main barrel is `"use client"`.
  - `dialogProps` on `CookieBanner`.
  - Biome (lint + format), Vitest unit tests for storage / texts, pnpm workspace.
  - `examples/vite-playground` with 13 scenarios, dev alias to `src/`, build against `dist/`.
  - GitHub Actions: `ci.yml` (lint, typecheck, test, build, package check, playground build) and `release.yml` (Changesets + npm trusted publishing).
  - Docs: README rewritten, `MAINTAINING.md`, `CONTRIBUTING.md`, `examples/README.md`.

## Next
- [ ] Sprawdzić czy możemy dodac taki custom latający widged do cookiesów (najlepiej żeby dało się go customizować - np. latające cisteczko, rakieta etc)
- [ ] sprawdzić jakie mamy możliwości modyfikacji głównego cookie banera na dole, np. żeby był na cały ekran i żeby blokował np. ekran ?
- [x] dostarczyć funkcję do skorelowania z pluginem I dont care about cookies — gotowe: `window.justDont()` rejestrowane automatycznie przez providera (2026-09-21).
- [ ] Loader i runtime store nie mają żadnych testów, a to teraz jedyna ścieżka ładowania. Test providera pod jsdom z Testing Library jest już w backlogu jako osobna pozycja i po tych zmianach jest ważniejszy niż wcześniej.
- [ ] Click through every playground scenario in a browser (see `examples/README.md`); note visual issues below.
- [ ] Do the one-time release setup from `MAINTAINING.md` §4: create the GitHub repo, enable "Actions may create PRs", first manual `pnpm release`, configure the npm trusted publisher.
- [ ] Switch `handwerk-portfolio` from `file:./packages/...` to the published package and add `import "non-spooky-react-cookie/styles.css"`; delete the copied `packages/` folder there.
- [ ] Add debug mode (log consent decisions and script load/unload to the console when enabled).
- [ ] Component tests (Vitest + Testing Library) for the banner and the settings dialog.
- [ ] Docs site (the playground could grow into it).

## Manual test notes

Issues found during manual testing (what to fix):

-
