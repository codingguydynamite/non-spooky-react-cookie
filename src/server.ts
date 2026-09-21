/**
 * Server-only entry: `non-spooky-react-cookie/server`.
 *
 * Nothing in here touches `window`, `document`, or React, so it is safe to
 * import from React Server Components, route handlers, and middleware. The
 * main entry is a `"use client"` module and must not be imported there.
 */

export type { CookieSource } from "./storage/server";
export { readPreferencesFromCookies } from "./storage/server";
