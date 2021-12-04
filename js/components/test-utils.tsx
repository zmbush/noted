// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import { render } from '@testing-library/react';
import { createMemoryHistory } from 'history';

import * as React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import { createStore, store as defaultStore } from 'data/store';

type ComponentToRender = Parameters<typeof render>[0];
type Config = {
  route?: string;
  store?: typeof defaultStore;
  history?: ReturnType<typeof createMemoryHistory>;
} & Omit<Parameters<typeof render>[1], 'wrapper'>;
const customRender = (
  ui: ComponentToRender,
  { route = '/', store = createStore(), ...renderOptions }: Config = {},
) => {
  const Wrapper = ({ children }: any) => (
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
    </Provider>
  );

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    store,
  };
};

export * from '@testing-library/react';
export { customRender as render };
