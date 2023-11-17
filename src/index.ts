import { Template, BLANK_PDF } from '@pdfme/common';
import { Designer } from '@pdfme/ui';
import { text, image, barcodes } from "@pdfme/schemas";
import { v4 as uuidv4 } from 'uuid';

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

  function addFieldToDesigner(fieldData: any) {
    // Fetch the current template state
    const currentTemplate = designer.getTemplate();

    // Create a deep clone of the current schemas to avoid direct mutation
    const updatedSchemas = JSON.parse(JSON.stringify(currentTemplate.schemas));

    // Ensure fieldData contains all required properties
    const defaultFieldData = {
      type: "text", // Default type
      x: 25,       // Default X-coordinate
      y: 30,       // Default Y-coordinate
      width: 80,   // Default width
      height: 10   // Default height
    };

    // Use fieldData properties or defaults
    const newSchema = {
      type: fieldData.type || defaultFieldData.type,
      position: {
        x: fieldData.x || defaultFieldData.x,
        y: fieldData.y || defaultFieldData.y
      },
      width: fieldData.width || defaultFieldData.width,
      height: fieldData.height || defaultFieldData.height
      // Add other properties if needed
    };

    // Check if the first object in the schemas array exists, if not create it
    if (!updatedSchemas[0]) {
      updatedSchemas[0] = {};
    }

    // Generate a unique key for the new schema with a 4-digit random string
    const newSchemaKey = `${fieldData.identifier}.${uuidv4().substring(0, 4)}`;

    // Add the new schema to the first object in the schemas array
    updatedSchemas[0][newSchemaKey] = newSchema;

    // Update the Designer instance with the new template
    designer.updateTemplate({
      ...currentTemplate,
      schemas: updatedSchemas
    });
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

    if (event.data.type === 'addField') {
      addFieldToDesigner(event.data.data);
    }
  });
});
