# non-spooky-react-cookie

## 1.0.0

First public release.

- Published as `non-spooky-react-cookie` (was the private `@local/non-spooky-react-cookie`).
- Ships compiled ESM + CJS with type declarations, plus a standalone stylesheet at `non-spooky-react-cookie/styles.css`. Tailwind is no longer required.
- New server-only entry `non-spooky-react-cookie/server` exporting `readPreferencesFromCookies` and `CookieSource`; the main entry is a `"use client"` module.
- New `dialogProps` on `CookieBanner` to style the built-in settings dialog.
- Components use plain `nsr-*` classes and `--nsr-*` custom properties; dark mode via a `.dark` or `[data-theme="dark"]` ancestor.
