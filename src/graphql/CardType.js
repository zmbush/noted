// @flow

import GraphQLBookshelf from 'graphql-bookshelfjs';
import Q from '~/src/graphql/Q';
import UserType from '~/src/graphql/UserType';
import bookshelf from '~/src/models/bookshelf';

export default new Q.ObjectType({
  name: 'Card',
  description: 'A card for a user',
  fields: () => ({
    id: { type: new Q.NonNull(Q.ID) },
    user: {
      type: UserType,
      resolve: GraphQLBookshelf.resolverFactory(bookshelf.model('Card')),
    },
    permalink: { type: Q.String },
    title: { type: Q.String },
    contents: { type: Q.String },
    created_at: { type: Q.String },
    updated_at: { type: Q.String },
  }),
});
