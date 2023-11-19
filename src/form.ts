import { Template, BLANK_PDF } from '@pdfme/common';
import { Form } from '@pdfme/ui';
import { text, image, barcodes } from "@pdfme/schemas";
import { v4 as uuidv4 } from 'uuid';

document.addEventListener("DOMContentLoaded", function() {
  const container = document.getElementById('pdfme-container');
  let form: Form | undefined;

  if (!form && container) {
    form = new Form({
      domContainer: container,
      template: { basePdf: BLANK_PDF, schemas: [] },
      inputs: [{}]
    });
  }

  // Function to update the Form instance with a new template
  // function updateForm(template: Template, inputs: any[]) {
  //   if (form) {
  //     form.updateTemplate({ ...template });
  //   }
  // }

  // Listen for messages from the parent page
  window.addEventListener('message', function(event) {
    if (event.origin !== window.location.origin) {
      return;
    }

    const { type, data } = event.data;

    switch (type) {
      case 'loadSelectedTemplate':
        // You will need to fetch the template data using the templateId
        // For now, let's assume `fetchTemplateById` is a function that does this
        // fetchTemplateById(data.templateId).then(templateData => {
        //   updateForm(templateData.template, templateData.inputs);
        // });
        break;
      // Add other cases as needed
    }
  });

  // Function to fetch template data by ID (you'll need to implement this)
  // async function fetchTemplateById(templateId: string): Promise<{ template: Template, inputs: any[] }> {
  //   // Fetch the template and inputs data from your backend
  //   // Example:
  //   // const response = await fetch(`/api/templates/${templateId}`);
  //   // const data = await response.json();
  //   // return data;
  // }
});
