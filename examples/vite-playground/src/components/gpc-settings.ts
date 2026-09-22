import { useSyncExternalStore } from "react";

/**
 * Whether this browser itself sends the Global Privacy Control signal
 * (Brave, Firefox and DuckDuckGo with the setting on). Read once at startup
 * so the in-page "simulate signal" buttons never show or hide the notice.
 */
export const BROWSER_SENDS_GPC =
  typeof navigator !== "undefined" &&
  (navigator as Navigator & { globalPrivacyControl?: unknown }).globalPrivacyControl ===
    true;

// One playground-wide switch for `respectGlobalPrivacyControl`, shared by the
// notice in the app shell and every scenario's provider.
let respectGpc = true;
const listeners = new Set<() => void>();

export function setRespectGpc(value: boolean): void {
  respectGpc = value;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The current value of the playground-wide `respectGlobalPrivacyControl` switch. */
export function useRespectGpc(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => respectGpc,
    () => respectGpc,
  );
}
