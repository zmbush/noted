// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import * as React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';

import { StyledEngineProvider, ThemeProvider, useMediaQuery } from '@mui/material';

import { store } from 'features/redux/store';
import { getCurrentUser } from 'features/user/api';

import App from './App';
import { darkTheme, lightTheme } from './theme';

(async () => {
  await store.dispatch(getCurrentUser());
})();

const Init = () => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  return (
    <Router>
      <Provider store={store}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={prefersDarkMode ? darkTheme : lightTheme}>
            <App />
          </ThemeProvider>
        </StyledEngineProvider>
      </Provider>
    </Router>
  );
};

export default Init;
