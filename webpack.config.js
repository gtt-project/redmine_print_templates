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

// Loaders for processing CSS files
const cssLoaders = {
  test: /\.css$/,
  use: ['style-loader', 'css-loader'],
};

export default {
  mode: 'production',
  entry: {
    'pdfme-designer': path.join(__dirname, 'src', 'designer.ts'),
    'pdfme-viewer': path.join(__dirname, 'src', 'viewer.ts')
  },
  module: {
    rules: [
      tsLoaders,
      cssLoaders,
    ]
  },
  devtool: false, // Disable source maps
  // Uncomment the next line to enable source maps for easier debugging
  // devtool: 'source-map',
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'assets/javascripts'),
  }
};
