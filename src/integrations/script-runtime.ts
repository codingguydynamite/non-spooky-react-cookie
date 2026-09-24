/**
 * The reactive runtime store for per-script load status.
 *
 * This is the single source of truth for the 4-state lifecycle
 * (`blocked | loading | loaded | error`) of every managed script.
 * The provider drives this store (consent-gated) and `useConsentScript`
 * subscribes to it via `useSyncExternalStore`.
 *
 * The store is module-level (one per browser tab), keyed by script id.
 * It is intentionally framework-agnostic: no React imports here.
 */

export type ScriptStatus = "blocked" | "loading" | "loaded" | "error";

type RuntimeEntry = {
  status: ScriptStatus;
  error?: unknown;
  listeners: Set<() => void>;
};

const runtimes = new Map<string, RuntimeEntry>();

function getEntry(id: string): RuntimeEntry {
  let entry = runtimes.get(id);
  if (!entry) {
    entry = { status: "blocked", listeners: new Set() };
    runtimes.set(id, entry);
  }
  return entry;
}

/**
 * Subscribe a listener to status changes for `id`.
 * Returns an unsubscribe function. Safe to call on the server
 * (returns a no-op) so `useSyncExternalStore` never crashes during SSR.
 */
export function subscribeScript(id: string, notify: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  getEntry(id).listeners.add(notify);
  return () => {
    getEntry(id).listeners.delete(notify);
  };
}

/** Primitive snapshot for `useSyncExternalStore` (must be stable). */
export function getScriptStatus(id: string): ScriptStatus {
  return getEntry(id).status;
}

/** The last error for `id`, if any. */
export function getScriptError(id: string): unknown {
  return getEntry(id).error;
}

/**
 * Sets the status (and error, if any) for `id` and notifies subscribers.
 * The error is always replaced, so a later `loaded` clears an old failure.
 */
export function setScriptStatus(id: string, status: ScriptStatus, error?: unknown): void {
  const entry = getEntry(id);
  entry.status = status;
  entry.error = error;
  entry.listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // A broken subscriber must never break consent enforcement.
    }
  });
}
