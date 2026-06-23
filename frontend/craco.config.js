const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

const cesiumSource = 'node_modules/cesium/Build/Cesium';
const cesiumBaseUrl = 'cesium';

module.exports = {
  webpack: {
    plugins: {
      add: [
        new CopyWebpackPlugin({
          patterns: [
            { from: path.join(cesiumSource, 'Workers'), to: `${cesiumBaseUrl}/Workers` },
            { from: path.join(cesiumSource, 'ThirdParty'), to: `${cesiumBaseUrl}/ThirdParty` },
            { from: path.join(cesiumSource, 'Assets'), to: `${cesiumBaseUrl}/Assets` },
            { from: path.join(cesiumSource, 'Widgets'), to: `${cesiumBaseUrl}/Widgets` },
          ],
        }),
        new webpack.DefinePlugin({
          CESIUM_BASE_URL: JSON.stringify(cesiumBaseUrl),
        }),
      ],
    },
    configure: (webpackConfig) => {
      webpackConfig.module.rules.push({
        test: /\.js$/,
        include: path.resolve(__dirname, 'node_modules/cesium/Source'),
        use: { loader: '@open-wc/webpack-import-meta-loader' },
      });
      return webpackConfig;
    },
  },
};
