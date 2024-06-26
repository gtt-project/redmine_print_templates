import { Template, getDefaultFont,PDFME_VERSION } from '@pdfme/common';
import { Designer } from '@pdfme/ui';
import { getPlugins } from './schemas';
import { validateLocale } from './types';

import type { DesignerOptions, SupportedLocale } from './types';

declare const embeddedFonts: any[];

const defaultTemplate: Template = {
  basePdf: { width: 210, height: 297, padding: [0, 0, 0, 0] },
  sampledata: [],
  schemas: [{} as Record<string, any>],
  pdfmeVersion: PDFME_VERSION
};

/**
 * Checks if a value is valid.
 * @param value - The value to check.
 * @returns Whether the value is valid or not.
 */
function isValidValue<T>(value: T | null | undefined | ''): value is T {
  return value !== undefined && value !== null && value !== '';
}

/**
 * Creates a template object based on the provided partial template.
 * @param template - The partial template object.
 * @returns The final template object.
 */
function createTemplate(template: Partial<Template> = {}): Template {
  const finalTemplate: Template = {
    basePdf: isValidValue(template.basePdf) ? template.basePdf : defaultTemplate.basePdf,
    sampledata: isValidValue(template.sampledata) ? template.sampledata : defaultTemplate.sampledata,
    schemas: isValidValue(template.schemas) ? template.schemas : defaultTemplate.schemas,
    pdfmeVersion: isValidValue(template.pdfmeVersion) ? template.pdfmeVersion : defaultTemplate.pdfmeVersion
  };
  return finalTemplate;
}

/**
 * Opens the PDFMe Designer in the specified container.
 * @param options - The options for opening the Designer.
 * @returns A promise that resolves to the Designer instance, or undefined if it fails to open.
 */
export async function openDesigner({
  container,
  template = defaultTemplate,
  locale = 'en',
  fieldKeyOptions = [],
  fieldFormatOptions = [],
}: DesignerOptions): Promise<Designer | undefined> {

  // Set the default fonts
  const availableFonts = getDefaultFont();

  for (const font of embeddedFonts) {
    const response = await fetch(font.url);
    const arrayBuffer = await response.arrayBuffer();

    availableFonts[font.name] = {
      data: arrayBuffer,
      // include fallback and subset options if necessary
    };
  }

  const validatedLocale: SupportedLocale = validateLocale(locale);

  let designer = new Designer({
    domContainer: container,
    template: createTemplate(template) as Template | any,
    plugins: getPlugins({ fieldKeyOptions, fieldFormatOptions }),
    options: {
      lang: validatedLocale,
      theme: {
        token: {
          colorPrimary: '#f1515c'
        },
      },
      font: availableFonts
    },
  });

  designer.onChangeTemplate((updatedTemplate: Template) => {
    window.parent.postMessage({
      type: 'updateData',
      data: {
        schemas: updatedTemplate.schemas,
        inputs: updatedTemplate.sampledata || [{}]
      }
    }, window.location.origin);
  });

  // Return the Designer instance
  return designer;
}

/**
 * Downloads a JSON file containing the template data.
 * @param json - The template data to download.
 * @param title - The title of the file.
 */
const downloadJsonFile = (json: unknown, title: string) => {
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
 * Downloads the current template as a JSON file.
 * @param designer - The Designer instance.
 * @param trackerName - The name of the tracker.
 */
export function downloadTemplate(designer: Designer, trackerName: string) {
  if (designer) {
    const templateData = designer.getTemplate();
    if (templateData) {
      const fileName = `template_${trackerName.toLowerCase().replace(/\s+/g, '_')}`;
      downloadJsonFile(templateData, fileName);
    }
  }
}

/**
 * Updates the template of the Designer instance.
 * @param designer - The Designer instance.
 * @param templateData - The new template data.
 */
export function uploadTemplate(designer: Designer, templateData: Template) {
  if (designer) {
    designer.updateTemplate(templateData);
  }
}
