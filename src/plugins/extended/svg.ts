import type { Plugin } from '@pdfme/common';
import { svg as component } from '@pdfme/schemas';
import { createPDFRender, createUIRender, createSchemaFunction, ExtendedSchema } from './schemaUtils';

const createExtendedSvgSchema = (
  fieldKeyOptions: { label: string; options: { label: string; value: string }[] }[],
  fieldFormatOptions: { label: string; value: string }[]
) => {
  const defaultSchema: ExtendedSchema = {
    ...component.propPanel.defaultSchema,
    type: 'extendedSvg',
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

export { createExtendedSvgSchema };
