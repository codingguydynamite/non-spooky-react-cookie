import type {
  CookieStorageOptions,
  PreferencesStorage,
  StorageKind,
} from "../types";

const DEFAULT_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 365 days, in seconds

/**
 * Finds `key` in a `Cookie` header / `document.cookie` string and returns its
 * decoded value, or `null` when absent. Shared by the browser adapter and the
 * server-side reader so both parse cookies the same way.
 */
export function findCookie(cookieString: string, key: string): string | null {
  const name = encodeURIComponent(key);

  for (const part of cookieString.split(";")) {
    const trimmed = part.trim();
    if (!trimmed.startsWith(`${name}=`)) continue;

    try {
      return decodeURIComponent(trimmed.slice(name.length + 1));
    } catch {
      return null;
    }
  }

  return null;
}

/** The default: `window.localStorage`, keyed by `storageKey`. */
export const localStorageAdapter: PreferencesStorage = {
  get: (key) => window.localStorage.getItem(key),
  set: (key, value) => window.localStorage.setItem(key, value),
  remove: (key) => window.localStorage.removeItem(key),
};

/**
 * Stores the decision in a cookie named `storageKey`, so a server can read it
 * (see `readPreferencesFromCookies`). The value is the url-encoded JSON state,
 * a few hundred bytes for typical configs — far below the 4 KB cookie limit.
 */
export function createCookieStorage(
  options: CookieStorageOptions = {},
): PreferencesStorage {
  const {
    maxAge = DEFAULT_COOKIE_MAX_AGE,
    domain,
    path = "/",
    sameSite = "lax",
  } = options;

  // `SameSite=None` is rejected by browsers without `Secure`.
  const isSecure = () =>
    sameSite === "none" ||
    (options.secure ?? window.location.protocol === "https:");

  // The remove call must repeat Path/Domain, otherwise the browser treats it
  // as a different cookie and keeps the original.
  const attributes = (age: number) =>
    [
      `Path=${path}`,
      `Max-Age=${age}`,
      `SameSite=${sameSite === "none" ? "None" : sameSite === "strict" ? "Strict" : "Lax"}`,
      domain ? `Domain=${domain}` : "",
      isSecure() ? "Secure" : "",
    ]
      .filter(Boolean)
      .join("; ");

  return {
    get: (key) => findCookie(document.cookie, key),
    set: (key, value) => {
      document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}; ${attributes(maxAge)}`;
    },
    remove: (key) => {
      document.cookie = `${encodeURIComponent(key)}=; ${attributes(0)}`;
    },
  };
}

/**
 * Writes to the cookie **and** localStorage; reads the cookie first and falls
 * back to localStorage. The cookie wins because it is the copy a server can
 * see; the fallback keeps visitors who decided before a site switched from
 * localStorage to cookies from being asked again.
 */
export function createBothStorage(
  options?: CookieStorageOptions,
): PreferencesStorage {
  const cookie = createCookieStorage(options);
  const local = localStorageAdapter;

  return {
    get: (key) => cookie.get(key) ?? local.get(key),
    set: (key, value) => {
      cookie.set(key, value);
      local.set(key, value);
    },
    remove: (key) => {
      cookie.remove(key);
      local.remove(key);
    },
  };
}

/** Maps the `storage` prop (a kind or a custom adapter) to a storage object. */
export function resolveStorage(
  storage: StorageKind | PreferencesStorage,
  cookieOptions?: CookieStorageOptions,
): PreferencesStorage {
  if (typeof storage !== "string") return storage;

  switch (storage) {
    case "cookie":
      return createCookieStorage(cookieOptions);
    case "both":
      return createBothStorage(cookieOptions);
    default:
      return localStorageAdapter;
  }
}
