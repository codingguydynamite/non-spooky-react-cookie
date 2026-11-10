---
"non-spooky-react-cookie": patch
---

Consent-gated Google Tag Manager (`gtm.js?id=GTM-…`) and gtag.js (`gtag/js?id=G-…`) scripts now send data. Before, the provider only inserted the `<script>`: GTM loaded but never got the `gtm.js` event its "All Pages" trigger fires on, and gtag.js never got `gtag("js")` / `gtag("config")`, so no page views reached Google Analytics. The provider now queues that start command right before inserting the script, once per container per page. Set `googleBootstrap: false` on a script entry if you queue these commands yourself.
