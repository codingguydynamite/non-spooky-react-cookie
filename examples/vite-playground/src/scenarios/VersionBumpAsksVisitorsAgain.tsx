import { CookieBanner, CookieBannerConfigurationProvider } from "non-spooky-react-cookie";
import { useState } from "react";
import { ConsentToolbar } from "../components/ConsentToolbar";
import { StoredValue } from "../components/StoredValue";

const STORAGE_KEY = "pg-version";

/**
 * Changed your categories or your policy? Bump `version` (any string; a
 * date works well) and every visitor is asked again. A stored decision with
 * a different version is ignored, not deleted, until the next decision.
 */
export function VersionBumpAsksVisitorsAgain() {
  const [version, setVersion] = useState("2026-01-01");

  return (
    <>
      <div className="pg-card">
        <div className="pg-row">
          <span>
            version=<code>"{version}"</code>
          </span>
          <span className="pg-spacer" />
          <button
            className="pg-btn pg-btn--primary"
            type="button"
            onClick={() => setVersion(new Date().toISOString().slice(0, 10))}
          >
            Bump to today
          </button>
          <button
            className="pg-btn"
            type="button"
            onClick={() => setVersion("2026-01-01")}
          >
            Back to 2026-01-01
          </button>
        </div>
        <p className="pg-muted">
          Decide once, then bump: the banner returns and the toolbar shows the new version
          while the stored payload still carries the old one.
        </p>
      </div>

      <CookieBannerConfigurationProvider storageKey={STORAGE_KEY} version={version}>
        <ConsentToolbar />
        <StoredValue storageKey={STORAGE_KEY} />
        <CookieBanner />
      </CookieBannerConfigurationProvider>
    </>
  );
}
