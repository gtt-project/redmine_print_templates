import type { Plugin, PDFRenderProps, UIRenderProps, PropPanelWidgetProps, Schema } from '@pdfme/common';
import { image as component } from '@pdfme/schemas';

interface ExtendedImage extends Schema {
  field_key?: string;
  field_format?: string;
  field_options?: string;
  readOnly?: boolean;
}

const pdfRender = async (arg: PDFRenderProps<ExtendedImage>) => {
  const { schema } = arg;
  if (schema.type === 'extendedImage') {
    // Handle custom property if needed
  }
  await component.pdf(arg as PDFRenderProps<Schema>);
};

const uiRender = async (arg: UIRenderProps<ExtendedImage>) => {
  const { schema } = arg;
  if (schema.type === 'extendedImage') {
    // Handle custom property if needed
  }
  await component.ui(arg as UIRenderProps<Schema>);
};

const createExtendedImageSchema = (
  fieldKeyOptions: { label: string; options: { label: string; value: string }[] }[],
  fieldFormatOptions: { label: string; value: string }[]
) => {
  const defaultSchema: Schema = {
    ...component.propPanel.defaultSchema,
    type: 'extendedImage',
  };

  const schema: PropPanelWidgetProps = (props: Omit<PropPanelWidgetProps, 'rootElement'>) => {
    const { options, activeSchema, i18n } = props;

    return {
      readOnly: {
        title: 'Read Only',
        type: 'boolean',
        widget: 'switch',
        span: 8,
      },
      divider: {
        widget: 'divider',
      },
      field_key: {
        title: 'Field Key',
        type: 'string',
        widget: 'select',
        span: 16,
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
      ...component.propPanel.schema,
    };
  };

  const propPanel = {
    defaultSchema,
    schema
  };

  const extendedSchema: Plugin<ExtendedImage> = { pdf: pdfRender, ui: uiRender, propPanel };
  return extendedSchema;
};

export { createExtendedImageSchema };
