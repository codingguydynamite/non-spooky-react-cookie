import type { PreferenceCategory, PreferencesState } from "../types";

type ConsentValue = "granted" | "denied";

declare global {
  interface Window {
    dataLayer?: unknown[];
    /**
     * Google tag manager stub. Declared with a permissive signature so
     * consumers can call any standard gtag command (`js`, `config`,
     * `event`, `consent`, …) — the real `gtag.js` replaces this at runtime.
     */
    gtag?: (...args: unknown[]) => void;
  }
}

function ensureGtag(): Window["gtag"] | null {
  if (typeof window === "undefined") return null;

  window.dataLayer = window.dataLayer ?? [];
  window.gtag =
    window.gtag ??
    function gtag() {
      // Google's own snippet pushes the `arguments` object, not an array;
      // gtag.js relies on that exact shape when it replays the queue.
      // biome-ignore lint/complexity/noArguments: required by gtag.js
      window.dataLayer?.push(arguments);
    };

  return window.gtag;
}

/**
 * Initializes Google's consent mode with everything denied.
 * Call this before any Google tag loads.
 */
export function initGoogleTracker(): void {
  const gtag = ensureGtag();
  if (!gtag) return;

  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
  });
}

/**
 * Updates Google's consent mode based on the stored preferences.
 *
 * Without `categories`, the category ids `analytics` / `marketing` in the
 * accepted map drive the signals. With `categories`, a category grants its
 * signals when the category OR any of its fine-grained items is accepted,
 * so item-level consent (e.g. "only Google Ads") is respected.
 */
export function updateGoogleTracker(
  state: PreferencesState,
  categories?: PreferenceCategory[],
): void {
  const gtag = ensureGtag();
  if (!gtag) return;

  const toValue = (id: string): ConsentValue => {
    const category = categories?.find((candidate) => candidate.id === id);
    const allowed =
      Boolean(state.accepted[id]) ||
      Boolean(category?.items?.some((item) => state.accepted[item.id]));
    return allowed ? "granted" : "denied";
  };

  const analytics = toValue("analytics");
  const marketing = toValue("marketing");

  gtag("consent", "update", {
    analytics_storage: analytics,
    ad_storage: marketing,
    ad_user_data: marketing,
    ad_personalization: marketing,
  });
}
