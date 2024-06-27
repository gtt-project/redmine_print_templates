import { signature } from './signature';
import { createExtendedTextSchema } from './extendedText';
import { createExtendedImageSchema } from './extendedImage';

import type { PluginOptions } from '../types';

const plugins = {
  signature,
  extendedText: (options: PluginOptions) => createExtendedTextSchema(options.fieldKeyOptions, options.fieldFormatOptions),
  extendedImage: (options: PluginOptions) => createExtendedImageSchema(options.fieldKeyOptions, options.fieldFormatOptions),
};

export default plugins;
