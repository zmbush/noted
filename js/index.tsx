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
import { notesFetchStart, notesFetched } from 'data/actions';

import { createStore } from 'redux';
import { Provider } from 'react-redux';

import App from 'components/App';

const store = createStore(reducers);

(async () => {
  store.dispatch(notesFetchStart());
  store.dispatch(notesFetched((await axios.get('/api/notes')).data));
})();

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
