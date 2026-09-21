import type { TextOverrides } from "non-spooky-react-cookie";
import {
  CookieBanner,
  CookieBannerConfigurationProvider,
  CookieSettingsLink,
} from "non-spooky-react-cookie";
import { useState } from "react";
import { ConsentToolbar } from "../components/ConsentToolbar";

const languages = ["en", "de", "pl"] as const;

/**
 * `texts` is a deep-partial of the full `Texts` type: list only what you
 * change, keep autocomplete for everything.
 */
const overrides: TextOverrides = {
  banner: {
    title: "🍪 Cookies, but not the spooky kind",
    acceptAll: "Sure, all of them",
  },
  dialog: { save: "Save my choice" },
  footerLink: "Cookie preferences",
  categories: {
    analytics: { description: "Anonymous statistics so we know which pages help." },
  },
};

export function BuiltInLanguagesAndTextOverrides() {
  const [language, setLanguage] = useState<(typeof languages)[number]>("en");
  const [override, setOverride] = useState(false);

  return (
    <CookieBannerConfigurationProvider
      storageKey="pg-languages"
      language={language}
      texts={override ? overrides : undefined}
    >
      <div className="pg-card">
        <div className="pg-row pg-row--wrap">
          <span className="pg-label" style={{ margin: 0 }}>
            language=
          </span>
          {languages.map((code) => (
            <button
              key={code}
              className={language === code ? "pg-btn pg-btn--primary" : "pg-btn"}
              type="button"
              onClick={() => setLanguage(code)}
            >
              {code}
            </button>
          ))}
          <span className="pg-spacer" />
          <label className="pg-row" style={{ cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={override}
              onChange={(e) => setOverride(e.target.checked)}
            />
            apply <code>texts</code> overrides
          </label>
        </div>
        <p className="pg-muted">
          Unknown languages fall back to English. Category and item names passed via{" "}
          <code>config</code> win over <code>texts</code>.
        </p>
      </div>

      <ConsentToolbar />

      <footer className="pg-footer">
        <CookieSettingsLink />
      </footer>

      <CookieBanner policyUrl="#/languages" />
    </CookieBannerConfigurationProvider>
  );
}
