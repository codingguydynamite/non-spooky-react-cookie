"use client";

import { useCallback, useContext, useEffect, useSyncExternalStore } from "react";
import { CookieBannerContext } from "../CookieBannerConfigurationProvider";
import { ensureScript } from "../integrations/script-loader";
import { getRegisteredScript } from "../integrations/script-registry";
import type { ScriptStatus } from "../integrations/script-runtime";
import {
  getScriptError,
  getScriptStatus,
  subscribeScript,
} from "../integrations/script-runtime";

export type UseConsentScriptResult = {
  /**
   * - `blocked` — consent for the script's category is not granted (provider mode).
   * - `loading` — consent granted, script is being fetched.
   * - `loaded` — the `<script>` is in the DOM and finished loading.
   * - `error` — the script failed to load, or it was never declared/registered.
   */
  status: ScriptStatus;
  /** Present when `status === "error"`. */
  error?: unknown;
};

/**
 * Reactive, consent-aware load status for a registered script.
 *
 * - **Inside a `CookieBannerConfigurationProvider`**: the status is gated on
 *   the script's `category`. Denied → `blocked`; granted → the provider drives
 *   `loading` → `loaded`/`error`.
 * - **Outside a provider** (standalone): no consent gate. The script is loaded
 *   on mount from the definition store. An unregistered id → `error`.
 *
 * The script's `<script>` element is created exactly once (deduped by id),
 * so many components can call this for the same id safely.
 */
export function useConsentScript(id: string): UseConsentScriptResult {
  const context = useContext(CookieBannerContext);
  const def = context ? context.scripts[id] : getRegisteredScript(id);

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

  // Standalone mode only: no consent gate, so load on mount. Provider mode
  // leaves loading to the provider's enforcement effect.
  useEffect(() => {
    if (!context && def) ensureScript(id, def);
  }, [context, def, id]);

  if (!def) {
    const hint = context
      ? "script is not declared in the provider's `scripts` map."
      : `script is not registered. Call registerScript("${id}", {...}) or use a CookieBannerConfigurationProvider.`;
    return {
      status: "error",
      error: new Error(`useConsentScript("${id}"): ${hint}`),
    };
  }

  if (context && !context.isAllowed(def.category)) {
    return { status: "blocked" };
  }

  // Consent granted (or no gate). A not-yet-started script is presented as
  // `loading` to avoid a `blocked` flash before the load effect runs.
  const status = runtimeStatus === "blocked" ? "loading" : runtimeStatus;
  return { status, error: status === "error" ? runtimeError : undefined };
}
