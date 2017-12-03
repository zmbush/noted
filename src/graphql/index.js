// Copyright 2017 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

// @flow

import graphqlHTTP from 'express-graphql';
import GraphQLBookshelf from 'graphql-bookshelfjs';

import type { $Request } from 'express';

import schema from 'src/graphql/schema';

const developmentOnly = process.env.NODE_ENV !== 'production';

export default graphqlHTTP((request: $Request) => {
  let rootValue = null;
  if (request.authenticated && request.authentication) {
    rootValue = request.authentication;
  }

  return {
    schema,
    rootValue,
    graphiql: developmentOnly,
    pretty: developmentOnly,
    context: {
      request,
      loaders: GraphQLBookshelf.getLoaders(),
    },
  };
});
