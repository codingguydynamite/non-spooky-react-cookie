# Backlog — non-spooky-react-cookie

## Done

- [x] Script loading — consent-gated load/unload via the provider `scripts` prop (`script-loader.ts`, `script-runtime.ts`, `useConsentScript`)
- [x] Package structure + README docs
- [x] **Item consent gates independently of its parent category** — selecting just an item (e.g. Meta Pixel) loads its script; the category switch is a convenience toggle, not a hard gate.
- [x] **Ready-made public types** — `ConsentScripts`, `TextOverrides`.
- [x] **Pluggable storage (2026-09-15)** — `src/storage/` with a `PreferencesStorage` strategy; provider props `storage`, `cookieOptions`, `initialPreferences`; server-side `readPreferencesFromCookies`.
- [x] **window.justDont() global (2026-09-21)** — the provider registers `window.justDont()` automatically (opt out with `windowJustDont={false}`): one global call rejects all optional categories, for console snippets and "I don't care about cookies"-style extensions. `DEFAULT_STORAGE_KEY` is also exported. Component tests in `tests/just-dont.test.tsx`; playground scenario `JustDontGlobal.tsx`. (Replaced an earlier `globalName` experiment that exposed the full API on `window[globalName]`.)
- [x] **Global Privacy Control (2026-09-22)** — honored out of the box, opt out with `respectGlobalPrivacyControl={false}`: `navigator.globalPrivacyControl === true` with no stored decision = "Reject all" in memory, no banner, `onDecision` fires; stored decision wins; `usePreferences().globalPrivacyControl` exposes the detected signal. Helper in `src/integrations/global-privacy-control.ts`, tests in `tests/global-privacy-control.test.tsx`, playground scenario `GlobalPrivacyControl.tsx`. Follow-up idea: a `/server` helper that reads `Sec-GPC` from request headers for SSR.
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
- [ ] Błąd w examples: A form field element should have an id or name attribute
A form field element has neither an id nor a name attribute. This might stop the browser from correctly autofilling the form.
- [ ] dodac projekt w githubie

## Manual test notes

Issues found during manual testing (what to fix):

### Custom styles / `theme` prop (found 2026-09-22 via playground scenario 09 + Playwright contrast probe; fixed 2026-09-22, see `.changeset/derived-theme-colors.md`)

How it was fixed: derived colors (`color-mix()` on the component roots, `--nsr-<name>` still wins), `ThemePalette` now covers all 15 colors, new `darkTheme` prop, theme emitted as a scoped `<style>` (`data-nsr-theme`) instead of inline styles so it reaches `CookieSettingsLink` and can differ per mode, `components` forwarded from `CookieBanner` to its dialog, `Collapsible` swappable, AA-safe defaults (`#155e75` / `#0e7490`, dark `#22d3ee` on `#083344`), hover via color mix, switch thumb = surface when off / primary text when on. Re-probe: 0 text pairs below 4.5:1 across 9 palettes. Tests in `tests/theme.test.tsx`.

Original findings:

