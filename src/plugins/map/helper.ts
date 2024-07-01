import { PropPanelSchema, ZOOM } from '@pdfme/common';
import {
  DEFAULT_MAX_ZOOM_TO_EXTENT, DEFAULT_MAP_STYLE_OPACITY, DEFAULT_GEOJSON,
  DEFAULT_MAX_EXTENT, DEFAULT_MIN_ZOOM, DEFAULT_MAX_ZOOM,
} from './constants';
import type { MapState } from './types';

import Map from 'ol/Map';
import View from 'ol/View';
import { OSM, Vector as VectorSource } from 'ol/source';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { Attribution, ZoomToExtent, defaults as defaultControls } from 'ol/control';
import { Style, Circle as CircleStyle , Fill, Stroke } from 'ol/style';
import { DragRotateAndZoom, defaults as defaultInteractions } from 'ol/interaction';
import { transformExtent } from 'ol/proj';
import { GeoJSON } from 'ol/format';

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

  if (!schema.width || !schema.height || !schema.mapView || !schema.mapStyle) {
    throw new Error("Invalid schema properties");
  }

  const mapDiv = document.createElement('div') as HTMLDivElement;
  mapDiv.style.width = `${schema.width! as number * ZOOM}px`;
  mapDiv.style.height = `${schema.height! as number * ZOOM}px`;
  rootElement.appendChild(mapDiv);

  // TODO: Add support for multiple layers provided through schema.mapView
  const raster = new TileLayer({ source: new OSM() });

  // Todo: Add support for multiple styles provided through schema.mapStyle
  const pointStyle = new Style({
    image: new CircleStyle({
      radius: 10,
      fill: new Fill(schema.mapStyle.stroke),
      stroke: new Stroke(schema.mapStyle.fill)
    })
  });

  // TODO: Add support for multiple features provided through schema.geojson
  const geojsonFeature = {
    ...DEFAULT_GEOJSON,
    features: DEFAULT_GEOJSON.features.map(feature => {
      if (feature.geometry.type === "Point") {
        return {
          ...feature,
          geometry: {
            ...feature.geometry,
            coordinates: [schema.pointLocation.lon, schema.pointLocation.lat]
          }
        };
      }
      return feature;
    })
  };

  const vectorSource = new VectorSource({
    features: new GeoJSON().readFeatures(geojsonFeature, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    })
  });

  const vector = new VectorLayer({
    source: vectorSource as VectorSource,
    style: pointStyle,
    opacity: DEFAULT_MAP_STYLE_OPACITY ? DEFAULT_MAP_STYLE_OPACITY : 0.7,
  });

  const attributionControl = new Attribution({
    collapsible: false,
  });

  const zoomToExtentControl = new ZoomToExtent({
    extent: vectorSource.getExtent(),
    label: 'E',
    tipLabel: 'Zoom to extent',
  });

  const dragRotateAndZoomControl = new DragRotateAndZoom();

  return new Promise((resolve, reject) => {
    try {
      const map = new Map({
        layers: [raster, vector],
        target: mapDiv,
        view: new View({
          center: [
            schema.mapView.center.lon as number,
            schema.mapView.center.lat as number],
          zoom: schema.mapView.zoom as number,
          minZoom: DEFAULT_MIN_ZOOM,
          maxZoom: DEFAULT_MAX_ZOOM,
          extent: transformExtent(DEFAULT_MAX_EXTENT, 'EPSG:4326', 'EPSG:3857'),
        }),
        controls: mode === 'viewer' ? [attributionControl] : defaultControls().extend([attributionControl,zoomToExtentControl]),
        interactions: mode === 'viewer' ? defaultInteractions().extend([dragRotateAndZoomControl]) : defaultInteractions().extend([dragRotateAndZoomControl]),
      });

      // Restore saved state if available
      const savedState = loadMapState(key);
      if (savedState) {
        map.getView().setCenter(savedState.center);
        map.getView().setZoom(savedState.zoom);
        map.getView().setRotation(savedState.rotation);
      } else {
        map.getView().fit(vectorSource.getExtent(), {
          maxZoom: DEFAULT_MAX_ZOOM_TO_EXTENT ? DEFAULT_MAX_ZOOM_TO_EXTENT : 7
        });
        map.getView().setRotation(schema.mapView.rotation as number ? schema.mapView.rotation as number : 0);
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
