import { Designer } from '@pdfme/ui';
import {
  text,
  readOnlyText,
  barcodes,
  image,
  readOnlyImage,
  svg,
  readOnlySvg,
  line,
  tableBeta,
  rectangle,
  ellipse,
} from '@pdfme/schemas';
import { v4 as uuidv4 } from 'uuid';
import { mapIconDataUrl } from './mapIconDataUrl';
import plugins from './plugins';

type FieldType = 'text' | 'image' | 'qrcode';

/**
 * Get the plugins object
 * @returns {Object} - Returns the plugins object
 */
export const getPlugins = () => {
  return {
    Text: text,
    ReadOnlyText: readOnlyText,
    Table: tableBeta,
    Line: line,
    Rectangle: rectangle,
    Ellipse: ellipse,
    Image: image,
    ReadOnlyImage: readOnlyImage,
    SVG: svg,
    ReadOnlySvg: readOnlySvg,
    QR: barcodes.qrcode,
    Code128: barcodes.code128,
    Signature: plugins.signature,
  };
};

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
    height: (fieldData.height !== undefined) ? fieldData.height : defaultFieldData.height,
    alignment: fieldData.alignment || 'left',
    verticalAlignment: fieldData.verticalAlignment || 'middle',
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
