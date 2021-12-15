// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import { render, act } from '@testing-library/react';
import { createMemoryHistory } from 'history';

import * as React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';

import { ThemeProvider } from '@mui/material';

import { lightTheme } from 'app/theme';

import { createStore, store as defaultStore } from 'features/redux/store';

type ComponentToRender = Parameters<typeof render>[0];
type Config = {
  route?: string;
  store?: typeof defaultStore;
  history?: ReturnType<typeof createMemoryHistory>;
} & Omit<Parameters<typeof render>[1], 'wrapper'>;
const customRender = (
  ui: ComponentToRender,
  {
    route = '/',
    history = createMemoryHistory({ initialEntries: [route] }),
    store = createStore(),
    ...renderOptions
  }: Config = {},
) => {
  const Wrapper = ({ children }: any) => {
    const [state, setState] = React.useState({
      action: history.action,
      location: history.location,
    });

    React.useLayoutEffect(() => history.listen(setState), [history]);

    return (
      <ThemeProvider theme={lightTheme}>
        <Provider store={store}>
          <Router location={state.location} navigationType={state.action} navigator={history}>
            {children}
          </Router>
        </Provider>
      </ThemeProvider>
    );
  };

  const historyActions = {
    replace(path: string, state?: any) {
      act(() => history.replace(path, state));
    },

    push(path: string, state?: any) {
      act(() => history.push(path, state));
    },

    go(delta: number) {
      act(() => history.go(delta));
    },

    forward() {
      act(() => history.forward());
    },

    back() {
      act(() => history.back());
    },

    get location() {
      return history.location;
    },
  };

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    store,
    location: history.location,
    history: historyActions,
  };
};

export * from '@testing-library/react';
export { render as originalRender } from '@testing-library/react';
export { customRender as render };
