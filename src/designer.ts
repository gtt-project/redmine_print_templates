import { Designer } from '@pdfme/ui';
import { openDesigner, downloadTemplate, uploadTemplate } from './helper';
import { addFieldToDesigner } from './schemas';

document.addEventListener("DOMContentLoaded", function() {

  let designer: Designer | undefined;

  const htmllang = document.documentElement.lang || 'en';
  const locale = htmllang.split('-')[0]; // Extract the language part

  // Listen for messages from the parent page
  window.addEventListener('message', async function(event) {
    if (event.origin !== window.location.origin) {
      return;
    }

    const { type, data } = event.data;

    switch (type) {
      case 'openDesigner':
        designer = await openDesigner({
          container: document.getElementById('pdfme-container'),
          template: {
            basePdf: data.basePdf,
            schemas: data.schemas,
            sampledata: data.inputs,
          },
          locale: locale
        });
        break;
      case 'addField':
        if (designer) {
          addFieldToDesigner(designer, data);
        }
        break;
      case 'downloadTemplate':
        if (designer) {
          downloadTemplate(designer, data.trackerName);
        }
        break;
      case 'uploadTemplate':
        if (designer) {
          uploadTemplate(designer, data.templateData);
        }
        break;
      // Add other cases as needed
    }
  });
});
