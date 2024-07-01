import type { PDFRenderProps, UIRenderProps, PropPanelWidgetProps, PropPanelSchema } from '@pdfme/common';

import { DEFAULT_GEOJSON } from './constants';
import { setupMap, updateMap } from "./helper";

import type { MapSchema } from './types';

const createPDFRender = (component: any) => {
  return async (arg: PDFRenderProps<MapSchema>) => {
    const { schema } = arg;
    if (schema.type === 'mapImage') {
      // Handle custom property if needed
    }
    await component.pdf(arg as PDFRenderProps<MapSchema>);
  };
};

const createUIRender = (component: any) => {
  return async (arg: UIRenderProps<MapSchema>) => {
    const { schema, rootElement, mode, key } = arg;

    try {
      const map = await setupMap(schema, rootElement, mode, key);

      map.on('moveend', async () => {
        try {
          const dataUrl = await updateMap(map, key);
          console.log('dataUrl', dataUrl.length);
          schema.data = dataUrl;
        } catch (error) {
          console.error("Error in moveend event: ", error);
        }
      });
    } catch (error) {
      console.error("Error setting up the map: ", error);
    }

    if (schema.type === 'mapImage') {
      // Handle custom property if needed
    }
    await component.ui(arg as UIRenderProps<MapSchema>);
  };
};

const createSchemaFunction = (
  originalSchema: PropPanelSchema | ((props: Omit<PropPanelWidgetProps, 'rootElement'>) => PropPanelSchema),
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
      pointLocation: {
        type: 'object',
        title: 'Point Location (WGS84)',
        properties: {
          lon: {
            title: 'Longitude',
            type: 'number',
            default: DEFAULT_GEOJSON.features[0].geometry.coordinates[0],
            props: {
              placeholder: 'Enter longitude'
            },
            min: -180,
            max: 180,
          },
          lat: {
            title: 'Latitude',
            type: 'number',
            default: DEFAULT_GEOJSON.features[0].geometry.coordinates[1],
            props: {
              placeholder: 'Enter latitude'
            },
            min: -90,
            max: 90,
          }
        }
      },
      ...existingSchema,
    };
  };
};

const ui = async (props: UIRenderProps<MapSchema>) => {
  const { schema, rootElement, mode, key } = props;

  try {
    const map = await setupMap(schema, rootElement, mode, key);

    map.on('moveend', async () => {
      try {
        const dataUrl = await updateMap(map, key);
        // console.log('dataUrl', dataUrl.length);
        schema.data = dataUrl;
      } catch (error) {
        console.error("Error in moveend event: ", error);
      }
    });
  } catch (error) {
    console.error("Error setting up the map: ", error);
  }
};

export { createPDFRender, createUIRender, createSchemaFunction, MapSchema, ui };
