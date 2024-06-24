import { Template, BLANK_PDF, getDefaultFont } from '@pdfme/common';
import { Designer } from '@pdfme/ui';

import { initializeOrUpdateDesigner, downloadTemplate, loadTemplate } from './helper';
import { validateLocale, SupportedLocale } from './locales';
import { addFieldToDesigner, getPlugins } from './schemas';

interface FontData {
  name: string;
  url: string;
}

declare const embeddedFonts: FontData[];

document.addEventListener("DOMContentLoaded", function() {
  const container = document.getElementById('pdfme-container');
  let designer: Designer | undefined;

  if (!designer && container) {
    const htmlLang = document.documentElement.lang || 'en';
    const locale = htmlLang.split('-')[0]; // Extract the language part
    const validatedLocale: SupportedLocale = validateLocale(locale);

    async function initializeDesigner() {
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

      designer = new Designer({
        domContainer: container,
        template: { basePdf: BLANK_PDF, schemas: [], sampledata: [{}] },
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
    }

    initializeDesigner();
  }

  // Listen for messages from the parent page
  window.addEventListener('message', function(event) {
    if (event.origin !== window.location.origin) {
      return;
    }

    const { type, data } = event.data;

    switch (type) {
      case 'initialData':
        const { basePdf, schemas, inputs } = data;
        designer = initializeOrUpdateDesigner(designer, container, basePdf, schemas, inputs);
        break;
      case 'addField':
        addFieldToDesigner(designer, data);
        break;
      case 'triggerDownloadTemplate':
        downloadTemplate(designer, data.trackerName);
        break;
      case 'loadTemplate':
        loadTemplate(designer, data.templateData);
        break;
      // Add other cases as needed
    }
  });
});
