// Copyright 2017 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

// @flow

import { makeRouteConfig, Route, createRender, RedirectException } from 'found';
import BrowserProtocol from 'farce/lib/BrowserProtocol';
import createFarceRouter from 'found/lib/createFarceRouter';

import * as React from 'react';
import { Resolver } from 'found-relay';
import Environment from 'relay-runtime';
import { graphql } from 'react-relay';

import CardList from 'ui/components/CardList';
import App from 'ui/components/App';
import ErrorView from 'ui/components/ErrorView';

export default (environment: typeof Environment) => {
  const resolver = new Resolver(environment);

  const routes = (
    <Route path="/">
      <Route
        Component={App}
        query={graphql`query routes_App_Query { me { ...App_me } }`}
      >
        <Route
          Component={CardList}
          query={graphql`query routes_CardList_Query { me { ...CardList_me } }`}
        />
        <Route
          path="/error/:errorType"
          Component={ErrorView}
        />
      </Route>
    </Route>
  );

  const Router = createFarceRouter({
    historyProtocol: new BrowserProtocol(),
    resolver,
    routeConfig: makeRouteConfig(routes),

    render: createRender({
      renderError({ error }: { error: { status: number } }) {
        if (window.error) {
          throw new RedirectException('/error/server');
        }
        throw new RedirectException(`/error/${error.status}`);
      },
    }),
  });

  const RouterWrapper = (props: {}) => <Router resolver={resolver} {...props} />;
  return RouterWrapper;
};

