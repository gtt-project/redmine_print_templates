import type { Plugin, PDFRenderProps, UIRenderProps, PropPanelWidgetProps, PropPanelSchema, Schema } from '@pdfme/common';
import { image } from '@pdfme/schemas';

interface ExtendedImage extends Schema {
  field_key?: string;
  field_format?: string;
  field_options?: string;
}

const pdfRender = async (arg: PDFRenderProps<ExtendedImage>) => {
  const { schema } = arg;
  if (schema.type === 'extendedImage') {
    // schema.readOnly = true;
  }
  await image.pdf(arg as PDFRenderProps<Schema>);
};

const uiRender = async (arg: UIRenderProps<ExtendedImage>) => {
  const { schema } = arg;
  if (schema.type === 'extendedImage') {
    // schema.readOnly = true;
  }
  await image.ui(arg as UIRenderProps<Schema>);
};

const createExtendedImageSchema = (
  fieldKeyOptions: { label: string; options: { label: string; value: string }[] }[],
  fieldFormatOptions: { label: string; value: string }[]
) => {
  const propPanel = {
    ...image.propPanel,
    defaultSchema: {
      ...image.propPanel.defaultSchema,
      type: 'extendedImage',
    },
    schema: (props: Omit<PropPanelWidgetProps, 'rootElement'>) => {
      const { options, activeSchema, i18n, ...rest } = props;

      let baseSchema: Record<string, PropPanelSchema>;

      if (typeof image.propPanel.schema === 'function') {
        baseSchema = image.propPanel.schema(props);
      } else {
        baseSchema = image.propPanel.schema;
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

  const extendedSchema: Plugin<ExtendedImage> = { pdf: pdfRender, ui: uiRender, propPanel };
  return extendedSchema;
};

export { createExtendedImageSchema };
