import { Template, BLANK_PDF } from '@pdfme/common';
import { Form } from '@pdfme/ui';
import { text, image, barcodes } from "@pdfme/schemas";

document.addEventListener("DOMContentLoaded", function() {
  const container = document.getElementById('pdfme-container');
  let form;

  window.addEventListener('message', function(event) {
    if (event.origin !== window.location.origin) {
      return;
    }

    const { type, templateData } = event.data;

    switch (type) {
      case 'loadSelectedTemplate':
        if (container && templateData) {
          // Parse schemas and inputs from JSON strings to JavaScript arrays
          const schemas = JSON.parse(templateData.schemas || '[]');
          const inputs = JSON.parse(templateData.inputs || '[{}]');

          // Use BLANK_PDF as a fallback if basePdf is not provided
          const basePdf = templateData.basepdf || BLANK_PDF;

          // Define the template structure
          const template: Template = {
            basePdf: basePdf,
            schemas: schemas
          };

          // Recreate the Form instance with the new template and inputs
          form = new Form({
            domContainer: container,
            template: template,
            inputs: inputs,
            plugins: { text, image, qrcode: barcodes.qrcode },
          });
        }
        break;
      // Handle other cases if necessary
    }
  });
});
