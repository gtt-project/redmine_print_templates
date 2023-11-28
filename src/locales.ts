export const supportedLocales = ['en', 'ja', 'ar', 'th', 'it', 'pl'] as const;

// This type will be "en" | "ja" | "ar" | "th" | "it" | "pl"
export type SupportedLocale = typeof supportedLocales[number];

export function validateLocale(locale: string): SupportedLocale {
  return supportedLocales.includes(locale as SupportedLocale) ? locale as SupportedLocale : 'en';
}
