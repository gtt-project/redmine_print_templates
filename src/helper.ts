
import { Template, Font, checkTemplate, getInputFromTemplate, BLANK_PDF } from '@pdfme/common';
import { Form, Viewer, Designer } from '@pdfme/ui';
import { generate } from '@pdfme/generator';
import { getPlugins } from './schemas';

export function initializeOrUpdateDesigner(designer: Designer | undefined, container: HTMLElement | null, basePdf: string, schemas: any[], inputs: any[]): Designer | undefined {
  const template: Template = {
    basePdf: basePdf || BLANK_PDF,
    schemas: schemas || [],
    sampledata: inputs || [{}],
  };

  if (!designer && container) {
    designer = new Designer({
      domContainer: container,
      template: template as Template | any,
      plugins: getPlugins(),
    });

    designer.onChangeTemplate((updatedTemplate) => {
      window.parent.postMessage({
        type: 'updateData',
        data: {
          schemas: updatedTemplate.schemas,
          inputs: updatedTemplate.sampledata || [{}]
        }
      }, window.location.origin);
    });
  } else {
    designer?.updateTemplate(template);
  }

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

// export function downloadJsonFile(data: any, fileName: string) {
//   const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement('a');
//   a.href = url;
//   a.download = `${fileName}.json`;
//   document.body.appendChild(a);
//   a.click();
//   document.body.removeChild(a);
//   URL.revokeObjectURL(url);
// }

export function loadTemplate(designer: Designer, templateData: Template) {
  if (designer) {
    designer.updateTemplate(templateData);
  }
}

/**
 * Get fonts object list
 * @returns {Promise} - Returns the fonts data
 */
const fontObjList = [
  {
    fallback: true,
    label: 'NotoSerifJP-Regular',
    url: '/fonts/NotoSerifJP-Regular.otf',
  },
  {
    fallback: false,
    label: 'NotoSansJP-Regular',
    url: '/fonts/NotoSansJP-Regular.otf',
  },
];

/**
 * Get fonts data
 * @returns {Promise} - Returns the fonts data
 */
export const getFontsData = async () => {
  const fontDataList = await Promise.all(
    fontObjList.map(async (font) => ({
      ...font,
      data: await fetch(font.url).then((res) => res.arrayBuffer()),
    }))
  );

  return fontDataList.reduce((acc, font) => ({ ...acc, [font.label]: font }), {} as Font);
};

/**
 * Read file and return the content
 * @param file
 * @param type
 * @returns
 */
export const readFile = (file: File | null, type: 'text' | 'dataURL' | 'arrayBuffer') => {
  return new Promise<string | ArrayBuffer>((r) => {
    const fileReader = new FileReader();
    fileReader.addEventListener('load', (e) => {
      if (e && e.target && e.target.result && file !== null) {
        r(e.target.result);
      }
    });
    if (file !== null) {
      if (type === 'text') {
        fileReader.readAsText(file);
      } else if (type === 'dataURL') {
        fileReader.readAsDataURL(file);
      } else if (type === 'arrayBuffer') {
        fileReader.readAsArrayBuffer(file);
      }
    }
  });
};

/**
 * Clone object deeply
 * @param obj
 * @returns
 */
export const cloneDeep = (obj: unknown) => JSON.parse(JSON.stringify(obj));

/**
 * Get template from json file
 * @param file
 * @returns
 */
const getTemplateFromJsonFile = (file: File) => {
  return readFile(file, 'text').then((jsonStr) => {
    const template: Template = JSON.parse(jsonStr as string);
    checkTemplate(template);
    return template;
  });
};

/**
 * Download template as json file
 * @param json
 * @param title
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
 * Generate PDF
 * @param currentRef
 * @returns
 */
export const generatePDF = async (currentRef: Designer | Form | Viewer | null) => {
  if (!currentRef) return;
  const template = currentRef.getTemplate() as any;
  const inputs =
    typeof (currentRef as Viewer | Form).getInputs === 'function'
      ? (currentRef as Viewer | Form).getInputs()
      : getInputFromTemplate(template);
  const font = await getFontsData();

  const pdf = await generate({
    template,
    inputs,
    options: { font, title: 'pdfme' },
    plugins: getPlugins(),
  });

  const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
  window.open(URL.createObjectURL(blob));
};

export const isJsonString = (str: string) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

const getBlankTemplate = (): Template => ({
  schemas: [{} as Record<string, any>], // Using Record<string, any> for a less strict type
  basePdf: { width: 210, height: 297, padding: [0, 0, 0, 0] },
  pdfmeVersion: '1.0.0' // Add this if required by the Template type
});

export const getTemplatePresets = (): {
  key: string;
  label: string;
  template: () => Template;
}[] => [
  { key: 'blank', label: 'Blank', template: getBlankTemplate },
  { key: 'custom', label: 'Custom', template: getBlankTemplate },
];

export const getTemplateByPreset = (templatePreset: string): Template => {
  const templatePresets = getTemplatePresets();
  const preset = templatePresets.find((preset) => preset.key === templatePreset);
  return preset ? preset.template() : templatePresets[0].template();
};
