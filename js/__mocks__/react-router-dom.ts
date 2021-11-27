// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
// eslint-disable-next-line import/no-import-module-exports
import type { NavigateFunction, To, NavigateOptions } from 'react-router-dom';

const ReactRouterDom = jest.requireActual('react-router-dom');

const useNavigate = (): NavigateFunction => {
  try {
    return ReactRouterDom.useNavigate();
  } catch {
    return (_to: To | number, _options?: NavigateOptions) => {};
  }
};

module.exports = { ...ReactRouterDom, useNavigate };
