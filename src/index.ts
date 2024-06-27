import { Template, getDefaultFont, PDFME_VERSION } from '@pdfme/common';
import { Designer, Form, Viewer } from '@pdfme/ui';
import { generate } from '@pdfme/generator';

import { getPlugins } from './schemas';
import { validateLocale } from './types';

import type { DesignerOptions, FormOptions, GeneratorOptions } from './types';

declare const issueData: any;
declare const embeddedFonts: any[];
declare const pluginSettings: any;

const themeSettings = {
  token: {
    colorPrimary: '#f1515c'
  },
};

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

  let designer = new Designer({
    domContainer: container,
    template: createTemplate(template) as Template | any,
    plugins: getPlugins({ fieldKeyOptions, fieldFormatOptions }),
    options: {
      lang: validateLocale(locale),
      theme: themeSettings,
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
  editing = false,
  fieldKeyOptions = [],
  fieldFormatOptions = [],
}: FormOptions): Promise<Form | Viewer | undefined> {

  const templateData = createTemplate(template) as Template | any;
  const pluginData = getPlugins({ fieldKeyOptions, fieldFormatOptions });
  const inputData = mapIssueDataToTemplate(issueData, templateData) as Record<string, any>[]  || [{}];

  let instance;

  if (editing) {
    instance = new Form({
      domContainer: container,
      template: templateData,
      plugins: pluginData,
      inputs: inputData,
      options: {
        lang: validateLocale(locale),
        theme: themeSettings,
        font: await getAvailableFonts()
      },
    });
  } else {
    instance = new Viewer({
      domContainer: container,
      template: templateData,
      plugins: pluginData,
      inputs: inputData,
      options: {
        lang: validateLocale(locale),
        theme: themeSettings,
        font: await getAvailableFonts()
      },
    });
  }

  // Return the Viewer or Form instance
  return instance;
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
  instance,
  options = {},
  fieldKeyOptions = [],
  fieldFormatOptions = [],
  download = false,
}: GeneratorOptions & { download?: boolean }): Promise<Blob | undefined> {

  const pdf = await generate({
    template: instance.getTemplate() as Template | any,
    inputs: instance.getInputs(),
    plugins: getPlugins({ fieldKeyOptions, fieldFormatOptions }),
    options: {
      font: await getAvailableFonts(),
      author: pluginSettings.default_pdf_author || '',
      creator: pluginSettings.default_pdf_creator || '',
      keywords: [],
      // language: 'en-US',
      producer: pluginSettings.default_pdf_producer || '',
      subject: `[${issueData.issue.tracker.name}] ${issueData.issue.project.name}`,
      title: `[#${issueData.issue.id}] ${issueData.issue.subject}`,
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

/**
 * Retrieves the value from a nested object based on a dot-separated key path.
 * @param obj - The object to retrieve the value from.
 * @param keyPath - The dot-separated key path.
 * @returns The value at the specified key path, or undefined if not found.
 */
function getNestedValue(obj: any, keyPath: string): any {
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
 * @param template - The template object.
 * @returns The mapped inputs object.
 */
function mapIssueDataToTemplate(issueData: any, template: Template) {
  // console.log('Issue Data:', issueData);
  // console.log('Template:', template);
  const mappedInputs: Record<string, any>[] = [];

  template.schemas.forEach((page: any, pageIndex: number) => {
    // console.log('Page', pageIndex, page);
    const mappedPage: Record<string, any> = {};

    Object.keys(page).forEach((fieldKey: string) => {
      // console.log('Field:', fieldKey, field);
      const field = page[fieldKey];

      if (field.extended) {
        // console.log('Extended Field:', field.extended);
        const { field_key } = field.extended;
        const value = getNestedValue(issueData.issue, field_key);

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

