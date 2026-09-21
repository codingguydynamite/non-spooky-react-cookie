// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import {
  createBothStorage,
  createCookieStorage,
  findCookie,
  localStorageAdapter,
  resolveStorage,
} from "../src/storage/adapters";

function clearCookies() {
  for (const part of document.cookie.split(";")) {
    const name = part.split("=")[0]?.trim();
    if (name) document.cookie = `${name}=; Max-Age=0; Path=/`;
  }
}

describe("findCookie", () => {
  it("returns the decoded value of the named cookie", () => {
    const header = "a=1; consent=%7B%22v%22%3A1%7D; b=2";
    expect(findCookie(header, "consent")).toBe('{"v":1}');
  });

  it("does not match a cookie whose name only starts with the key", () => {
    expect(findCookie("consent-old=x", "consent")).toBeNull();
  });

  it("returns null when absent or undecodable", () => {
    expect(findCookie("a=1", "consent")).toBeNull();
    expect(findCookie("consent=%E0%A4%A", "consent")).toBeNull();
  });
});

describe("createCookieStorage", () => {
  it("round-trips a value through document.cookie", () => {
    clearCookies();
    const storage = createCookieStorage();
    storage.set("nsr", '{"version":"1"}');
    expect(storage.get("nsr")).toBe('{"version":"1"}');
    storage.remove("nsr");
    expect(storage.get("nsr")).toBeNull();
  });
});

describe("createBothStorage", () => {
  it("writes to both stores and prefers the cookie on read", () => {
    clearCookies();
    window.localStorage.clear();
    const storage = createBothStorage();
    storage.set("nsr", "from-both");
    expect(window.localStorage.getItem("nsr")).toBe("from-both");
    expect(findCookie(document.cookie, "nsr")).toBe("from-both");

    // Cookie gone (e.g. expired) but localStorage still has the old choice.
    document.cookie = "nsr=; Max-Age=0; Path=/";
    expect(storage.get("nsr")).toBe("from-both");
    storage.remove("nsr");
    expect(storage.get("nsr")).toBeNull();
  });
});

describe("resolveStorage", () => {
  it("maps the kinds and passes a custom adapter through", () => {
    expect(resolveStorage("localStorage")).toBe(localStorageAdapter);
    expect(resolveStorage("cookie")).not.toBe(localStorageAdapter);
    const custom = { get: () => null, set: () => {}, remove: () => {} };
    expect(resolveStorage(custom)).toBe(custom);
  });
});
