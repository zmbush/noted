import GraphQLBookshelf from 'graphql-bookshelfjs';

import Q from '~/src/graphql/Q';
import UserType from '~/src/graphql/UserType';
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
      changeUsername: {
        type: UserType,
        args: {
          name: { type: Q.String },
        },
        resolve(source, { name }, request) {
          if (request.authentication) {
            return request.authentication.set('user_name', name).save().then(m => m.attributes);
          }
          return null;
        },
      },
    },
  }),
});
