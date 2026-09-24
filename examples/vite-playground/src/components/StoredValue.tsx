import { usePreferences } from "non-spooky-react-cookie";

function readCookie(name: string): string | null {
  const prefix = `${encodeURIComponent(name)}=`;
  for (const part of document.cookie.split(";")) {
    const trimmed = part.trim();
    if (trimmed.startsWith(prefix))
      return decodeURIComponent(trimmed.slice(prefix.length));
  }
  return null;
}

/**
 * Shows the raw persisted payload in every place it could live. Re-reads on
 * each render; rendering inside the provider makes it re-render on decisions.
 */
export function StoredValue({ storageKey }: { storageKey: string }) {
  // Subscribing to the context re-renders this component on every decision.
  usePreferences();

  const rows: Array<[string, string | null]> = [
    ["localStorage", window.localStorage.getItem(storageKey)],
    ["sessionStorage", window.sessionStorage.getItem(storageKey)],
    ["cookie", readCookie(storageKey)],
  ];

  return (
    <div className="pg-card">
      <p className="pg-label">
        Stored under <code>{storageKey}</code>
      </p>
      <dl className="pg-kv">
        {rows.map(([where, value]) => (
          <div key={where} className="pg-kv__row">
            <dt>{where}</dt>
            <dd>{value ? <code className="pg-code">{value}</code> : <em>empty</em>}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
