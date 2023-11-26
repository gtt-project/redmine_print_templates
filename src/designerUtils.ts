import { Template, BLANK_PDF } from '@pdfme/common';
import { Designer } from '@pdfme/ui';
import { text, image, barcodes } from "@pdfme/schemas";
import { v4 as uuidv4 } from 'uuid';

import { mapIconDataUrl } from './mapIconDataUrl';
type FieldType = 'text' | 'image' | 'qrcode';

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

  const fieldType: FieldType = (fieldData.format && ['text', 'image', 'qrcode'].includes(fieldData.format)) ? fieldData.format as FieldType : 'text';
  const defaultFieldData = getDefaultFieldData(fieldType);

  const newSchema = {
    type: fieldType,
    position: {
      x: (fieldData.x !== undefined) ? fieldData.x : defaultFieldData.x,
      y: (fieldData.y !== undefined) ? fieldData.y : defaultFieldData.y
    },
    width: (fieldData.width !== undefined) ? fieldData.width : defaultFieldData.width,
    height: (fieldData.height !== undefined) ? fieldData.height : defaultFieldData.height
  };

  // Generate a unique key for the new schema
  const newSchemaKey = `$(${fieldData.identifier})#${uuidv4().substring(0, 4)}`;

  // Generate a value for the sampledata without the UUID
  let sampleDataValue: string;
  if (fieldType === 'image') {
    sampleDataValue = mapIconDataUrl;
  } else if (fieldType === 'qrcode') {
    sampleDataValue = window.location.host;
  } else {
    // For other types, use the standard sample data value
    sampleDataValue = `$(${fieldData.identifier})`;
  }

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

function getDefaultFieldData(type: FieldType) {
  const defaults: Record<FieldType, { width: number; height: number; x: number; y: number }> = {
    text: { width: 80, height: 10, x: 0, y: 0 },
    image: { width: 40, height: 40, x: 0, y: 0 },
    qrcode: { width: 30, height: 30, x: 0, y: 0 }
  };

  return defaults[type] || defaults['text'];
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
