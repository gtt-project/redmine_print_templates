import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import { transformExtent } from 'ol/proj';
import { FeatureCollection } from 'geojson';

import type { MapLayer, ViewOptions } from './types';

// Widget dimensions
export const DEFAULT_WIDTH = 120;
export const DEFAULT_HEIGHT = 80;

// Default GeoJSON for vector layer
export const DEFAULT_GEOJSON: FeatureCollection = {
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [135.2765, 34.7248] // Longitude, Latitude
    },
    properties: {}
  }]
};

// Default view for the map
export const DEFAULT_MAP_VIEW: ViewOptions ={
  // center: [
  //   0.0 as number,
  //   0.0 as number
  // ],
  // zoom: 2 as number,
  minZoom: 1,
  maxZoom: 18,
  extent: transformExtent([-180,-90,180,90], 'EPSG:4326', 'EPSG:3857'),
};

export const MAX_ZOOM_TO_EXTENT = 7;

// One of the layers should be set as selected
export const DEFAULT_MAP_LAYERS: MapLayer[] = [
  {
    name: 'OSM (simple)',
    layer_type: 'Tile',
    source_type: 'OSM',
  },
  {
    name: 'OpenStreetMap',
    layer_type: 'Tile',
    source_type: 'OSM',
    source_options: {
      url: 'https://tile.openstreetmap.jp/{z}/{x}/{y}.png',
      custom: '19/34.74701/135.35740',
      crossOrigin: 'anonymous',
      attributions: '<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>'
    },
    selected: true
  },
  {
    name: 'OSM Vector Tiles',
    layer_type: 'VectorTile',
    layer_options: {
      styleUrl: 'https://tile.openstreetmap.jp/styles/osm-bright-ja/style.json',
      declutter: true
    },
    source_type: 'VectorTile',
    source_options: {
      attributions: '<a href="https://www.openmaptiles.org/" target="_blank">OpenMapTiles</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>'
    },
    format_type: 'MVT',
    format_options: {}
  },
  {
    name: 'OGC Vector Tiles',
    layer_type: 'VectorTile',
    layer_options: {
      background: '#d1d1d1',
      style: {
        'stroke-width': 0.6,
        'stroke-color': '#8c8b8b',
        'fill-color': '#f7f7e9',
      },
    },
    source_type: 'OGCVectorTile',
    source_options: {
      url: 'https://maps.gnosis.earth/ogcapi/collections/NaturalEarth:cultural:ne_10m_admin_0_countries/tiles/WebMercatorQuad',
    },
    format_type: 'MVT',
  }
];

// Default style for vector layers
export const DEFAULT_VECTOR_STYLE: Style = new Style({
  image: new CircleStyle({
    radius: 10,
    fill: new Fill({
      color: 'red'
    }),
    stroke: new Stroke({
      color: 'white',
      width: 2
    })
  })
});

export const VECTOR_STYLE_OPACITY = 0.7;
