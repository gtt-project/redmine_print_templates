import { Template, BLANK_PDF } from '@pdfme/common';
import { Designer } from '@pdfme/ui';
import { text, image, barcodes } from "@pdfme/schemas";
import { v4 as uuidv4 } from 'uuid';

export function initializeOrUpdateDesigner(designer: Designer | undefined, container: HTMLElement | null, basePdf: string, schemas: any[], inputs: any[]): Designer | undefined {
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

  // Return the Designer instance
  return designer;
}

export function addFieldToDesigner(designer: Designer, fieldData: any) {
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
  const newSchemaKey = `$(${fieldData.identifier})#${uuidv4().substring(0, 4)}`;

  // Add the new schema to the first object in the schemas array
  updatedSchemas[0][newSchemaKey] = newSchema;

  // Update the Designer instance with the new template
  designer.updateTemplate({
    ...currentTemplate,
    schemas: updatedSchemas
  });
}

export function downloadTemplate(designer: Designer, trackerName: string) {
  if (designer) {
    const templateData = designer.getTemplate();
    if (templateData) {
      // Format the filename with the tracker name
      const fileName = `template_${trackerName.toLowerCase().replace(/\s+/g, '_')}`;
      downloadJsonFile(templateData, fileName);
    }
  }
}

export function downloadJsonFile(data: any, fileName: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function loadTemplate(designer: Designer, templateData: Template) {
  if (designer) {
    designer.updateTemplate(templateData);
  }
}
