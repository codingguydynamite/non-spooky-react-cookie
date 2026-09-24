import { describe, expect, it } from "vitest";
import { readPreferencesFromCookies } from "../src/server";

const state = {
  version: "2026-09",
  updatedAt: "2026-09-16T00:00:00.000Z",
  accepted: { necessary: true, marketing: true },
};
const encoded = encodeURIComponent(JSON.stringify(state));

describe("readPreferencesFromCookies", () => {
  it("reads from a raw Cookie header", () => {
    const header = `theme=dark; my-site=${encoded}; other=1`;
    expect(readPreferencesFromCookies(header, "my-site")).toEqual(state);
  });

  it("reads from a cookies() style store", () => {
    const store = {
      get: (name: string) =>
        name === "my-site" ? { value: decodeURIComponent(encoded) } : undefined,
    };
    expect(readPreferencesFromCookies(store, "my-site")).toEqual(state);
  });

  it("uses the default storage key when none is given", () => {
    const header = `non-spooky-react-cookie=${encoded}`;
    expect(readPreferencesFromCookies(header)).toEqual(state);
  });

  it("returns null for missing sources or cookies", () => {
    expect(readPreferencesFromCookies(null, "my-site")).toBeNull();
    expect(readPreferencesFromCookies(undefined, "my-site")).toBeNull();
    expect(readPreferencesFromCookies("a=1", "my-site")).toBeNull();
    expect(readPreferencesFromCookies({ get: () => undefined }, "my-site")).toBeNull();
  });
});
