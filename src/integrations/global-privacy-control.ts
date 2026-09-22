/**
 * Global Privacy Control (https://w3c.github.io/gpc/) is a browser-level
 * "do not sell or share my data" signal. When the visitor turns it on, the
 * browser sends `Sec-GPC: 1` with every request and exposes
 * `navigator.globalPrivacyControl === true` to scripts; when it is off the
 * header is absent and the property is `false` (or missing entirely in
 * browsers without native support, where extensions may define it).
 *
 * Returns `true` only for an active signal. Safe to call on the server.
 */
export function readGlobalPrivacyControl(): boolean {
  if (typeof navigator === "undefined") return false;

  // Not in TypeScript's DOM lib yet, hence the local widening.
  const nav = navigator as Navigator & { globalPrivacyControl?: unknown };
  return nav.globalPrivacyControl === true;
}
