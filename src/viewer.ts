import { Form } from '@pdfme/ui';
import { openViewer, generatePdf } from '.';

document.addEventListener("DOMContentLoaded", function() {

  let form: Form | undefined;

  const htmllang = document.documentElement.lang || 'en';
  const locale = htmllang.split('-')[0]; // Extract the language part

  // Listen for messages from the parent page
  window.addEventListener('message', async function(event) {
    if (event.origin !== window.location.origin) {
      return;
    }

    const { type, data } = event.data;

    switch (type) {
      case 'openViewer':
        form = await openViewer({
          container: document.getElementById('pdfme-container'),
          template: {
            basePdf: data.basePdf,
            schemas: data.schemas,
          },
          locale: locale,
          fieldKeyOptions: data.fieldKeyOptions,
          fieldFormatOptions: data.fieldFormatOptions,
        });
        break;

      case 'generatePdf':
        if (form) {
          const options: { [key: string]: any } = {
            note: "This is a note for the PDF", // TBD
            locale: locale,
          };

          generatePdf(form, options);
        }
        break;
      // Add other cases as needed
    }
  });
});
