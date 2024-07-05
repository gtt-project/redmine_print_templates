import {
  line, rectangle, ellipse,
  tableBeta,
  barcodes,
} from '@pdfme/schemas';
import plugins from './plugins';

import type { PluginOptions } from './types';

/**
 * Get the plugins object
 * @param {PluginOptions} options - The options object
 * @returns {Object} - Returns the plugins object
 */
export const getPlugins = (options: PluginOptions) => {
  return {
    Text: plugins.extendedText(options),
    Image: plugins.extendedImage(options),
    SVG: plugins.extendedSvg(options),
    // Map: plugins.mapImage(options),
    SimpleMap: plugins.simpleMap(options),
    Table: tableBeta,
    Line: line,
    Rectangle: rectangle,
    Ellipse: ellipse,
    QR: barcodes.qrcode,
    Code128: barcodes.code128,
    Sketch: plugins.signature,
  };
};
