import type { ComponentType } from "react";
import { BasicBannerWithDefaults } from "./BasicBannerWithDefaults";
import { BuiltInLanguagesAndTextOverrides } from "./BuiltInLanguagesAndTextOverrides";
import { ConsentGatedThirdPartyScripts } from "./ConsentGatedThirdPartyScripts";
import { CustomButtonAndSwitchComponents } from "./CustomButtonAndSwitchComponents";
import { CustomCategoriesWithFineGrainedItems } from "./CustomCategoriesWithFineGrainedItems";
import { CustomStorageAdapterSessionStorage } from "./CustomStorageAdapterSessionStorage";
import { GoogleConsentModeSync } from "./GoogleConsentModeSync";
import { LoadLibraryOnlyAfterConsent } from "./LoadLibraryOnlyAfterConsent";
import { OnDecisionCallbackAndProgrammaticControl } from "./OnDecisionCallbackAndProgrammaticControl";
import { SsrInitialPreferencesNoBannerFlash } from "./SsrInitialPreferencesNoBannerFlash";
import { StandaloneScriptLoaderWithoutProvider } from "./StandaloneScriptLoaderWithoutProvider";
import { StorageStrategiesLocalStorageCookieBoth } from "./StorageStrategiesLocalStorageCookieBoth";
import { ThemeColorsAndDarkMode } from "./ThemeColorsAndDarkMode";
import { VersionBumpAsksVisitorsAgain } from "./VersionBumpAsksVisitorsAgain";

export type Scenario = {
  id: string;
  title: string;
  summary: string;
  file: string;
  Component: ComponentType;
};

export const scenarios: Scenario[] = [
  {
    id: "basic",
    title: "Basic banner with defaults",
    summary:
      "Zero configuration: built-in categories, English texts, the banner and a footer link that opens the settings dialog.",
    file: "BasicBannerWithDefaults.tsx",
    Component: BasicBannerWithDefaults,
  },
  {
    id: "categories",
    title: "Custom categories with fine-grained items",
    summary:
      "Your own categories, plus items inside a category (Meta Pixel, Google Ads). Items are accepted independently of their parent.",
    file: "CustomCategoriesWithFineGrainedItems.tsx",
    Component: CustomCategoriesWithFineGrainedItems,
  },
  {
    id: "scripts",
    title: "Consent-gated third-party scripts",
    summary:
      "The provider loads each script only when its category is accepted and removes it (running cleanup) when consent is withdrawn.",
    file: "ConsentGatedThirdPartyScripts.tsx",
    Component: ConsentGatedThirdPartyScripts,
  },
  {
    id: "load-after-consent",
    title: "Load a library only after consent",
    summary:
      "A component that renders a placeholder while blocked, a skeleton while loading, and the real thing once the script is in.",
    file: "LoadLibraryOnlyAfterConsent.tsx",
    Component: LoadLibraryOnlyAfterConsent,
  },
  {
    id: "standalone",
    title: "Standalone script loader (no provider)",
    summary:
      "registerScript + useConsentScript + loadConsentScript outside any provider: a plain reactive script loader without a consent gate.",
    file: "StandaloneScriptLoaderWithoutProvider.tsx",
    Component: StandaloneScriptLoaderWithoutProvider,
  },
  {
    id: "storage",
    title: "Storage strategies: localStorage, cookie, both",
    summary:
      "Switch where the decision is persisted and watch the raw payload land in localStorage, a cookie, or both.",
    file: "StorageStrategiesLocalStorageCookieBoth.tsx",
    Component: StorageStrategiesLocalStorageCookieBoth,
  },
  {
    id: "custom-storage",
    title: "Custom storage adapter (sessionStorage)",
    summary:
      "Any object with get/set/remove on strings works as storage. Here: sessionStorage.",
    file: "CustomStorageAdapterSessionStorage.tsx",
    Component: CustomStorageAdapterSessionStorage,
  },
  {
    id: "ssr",
    title: "SSR initial preferences, no banner flash",
    summary:
      "Read the cookie before the first render (readPreferencesFromCookies from the /server entry) and seed the provider so nothing flashes.",
    file: "SsrInitialPreferencesNoBannerFlash.tsx",
    Component: SsrInitialPreferencesNoBannerFlash,
  },
  {
    id: "languages",
    title: "Built-in languages and text overrides",
    summary:
      "en / de / pl out of the box; override any single string with full type safety.",
    file: "BuiltInLanguagesAndTextOverrides.tsx",
    Component: BuiltInLanguagesAndTextOverrides,
  },
  {
    id: "theme",
    title: "Theme colors and dark mode",
    summary:
      "The theme prop writes --nsr-* variables; a .dark (or data-theme=dark) ancestor switches the built-in palette.",
    file: "ThemeColorsAndDarkMode.tsx",
    Component: ThemeColorsAndDarkMode,
  },
  {
    id: "components",
    title: "Custom Button and Switch components",
    summary: "Swap the default primitives for your own and add classes to every part.",
    file: "CustomButtonAndSwitchComponents.tsx",
    Component: CustomButtonAndSwitchComponents,
  },
  {
    id: "google",
    title: "Google consent mode sync",
    summary:
      "googleConsentMode keeps gtag('consent', ...) in sync with the analytics / marketing categories. Watch the dataLayer live.",
    file: "GoogleConsentModeSync.tsx",
    Component: GoogleConsentModeSync,
  },
  {
    id: "version",
    title: "Version bump asks visitors again",
    summary:
      "Bump the version prop and the stored decision is ignored: the banner comes back.",
    file: "VersionBumpAsksVisitorsAgain.tsx",
    Component: VersionBumpAsksVisitorsAgain,
  },
  {
    id: "programmatic",
    title: "onDecision callback and programmatic control",
    summary:
      "The whole usePreferences API driven from your own UI, with an onDecision log.",
    file: "OnDecisionCallbackAndProgrammaticControl.tsx",
    Component: OnDecisionCallbackAndProgrammaticControl,
  },
];
