import { usePreferences } from "non-spooky-react-cookie";

/**
 * Shared debug toolbar used by most scenarios. Must be rendered inside a
 * CookieBannerConfigurationProvider. Shows the live consent state and gives
 * quick access to the settings dialog and a reset. `onReset` runs after the
 * library's own reset, for scenarios that need extra cleanup.
 */
export function ConsentToolbar({ onReset }: { onReset?: () => void } = {}) {
  const { loaded, hasDecision, preferences, openSettings, resetPreferences } =
    usePreferences();

  const handleReset = () => {
    resetPreferences();
    onReset?.();
  };

  return (
    <div className="pg-card">
      <div className="pg-row pg-row--wrap">
        <span className={hasDecision ? "pg-chip pg-chip--on" : "pg-chip"} role="status">
          {loaded ? (hasDecision ? "decision stored" : "no decision yet") : "loading…"}
        </span>
        <span className="pg-chip">version {preferences.version}</span>
        {/* Sits to the right on desktop, wraps below the chips on phones. */}
        <div className="pg-actions">
          <button className="pg-btn" type="button" onClick={openSettings}>
            Open settings
          </button>
          <button className="pg-btn pg-btn--ghost" type="button" onClick={handleReset}>
            Reset decision
          </button>
        </div>
      </div>
      <div className="pg-row pg-row--wrap">
        {Object.entries(preferences.accepted).map(([id, on]) => (
          <span key={id} className={on ? "pg-chip pg-chip--on" : "pg-chip pg-chip--off"}>
            {id}: {on ? "on" : "off"}
          </span>
        ))}
      </div>
    </div>
  );
}
