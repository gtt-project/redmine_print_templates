import { signature } from './signature';
import { createExtendedTextSchema } from './extended/text';
import { createExtendedImageSchema } from './extended/image';
import { createExtendedSvgSchema } from './extended/svg';

import type { PluginOptions } from '../types';

const plugins = {
  signature,
  extendedText: (options: PluginOptions) => createExtendedTextSchema(options.fieldKeyOptions, options.fieldFormatOptions),
  extendedImage: (options: PluginOptions) => createExtendedImageSchema(options.fieldKeyOptions, options.fieldFormatOptions),
  extendedSvg: (options: PluginOptions) => createExtendedSvgSchema(options.fieldKeyOptions, options.fieldFormatOptions),
};

export default plugins;
