import { describe, expect, it } from "vitest";
import { parsePreferences, readPreferences, writePreferences } from "../src/storage";

const valid = JSON.stringify({
  version: "1",
  updatedAt: "2026-09-16T00:00:00.000Z",
  accepted: { necessary: true, analytics: false },
});

describe("parsePreferences", () => {
  it("parses a valid payload into a fresh object", () => {
    const state = parsePreferences(valid);
    expect(state).toEqual({
      version: "1",
      updatedAt: "2026-09-16T00:00:00.000Z",
      accepted: { necessary: true, analytics: false },
    });
  });

  it("returns null for empty, malformed or wrongly shaped input", () => {
    expect(parsePreferences(null)).toBeNull();
    expect(parsePreferences("")).toBeNull();
    expect(parsePreferences("{not json")).toBeNull();
    expect(parsePreferences(JSON.stringify({ version: 1 }))).toBeNull();
    expect(parsePreferences(JSON.stringify({ version: "1", updatedAt: "x" }))).toBeNull();
  });
});

describe("readPreferences / writePreferences without a window", () => {
  it("is a no-op on the server", () => {
    const calls: string[] = [];
    const storage = {
      get: () => {
        calls.push("get");
        return valid;
      },
      set: () => {
        calls.push("set");
      },
      remove: () => {
        calls.push("remove");
      },
    };
    expect(readPreferences(storage, "k")).toBeNull();
    writePreferences(storage, "k", JSON.parse(valid));
    expect(calls).toEqual([]);
  });
});
