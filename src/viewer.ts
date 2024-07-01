import { Form, Viewer } from '@pdfme/ui';
import { openViewer, generatePdf } from '.';

declare const toggle_editing: boolean;

document.addEventListener("DOMContentLoaded", function() {

  let instance: Form | Viewer | undefined;

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
        instance = await openViewer({
          container: document.getElementById('pdfme-container'),
          template: {
            basePdf: data.basePdf,
            schemas: data.schemas,
          },
          locale: locale,
          editing: toggle_editing || false,
          fieldKeyOptions: data.fieldKeyOptions,
          fieldFormatOptions: data.fieldFormatOptions,
        });
        break;

      case 'generatePdf':
        if (instance) {
          const options = data || {};
          options.language = htmllang;

          // Determine whether to download the PDF or open in the browser
          const download = true;

          generatePdf({
            instance: instance,
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
