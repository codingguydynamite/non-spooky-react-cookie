---
"non-spooky-react-cookie": minor
---

`language` now accepts region codes and ignores case: `"pl-PL"`, `"de_AT"` and `"EN-us"` resolve to the built-in `pl`, `de` and `en` texts instead of falling back to English. `texts.dialog.itemsLabel` also takes a function of the item count, and the built-in languages use it for correct plurals ("1 Service", "5 Usług").

`Texts["dialog"]["itemsLabel"]` is now `string | ((count: number) => string)`. Code that reads it directly (rather than overriding it) needs to handle the function form.
