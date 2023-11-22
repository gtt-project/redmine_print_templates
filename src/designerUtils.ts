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

  // Create a deep clone of the current schemas and sampledata to avoid direct mutation
  const updatedSchemas = JSON.parse(JSON.stringify(currentTemplate.schemas));
  const updatedSampledata = JSON.parse(JSON.stringify(currentTemplate.sampledata));

  // Define default properties for the new field
  const defaultFieldData = {
    type: "text",
    x: 0,
    y: 0,
    width: 80,
    height: 10
  };

  // Create the new schema
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

  // Generate a unique key for the new schema
  const newSchemaKey = `$(${fieldData.identifier})#${uuidv4().substring(0, 4)}`;

  // Generate a value for the sampledata without the UUID
  const sampleDataValue = `$(${fieldData.identifier})`;

  // Add the new schema to the updatedSchemas
  if (!updatedSchemas[0]) {
    updatedSchemas[0] = {};
  }
  updatedSchemas[0][newSchemaKey] = newSchema;

  // Add an entry for the new field in the sampledata
  if (updatedSampledata.length === 0) {
    updatedSampledata.push({});
  }
  updatedSampledata[0][newSchemaKey] = sampleDataValue; // Set default value for the new field

  // Update the Designer instance with the new template
  designer.updateTemplate({
    ...currentTemplate,
    schemas: updatedSchemas,
    sampledata: updatedSampledata
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
