// @flow

import GraphQLBookshelf from 'graphql-bookshelfjs';

import Q from '~/src/graphql/Q';
import UserType from '~/src/graphql/UserType';
import CardType from '~/src/graphql/CardType';
import User from '~/src/models/User';

export default new Q.Schema({
  query: new Q.ObjectType({
    name: 'Query',
    fields: {
      me: {
        type: UserType,
        resolve: GraphQLBookshelf.resolverFactory(User),
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
          return user.related('cards').create({
            title,
            contents,
            permalink: title.toLowerCase().split(' ').join('-'),
          }).then(c => c.attributes);
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
        resolve(user, { name }, request) {
          if (user) {
            return user.set('user_name', name).save().then(m => m.attributes);
          }
          return null;
        },
      },
    },
  }),
});
