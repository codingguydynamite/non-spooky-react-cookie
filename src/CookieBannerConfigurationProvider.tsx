"use client";

import type * as React from "react";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  initGoogleTracker,
  updateGoogleTracker,
} from "./integrations/google-tracker";
import { ensureScript, removeScript } from "./integrations/script-loader";
import {
  registerScript,
  unregisterScript,
} from "./integrations/script-registry";
import { resolveTexts } from "./resolve-texts";
import "./styles.css";
import {
  DEFAULT_STORAGE_KEY,
  readPreferences,
  removePreferences,
  resolveStorage,
  writePreferences,
} from "./storage";
import type {
  ConsentConfig,
  CookieBannerContextValue,
  CookieBannerConfigurationProviderProps,
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
  secondaryColor: "--nsr-secondary",
  secondaryTextColor: "--nsr-secondary-text",
  accentColor: "--nsr-accent",
  surfaceColor: "--nsr-surface",
  textColor: "--nsr-text",
  mutedTextColor: "--nsr-muted",
  borderColor: "--nsr-border",
};

/** Resolves the theme palette into CSS custom properties (set values only). */
function themeToStyle(theme: ThemePalette): React.CSSProperties {
  const entries = Object.entries(themeVariables).flatMap(([key, variable]) => {
    const value = theme[key as keyof ThemePalette];
    return value ? [[variable, value]] : [];
  });

  return Object.fromEntries(entries) as React.CSSProperties;
}

export function CookieBannerConfigurationProvider({
  children,
  config,
  scripts,
  language = "en",
  texts: textOverrides,
  theme = {},
  components = {},
  storageKey = DEFAULT_STORAGE_KEY,
  storage = "localStorage",
  cookieOptions,
  initialPreferences,
  version = DEFAULT_VERSION,
  googleConsentMode = false,
  onDecision,
}: Readonly<CookieBannerConfigurationProviderProps>) {
  // Keyed on the serialized options so an inline `cookieOptions={{ ... }}`
  // does not create a new store (and re-run the hydration effect) per render.
  const cookieOptionsKey = JSON.stringify(cookieOptions ?? null);
  const store = useMemo(
    () =>
      resolveStorage(
        storage,
        (JSON.parse(cookieOptionsKey) as CookieStorageOptions | null) ??
          undefined,
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
  const themeStyle = useMemo(() => themeToStyle(theme), [theme]);

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

  // Restore the stored decision (same version only) after hydration.
  useEffect(() => {
    if (googleConsentMode) initGoogleTracker();

    const stored = readPreferences(store, storageKey);
    const restored = stored?.version === version ? stored : null;
    const next = restored ?? buildState(version, categories, false);

    setState(next);
    setHasDecision(restored !== null);
    syncGoogle(next);
    setLoaded(true);
  }, [categories, googleConsentMode, storageKey, store, syncGoogle, version]);

  // Register the declared scripts in the definition store; on unmount (or a
  // new `scripts` map) unload and unregister exactly those — the registry
  // may also hold scripts of other providers or standalone consumers.
  useEffect(() => {
    const entries = Object.entries(scripts ?? {});
    entries.forEach(([id, def]) => registerScript(id, def));

    return () => {
      entries.forEach(([id, def]) => {
        removeScript(id, def.cleanup);
        unregisterScript(id);
      });
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
      settingsOpen,
      preferences: state,
      texts,
      categories,
      scripts: scripts ?? {},
      theme,
      components,
      themeStyle,
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
      themeStyle,
    ],
  );

  return (
    <CookieBannerContext.Provider value={value}>
      {children}
    </CookieBannerContext.Provider>
  );
}
