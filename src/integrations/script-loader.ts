/**
 * Internal DOM + status primitives used by the provider to load and remove
 * consent-gated scripts. Not exported — the provider is the single place
 * that ever inserts a `<script>` element.
 */
import type { ConsentScript } from "../types";
import { getScriptStatus, setScriptStatus } from "./script-runtime";

/** Runs a consumer callback; its errors must never break consent enforcement. */
function safeCall(fn?: () => void): void {
  try {
    fn?.();
  } catch {
    // swallowed on purpose
  }
}

function findScriptElement(id: string): HTMLScriptElement | null {
  const element = document.getElementById(id);
  return element instanceof HTMLScriptElement ? element : null;
}

export type LoadScriptOptions = {
  id: string;
  src?: string;
  attrs?: Record<string, string>;
  children?: string;
  /** Set `script.async`. Wins over `defer` when both are set. */
  async?: boolean;
  /** Set `script.defer`. Ignored when `async` is set. */
  defer?: boolean;
  onLoad?: () => void;
  onError?: () => void;
};

export function loadScript({
  id,
  src,
  attrs,
  children,
  async: asyncFlag,
  defer,
  onLoad,
  onError,
}: LoadScriptOptions): HTMLScriptElement | null {
  if (typeof document === "undefined") return null;

  const existing = findScriptElement(id);
  if (existing) return existing;

  const script = document.createElement("script");
  script.id = id;

  // Setting both is invalid HTML, so async wins; the default is async.
  if (defer && !asyncFlag) {
    script.defer = true;
  } else {
    script.async = true;
  }

  if (src) script.src = src;
  if (children) script.text = children;
  if (onLoad) script.addEventListener("load", onLoad);
  if (onError) script.addEventListener("error", onError);

  Object.entries(attrs ?? {}).forEach(([key, value]) => {
    script.setAttribute(key, value);
  });

  document.head.appendChild(script);
  return script;
}

/**
 * Removes the script element with `id` and runs the optional
 * `cleanup` function.
 *
 * Caveat: this does NOT undo cookies or network requests the script
 * already made — use `cleanup` for integration-specific teardown.
 */
export function unloadScript(id: string, cleanup?: () => void): void {
  if (typeof document === "undefined") return;

  findScriptElement(id)?.remove();
  safeCall(cleanup);
}

/**
 * Ensures the script under `id` is loaded, driving the runtime store.
 *
 * - Already in the DOM → status `loaded` (dedup, `onLoad` not re-fired).
 * - Not in the DOM → status `loading`, then `loaded`/`error` when the
 *   element settles. `def.onLoad` / `def.onError` run (wrapped so a throw
 *   never breaks consent enforcement).
 */
export function ensureScript(id: string, def: ConsentScript): void {
  if (typeof document === "undefined") return;

  if (findScriptElement(id)) {
    setScriptStatus(id, "loaded");
    return;
  }

  const handleLoad = () => {
    setScriptStatus(id, "loaded");
    safeCall(def.onLoad);
  };

  setScriptStatus(id, "loading");

  const element = loadScript({
    id,
    src: def.src,
    attrs: def.attrs,
    children: def.children,
    async: def.async,
    defer: def.defer,
    onLoad: handleLoad,
    onError: () => {
      setScriptStatus(id, "error", new Error(`Script "${id}" failed to load.`));
      safeCall(def.onError);
    },
  });

  // Inline scripts (no `src`) execute synchronously on insertion and do NOT
  // fire the `load` event, so we settle the status immediately.
  if (element && !def.src) handleLoad();
}

/**
 * Removes the script under `id` from the DOM (running `cleanup`) and
 * resets its status back to `blocked`. A script that is already blocked
 * and not in the DOM is left alone, so `cleanup` runs only after a real load.
 */
export function removeScript(id: string, cleanup?: () => void): void {
  if (typeof document === "undefined") return;
  if (getScriptStatus(id) === "blocked" && !findScriptElement(id)) return;

  unloadScript(id, cleanup);
  setScriptStatus(id, "blocked");
}
