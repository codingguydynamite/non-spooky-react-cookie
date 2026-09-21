import {
  loadConsentScript,
  registerScript,
  useConsentScript,
} from "non-spooky-react-cookie";
import { useState } from "react";
import { StatusBadge } from "../components/StatusBadge";

declare global {
  interface Window {
    dayjs?: () => { format: (template: string) => string };
  }
}

// Register once at module level. Outside a provider there is no consent
// gate: the definition store is just a reactive script loader.
registerScript("standalone-dayjs", {
  category: "n/a",
  src: "https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js",
});

function ReactiveConsumer() {
  // Standalone mode: loads on mount, status goes loading → loaded.
  const { status } = useConsentScript("standalone-dayjs");
  return (
    <div className="pg-row">
      <span>useConsentScript("standalone-dayjs")</span>
      <StatusBadge status={status} />
    </div>
  );
}

function ImperativeConsumer() {
  const [result, setResult] = useState<string>("");

  const run = async () => {
    setResult("awaiting loadConsentScript…");
    try {
      // Resolves immediately if loaded, awaits an in-flight load, or starts
      // one. Rejects for unknown ids and on load errors.
      await loadConsentScript("standalone-dayjs");
      setResult(
        `resolved: dayjs().format("YYYY-MM-DD HH:mm:ss") → ${window.dayjs?.().format("YYYY-MM-DD HH:mm:ss")}`,
      );
    } catch (error) {
      setResult(`rejected: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const runUnknown = async () => {
    try {
      await loadConsentScript("never-registered");
    } catch (error) {
      setResult(`rejected: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <>
      <div className="pg-row">
        <button className="pg-btn pg-btn--primary" type="button" onClick={run}>
          await loadConsentScript("standalone-dayjs")
        </button>
        <button className="pg-btn" type="button" onClick={runUnknown}>
          await loadConsentScript("never-registered")
        </button>
      </div>
      {result ? <pre className="pg-log">{result}</pre> : null}
    </>
  );
}

/**
 * No CookieBannerConfigurationProvider anywhere on this page. Useful when
 * you only want the reactive loader, or for scripts that never need consent.
 */
export function StandaloneScriptLoaderWithoutProvider() {
  return (
    <>
      <div className="pg-card">
        <h3>Reactive</h3>
        <ReactiveConsumer />
      </div>
      <div className="pg-card">
        <h3>Imperative</h3>
        <ImperativeConsumer />
      </div>
      <div className="pg-card">
        <p className="pg-muted">
          Tip: the same hooks become consent-gated the moment you render them inside a
          provider whose <code>scripts</code> map declares the id.
        </p>
      </div>
    </>
  );
}
