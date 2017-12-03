// Copyright 2017 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

// @flow

import GraphQLBookshelf from 'graphql-bookshelfjs';
import Q from 'src/graphql/Q';
import CardType from 'src/graphql/CardType';
import bookshelf from 'src/models/bookshelf';

export default new Q.ObjectType({
  name: 'User',
  description: 'A user',
  fields: () => ({
    id: { type: new Q.NonNull(Q.ID) },
    email: { type: Q.String },
    provider_id: { type: Q.String },
    image_url: { type: Q.String },
    user_name: { type: Q.String },
    last_seen: { type: Q.String },
    cards: {
      type: new Q.NonNull(new Q.List(new Q.NonNull(CardType))),
      resolve: GraphQLBookshelf.resolverFactory(bookshelf.model('User')),
    },
    card: {
      type: CardType,
      args: {
        permalink: { type: new Q.NonNull(Q.String) },
      },
      resolve: GraphQLBookshelf.resolverFactory(bookshelf.model('Card')),
    },
  }),
});
