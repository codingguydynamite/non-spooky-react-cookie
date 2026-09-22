---
"non-spooky-react-cookie": minor
---

Theming that holds together when you change more than the primary color.

- **Derived colors.** Muted text, borders, secondary buttons, hover backgrounds, the required-category card, the switch track and thumb and the focus ring are now derived with `color-mix()` from `--nsr-surface`, `--nsr-text`, `--nsr-primary` and `--nsr-primary-text` on the banner, dialog and settings link. A dark surface in light mode (or a light primary) no longer leaves near-white cards, unreadable grey text or an invisible switch thumb behind. Setting the variable yourself (`--nsr-muted`, `--nsr-border`, `--nsr-surface-muted`, `--nsr-secondary`, `--nsr-secondary-text`, `--nsr-primary-hover`, `--nsr-ring`, `--nsr-switch-off`, `--nsr-switch-thumb`) still wins.
- **`ThemePalette` covers every color**: new `primaryHoverColor`, `surfaceMutedColor`, `ringColor`, `switchOffColor`, `switchThumbColor` and `backdropColor`.
- **`darkTheme` prop** on the provider: colors that apply only under a `.dark` / `[data-theme="dark"]` ancestor. `theme` alone still applies in both modes.
- Theme values are emitted as a `<style>` rule scoped by a `data-nsr-theme` attribute on the banner, dialog and `CookieSettingsLink` (which previously never received the theme) instead of inline styles. `usePreferences()` exposes `themeAttributes` to spread onto your own elements; `themeStyle` is kept for the light palette.
- `CookieBanner`'s `components` now also reach the dialog it renders; `dialogProps.components` overrides them for the dialog only. `PreferenceComponents` gains `Collapsible`.
- Default colors pass WCAG AA at rest and on hover: the light primary is `#155e75` and the accent `#0e7490` (both were `#06b6d4`, 2.4:1 with white text); the dark primary is `#22d3ee` with `#083344` text. Primary hover uses a color mix instead of `filter: brightness()`, which did nothing on very light or very dark primaries.
- An inline `theme={{ ... }}` literal no longer recomputes the context value on every render.
