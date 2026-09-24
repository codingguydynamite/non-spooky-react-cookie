import { describe, expect, it } from "vitest";
import { de } from "../src/languages/de";
import { en } from "../src/languages/en";
import { pl } from "../src/languages/pl";
import { BUILT_IN_LANGUAGES, getBuiltInTexts, resolveTexts } from "../src/resolve-texts";
import type { TextOverrides } from "../src/types";

describe("resolveTexts", () => {
  it("returns the built-in texts for a known language", () => {
    expect(resolveTexts("de")).toEqual(de);
    expect(resolveTexts("pl")).toEqual(pl);
    expect(resolveTexts()).toEqual(en);
  });

  it("falls back to English for an unknown language", () => {
    expect(resolveTexts("fr")).toEqual(en);
    expect(resolveTexts("fr-PL")).toEqual(en);
    expect(resolveTexts("")).toEqual(en);
  });

  it("resolves region codes and any casing to the base language", () => {
    expect(resolveTexts("pl-PL")).toEqual(pl);
    expect(resolveTexts("de_AT")).toEqual(de);
    expect(resolveTexts("EN-us")).toEqual(en);
    expect(resolveTexts("PL")).toEqual(pl);
  });

  it("deep-merges overrides without touching the built-ins", () => {
    const merged = resolveTexts("en", {
      banner: { title: "Custom title" },
      categories: {
        marketing: { items: { "meta-pixel": { title: "Meta Pixel" } } },
      },
    });

    expect(merged.banner.title).toBe("Custom title");
    expect(merged.banner.acceptAll).toBe(en.banner.acceptAll);
    expect(merged.categories.marketing?.title).toBe(en.categories.marketing?.title);
    expect(merged.categories.marketing?.items?.["meta-pixel"]?.title).toBe("Meta Pixel");
    expect(en.banner.title).not.toBe("Custom title");
  });

  it("ignores undefined override values", () => {
    const merged = resolveTexts("en", { banner: { title: undefined } });
    expect(merged.banner.title).toBe(en.banner.title);
  });

  it("treats null like a missing key, the way a CMS returns an empty field", () => {
    const merged = resolveTexts("pl", {
      banner: { title: null, acceptAll: "Tak" },
      dialog: null,
      categories: { analytics: { title: null, description: "Statystyki" } },
    });

    expect(merged.banner.title).toBe(pl.banner.title);
    expect(merged.banner.acceptAll).toBe("Tak");
    expect(merged.dialog).toEqual(pl.dialog);
    expect(merged.categories.analytics?.title).toBe(pl.categories.analytics?.title);
    expect(merged.categories.analytics?.description).toBe("Statystyki");
    expect(resolveTexts("en", null)).toEqual(en);
  });

  it("keeps an empty string as a deliberate value", () => {
    expect(resolveTexts("en", { banner: { title: "" } }).banner.title).toBe("");
  });
});

describe("getBuiltInTexts", () => {
  it("lists every built-in language", () => {
    expect(BUILT_IN_LANGUAGES.map((code) => getBuiltInTexts(code))).toEqual([en, de, pl]);
  });

  it("returns plain JSON, safe to store in a CMS or send to the client", () => {
    for (const code of BUILT_IN_LANGUAGES) {
      const texts = getBuiltInTexts(code);
      expect(JSON.parse(JSON.stringify(texts))).toEqual(texts);
    }
  });
});

describe("text override types", () => {
  it("accept what a CMS returns: optional fields that may be null", () => {
    type CmsDocument = {
      banner?: { title?: string | null; description?: string | null } | null;
      dialog?: { itemsLabel?: string | null } | null;
      categories?: Record<string, { title?: string | null } | null> | null;
    };

    // A plain assignment rather than `expectTypeOf().toExtend()`, whose own
    // error types fail on these nullable nested shapes. A mismatch here fails
    // `pnpm typecheck`.
    const document: CmsDocument = { dialog: { itemsLabel: null } };
    const overrides: TextOverrides = document;
    expect(resolveTexts("en", overrides).dialog.itemsLabel).toBe(en.dialog.itemsLabel);
  });
});
