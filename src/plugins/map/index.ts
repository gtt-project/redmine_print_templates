import { Plugin } from '@pdfme/common';
import { image as component } from '@pdfme/schemas';
import { createPDFRender, createUIRender, createSchemaFunction, MapSchema, ui } from './schemaUtils';

import {
  DEFAULT_WIDTH, DEFAULT_HEIGHT, DEFAULT_MAP_VIEW,
  DEFAULT_MAP_STYLE_FILL, DEFAULT_MAP_STYLE_STROKE, DEFAULT_GEOJSON
} from './constants';

const mapImage = () => {
  const defaultSchema: MapSchema = {
    ...component.propPanel.defaultSchema,
    type: 'mapImage',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pinned"><path d="M18 8c0 4.5-6 9-6 9s-6-4.5-6-9a6 6 0 0 1 12 0"/><circle cx="12" cy="8" r="2"/><path d="M8.835 14H5a1 1 0 0 0-.9.7l-2 6c-.1.1-.1.2-.1.3 0 .6.4 1 1 1h18c.6 0 1-.4 1-1 0-.1 0-.2-.1-.3l-2-6a1 1 0 0 0-.9-.7h-3.835"/></svg>',
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    mapView: DEFAULT_MAP_VIEW,
    mapStyle: {
      fill: DEFAULT_MAP_STYLE_FILL,
      stroke: DEFAULT_MAP_STYLE_STROKE
    },
    pointLocation: {
      lon: DEFAULT_GEOJSON.features[0].geometry.coordinates[0],
      lat: DEFAULT_GEOJSON.features[0].geometry.coordinates[1],
    },
    content: '',
 };

  const schemaFunction = createSchemaFunction(component.propPanel.schema);

  const propPanel = {
    defaultSchema,
    schema: schemaFunction,
    widgets: component.propPanel.widgets,
  };

  const extendedSchema: Plugin<MapSchema> = {
    // pdf: createPDFRender(component),
    // ui: createUIRender(component),
    pdf: component.pdf,
    ui: ui,
    propPanel,
  };

  return extendedSchema;
};

export { mapImage };
