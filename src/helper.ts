
import { Template,getDefaultFont } from '@pdfme/common';
import { Designer } from '@pdfme/ui';
import { getPlugins } from './schemas';
import { validateLocale, SupportedLocale } from './locales';

declare const embeddedFonts: any[];

const defaultTemplate: Template = {
  basePdf: { width: 210, height: 297, padding: [0, 0, 0, 0] },
  sampledata: [],
  schemas: [{} as Record<string, any>],
  pdfmeVersion: '1.0.0'
};

interface DesignerOptions {
  container: HTMLElement | null;
  template?: Template;
  locale?: string;
}

function isValidValue<T>(value: T | null | undefined | ''): value is T {
  return value !== undefined && value !== null && value !== '';
}

export function createTemplate(template: Partial<Template> = {}): Template {
  const finalTemplate: Template = {
    basePdf: isValidValue(template.basePdf) ? template.basePdf : defaultTemplate.basePdf,
    sampledata: isValidValue(template.sampledata) ? template.sampledata : defaultTemplate.sampledata,
    schemas: isValidValue(template.schemas) ? template.schemas : defaultTemplate.schemas,
    pdfmeVersion: isValidValue(template.pdfmeVersion) ? template.pdfmeVersion : defaultTemplate.pdfmeVersion
  };
  return finalTemplate;
}

export async function openDesigner({
  container,
  template = defaultTemplate,
  locale = 'en'
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
    plugins: getPlugins(),
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

export function downloadTemplate(designer: Designer, trackerName: string) {
  if (designer) {
    const templateData = designer.getTemplate();
    if (templateData) {
      // Format the filename with the tracker name
      const fileName = `template_${trackerName.toLowerCase().replace(/\s+/g, '_')}`;
      downloadJsonFile(templateData, fileName);
    }
  }
}

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

export function uploadTemplate(designer: Designer, templateData: Template) {
  if (designer) {
    designer.updateTemplate(templateData);
  }
}
