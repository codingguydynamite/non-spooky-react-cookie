import type { StorageKind } from "non-spooky-react-cookie";
import { CookieBanner, CookieBannerConfigurationProvider } from "non-spooky-react-cookie";
import { useState } from "react";
import { ConsentToolbar } from "../components/ConsentToolbar";
import { useRespectGpc } from "../components/gpc-settings";
import { StoredValue } from "../components/StoredValue";

const STORAGE_KEY = "pg-storage";

const kinds: Array<{ kind: StorageKind; hint: string }> = [
  { kind: "localStorage", hint: "default; per origin; invisible to the server" },
  {
    kind: "cookie",
    hint: "readable by the server; can span subdomains via cookieOptions.domain",
  },
  { kind: "both", hint: "writes both, reads cookie first; safe migration path" },
];

/**
 * `storage` picks where the decision is persisted. `cookieOptions` tunes
 * the cookie attributes. Try: decide with "localStorage", then switch to
 * "both": the old choice is still honored (read from localStorage) and the
 * next decision is written to both places.
 */
export function StorageStrategiesLocalStorageCookieBoth() {
  const respectGpc = useRespectGpc();
  const [kind, setKind] = useState<StorageKind>("localStorage");

  return (
    <>
      <div className="pg-card">
        <h3>storage=</h3>
        {kinds.map((entry) => (
          <label key={entry.kind} className="pg-row" style={{ cursor: "pointer" }}>
            <input
              type="radio"
              name="storage-kind"
              checked={kind === entry.kind}
              onChange={() => setKind(entry.kind)}
            />
            <code>"{entry.kind}"</code>
            <span className="pg-muted">{entry.hint}</span>
          </label>
        ))}
      </div>

      {/* key remounts the provider so it re-reads from the new storage */}
      <CookieBannerConfigurationProvider
        respectGlobalPrivacyControl={respectGpc}
        key={kind}
        storageKey={STORAGE_KEY}
        storage={kind}
        cookieOptions={{ maxAge: 60 * 60 * 24 * 180, sameSite: "lax" }}
      >
        <ConsentToolbar />
        <StoredValue storageKey={STORAGE_KEY} />
        <CookieBanner />
      </CookieBannerConfigurationProvider>
    </>
  );
}
