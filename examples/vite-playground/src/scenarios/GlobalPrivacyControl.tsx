import {
  CookieBanner,
  CookieBannerConfigurationProvider,
  usePreferences,
} from "non-spooky-react-cookie";
import { useState } from "react";
import { ConsentToolbar } from "../components/ConsentToolbar";
import { setRespectGpc, useRespectGpc } from "../components/gpc-settings";

type NavigatorWithGpc = Navigator & { globalPrivacyControl?: boolean };

function readSignal(): boolean | undefined {
  return (navigator as NavigatorWithGpc).globalPrivacyControl;
}

/**
 * Browsers without a native GPC setting (Chrome, Safari) have no
 * `navigator.globalPrivacyControl` at all. Defining it here lets you try the
 * feature anywhere; a real extension (e.g. Privacy Badger) does the same.
 */
function simulateSignal(value: boolean | undefined): void {
  if (value === undefined) {
    delete (navigator as NavigatorWithGpc).globalPrivacyControl;
    return;
  }
  Object.defineProperty(navigator, "globalPrivacyControl", {
    value,
    configurable: true,
    writable: true,
  });
}

function SignalStatus() {
  const { globalPrivacyControl, showBanner } = usePreferences();

  return (
    <div className="pg-row pg-row--wrap">
      <span className={globalPrivacyControl ? "pg-chip pg-chip--on" : "pg-chip"}>
        {globalPrivacyControl
          ? "GPC honored: rejected all, no banner"
          : "GPC not applied"}
      </span>
      <span className={showBanner ? "pg-chip pg-chip--off" : "pg-chip"}>
        banner {showBanner ? "visible" : "hidden"}
      </span>
    </div>
  );
}

/**
 * `respectGlobalPrivacyControl` turns the browser's Global Privacy Control
 * signal into a "Reject all" decision, so the banner never shows for visitors
 * who already told their browser they do not want their data sold or shared.
 * The provider only reads the signal on mount, so simulating a change below
 * remounts it via `key`. The checkbox is the playground-wide switch, the same
 * one the yellow notice at the top shows on browsers that send the signal.
 */
export function GlobalPrivacyControl() {
  const respect = useRespectGpc();
  const [signal, setSignal] = useState<boolean | undefined>(readSignal);
  const [mountKey, setMountKey] = useState(0);

  const applySignal = (value: boolean | undefined) => {
    simulateSignal(value);
    setSignal(readSignal());
    setMountKey((k) => k + 1);
  };

  return (
    <CookieBannerConfigurationProvider
      key={mountKey}
      storageKey="pg-gpc"
      respectGlobalPrivacyControl={respect}
    >
      <div className="pg-card">
        <h3>Global Privacy Control</h3>
        <p className="pg-muted">
          <code>navigator.globalPrivacyControl</code> in this browser:{" "}
          <code>{String(signal)}</code>
          {signal === undefined && " (no native support here — simulate it below)"}
        </p>
        <div className="pg-row pg-row--wrap">
          <label className="pg-row">
            <input
              type="checkbox"
              checked={respect}
              onChange={(event) => setRespectGpc(event.target.checked)}
            />
            <code>respectGlobalPrivacyControl</code>
          </label>
        </div>
        <div className="pg-row pg-row--wrap">
          <button
            className="pg-btn pg-btn--primary"
            type="button"
            onClick={() => applySignal(true)}
          >
            Simulate signal on
          </button>
          <button className="pg-btn" type="button" onClick={() => applySignal(false)}>
            Simulate signal off
          </button>
          <button
            className="pg-btn pg-btn--ghost"
            type="button"
            onClick={() => applySignal(undefined)}
          >
            Remove simulation
          </button>
        </div>
        <SignalStatus />
        <p className="pg-muted">
          A stored decision (use "Open settings" and save) always wins over the signal.
          The signal-driven decision itself is never persisted: switch the signal off and
          the banner is back.
        </p>
        <p className="pg-muted">
          On by default. Opt out anywhere with{" "}
          <code>respectGlobalPrivacyControl={"{false}"}</code>
        </p>
      </div>
      <ConsentToolbar />
      <CookieBanner />
    </CookieBannerConfigurationProvider>
  );
}
