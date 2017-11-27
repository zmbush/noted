// @flow

import { QueryRenderer, graphql } from 'react-relay';
import { Environment, Network, RecordSource, Store } from 'relay-runtime';
import ReactDOM from 'react-dom';
import React from 'react';

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
  ReactDOM.render(
    <QueryRenderer
      environment={environment}
      query={graphql`query entryQuery { me { id user_name } }`}
      render={({ error, props }) => {
        if (error) {
          return <div>{error.message}</div>;
        } else if (props) {
          return <div>{props.me.user_name}: {props.me.id}</div>;
        }
        return <div>LOading...</div>;
      }}
    />,
    root,
  );
} else {
  throw new Error('no root element');
}
