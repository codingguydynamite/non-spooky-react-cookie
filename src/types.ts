import type * as React from "react";

/**
 * Makes every property of an object (and nested objects) optional.
 * Used so users can override only the texts they care about.
 */
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

/**
 * `DeepPartial` that also accepts `null` at every level. A CMS usually returns
 * an empty field as `null` (Payload's generated types say `string | null`), and
 * the merge treats `null` exactly like a missing key: the built-in text stays.
 */
export type DeepPartialNullable<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartialNullable<T[K]> | null : T[K] | null;
};

/** A single fine-grained entry inside a category, e.g. "Meta Pixel" inside Marketing. */
export type PreferenceItem = {
  /** Must be unique across all categories and items of the app. */
  id: string;
  /** Shown in the settings dialog. Can also come from `texts.categories[<categoryId>].items[<id>].title`. */
  title?: string;
  /** Shown under the item title. Can also come from `texts`. */
  description?: string;
};

/** A group of optional technologies. May contain fine-grained `items`. */
export type PreferenceCategory = {
  /** Unique id, e.g. "necessary", "analytics", "marketing". */
  id: string;
  title?: string;
  description?: string;
  /** Always accepted and cannot be switched off (e.g. "necessary"). */
  required?: boolean;
  /** Optional fine-grained entries inside this category. */
  items?: PreferenceItem[];
};

/**
 * A single category inside `ConsentConfig.categories`.
 * The key of the map is the category id (e.g. "analytics").
 */
export type ConsentCategoryConfig = {
  /** Always accepted and cannot be switched off (e.g. "necessary"). */
  required?: boolean;
  /** Display name, e.g. "Analytics". */
  name?: string;
  description?: string;
  /** Optional fine-grained entries, keyed by item id. */
  items?: Record<string, ConsentItemConfig>;
};

export type ConsentItemConfig = {
  name?: string;
  description?: string;
};

/**
 * Declares the consent categories your site uses.
 * Example:
 * ```ts
 * const consentConfig: ConsentConfig = {
 *   categories: {
 *     necessary: { required: true },
 *     analytics: { name: "Analytics" },
 *     marketing: { name: "Marketing" },
 *   },
 * };
 * ```
 */
export type ConsentConfig = {
  categories: Record<string, ConsentCategoryConfig>;
};

/**
 * A third-party script managed by the provider.
 * The script is loaded only when `category` (a category id or an item id)
 * is accepted, and unloaded when consent is withdrawn.
 *
 * The script id is the key in the `scripts` map (not a field here) — it is
 * used as the `<script>` element id and for deduplication.
 */
export type ConsentScript = {
  /** Category id (or item id) that must be accepted before the script loads. */
  category: string;
  /** URL of the script. Omit for inline scripts (`children`). */
  src?: string;
  /** Inline script body. */
  children?: string;
  /** Extra attributes, e.g. `{ "data-foo": "bar" }`. */
  attrs?: Record<string, string>;
  /** Set `script.async`. Wins over `defer` when both are set. */
  async?: boolean;
  /** Set `script.defer`. Ignored when `async` is set. */
  defer?: boolean;
  /** Called after the script finished loading. */
  onLoad?: () => void;
  /** Called when the script failed to load. */
  onError?: () => void;
  /**
   * Runs when consent is withdrawn and the script is removed.
   * Use it to undo side effects (e.g. `delete window.fbq`).
   */
  cleanup?: () => void;
};

/**
 * The provider's `scripts` map: third-party scripts keyed by script id.
 * Use this ready-made type instead of spelling out `Record<string, ConsentScript>`.
 */
export type ConsentScripts = Record<string, ConsentScript>;

export type ItemTexts = {
  title?: string;
  description?: string;
};

export type CategoryTexts = {
  title?: string;
  description?: string;
  items?: Record<string, ItemTexts>;
};

/**
 * All UI strings of the library. Every field is typed, so when you
 * extend or override texts you get full autocomplete and type safety.
 */
