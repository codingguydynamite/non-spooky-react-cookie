"use client";

export { CookieBanner } from "./CookieBanner";
export { CookieBannerConfigurationProvider } from "./CookieBannerConfigurationProvider";
export { CookieSettingsDialog } from "./CookieSettingsDialog";
export { CookieSettingsLink } from "./CookieSettingsLink";
export type { UseConsentScriptResult } from "./hooks/useConsentScript";
export { useConsentScript } from "./hooks/useConsentScript";
export { usePreferences } from "./hooks/usePreferences";
export {
  initGoogleTracker,
  updateGoogleTracker,
} from "./integrations/google-tracker";
export type { LoadScriptOptions } from "./integrations/script-loader";
export {
  ensureScript,
  loadConsentScript,
  loadScript,
  removeScript,
  unloadScript,
} from "./integrations/script-loader";
export {
  clearRegistry,
  getRegisteredScript,
  getRegisteredScripts,
  registerScript,
  unregisterScript,
} from "./integrations/script-registry";
export type { ScriptStatus } from "./integrations/script-runtime";
export {
  createBothStorage,
  createCookieStorage,
  localStorageAdapter,
} from "./storage";
export type {
  ButtonLikeProps,
  CategoryTexts,
  CollapsibleProps,
  ConsentCategoryConfig,
  ConsentConfig,
  ConsentItemConfig,
  ConsentScript,
  ConsentScripts,
  CookieBannerConfigurationProviderProps,
  CookieBannerContextValue,
  CookieBannerProps,
  CookieSettingsDialogProps,
  CookieSettingsLinkProps,
  CookieStorageOptions,
  DeepPartial,
  ItemTexts,
  PreferenceCategory,
  PreferenceComponents,
  PreferenceItem,
  PreferencesState,
  PreferencesStorage,
  PreferencesUpdate,
  StorageKind,
  SwitchLikeProps,
  TextOverrides,
  Texts,
  ThemePalette,
} from "./types";
export { Button, Collapsible, cn, Switch } from "./ui";
