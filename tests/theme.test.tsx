// @vitest-environment jsdom
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import {
  type ButtonLikeProps,
  type CollapsibleProps,
  CookieBanner,
  CookieBannerConfigurationProvider,
  type CookieBannerConfigurationProviderProps,
  CookieSettingsLink,
  THEME_ATTRIBUTE,
  usePreferences,
} from "../src";
import { buildThemeCss } from "../src/CookieBannerConfigurationProvider";

let root: Root | null = null;
let container: HTMLDivElement | null = null;

function mount(children: ReactNode): void {
  container = document.createElement("div");
  document.body.appendChild(container);
  const nextRoot = createRoot(container);
  act(() => nextRoot.render(children));
  root = nextRoot;
}

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  root = null;
  container?.remove();
  container = null;
  window.localStorage.clear();
});

const open: { settings: () => void } = { settings: () => {} };

/** Exposes `openSettings` so tests can mount the dialog. */
function Probe() {
  const { openSettings } = usePreferences();
  open.settings = openSettings;
  return null;
}

function themeStyleElement(): HTMLStyleElement | null {
  return document.querySelector("style[data-nsr-theme-style]");
}

function mountProvider(
  props: Partial<CookieBannerConfigurationProviderProps> = {},
  children: ReactNode = null,
) {
  mount(
    <CookieBannerConfigurationProvider storageKey="test-theme" {...props}>
      <Probe />
      <CookieBanner />
      <CookieSettingsLink />
      {children}
    </CookieBannerConfigurationProvider>,
  );
}

describe("buildThemeCss", () => {
  it("returns an empty string when neither palette sets anything", () => {
    expect(buildThemeCss("id", {}, {})).toBe("");
  });

  it("scopes light values to the theme attribute and dark values to a dark ancestor", () => {
    const css = buildThemeCss(
      ":r1:",
      { primaryColor: "#ff0000" },
      { surfaceColor: "#000000" },
    );
    expect(css).toContain(`[${THEME_ATTRIBUTE}=":r1:"] {\n  --nsr-primary: #ff0000;\n}`);
    expect(css).toContain(
      `:is(.dark, [data-theme="dark"]) [${THEME_ATTRIBUTE}=":r1:"] {\n  --nsr-surface: #000000;\n}`,
    );
  });

  it("maps every palette key, including the derived colors", () => {
    const css = buildThemeCss(
      "id",
      {
        primaryHoverColor: "a",
        surfaceMutedColor: "b",
        ringColor: "c",
        switchOffColor: "d",
        switchThumbColor: "e",
        backdropColor: "f",
        mutedTextColor: "g",
        borderColor: "h",
        secondaryColor: "i",
        secondaryTextColor: "j",
      },
      {},
    );
    for (const variable of [
      "--nsr-primary-hover: a",
      "--nsr-surface-muted: b",
      "--nsr-ring: c",
      "--nsr-switch-off: d",
      "--nsr-switch-thumb: e",
      "--nsr-backdrop: f",
      "--nsr-muted: g",
      "--nsr-border: h",
      "--nsr-secondary: i",
      "--nsr-secondary-text: j",
    ]) {
      expect(css).toContain(variable);
    }
  });

  it("strips characters that could break out of the declaration", () => {
    const css = buildThemeCss("id", { primaryColor: "red; } body { display: none" }, {});
    expect(css).not.toMatch(/body \{/);
    expect(css.match(/\}/g)).toHaveLength(1);
    expect(css).not.toContain("</style>");
  });
});

