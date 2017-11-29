// @flow

import { makeRouteConfig, Route, createInitialFarceRouter, createRender } from 'found';
import BrowserProtocol from 'farce/lib/BrowserProtocol';
import createFarceRouter from 'found/lib/createFarceRouter';

import React from 'react';
import ReactDOM from 'react-dom';
import { Resolver } from 'found-relay';
import Environment from 'relay-runtime';
import { graphql } from 'react-relay';

import Cards from '~/ui/components/Cards';
import App from '~/ui/components/App';

export default (environment: typeof Environment) => {
  const resolver = new Resolver(environment);

  const Router = createFarceRouter({
    historyProtocol: new BrowserProtocol(),
    resolver,
    routeConfig: makeRouteConfig(
      <Route path='/'>
        <Route
          Component={App}
          query={graphql`
            query routes_App_Query {
              me {
                ...App_me
              }
            }
          `}
        >
          <Route
            Component={Cards}
            query={graphql`
              query routes_Cards_Query {
                me {
                  ...Cards_me
                }
              }
            `}
          />
        </Route>
      </Route>
    ),

    render: createRender({}),
  });

  const RouterWrapper = (props: {}) => <Router resolver={resolver} {...props} />;
  return RouterWrapper;
};

