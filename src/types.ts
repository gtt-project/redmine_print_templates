import { Template } from '@pdfme/common';

export interface PluginOptions {
  fieldKeyOptions: { label: string; options: { label: string; value: string }[] }[];
  fieldFormatOptions: { label: string; value: string }[];
}

export interface DesignerOptions {
  container: HTMLElement | null;
  template?: Template;
  locale?: string;
  fieldKeyOptions?: { label: string; options: { label: string; value: string }[] }[];
  fieldFormatOptions?: { label: string; value: string }[];
}

export const supportedLocales = ['en', 'ja', 'ar', 'th', 'it', 'pl', 'zh', 'ko', 'de', 'es', 'fr'] as const;

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
