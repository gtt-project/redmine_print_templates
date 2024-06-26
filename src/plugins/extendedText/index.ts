import type { Plugin, PDFRenderProps, UIRenderProps, PropPanelWidgetProps, PropPanelSchema } from '@pdfme/common';
import { text } from '@pdfme/schemas';
import type { TextSchema } from '@pdfme/schemas/src/text/types';

interface ExtendedText extends TextSchema {
  field_key?: string;
  field_format?: string;
  field_options?: string;
}

const pdfRender = async (arg: PDFRenderProps<ExtendedText>) => {
  const { schema } = arg;
  if (schema.type === 'extendedText') {
    // schema.readOnly = true;
  }
  await text.pdf(arg as PDFRenderProps<TextSchema>);
};

const uiRender = async (arg: UIRenderProps<ExtendedText>) => {
  const { schema } = arg;
  if (schema.type === 'extendedText') {
    // schema.readOnly = true;
  }
  await text.ui(arg as UIRenderProps<TextSchema>);
};

const createExtendedTextSchema = (
  fieldKeyOptions: { label: string; options: { label: string; value: string }[] }[],
  fieldFormatOptions: { label: string; value: string }[]
) => {
  const propPanel = {
    ...text.propPanel,
    defaultSchema: {
      ...text.propPanel.defaultSchema,
      type: 'extendedText',
    },
    schema: (props: Omit<PropPanelWidgetProps, 'rootElement'>) => {
      const { options, activeSchema, i18n, ...rest } = props;

      let baseSchema: Record<string, PropPanelSchema>;

      if (typeof text.propPanel.schema === 'function') {
        baseSchema = text.propPanel.schema(props);
      } else {
        baseSchema = text.propPanel.schema;
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

  const extendedTextSchema: Plugin<ExtendedText> = { pdf: pdfRender, ui: uiRender, propPanel };
  return extendedTextSchema;
};

export { createExtendedTextSchema };
