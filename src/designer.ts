import { Template, BLANK_PDF } from '@pdfme/common';
import { Designer } from '@pdfme/ui';
import { text, image, barcodes } from "@pdfme/schemas";
import { initializeOrUpdateDesigner, addFieldToDesigner, downloadTemplate, downloadJsonFile, loadTemplate } from './designerUtils';

document.addEventListener("DOMContentLoaded", function() {
  const container = document.getElementById('pdfme-container');
  let designer: Designer | undefined;

  if (!designer && container) {
    designer = new Designer({
      domContainer: container,
      template: { basePdf: BLANK_PDF, schemas: [], sampledata: [{}] },
      plugins: { text, image, qrcode: barcodes.qrcode },
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
