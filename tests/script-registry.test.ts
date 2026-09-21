import { beforeEach, describe, expect, it } from "vitest";
import {
  clearRegistry,
  getRegisteredScript,
  getRegisteredScripts,
  registerScript,
  unregisterScript,
} from "../src/integrations/script-registry";

describe("script registry", () => {
  beforeEach(() => clearRegistry());

  it("stores, replaces and removes definitions by id", () => {
    registerScript("ga", { category: "analytics", src: "https://a" });
    expect(getRegisteredScript("ga")?.src).toBe("https://a");

    registerScript("ga", { category: "analytics", src: "https://b" });
    expect(getRegisteredScript("ga")?.src).toBe("https://b");

    unregisterScript("ga");
    expect(getRegisteredScript("ga")).toBeUndefined();
  });

  it("lists everything as a plain object", () => {
    registerScript("a", { category: "x" });
    registerScript("b", { category: "y" });
    expect(Object.keys(getRegisteredScripts())).toEqual(["a", "b"]);
    clearRegistry();
    expect(getRegisteredScripts()).toEqual({});
  });
});
