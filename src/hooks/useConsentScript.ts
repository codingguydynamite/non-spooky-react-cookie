"use client";

import { useCallback, useContext, useSyncExternalStore } from "react";
import { CookieBannerContext } from "../CookieBannerConfigurationProvider";
import type { ScriptStatus } from "../integrations/script-runtime";
import {
  getScriptError,
  getScriptStatus,
  subscribeScript,
} from "../integrations/script-runtime";

export type UseConsentScriptResult = {
  /**
   * - `blocked` — consent for the script's category is not granted.
   * - `loading` — consent granted, script is being fetched.
   * - `loaded` — the `<script>` is in the DOM and finished loading.
   * - `error` — the script failed to load, is not declared in the provider's
   *   `scripts` map, or the hook is rendered outside a provider.
   */
  status: ScriptStatus;
  /** Present when `status === "error"`. */
  error?: unknown;
};

/**
 * Reactive, consent-gated load status for a script declared in the
 * provider's `scripts` map.
 *
 * The status is gated on the script's `category`: denied → `blocked`;
 * granted → the provider drives `loading` → `loaded`/`error`. The hook never
 * loads anything itself — the provider is the single enforcement point.
 *
 * Must be rendered inside a `CookieBannerConfigurationProvider`.
 */
export function useConsentScript(id: string): UseConsentScriptResult {
  const context = useContext(CookieBannerContext);
  const def = context?.scripts[id];

  // Two subscriptions on purpose: the store mutates entries in place, so a
  // single object snapshot would never look "changed" to React.
  const subscribe = useCallback(
    (notify: () => void) => subscribeScript(id, notify),
    [id],
  );
  const runtimeStatus = useSyncExternalStore<ScriptStatus>(
    subscribe,
    () => getScriptStatus(id),
    () => "blocked",
  );
  const runtimeError = useSyncExternalStore(
    subscribe,
    () => getScriptError(id),
    () => undefined,
  );

  if (!context) {
    return {
      status: "error",
      error: new Error(
        `useConsentScript("${id}") must be used within a CookieBannerConfigurationProvider.`,
      ),
    };
  }

  if (!def) {
    return {
      status: "error",
      error: new Error(
        `useConsentScript("${id}"): script is not declared in the provider's \`scripts\` map.`,
      ),
    };
  }

  if (!context.isAllowed(def.category)) {
    return { status: "blocked" };
  }

  // Consent granted. A not-yet-started script is presented as `loading` to
  // avoid a `blocked` flash before the provider's load effect runs.
  const status = runtimeStatus === "blocked" ? "loading" : runtimeStatus;
  return { status, error: status === "error" ? runtimeError : undefined };
}
