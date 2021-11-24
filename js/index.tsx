// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
import axios from 'axios';
import 'core-js/stable';
import { createStore } from 'redux';
import 'regenerator-runtime/runtime';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';

import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';

import App from 'components/App';
import { logIn, fetchData } from 'data/actions';
import reducers from 'data/reducers';

if (process.env.NODE_ENV !== 'production') {
  import('map.prototype.tojson');
}

const w = window as any;
const store = createStore(
  reducers,
  // eslint-disable-next-line no-underscore-dangle
  w.__REDUX_DEVTOOLS_EXTENSION__ && w.__REDUX_DEVTOOLS_EXTENSION__(),
);

(async () => {
  store.dispatch(logIn((await axios.get('/api/get_user')).data));
  fetchData(store.dispatch);
})();

const theme = createMuiTheme();

const ThemedApp = () => (
  <ThemeProvider theme={theme}>
    <App />
  </ThemeProvider>
);

ReactDOM.render(
  <Router>
    <Provider store={store}>
      <ThemedApp />
    </Provider>
  </Router>,
  document.getElementById('root'),
);
