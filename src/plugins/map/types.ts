import { View } from 'ol';
import { Image as ImageLayer, Vector as VectorLayer, VectorTile as VectorTileLayer, Tile as TileLayer, WebGLTile } from 'ol/layer';
import { OSM, XYZ, BingMaps, CartoDB, TileJSON, TileWMS, UTFGrid, WMTS, Vector, VectorTile as VectorTileSource, OGCVectorTile, Google, ImageWMS, ImageStatic, Raster } from 'ol/source';
import { MVT, GeoJSON, GPX, KML, WFS, WKB, WKT, TopoJSON } from 'ol/format';
import { MapboxVectorLayer as MapboxVector } from 'ol-mapbox-style';
import { FeatureCollection } from 'geojson';

import { Schema } from '@pdfme/common';

export interface MapState {
  center: [number, number];
  zoom: number;
  rotation: number;
  dataUrl: string;
}

export interface MapSchema extends Schema {
  mapLayer?: string;
  mapView?: ViewOptions,
  geojson?: FeatureCollection;
  readOnly?: boolean;
};

export type ViewOptions = ConstructorParameters<typeof View>[0];

type LayerType = 'Image' | 'Tile' | 'MapboxVector' | 'Vector' | 'VectorTile' | 'WebGLTile';
type ImageSource = 'ImageStatic' | 'ImageWMS' | 'Raster';
type TileSource = 'BingMaps' | 'CartoDB' | 'OSM' | 'TileJSON' | 'TileWMS' | 'UTFGrid' | 'VectorTile' | 'OGCVectorTile' | 'WMTS' | 'XYZ';
type VectorFormat = 'GeoJSON' | 'GPX' | 'KML' | 'WFS' | 'WKB' | 'WKT';
type VectorTileFormat = 'MVT' | 'TopoJSON';

type SourceTypeMap = {
  Image: ImageSource;
  Tile: TileSource;
  MapboxVector: never;
  Vector: 'Vector';
  VectorTile: 'VectorTile';
  WebGLTile: 'Google';
};

type FormatTypeMap = {
  Vector: VectorFormat;
  VectorTile: VectorTileFormat;
};

type SourceType = SourceTypeMap[keyof SourceTypeMap];
type FormatType = FormatTypeMap[keyof FormatTypeMap];

export const layerConstructors: { [key in LayerType]?: any } = {
  Image: ImageLayer,
  Tile: TileLayer,
  MapboxVector: MapboxVector,
  Vector: VectorLayer,
  VectorTile: VectorTileLayer,
  WebGLTile: WebGLTile,
};

export const sourceConstructors: { [key in SourceType]?: any } = {
  ImageStatic: ImageStatic,
  ImageWMS: ImageWMS,
  Raster: Raster,
  BingMaps: BingMaps,
  CartoDB: CartoDB,
  OSM: OSM,
  TileJSON: TileJSON,
  TileWMS: TileWMS,
  UTFGrid: UTFGrid,
  WMTS: WMTS,
  XYZ: XYZ,
  Vector: Vector,
  VectorTile: VectorTileSource,
  OGCVectorTile: OGCVectorTile,
  Google: Google,
};

export const formatConstructors: { [key in FormatType]?: any } = {
  GeoJSON: GeoJSON,
  GPX: GPX,
  KML: KML,
  WFS: WFS,
  WKB: WKB,
  WKT: WKT,
  MVT: MVT,
  TopoJSON: TopoJSON,
};

export interface MapLayer {
  name: string;
  layer_type: LayerType;
  layer_options?: any;
  source_type: SourceType;
  source_options?: any;
  format_type?: FormatType;
  format_options?: any;
  selected?: boolean;
}
