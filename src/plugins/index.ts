import { signature } from './signature';
import { extendedText } from './extended/text';
import { extendedImage } from './extended/image';
import { extendedSvg } from './extended/svg';
import { extendedMap } from './extended/map';
import { mapImage } from './map';

import type { PluginOptions } from '../types';

const plugins = {
  extendedText: (options: PluginOptions) => extendedText(options.fieldKeyOptions, options.fieldFormatOptions),
  extendedImage: (options: PluginOptions) => extendedImage(options.fieldKeyOptions, options.fieldFormatOptions),
  extendedSvg: (options: PluginOptions) => extendedSvg(options.fieldKeyOptions, options.fieldFormatOptions),
  mapImage: (options: PluginOptions) => extendedMap(options.fieldKeyOptions, options.fieldFormatOptions),
  simpleMap: (options: PluginOptions) => mapImage(),
  signature,
};

export default plugins;
