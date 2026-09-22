import type { ConsentConfig, ConsentScripts } from "non-spooky-react-cookie";
import { CookieBanner, CookieBannerConfigurationProvider } from "non-spooky-react-cookie";
import { ConsentToolbar } from "../components/ConsentToolbar";
import { useRespectGpc } from "../components/gpc-settings";
import { ScriptStatusRow } from "../components/StatusBadge";

const config: ConsentConfig = {
  categories: {
    necessary: { required: true, name: "Necessary" },
    analytics: { name: "Analytics" },
    marketing: {
      name: "Marketing",
      items: {
        "meta-pixel": { name: "Meta Pixel" },
        "google-ads": { name: "Google Ads" },
      },
    },
  },
};

/**
 * Inline scripts run in the global scope, so each body is a self-contained
 * IIFE. This one draws a small card into a target div, and the `cleanup`
 * below empties it again when consent is withdrawn.
 */
function drawCardScript(targetId: string, text: string): string {
  return `(function(){var host=document.getElementById(${JSON.stringify(targetId)});if(!host)return;host.textContent=${JSON.stringify(text)};host.style.color="#047857";host.style.borderColor="#6ee7b7";})();`;
}

function clearCard(targetId: string) {
  const host = document.getElementById(targetId);
  if (!host) return;
  host.textContent = "Empty. Appears after consent.";
  host.style.color = "";
  host.style.borderColor = "";
}

/**
 * The provider is the single enforcement point: a script loads when its
 * `category` (category id or item id) is accepted and is removed, with
 * `cleanup`, when that consent goes away.
 */
const scripts: ConsentScripts = {
  // External library gated on a category. day.js is tiny and side-effect
  // free, standing in for GA / Hotjar / …
  dayjs: {
    category: "analytics",
    src: "https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js",
    onLoad: () => console.info("[playground] dayjs loaded"),
    cleanup: () => {
      delete (window as unknown as Record<string, unknown>).dayjs;
    },
  },
  // Gated on an *item*: loads when "Meta Pixel" is on, even if the Marketing
  // master switch is off. (Deliberately a broken URL so you can see `error`.)
  "meta-pixel": {
    category: "meta-pixel",
    src: "https://example.invalid/fbevents.js",
    attrs: { "data-pixel-id": "PLAYGROUND" },
  },
  // Inline scripts gated on categories; they draw into the boxes below.
  // The target ids must differ from the script keys: the provider gives the
  // injected <script> element `id = key`, and it sits in <head>, so a div with
  // the same id would lose the getElementById lookup to the script tag.
  "demo-analytics": {
    category: "analytics",
    children: drawCardScript(
      "demo-analytics-target",
      "Analytics script ran and drew this.",
    ),
    cleanup: () => clearCard("demo-analytics-target"),
  },
  "demo-marketing": {
    category: "marketing",
    children: drawCardScript(
      "demo-marketing-target",
      "Marketing script ran and drew this.",
    ),
    cleanup: () => clearCard("demo-marketing-target"),
  },
};

export function ConsentGatedThirdPartyScripts() {
  const respectGpc = useRespectGpc();
  return (
    <CookieBannerConfigurationProvider
      respectGlobalPrivacyControl={respectGpc}
      storageKey="pg-scripts"
      config={config}
      scripts={scripts}
    >
      <div className="pg-card">
        <h3>Live status of every managed script</h3>
        <ul className="pg-scripts">
          <ScriptStatusRow id="dayjs" gate="analytics (category)" />
          <ScriptStatusRow id="demo-analytics" gate="analytics (category, inline)" />
          <ScriptStatusRow
            id="meta-pixel"
            gate="meta-pixel (item, broken URL on purpose)"
          />
          <ScriptStatusRow id="demo-marketing" gate="marketing (category, inline)" />
        </ul>
      </div>

      <div className="pg-card">
        <h3>Targets the inline scripts draw into</h3>
        <div className="pg-row" style={{ alignItems: "stretch" }}>
          <div id="demo-analytics-target" className="pg-target" style={{ flex: 1 }}>
            Empty. Appears after consent.
          </div>
          <div id="demo-marketing-target" className="pg-target" style={{ flex: 1 }}>
            Empty. Appears after consent.
          </div>
        </div>
        <p className="pg-muted">
          Check the document head in devtools: the &lt;script id="…"&gt; elements come and
          go with your choice.
        </p>
      </div>

      <ConsentToolbar />
      <CookieBanner />
    </CookieBannerConfigurationProvider>
  );
}
