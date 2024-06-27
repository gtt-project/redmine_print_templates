import { Template, getDefaultFont, PDFME_VERSION } from '@pdfme/common';
import { Designer, Form, Viewer } from '@pdfme/ui';
import { generate } from '@pdfme/generator';

import { getPlugins } from './schemas';
import { validateLocale } from './types';

import type { DesignerOptions, FormOptions, ViewerOptions, GeneratorOptions, SupportedLocale } from './types';

declare const issueData: any;
declare const embeddedFonts: any[];
declare const pluginSettings: any;

const defaultTemplate: Template = {
  basePdf: { width: 210, height: 297, padding: [0, 0, 0, 0] },
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
 * Get available fonts
 * @returns A promise that resolves to the available fonts.
 */
async function getAvailableFonts(): Promise<Record<string, any>> {
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
function createTemplate(template: Partial<Template> = {}): Template {
  const finalTemplate: Template = {
    basePdf: isValidValue(template.basePdf) ? template.basePdf : defaultTemplate.basePdf,
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
      font: await getAvailableFonts()
    },
  });

  designer.onChangeTemplate((updatedTemplate: Template) => {
    window.parent.postMessage({
      type: 'updateData',
      data: {
        schemas: updatedTemplate.schemas,
      }
    }, window.location.origin);
  });

  // Return the Designer instance
  return designer;
}

/**
 * Opens the PDFMe Viewer in the specified container.
 * @param options - The options for opening the Viewer.
 * @returns A promise that resolves to the Viewer instance, or undefined if it fails to open.
 */
export async function openViewer({
  container,
  template = defaultTemplate,
  locale = 'en',
  fieldKeyOptions = [],
  fieldFormatOptions = [],
}: FormOptions): Promise<Form | undefined> {

    const validatedLocale: SupportedLocale = validateLocale(locale);
    // const inputs = [mapIssueDataToTemplate(issueData, schemas)] || [{}];

    let form = new Form({
      domContainer: container,
      template: createTemplate(template) as Template | any,
      plugins: getPlugins({ fieldKeyOptions, fieldFormatOptions }),
      inputs: [{}],
      options: {
        lang: validatedLocale,
        theme: {
          token: {
            colorPrimary: '#f1515c'
          },
        },
        font: await getAvailableFonts()
      },
    });

    // Return the Viewer instance
    return form;
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

/**
 * Generates a PDF file based on the current template and inputs.
 * @param form - The Form instance.
 * @param options - The options for generating the PDF.
 * @param fieldKeyOptions - The field key options.
 * @param fieldFormatOptions - The field format options.
 * @param download - Whether to download the PDF file or not.
 * @returns A promise that resolves to the generated PDF file.
 */
export async function generatePdf({
  form,
  options = {},
  fieldKeyOptions = [],
  fieldFormatOptions = [],
  download = false,
}: GeneratorOptions & { download?: boolean }): Promise<Blob | undefined> {

  const pdf = await generate({
    template: form.getTemplate() as Template | any,
    inputs: form.getInputs(),
    plugins: getPlugins({ fieldKeyOptions, fieldFormatOptions }),
    options: {
      font: await getAvailableFonts(),
      author: pluginSettings.default_pdf_author || '',
      creator: pluginSettings.default_pdf_creator || '',
      keywords: [],
      language: 'en-US',
      producer: pluginSettings.default_pdf_producer || '',
      subject: 'Redmine Issue Report',
      title: `Issue #${issueData.issue.id}: Feature Implementation`,
      ...options,
    },
  });

  const blob = new Blob([pdf.buffer], { type: 'application/pdf' });

  // Determine the action based on the 'download' parameter
  if (download) {
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '');
    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = `${timestamp}_issue_${issueData.issue.id}.pdf`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(downloadLink.href);
  } else {
    window.open(URL.createObjectURL(blob));
  }

  return blob;
}

// function mapIssueDataToTemplate(issueData: any, template: any) {
//   const mappedInputs: any = {};

//   template.forEach((page: any) => {
//     Object.keys(page).forEach(key => {
//       const match = key.match(/\$\(([^#]+)#([^)]+)\)/);
//       if (match && match.length >= 3) {
//         const type = match[1];
//         const field = match[2];
//         let value = '';

//         switch (type) {
//           case 'standard':
//             const fields = field.split('.');
//             value = fields.reduce((acc, curr) => acc && acc[curr], issueData.issue);
//             break;
//           case 'custom':
//             const customField = issueData.issue.custom_fields.find((f: any) => f.name === field);
//             value = customField ? customField.value : '';
//             break;
//           case 'special':
//             // Handle special cases here
//             break;
//           default:
//             // Handle unknown type
//             break;
//         }

//         if (value !== undefined) {
//           mappedInputs[key] = String(value);
//         }
//       }
//     });
//   });

//   return mappedInputs;
// }
