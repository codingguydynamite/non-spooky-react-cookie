import { CookieBanner, CookieBannerConfigurationProvider } from "non-spooky-react-cookie";
import { useState } from "react";
import { ConsentToolbar } from "../components/ConsentToolbar";
import { useRespectGpc } from "../components/gpc-settings";

/**
 * As soon as the provider mounts, `window.justDont()` is available from the
 * DevTools console — no extra prop, no script tag. This scenario calls it
 * exactly the way a console snippet or a browser extension would.
 */
export function JustDontGlobal() {
  const respectGpc = useRespectGpc();
  const [log, setLog] = useState<string[]>([]);

  const logCall = (label: string) => {
    setLog((current) => [`${new Date().toLocaleTimeString()}  ${label}`, ...current]);
  };

  const callJustDont = () => {
    const w = window as { justDont?: () => void };
    if (typeof w.justDont !== "function") {
      logCall("window.justDont is not a function (provider not mounted?)");
      return;
    }
    w.justDont();
    logCall("window.justDont() → all optional categories rejected");
  };

  return (
    <CookieBannerConfigurationProvider
      respectGlobalPrivacyControl={respectGpc}
      storageKey="pg-just-dont"
    >
      <div className="pg-card">
        <h3>window.justDont()</h3>
        <p className="pg-muted">
          The provider registers <code>window.justDont()</code> automatically — no
          configuration. It rejects every optional category (required ones stay on),
          closes the banner and unloads the consent-gated scripts. Call it from the
          DevTools console or an "I don't care about cookies"-style extension:
        </p>
        <div className="pg-row pg-row--wrap">
          <button className="pg-btn pg-btn--primary" type="button" onClick={callJustDont}>
            window.justDont()
          </button>
          <button
            className="pg-btn"
            type="button"
            onClick={() => logCall("console: window.justDont() — try it in DevTools")}
          >
            try it in the console
          </button>
        </div>
        <p className="pg-muted">
          Opt out anywhere with <code>windowJustDont={"{false}"}</code> on the provider.
        </p>
        {log.length > 0 && <pre className="pg-log">{log.join("\n")}</pre>}
      </div>
      <ConsentToolbar />
      <CookieBanner />
    </CookieBannerConfigurationProvider>
  );
}
