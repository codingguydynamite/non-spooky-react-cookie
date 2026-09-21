import type { ConsentScript } from "../types";

/**
 * The definition store: a module-level map of all scripts the app has
 * declared, keyed by script id. The provider registers every script from
 * its `scripts` prop here; the standalone loader (`ensureScript`,
 * `useConsentScript` outside a provider) reads definitions back out.
 *
 * The id is the map key — `ConsentScript` no longer carries its own `id`.
 */
const registry = new Map<string, ConsentScript>();

/** Registers a script definition under `id`. Re-registering replaces it. */
export function registerScript(id: string, script: ConsentScript): void {
  registry.set(id, script);
}

/** Returns all registered scripts, keyed by id. */
export function getRegisteredScripts(): Record<string, ConsentScript> {
  return Object.fromEntries(registry);
}

/** Returns the script registered under `id`, if any. */
export function getRegisteredScript(id: string): ConsentScript | undefined {
  return registry.get(id);
}

/** Removes a single script definition from the registry. */
export function unregisterScript(id: string): void {
  registry.delete(id);
}

/** Removes all registered scripts (e.g. on provider unmount / HMR). */
export function clearRegistry(): void {
  registry.clear();
}
