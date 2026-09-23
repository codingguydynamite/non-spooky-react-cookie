---
"non-spooky-react-cookie": minor
---

Texts can now come from a CMS.

- `null` anywhere in `texts` keeps the built-in text, the way a CMS returns a blank field. An empty string still replaces it.
- `dialog.itemsLabel` is now a trigger label, "Show services", followed by the count in parentheses: "Show services (2)". It no longer needs plural forms, so every text is a plain string and all texts are plain JSON.
- New type `DeepPartialNullable`. `TextOverrides` now accepts `null`.
- New exports from both entries: `getBuiltInTexts(language)` and `BUILT_IN_LANGUAGES`.
- Right-to-left: text aligns to the start and the switch thumb moves left under `dir="rtl"`.
