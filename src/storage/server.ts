import type { PreferencesState } from "../types";
import { findCookie } from "./adapters";
import { DEFAULT_STORAGE_KEY, parsePreferences } from "./index";

/**
 * Where to read the consent cookie from on the server: the raw `Cookie`
 * request header, or a cookie store with `get(name)` such as the one returned
 * by Next.js `await cookies()`.
 */
export type CookieSource =
  | string
  | null
  | undefined
  | { get(name: string): { value: string } | undefined };

/**
 * Reads the visitor's decision on the server. Works only when the provider
 * persists to a cookie (`storage="cookie"` or `"both"`). Pass the result to
 * the provider's `initialPreferences` so the first render already matches.
 *
 * Pure: no `window`, no React — safe in server components, route handlers,
 * and middleware.
 *
 * ```tsx
 * const initial = readPreferencesFromCookies(await cookies(), "my-site-cookies");
 * ```
 */
export function readPreferencesFromCookies(
  source: CookieSource,
  storageKey: string = DEFAULT_STORAGE_KEY,
): PreferencesState | null {
  if (source == null) return null;

  const raw =
    typeof source === "string"
      ? findCookie(source, storageKey)
      : source.get(storageKey)?.value;

  return parsePreferences(raw);
}
