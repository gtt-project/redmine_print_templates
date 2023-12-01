import { Template, BLANK_PDF, getDefaultFont } from '@pdfme/common';
import { Form } from '@pdfme/ui';
import { text, image, barcodes } from "@pdfme/schemas";
import { generate } from '@pdfme/generator';

interface FontData {
  name: string;
  url: string;
}

declare const embeddedFonts: FontData[];
declare const issueData: any;

const urlParams = new URLSearchParams(window.location.search);
const issueId = urlParams.get('issue_id');

document.addEventListener("DOMContentLoaded", function() {
  const container = document.getElementById('pdfme-container');
  let form: Form | undefined;

  window.addEventListener('message', async function(event) {
    if (event.origin !== window.location.origin) {
      return;
    }

    const { type, templateData } = event.data;

    switch (type) {
      case 'loadSelectedTemplate':
        if (container && templateData) {
          // Use the embedded issue data directly
          console.log('Issue data:', issueData);

          // Process issue data here and modify templateData.inputs as needed
          // ...

          // Parse schemas and inputs from JSON strings to JavaScript arrays
          const schemas = JSON.parse(templateData.schemas || '[]');
          const inputs = JSON.parse(templateData.inputs || '[{}]');

          console.log('Schemas:', schemas);
          console.log('Inputs:', inputs);

          // Use BLANK_PDF as a fallback if basePdf is not provided
          const basePdf = templateData.basepdf || BLANK_PDF;

          // Define the template structure
          const template: Template = {
            basePdf: basePdf,
            schemas: schemas
          };

          async function initializeForm() {
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

            // Recreate the Form instance with the new template and inputs
            form = new Form({
              domContainer: container,
              template: template,
              inputs: inputs,
              plugins: { text, image, qrcode: barcodes.qrcode },
              options: {
                font: availableFonts,
              },
            });
          }

          initializeForm();
        }
        break;

      case 'generatePdf':
        if (form) {
          const currentInputs = form.getInputs();

          async function initializeGenerator() {
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

            generate({
              template: form.getTemplate(),
              inputs: currentInputs,
              plugins: { text, image, qrcode: barcodes.qrcode },
              options: { font: availableFonts },
            }).then((pdf) => {
              const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
              const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '');

               // Create and trigger download link
              const downloadLink = document.createElement("a");
              downloadLink.href = URL.createObjectURL(blob);
              downloadLink.download = `${timestamp}_issue_${issueId}.pdf`;
              document.body.appendChild(downloadLink);
              downloadLink.click();
              document.body.removeChild(downloadLink);
              URL.revokeObjectURL(downloadLink.href);
            }).catch((error) => {
              console.error('Error generating PDF:', error);
            });
          }

          initializeGenerator();
        }
        break;
        // Handle other cases if necessary
    }
  });
});