describe("theme prop", () => {
  it("renders no <style> when no palette is set", () => {
    mountProvider();
    expect(themeStyleElement()).toBeNull();
    // The scope attribute is still there, so consumer CSS can target it.
    expect(document.querySelector(`.nsr-banner[${THEME_ATTRIBUTE}]`)).not.toBeNull();
  });

  it("scopes theme and darkTheme to the banner and the settings link", () => {
    mountProvider({
      theme: { primaryColor: "#ff0000" },
      darkTheme: { primaryColor: "#00ff00", surfaceColor: "#000000" },
    });

    const style = themeStyleElement();
    expect(style).not.toBeNull();
    const id = style?.getAttribute("data-nsr-theme-style");
    expect(id).toBeTruthy();

    const banner = document.querySelector(".nsr-banner");
    const link = document.querySelector(".nsr-settings-link");
    expect(banner?.getAttribute(THEME_ATTRIBUTE)).toBe(id);
    expect(link?.getAttribute(THEME_ATTRIBUTE)).toBe(id);
    // No inline variables any more: the stylesheet rule owns them.
    expect((banner as HTMLElement).style.getPropertyValue("--nsr-primary")).toBe("");

    expect(style?.textContent).toContain(
      `[${THEME_ATTRIBUTE}="${id}"] {\n  --nsr-primary: #ff0000;`,
    );
    expect(style?.textContent).toContain(
      `:is(.dark, [data-theme="dark"]) [${THEME_ATTRIBUTE}="${id}"] {\n  --nsr-primary: #00ff00;\n  --nsr-surface: #000000;`,
    );
  });

  it("scopes the open settings dialog too", () => {
    mountProvider({ theme: { accentColor: "#123456" } });
    act(() => open.settings());
    const id = themeStyleElement()?.getAttribute("data-nsr-theme-style");
    expect(
      document.querySelector(".nsr-settings-dialog")?.getAttribute(THEME_ATTRIBUTE),
    ).toBe(id);
  });

  it("exposes themeStyle and themeAttributes through usePreferences", () => {
    const seen: { style: Record<string, unknown>; attrs: Record<string, string> } = {
      style: {},
      attrs: {},
    };
    function Reader() {
      const { themeStyle, themeAttributes } = usePreferences();
      seen.style = themeStyle as Record<string, unknown>;
      seen.attrs = themeAttributes;
      return null;
    }
    mountProvider({ theme: { primaryColor: "#ff0000" } }, <Reader />);
    expect(seen.style).toEqual({ "--nsr-primary": "#ff0000" });
    expect(seen.attrs[THEME_ATTRIBUTE]).toBeTruthy();
  });
});

describe("components", () => {
  function PillButton({ className, variant: _variant, ...props }: ButtonLikeProps) {
    return <button className={`pill ${className ?? ""}`} {...props} />;
  }

  function PlainCollapsible({ children, label, count }: CollapsibleProps) {
    return (
      <div className="plain-collapsible">
        <span>
          {count} {label}
        </span>
        {children}
      </div>
    );
  }

  it("forwards CookieBanner's components to the dialog it renders", () => {
    mount(
      <CookieBannerConfigurationProvider storageKey="test-components">
        <Probe />
        <CookieBanner components={{ Button: PillButton }} />
      </CookieBannerConfigurationProvider>,
    );
    expect(document.querySelectorAll(".nsr-banner button.pill")).toHaveLength(3);
    act(() => open.settings());
    expect(document.querySelectorAll(".nsr-dialog__footer button.pill")).toHaveLength(2);
  });

  it("lets dialogProps.components win over CookieBanner's components", () => {
    function OtherButton({ className, variant: _variant, ...props }: ButtonLikeProps) {
      return <button className={`other ${className ?? ""}`} {...props} />;
    }
    mount(
      <CookieBannerConfigurationProvider storageKey="test-components-2">
        <Probe />
        <CookieBanner
          components={{ Button: PillButton }}
          dialogProps={{ components: { Button: OtherButton } }}
        />
      </CookieBannerConfigurationProvider>,
    );
    act(() => open.settings());
    expect(document.querySelectorAll(".nsr-dialog__footer button.other")).toHaveLength(2);
    expect(document.querySelectorAll(".nsr-dialog__footer button.pill")).toHaveLength(0);
  });

  it("lets the provider swap the Collapsible", () => {
    mount(
      <CookieBannerConfigurationProvider
        storageKey="test-collapsible"
        components={{ Collapsible: PlainCollapsible }}
        config={{
          categories: {
            necessary: { required: true },
            marketing: { items: { pixel: { name: "Pixel" } } },
          },
        }}
      >
        <Probe />
        <CookieBanner />
      </CookieBannerConfigurationProvider>,
    );
    act(() => open.settings());
    expect(document.querySelector(".plain-collapsible")).not.toBeNull();
    expect(document.querySelector(".nsr-collapsible")).toBeNull();
    expect(document.querySelector(".nsr-item__title")?.textContent).toBe("Pixel");
  });
});
