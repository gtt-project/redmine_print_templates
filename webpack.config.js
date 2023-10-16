const path = require('path');

// Loaders for processing TypeScript files
const tsLoaders = {
  test: /\.tsx?$/,
  use: 'ts-loader',
  exclude: /node_modules/
};

module.exports = {
  mode: 'production',
  entry: path.join(__dirname, 'src', 'index.ts'),
  module: {
    rules: [
      tsLoaders,
    ]
  },
  devtool: false, // Disable source maps
  // devtool: 'source-map', // Generate source maps for easier debugging
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'assets'),
    assetModuleFilename: '[name].[ext]',
  }
};
