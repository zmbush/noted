// @flow

import graphqlHTTP from 'express-graphql';
import GraphQLBookshelf from 'graphql-bookshelfjs';

import schema from '~/src/graphql/schema';

const dev = process.env.NODE_ENV !== 'production';

export default graphqlHTTP(request => ({
  schema,
  rootValue: request.authentication,
  graphiql: dev,
  pretty: dev,
  context: {
    request,
    loaders: GraphQLBookshelf.getLoaders(),
  },
}));
