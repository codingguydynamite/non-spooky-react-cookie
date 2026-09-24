"use client";

import type * as React from "react";
import {
  createContext,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { readGlobalPrivacyControl } from "./integrations/global-privacy-control";
import { initGoogleTracker, updateGoogleTracker } from "./integrations/google-tracker";
import { ensureScript, removeScript } from "./integrations/script-loader";
import { resolveTexts } from "./resolve-texts";
import {
  DEFAULT_STORAGE_KEY,
  readPreferences,
  removePreferences,
  resolveStorage,
  writePreferences,
} from "./storage";
import type {
  ConsentConfig,
  CookieBannerConfigurationProviderProps,
  CookieBannerContextValue,
  CookieStorageOptions,
  PreferenceCategory,
  PreferencesState,
  PreferencesUpdate,
  ThemePalette,
} from "./types";

const DEFAULT_VERSION = "1";

const defaultCategories: PreferenceCategory[] = [
  { id: "necessary", required: true },
  { id: "preferences" },
  { id: "analytics" },
  { id: "marketing" },
];

/** Maps the object-map `config` prop to the internal category array. */
function configToCategories(config: ConsentConfig): PreferenceCategory[] {
  return Object.entries(config.categories).map(([id, category]) => ({
    id,
    title: category.name,
    description: category.description,
    required: category.required,
    items: category.items
      ? Object.entries(category.items).map(([itemId, item]) => ({
          id: itemId,
          title: item.name,
          description: item.description,
        }))
      : undefined,
  }));
}

export const CookieBannerContext = createContext<CookieBannerContextValue | null>(null);

/**
 * Builds a complete state. Required categories are always on; optional
 * categories and every item follow `acceptOptional`.
 */
function buildState(
  version: string,
  categories: PreferenceCategory[],
  acceptOptional: boolean,
): PreferencesState {
  const accepted: Record<string, boolean> = {};

  categories.forEach((category) => {
    accepted[category.id] = Boolean(category.required) || acceptOptional;
    category.items?.forEach((item) => {
      accepted[item.id] = acceptOptional;
    });
  });

  return { version, updatedAt: new Date().toISOString(), accepted };
}

const themeVariables: Record<keyof ThemePalette, string> = {
  primaryColor: "--nsr-primary",
  primaryTextColor: "--nsr-primary-text",
  primaryHoverColor: "--nsr-primary-hover",
  secondaryColor: "--nsr-secondary",
  secondaryTextColor: "--nsr-secondary-text",
  accentColor: "--nsr-accent",
  surfaceColor: "--nsr-surface",
  surfaceMutedColor: "--nsr-surface-muted",
  textColor: "--nsr-text",
  mutedTextColor: "--nsr-muted",
  borderColor: "--nsr-border",
  ringColor: "--nsr-ring",
  switchOffColor: "--nsr-switch-off",
  switchThumbColor: "--nsr-switch-thumb",
  backdropColor: "--nsr-backdrop",
};

/** The attribute that scopes a provider's theme rules to its elements. */
export const THEME_ATTRIBUTE = "data-nsr-theme";

/**
 * Keeps a palette value safe to embed in a stylesheet: a value is a single
 * CSS color, so it never needs a declaration or block terminator.
 */
function sanitizeCssValue(value: string): string {
  return value.replace(/[;{}<>]/g, "").trim();
}

/** `[--nsr-x, value]` pairs for the set entries of a palette. */
function themeEntries(theme: ThemePalette): Array<[string, string]> {
  return Object.entries(themeVariables).flatMap(([key, variable]) => {
    const value = theme[key as keyof ThemePalette];
    return value ? [[variable, sanitizeCssValue(value)] as [string, string]] : [];
  });
}

/** Resolves the theme palette into CSS custom properties (set values only). */
function themeToStyle(theme: ThemePalette): React.CSSProperties {
  return Object.fromEntries(themeEntries(theme)) as React.CSSProperties;
}

/**
 * Builds the scoped stylesheet for one provider. `theme` applies to every
 * element carrying the provider's theme attribute; `darkTheme` applies to the
 * same elements under a `.dark` / `[data-theme="dark"]` ancestor. Returns an
 * empty string when neither palette sets anything, so nothing is rendered.
 */
export function buildThemeCss(
  id: string,
  theme: ThemePalette,
  darkTheme: ThemePalette,
): string {
  const scope = `[${THEME_ATTRIBUTE}="${id.replace(/["\\]/g, "")}"]`;
  const block = (entries: Array<[string, string]>) =>
    entries.map(([variable, value]) => `  ${variable}: ${value};`).join("\n");

  const light = themeEntries(theme);
  const dark = themeEntries(darkTheme);
  const rules: string[] = [];

  if (light.length > 0) rules.push(`${scope} {\n${block(light)}\n}`);
  if (dark.length > 0) {
    rules.push(`:is(.dark, [data-theme="dark"]) ${scope} {\n${block(dark)}\n}`);
  }

  return rules.join("\n");
}

export function CookieBannerConfigurationProvider({
  children,
  config,
  scripts,
  language = "en",
  texts: textOverrides,
  theme = {},
  darkTheme = {},
  components = {},
  storageKey = DEFAULT_STORAGE_KEY,
  storage = "localStorage",
  cookieOptions,
  initialPreferences,
  version = DEFAULT_VERSION,
  googleConsentMode = false,
  windowJustDont = true,
  respectGlobalPrivacyControl = true,
  onDecision,
}: Readonly<CookieBannerConfigurationProviderProps>) {
  // Keyed on the serialized options so an inline `cookieOptions={{ ... }}`
  // does not create a new store (and re-run the hydration effect) per render.
  const cookieOptionsKey = JSON.stringify(cookieOptions ?? null);
  const store = useMemo(
    () =>
      resolveStorage(
        storage,
        (JSON.parse(cookieOptionsKey) as CookieStorageOptions | null) ?? undefined,
      ),
    [storage, cookieOptionsKey],
  );
  const categories = useMemo(
    () => (config ? configToCategories(config) : defaultCategories),
    [config],
  );
  const texts = useMemo(
    () => resolveTexts(language, textOverrides),
    [language, textOverrides],
  );

  // Theme rules live in a <style> scoped by this attribute (not inline
  // styles) so `darkTheme` can win under a `.dark` ancestor. Keyed on the
  // serialized palettes so an inline `theme={{ ... }}` literal is free.
  const themeId = useId();
  const themeKey = JSON.stringify(theme);
  const darkThemeKey = JSON.stringify(darkTheme);
  const themeStyle = useMemo(
    () => themeToStyle(JSON.parse(themeKey) as ThemePalette),
    [themeKey],
  );
  const themeCss = useMemo(
    () =>
      buildThemeCss(
        themeId,
        JSON.parse(themeKey) as ThemePalette,
        JSON.parse(darkThemeKey) as ThemePalette,
      ),
    [darkThemeKey, themeId, themeKey],
  );
  const themeAttributes = useMemo(() => ({ [THEME_ATTRIBUTE]: themeId }), [themeId]);

  // Which category owns each item (used to resolve item labels).
  const itemToCategory = useMemo(() => {
    const owners: Record<string, string> = {};
    categories.forEach((category) => {
      category.items?.forEach((item) => {
        owners[item.id] = category.id;
      });
    });
    return owners;
  }, [categories]);

  // A server-read decision (same version only) seeds the first render so it
  // matches the server markup; the effect below re-reads the client storage.
  const restoredInitial =
    initialPreferences?.version === version ? initialPreferences : null;

  const [loaded, setLoaded] = useState(initialPreferences !== undefined);
  const [hasDecision, setHasDecision] = useState(restoredInitial !== null);
  const [globalPrivacyControl, setGlobalPrivacyControl] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [state, setState] = useState<PreferencesState>(
    () => restoredInitial ?? buildState(version, categories, false),
  );

  const syncGoogle = useCallback(
    (next: PreferencesState) => {
      if (googleConsentMode) updateGoogleTracker(next, categories);
    },
    [categories, googleConsentMode],
  );

  // The hydration effect reads `onDecision` through a ref so an inline
  // callback (new identity every render) never re-runs it.
  const onDecisionRef = useRef(onDecision);
  useEffect(() => {
    onDecisionRef.current = onDecision;
  }, [onDecision]);

  // Restore the stored decision (same version only) after hydration.
  useEffect(() => {
    if (googleConsentMode) initGoogleTracker();

    const stored = readPreferences(store, storageKey);
    const restored = stored?.version === version ? stored : null;
    const gpc = respectGlobalPrivacyControl && readGlobalPrivacyControl();
    const next = restored ?? buildState(version, categories, false);

    // An explicit answer on this site always wins. Without one, an active
    // Global Privacy Control signal counts as "Reject all" — `next` already
    // is that state — so the banner never shows. It is kept in memory only:
    // the signal is live, and turning it off should bring the banner back.
    const decidedByGpc = restored === null && gpc;

    setState(next);
    setHasDecision(restored !== null || decidedByGpc);
    setGlobalPrivacyControl(gpc);
    syncGoogle(next);
    setLoaded(true);
    if (decidedByGpc) onDecisionRef.current?.(next);
  }, [
    categories,
    googleConsentMode,
    respectGlobalPrivacyControl,
    storageKey,
    store,
    syncGoogle,
    version,
  ]);

  // On unmount (or a new `scripts` map) unload exactly the declared scripts.
  useEffect(() => {
    const entries = Object.entries(scripts ?? {});
    return () => {
      for (const [id, def] of entries) {
        removeScript(id, def.cleanup);
      }
    };
  }, [scripts]);

  // Central consent enforcement: a script loads when its own category or
  // item id is accepted (items are not gated by their parent category) and
  // is removed, with cleanup, when that consent is withdrawn.
  useEffect(() => {
    if (!loaded) return;

    Object.entries(scripts ?? {}).forEach(([id, def]) => {
      if (state.accepted[def.category]) {
        ensureScript(id, def);
      } else {
        removeScript(id, def.cleanup);
      }
    });
  }, [loaded, scripts, state.accepted]);

  const persist = useCallback(
    (next: PreferencesState) => {
      setState(next);
      setHasDecision(true);
      setSettingsOpen(false);
      writePreferences(store, storageKey, next);
      syncGoogle(next);
      onDecision?.(next);
    },
    [onDecision, storageKey, store, syncGoogle],
  );

  const acceptAll = useCallback(
    () => persist(buildState(version, categories, true)),
    [categories, persist, version],
  );

  const rejectAll = useCallback(
    () => persist(buildState(version, categories, false)),
    [categories, persist, version],
  );

  const savePreferences = useCallback(
    (partial: PreferencesUpdate) =>
      persist({
        version,
        updatedAt: new Date().toISOString(),
        accepted: { ...state.accepted, ...partial.accepted },
      }),
    [persist, state.accepted, version],
  );

  const resetPreferences = useCallback(() => {
    const initial = buildState(version, categories, false);
    removePreferences(store, storageKey);
    setState(initial);
    setHasDecision(false);
    setSettingsOpen(false);
    syncGoogle(initial);
    onDecision?.(initial);
  }, [categories, onDecision, storageKey, store, syncGoogle, version]);

  const openSettings = useCallback(() => setSettingsOpen(true), []);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  const isAllowed = useCallback(
    (id: string) => Boolean(state.accepted[id]),
    [state.accepted],
  );

  /**
   * Resolves the display title/description for a category or item,
   * preferring the config values, then the texts, then the id.
   */
  const resolveLabel = useCallback(
    (
      id: string,
      config?: { title?: string; description?: string },
    ): { title: string; description: string } => {
      const parent = itemToCategory[id];
      const source = parent
        ? texts.categories[parent]?.items?.[id]
        : texts.categories[id];

      return {
        title: config?.title ?? source?.title ?? id,
        description: config?.description ?? source?.description ?? "",
      };
    },
    [itemToCategory, texts],
  );

  const value = useMemo<CookieBannerContextValue>(
    () => ({
      loaded,
      hasDecision,
      showBanner: loaded && !hasDecision,
      globalPrivacyControl,
      settingsOpen,
      preferences: state,
      texts,
      categories,
      scripts: scripts ?? {},
      theme,
      darkTheme,
      components,
      themeStyle,
      themeAttributes,
      acceptAll,
      rejectAll,
      savePreferences,
      resetPreferences,
      openSettings,
      closeSettings,
      isAllowed,
      resolveLabel,
    }),
    [
      acceptAll,
      categories,
      closeSettings,
      components,
      darkTheme,
      globalPrivacyControl,
      hasDecision,
      isAllowed,
      loaded,
      openSettings,
      rejectAll,
      resetPreferences,
      resolveLabel,
      savePreferences,
      scripts,
      settingsOpen,
      state,
      texts,
      theme,
      themeAttributes,
      themeStyle,
    ],
  );

  // One global function, `window.justDont()`, that rejects all optional
  // categories — aimed at console snippets and "I don't care about
  // cookies"-style browser extensions. No opt-in needed: it is registered
  // as soon as the provider mounts, and re-registered whenever `rejectAll`
  // changes so the global never holds a stale closure.
  useEffect(() => {
    if (!windowJustDont || typeof window === "undefined") return;

    const w = window as unknown as { justDont?: () => void };
    if (typeof w.justDont === "function") {
      console.warn(
        "[non-spooky-react-cookie] window.justDont already exists; the " +
          "cookie banner will overwrite it.",
      );
    }

    w.justDont = rejectAll;
    return () => {
      // Only clear the slot when we still own it, so an unmount never
      // removes a global a later-mounted provider registered.
      if (w.justDont === rejectAll) delete w.justDont;
    };
  }, [rejectAll, windowJustDont]);

  return (
    <CookieBannerContext.Provider value={value}>
      {themeCss ? <style data-nsr-theme-style={themeId}>{themeCss}</style> : null}
      {children}
    </CookieBannerContext.Provider>
  );
}
