/**
 * Server-only entry: `non-spooky-react-cookie/server`.
 *
 * Nothing in here touches `window`, `document`, or React (the type imports
 * are erased), so it is safe to import from React Server Components, route
 * handlers, and middleware. The main entry is a `"use client"` module and
 * must not be imported there.
 */

export type { BuiltInLanguage } from "./resolve-texts";
export { BUILT_IN_LANGUAGES, getBuiltInTexts } from "./resolve-texts";
export type { CookieSource } from "./storage/server";
export { readPreferencesFromCookies } from "./storage/server";
export type { TextOverrides, Texts } from "./types";
