import type { Plugin, PDFRenderProps, UIRenderProps, PropPanelWidgetProps, Schema } from '@pdfme/common';
import { svg as component } from '@pdfme/schemas';

interface ExtendedSvg extends Schema {
  field_key?: string;
  field_format?: string;
  field_options?: string;
  readOnly?: boolean;
}

const pdfRender = async (arg: PDFRenderProps<ExtendedSvg>) => {
  const { schema } = arg;
  if (schema.type === 'extendedSvg') {
    // Handle custom property if needed
  }
  await component.pdf(arg as PDFRenderProps<Schema>);
};

const uiRender = async (arg: UIRenderProps<ExtendedSvg>) => {
  const { schema } = arg;
  if (schema.type === 'extendedSvg') {
    // Handle custom property if needed
  }
  await component.ui(arg as UIRenderProps<Schema>);
};

const createExtendedSvgSchema = (
  fieldKeyOptions: { label: string; options: { label: string; value: string }[] }[],
  fieldFormatOptions: { label: string; value: string }[]
) => {
  const defaultSchema: Schema = {
    ...component.propPanel.defaultSchema,
    type: 'extendedSvg',
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
      divider1: {
        widget: 'divider',
        span: 24,
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
      divider2: {
        widget: 'divider',
        span: 24,
      },
      ...component.propPanel.schema,
    };
  };

  const propPanel = {
    defaultSchema,
    schema
  };

  const extendedSchema: Plugin<ExtendedSvg> = { pdf: pdfRender, ui: uiRender, propPanel };
  return extendedSchema;
};

export { createExtendedSvgSchema };
