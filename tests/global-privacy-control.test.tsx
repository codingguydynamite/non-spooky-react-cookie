// @vitest-environment jsdom
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  CookieBannerConfigurationProvider,
  type CookieBannerConfigurationProviderProps,
  DEFAULT_STORAGE_KEY,
  type PreferencesState,
  usePreferences,
} from "../src";
import { readGlobalPrivacyControl } from "../src/integrations/global-privacy-control";

type ProviderProps = Omit<CookieBannerConfigurationProviderProps, "children">;

/** Simulates the browser signal; jsdom's `navigator` has no such property. */
function setGlobalPrivacyControl(value: unknown): void {
  Object.defineProperty(navigator, "globalPrivacyControl", {
    value,
    configurable: true,
    writable: true,
  });
}

function clearGlobalPrivacyControl(): void {
  delete (navigator as { globalPrivacyControl?: unknown }).globalPrivacyControl;
}

let root: Root | null = null;

type Probe = {
  hasDecision: boolean;
  showBanner: boolean;
  globalPrivacyControl: boolean;
  isAllowed: (id: string) => boolean;
  acceptAll: () => void;
};

/** Renders the provider; the returned object always mirrors the latest context. */
function mountWithProbe(props: ProviderProps = {}): Probe {
  const latest: Probe = {
    hasDecision: false,
    showBanner: false,
    globalPrivacyControl: false,
    isAllowed: () => false,
    acceptAll: () => undefined,
  };

  function ProbeComponent() {
    const context = usePreferences();
    latest.hasDecision = context.hasDecision;
    latest.showBanner = context.showBanner;
    latest.globalPrivacyControl = context.globalPrivacyControl;
    latest.isAllowed = context.isAllowed;
    latest.acceptAll = context.acceptAll;
    return null;
  }

  const children: ReactNode = <ProbeComponent />;
  const container = document.createElement("div");
  document.body.appendChild(container);
  const nextRoot = createRoot(container);
  act(() =>
    nextRoot.render(
      <CookieBannerConfigurationProvider {...props}>
        {children}
      </CookieBannerConfigurationProvider>,
    ),
  );
  root = nextRoot;

  return latest;
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  root = null;
  clearGlobalPrivacyControl();
});

describe("readGlobalPrivacyControl", () => {
  it("is true only for an active signal", () => {
    expect(readGlobalPrivacyControl()).toBe(false);

    setGlobalPrivacyControl(false);
    expect(readGlobalPrivacyControl()).toBe(false);

    setGlobalPrivacyControl("1");
    expect(readGlobalPrivacyControl()).toBe(false);

    setGlobalPrivacyControl(true);
    expect(readGlobalPrivacyControl()).toBe(true);
  });
});

describe("respectGlobalPrivacyControl", () => {
  it("can be turned off with respectGlobalPrivacyControl={false}", () => {
    setGlobalPrivacyControl(true);
    const probe = mountWithProbe({ respectGlobalPrivacyControl: false });

    expect(probe.hasDecision).toBe(false);
    expect(probe.showBanner).toBe(true);
    expect(probe.globalPrivacyControl).toBe(false);
  });

  it("is on by default: an active signal means 'Reject all' and no banner", () => {
    setGlobalPrivacyControl(true);
    const onDecision = vi.fn<(state: PreferencesState) => void>();
    const probe = mountWithProbe({ onDecision });

    expect(probe.showBanner).toBe(false);
    expect(probe.hasDecision).toBe(true);
    expect(probe.globalPrivacyControl).toBe(true);
    expect(probe.isAllowed("necessary")).toBe(true);
    expect(probe.isAllowed("preferences")).toBe(false);
    expect(probe.isAllowed("analytics")).toBe(false);
    expect(probe.isAllowed("marketing")).toBe(false);

    expect(onDecision).toHaveBeenCalledTimes(1);
    expect(onDecision.mock.calls[0]?.[0]?.accepted).toMatchObject({
      necessary: true,
      preferences: false,
      analytics: false,
      marketing: false,
    });
  });

  it("does not persist the signal-driven decision", () => {
    setGlobalPrivacyControl(true);
    mountWithProbe({ respectGlobalPrivacyControl: true });

    expect(window.localStorage.getItem(DEFAULT_STORAGE_KEY)).toBeNull();
  });

  it("shows the banner when the signal is off or missing", () => {
    setGlobalPrivacyControl(false);
    const withOff = mountWithProbe({ respectGlobalPrivacyControl: true });
    expect(withOff.showBanner).toBe(true);
    expect(withOff.globalPrivacyControl).toBe(false);

    act(() => {
      root?.unmount();
    });
    root = null;
    clearGlobalPrivacyControl();

    const withMissing = mountWithProbe({ respectGlobalPrivacyControl: true });
    expect(withMissing.showBanner).toBe(true);
    expect(withMissing.globalPrivacyControl).toBe(false);
  });

  it("lets a decision the visitor already made win over the signal", () => {
    const stored: PreferencesState = {
      version: "1",
      updatedAt: new Date().toISOString(),
      accepted: { necessary: true, preferences: true, analytics: true, marketing: true },
    };
    window.localStorage.setItem(DEFAULT_STORAGE_KEY, JSON.stringify(stored));
    setGlobalPrivacyControl(true);
    const onDecision = vi.fn();

    const probe = mountWithProbe({ respectGlobalPrivacyControl: true, onDecision });

    expect(probe.hasDecision).toBe(true);
    expect(probe.showBanner).toBe(false);
    expect(probe.isAllowed("analytics")).toBe(true);
    // The signal was still detected; only the outcome was decided by the visitor.
    expect(probe.globalPrivacyControl).toBe(true);
    expect(onDecision).not.toHaveBeenCalled();
  });

  it("still lets the visitor opt in afterwards, and persists that", () => {
    setGlobalPrivacyControl(true);
    const probe = mountWithProbe({ respectGlobalPrivacyControl: true });
    expect(probe.isAllowed("analytics")).toBe(false);

    act(() => probe.acceptAll());

    expect(probe.isAllowed("analytics")).toBe(true);
    const persisted = JSON.parse(
      window.localStorage.getItem(DEFAULT_STORAGE_KEY) ?? "{}",
    );
    expect(persisted.accepted).toMatchObject({ analytics: true, marketing: true });
  });
});
