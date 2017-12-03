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
import CardType from 'src/graphql/CardType';
import User from 'src/models/User';

export default new Q.Schema({
  query: new Q.ObjectType({
    name: 'Query',
    fields: {
      me: {
        type: UserType,
        resolve(user, ...rest) {
          if (!user) {
            return null;
          }
          return GraphQLBookshelf.resolverFactory(User)(user, ...rest);
        },
      },
    },
  }),

  mutation: new Q.ObjectType({
    name: 'Mutation',
    fields: {
      createCard: {
        type: CardType,
        args: {
          title: { type: new Q.NonNull(Q.String) },
          contents: { type: new Q.NonNull(Q.String) },
        },
        resolve(user, { title, contents }) {
          if (!user) {
            return null;
          }
          return user.related('cards').create({
            title,
            contents,
            permalink: title.toLowerCase().split(' ').join('-'),
          }).then(GraphQLBookshelf.exposeAttributes);
        },
      },
      modifyCard: {
        type: CardType,
        args: {
          title: { type: Q.String },
          contents: { type: Q.String },
        },
      },
      changeUsername: {
        type: UserType,
        args: {
          name: { type: Q.String },
        },
        resolve(user, { name }) {
          if (user) {
            return user.set('user_name', name).save().then(m => m.attributes);
          }
          return null;
        },
      },
    },
  }),
});
