import type { PreferencesState } from "non-spooky-react-cookie";
import {
  CookieBanner,
  CookieBannerConfigurationProvider,
  usePreferences,
} from "non-spooky-react-cookie";
import { useState } from "react";
import { ConsentToolbar } from "../components/ConsentToolbar";
import { useRespectGpc } from "../components/gpc-settings";

function Controls() {
  const {
    acceptAll,
    rejectAll,
    savePreferences,
    resetPreferences,
    openSettings,
    closeSettings,
  } = usePreferences();

  return (
    <div className="pg-card">
      <h3>usePreferences() actions</h3>
      <div className="pg-row pg-row--wrap">
        <button className="pg-btn pg-btn--primary" type="button" onClick={acceptAll}>
          acceptAll()
        </button>
        <button className="pg-btn" type="button" onClick={rejectAll}>
          rejectAll()
        </button>
        <button
          className="pg-btn"
          type="button"
          onClick={() => savePreferences({ accepted: { analytics: true } })}
        >
          savePreferences({"{ accepted: { analytics: true } }"})
        </button>
        <button className="pg-btn" type="button" onClick={openSettings}>
          openSettings()
        </button>
        <button className="pg-btn" type="button" onClick={closeSettings}>
          closeSettings()
        </button>
        <button className="pg-btn pg-btn--ghost" type="button" onClick={resetPreferences}>
          resetPreferences()
        </button>
      </div>
      <p className="pg-muted">
        <code>savePreferences</code> merges into the current map, so only the ids you pass
        change.
      </p>
    </div>
  );
}

/**
 * `onDecision` fires whenever the visitor makes or changes a choice (and on
 * reset). Use it to forward the decision to your own analytics, to sync a
 * server-side flag, or just to log.
 */
export function OnDecisionCallbackAndProgrammaticControl() {
  const respectGpc = useRespectGpc();
  const [log, setLog] = useState<string[]>([]);

  const onDecision = (state: PreferencesState) => {
    const accepted = Object.entries(state.accepted)
      .filter(([, on]) => on)
      .map(([id]) => id)
      .join(", ");
    setLog((current) => [
      `${new Date().toLocaleTimeString()}  onDecision → accepted: [${accepted || "none"}]`,
      ...current,
    ]);
  };

  return (
    <CookieBannerConfigurationProvider
      respectGlobalPrivacyControl={respectGpc}
      storageKey="pg-programmatic"
      onDecision={onDecision}
    >
      <Controls />
      <ConsentToolbar />
      <div className="pg-card">
        <h3>onDecision log</h3>
        {log.length ? (
          <pre className="pg-log">{log.join("\n")}</pre>
        ) : (
          <p className="pg-muted">Nothing yet.</p>
        )}
      </div>
      <CookieBanner />
    </CookieBannerConfigurationProvider>
  );
}
