import type { PDFRenderProps, UIRenderProps, PropPanelWidgetProps, PropPanelSchema } from '@pdfme/common';
import { Point } from 'geojson';

import { DEFAULT_MAP_LAYERS, DEFAULT_GEOJSON } from './constants';
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

    const schemaCoordinates = (activeSchema.geojson?.features?.[0]?.geometry as Point)?.coordinates;
    const defaultCoordinates = (DEFAULT_GEOJSON.features?.[0]?.geometry as Point)?.coordinates;

    const [defaultLon, defaultLat] = schemaCoordinates
      ? [schemaCoordinates[0], schemaCoordinates[1]]
      : defaultCoordinates
        ? [defaultCoordinates[0], defaultCoordinates[1]]
        : [undefined, undefined];

    return {
      mapLayer: {
        title: 'Basemap layer',
        type: 'string',
        widget: 'select',
        span: 24,
        props: {
          options: DEFAULT_MAP_LAYERS.map(layer => ({
            label: layer.name,
            value: JSON.stringify(layer)
          })),
          defaultValue: activeSchema.mapLayer?.name ?? '',
        },
      },
      lon: {
        title: 'Longitude (WGS84)',
        type: 'number',
        defaultValue: defaultLon,
        props: {
          placeholder: 'Enter longitude'
        },
        min: -180,
        max: 180,
      },
      lat: {
        title: 'Latitude (WGS84)',
        type: 'number',
        defaultValue: defaultLat,
        props: {
          placeholder: 'Enter latitude'
        },
        min: -90,
        max: 90,
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
        schema.content = dataUrl;
      } catch (error) {
        console.error("Error in moveend event: ", error);
      }
    });
  } catch (error) {
    console.error("Error setting up the map: ", error);
  }
};

export { createPDFRender, createUIRender, createSchemaFunction, MapSchema, ui };