export type Texts = {
  banner: {
    title: string;
    description: string;
    acceptAll: string;
    rejectAll: string;
    settings: string;
    policyLink: string;
  };
  dialog: {
    title: string;
    description: string;
    save: string;
    close: string;
    /**
     * Label of the collapsible trigger that reveals a category's items, e.g.
     * "Show services". The item count follows in parentheses: "Show services (2)".
     */
    itemsLabel: string;
  };
  footerLink: string;
  /** Per-category and per-item texts, keyed by their ids. */
  categories: Record<string, CategoryTexts>;
};

/**
 * The provider's `texts` prop: override any built-in string. Every field is
 * optional, so you list only what you want to change, and `null` counts as
 * not set. Every value is plain JSON, so it can come from a CMS or be passed
 * from a React Server Component.
 */
export type TextOverrides = DeepPartialNullable<Texts>;

/**
 * Color palette. Provide any subset; everything else keeps the built-in look.
 *
 * Only five colors are true inputs: `primaryColor`, `primaryTextColor`,
 * `accentColor`, `surfaceColor` and `textColor`. Every other color is derived
 * from those with `color-mix()` unless you set it, so a dark surface with light
 * text automatically gets matching muted text, borders, secondary buttons,
 * hover states and switch tracks.
 */
export type ThemePalette = {
  /** Main action color (primary buttons, active switches). */
  primaryColor?: string;
  /** Text color on primary buttons. Also the switch thumb color when on. */
  primaryTextColor?: string;
  /** Primary button hover background. Derived from primary + primary text. */
  primaryHoverColor?: string;
  /** Secondary button background. Derived: same as `surfaceColor`. */
  secondaryColor?: string;
  /** Text color on secondary buttons. Derived: same as `textColor`. */
  secondaryTextColor?: string;
  /** Accent color (links, disclosure triggers). */
  accentColor?: string;
  /** Background of the banner and dialog. */
  surfaceColor?: string;
  /** Background of the required-category card and button hover states. Derived from surface + text. */
  surfaceMutedColor?: string;
  /** Main text color. */
  textColor?: string;
  /** Muted/secondary text color. Derived from text + surface. */
  mutedTextColor?: string;
  /** Border color. Derived from text + surface. */
  borderColor?: string;
  /** Focus ring color. Derived: same as `primaryColor`. */
  ringColor?: string;
  /** Switch track color when off. Derived from text + surface. */
  switchOffColor?: string;
  /** Switch thumb color for both states. Derived: `surfaceColor` when off, `primaryTextColor` when on. */
  switchThumbColor?: string;
  /** Dialog backdrop (dim layer behind the settings dialog). */
  backdropColor?: string;
};

/** What is persisted (localStorage and/or cookie) and shared with `onDecision`. */
export type PreferencesState = {
  version: string;
  updatedAt: string;
  /** Flat map of accepted ids: categories and items. */
  accepted: Record<string, boolean>;
};

/** Partial update of the accepted map. */
export type PreferencesUpdate = {
  accepted: Record<string, boolean>;
};

/**
 * Built-in storage strategies:
 * - `"localStorage"` (default) – per-origin, invisible to the server.
 * - `"cookie"` – readable by the server (see `readPreferencesFromCookies`),
 *   can span subdomains via `cookieOptions.domain`.
 * - `"both"` – writes to both; reads the cookie first, then localStorage.
 */
export type StorageKind = "localStorage" | "cookie" | "both";

/**
 * Storage strategy: a plain string store keyed by `storageKey`. The library
 * handles JSON serialization and validation, so an adapter never sees the
 * state shape. Pass your own to persist anywhere (sessionStorage, IndexedDB
 * wrapper, in-memory for tests, ...).
 */
export type PreferencesStorage = {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
};

