import type { ConsentScripts } from "non-spooky-react-cookie";
import {
  CookieBanner,
  CookieBannerConfigurationProvider,
  useConsentScript,
  usePreferences,
} from "non-spooky-react-cookie";
import { ConsentToolbar } from "../components/ConsentToolbar";
import { useRespectGpc } from "../components/gpc-settings";

declare global {
  interface Window {
    confetti?: (options?: Record<string, unknown>) => void;
  }
}

const scripts: ConsentScripts = {
  "canvas-confetti": {
    category: "preferences",
    src: "https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.js",
    cleanup: () => {
      delete window.confetti;
    },
  },
};

/**
 * The pattern from the README's `GoogleMap` example: the app owns the
 * integration, the hook tells it when the global is safe to use. Replace
 * confetti with Google Maps, YouTube, a chat widget, …
 */
function ConfettiWidget() {
  const { status, error } = useConsentScript("canvas-confetti");
  const { openSettings } = usePreferences();

  if (status === "blocked") {
    return (
      <div className="pg-target">
        Confetti needs the <strong>Preferences</strong> category.{" "}
        <button className="pg-btn" type="button" onClick={openSettings}>
          Manage consent
        </button>
      </div>
    );
  }

  if (status === "loading") {
    return <div className="pg-target">Loading canvas-confetti…</div>;
  }

  if (status === "error") {
    return (
      <div className="pg-target pg-error">
        {error instanceof Error ? error.message : "The script failed to load."}
      </div>
    );
  }

  // `window.confetti` is guaranteed to exist here.
  return (
    <div className="pg-target" style={{ color: "#047857", borderColor: "#6ee7b7" }}>
      Loaded.{" "}
      <button
        className="pg-btn pg-btn--primary"
        type="button"
        onClick={() =>
          window.confetti?.({ particleCount: 140, spread: 70, origin: { y: 0.7 } })
        }
      >
        🎉 Fire confetti
      </button>
    </div>
  );
}

export function LoadLibraryOnlyAfterConsent() {
  const respectGpc = useRespectGpc();
  return (
    <CookieBannerConfigurationProvider
      respectGlobalPrivacyControl={respectGpc}
      storageKey="pg-load-after-consent"
      scripts={scripts}
    >
      <div className="pg-card">
        <h3>useConsentScript("canvas-confetti")</h3>
        <ConfettiWidget />
        <p className="pg-muted">
          Withdraw the Preferences category in the settings and the script element is
          removed and <code>window.confetti</code> deleted by <code>cleanup</code>.
        </p>
      </div>
      <ConsentToolbar />
      <CookieBanner />
    </CookieBannerConfigurationProvider>
  );
}
