import type { ThemePalette } from "non-spooky-react-cookie";
import {
  CookieBanner,
  CookieBannerConfigurationProvider,
  CookieSettingsLink,
} from "non-spooky-react-cookie";
import { useState } from "react";
import { ConsentToolbar } from "../components/ConsentToolbar";
import { useRespectGpc } from "../components/gpc-settings";

type Key = keyof ThemePalette;
type Mode = "light" | "dark";

/** Built-in values of the five input colors, shown in the swatch while unset. */
const builtIn: Record<Mode, Partial<Record<Key, string>>> = {
  light: {
    primaryColor: "#155e75",
    primaryTextColor: "#ffffff",
    accentColor: "#0e7490",
    surfaceColor: "#ffffff",
    textColor: "#09090b",
  },
  dark: {
    primaryColor: "#22d3ee",
    primaryTextColor: "#083344",
    accentColor: "#22d3ee",
    surfaceColor: "#09090b",
    textColor: "#fafafa",
  },
};

const groups: Array<{ title: string; keys: Key[] }> = [
  {
    title: "Inputs — everything else is derived from these",
    keys: [
      "primaryColor",
      "primaryTextColor",
      "accentColor",
      "surfaceColor",
      "textColor",
    ],
  },
  {
    title: "Derived — set one only to override the derivation",
    keys: [
      "primaryHoverColor",
      "secondaryColor",
      "secondaryTextColor",
      "surfaceMutedColor",
      "mutedTextColor",
      "borderColor",
      "ringColor",
      "switchOffColor",
      "switchThumbColor",
      "backdropColor",
    ],
  },
];

/** Full brand palettes; the "Midnight" and "Sunny" ones used to break the old theming. */
const presets: Record<string, { theme: ThemePalette; darkTheme: ThemePalette }> = {
  "Purple brand": {
    theme: { primaryColor: "#6d28d9", accentColor: "#6d28d9" },
    darkTheme: {
      primaryColor: "#a78bfa",
      primaryTextColor: "#2e1065",
      accentColor: "#c4b5fd",
    },
  },
  "Midnight (dark surface, any mode)": {
    theme: {
      surfaceColor: "#1e1b4b",
      textColor: "#f5f3ff",
      primaryColor: "#a78bfa",
      primaryTextColor: "#2e1065",
      accentColor: "#c4b5fd",
    },
    darkTheme: {},
  },
  "Sunny (light primary)": {
    theme: {
      primaryColor: "#fde047",
      primaryTextColor: "#422006",
      accentColor: "#a16207",
    },
    darkTheme: {},
  },
};

/**
 * Two layers of theming:
 * 1. The stylesheet defines `--nsr-*` defaults for light mode and for a
 *    `.dark` / `[data-theme="dark"]` ancestor. Muted text, borders, secondary
 *    buttons, hover states and switch parts are derived from surface/text/
 *    primary with `color-mix()`, so a custom surface never leaves stale
 *    defaults behind.
 * 2. `theme` writes the same variables into a scoped `<style>` for this
 *    provider's banner, dialog and settings link; `darkTheme` does the same
 *    under a dark ancestor only.
 */
export function ThemeColorsAndDarkMode() {
  const respectGpc = useRespectGpc();
  const [dark, setDark] = useState(false);
  const [editing, setEditing] = useState<Mode>("light");
  const [theme, setTheme] = useState<ThemePalette>({});
  const [darkTheme, setDarkTheme] = useState<ThemePalette>({});

  const palette = editing === "light" ? theme : darkTheme;
  const setPalette = editing === "light" ? setTheme : setDarkTheme;
  const set = (key: Key, value: string) =>
    setPalette((current) => ({ ...current, [key]: value || undefined }));

  return (
    // The wrapper carries the `.dark` class. In a real app this is <html>.
    <div className={dark ? "pg-dark-frame dark" : "pg-dark-frame"}>
      <CookieBannerConfigurationProvider
        respectGlobalPrivacyControl={respectGpc}
        storageKey="pg-theme"
        theme={theme}
        darkTheme={darkTheme}
      >
        <div className="pg-card">
          <div className="pg-row pg-row--wrap">
            <label className="pg-row" style={{ cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={dark}
                onChange={(e) => setDark(e.target.checked)}
              />
              <code>.dark</code> ancestor
            </label>
            <span className="pg-spacer" />
            {Object.entries(presets).map(([name, preset]) => (
              <button
                key={name}
                className="pg-btn"
                type="button"
                onClick={() => {
                  setTheme(preset.theme);
                  setDarkTheme(preset.darkTheme);
                }}
              >
                {name}
              </button>
            ))}
            <button
              className="pg-btn pg-btn--ghost"
              type="button"
              onClick={() => {
                setTheme({});
                setDarkTheme({});
              }}
            >
              Clear
            </button>
          </div>

          <div className="pg-row" role="radiogroup" aria-label="Palette being edited">
            <span className="pg-label" style={{ margin: 0 }}>
              Editing:
            </span>
            {(["light", "dark"] as Mode[]).map((mode) => (
              <label key={mode} className="pg-row" style={{ cursor: "pointer" }}>
                <input
                  type="radio"
                  name="pg-theme-mode"
                  checked={editing === mode}
                  onChange={() => setEditing(mode)}
                />
                <code>{mode === "light" ? "theme" : "darkTheme"}</code>
              </label>
            ))}
            <span className="pg-muted" style={{ margin: 0 }}>
              {editing === "light"
                ? "applies in both modes unless darkTheme overrides it"
                : "applies under .dark only, falls back to theme"}
            </span>
          </div>

          {groups.map((group) => (
            <div key={group.title}>
              <p className="pg-label" style={{ marginTop: "0.75rem" }}>
                {group.title}
              </p>
              <div className="pg-row pg-row--wrap">
                {group.keys.map((key) => {
                  const own = palette[key];
                  // What the banner actually shows when this key is unset.
                  const fallback = builtIn[dark ? "dark" : "light"][key];
                  return (
                    <label key={key} className="pg-row pg-swatch">
                      <input
                        type="color"
                        value={own ?? fallback ?? "#888888"}
                        style={(own ?? fallback) ? undefined : { opacity: 0.35 }}
                        title={own ? own : fallback ? `built-in ${fallback}` : "derived"}
                        onChange={(e) => set(key, e.target.value)}
                      />
                      <code>{key}</code>
                      {own ? (
                        <button
                          className="pg-btn pg-btn--ghost"
                          type="button"
                          aria-label={`Unset ${key}`}
                          onClick={() => set(key, "")}
                        >
                          ×
                        </button>
                      ) : (
                        <span className="pg-muted" style={{ margin: 0 }}>
                          {fallback ? "built-in" : "auto"}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          <p className="pg-muted" style={{ marginTop: "0.75rem" }}>
            Try "Midnight" then flip <code>.dark</code>: the surface stays readable,
            because muted text, borders and buttons follow it. Set <code>darkTheme</code>{" "}
            colors to give dark mode its own brand.
          </p>
        </div>
        <ConsentToolbar />
        <div className="pg-card pg-row">
          <span className="pg-muted" style={{ margin: 0 }}>
            Footer link (hover follows <code>accentColor</code>):
          </span>
          <CookieSettingsLink />
        </div>
        <CookieBanner policyUrl="#/theme" />
      </CookieBannerConfigurationProvider>
    </div>
  );
}
