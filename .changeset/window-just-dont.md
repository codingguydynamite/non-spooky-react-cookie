---
"non-spooky-react-cookie": minor
---

The provider now registers `window.justDont()` automatically: a single global function that rejects all optional categories (the "Reject all" behaviour), available from the DevTools console or an "I don't care about cookies"-style browser extension as soon as the banner mounts. Opt out with the `windowJustDont={false}` provider prop. The default storage key is also exported as `DEFAULT_STORAGE_KEY`.
