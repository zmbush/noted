// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import CopyPlugin from 'copy-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';

import { darkTheme, lightTheme } from './js/theme';

const { default: cfgBase } = require('./webpack.config.base');

const title = 'Noted';

const themed = (name: string) => ({
  [`${name}-dark`]: {
    name,
    media: `(prefers-color-scheme: dark)`,
    content: darkTheme.palette.primary.main,
  },
  [`${name}-light`]: {
    name,
    media: `(prefers-color-scheme: light)`,
    content: lightTheme.palette.primary.main,
  },
});

export default {
  ...cfgBase,
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
    runtimeChunk: true,
    usedExports: true, // Tree-shaking
  },
  devtool: process.env.NODE_ENV === 'production' ? 'source-map' : 'eval-source-map',
  plugins: [
    new CopyPlugin({
      patterns: [{ from: 'static/favicon', to: '.' }],
    }),
    new HtmlWebpackPlugin({
      title,
      template: 'js/index.ejs',
      inject: false,
      hash: true,
      meta: {
        charset: { charset: 'utf-8' },
        'X-UA-Compatible': { 'http-equiv': 'X-UA-Compatible', content: 'IE=edge' },

        // Disable tap highlight on IE
        'msapplication-tap-highlight': 'no',

        // Add to homescreen for Chrome on Android
        'mobile-web-app-capable': 'yes',
        'application-name': title,
        ...themed('theme-color'),

        // Add to homescreen for Safari on iOS
        'apple-mobile-web-app-capable': 'yes',
        'apple-mobile-web-app-status-bar-style': 'black-translucent',
        'apple-mobile-web-app-title': title,
        ...themed('apple-mobile-web-app-status-bar-style'),
        'apple-touch-icon': { name: 'apple-touch-icon', href: '/apple-touch-icon.png' },

        // Tile icon for Win8
        'msapplication-TileColor': lightTheme.palette.primary.main,
        ...themed('msapplication-navbutton-color'),

        // Viewport
        viewport: 'width=device-width, initial-scale=1',
      },
    }),
    new ForkTsCheckerWebpackPlugin(),
  ],
  entry: './js/index.tsx',
  output: {
    filename: 'js/[name].[chunkhash].js',
    chunkFilename: 'js/[name].[chunkhash].js',

    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },
};
