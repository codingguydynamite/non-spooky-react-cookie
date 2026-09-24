# non-spooky-react-cookie

## 1.1.0

### Minor Changes

- 1914a46: Texts can now come from a CMS.
  
  - `null` anywhere in `texts` keeps the built-in text, the way a CMS returns a blank field. An empty string still replaces it.
  - `dialog.itemsLabel` is now a trigger label, "Show services", followed by the count in parentheses: "Show services (2)". It no longer needs plural forms, so every text is a plain string and all texts are plain JSON.
  - New type `DeepPartialNullable`. `TextOverrides` now accepts `null`.
  - New exports from both entries: `getBuiltInTexts(language)` and `BUILT_IN_LANGUAGES`.
  - Right-to-left: text aligns to the start and the switch thumb moves left under `dir="rtl"`.
- c4e0b86: Theming that holds together when you change more than the primary color.
  
  - **Derived colors.** Muted text, borders, secondary buttons, hover backgrounds, the required-category card, the switch track and thumb and the focus ring are now derived with `color-mix()` from `--nsr-surface`, `--nsr-text`, `--nsr-primary` and `--nsr-primary-text` on the banner, dialog and settings link. A dark surface in light mode (or a light primary) no longer leaves near-white cards, unreadable grey text or an invisible switch thumb behind. Setting the variable yourself (`--nsr-muted`, `--nsr-border`, `--nsr-surface-muted`, `--nsr-secondary`, `--nsr-secondary-text`, `--nsr-primary-hover`, `--nsr-ring`, `--nsr-switch-off`, `--nsr-switch-thumb`) still wins.
  - **`ThemePalette` covers every color**: new `primaryHoverColor`, `surfaceMutedColor`, `ringColor`, `switchOffColor`, `switchThumbColor` and `backdropColor`.
  - **`darkTheme` prop** on the provider: colors that apply only under a `.dark` / `[data-theme="dark"]` ancestor. `theme` alone still applies in both modes.
  - Theme values are emitted as a `<style>` rule scoped by a `data-nsr-theme` attribute on the banner, dialog and `CookieSettingsLink` (which previously never received the theme) instead of inline styles. `usePreferences()` exposes `themeAttributes` to spread onto your own elements; `themeStyle` is kept for the light palette.
  - `CookieBanner`'s `components` now also reach the dialog it renders; `dialogProps.components` overrides them for the dialog only. `PreferenceComponents` gains `Collapsible`.
  - Default colors pass WCAG AA at rest and on hover: the light primary is `#155e75` and the accent `#0e7490` (both were `#06b6d4`, 2.4:1 with white text); the dark primary is `#22d3ee` with `#083344` text. Primary hover uses a color mix instead of `filter: brightness()`, which did nothing on very light or very dark primaries.
  - An inline `theme={{ ... }}` literal no longer recomputes the context value on every render.
- 1914a46: `language` now accepts region codes and ignores case: `"pl-PL"`, `"de_AT"` and `"EN-us"` resolve to the built-in `pl`, `de` and `en` texts instead of falling back to English.

### Patch Changes

- 84b88fa: Better on phones.
  
  - The settings dialog is a bottom sheet under 640px: Save and Close sit at the bottom edge, under the thumb, and the footer keeps clear of the home indicator with `env(safe-area-inset-bottom)`.
  - The banner pads for `env(safe-area-inset-*)` on notched phones and scrolls inside itself if a long description would otherwise push the buttons off a small screen.
  - Tap targets of at least 44px: the switch gets an invisible hit area around its 24px track, the collapsible trigger and `CookieSettingsLink` have a minimum height, and buttons use `min-height` instead of a fixed height so long labels (German, for example) wrap instead of overflowing.
  - `dvh` viewport units, with `vh` fallbacks, so the dialog and banner size against the visible area of mobile browsers, not the area behind the address bar.
- 23697a4: `non-spooky-react-cookie/server` now resolves in tools that ignore the `exports` field (old Jest, webpack 4, TypeScript `moduleResolution: node`). A `server/package.json` stub in the tarball points them at the built files.

## 1.0.0

First public release.

- Published as `non-spooky-react-cookie` (was the private `@local/non-spooky-react-cookie`).
- Ships compiled ESM + CJS with type declarations, plus a standalone stylesheet at `non-spooky-react-cookie/styles.css`. Tailwind is no longer required.
- New server-only entry `non-spooky-react-cookie/server` exporting `readPreferencesFromCookies` and `CookieSource`; the main entry is a `"use client"` module.
- New `dialogProps` on `CookieBanner` to style the built-in settings dialog.
- Components use plain `nsr-*` classes and `--nsr-*` custom properties; dark mode via a `.dark` or `[data-theme="dark"]` ancestor.
