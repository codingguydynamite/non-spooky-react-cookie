// @vitest-environment jsdom
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";
import {
  CookieBannerConfigurationProvider,
  DEFAULT_STORAGE_KEY,
  usePreferences,
} from "../src";

declare global {
  interface Window {
    justDont?: () => void;
  }
}

let root: Root | null = null;

function mount(children: ReactNode): void {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const nextRoot = createRoot(container);
  act(() => nextRoot.render(children));
  root = nextRoot;
}

function unmount(): void {
  act(() => {
    root?.unmount();
  });
  root = null;
}

function provider(
  props: { windowJustDont?: boolean; onDecision?: () => void } = {},
): ReactNode {
  return (
    <CookieBannerConfigurationProvider {...props}>
      {null}
    </CookieBannerConfigurationProvider>
  );
}

/** Renders the provider; the returned object always mirrors the latest context. */
function mountWithProbe(
  props: { windowJustDont?: boolean; onDecision?: () => void } = {},
) {
  const latest: { hasDecision: boolean; isAllowed: (id: string) => boolean } = {
    hasDecision: false,
    isAllowed: () => false,
  };

  function Probe() {
    const context = usePreferences();
    latest.hasDecision = context.hasDecision;
    latest.isAllowed = context.isAllowed;
    return null;
  }

  mount(
    <CookieBannerConfigurationProvider {...props}>
      <Probe />
    </CookieBannerConfigurationProvider>,
  );

  return latest;
}

/** Calls the registered global; it must exist by the time a test uses it. */
function justDont(): void {
  if (typeof window.justDont !== "function") {
    throw new Error("window.justDont was not registered by the provider");
  }
  window.justDont();
}

describe("window.justDont", () => {
  it("is registered automatically when the provider mounts", () => {
    mount(provider());
    expect(typeof window.justDont).toBe("function");
    unmount();
  });

  it("removes the global on unmount", () => {
    mount(provider());
    expect(typeof window.justDont).toBe("function");
    unmount();
    expect(window.justDont).toBeUndefined();
  });

  it("can be turned off with windowJustDont={false}", () => {
    mount(provider({ windowJustDont: false }));
    expect(window.justDont).toBeUndefined();
    unmount();
  });

  it("rejects every optional category and keeps the required ones", () => {
    const probe = mountWithProbe();

    act(justDont);

    expect(probe.hasDecision).toBe(true);
    expect(probe.isAllowed("necessary")).toBe(true);
    expect(probe.isAllowed("preferences")).toBe(false);
    expect(probe.isAllowed("analytics")).toBe(false);
    expect(probe.isAllowed("marketing")).toBe(false);
    unmount();
  });

  it("persists the decision and fires onDecision", () => {
    const onDecision = vi.fn();
    mountWithProbe({ onDecision });

    act(justDont);

    expect(onDecision).toHaveBeenCalledTimes(1);
    const stored = JSON.parse(window.localStorage.getItem(DEFAULT_STORAGE_KEY) ?? "{}");
    expect(stored.accepted).toMatchObject({
      necessary: true,
      preferences: false,
      analytics: false,
      marketing: false,
    });
    unmount();
  });

  it("warns when window.justDont already exists and still takes over", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const foreign = () => undefined;
    (window as { justDont?: () => void }).justDont = foreign;

    mount(provider());
    expect(warn).toHaveBeenCalled();
    // The provider overwrites the foreign global and owns the slot from now on.
    expect(window.justDont).toBeTypeOf("function");
    expect(window.justDont).not.toBe(foreign);
    unmount();

    // It cleared the slot on unmount because it registered the current value.
    expect(window.justDont).toBeUndefined();
    warn.mockRestore();
  });
});
