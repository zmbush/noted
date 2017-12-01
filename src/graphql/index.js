// @flow

import graphqlHTTP from 'express-graphql';
import GraphQLBookshelf from 'graphql-bookshelfjs';

import { type AuthenticatedRequest } from 'src/auth';

import schema from 'src/graphql/schema';

const dev = process.env.NODE_ENV !== 'production';

export default graphqlHTTP((request: AuthenticatedRequest) => ({
  schema,
  rootValue: request.authenticated ? request.authentication : null,
  graphiql: dev,
  pretty: dev,
  context: {
    request,
    loaders: GraphQLBookshelf.getLoaders(),
  },
}));
