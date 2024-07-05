import { Map, View }  from 'ol';
import { Vector as VectorSource, OSM } from 'ol/source';
import { Vector as VectorLayer, Layer, Tile as TileLayer } from 'ol/layer';
import { Attribution, ZoomToExtent, defaults as defaultControls } from 'ol/control';
import { DragRotateAndZoom, defaults as defaultInteractions } from 'ol/interaction';
import { GeoJSON } from 'ol/format';
import { applyStyle, applyBackground } from 'ol-mapbox-style';

import { PropPanelSchema, ZOOM } from '@pdfme/common';

import { MAX_ZOOM_TO_EXTENT, VECTOR_STYLE_OPACITY, DEFAULT_GEOJSON, DEFAULT_VECTOR_STYLE, DEFAULT_MAP_VIEW, DEFAULT_WIDTH, DEFAULT_HEIGHT } from './constants';
import { layerConstructors, sourceConstructors, formatConstructors } from './types';
import type { MapState, MapLayer } from './types';

import 'ol/ol.css';

/**
 * Map states saved by key
 */
const mapStates: Record<string, MapState> = {};

/**
 * Save the map state
 * @param key
 * @param state
 */
const saveMapState = (key: string, state: MapState): void => {
  mapStates[key] = state;
}

/**
 * Load the map state
 * @param key
 * @returns
 */
const loadMapState = (key: string): MapState | null => {
  return mapStates[key] || null;
}

/**
 * Setup the map instance
 * @param schema
 * @param rootElement
 * @param mode
 * @param key
 * @returns
 */
export const setupMap = async (schema: PropPanelSchema, rootElement: HTMLDivElement, mode: string, key: string): Promise<Map> => {

  const width = schema.width || DEFAULT_WIDTH;
  const height = schema.height || DEFAULT_HEIGHT;

  const mapDiv = document.createElement('div') as HTMLDivElement;
  mapDiv.style.width = `${width! as number * ZOOM}px`;
  mapDiv.style.height = `${height! as number * ZOOM}px`;
  rootElement.appendChild(mapDiv);

  let layers: Layer<any>[] = [];

  if (schema.mapLayer) {
    const layer = createLayer(JSON.parse(schema.mapLayer) as MapLayer);
    if (layer) {
      layers.push(layer);
    }
  } else {
    // Add OSM as default basemap
    layers.push(new TileLayer({ source: new OSM() }));
  }

  // Determine coordinates, prioritizing schema.lat and schema.lon
  const pointFeature = schema.lat !== undefined && schema.lon !== undefined
  ? [schema.lon, schema.lat]
  : undefined;

  // Create features based on the determined coordinates or fallback to schema.geojson or DEFAULT_GEOJSON
  const features = pointFeature
    ? {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: pointFeature
          },
          properties: {}
        }]
      }
    : schema.geojson?.features
      ? schema.geojson
      : DEFAULT_GEOJSON?.features
        ? DEFAULT_GEOJSON
        : null;

  const vectorSource = new VectorSource({
    features: features
      ? new GeoJSON().readFeatures(features, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857'
        })
      : []
  });

  const vector = new VectorLayer({
    source: vectorSource as VectorSource,
    style: DEFAULT_VECTOR_STYLE,
    opacity: VECTOR_STYLE_OPACITY ? VECTOR_STYLE_OPACITY : 0.7,
  });
  layers.push(vector);

  const defaultExtent = vectorSource.getFeatures().length > 0 ? vectorSource.getExtent() : DEFAULT_MAP_VIEW.extent;

  const zoomToExtentControl = new ZoomToExtent({
    extent: defaultExtent,
  });

  const dragRotateAndZoomControl = new DragRotateAndZoom();

  const attributionControl = new Attribution({
    collapsible: false,
  });

  return new Promise((resolve, reject) => {
    try {
      const map = new Map({
        layers: layers,
        target: mapDiv,
        view: new View(schema.mapLayer || DEFAULT_MAP_VIEW),
        controls: mode === 'viewer' ? [attributionControl] : defaultControls().extend([attributionControl,zoomToExtentControl]),
        interactions: mode === 'viewer' ? [] : defaultInteractions().extend([dragRotateAndZoomControl]),
      });

      // Restore saved state if available
      const savedState = loadMapState(key);
      if (savedState) {
        map.getView().setCenter(savedState.center);
        map.getView().setZoom(savedState.zoom);
        // map.getView().setRotation(savedState.rotation);
      } else {
        map.getView().fit(defaultExtent, {
          maxZoom: MAX_ZOOM_TO_EXTENT ? MAX_ZOOM_TO_EXTENT : 7
        });
      }

      resolve(map); // Resolve the promise with the map instance
    } catch (error) {
      reject(error); // Reject the promise on errors
    }
  });
};

