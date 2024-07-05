import { Plugin } from '@pdfme/common';
import { mapImage } from '../map';
import { createPDFRender, createUIRender, createSchemaFunction, ExtendedSchema } from './schemaUtils';

const extendedMap = (
  fieldKeyOptions: { label: string; options: { label: string; value: string }[] }[],
  fieldFormatOptions: { label: string; value: string }[]
) => {
  const component = mapImage();

  const defaultSchema: ExtendedSchema = {
    ...component.propPanel.defaultSchema,
    type: 'extendedMap',
  };

  const schemaFunction = createSchemaFunction(component.propPanel.schema, fieldKeyOptions, fieldFormatOptions);

  const propPanel = {
    defaultSchema,
    schema: schemaFunction,
    widgets: component.propPanel.widgets,
  };

  const extendedSchema: Plugin<ExtendedSchema> = {
    pdf: createPDFRender(component),
    ui: createUIRender(component),
    propPanel,
  };

  return extendedSchema;
};

export { extendedMap };
