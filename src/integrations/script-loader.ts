import type { ConsentScript } from "../types";
import { getRegisteredScript } from "./script-registry";
import {
  getScriptError,
  getScriptStatus,
  setScriptStatus,
  subscribeScript,
} from "./script-runtime";

/** Normalizes a stored (unknown) error into an `Error` for rejection. */
function toError(value: unknown, fallback: string): Error {
  if (value instanceof Error) return value;
  if (typeof value === "string") return new Error(value);
  return new Error(fallback);
}

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
 * Removes the script element registered under `id` and runs the optional
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

/**
 * Imperative, Promise-based loader for non-hook call sites.
 *
 * - `loaded` → resolves immediately.
 * - `loading` → awaits the in-flight element, then resolves/rejects.
 * - `error` → rejects with the stored error.
 * - `blocked` → starts loading now (no consent gate), then settles.
 * - unregistered id → rejects with a "not registered" error.
 * - SSR → rejects.
 */
export function loadConsentScript(id: string): Promise<void> {
  if (typeof document === "undefined") {
    return Promise.reject(
      new Error(`loadConsentScript("${id}") requires a DOM (client-side).`),
    );
  }

  const def = getRegisteredScript(id);
  if (!def) {
    return Promise.reject(
      new Error(
        `loadConsentScript("${id}"): script is not registered. Declare it in the provider's \`scripts\` map or call registerScript("${id}", {...}) first.`,
      ),
    );
  }

  const failure = () =>
    toError(getScriptError(id), `Script "${id}" failed to load.`);

  if (getScriptStatus(id) === "blocked") ensureScript(id, def);

  // Inline scripts settle synchronously inside `ensureScript`, so the
  // status may already be final here.
  const status = getScriptStatus(id);
  if (status === "loaded") return Promise.resolve();
  if (status === "error") return Promise.reject(failure());

  if (!findScriptElement(id)) {
    return Promise.reject(
      new Error(`loadConsentScript("${id}"): script element not found.`),
    );
  }

  // The element's `load`/`error` events fire asynchronously, so a
  // subscription set up here (synchronously) will always observe the
  // transition to `loaded`/`error`.
  return new Promise<void>((resolve, reject) => {
    const unsubscribe = subscribeScript(id, () => {
      const current = getScriptStatus(id);
      if (current === "loaded") {
        unsubscribe();
        resolve();
      } else if (current === "error") {
        unsubscribe();
        reject(failure());
      }
    });
  });
}
