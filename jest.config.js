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
      babelConfig: {
        plugins: ['@babel/transform-modules-commonjs'],
      },
    },
  },
  transform: {
    '^.+\\.[t|j]sx?$': 'babel-jest',
  },
  testEnvironment: 'jest-environment-jsdom',
  roots: ['<rootDir>/js'],
  moduleNameMapper: {
    '^core-js/.*': 'identity-obj-proxy',
    '\\.(css|less|scss)$': 'identity-obj-proxy',
  },
  setupFiles: ['core-js'],
  collectCoverageFrom: ['js/**/*.{ts,js}{,x}', '!js/index.tsx'],
  reporters: ['default', ['jest-junit', { outputDirectory: 'test-results/jest' }]],
  moduleDirectories: ['node_modules', 'js'],
  transformIgnorePatterns: ['node_modules/core-js'],
};
