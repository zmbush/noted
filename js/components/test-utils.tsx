// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import { render } from '@testing-library/react';

import * as React from 'react';
import { MemoryRouter } from 'react-router-dom';

const AllTheProviders = ({ children }: { children: any }) => (
  <MemoryRouter>{children}</MemoryRouter>
);
const customRender = (
  ui: Parameters<typeof render>[0],
  options?: Omit<Parameters<typeof render>[1], 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
