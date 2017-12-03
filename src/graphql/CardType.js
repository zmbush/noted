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
import UserType from 'src/graphql/UserType';
import bookshelf from 'src/models/bookshelf';

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
