---
"non-spooky-react-cookie": patch
---

Better on phones.

- The settings dialog is a bottom sheet under 640px: Save and Close sit at the bottom edge, under the thumb, and the footer keeps clear of the home indicator with `env(safe-area-inset-bottom)`.
- The banner pads for `env(safe-area-inset-*)` on notched phones and scrolls inside itself if a long description would otherwise push the buttons off a small screen.
- Tap targets of at least 44px: the switch gets an invisible hit area around its 24px track, the collapsible trigger and `CookieSettingsLink` have a minimum height, and buttons use `min-height` instead of a fixed height so long labels (German, for example) wrap instead of overflowing.
- `dvh` viewport units, with `vh` fallbacks, so the dialog and banner size against the visible area of mobile browsers, not the area behind the address bar.
