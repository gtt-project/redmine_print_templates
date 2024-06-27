import type { Plugin, PDFRenderProps, UIRenderProps, PropPanelWidgetProps, PropPanelSchema, Schema } from '@pdfme/common';
import { svg } from '@pdfme/schemas';

interface ExtendedSvge extends Schema {
  field_key?: string;
  field_format?: string;
  field_options?: string;
}

const pdfRender = async (arg: PDFRenderProps<ExtendedSvge>) => {
  const { schema } = arg;
  if (schema.type === 'extendedSvg') {
    // schema.readOnly = true;
  }
  await svg.pdf(arg as PDFRenderProps<Schema>);
};

const uiRender = async (arg: UIRenderProps<ExtendedSvge>) => {
  const { schema } = arg;
  if (schema.type === 'extendedSvg') {
    // schema.readOnly = true;
  }
  await svg.ui(arg as UIRenderProps<Schema>);
};

const createExtendedSvgSchema = (
  fieldKeyOptions: { label: string; options: { label: string; value: string }[] }[],
  fieldFormatOptions: { label: string; value: string }[]
) => {
  const propPanel = {
    ...svg.propPanel,
    defaultSchema: {
      ...svg.propPanel.defaultSchema,
      type: 'extendedSvg',
    },
    schema: (props: Omit<PropPanelWidgetProps, 'rootElement'>) => {
      const { options, activeSchema, i18n, ...rest } = props;

      let baseSchema: Record<string, PropPanelSchema>;

      if (typeof svg.propPanel.schema === 'function') {
        baseSchema = svg.propPanel.schema(props);
      } else {
        baseSchema = svg.propPanel.schema;
      }

      return {
        extended: {
          title: 'Extended Settings',
          type: 'object',
          widget: 'collapse',
          span: 24,
          properties: {
            field_key: {
              title: 'Field Key',
              type: 'string',
              widget: 'select',
              span: 24,
              props: {
                options: fieldKeyOptions,
                allowClear: true,
              },
            },
            field_format: {
              title: 'Format',
              type: 'string',
              widget: 'select',
              span: 8,
              props: {
                options: fieldFormatOptions,
                allowClear: true,
              },
            },
            field_options: {
              title: 'Format Options',
              type: 'string',
              widget: 'input',
              span: 16,
            },
          },
        },
        ...baseSchema,
      };
    },
  };

  const extendedSchema: Plugin<ExtendedSvge> = { pdf: pdfRender, ui: uiRender, propPanel };
  return extendedSchema;
};

export { createExtendedSvgSchema };
