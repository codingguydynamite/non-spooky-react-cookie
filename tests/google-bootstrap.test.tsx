// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  type ConsentScripts,
  CookieBannerConfigurationProvider,
  usePreferences,
} from "../src";
import {
  parseGoogleScript,
  resetGoogleBootstrap,
} from "../src/integrations/google-bootstrap";
import { ensureScript, removeScript } from "../src/integrations/script-loader";

const GTM_SRC = "https://www.googletagmanager.com/gtm.js?id=GTM-TEST1";
const GTAG_SRC = "https://www.googletagmanager.com/gtag/js?id=G-TEST1";

/** dataLayer entries as short labels: `gtm.js`, `consent:default`, … */
function labels(layer: unknown[] = window.dataLayer ?? []): string[] {
  return layer.map((entry) => {
    if (entry && typeof entry === "object" && "event" in entry) {
      return String((entry as { event: unknown }).event);
    }
    const args = Array.from(entry as ArrayLike<unknown>);
    return typeof args[1] === "string" ? `${args[0]}:${args[1]}` : String(args[0]);
  });
}

beforeEach(() => {
  resetGoogleBootstrap();
  delete window.dataLayer;
  delete window.gtag;
  document.head.innerHTML = "";
});

describe("parseGoogleScript", () => {
  it("recognises GTM and gtag.js loaders", () => {
    expect(parseGoogleScript(GTM_SRC)).toEqual({
      kind: "gtm",
      id: "GTM-TEST1",
      dataLayerName: "dataLayer",
    });
    expect(parseGoogleScript(GTAG_SRC)).toEqual({
      kind: "gtag",
      id: "G-TEST1",
      dataLayerName: "dataLayer",
    });
    expect(
      parseGoogleScript("https://www.googletagmanager.com/gtm.js?id=GTM-X&l=myLayer")
        ?.dataLayerName,
    ).toBe("myLayer");
  });

  it("ignores other URLs", () => {
    expect(parseGoogleScript("https://static.hotjar.com/c_hotjar-next.js")).toBeNull();
    expect(parseGoogleScript("https://www.googletagmanager.com/gtm.js")).toBeNull();
    expect(parseGoogleScript("https://evil.example/gtm.js?id=GTM-X")).toBeNull();
    expect(parseGoogleScript("/gtm.js?id=GTM-X")).toBeNull();
  });
});

describe("ensureScript with Google loaders", () => {
  it("pushes the gtm.js event before injecting GTM", () => {
    ensureScript("gtm", { category: "analytics", src: GTM_SRC, async: true });

    expect(labels()).toEqual(["gtm.js"]);
    const start = window.dataLayer?.[0] as Record<string, unknown>;
    expect(typeof start["gtm.start"]).toBe("number");
    expect(document.getElementById("gtm")?.getAttribute("src")).toBe(GTM_SRC);
  });

  it("queues gtag js + config before injecting gtag.js", () => {
    ensureScript("ga", { category: "analytics", src: GTAG_SRC });

    expect(labels()).toEqual(["js", "config:G-TEST1"]);
    expect(Object.prototype.toString.call(window.dataLayer?.[0])).toBe(
      "[object Arguments]",
    );
  });

  it("uses the data layer named by the l parameter", () => {
    ensureScript("gtm", {
      category: "analytics",
      src: `${GTM_SRC}&l=customLayer`,
    });

    const custom = (window as unknown as { customLayer: unknown[] }).customLayer;
    expect(labels(custom)).toEqual(["gtm.js"]);
    expect(window.dataLayer).toBeUndefined();
  });

  it("does not start a container twice after withdrawal and re-consent", () => {
    const def = { category: "analytics", src: GTM_SRC };
    ensureScript("gtm", def);
    removeScript("gtm");
    ensureScript("gtm", def);

    expect(labels()).toEqual(["gtm.js"]);
    expect(document.getElementById("gtm")).not.toBeNull();
  });

  it("can be turned off per script", () => {
    ensureScript("gtm", {
      category: "analytics",
      src: GTM_SRC,
      googleBootstrap: false,
    });

    expect(window.dataLayer).toBeUndefined();
  });

  it("leaves other scripts alone", () => {
    ensureScript("hotjar", {
      category: "analytics",
      src: "https://static.hotjar.com/c_hotjar-next.js",
    });

    expect(window.dataLayer).toBeUndefined();
  });
});

describe("provider + googleConsentMode", () => {
  let root: Root | null = null;

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
    localStorage.clear();
  });

  const scripts: ConsentScripts = {
    gtm: { category: "analytics", src: GTM_SRC, async: true },
  };

  it("queues consent before the gtm.js event, and loads GTM only on accept", () => {
    let acceptAll: () => void = () => {};
    function Grab() {
      acceptAll = usePreferences().acceptAll;
      return null;
    }

    const container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() =>
      root?.render(
        <CookieBannerConfigurationProvider googleConsentMode scripts={scripts}>
          <Grab />
        </CookieBannerConfigurationProvider>,
      ),
    );

    expect(labels()).toEqual(["consent:default", "consent:update"]);
    expect(document.getElementById("gtm")).toBeNull();

    act(() => acceptAll());

    expect(labels()).toEqual([
      "consent:default",
      "consent:update",
      "consent:update",
      "gtm.js",
    ]);
    const update = Array.from(window.dataLayer?.[2] as ArrayLike<unknown>);
    expect(update[2]).toMatchObject({ analytics_storage: "granted" });
    expect(document.getElementById("gtm")).not.toBeNull();
  });
});
