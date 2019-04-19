// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

module.exports = {
  preset: 'ts-jest',
  roots: ['<rootDir>/js'],
  moduleNameMapper: {
    '^core-js/.*': 'identity-obj-proxy',
  },
  setupFiles: ['core-js', './js/setupTests.ts'],
  /*verbose: true,
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.jsx?$': 'babel-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(ts|tsx|js|jsx)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  snapshotSerializers: ['enzyme-to-json/serializer'],
  moduleDirectories: ['node_modules', 'js'],
  globals: {
    'ts-jest': {
      babelConfig: true,
      diagnostics: { ignoreCodes: [151001] },
    },
  },*/
};
