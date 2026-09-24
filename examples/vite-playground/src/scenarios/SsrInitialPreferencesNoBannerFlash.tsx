import {
  CookieBanner,
  CookieBannerConfigurationProvider,
  usePreferences,
} from "non-spooky-react-cookie";
// The server entry has no React and no `window`; it is safe in a React
// Server Component, a route handler, or middleware.
import { readPreferencesFromCookies } from "non-spooky-react-cookie/server";
import { useRef, useState } from "react";
import { ConsentToolbar } from "../components/ConsentToolbar";
import { useRespectGpc } from "../components/gpc-settings";
import { StoredValue } from "../components/StoredValue";

const STORAGE_KEY = "pg-ssr";

function FirstRenderProbe() {
  const { loaded, hasDecision } = usePreferences();
  // Capture what the very first render saw. Without `initialPreferences`
  // `loaded` is false on the first render and flips after mount.
  const first = useRef({ loaded, hasDecision });

  return (
    <div className="pg-card">
      <h3>What the first render saw</h3>
      <div className="pg-row">
        <span
          className={
            first.current.loaded ? "pg-chip pg-chip--on" : "pg-chip pg-chip--off"
          }
        >
          loaded: {String(first.current.loaded)}
        </span>
        <span
          className={
            first.current.hasDecision ? "pg-chip pg-chip--on" : "pg-chip pg-chip--off"
          }
        >
          hasDecision: {String(first.current.hasDecision)}
        </span>
      </div>
      <p className="pg-muted">
        Decide once, then click <em>Remount</em>: the first render already knows the
        decision, so the banner never flashes.
      </p>
    </div>
  );
}

/**
 * In Next.js you would do this in `app/layout.tsx`:
 *
 *   const initial = readPreferencesFromCookies(await cookies(), "my-site");
 *   <Provider storage="cookie" initialPreferences={initial}>…</Provider>
 *
 * The browser stands in for the server here: we read `document.cookie`
 * synchronously before the provider renders for the first time.
 */
export function SsrInitialPreferencesNoBannerFlash() {
  const respectGpc = useRespectGpc();
  const [mountKey, setMountKey] = useState(0);
  // Read at render time, before the provider mounts (once per mount key).
  const initial = readPreferencesFromCookies(document.cookie, STORAGE_KEY);

  return (
    <>
      <div className="pg-card">
        <div className="pg-row">
          <button
            className="pg-btn"
            type="button"
            onClick={() => setMountKey((n) => n + 1)}
          >
            Remount provider (simulates a fresh page load)
          </button>
          <span className="pg-muted">
            initialPreferences = {initial ? "decision from cookie" : "null (no cookie)"}
          </span>
        </div>
      </div>

      <CookieBannerConfigurationProvider
        respectGlobalPrivacyControl={respectGpc}
        key={mountKey}
        storageKey={STORAGE_KEY}
        storage="cookie"
        initialPreferences={initial}
      >
        <FirstRenderProbe />
        <ConsentToolbar />
        <StoredValue storageKey={STORAGE_KEY} />
        <CookieBanner />
      </CookieBannerConfigurationProvider>
    </>
  );
}
