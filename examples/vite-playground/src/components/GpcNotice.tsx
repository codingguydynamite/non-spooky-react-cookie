import { BROWSER_SENDS_GPC, setRespectGpc, useRespectGpc } from "./gpc-settings";

/**
 * Shown only when the browser sends the Global Privacy Control signal. The
 * library honors that signal by default, so without this notice a visitor on
 * Brave would see no banner anywhere in the playground and wonder why.
 */
export function GpcNotice() {
  const respect = useRespectGpc();

  if (!BROWSER_SENDS_GPC) return null;

  return (
    <div className="pg-alert">
      <p>
        <strong>Your browser already opted out for you.</strong> It sends the Global
        Privacy Control signal (<code>navigator.globalPrivacyControl === true</code>), and
        the provider treats that as "Reject all" out of the box. That is why no cookie
        banner shows up in these examples. Untick the box to see the banners anyway.
      </p>
      <label className="pg-row">
        <input
          type="checkbox"
          checked={respect}
          onChange={(event) => setRespectGpc(event.target.checked)}
        />
        <code>respectGlobalPrivacyControl</code>
        <span className="pg-muted">
          {respect
            ? "on: banners hidden, everything optional rejected"
            : "off: banners shown"}
        </span>
      </label>
    </div>
  );
}
