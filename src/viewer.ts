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
          const options = data || {};
          options.language = htmllang;

          // Determine whether to download the PDF or open in the browser
          const download = false;

          generatePdf({
            form: form,
            options: options,
            fieldKeyOptions: data.fieldKeyOptions,
            fieldFormatOptions: data.fieldFormatOptions,
            download: download
          }).catch((error) => {
            console.error('Error generating PDF:', error);
          });
        }
        break;
      // Add other cases as needed
    }
  });
});