- [x] **`ThemePalette` covers 9 of 13 color variables.** `--nsr-surface-muted`, `--nsr-switch-off`, `--nsr-ring`, `--nsr-backdrop` cannot be set via `theme`, so a custom palette is always half-themed. Repro: `theme={{ surfaceColor: "#1e1b4b", textColor: "#f5f3ff" }}` in light mode → the "Necessary" card stays `#fafafa` (title contrast 1.05:1, invisible), secondary/ghost hover backgrounds go near-white on the dark panel, switch off-track stays light grey, focus ring stays cyan. Fix: add `surfaceMutedColor`, `switchOffColor`, `ringColor`, `backdropColor` to the palette, and derive sensible fallbacks (`--nsr-surface-muted: color-mix(in srgb, var(--nsr-surface) 92%, var(--nsr-text))`, `--nsr-ring: var(--nsr-primary)`, etc.) so setting one color does not orphan the rest.
- [x] **`mutedTextColor` and `secondaryColor` do not follow `surfaceColor`/`textColor`.** Same repro: description and "Close" text stay `#52525b` on the dark surface (2.07:1), "Reject"/"Settings" stay white pills on a dark card. Fix: default `--nsr-muted` / `--nsr-secondary` / `--nsr-secondary-text` via `color-mix` from surface + text instead of fixed hex.
- [x] **Theme prop + dark mode = unreadable.** The scenario tells you to "pick a color, then flip dark mode: your color stays", but picking `surfaceColor: "#ffffff"` then flipping `.dark` gives `#fafafa` text on white (1.04:1) in both banner and dialog. Inline `style` beats the `.dark` variables by design, so the prop is mode-agnostic while the rest of the palette is not. Fix options: accept `theme={{ light: {...}, dark: {...} }}` (or a `darkTheme` prop) and emit `.dark`-scoped values via a `<style>`/data-attribute instead of inline styles; at minimum document that mixing `theme` with a `.dark` ancestor needs a full palette.
- [x] **Switch thumb is hard-coded white** (`.nsr-switch__thumb { background: #ffffff }`, plus fixed rgb shadows). With a light primary (`#fde047`) the "on" thumb has 1.32:1 against the track and the on/off state is hard to tell apart. Fix: `--nsr-switch-thumb` variable defaulting to `var(--nsr-primary-text)` or `var(--nsr-surface)`.
- [x] **`primaryTextColor` defaults to white regardless of `primaryColor`.** Even the default cyan `#06b6d4` + white text is 2.43:1 (WCAG AA needs 4.5:1); yellow primary gives 1.32:1. Default `--nsr-accent` link on white is 3.68:1. Fix: pick darker defaults (`#0e7490` / `#0891b2`), and consider auto-contrast for the primary text (`color-contrast()` is not shippable yet; a `light-dark()`/luminance check in `themeToStyle` would do).
- [x] **Focus ring ignores the brand.** `--nsr-ring` is fixed `#22d3ee`, so a red-brand dialog shows cyan focus outlines on the Save button. Fix: default `--nsr-ring: var(--nsr-primary)` (or `color-mix` of primary) and expose it in `ThemePalette`.
- [x] **`primary:hover` uses `filter: brightness(1.08)`.** Invisible on very light or very dark primaries (white → white, black → black). Fix: `color-mix(in srgb, var(--nsr-primary), var(--nsr-primary-text) 10%)` or an explicit `--nsr-primary-hover`.
- [x] **`CookieSettingsLink` does not receive `themeStyle`.** Its hover color is `--nsr-accent` from `:root`, so with `theme.accentColor` set the footer link hovers cyan while the banner link is brand-colored. Fix: spread `themeStyle` on the link, or move the theme variables to a shared wrapper.
- [x] **`components` on `CookieBanner` swaps the banner buttons only** while the dialog it renders keeps the provider's components; `dialogProps` has no `components`. Either forward `components` to the dialog or document loudly.
- [x] **`Collapsible` is not swappable** (`PreferenceComponents` has only `Button`/`Switch`) even though `CollapsibleProps` is exported.
- [x] **Playground scenario 09 issues:** the color inputs show `#000000` when a value is unset (misleading swatch — cyan is the real value); it exposes only 6 of the 9 palette keys (no `secondaryColor`, `secondaryTextColor`, `mutedTextColor`), so you cannot repair the contrast problems above from the UI; the helper text actively recommends the broken "pick a color then flip dark" flow. Add the missing fields, show the resolved color as the swatch, and add a "brand preset" button that sets a full coherent palette.
- [x] **Perf smell:** an inline `theme={{ ... }}` literal (as in the README example) is a new object every render, so `themeStyle` and the whole context `value` recompute each render. Key the memo on `JSON.stringify(theme)` like `cookieOptions` already does.
