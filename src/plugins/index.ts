import { signature } from './signature';
import { extendedText } from './extended/text';
import { extendedImage } from './extended/image';
import { extendedSvg } from './extended/svg';
import { mapImage } from './map';

import type { PluginOptions } from '../types';

const plugins = {
  extendedText: (options: PluginOptions) => extendedText(options.fieldKeyOptions, options.fieldFormatOptions),
  extendedImage: (options: PluginOptions) => extendedImage(options.fieldKeyOptions, options.fieldFormatOptions),
  extendedSvg: (options: PluginOptions) => extendedSvg(options.fieldKeyOptions, options.fieldFormatOptions),
  mapImage: (options: PluginOptions) => mapImage(),
  signature,
};

export default plugins;
