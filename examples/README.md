# Examples

## `vite-playground`

A small React app with one page per scenario. Run it from the repo root:

```bash
pnpm install
pnpm example        # http://localhost:5173
```

In dev mode the playground imports the library straight from `src/`, so edits to the library hot-reload. `pnpm example:build` builds against the real `dist/` instead, which is what CI does.

Every scenario lives in one file under `vite-playground/src/scenarios/` and uses its own `storageKey`, so pages never share state.

The playground works on phones too: open the dev server URL on a device in the same network (or use the device toolbar in your browser devtools). Under 800px the scenario list becomes a picker at the top, controls grow to 44px tap targets, and the page reserves room for the fixed banner so nothing hides behind it.

| File | Shows |
| --- | --- |
| `BasicBannerWithDefaults.tsx` | Zero-config banner, built-in categories and texts, footer settings link |
| `CustomCategoriesWithFineGrainedItems.tsx` | Your own categories with items; items are accepted independently of their parent |
| `ConsentGatedThirdPartyScripts.tsx` | External and inline scripts that load/unload with consent, `cleanup`, live status per script |
| `LoadLibraryOnlyAfterConsent.tsx` | A component that waits for a script (`useConsentScript`) and renders placeholder → skeleton → real UI |
| `StorageStrategiesLocalStorageCookieBoth.tsx` | `storage="localStorage" | "cookie" | "both"` and `cookieOptions`, with the raw payload shown |
| `CustomStorageAdapterSessionStorage.tsx` | A custom `PreferencesStorage` adapter |
| `SsrInitialPreferencesNoBannerFlash.tsx` | `readPreferencesFromCookies` from the `/server` entry + `initialPreferences` |
| `BuiltInLanguagesAndTextOverrides.tsx` | `language="en" | "de" | "pl"` and typed `texts` overrides |
| `ThemeColorsAndDarkMode.tsx` | The `theme` prop and the `.dark` ancestor palette |
| `CustomButtonAndSwitchComponents.tsx` | Swapping `Button` / `Switch` via `components`, plus `className` props |
| `GoogleConsentModeSync.tsx` | `googleConsentMode` with a live `dataLayer` log |
| `VersionBumpAsksVisitorsAgain.tsx` | Bumping `version` to re-ask visitors |
| `JustDontGlobal.tsx` | `window.justDont()` — the global the provider registers automatically; reject all from the console or an extension |
| `GlobalPrivacyControl.tsx` | `respectGlobalPrivacyControl` — the browser's GPC signal as "Reject all", with a way to simulate the signal |
| `OnDecisionCallbackAndProgrammaticControl.tsx` | `onDecision` and every `usePreferences` action |
