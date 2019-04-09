// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

import * as ReactDOM from 'react-dom';
import * as React from 'react';

import axios from 'axios';
import reducers from 'data/reducers';
import { notesFetchStart, logIn, fetchData } from 'data/actions';

import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';

import App from 'components/App';

const store = createStore(reducers);

(async () => {
  store.dispatch(logIn((await axios.get('/api/get_user')).data));
  fetchData(store.dispatch);
})();

ReactDOM.render(
  <Router>
    <Provider store={store}>
      <App />
    </Provider>
  </Router>,
  document.getElementById('root')
);
