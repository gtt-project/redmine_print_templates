import type { PDFRenderProps, UIRenderProps, PropPanelWidgetProps, Schema, PropPanelSchema } from '@pdfme/common';

interface ExtendedSchema extends Schema {
  field_key?: string;
  field_format?: string;
  field_options?: string;
  readOnly?: boolean;
};

const createPDFRender = (component: any) => {
  return async (arg: PDFRenderProps<ExtendedSchema>) => {
    const { schema } = arg;
    if (schema.type.startsWith('extended')) {
      // Handle custom property if needed
    }
    await component.pdf(arg as PDFRenderProps<Schema>);
  };
};

const createUIRender = (component: any) => {
  return async (arg: UIRenderProps<ExtendedSchema>) => {
    const { schema } = arg;
    if (schema.type.startsWith('extended')) {
      // Handle custom property if needed
    }
    await component.ui(arg as UIRenderProps<Schema>);
  };
};

const createSchemaFunction = (
  originalSchema: PropPanelSchema | ((props: Omit<PropPanelWidgetProps, 'rootElement'>) => PropPanelSchema),
  fieldKeyOptions: { label: string; options: { label: string; value: string }[] }[],
  fieldFormatOptions: { label: string; value: string }[]
) => {
  return (props: Omit<PropPanelWidgetProps, 'rootElement'>) => {
    const { options, activeSchema, i18n } = props;

    let existingSchema: Record<string, PropPanelSchema> = {};

    if (typeof originalSchema === 'function') {
      existingSchema = originalSchema(props);
    } else {
      existingSchema = originalSchema;
    }

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
      ...existingSchema,
    };
  };
};

export { createPDFRender, createUIRender, createSchemaFunction, ExtendedSchema };
