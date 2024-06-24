export const supportedLocales = ['en', 'ja', 'ar', 'th', 'it', 'pl', 'zh', 'ko', 'de', 'es', 'fr'] as const;

// This type will be "en" | "ja" | "ar" | "th" | "it" | "pl" | "zh" | "ko" | "de" | "es" | "fr"
export type SupportedLocale = typeof supportedLocales[number];

/**
 * Validates the given locale and returns a supported locale.
 * If the given locale is not supported, 'en' (English) is returned as the default locale.
 *
 * @param locale - The locale to validate.
 * @returns The validated supported locale.
 */
export function validateLocale(locale: string): SupportedLocale {
  return supportedLocales.includes(locale as SupportedLocale) ? locale as SupportedLocale : 'en';
}