/** Cookie attributes used by the `"cookie"` and `"both"` strategies. */
export type CookieStorageOptions = {
  /** Lifetime in seconds. Default: 31536000 (365 days). */
  maxAge?: number;
  /** e.g. `".example.com"` to share the decision across subdomains. Default: current host. */
  domain?: string;
  /** Default: `"/"`. */
  path?: string;
  /** Default: `"lax"`. `"none"` forces `secure`. */
  sameSite?: "lax" | "strict" | "none";
  /** Default: `true` on https, `false` otherwise. */
  secure?: boolean;
};

/** Button-like props shared by the default and custom Button components. */
export type ButtonLikeProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

/** Switch-like props shared by the default and custom Switch components. */
export type SwitchLikeProps = {
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
  "aria-label": string;
};

/** Props of the default Collapsible (a controlled or self-managed disclosure). */
export type CollapsibleProps = {
  children: React.ReactNode;
  /** Number of entries inside, shown after the label, e.g. "(2)". */
  count: number;
  /** Localized trigger label, e.g. "Show services" / "Dienste anzeigen". */
  label: string;
  /** Controlled open state. Omit to let the component manage its own state. */
  open?: boolean;
  /** Fired when the disclosure is toggled (controlled mode). */
  onOpenChange?: (open: boolean) => void;
  /** Initial open state when uncontrolled. Default: `false`. */
  defaultOpen?: boolean;
  /** Extra classes for the trigger button. */
  className?: string;
  /** Extra classes for the revealed content region. */
  contentClassName?: string;
};

/** Escape hatch: swap the default Button/Switch/Collapsible for your own components. */
export type PreferenceComponents = {
  Button?: React.ComponentType<ButtonLikeProps>;
  Switch?: React.ComponentType<SwitchLikeProps>;
  Collapsible?: React.ComponentType<CollapsibleProps>;
};

export type CookieBannerConfigurationProviderProps = {
  children: React.ReactNode;
  /**
   * Consent category configuration (object map, keyed by category id).
   * Defaults to necessary/preferences/analytics/marketing.
   */
  config?: ConsentConfig;
  /**
   * Third-party scripts managed by the provider, keyed by script id.
   * Each loads only when its `category` is accepted and is removed (with
   * `cleanup`) when consent is withdrawn.
   */
  scripts?: ConsentScripts;
  /**
   * Language of the built-in texts: "en" (default), "de", or "pl". Region
   * codes resolve to their base language ("pl-PL" -> "pl"); anything else
   * falls back to English.
   */
  language?: string;
  /** Override or extend any built-in text. Fully typed. */
  texts?: TextOverrides;
  /**
   * Color palette override. Applied to the banner, the dialog and the
   * settings link in both light and dark mode (unless `darkTheme` overrides
   * a color for dark mode).
   */
  theme?: ThemePalette;
  /**
   * Colors that apply only under a `.dark` or `[data-theme="dark"]`
   * ancestor. Any color not set here falls back to `theme`, then to the
   * built-in dark palette.
   */
  darkTheme?: ThemePalette;
  /** Swap the default Button/Switch/Collapsible for your own components. */
  components?: PreferenceComponents;
  /** Storage key: the localStorage key and/or cookie name. Default: "non-spooky-react-cookie". */
  storageKey?: string;
  /**
   * Where the decision is persisted: `"localStorage"` (default), `"cookie"`,
   * `"both"`, or a custom `PreferencesStorage` adapter. A custom adapter must
   * be a stable reference (module-level const or `useMemo`), not an inline
   * object literal.
   */
  storage?: StorageKind | PreferencesStorage;
  /** Cookie attributes, used when `storage` is `"cookie"` or `"both"`. */
  cookieOptions?: CookieStorageOptions;
  /**
   * Decision read on the server (see `readPreferencesFromCookies`). When
   * given — even as `null` — the first render is already `loaded`, so server
   * and client markup match and the banner does not flash. After mount the
   * client storage is re-read and wins.
   */
  initialPreferences?: PreferencesState | null;
  /** Bump this to ask visitors again. Default: "1". */
  version?: string;
  /**
   * Keep Google consent mode (`gtag("consent", ...)`) in sync with the
   * `analytics` / `marketing` categories. Creates the `window.gtag` stub,
   * so enable it only when you load Google tags. Default: `false`.
   */
  googleConsentMode?: boolean;
  /**
   * Register `window.justDont()`: a global that rejects all optional
   * categories (required ones stay on, the banner closes, managed scripts
   * unload) — handy for console snippets and "I don't care about cookies"-
   * style browser extensions. Client-only. Enabled by default; pass
   * `false` to opt out. The last mounted provider owns the global.
   */
  windowJustDont?: boolean;
  /**
   * Honor the browser's Global Privacy Control signal
   * (`navigator.globalPrivacyControl === true`, sent as `Sec-GPC: 1`). When
   * a visitor with the signal on has no stored decision for the current
   * `version`, the provider behaves as if they clicked "Reject all": required
   * categories stay on, optional ones stay off, the banner never shows and
   * `onDecision` fires. The decision is not persisted, because the signal is
   * live: turning it off brings the banner back. A decision the visitor
   * already made on this site always wins over the signal, and they can
   * still opt in through the settings dialog. Enabled by default; pass
   * `false` to opt out.
   */
  respectGlobalPrivacyControl?: boolean;
  /** Called whenever the visitor makes or changes their choice. */
  onDecision?: (state: PreferencesState) => void;
};

