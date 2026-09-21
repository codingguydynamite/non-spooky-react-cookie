import type { ThemePalette } from "non-spooky-react-cookie";
import { CookieBanner, CookieBannerConfigurationProvider } from "non-spooky-react-cookie";
import { useState } from "react";
import { ConsentToolbar } from "../components/ConsentToolbar";

const fields: Array<{ key: keyof ThemePalette; label: string }> = [
  { key: "primaryColor", label: "primaryColor" },
  { key: "primaryTextColor", label: "primaryTextColor" },
  { key: "accentColor", label: "accentColor" },
  { key: "surfaceColor", label: "surfaceColor" },
  { key: "textColor", label: "textColor" },
  { key: "borderColor", label: "borderColor" },
];

/**
 * Two layers of theming:
 * 1. The stylesheet defines `--nsr-*` defaults for light mode and for a
 *    `.dark` / `[data-theme="dark"]` ancestor.
 * 2. The `theme` prop writes the same variables inline on the banner and
 *    dialog roots, so a value you pass wins in both modes.
 */
export function ThemeColorsAndDarkMode() {
  const [dark, setDark] = useState(false);
  const [theme, setTheme] = useState<ThemePalette>({});

  const set = (key: keyof ThemePalette, value: string) =>
    setTheme((current) => ({ ...current, [key]: value || undefined }));

  return (
    // The wrapper carries the `.dark` class. In a real app this is <html>.
    <div className={dark ? "pg-dark-frame dark" : "pg-dark-frame"}>
      <CookieBannerConfigurationProvider storageKey="pg-theme" theme={theme}>
        <div className="pg-card">
          <div className="pg-row">
            <label className="pg-row" style={{ cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={dark}
                onChange={(e) => setDark(e.target.checked)}
              />
              <code>.dark</code> ancestor
            </label>
            <span className="pg-spacer" />
            <button
              className="pg-btn pg-btn--ghost"
              type="button"
              onClick={() => setTheme({})}
            >
              Clear theme
            </button>
          </div>
          <div className="pg-row pg-row--wrap">
            {fields.map((field) => (
              <label key={field.key} className="pg-row">
                <input
                  type="color"
                  value={theme[field.key] ?? "#000000"}
                  onChange={(e) => set(field.key, e.target.value)}
                />
                <code>{field.label}</code>
                {theme[field.key] ? (
                  <button
                    className="pg-btn pg-btn--ghost"
                    type="button"
                    onClick={() => set(field.key, "")}
                  >
                    ×
                  </button>
                ) : null}
              </label>
            ))}
          </div>
          <p className="pg-muted">
            Pick a primary color, then flip dark mode: your color stays, everything else
            switches palette.
          </p>
        </div>
        <ConsentToolbar />
        <CookieBanner policyUrl="#/theme" />
      </CookieBannerConfigurationProvider>
    </div>
  );
}
