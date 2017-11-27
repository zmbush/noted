// @flow

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: [
    'babel-polyfill', './ui/entry.jsx',
  ],
  output: {
    path: path.resolve('./static'),
    filename: 'assets/js/[name]-[chunkhash].js',
    sourceMapFilename: '[file].map',
  },
  devtool: 'source-map',
  resolve: {
    modules: [
      path.resolve('./ui'),
      'node_modules',
    ],
    extensions: ['.js', '.jsx'],
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: './ui/images/',
        to: 'images',
      },
    ]),
    new HtmlWebpackPlugin({
      title: 'Noted',
      inject: false,
      filename: 'index.pug',
      template: './ui/index.ejs',
    }),
    new webpack
      .optimize
      .CommonsChunkPlugin({
        name: 'vendor',
        minChunks: module => module.context && module.context.indexOf('node_modules') !== -1,
      }),
    new webpack
      .optimize
      .CommonsChunkPlugin({ name: 'manifest' }),
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        use: [{
          loader: 'babel-loader',
          options: {
            presets: [
              'env', 'react', 'flow',
            ],
            plugins: [
              'transform-object-rest-spread',
              'transform-class-properties',
              'flow-react-proptypes',
              'relay',
            ],
          },
        }],
      }, {
        test: /\.s?css$/,
        use: [{
          loader: 'style-loader',
        }, {
          loader: 'css-loader',
          query: {
            modules: true,
            localIdentName: '[path][name]_[local]--[hash:base64:5]',
          },
        }, {
          loader: 'sass-loader',
        }],
      },
    ],
  },
};