/**
 * Update the map instance
 * @param map
 * @param key
 * @param timeout
 * @returns
 */
export const updateMap = (map: Map, key: string, timeout = 500): Promise<string> => {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const dataUrl = await generateDataUrl(map, key);
        resolve(dataUrl as string);
      } catch (error) {
        console.error("Error updating map: ", error);
        reject(error); // Reject the promise on error
      }
    }, timeout);
  });
};

const generateDataUrl = (map: Map, key: string) => {
  return new Promise((resolve, reject) => {
    const size = map.getSize();
    if (!size) {
      reject('Map size not available');
      return;
    }

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = size[0];
    exportCanvas.height = size[1];
    const exportContext = exportCanvas.getContext('2d');

    if (!exportContext) {
      reject("Failed to get canvas context for map");
      return;
    }

    // Draw each canvas from the map onto the export canvas
    document.querySelectorAll('.ol-layer canvas').forEach(function (canvasElement) {
      const canvas = canvasElement as HTMLCanvasElement;
      if (canvas.width > 0) {
        const parentNode = canvas.parentNode as HTMLElement;
        if (parentNode) {
          exportContext.globalAlpha = parentNode.style.opacity === '' ? 1 : Number(parentNode.style.opacity);
          const transform = canvas.style.transform;
          const match = transform.match(/^matrix\(([^\(]*)\)$/);
          if (match) {
            const matrix = match[1].split(',').map(Number);
            // Apply matrix values to setTransform method
            exportContext.setTransform(matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5]);
            exportContext.drawImage(canvas, 0, 0);
          }
        }
      }
    });

    // Reset transformations and alpha for the export canvas
    exportContext.globalAlpha = 1;
    exportContext.setTransform(1, 0, 0, 1, 0, 0);

    // Get the dataUrl from the export canvas
    const data = exportCanvas.toDataURL('image/png');
    const view = map.getView();
    const newState: MapState = {
      center: view.getCenter() as [number, number],
      zoom: view.getZoom() as number,
      rotation: view.getRotation() as number,
      dataUrl: data
    };
    saveMapState(key, newState);

    resolve(data);
  });
};

// Function to find the first selected layer
export function getFirstSelectedLayer(layers: MapLayer[]): MapLayer | undefined {
  return layers.find(layer => layer.selected);
}

/**
 * Layer constructor
 * @param basemapConfig
 * @returns
 */
function createLayer(basemapConfig: MapLayer): Layer<any> | undefined {
  const { layer_type, source_type, format_type, layer_options, source_options, format_options } = basemapConfig;

  // Assuming that layer_type and source_type are required
  if (!layer_type || !source_type) {
    return undefined;
  }

  const LayerConstructor = layerConstructors[layer_type];
  const SourceConstructor = sourceConstructors[source_type];
  const FormatConstructor = format_type ? formatConstructors[format_type] : undefined;

  if (!SourceConstructor || !LayerConstructor) {
    return undefined;
  }

  let format;

  if (FormatConstructor) {
    format = new FormatConstructor({
      ...format_options || {},
    });
  }

  const source = new SourceConstructor({
    ...(format ? { format } : {}),
    ...source_options || {},
  });

  const layer = new LayerConstructor({
    source,
    ...layer_options || {},
  });

  if (layer_options && layer_options.styleUrl) {
    applyStyle(layer as any, layer_options.styleUrl);
    applyBackground(layer as any, layer_options.styleUrl);
  }

  return layer;
}
