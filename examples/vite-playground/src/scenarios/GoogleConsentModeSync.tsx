import {
  CookieBanner,
  CookieBannerConfigurationProvider,
  usePreferences,
} from "non-spooky-react-cookie";
import { ConsentToolbar } from "../components/ConsentToolbar";
import { useRespectGpc } from "../components/gpc-settings";

function describe(entry: unknown): string {
  // gtag pushes `arguments` objects; turn them into readable JSON.
  const parts = Array.from(entry as ArrayLike<unknown>);
  return parts
    .map((part) => (typeof part === "string" ? part : JSON.stringify(part)))
    .join(" ");
}

function DataLayerLog() {
  // Re-render on every decision so the log picks up the new push.
  usePreferences();
  const entries = (window.dataLayer ?? []).filter((entry) => {
    const first = (entry as ArrayLike<unknown>)[0];
    return first === "consent";
  });

  return (
    <div className="pg-card">
      <h3>window.dataLayer (consent commands only)</h3>
      {entries.length === 0 ? (
        <p className="pg-muted">Nothing yet.</p>
      ) : (
        <pre className="pg-log">{entries.map(describe).join("\n")}</pre>
      )}
      <p className="pg-muted">
        Expect <code>consent default</code> with everything denied on mount, then a{" "}
        <code>consent update</code> per decision. Accepting only an item inside Marketing
        (e.g. Google Ads) still grants <code>ad_storage</code>.
      </p>
    </div>
  );
}

/**
 * Opt in with `googleConsentMode`. The provider creates the `window.gtag`
 * stub (if missing), seeds consent mode with everything denied, and updates
 * it on every decision from the `analytics` / `marketing` categories.
 * Load your actual gtag.js via `scripts` and it will replay the queue.
 */
export function GoogleConsentModeSync() {
  const respectGpc = useRespectGpc();
  return (
    <CookieBannerConfigurationProvider
      respectGlobalPrivacyControl={respectGpc}
      storageKey="pg-google"
      googleConsentMode
      config={{
        categories: {
          necessary: { required: true, name: "Necessary" },
          analytics: { name: "Analytics" },
          marketing: {
            name: "Marketing",
            items: {
              "google-ads": { name: "Google Ads" },
              "meta-pixel": { name: "Meta Pixel" },
            },
          },
        },
      }}
    >
      <DataLayerLog />
      <ConsentToolbar />
      <CookieBanner />
    </CookieBannerConfigurationProvider>
  );
}
