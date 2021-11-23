// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

module.exports = {
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/js'],
  moduleNameMapper: {
    '^core-js/.*': 'identity-obj-proxy',
    '\\.(css|less)$': 'identity-obj-proxy',
    'react-markdown': '<rootDir>/js/__mocks__/react-markdown.tsx',
    'rehype-raw': '<rootDir>/js/__mocks__/rehype-raw.ts',
  },
  setupFiles: ['core-js', './js/setupTests.ts'],
  collectCoverageFrom: ['js/**/*.{ts,js}{,x}', '!js/index.tsx'],
  snapshotSerializers: ['enzyme-to-json/serializer'],
  reporters: ['default', ['jest-junit', { outputDirectory: 'test-results/jest' }]],
  moduleDirectories: ['node_modules', 'js'],
};
