import { Template, BLANK_PDF } from '@pdfme/common';
import { Designer } from '@pdfme/ui';
import { text, image, barcodes } from "@pdfme/schemas";

document.addEventListener("DOMContentLoaded", function() {
  const container = document.getElementById('pdfme-container');
  let designer: Designer | undefined;

  // Function to initialize or update the designer
  function initializeOrUpdateDesigner(basePdf: string, schemas: any[], inputs: any[]) {

    const template: Template = {
      basePdf: basePdf || BLANK_PDF,
      schemas: schemas || [],
      sampledata: inputs || [{}],
    };

    if (!designer && container) {
      designer = new Designer({
        domContainer: container,
        template: template,
        plugins: { text, image, qrcode: barcodes.qrcode },
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
  }

  // Listen for messages from the parent page
  window.addEventListener('message', function(event) {
    if (event.origin !== window.location.origin) {
      return;
    }

    if (event.data.type === 'initialData') {
      let { basePdf, schemas, inputs } = event.data.data;
      const parsedSchemas = schemas ? JSON.parse(schemas) : [];
      const parsedInputs = inputs ? JSON.parse(inputs) : [{}];

      // Check if basePdf is a properly formatted data URL or empty
      if (basePdf && !basePdf.startsWith('data:application/pdf;base64,')) {
        console.error('Invalid basePdf data URL');
        // Use a default value or fallback
        basePdf = BLANK_PDF;
      }

      // Use basePdf here
      initializeOrUpdateDesigner(basePdf, parsedSchemas, parsedInputs);
    }
  });
});
