import type { PreferencesStorage } from "non-spooky-react-cookie";
import { CookieBanner, CookieBannerConfigurationProvider } from "non-spooky-react-cookie";
import { ConsentToolbar } from "../components/ConsentToolbar";
import { StoredValue } from "../components/StoredValue";

const STORAGE_KEY = "pg-session";

/**
 * Any object with get/set/remove working on strings is a valid storage.
 * The library handles JSON (de)serialization and validation, so the adapter
 * never sees the state shape. Keep the reference stable (module-level const
 * or useMemo), not an inline object literal.
 */
const sessionStorageAdapter: PreferencesStorage = {
  get: (key) => window.sessionStorage.getItem(key),
  set: (key, value) => window.sessionStorage.setItem(key, value),
  remove: (key) => window.sessionStorage.removeItem(key),
};

export function CustomStorageAdapterSessionStorage() {
  return (
    <CookieBannerConfigurationProvider
      storageKey={STORAGE_KEY}
      storage={sessionStorageAdapter}
    >
      <div className="pg-card">
        <h3>storage={"{sessionStorageAdapter}"}</h3>
        <p className="pg-muted">
          Decide, then open this page in a new tab: sessionStorage is per tab, so the
          banner shows again there. Other ideas: IndexedDB, an in-memory map for tests, a
          server-backed store.
        </p>
      </div>
      <ConsentToolbar />
      <StoredValue storageKey={STORAGE_KEY} />
      <CookieBanner />
    </CookieBannerConfigurationProvider>
  );
}