export type CookieBannerContextValue = {
  loaded: boolean;
  hasDecision: boolean;
  showBanner: boolean;
  /**
   * `true` when `respectGlobalPrivacyControl` is on and the browser sent an
   * active Global Privacy Control signal for this page load. Use it to tell
   * the visitor their browser setting was honored.
   */
  globalPrivacyControl: boolean;
  settingsOpen: boolean;
  preferences: PreferencesState;
  texts: Texts;
  categories: PreferenceCategory[];
  /** The `scripts` map the provider was given, keyed by script id. */
  scripts: ConsentScripts;
  theme: ThemePalette;
  darkTheme: ThemePalette;
  components: PreferenceComponents;
  /**
   * `theme` as inline CSS custom properties. Kept for custom elements that
   * only need the light palette; prefer spreading `themeAttributes` so the
   * element also picks up `darkTheme`.
   */
  themeStyle: React.CSSProperties;
  /**
   * Marker attribute that scopes the provider's theme rules to an element.
   * Spread it onto any element of your own that uses `--nsr-*` variables.
   */
  themeAttributes: Record<`data-${string}`, string>;
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (partial: PreferencesUpdate) => void;
  resetPreferences: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  /** True when the category or item id is accepted. Items are independent of their parent category. */
  isAllowed: (id: string) => boolean;
  /** Resolves the display title/description for a category or item id. */
  resolveLabel: (
    id: string,
    config?: { title?: string; description?: string },
  ) => { title: string; description: string };
};

export type CookieBannerProps = {
  /** URL of your privacy policy page. */
  policyUrl?: string;
  /** Root element classes. */
  className?: string;
  /** Inner card classes. */
  contentClassName?: string;
  /** Title classes. */
  titleClassName?: string;
  /** Description classes. */
  descriptionClassName?: string;
  /** Button group classes. */
  actionsClassName?: string;
  /** Extra classes applied to every button. */
  buttonClassName?: string;
  /**
   * Swap the default components for the banner and the dialog it renders.
   * Wins over the provider's `components`; `dialogProps.components` wins
   * over this for the dialog only.
   */
  components?: PreferenceComponents;
  /**
   * Props forwarded to the settings dialog that `CookieBanner` renders for
   * you (class names for its parts). Use this instead of rendering a second
   * `CookieSettingsDialog`.
   */
  dialogProps?: CookieSettingsDialogProps;
};

export type CookieSettingsDialogProps = {
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  categoryCardClassName?: string;
  itemClassName?: string;
  buttonClassName?: string;
  /** Swap the default components for this dialog. Wins over the provider's `components`. */
  components?: PreferenceComponents;
};

export type CookieSettingsLinkProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
