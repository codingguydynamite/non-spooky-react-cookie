import type { PreferencesState, PreferencesStorage } from "../types";

export {
  createBothStorage,
  createCookieStorage,
  findCookie,
  localStorageAdapter,
  resolveStorage,
} from "./adapters";

export const DEFAULT_STORAGE_KEY = "non-spooky-react-cookie";

function isPreferencesState(value: unknown): value is PreferencesState {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.version === "string" &&
    typeof candidate.updatedAt === "string" &&
    typeof candidate.accepted === "object" &&
    candidate.accepted !== null
  );
}

/**
 * Parses a raw stored value into a `PreferencesState`; `null` when missing,
 * unreadable, or malformed. Shared by the client read and the server read.
 */
export function parsePreferences(
  raw: string | null | undefined,
): PreferencesState | null {
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isPreferencesState(parsed)) return null;

    return {
      version: parsed.version,
      updatedAt: parsed.updatedAt,
      accepted: { ...parsed.accepted },
    };
  } catch {
    return null;
  }
}

/** Reads the stored preferences; `null` when missing, unreadable, or malformed. */
export function readPreferences(
  storage: PreferencesStorage,
  storageKey: string,
): PreferencesState | null {
  if (typeof window === "undefined") return null;

  try {
    return parsePreferences(storage.get(storageKey));
  } catch {
    return null;
  }
}

export function writePreferences(
  storage: PreferencesStorage,
  storageKey: string,
  state: PreferencesState,
): void {
  if (typeof window === "undefined") return;

  try {
    storage.set(storageKey, JSON.stringify(state));
  } catch {
    // Storage can be unavailable or full (private mode, quota, blocked
    // cookies); the in-memory state is set by the caller, so a failed
    // persist must never crash the decision flow.
  }
}

export function removePreferences(storage: PreferencesStorage, storageKey: string): void {
  if (typeof window === "undefined") return;

  try {
    storage.remove(storageKey);
  } catch {
    // Same as writePreferences: storage errors must never break a reset.
  }
}
