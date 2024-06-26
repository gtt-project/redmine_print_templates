import {
  text, readOnlyText,
  image, readOnlyImage,
  svg, readOnlySvg,
  line, rectangle, ellipse,
  tableBeta,
  barcodes,
} from '@pdfme/schemas';
import { v4 as uuidv4 } from 'uuid';
import { mapIconDataUrl } from './mapIconDataUrl';
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
    ReadOnlyText: readOnlyText,
    Table: tableBeta,
    Image: image,
    ReadOnlyImage: readOnlyImage,
    Line: line,
    Rectangle: rectangle,
    Ellipse: ellipse,
    // SVG: svg,
    // ReadOnlySvg: readOnlySvg,
    QR: barcodes.qrcode,
    Code128: barcodes.code128,
    // Signature: plugins.signature,
  };
};
