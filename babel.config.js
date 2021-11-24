// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'entry',
        targets: {
          node: 'current',
        },
      },
    ],
    '@babel/preset-react',
    '@babel/typescript',
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    ['babel-plugin-direct-import', { modules: ['@mui/material', '@mui/icons-material'] }],
  ],
};
