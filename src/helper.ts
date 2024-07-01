import { Template, getDefaultFont } from '@pdfme/common';
import { defaultTemplate, supportedLocales } from './constants';
import type { SupportedLocale } from './types';

declare const embeddedFonts: any[];
declare const pluginSettings: any;

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

/**
 * Checks if a value is valid.
 * @param value - The value to check.
 * @returns Whether the value is valid or not.
 */
function isValidValue<T>(value: T | null | undefined | ''): value is T {
  return value !== undefined && value !== null && value !== '';
}

/**
 * Get available fonts
 * @returns A promise that resolves to the available fonts.
 */
export async function getAvailableFonts(): Promise<Record<string, any>> {
  const availableFonts = getDefaultFont();

  for (const font of embeddedFonts) {
    const response = await fetch(font.url);
    const arrayBuffer = await response.arrayBuffer();

    availableFonts[font.name] = {
      data: arrayBuffer,
      // include fallback and subset options if necessary
    };
  }

  return availableFonts;
}

/**
 * Creates a template object based on the provided partial template.
 * @param template - The partial template object.
 * @returns The final template object.
 */
export function createTemplate(template: Partial<Template> = {}): Template {
  const finalTemplate: Template = {
    basePdf: isValidValue(template.basePdf) ? template.basePdf : defaultTemplate.basePdf,
    schemas: isValidValue(template.schemas) ? template.schemas : defaultTemplate.schemas,
    pdfmeVersion: isValidValue(template.pdfmeVersion) ? template.pdfmeVersion : defaultTemplate.pdfmeVersion
  };
  return finalTemplate;
}

/**
 * Downloads a JSON file containing the template data.
 * @param json - The template data to download.
 * @param title - The title of the file.
 */
export const downloadJsonFile = (json: unknown, title: string) => {
  if (typeof window !== 'undefined') {
    const blob = new Blob([JSON.stringify(json)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
};

/**
 * Retrieves the value from a nested object based on a dot-separated key path.
 * @param obj - The object to retrieve the value from.
 * @param keyPath - The dot-separated key path.
 * @returns The value at the specified key path, or undefined if not found.
 */
export function getNestedValue(obj: any, keyPath: string): any {
  return keyPath.split('.').reduce((acc, key) => {
    if (acc && acc[key] !== undefined) {
      return acc[key];
    } else {
      console.warn(`Key not found: ${keyPath} at ${key}`);
      return pluginSettings.default_placeholder_empty || '';
    }
  }, obj);
}

/**
 * Maps issue data to the template fields.
 * @param issueData - The issue data object.
 * @param inputData - The template object.
 * @returns The mapped inputs object.
 */
export function mapIssueDataToInput(issueData: any, inputData: any) {
  // console.log('Issue Data:', issueData);
  // console.log('Input Data:', inputData);
  const mappedInputs: Record<string, any>[] = [];

  inputData.schemas.forEach((page: any, pageIndex: number) => {
    // console.log('Page', pageIndex, page);
    const mappedPage: Record<string, any> = {};

    Object.keys(page).forEach((fieldKey: string) => {
      // console.log('Field:', fieldKey, field);
      const field = page[fieldKey];

      if (field.field_key) {
        const value = getNestedValue(issueData.issue, field.field_key);

        if (value !== undefined) {
          mappedPage[fieldKey] = value;
        }
      }
    });

    mappedInputs.push(mappedPage);
  });

  // Ensure the mappedInputs array contains only one object with all the fields
  return [Object.assign({}, ...mappedInputs)];
}

/**
 * Maps issue data to the template fields.
 * @param issueData - The issue data object.
 * @param template - The template object.
 * @returns The mapped template object.
 */
export function mapIssueDataToTemplate(issueData: any, template: Template) {
  const updatedSchemas = template.schemas.map((page) => {
    const updatedPage = { ...page };
    Object.keys(updatedPage).forEach((fieldKey) => {
      const field = updatedPage[fieldKey];
      if (field.field_key) {
        const value = getNestedValue(issueData.issue, field.field_key as string);
        if (value !== undefined) {
          updatedPage[fieldKey] = {
            ...field,
            content: value
          };
        }
      }
    });
    return updatedPage;
  });

  return {
    ...template,
    schemas: updatedSchemas
  };
}
