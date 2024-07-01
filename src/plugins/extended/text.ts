import type { Plugin, PDFRenderProps, UIRenderProps, PropPanelWidgetProps, PropPanelSchema } from '@pdfme/common';
import { text as component } from '@pdfme/schemas';
import type { TextSchema } from '@pdfme/schemas/src/text/types';

interface ExtendedText extends TextSchema {
  field_key?: string;
  field_format?: string;
  field_options?: string;
  readOnly?: boolean;
}

const pdfRender = async (arg: PDFRenderProps<ExtendedText>) => {
  const { schema } = arg;
  if (schema.type === 'extendedText') {
    // Handle custom property if needed
  }
  await component.pdf(arg as PDFRenderProps<TextSchema>);
};

const uiRender = async (arg: UIRenderProps<ExtendedText>) => {
  const { schema } = arg;
  if (schema.type === 'extendedText') {
    // Handle custom property if needed
  }
  await component.ui(arg as UIRenderProps<TextSchema>);
};

const createExtendedTextSchema = (
  fieldKeyOptions: { label: string; options: { label: string; value: string }[] }[],
  fieldFormatOptions: { label: string; value: string }[]
) => {
  const defaultSchema: TextSchema = {
    ...component.propPanel.defaultSchema,
    type: 'extendedText',
  };

  const originalSchema = component.propPanel.schema;

  const schemaFunction = (props: Omit<PropPanelWidgetProps, 'rootElement'>) => {
    let existingSchema: Record<string, PropPanelSchema> = {};

    if (typeof originalSchema === 'function') {
      existingSchema = originalSchema(props);
    } else {
      existingSchema = originalSchema;
    }

    return {
      field_permissions: {
        title: 'Field Permissions',
        widget: 'radio',
        props: {
          options: [
            { label: 'Editable', value: 'editable' },
            { label: 'Prefilled (Read-Only)', value: 'prefilled' },
            { label: 'Locked (Read-Only)', value: 'readonly' },
          ],
          optionType: 'button',
          defaultValue: 'editable',
          onChange: (evt: any, cmp: any) => {
            console.log(evt);
          }
        },
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

  const propPanel = {
    defaultSchema,
    schema: schemaFunction,
    widgets: component.propPanel.widgets
  };

  const extendedSchema: Plugin<ExtendedText> = { pdf: pdfRender, ui: uiRender, propPanel};
  return extendedSchema;
};

export { createExtendedTextSchema };
