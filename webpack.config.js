import path from 'path';
import { fileURLToPath } from 'url';

// Construct __dirname equivalent in ES module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Loaders for processing TypeScript files
const tsLoaders = {
  test: /\.tsx?$/,
  use: 'ts-loader',
  exclude: /node_modules/
};

export default {
  mode: 'production',
  entry: path.join(__dirname, 'src', 'index.ts'),
  module: {
    rules: [
      tsLoaders,
    ]
  },
  devtool: false, // Disable source maps
  // Uncomment the next line to enable source maps for easier debugging
  // devtool: 'source-map',
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'assets'),
    assetModuleFilename: '[name].[ext]',
  }
};
