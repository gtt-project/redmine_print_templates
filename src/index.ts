import { Template } from '@pdfme/common';
import { Designer, Form, Viewer } from '@pdfme/ui';
import { generate } from '@pdfme/generator';

import { defaultTemplate, themeSettings } from './constants';
import { createTemplate, downloadJsonFile, getAvailableFonts, mapIssueDataToInput, mapIssueDataToTemplate, validateLocale } from './helper';
import { getPlugins } from './schemas';

import type { DesignerOptions, FormOptions, GeneratorOptions } from './types';

declare const issueData: any;
declare const pluginSettings: any;

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
  const inputData = mapIssueDataToInput(issueData, templateData) as Record<string, any>[]  || [{}];

  // Workaround for read-only mode, which does not accept inputs
  const updatedTemplateData = mapIssueDataToTemplate(issueData, templateData) as Template | any;

  let instance;

  if (editing) {
    instance = new Form({
      domContainer: container,
      template: updatedTemplateData,
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
      template: updatedTemplateData,
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
