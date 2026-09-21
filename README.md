# non-spooky-react-cookie

[![npm](https://img.shields.io/npm/v/non-spooky-react-cookie)](https://www.npmjs.com/package/non-spooky-react-cookie)
[![CI](https://github.com/KamilAdamski/non-spooky-react-cookie/actions/workflows/ci.yml/badge.svg)](https://github.com/KamilAdamski/non-spooky-react-cookie/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/non-spooky-react-cookie)](./LICENSE)

A friendly, lightweight cookie consent manager for React and Next.js. Optional scripts stay out of the DOM until the visitor accepts them. No spooky tracking before the visitor says yes.

- Banner + settings dialog (native `<dialog>`, keyboard and screen-reader friendly)
- Categories and fine-grained items, each accepted independently
- The provider loads and unloads your third-party scripts with consent, including `cleanup`
- `useConsentScript`: a reactive `blocked | loading | loaded | error` status for any script
- Persist to localStorage, a cookie, both, or your own adapter; read the decision on the server
- Built-in `en` / `de` / `pl` texts, fully typed overrides
- Plain CSS with `--nsr-*` variables and dark mode. No Tailwind or other framework required
- React 18+, works with React 19 and the Next.js App Router

Try every feature in the [examples playground](./examples/README.md).

## Install

```bash
pnpm add non-spooky-react-cookie
# or: npm install non-spooky-react-cookie
```

Import the stylesheet once, anywhere in your app (for Next.js: `app/layout.tsx`):

```ts
import "non-spooky-react-cookie/styles.css";
```

## Basic setup

```tsx
import { CookieBanner, CookieBannerConfigurationProvider } from "non-spooky-react-cookie";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CookieBannerConfigurationProvider language="de" storageKey="my-site-cookies">
      {children}
      <CookieBanner policyUrl="/datenschutz" />
    </CookieBannerConfigurationProvider>
  );
}
```

In the Next.js App Router put this in a client component (`"use client"`) and render it from your root layout. The package's main entry is itself a client module.

## What you get

- `CookieBannerConfigurationProvider` – owns the state, storage, texts, theme, callbacks, **and** the loading/unloading of your third-party scripts
- `CookieBanner` – the first layer visitors see (with the settings dialog built in)
- `CookieSettingsDialog` – the full cookie settings dialog (rendered automatically by `CookieBanner`)
- `CookieSettingsLink` – a small link (e.g. in a footer) that opens the cookie settings dialog
- `Button` / `Switch` / `Collapsible` – the default primitives, exported so you can wrap or reuse them
- `usePreferences` – the hook for consent state and actions
- `useConsentScript` – **reactive**, consent-gated load status (`blocked | loading | loaded | error`) for a script declared in the provider
- `initGoogleTracker` / `updateGoogleTracker` – Google consent mode sync
- `localStorageAdapter` / `createCookieStorage` / `createBothStorage` – the built-in storage adapters
- `non-spooky-react-cookie/server` → `readPreferencesFromCookies` – read the decision on the server (no React, no `window`)

## Defining consent categories

Categories are groups. Items are fine-grained entries inside a category, e.g. "Meta Pixel" inside Marketing. Each item is accepted **independently** — a script gated on an item loads as soon as that item is on, even if the category's master switch is off. The category switch is a convenience that toggles all of its items at once; it is not a hard requirement for the items.

Pass the categories as an object map via the `config` prop:

```tsx
const consentConfig = {
  categories: {
    necessary: { required: true, name: "Necessary" },
    preferences: { name: "Preferences" },
    analytics: { name: "Analytics" },
    marketing: {
      name: "Marketing",
      items: {
        "meta-pixel": {
          name: "Meta Pixel",
          description: "Tracks visits and conversions on Facebook.",
        },
        "google-ads": {
          name: "Google Ads",
          description: "Enables remarketing campaigns.",
        },
      },
    },
  },
};

<CookieBannerConfigurationProvider config={consentConfig}>
  {children}
</CookieBannerConfigurationProvider>
```

Omit `config` entirely and the provider falls back to the built-in `necessary` / `preferences` / `analytics` / `marketing` set.

## Managing third-party scripts

Declare your scripts on the provider as an **object map keyed by script id**. The provider loads each one only when its `category` (a category id, or an item id) is accepted, and unloads it when consent is withdrawn. The key is used as the `<script>` element id and for deduplication.

```tsx
const scripts = {
  "google-analytics": {
    category: "analytics",
    src: "https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX",
  },
  hotjar: {
    category: "analytics",
    src: "https://static.hotjar.com/c_hotjar-next.js",
    async: true,
  },
  "meta-pixel": {
    category: "meta-pixel", // item id — loads when this item is accepted (parent not required)
    src: "https://connect.facebook.net/en_US/fbevents.js",
    cleanup: () => {
      // undo side effects the script caused (window globals, listeners, …)
      delete (window as any).fbq;
    },
  },
};

<CookieBannerConfigurationProvider config={consentConfig} scripts={scripts}>
  {children}
</CookieBannerConfigurationProvider>
```

That's the whole API. No `if (isAllowed("analytics"))` checks, no wrapper components — the provider is the single enforcement point.

### Script options

The script id is the **key** in the `scripts` map (not a field). Each entry accepts:

| Prop | Description |
| --- | --- |
| `category` | Category id or item id that must be accepted. Items are accepted independently of their parent category. |
| `src` | URL of the script. Omit for inline scripts. |
| `children` | Inline script body. |
| `attrs` | Extra attributes, e.g. `{ "data-foo": "bar" }`. |
| `async` | Set `script.async`. **Wins over `defer`** when both are set (setting both is invalid in HTML). |
| `defer` | Set `script.defer`. Ignored when `async` is set. |
| `onLoad` / `onError` | Load callbacks. |
| `cleanup` | Runs when consent is withdrawn and the script is removed. Use it to undo globals, listeners, or other side effects. |

### What happens on withdrawal

When a category (or item) flips from accepted to rejected, the provider:

1. Removes the `<script>` element from the DOM.
2. Runs the script's `cleanup` function (if provided), swallowing any error.

`cleanup` only runs for a script that was actually loaded — a script that was never accepted is left alone when other preferences change.

**Caveat:** none of this undoes cookies the script already set or network requests it already fired. For real teardown (e.g. calling `fbq('shutdown')`), use the `cleanup` hook.

### Composing scripts from several modules

The `scripts` prop is the **only** place scripts are declared — there is no side channel to register one from elsewhere. If an integration lives in its own module, export its part of the map and spread it in:

```tsx
// integrations/hotjar.ts
import type { ConsentScripts } from "non-spooky-react-cookie";

export const hotjarScripts: ConsentScripts = {
  hotjar: { category: "analytics", src: "https://static.hotjar.com/c/hotjar-XXXX.js" },
};

// app root
<CookieBannerConfigurationProvider scripts={{ ...hotjarScripts, ...metaScripts }} />
```

Keep the object reference stable (module-level constant or `useMemo`); a new `scripts` object on every render unloads and reloads the scripts.

## useConsentScript (reactive load status)

The real value of the library: a reactive 4-state load status for any script. The banner is just the UI — the app owns the actual integration (e.g. a `GoogleMap` component with custom pins), and `useConsentScript` tells it when it's safe to use the loaded global.

```tsx
import { useConsentScript, usePreferences } from "non-spooky-react-cookie";

function GoogleMap({ locations }: { locations: Location[] }) {
  const { status, error } = useConsentScript("google-maps");
  const { openSettings } = usePreferences();

  if (status === "blocked") {
    return (
      <div>
        Google Maps requires functional cookies.
        <button onClick={openSettings}>Manage consent</button>
      </div>
    );
  }
  if (status === "loading") return <MapSkeleton />;
  if (status === "error") return <MapError error={error} />;

  // `google.maps` is guaranteed to be available here.
  return <ActualGoogleMap locations={locations} />;
}
```

`status` is one of:

| Status | Meaning |
| --- | --- |
| `blocked` | Consent for the script's category is not granted. |
| `loading` | Consent granted, the script is being fetched. |
| `loaded` | The `<script>` is in the DOM and finished loading. |
| `error` | The script failed to load, the id is not in the provider's `scripts` map, or the hook is rendered outside a provider. |

The status is gated on the script's `category`; the hook itself never loads anything — the provider does, so it must be rendered inside a `CookieBannerConfigurationProvider`. The `<script>` element is created exactly once (deduped by id), so many components can call this for the same id safely.

## Your own texts (fully typed)

`language` picks the built-in texts (`en` default, `de`, `pl`). `texts` lets you override or extend any string — every field is typed, so you get full autocomplete.

```tsx
<CookieBannerConfigurationProvider
  language="de"
  texts={{
    banner: {
      title: "Unsere Datenschutzeinstellungen",
    },
    categories: {
      marketing: {
        items: {
          "meta-pixel": {
            title: "Meta Pixel (Facebook)",
          },
        },
      },
    },
  }}
>
  {children}
</CookieBannerConfigurationProvider>
```

Category and item names passed through `config` win over `texts`.

## Styling

The package ships one small stylesheet and no framework dependency. Three layers, from simplest to most control:

### 1. The `theme` prop

Provide any subset of colors; everything else keeps the built-in look. Every color is a `--nsr-*` CSS custom property written inline on the banner and dialog roots, so a value you pass wins in both light and dark mode.

```tsx
<CookieBannerConfigurationProvider
  theme={{
    primaryColor: "#0ea5e9",
    primaryTextColor: "#ffffff",
    accentColor: "#0284c7",
    surfaceColor: "#ffffff",
  }}
>
  {children}
</CookieBannerConfigurationProvider>
```

### 2. CSS custom properties

Override the variables globally or per theme. The built-in dark palette applies under a `.dark` **or** `[data-theme="dark"]` ancestor (Tailwind's class strategy and `next-themes` both work out of the box).

```css
:root {
  --nsr-primary: #0ea5e9;
  --nsr-radius: 0.5rem;        /* corner radius of cards and buttons */
  --nsr-font: "Inter", sans-serif;
  --nsr-z-banner: 90;
  --nsr-z-dialog: 100;
}
.dark {
  --nsr-surface: #0b1120;
}
```

All variables: `--nsr-primary`, `--nsr-primary-text`, `--nsr-secondary`, `--nsr-secondary-text`, `--nsr-accent`, `--nsr-surface`, `--nsr-surface-muted`, `--nsr-text`, `--nsr-muted`, `--nsr-border`, `--nsr-ring`, `--nsr-switch-off`, `--nsr-backdrop`, `--nsr-radius`, `--nsr-font`, `--nsr-z-banner`, `--nsr-z-dialog`.

### 3. Classes and your own components

Every part carries a stable `nsr-*` class (`nsr-banner`, `nsr-banner__card`, `nsr-button--primary`, `nsr-switch`, `nsr-dialog__panel`, `nsr-category`, `nsr-item`, …), and every component accepts `className` plus per-part class props. Your classes are appended, so Tailwind utilities work fine. You can also swap the default `Button` / `Switch` for your own components via `components` (on the provider for everywhere, or on `CookieBanner` for the banner only).

```tsx
<CookieBanner
  contentClassName="rounded-none border-dashed"
  buttonClassName="w-full"
  components={{ Button: MyButton }}
  dialogProps={{ contentClassName: "max-w-3xl", buttonClassName: "rounded-full" }}
/>
```

`CookieBanner` renders the settings dialog for you; style it through `dialogProps` rather than rendering a second `CookieSettingsDialog`. The dialog is a native `<dialog>` (top layer, focus trap, Escape-to-close built in); its dim/blur backdrop is `--nsr-backdrop`, and `overlayClassName` is applied to the click-to-close layer behind the panel. `CookieBanner` renders the privacy-policy link only when you pass `policyUrl`.

## usePreferences

```tsx
import { usePreferences } from "non-spooky-react-cookie";

function MyComponent() {
  const {
    loaded,
    hasDecision,
    preferences,
    acceptAll,
    rejectAll,
    savePreferences,
    resetPreferences,
    openSettings,
    closeSettings,
    isAllowed,
  } = usePreferences();

  if (!isAllowed("analytics")) return null;
  return <ChartWidget />;
}
```

## window.justDont()

As soon as the provider mounts, a single global function is available from the DevTools console — no extra prop, no script tag, no page reload:

```js
window.justDont(); // rejects every optional category
```

It does exactly what the "Reject all" button does: required categories stay on, optional ones (and their items) are turned off, the banner closes, consent-gated scripts are unloaded (with their `cleanup`), the decision is persisted, and `onDecision` / Google consent mode react. So an "I don't care about cookies"-style browser extension needs only:

```js
// content script, run in the page context
() => window.justDont?.()
```

The provider registers the function on mount and removes it on unmount. If `window.justDont` already exists (another banner, your own code) the provider logs a warning and takes over the slot. Opt out with `windowJustDont={false}` on the provider.

## Provider options

```tsx
<CookieBannerConfigurationProvider
  language="de"
  storageKey="my-site-cookies"
  version="2026-08-21"
  onDecision={(state) => {
    console.log(state.accepted);
  }}
>
  {children}
</CookieBannerConfigurationProvider>
```

- `config` – consent categories (object map, keyed by category id)
- `scripts` – third-party scripts to manage (object map, keyed by script id — see "Managing third-party scripts")
- `language` – `"en"` (default), `"de"` or `"pl"`
- `texts` – typed overrides of any built-in string
- `theme` – color palette (see "Styling")
- `components` – swap the default `Button` / `Switch`
- `storageKey` – localStorage key and/or cookie name (default `"non-spooky-react-cookie"`)
- `storage` – where the decision is persisted: `"localStorage"` (default), `"cookie"`, `"both"`, or a custom adapter (see "Storage")
- `cookieOptions` – cookie attributes for `"cookie"` / `"both"` (see "Storage")
- `initialPreferences` – decision read on the server, so the first render already matches (see "Storage")
- `version` – bump this to ask visitors again (old stored state is ignored)
- `googleConsentMode` – opt in to Google consent mode sync (see "Google consent mode")
- `windowJustDont` – register the `window.justDont()` global (default `true`; set `false` to opt out — see "window.justDont()")
- `onDecision` – called whenever the visitor makes or changes their choice

## Storage

The decision (`PreferencesState`: `version`, `updatedAt`, `accepted`) is stored as JSON under `storageKey`. Pick where with the `storage` prop:

| `storage`          | Where                              | Server can read it | Notes |
| ------------------ | ---------------------------------- | ------------------ | ----- |
| `"localStorage"`   | `window.localStorage` (default)    | no                 | per origin |
| `"cookie"`         | a cookie named `storageKey`        | yes                | can span subdomains via `cookieOptions.domain` |
| `"both"`           | cookie **and** localStorage        | yes                | reads the cookie first, then localStorage |

`"both"` is the safe choice when a site moves from localStorage to cookies: visitors who already decided keep their choice (read from localStorage), and the next decision is written to both. The cookie wins on read because it is the copy a server can see.

```tsx
<CookieBannerConfigurationProvider
  storage="cookie"
  cookieOptions={{ domain: ".example.com", maxAge: 60 * 60 * 24 * 180 }}
>
```

Cookie defaults: `Path=/`, `Max-Age=31536000` (365 days), `SameSite=Lax`, `Secure` on https. `sameSite: "none"` always sets `Secure`. The payload is the url-encoded JSON state, a few hundred bytes for typical configs.

### Custom adapter

`storage` also accepts any object with `get`, `set` and `remove` working on strings. The library does the JSON parsing and validation, so the adapter never sees the state shape. Keep the adapter reference stable (module-level constant or `useMemo`).

```tsx
const memoryStorage: PreferencesStorage = {
  get: (key) => store.get(key) ?? null,
  set: (key, value) => void store.set(key, value),
  remove: (key) => void store.delete(key),
};

<CookieBannerConfigurationProvider storage={memoryStorage}>
```

The built-in adapters are exported too: `localStorageAdapter`, `createCookieStorage(options)`, `createBothStorage(options)`.

### Reading the decision on the server

With `"cookie"` or `"both"`, a server can read the decision before rendering. `readPreferencesFromCookies` lives in the **server entry** `non-spooky-react-cookie/server`, which has no React and no `window`, so it is safe in server components, route handlers, and middleware. Pass it the raw `Cookie` header or a cookie store with `get(name)` such as the one from Next.js `cookies()`. Hand the result to `initialPreferences` so the first render already knows the decision — no banner flash, and `usePreferences().loaded` is `true` from the start.

```tsx
// app/layout.tsx (server component)
import { cookies } from "next/headers";
import { readPreferencesFromCookies } from "non-spooky-react-cookie/server";
import { ConsentProvider } from "./consent-provider"; // your "use client" wrapper

export default async function RootLayout({ children }) {
  const initial = readPreferencesFromCookies(await cookies(), "my-site-cookies");
  return <ConsentProvider initialPreferences={initial}>{children}</ConsentProvider>;
}
```

Reading `cookies()` makes the route dynamic, so this needs a Node or edge runtime — it does not work with `output: "export"`. After mount the provider re-reads the client storage, which stays the source of truth.

## Google consent mode

If you use Google tags, set `googleConsentMode` on the provider. It then initializes consent mode with everything denied and updates it on every decision, based on the `analytics` and `marketing` categories. Without the prop the provider never touches `window.gtag` / `window.dataLayer`.

```tsx
<CookieBannerConfigurationProvider googleConsentMode scripts={scripts}>
  {children}
</CookieBannerConfigurationProvider>
```

Because consent can be fine-grained, a category grants its signals when the category itself **or any of its items** is accepted — so accepting only "Google Ads" (Marketing master off) still grants `ad_storage`, matching the scripts that actually load.

`updateGoogleTracker(state, categories?)` accepts the category list as an optional second argument for that item-level behavior; without it, it falls back to the plain `analytics` / `marketing` category ids.

## Examples

The [`examples/vite-playground`](./examples/README.md) app has one page per feature: basic banner, fine-grained items, consent-gated scripts, loading a library only after consent, every storage strategy, a custom adapter, SSR initial preferences, languages, theming and dark mode, custom components, Google consent mode, version bumps, and programmatic control.

```bash
git clone https://github.com/KamilAdamski/non-spooky-react-cookie
cd non-spooky-react-cookie
pnpm install
pnpm example
```

## Migrating from the private 0.x package

- Package name: `@local/non-spooky-react-cookie` → `non-spooky-react-cookie`.
- **Import the stylesheet** once: `import "non-spooky-react-cookie/styles.css"`. The provider no longer imports CSS itself, and Tailwind is no longer needed to render the components.
- `readPreferencesFromCookies` and `CookieSource` moved to `non-spooky-react-cookie/server`.
- Class names on the rendered elements changed from Tailwind utilities to `nsr-*` classes. Your `className` props still apply; anything that targeted the old utility classes needs updating.
- Style the built-in settings dialog through `CookieBanner`'s new `dialogProps`.
- Earlier 0.x changes still apply: `categories` array → `config` map; `scripts` array → object map keyed by id; `AgreementFirewall` removed in favor of the provider's `scripts` prop; Google consent mode is opt-in via `googleConsentMode`; `policyUrl` has no default.

## Contributing and releasing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the development setup and [MAINTAINING.md](./MAINTAINING.md) for how versions are cut and published.

## License

[MIT](./LICENSE) © Kamil Adamski
