import { de } from "./languages/de";
import { en } from "./languages/en";
import { pl } from "./languages/pl";
import type { DeepPartialNullable, Texts } from "./types";

/** The languages that ship with built-in texts. Anything else gets English. */
export const BUILT_IN_LANGUAGES = ["en", "de", "pl"] as const;

export type BuiltInLanguage = (typeof BUILT_IN_LANGUAGES)[number];

const builtInTexts: Record<BuiltInLanguage, Texts> = {
  de,
  en,
  pl,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function mergeDeep<T extends Record<string, unknown>>(
  target: T,
  source?: DeepPartialNullable<T> | null,
): T {
  if (!source) return target;

  const result: Record<string, unknown> = { ...target };

  Object.entries(source).forEach(([key, value]) => {
    // `null` is how a CMS says "empty", so it keeps the built-in text just
    // like a missing key. An empty string is a deliberate value and wins.
    if (value === undefined || value === null) return;

    const current = result[key];
    if (isRecord(current) && isRecord(value)) {
      result[key] = mergeDeep(current, value as DeepPartialNullable<typeof current>);
      return;
    }

    result[key] = value;
  });

  return result as T;
}

/**
 * The built-in texts for a language code. Matching ignores case, and a
 * region or script suffix falls back to the base language ("pl-PL" and
 * "de_AT" resolve to "pl" and "de"). Unknown languages get English.
 *
 * The result is plain JSON, so it is safe to use on the server, e.g. as the
 * default values of CMS fields.
 */
export function getBuiltInTexts(language: string = "en"): Texts {
  const code = language.toLowerCase();
  const base = code.split(/[-_]/)[0] ?? code;

  return (
    builtInTexts[code as BuiltInLanguage] ?? builtInTexts[base as BuiltInLanguage] ?? en
  );
}

/**
 * Resolves the final texts: built-in texts for the chosen language,
 * merged with any user-provided overrides.
 */
export function resolveTexts(
  language: string = "en",
  texts?: DeepPartialNullable<Texts> | null,
): Texts {
  return mergeDeep(getBuiltInTexts(language), texts);
}
