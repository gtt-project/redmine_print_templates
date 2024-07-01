import type { GeoJSONType } from './types';

export const DEFAULT_WIDTH = 80;
export const DEFAULT_HEIGHT = 60;

export const DEFAULT_MAP_VIEW = {
  center: {
    lon: 0,
    lat: 0,
  },
  zoom: 2,
};

export const DEFAULT_MAX_EXTENT = [-180,-90,180,90];
export const DEFAULT_MIN_ZOOM = 1;
export const DEFAULT_MAX_ZOOM = 18;

export const DEFAULT_MAX_ZOOM_TO_EXTENT = 7;

export const DEFAULT_MAP_STYLE_FILL = {
  color: 'white',
  width: 2
};

export const DEFAULT_MAP_STYLE_STROKE = {
  color: 'red'
};

export const DEFAULT_MAP_STYLE_OPACITY = 0.7;

export const DEFAULT_GEOJSON: GeoJSONType = {
  'type': 'FeatureCollection',
  'features': [{
    'type': 'Feature',
    'geometry': {
      'type': 'Point',
      'coordinates': [135.2765, 34.7248] // Longitude, Latitude
    }
  }]
};
