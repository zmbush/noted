// @flow

import { Environment, Network, RecordSource, Store } from 'relay-runtime';
import ReactDOM from 'react-dom';
import React from 'react';
import routes from 'ui/routes';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

const fetchQuery = (operation, variables = {}) => (
  fetch('/graphql', {
    credentials: 'same-origin',
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      query: operation.text, // GraphQL text from input
      variables,
    }),
  }).then(response => response.json())
);

const source = new RecordSource();
const store = new Store(source);
const network = Network.create(fetchQuery);
const environment = new Environment({
  network,
  store,
});

const root = document.getElementById('root');

if (root) {
  const Router = routes(environment);
  ReactDOM.render(
    <MuiThemeProvider>
      <Router />
    </MuiThemeProvider>,
    root,
  );
}
