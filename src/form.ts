import { Template, BLANK_PDF } from '@pdfme/common';
import { Form } from '@pdfme/ui';
import { text, image, barcodes } from "@pdfme/schemas";
import { generate } from '@pdfme/generator';

document.addEventListener("DOMContentLoaded", function() {
  const container = document.getElementById('pdfme-container');
  let form: Form | undefined;

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

      case 'generatePdf':
        if (form) {
          const currentInputs = form.getInputs();

          generate({
            template: form.getTemplate(),
            inputs: currentInputs,
            plugins: { text, image, qrcode: barcodes.qrcode },
          }).then((pdf) => {
            const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
            const pdfUrl = URL.createObjectURL(blob);
            window.open(pdfUrl);
          }).catch((error) => {
            console.error('Error generating PDF:', error);
          });
        }
        break;
        // Handle other cases if necessary
    }
  });
});
