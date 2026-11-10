/**
 * Google's loader scripts do nothing on their own. The official snippets
 * queue a start command before the script tag:
 *
 * - GTM (`gtm.js?id=GTM-…`) needs a `{ event: "gtm.js", "gtm.start" }`
 *   push. The "All Pages" / Page View trigger fires on that event, so
 *   without it the container loads but tags such as the GA4 Google tag
 *   never fire.
 * - gtag.js (`gtag/js?id=G-…`) needs `gtag("js", new Date())` and
 *   `gtag("config", id)`, otherwise no page view is sent.
 *
 * `bootstrapGoogleScript` queues that command for a consent-gated `src`, so
 * `{ src: "https://www.googletagmanager.com/gtm.js?id=GTM-XXXX" }` works
 * as-is. It runs after the consent mode default/update, so the tags see the
 * visitor's choice.
 */

/** Containers already started on this page. */
const started = new Set<string>();

type GoogleScript = {
  kind: "gtm" | "gtag";
  id: string;
  /** Name of the data layer (`l` query parameter), `dataLayer` by default. */
  dataLayerName: string;
};

const GOOGLE_HOSTS = new Set(["www.googletagmanager.com", "googletagmanager.com"]);

export function parseGoogleScript(src: string): GoogleScript | null {
  let url: URL;
  try {
    // No base URL: relative paths throw and are not treated as Google's.
    url = new URL(src);
  } catch {
    return null;
  }

  if (!GOOGLE_HOSTS.has(url.hostname)) return null;

  const id = url.searchParams.get("id");
  if (!id) return null;

  const dataLayerName = url.searchParams.get("l") || "dataLayer";
  const path = url.pathname.replace(/\/+$/, "");

  if (path === "/gtm.js") return { kind: "gtm", id, dataLayerName };
  if (path === "/gtag/js") return { kind: "gtag", id, dataLayerName };
  return null;
}

/**
 * Queues the start command for a Google loader `src`. A no-op for other
 * URLs, and for a container already started on this page: GTM stays in
 * memory after its `<script>` is removed, so starting it again on
 * re-consent would send a second page view.
 */
export function bootstrapGoogleScript(src: string | undefined): void {
  if (typeof window === "undefined" || !src) return;

  const script = parseGoogleScript(src);
  if (!script) return;

  const key = `${script.kind}:${script.dataLayerName}:${script.id}`;
  if (started.has(key)) return;
  started.add(key);

  const globals = window as unknown as Record<string, unknown>;
  const existing = globals[script.dataLayerName];
  const layer: unknown[] = Array.isArray(existing) ? existing : [];
  globals[script.dataLayerName] = layer;

  if (script.kind === "gtm") {
    layer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    return;
  }

  // Same shape as Google's gtag snippet: it pushes the `arguments` object.
  function gtag(..._args: unknown[]) {
    // biome-ignore lint/complexity/noArguments: required by gtag.js
    layer.push(arguments);
  }
  gtag("js", new Date());
  gtag("config", script.id);
}

/** Test helper: forget which containers were started. */
export function resetGoogleBootstrap(): void {
  started.clear();
}
