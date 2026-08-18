import type { Locale } from "../localeConfig";
import id from "./id";
import en from "./en";

export type Dictionary = typeof id;

const dictionaries: Record<Locale, Dictionary> = { id, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
