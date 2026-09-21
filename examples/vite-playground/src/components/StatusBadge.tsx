import type { ScriptStatus } from "non-spooky-react-cookie";
import { useConsentScript } from "non-spooky-react-cookie";

const labels: Record<ScriptStatus, string> = {
  blocked: "blocked",
  loading: "loading…",
  loaded: "loaded",
  error: "error",
};

export function StatusBadge({ status }: { status: ScriptStatus }) {
  return <span className={`pg-status pg-status--${status}`}>{labels[status]}</span>;
}

/** One row per managed script: id, gate, and the live useConsentScript status. */
export function ScriptStatusRow({ id, gate }: { id: string; gate: string }) {
  const { status, error } = useConsentScript(id);
  const message = error instanceof Error ? error.message : "";

  return (
    <li className="pg-script">
      <div>
        <code>{id}</code>
        <p className="pg-muted">gate: {gate}</p>
      </div>
      <div className="pg-row">
        {status === "error" && message ? (
          <span className="pg-error">{message}</span>
        ) : null}
        <StatusBadge status={status} />
      </div>
    </li>
  );
}
